// main orchestrator traffic controller of hole Aisystem

// Import logger for tracing workflow execution
import logger from "../lib/logger/logger.js";

// Import LangGraph workflow runner
import { appWorkflow } from "../langgraph/workflow.js";

// Import Firebase Admin for database writes
import admin from "../config/firebase.config.js";

// Import initial state type
import { createInitialState } from "../langgraph/state.js";

// Import Firebase service and Merge Agent
import { getConversationState, saveConversationState } from "../services/conversation.service.js";
import { mergeIntentAgent } from "../agents/clarification/mergeAgent.js";
import { followUpAgent } from "../agents/followUpAgent/followUpAgent.js";

// This is the main orchestrator function
export const runOrchestrator = async (userInput: string, conversationId = "default_session") => {

    try {
        // 1. Log incoming request
        logger.info(" Orchestrator started", { userInput, conversationId });

        // 2. State Initialization / Fetch from Firestore
        const previousState = await getConversationState(conversationId);
        let currentState;

        if (previousState && previousState.pendingClarification) {
            //  RESUME LOGIC: We have a pending question waiting for an answer!
            logger.info(" Resuming workflow: Merging clarification", { userInput });

            // Call dedicated Merge Agent instead of direct LLM call
            const mergedIntent = await mergeIntentAgent(
                previousState.previousIntent,
                previousState.missingFields,
                userInput
            );

            // Reconstruct state to resume workflow
            currentState = {
                ...previousState,
                input: userInput,
                intent: mergedIntent, // Fully merged intent!
                mergedIntent: mergedIntent,
                pendingClarification: false, // Clarification resolved
                missingFields: [],
                clarificationQuestion: null,
                logs: [...(previousState.logs || []), { step: "Orchestrator", message: "Clarification resumed & intent merged successfully" }]
            };
        } else {
            //  NEW REQUEST LOGIC
            currentState = createInitialState(userInput);
            currentState.conversationId = conversationId;
        }

        // 3. Run LangGraph workflow
        const resultState = await appWorkflow.invoke(currentState);

        // 4. Save new state back to Firestore
        await saveConversationState(conversationId, resultState);

        // 5. Did the workflow PAUSE because it still needs clarification?
        if (resultState.pendingClarification) {
            logger.info("⏸ Workflow paused: Clarification requested", { question: resultState.clarificationQuestion });
            return {
                success: true,
                status: "clarification_needed",
                message: resultState.clarificationQuestion,
                missingFields: resultState.missingFields,
                trace: resultState.logs || []
            };
        }

        // 5.5. Execute Side Effects (Database Writes)
        // Only write to DB if the workflow reached the action agent and produced a booking payload
        if (resultState.booking && resultState.booking.booking) {
            const db = admin.firestore();
            const bookingData = resultState.booking.booking;

            // ---------------------------------------------------------
            // 1. Slot Matching (Critical Step)
            // ---------------------------------------------------------
            const slotId = bookingData.slotId;
            if (!slotId) {
                logger.error(" Scheduling error: No slotId provided by Action Agent. Cannot reserve slot blindly.", { providerId: bookingData.providerId });
                return {
                    success: false,
                    status: "scheduling_failed",
                    message: "Internal error: No specific time slot was resolved.",
                    trace: resultState.logs || []
                };
            }

            const slotRef = db.collection("providerSchedules").doc(bookingData.providerId).collection("slots").doc(slotId);

            try {
                const bookingRef = db.collection("bookings").doc();
                const notifRef = db.collection("notifications").doc();

                // Run atomic transaction to prevent double-booking
                await db.runTransaction(async (t) => {
                    const slotDocSnap = await t.get(slotRef);

                    if (!slotDocSnap.exists || slotDocSnap.data()?.status !== "available") {
                        throw new Error("SLOT_UNAVAILABLE");
                    }

                    // -> Create Booking (Firestore)
                    t.set(bookingRef, {
                        bookingId: bookingRef.id,
                        conversationId: conversationId,
                        providerId: bookingData.providerId,
                        serviceType: bookingData.serviceType,
                        location: bookingData.location,
                        scheduledTime: bookingData.scheduledTime,
                        slotId: slotId,
                        status: bookingData.status || "confirmed",
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                    // -> Reserve Slot (update provider schedule)
                    t.update(slotRef, {
                        status: "booked",
                        isAvailable: false,
                        bookingId: bookingRef.id
                    });

                    // -> Trigger Notification (FCM push + Firestore log)
                    t.set(notifRef, {
                        id: notifRef.id,
                        userId: "user_mock_123", // Using mock user ID as auth is not fully hooked up
                        bookingId: bookingRef.id,
                        type: "booking_confirmed",
                        message: resultState.booking.confirmation?.message || "Your booking is confirmed.",
                        isRead: false,
                        scheduledFor: admin.firestore.FieldValue.serverTimestamp(),
                        sentAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                });

                logger.info(" Booking saved to Firestore successfully", { bookingId: bookingRef.id });
                logger.info(" Schedule slot reserved successfully", {
                    providerId: bookingData.providerId,
                    slotId: slotId
                });
                logger.info(" Notification triggered successfully");

                // Attach the new DB ID to the state for the final response
                resultState.booking.bookingId = bookingRef.id;

                // ---------------------------------------------------------
                // 2. Follow-Up Automation (Run after confirmed booking)
                // ---------------------------------------------------------
                try {
                    logger.info(" Generating Follow-Up lifecycle plan...");
                    const followUpPlan = await followUpAgent(resultState.booking.booking, resultState.selectedProvider);

                    // Save to state for frontend
                    resultState.followUp = followUpPlan;

                    // Queue the simulated future notifications in Firestore
                    // batch measn k ek sath buht db writes 
                    const batch = db.batch();
                    for (const plan of followUpPlan) {
                        const planRef = db.collection("notifications").doc();
                        batch.set(planRef, {
                            id: planRef.id,
                            userId: "user_mock_123",
                            bookingId: bookingRef.id,
                            type: plan.type,
                            triggerTime: plan.triggerTime,
                            message: plan.message,
                            isRead: false,
                            status: "queued", // Indicates it's scheduled for the future
                            createdAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                    }
                    await batch.commit();
                    logger.info(" Follow-Up lifecycle plan queued successfully");

                } catch (followUpErr: any) {
                    logger.error(" Failed to generate follow-up plan", { error: followUpErr.message });
                    // We don't fail the whole booking just because follow-up simulation failed
                }

            } catch (error: any) {
                if (error.message === "SLOT_UNAVAILABLE") {
                    // ELSE: Suggest alternative slots/providers
                    logger.warn(" Slot is no longer available or does not exist", {
                        providerId: bookingData.providerId,
                        slotId: slotId
                    });

                    // Abort booking and return alternatives
                    return {
                        success: false,
                        status: "slot_unavailable",
                        message: "The requested time slot is no longer available. Please select an alternative time or provider.",
                        alternatives: resultState.recommendation?.alternatives || [],
                        trace: resultState.logs || []
                    };
                }

                // If it's a different error, log and throw to be caught by the outer catch block
                logger.error(" Transaction failed", { error: error.message });
                throw error;
            }
        }

        // 6. Log successful completion
        logger.info(" Orchestrator completed successfully", {
            bookingId: resultState.booking?.bookingId || null
        });

        // 7. Return final structured response
        return {
            success: true,
            status: "completed",
            serviceType: resultState.intent?.service || null,
            location: resultState.intent?.location || null,
            time: resultState.intent?.time || null,
            selectedProvider: resultState.selectedProvider || null,
            pricing: resultState.pricing || null,
            booking: resultState.booking || null,
            followUp: resultState.followUp || [],
            trace: resultState.logs || []
        };

    } catch (error: any) {
        // 8. Error handling
        logger.error(" Orchestrator failed", {
            error: error.message
        });

        return {
            success: false,
            message: "Workflow execution failed"
        };
    }
};
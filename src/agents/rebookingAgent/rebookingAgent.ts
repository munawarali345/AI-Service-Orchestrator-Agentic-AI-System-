import client from "../../lib/groqClient.js";
import admin from "../../config/firebase.config.js";
import logger from "../../lib/logger/logger.js";
import { getConversationState } from "../../services/conversation.service.js";

/**
 * The Rebooking Agent handles asynchronous provider cancellations.
 * It auto-assigns an alternative provider and sends an apology/update.
 */
export const runRebookingAgent = async (bookingId: string, cancelReason: string) => {
    try {
        const db = admin.firestore();

        // 1. Fetch original booking
        const bookingRef = db.collection("bookings").doc(bookingId);
        const bookingSnap = await bookingRef.get();
        if (!bookingSnap.exists) {
            throw new Error(`Booking ${bookingId} not found`);
        }
        const booking = bookingSnap.data() as any;

        // 2. We need to find an alternative provider. 
        // We will intelligently use the "alternativeSlots" already saved in the LangGraph state!
        let newProvider: any = null;
        let newSlotId: string | null = null;

        if (booking.conversationId) {
            const previousState = await getConversationState(booking.conversationId);
            if (previousState?.recommendation?.alternatives?.length > 0) {
                // Grab the first highly-ranked backup from our state memory!
                newProvider = previousState.recommendation.alternatives[0];
                newSlotId = newProvider.matchedSlot?.slotId || null;
                logger.info(`♻️ Found backup provider ${newProvider.name} from LangGraph state memory!`);
            }
        }

        // 3. Fallback: If no alternatives in state, query Firestore
        if (!newProvider) {
            logger.info(`🔍 No backups in state, querying Firestore for alternatives...`);
            const providersSnap = await db.collection("providers")
                .where("serviceCategories", "array-contains", booking.serviceType)
                .limit(2)
                .get();

            providersSnap.forEach(doc => {
                if (doc.id !== booking.providerId && !newProvider) {
                    newProvider = { id: doc.id, ...doc.data() };
                }
            });
        }

        if (!newProvider) {
            // No alternatives found
            return {
                success: false,
                message: "We're sorry, your provider cancelled and no alternatives are available right now. We will refund you."
            };
        }

        // 4. Use LLM to generate a personalized apology and rebooking notification
        const systemPrompt = `
You are the Rebooking & Rescue Agent for Haazir.
A provider just cancelled an existing booking, but you have found an alternative provider!
Generate a short, polite, empathetic WhatsApp-style message informing the user about the switch.

OUTPUT FORMAT (Strict JSON):
{
    "rebookingMessage": "..."
}
`;
        const userPrompt = `
Original Service: ${booking.serviceType}
Cancel Reason from original provider: "${cancelReason}"
New Provider Assigned: ${newProvider.name} (Rating: ${newProvider.rating})
`;

        const completion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

        // 5. Run Database Transaction (Free old slot, book new provider)
        await db.runTransaction(async (t) => {
            // Free the old slot
            if (booking.slotId) {
                const oldSlotRef = db.collection("providerSchedules").doc(booking.providerId).collection("slots").doc(booking.slotId);
                t.update(oldSlotRef, { status: "available", isAvailable: true, bookingId: null });
            }

            // Update booking doc to point to new provider
            t.update(bookingRef, {
                providerId: newProvider.id,
                slotId: newSlotId || booking.slotId, // Update slot if we have a backup slot
                status: "rebooked",
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // If we have a backup slot, lock it
            if (newSlotId) {
                const newSlotRef = db.collection("providerSchedules").doc(newProvider.id).collection("slots").doc(newSlotId);
                t.update(newSlotRef, { status: "booked", isAvailable: false, bookingId: bookingId });
            }

            // Log notification
            const notifRef = db.collection("notifications").doc();
            t.set(notifRef, {
                id: notifRef.id,
                userId: "user_mock_123",
                bookingId: bookingId,
                type: "provider_rebooked",
                message: result.rebookingMessage,
                isRead: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        logger.info(`✅ Rebooking complete for ${bookingId}. Switched to ${newProvider.id}`);

        return {
            success: true,
            status: "rebooked",
            newProvider: newProvider,
            message: result.rebookingMessage
        };

    } catch (error: any) {
        logger.error(" Rebooking Agent Error:", error.message);
        throw error;
    }
};

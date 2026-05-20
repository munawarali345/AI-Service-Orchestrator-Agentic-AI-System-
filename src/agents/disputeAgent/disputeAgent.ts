import client from "../../lib/groqClient.js";
import admin from "../../config/firebase.config.js";
import logger from "../../lib/logger/logger.js";
import { getPricingConfig } from "../../tools/pricingTool.js";

/**
 * The Dispute Agent analyzes post-service customer complaints,
 * specifically comparing charged amounts against the platform's pricing configs.
 */
export const runDisputeAgent = async (bookingId: string, userComplaint: string) => {
    try {
        const db = admin.firestore();
        
        // 1. Fetch original booking details
        const bookingSnap = await db.collection("bookings").doc(bookingId).get();
        if (!bookingSnap.exists) {
            throw new Error(`Booking ${bookingId} not found`);
        }
        const booking = bookingSnap.data() as any;

        // 2. Fetch platform pricing config for this service
        const pricingConfig = await getPricingConfig(booking.serviceType);

        // 3. System Prompt for Dispute Resolution
        const systemPrompt = `
You are a highly intelligent Customer Dispute Agent for the Haazir platform.
Your job is to read a customer's complaint regarding overcharging, compare it against the official platform base pricing, and decide if it's a valid dispute.

OUTPUT FORMAT (Strict JSON):
{
    "isValidDispute": boolean, // True if the provider clearly overcharged beyond the base/market rate
    "resolution": "refund_difference" | "escalate_to_human" | "dismiss_complaint",
    "responseMessage": "A professional, empathetic WhatsApp-style response to the user explaining the outcome."
}

RULES:
- If the charged amount is drastically higher than the base pricing, mark isValidDispute: true and resolution: "refund_difference" or "escalate_to_human".
- Keep the responseMessage polite, concise, and reassuring. Do not use markdown.
`;

        const userPrompt = `
Booking Details:
- Service: ${booking.serviceType}
- Location: ${booking.location}

Platform Base Pricing:
${JSON.stringify(pricingConfig, null, 2)}

Customer Complaint:
"${userComplaint}"
`;

        logger.info(" Analyzing dispute with LLM...");
        
        // 4. Run LLM Analysis
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

        // 5. Optionally log the dispute to Firestore
        await db.collection("disputes").add({
            bookingId,
            userComplaint,
            analysis: result,
            status: result.resolution === "escalate_to_human" ? "pending_review" : "resolved_auto",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        logger.info(" Dispute analysis complete", { resolution: result.resolution });

        return result;

    } catch (error: any) {
        logger.error(" Dispute Agent Error:", error.message);
        throw error;
    }
};

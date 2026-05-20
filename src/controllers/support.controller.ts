import { Request, Response } from "express";
import { runRebookingAgent } from "../agents/rebookingAgent/rebookingAgent.js";
import { runDisputeAgent } from "../agents/disputeAgent/disputeAgent.js";

/**
 * Handle async provider cancellations (Day 2 event)
 */
export const handleProviderCancellation = async (req: Request, res: Response) => {
    try {
        const { bookingId, cancelReason } = req.body;
        
        if (!bookingId || !cancelReason) {
            return res.status(400).json({ success: false, message: "bookingId and cancelReason required" });
        }

        const result = await runRebookingAgent(bookingId, cancelReason);

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("❌ Controller Error (Rebooking):", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Handle post-service customer disputes (Day 3 event)
 */
export const handleCustomerDispute = async (req: Request, res: Response) => {
    try {
        const { bookingId, userComplaint } = req.body;
        
        if (!bookingId || !userComplaint) {
            return res.status(400).json({ success: false, message: "bookingId and userComplaint required" });
        }

        const result = await runDisputeAgent(bookingId, userComplaint);

        return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        console.error("❌ Controller Error (Dispute):", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

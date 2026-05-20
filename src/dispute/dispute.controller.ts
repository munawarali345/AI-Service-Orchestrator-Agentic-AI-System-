import { Request, Response } from "express";
import { executeProviderCancellationService, executeCustomerDisputeService, getDisputeHistoryService } from "./dispute.service.js";

export const handleProviderCancellation = async (req: Request, res: Response) => {
    try {
        const { bookingId, cancelReason } = req.body;
        
        if (!bookingId || !cancelReason) {
            return res.status(400).json({ success: false, message: "bookingId and cancelReason are required" });
        }

        const result = await executeProviderCancellationService(bookingId, cancelReason);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const handleCustomerDispute = async (req: Request, res: Response) => {
    try {
        const { bookingId, userComplaint } = req.body;
        
        if (!bookingId || !userComplaint) {
            return res.status(400).json({ success: false, message: "bookingId and userComplaint are required" });
        }

        const result = await executeCustomerDisputeService(bookingId, userComplaint);
        return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getDisputeHistory = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const logs = await getDisputeHistoryService(bookingId as string);
        return res.status(200).json({ success: true, data: logs });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

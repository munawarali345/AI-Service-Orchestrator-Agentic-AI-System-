import { Request, Response } from "express";
import { getFollowUpTimelineService } from "./followup.service.js";

export const getFollowUpTimeline = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "bookingId is required"
            });
        }

        const timeline = await getFollowUpTimelineService(bookingId as string);

        return res.status(200).json({
            success: true,
            data: timeline
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

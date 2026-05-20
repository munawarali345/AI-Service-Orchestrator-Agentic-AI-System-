import { Request, Response } from "express";
import { getBookingDetailsByIdService } from "./booking.service.js";

export const getBookingDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "bookingId parameter is required"
            });
        }

        const details = await getBookingDetailsByIdService(id as string);

        return res.status(200).json({
            success: true,
            data: details
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

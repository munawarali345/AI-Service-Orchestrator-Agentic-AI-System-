import { Request, Response } from "express";
import { getRankedProvidersService } from "./provider.service.js";

export const getRankedProviders = async (req: Request, res: Response) => {
    try {
        const { serviceCategory, location } = req.body;

        if (!serviceCategory || !location) {
            return res.status(400).json({
                success: false,
                message: "serviceCategory and location are required"
            });
        }

        const providers = await getRankedProvidersService(serviceCategory, location);

        return res.status(200).json({
            success: true,
            data: providers
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

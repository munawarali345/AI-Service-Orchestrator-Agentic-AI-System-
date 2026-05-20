import { Request, Response } from "express";
import { getBaselineComparisonService } from "./comparison.service.js";

export const getBaselineComparison = async (req: Request, res: Response) => {
    try {
        const { serviceCategory, location, grandTotal } = req.body;

        const comparison = await getBaselineComparisonService(
            serviceCategory || "cleaning",
            location || "Scheme 33",
            grandTotal || 2800
        );

        return res.status(200).json({
            success: true,
            data: comparison
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

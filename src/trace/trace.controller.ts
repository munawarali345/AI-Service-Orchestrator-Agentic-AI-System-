import { Request, Response } from "express";
import { getAgentTraceLogsService } from "./trace.service.js";

export const getAgentTraceLogs = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;

        const trace = await getAgentTraceLogsService((conversationId as string) || "default_session");

        return res.status(200).json({
            success: true,
            data: trace
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

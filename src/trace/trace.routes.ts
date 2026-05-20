import { Router } from "express";
import { getAgentTraceLogs } from "./trace.controller.js";

const router = Router();

router.get("/:conversationId", getAgentTraceLogs);

export default router;

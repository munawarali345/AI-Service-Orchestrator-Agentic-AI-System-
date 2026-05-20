import { Router } from "express";
import { getFollowUpTimeline } from "./followup.controller.js";

const router = Router();

router.get("/:bookingId", getFollowUpTimeline);

export default router;

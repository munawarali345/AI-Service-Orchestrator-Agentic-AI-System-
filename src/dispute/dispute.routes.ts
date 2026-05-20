import { Router } from "express";
import { handleProviderCancellation, handleCustomerDispute, getDisputeHistory } from "./dispute.controller.js";

const router = Router();

router.post("/provider-cancel", handleProviderCancellation);
router.post("/submit", handleCustomerDispute);
router.get("/history/:bookingId", getDisputeHistory);

export default router;

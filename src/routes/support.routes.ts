import { Router } from "express";
import { handleProviderCancellation, handleCustomerDispute } from "../controllers/support.controller.js";

const router = Router();

/**
 * POST /api/support/provider-cancel
 * Triggered when a provider cancels a confirmed booking.
 * Automatically finds a replacement provider and updates the user.
 */
router.post("/provider-cancel", handleProviderCancellation);

/**
 * POST /api/support/dispute
 * Triggered when a user complains about service or pricing after completion.
 */
router.post("/dispute", handleCustomerDispute);

export default router;

// Import Express Router
import { Router } from "express";

// Import controller
import { handleUserRequest } from "../controllers/orchestrator.controller.js";

// Create router instance
const router = Router();

/**
 * POST /api/orchestrator/request
 * This route receives user service requests
 * Example: "Mujhe kal AC technician chahiye"
 */
router.post("/request", handleUserRequest);

// Export router
export default router;
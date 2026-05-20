// Import the Express Router
import { Router } from "express";
// Import our user controller functions
import { getMeController, updateUserController } from "../controllers/user.controller.js";
// Import the Firebase auth middleware
import { verifyUser } from "../middlewares/auth/auth.middleware.js";

// Initialize the router
const router = Router();

// Route to retrieve the logged-in user's profile
// GET /user/me
// Protected by verifyUser middleware
router.get("/me", verifyUser, getMeController);

// Route to update the logged-in user's profile
// PUT /user/update
// Protected by verifyUser middleware
router.put("/update", verifyUser, updateUserController);

// Export the configured router
export default router;

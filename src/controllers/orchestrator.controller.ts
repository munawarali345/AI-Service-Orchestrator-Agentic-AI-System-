// Import Request and Response types from Express
// These help us type our API request and response objects
import { Request, Response } from "express";

// Import orchestrator (this is where LangGraph will be triggered later)
// Controller does NOT contain logic — it only forwards data
import { runOrchestrator } from "../orchestrator/orchestrator.js";

// Define the controller function for handling user service requests
export const handleUserRequest = async (req: Request, res: Response) => {

    try {

        // 1. Extract user input from request body
        // Example: "Mujhe kal AC technician chahiye G-13 mein"
        const { input, userId } = req.body;

        // 2. Basic validation (must have input)
        if (!input) {
            return res.status(400).json({
                success: false,
                message: "User input is required"
            });
        }

        // 3. Log incoming request (for debugging / tracing)
        console.log("📥 User Input Received:", input);

        // 4. Pass input to orchestrator
        // ORCHESTRATOR will handle LangGraph workflow
        const result = await runOrchestrator(input, userId || "default_session", userId || "user_mock_123");

        // 5. Return final structured response from orchestrator
        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error: any) {

        // 6. Error handling (controller-level only)
        console.error(" Controller Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
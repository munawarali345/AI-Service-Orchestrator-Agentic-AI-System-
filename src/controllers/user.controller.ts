// Import express Request and Response types
import { Request, Response } from "express";
// Import user service functions containing business logic
import * as userService from "../services/user.service.js";
// Import Zod validation schemas
import { updateUserSchema } from "../validations/user.validation.js";

// Controller for retrieving the current logged-in user's profile
export const getMeController = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract the decoded Firebase user
        const firebaseUser = req.user;
        
        // Ensure user is authenticated
        if (!firebaseUser) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // Call the service layer to fetch the user by UID
        const user = await userService.getUserById(firebaseUser.uid);
        
        // If the user profile isn't found in Firestore, return 404
        if (!user) {
            res.status(404).json({ error: "User profile not found" });
            return;
        }

        // Return the user profile
        res.status(200).json({ user });
    } catch (error) {
        // Log the error
        console.error("Error in getMeController:", error);
        // Return a generic 500 error
        res.status(500).json({ error: "Internal server error" });
    }
};

// Controller for updating the current user's profile
export const updateUserController = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract the decoded Firebase user
        const firebaseUser = req.user;
        
        // Ensure user is authenticated
        if (!firebaseUser) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // Validate the incoming request body for updates
        const validationResult = updateUserSchema.safeParse(req.body);
        
        // If validation fails, return 400 Bad Request
        if (!validationResult.success) {
            res.status(400).json({ 
                error: "Validation failed", 
                details: validationResult.error.format() 
            });
            return;
        }

        // Call the service layer to perform the update
        const updatedUser = await userService.updateUser(firebaseUser.uid, validationResult.data);
        
        // Return the updated user profile
        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error: any) {
        // Log the error
        console.error("Error in updateUserController:", error);
        
        // Handle specific "not found" error from service layer
        if (error.message === "User not found") {
            res.status(404).json({ error: error.message });
            return;
        }
        
        // Return a generic 500 error
        res.status(500).json({ error: "Internal server error" });
    }
};

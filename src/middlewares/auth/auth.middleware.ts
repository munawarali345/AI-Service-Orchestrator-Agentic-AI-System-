// Import express types to properly type the Request, Response, and NextFunction objects
import { Request, Response, NextFunction } from "express";
// Import our configured Firebase Admin instance from the config folder
import admin from "../../config/firebase.config.js";

// Extend the Express Request interface to include the user property
// This allows us to access req.user in our controllers with proper TypeScript support
declare global {
    namespace Express {
        interface Request {
            // We store the decoded token information on the request object
            user?: admin.auth.DecodedIdToken;
        }
    }
}

// Create and export the verifyUser middleware function
export const verifyUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Extract the Authorization header from the incoming request
        const authHeader = req.headers.authorization;

        // Check if the header exists and correctly starts with the "Bearer " scheme
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            // If the token is missing or malformed, return a 401 Unauthorized response
            res.status(401).json({ error: "Unauthorized: Missing or invalid token format" });
            return;
        }

        // Split the header by space and extract the actual token (the second part)
        const token = authHeader.split(" ")[1];

        // Use Firebase Admin SDK to verify the token's validity and decode its contents
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Attach the decoded user information to the request object for downstream use
        req.user = decodedToken;

        // Call next() to pass control to the next middleware or route handler
        next();
    } catch (error) {
        // Log the error for debugging purposes
        console.error("Authentication error:", error);
        
        // If token verification fails (e.g., expired or invalid token), return 401
        res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }
};

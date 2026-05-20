// Import Zod for schema validation
import { z } from "zod";

// Define the schema for updating a user
export const updateUserSchema = z.object({
    // Name is optional for updates, but if provided, must be at least 2 chars
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }).optional(),
    // Address is optional for updates
    address: z.string().optional(),
    // We intentionally omit email to prevent email changes here (usually handled via Firebase Auth directly)
    // We intentionally omit role to prevent privilege escalation via standard update endpoint
});

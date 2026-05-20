// Define the user role type for better type safety and future extensibility
export type UserRole = "user" | "admin";

// Define the main UserType interface that represents a user in our system
export interface UserType {
    // Firebase Auth UID, serves as the unique identifier
    uid: string;
    // The user's full name
    name: string;
    // The user's email address
    email: string;
    // The user's role, defaults to 'user'
    role: UserRole;
    // Optional address field
    address?: string;
    // Timestamp of when the user was created
    createdAt: Date;
    // Timestamp of the last update to the user profile
    updatedAt: Date;
    // Flag indicating if the user account is active
    isActive: boolean;
}

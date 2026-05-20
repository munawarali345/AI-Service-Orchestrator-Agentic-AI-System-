// Import the initialized Firebase Admin instance
import admin from "../config/firebase.config.js";
// Import the UserType interface
import { UserType } from "../types/user.types.js";

// Get a reference to the Firestore database
const db = admin.firestore();
// Define the collection name constant
const USERS_COLLECTION = "users";

// Function to retrieve a user profile by their UID
export const getUserById = async (uid: string): Promise<UserType | null> => {
    // Get a reference to the specific user document
    const userRef = db.collection(USERS_COLLECTION).doc(uid);
    // Fetch the document from Firestore
    const doc = await userRef.get();
    
    // If the document doesn't exist, return null
    if (!doc.exists) {
        return null;
    }
    
    // Extract the data from the document
    const data = doc.data();
    
    // Convert Firestore Timestamps back to JS Dates before returning
    return {
        ...data,
        createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt,
        updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : data?.updatedAt,
    } as UserType;
};

// Function to update an existing user profile
export const updateUser = async (uid: string, updateData: Partial<UserType>): Promise<UserType> => {
    // Get a reference to the specific user document
    const userRef = db.collection(USERS_COLLECTION).doc(uid);
    // Fetch the document to ensure the user exists
    const doc = await userRef.get();
    
    // Throw an error if the user is not found
    if (!doc.exists) {
        throw new Error("User not found");
    }
    
    // Prepare the data for update, appending the new updatedAt timestamp
    const dataToUpdate = {
        ...updateData,
        updatedAt: new Date(),
    };
    
    // Update the document in Firestore with the new data
    // We cast to any because Firestore handles Date objects natively
    await userRef.update(dataToUpdate as any);
    
    // Fetch and return the updated user document
    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data();
    
    // Convert Firestore Timestamps back to JS Dates
    return {
        ...updatedData,
        createdAt: updatedData?.createdAt?.toDate ? updatedData.createdAt.toDate() : updatedData?.createdAt,
        updatedAt: updatedData?.updatedAt?.toDate ? updatedData.updatedAt.toDate() : updatedData?.updatedAt,
    } as UserType;
};

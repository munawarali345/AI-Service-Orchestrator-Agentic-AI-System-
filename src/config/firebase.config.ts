// Import the core firebase-admin module to interact with Firebase services
import admin from "firebase-admin";

// Ensure environment variables are loaded
import "dotenv/config";

// Extract necessary environment variables for Firebase Admin SDK initialization
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

// Clean up the private key (remove quotes/commas from bad env copies) and replace escaped newlines
let cleanKey = process.env.FIREBASE_PRIVATE_KEY?.trim() || "";
if (cleanKey.startsWith('"')) cleanKey = cleanKey.slice(1);
if (cleanKey.endsWith(',')) cleanKey = cleanKey.slice(0, -1).trim();
if (cleanKey.endsWith('"')) cleanKey = cleanKey.slice(0, -1);
const privateKey = cleanKey.replace(/\\n/g, "\n");

// Check if Firebase admin is already initialized to avoid duplicate initialization errors
if (!admin.apps.length) {
    // Initialize the Firebase Admin SDK with the provided credentials
    admin.initializeApp({
        // Provide the credential object using our parsed environment variables
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

// Export the initialized admin instance so other parts of the app can use it
export default admin;

// Firebase Admin SDK import kar rahe hain
// Is se server-side Firestore access hota hai (read/write DB)
import admin from "../config/firebase.config.js";

// Firestore database instance create kar rahe hain
// Ye object hum DB operations (get/set) ke liye use karenge
const db = admin.firestore();

// Collection ka naam define kar rahe hain
// Saare conversation sessions is collection ke andar store honge
const CONVERSATIONS_COLLECTION = "conversations";


// =======================================================
// 1. GET CONVERSATION STATE
// =======================================================
// Purpose:
// Firestore se kisi specific conversationId ka saved state lana
// (i.e. previous user session / chat history / workflow state)

export const getConversationState = async (conversationId: string): Promise<any | null> => {

    // Firestore me specific document ka reference le rahe hain
    const docRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);

    // Document ko database se fetch kar rahe hain
    const doc = await docRef.get();

    // Agar document exist nahi karta (first time user)
    if (!doc.exists) {
        return null; // koi previous session nahi mila
    }

    // Agar document exist karta hai to uska data return karo
    return doc.data();
};


// =======================================================
// 2. SAVE CONVERSATION STATE
// =======================================================
// Purpose:
// User ka updated workflow state Firestore me save karna
// Har agent execution ke baad updated state yaha store hoti hai

export const saveConversationState = async (conversationId: string, state: any): Promise<void> => {

    // Firestore document ka reference le rahe hain
    const docRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);

    // State ko Firestore me save kar rahe hain
    await docRef.set(
        {
            // Spread operator: purana + naya state merge kar raha hai
            ...state,

            // Har update ke sath timestamp add ho raha hai
            // Is se pata chalega last update kab hua tha
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            // merge: true ka matlab:
            // existing document overwrite nahi hoga,
            // sirf updated fields update honge
            merge: true
        }
    );
};
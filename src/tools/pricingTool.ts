import admin from "../config/firebase.config.js";

const db = admin.firestore();

/**
 * Fetch pricing config for a specific service category to serve as price reference
 */
export const getPricingConfig = async (serviceCategory: string) => {
    if (!serviceCategory) return null;
    
    const doc = await db.collection("pricingConfigs").doc(serviceCategory).get();
    if (doc.exists) {
        return { id: doc.id, ...doc.data() };
    }
    
    return null;
};

//  providers too yaha hum firestore se providers leke anege 

// imports
import admin from "../config/firebase.config.js";

const db = admin.firestore();

const PROVIDERS_COLLECTION = "providers";

/**
 * Fetch providers from Firestore, optionally filtered by service category
 */
export const getProviders = async (category?: string) => {
    let query: admin.firestore.Query = db.collection("providers");

    if (category) {
        query = query.where("serviceCategories", "array-contains", category);
    }

    const snapshot = await query.get();

    const providers: any[] = [];
    snapshot.forEach((doc) => {
        providers.push({
            id: doc.id,
            ...doc.data()
        });
    });

    return providers;
};

/**
 * Fetch provider schedules (including availability slots) for specific providers
 */
export const getProviderSchedules = async (providerIds?: string[]) => {
    if (!providerIds || providerIds.length === 0) return [];

    // Limit to 10 for Firestore 'in' query (assuming candidate list is small)
    const limitedIds = providerIds.slice(0, 10);
    if (limitedIds.length === 0) return [];

    // 1. Fetch parent schedules in ONE network trip
    const parentSnap = await db.collection("providerSchedules")
        .where(admin.firestore.FieldPath.documentId(), "in", limitedIds)
        .get();

    const scheduleMap: Record<string, any> = {};
    parentSnap.forEach(doc => {
        scheduleMap[doc.id] = {
            providerId: doc.id,
            maxJobsPerDay: doc.data().maxJobsPerDay,
            currentBookingsCount: doc.data().currentBookingsCount,
            slots: []
        };
    });

    // 2. Fetch slots in ONE network trip via collectionGroup
    const dateObj = new Date();
    const date1 = dateObj.toISOString().split("T")[0];
    dateObj.setDate(dateObj.getDate() + 1);
    const date2 = dateObj.toISOString().split("T")[0];

    const slotsSnap = await db.collectionGroup("slots")
        .where("providerId", "in", limitedIds)
        .where("date", "in", [date1, date2])
        .get();

    slotsSnap.forEach(doc => {
        const data = doc.data();
        if (scheduleMap[data.providerId]) {
            scheduleMap[data.providerId].slots.push({ slotId: doc.id, ...data });
        }
    });

    return Object.values(scheduleMap);
};
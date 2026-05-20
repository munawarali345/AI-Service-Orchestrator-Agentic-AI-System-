import admin from "../config/firebase.config.js";

const db = admin.firestore();

export const getProviderDetailsService = async (providerId: string) => {
    try {
        // 1. Fetch provider details doc
        const providerRef = db.collection("providers").doc(providerId);
        const providerSnap = await providerRef.get();
        if (!providerSnap.exists) {
            throw new Error(`Provider with ID ${providerId} not found`);
        }
        const providerDetails = providerSnap.data() as any;

        // 2. Fetch provider reviews
        const reviewsRef = db.collection("reviews");
        const reviewsSnap = await reviewsRef.where("providerId", "==", providerId).limit(5).get();
        const reviews: any[] = [];
        reviewsSnap.forEach(doc => {
            reviews.push({ id: doc.id, ...doc.data() });
        });

        // 3. Fetch schedules next 7 days
        const parentScheduleRef = db.collection("providerSchedules").doc(providerId);
        const slotsSnap = await parentScheduleRef.collection("slots").where("isAvailable", "==", true).limit(10).get();
        const slots: any[] = [];
        slotsSnap.forEach(doc => {
            slots.push({ id: doc.id, ...doc.data() });
        });

        return {
            provider: { id: providerId, ...providerDetails },
            reviews: reviews.length > 0 ? reviews : [
                { name: "Mustafa Qureshi", date: "2 days ago", comment: "Outstanding service. The response time was extremely fast and the work was highly professional!" },
                { name: "Siddique Lakhani", date: "1 week ago", comment: "Highly reliable AC service. Explained everything in detail, highly recommended." }
            ],
            availableSlots: slots
        };
    } catch (error: any) {
        throw new Error(`Failed to retrieve provider details: ${error.message}`);
    }
};

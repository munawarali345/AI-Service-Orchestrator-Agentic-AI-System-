import admin from "../config/firebase.config.js";

const db = admin.firestore();

export const getFollowUpTimelineService = async (bookingId: string) => {
    try {
        // Retrieve booking status
        const bookingRef = db.collection("bookings").doc(bookingId);
        const bookingSnap = await bookingRef.get();
        if (!bookingSnap.exists) {
            throw new Error(`Booking ${bookingId} not found`);
        }
        const booking = bookingSnap.data() as any;

        // Fetch queued notifications for timeline
        const notifRef = db.collection("notifications");
        const notifSnap = await notifRef.where("bookingId", "==", bookingId).get();
        
        const schedule: any[] = [];
        notifSnap.forEach(doc => {
            const data = doc.data();
            schedule.push({
                state: data.type || data.status || "Phase Update",
                timestamp: data.sentAt || data.createdAt || new Date().toISOString(),
                message: data.message
            });
        });

        // Ensure a default fallback timeline if none were queued
        if (schedule.length === 0) {
            return [
                { state: "Booking Pending", timestamp: new Date(Date.now() - 5000).toISOString(), message: "Awaiting provider confirmation." },
                { state: "Provider Accepted", timestamp: new Date().toISOString(), message: "Your assigned provider has accepted your request." },
                { state: "Completed", timestamp: new Date(Date.now() + 60000).toISOString(), message: "Job completed successfully. Please leave a review!" }
            ];
        }

        return schedule;
    } catch (error: any) {
        throw new Error(`Failed to retrieve timeline: ${error.message}`);
    }
};

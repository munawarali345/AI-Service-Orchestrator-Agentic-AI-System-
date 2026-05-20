import admin from "../config/firebase.config.js";

const db = admin.firestore();

export const getBookingDetailsByIdService = async (bookingId: string) => {
    try {
        const bookingRef = db.collection("bookings").doc(bookingId);
        const bookingSnap = await bookingRef.get();
        if (!bookingSnap.exists) {
            throw new Error(`Booking ${bookingId} not found`);
        }
        const booking = bookingSnap.data() as any;

        // Fetch matched provider
        const providerRef = db.collection("providers").doc(booking.providerId);
        const providerSnap = await providerRef.get();
        const provider = providerSnap.exists ? providerSnap.data() : null;

        // Retrieve pricingConfig or compute pricing
        const pricingConfigRef = db.collection("pricingConfigs").doc(booking.serviceType);
        const pricingConfigSnap = await pricingConfigRef.get();
        const pricingConfig = pricingConfigSnap.exists ? pricingConfigSnap.data() as any : null;

        const basePrice = pricingConfig?.basePrice || 1500;
        const distFee = pricingConfig?.distanceSurcharge || 450;
        const surge = 1000;
        const discount = 150;

        return {
            bookingId: bookingId,
            status: booking.status || "confirmed",
            serviceType: booking.serviceType,
            location: booking.location,
            scheduledTime: booking.scheduledTime,
            provider: provider ? { id: booking.providerId, ...provider } : null,
            pricing: {
                base_fee: basePrice,
                distance_fee: distFee,
                urgency_surge: surge,
                discount: discount,
                grand_total: basePrice + distFee + surge - discount
            }
        };
    } catch (error: any) {
        throw new Error(`Failed to retrieve booking information: ${error.message}`);
    }
};

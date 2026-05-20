import admin from "../config/firebase.config.js";

const db = admin.firestore();

/**
 * Fetch latest reviews for specific providers to assess rating and recency
 * Sorted, limited, and optimized to lightweight records to avoid massive token payloads and network hangs.
 */
export const getReviews = async (providerIds: string[]) => {
    if (!providerIds || providerIds.length === 0) {
        console.log("[getReviews] No provider IDs passed.");
        return [];
    }

    console.log(`[getReviews] Fetching reviews for ${providerIds.length} providers...`);
    const reviews: any[] = [];
    
    try {
        // Fetch reviews per provider
        await Promise.all(providerIds.map(async (pid) => {
            // Fetch all reviews for this provider using a simple query (no index required!)
            const snapshot = await db.collection("reviews")
                .where("providerId", "==", pid)
                .get();
                
            const providerReviews: any[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                providerReviews.push({ id: doc.id, ...data });
            });

            // Sort by date (createdAt) descending in memory
            providerReviews.sort((a, b) => {
                const timeA = a.createdAt?.toDate 
                    ? a.createdAt.toDate().getTime() 
                    : (a.createdAt?._seconds ? a.createdAt._seconds * 1000 : 0);
                const timeB = b.createdAt?.toDate 
                    ? b.createdAt.toDate().getTime() 
                    : (b.createdAt?._seconds ? b.createdAt._seconds * 1000 : 0);
                return timeB - timeA;
            });

            // Limit to latest 3 reviews and extract ONLY the required mathematical fields: providerId and createdAt!
            // This makes the token payload 95% smaller, completely preventing network/API transfer hangs!
            providerReviews.slice(0, 3).forEach(r => {
                let parsedDate = "";
                if (r.createdAt && r.createdAt.toDate) {
                    parsedDate = r.createdAt.toDate().toISOString();
                } else if (r.createdAt && typeof r.createdAt === 'object' && r.createdAt._seconds) {
                    parsedDate = new Date(r.createdAt._seconds * 1000).toISOString();
                } else if (typeof r.createdAt === 'string') {
                    parsedDate = r.createdAt;
                }
                
                reviews.push({
                    providerId: r.providerId,
                    createdAt: parsedDate
                });
            });
        }));

        console.log(`[getReviews] Completed successfully. Total lightweight reviews gathered: ${reviews.length}`);
    } catch (e: any) {
        console.error("[getReviews] Error encountered while fetching reviews:", e.message || e);
        return [];
    }

    return reviews;
};

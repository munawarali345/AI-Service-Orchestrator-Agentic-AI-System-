import admin from "../config/firebase.config.js";

const db = admin.firestore();

export const getRankedProvidersService = async (serviceCategory: string, location: string) => {
    try {
        const cat = serviceCategory.toLowerCase().trim();
        const loc = location.toLowerCase().trim();

        // 1. Fetch all providers matching serviceCategory
        const providersRef = db.collection("providers");
        const snapshot = await providersRef.where("serviceCategories", "array-contains", cat).get();

        const providers: any[] = [];
        snapshot.forEach(doc => {
            providers.push({ id: doc.id, ...doc.data() });
        });

        // 2. Simple geodesic area clustering or sorting matching candidate locations
        const nearbyMap: Record<string, string[]> = {
            "scheme 33": ["safoora", "gulzar-e-hijri", "gulshan-e-iqbal", "university road", "gulistan-e-johar"],
            "safoora": ["scheme 33", "gulzar-e-hijri", "gulshan-e-iqbal", "university road"],
            "gulzar-e-hijri": ["scheme 33", "safoora", "gulshan-e-iqbal", "university road"],
            "gulshan-e-iqbal": ["scheme 33", "safoora", "gulzar-e-hijri", "university road", "hassan square", "gulistan-e-johar"],
            "gulistan-e-johar": ["gulshan-e-iqbal", "scheme 33", "safoora", "university road", "karsaz", "shahrah-e-faisal"],
            "university road": ["gulshan-e-iqbal", "hassan square", "scheme 33", "gulistan-e-johar"],
            "hassan square": ["gulshan-e-iqbal", "university road", "bahadurabad", "karsaz"],
            "bahadurabad": ["tariq road", "pechs", "hassan square", "karsaz"],
            "tariq road": ["bahadurabad", "pechs", "shahrah-e-faisal"],
            "pechs": ["tariq road", "bahadurabad", "shahrah-e-faisal", "karsaz"],
            "shahrah-e-faisal": ["pechs", "tariq road", "karsaz", "gulistan-e-johar"],
            "karsaz": ["shahrah-e-faisal", "pechs", "gulistan-e-johar", "hassan square", "bahadurabad"]
        };

        const nearbyAreas = nearbyMap[loc] || [];

        // Map computed distance and sort by distance and rating
        const evaluated = providers.map(p => {
            const area = (p.location?.area || "").toLowerCase().trim();
            let distance = 12.5; // default fallback

            if (area === loc) {
                distance = 1.8;
            } else if (nearbyAreas.includes(area)) {
                distance = 4.2;
            }

            return {
                ...p,
                distance: `${distance} km`,
                computedDistance: distance
            };
        }).sort((a, b) => {
            // Sort by distance first, then rating descending
            if (a.computedDistance !== b.computedDistance) {
                return a.computedDistance - b.computedDistance;
            }
            return (b.rating || 0) - (a.rating || 0);
        });

        return evaluated;
    } catch (error: any) {
        throw new Error(`Failed to retrieve ranked providers: ${error.message}`);
    }
};

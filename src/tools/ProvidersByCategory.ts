import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getProviders } from "./providerTool.js";

export const discoverProvidersTool = tool(
    async ({ serviceCategory, location }) => {
        // 1. Synonym mapping to find core database category
        const SERVICE_SYNONYMS: Record<string, string[]> = {
            "cleaning": ["clean", "cleaner", "cleaning", "maid", "sweep"],
            "plumbing": ["plumb", "plumber", "plumbing", "pipe", "leak", "geyser"],
            "electrician": ["electric", "electrician", "electrical", "wire", "ups"],
            "beautician": ["beauty", "beautician", "makeup", "salon", "hair", "bridal"],
            "decoration": ["decor", "decoration", "event", "wedding", "birthday", "party"]
        };

        const targetService = serviceCategory.toLowerCase();
        let matchedCategory = targetService;
        for (const [coreCat, synonyms] of Object.entries(SERVICE_SYNONYMS)) {
            if (synonyms.includes(targetService) || synonyms.some(syn => targetService.includes(syn))) {
                matchedCategory = coreCat;
                break;
            }
        }

        // 2. Fetch category providers from database
        const allProviders = await getProviders(matchedCategory);

        // 3. Mathematical Karachi location clustering aligning with Firestore seed data
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

        const targetLoc = location.trim().toLowerCase();
        const nearbyAreas = nearbyMap[targetLoc] || [];

        const filtered = allProviders.filter((p: any) => {
            const area = (p.location?.area || "").trim().toLowerCase();
            return area === targetLoc || nearbyAreas.includes(area);
        });

        return JSON.stringify(filtered);
    },
    {
        name: "discover_providers",
        description: "Fetch and filter service providers from the database by service category and exact/nearby Karachi location clustering.",
        schema: z.object({
            serviceCategory: z.string().describe("The requested service or keyword (e.g. cleaner, plumber, electrician)."),
            location: z.string().describe("The user's requested area (e.g. Gulshan-e-Iqbal, Scheme 33, DHA)."),
        }),
    }
);

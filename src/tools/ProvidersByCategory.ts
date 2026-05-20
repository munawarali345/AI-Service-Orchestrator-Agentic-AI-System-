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
            "scheme33": ["safoora", "gulzarehijri", "gulshaneiqbal", "universityroad", "gulistanejohar"],
            "safoora": ["scheme33", "gulzarehijri", "gulshaneiqbal", "universityroad"],
            "gulzarehijri": ["scheme33", "safoora", "gulshaneiqbal", "universityroad"],
            "gulshaneiqbal": ["scheme33", "safoora", "gulzarehijri", "universityroad", "hassansquare", "gulistanejohar"],
            "gulistanejohar": ["gulshaneiqbal", "scheme33", "safoora", "universityroad", "karsaz", "shahrahefaisal"],
            "universityroad": ["gulshaneiqbal", "hassansquare", "scheme33", "gulistanejohar"],
            "hassansquare": ["gulshaneiqbal", "universityroad", "bahadurabad", "karsaz"],
            "bahadurabad": ["tariqroad", "pechs", "hassansquare", "karsaz"],
            "tariqroad": ["bahadurabad", "pechs", "shahrahefaisal"],
            "pechs": ["tariqroad", "bahadurabad", "shahrahefaisal", "karsaz"],
            "shahrahefaisal": ["pechs", "tariqroad", "karsaz", "gulistanejohar"],
            "karsaz": ["shahrahefaisal", "pechs", "gulistanejohar", "hassansquare", "bahadurabad"]
        };

        const normalizeLoc = (loc: string) => loc.toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetLoc = normalizeLoc(location);
        const filtered = allProviders.filter((p: any) => {
            const area = normalizeLoc(p.location?.area || "");
            
            // 1. Direct or partial match
            const isMatch = area.includes(targetLoc) || targetLoc.includes(area);
            
            // 2. Nearby match
            const isNearby = Object.keys(nearbyMap).some(key => {
                // If user typed "gulshan", it matches the key "gulshaneiqbal"
                if (key.includes(targetLoc) || targetLoc.includes(key)) {
                    return nearbyMap[key].includes(area) || key === area;
                }
                return false;
            });

            return isMatch || isNearby;
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

// intent data me jo location he us k hisab se exact or nearby arer k provider nikal k bejgega
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const filterProvidersByLocationTool = tool(
    async ({ targetLocation, providers }) => {

        // Your exact clustering logic
        const nearbyMap: Record<string, string[]> = {
            "scheme 33": ["safoora", "gulzar-e-hijri", "gulshan-e-iqbal", "university road", "federal b area"],
            "dha": ["clifton", "pechs"]
        };

        const target = targetLocation.toLowerCase();
        const nearbyAreas = nearbyMap[target] || [];

        const filtered = providers.filter((p: any) => {
            const area = (p.location?.area || "").toLowerCase();
            return area === target || nearbyAreas.includes(area);
        });

        return JSON.stringify(filtered);
    },
    {
        name: "filter_providers_by_location",
        description: "Always call this SECOND. Use this tool to filter a large list of providers down to only those in the user's exact or nearby location.",
        schema: z.object({
            targetLocation: z.string().describe("The user's exact area (e.g., Scheme 33)."),
            providers: z.array(z.any()).describe("The raw array of providers returned from the fetch_providers_by_category tool.")
        }),
    }
);

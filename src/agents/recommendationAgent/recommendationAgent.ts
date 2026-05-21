import OpenRouterClient from "../../lib/openRouterClient.js";

export const recommendationAgent = async (state: any) => {
    try {
        const { intent } = state;
        const providersList = Array.isArray(state.providers)
            ? state.providers
            : [];

        // Strip heavy metadata, pass only core facts to avoid token limit issues
        const rankedProviders = providersList.map((p: any) => ({
            id: p.id || p.provider?.id,
            name: p.name || p.provider?.name,
            area: p.location?.area || p.provider?.location?.area,
            computedDistance: p.computedDistance || "unknown",
            priceEvaluation: p.priceEvaluation || "unknown",
            distance: p.distance || p.provider?.distance || "unknown",
            rating: p.rating || p.provider?.rating,
            reliabilityScore: p.reliabilityScore || p.provider?.reliabilityScore,
            priceRange: p.priceRange || p.provider?.priceRange,
            matchedSlot: p.matchedSlot || null,
            alternativeSlots: p.alternativeSlots || []
        }));

        // If no providers are found, skip LLM entirely to prevent hallucinations
        if (rankedProviders.length === 0) {
            console.log("=== RECOMMENDATION AGENT RESPONSE ===");
            console.log("No providers found. Returning fallback.");
            console.log("=====================================");
            return {
                ...state,
                recommendation: {
                    recommendedProvider: null,
                    alternatives: [],
                    userMessage: `Sorry, mujhe ${intent.location || "is area"} mein koi ${intent.service || "provider"} abhi nahi mil saka. Please try another area or time.`
                },
                selectedProvider: null,
                logs: [
                    ...(state.logs || []),
                    {
                        step: "Recommendation Agent",
                        message: "No providers were passed from ranking. Aborted LLM call."
                    }
                ]
            };
        }

        const systemPrompt = `
You are a Decision & Recommendation Agent.

You do NOT fetch data.
You do NOT call tools.
You do NOT perform ranking.
You ONLY decide and explain using already provided ranked providers.

1. Select BEST provider (top 1) - This is the final recommended provider
2. Pick TOP 2-3 alternatives - Only if available
3. Generate SIMPLE HUMAN REASONING: Explain in easy language why this provider is best (distance advantage, rating/reliability advantage, availability match)
4. DO NOT show calculations or technical scoring
5. DO NOT re-rank providers (Ranking already done upstream)
6. Keep response short, clear, production-ready
7. VERY IMPORTANT: You must write the 'userMessage' strictly in the user's detected language: ${intent.language || 'English'}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "recommendedProvider": {
    "id": "",
    "name": "",
    "area": "",
    "distance": "<Map the 'computedDistance' field from Ranking Agent exactly here>",
    "priceEvaluation": "",
    "pricingDetails": "<Map the 'pricingDetails' object from Ranking Agent exactly here>",
    "rating": "",
    "reason": "",
    "matchedSlot": {
      "slotId": "",
      "date": "",
      "timeSlot": ""
    }
  },
  "alternatives": [
    {
      "id": "",
      "name": "",
      "area": "",
      "distance": "<Map the 'computedDistance' field from Ranking Agent exactly here>",
      "priceEvaluation": "",
      "pricingDetails": "<Map the 'pricingDetails' object from Ranking Agent exactly here>",
      "reason": "",
      "matchedSlot": {
        "slotId": "",
        "date": "",
        "timeSlot": ""
      }
    }
  ],
  "userMessage": ""
}

USER MESSAGE STYLE RULES:
- Write strictly in: ${intent.language || 'English'}
- Natural tone (WhatsApp style)
- Highlight provider name, time, and why they were chosen (e.g. price/distance).
- Never hallucinate new providers
- Always trust input ranking
        `;

        const userPrompt = `
User Intent:
${JSON.stringify(intent, null, 2)}

Ranked Providers List (Top = Best):
${JSON.stringify(rankedProviders, null, 2)}
        `;

        const completion = await OpenRouterClient.chat.send({
            chatRequest: {
                model: 'poolside/laguna-xs.2:free',
                temperature: 0.1,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                responseFormat: { type: "json_object" }
            }
        });

        const rawContent = completion.choices[0]?.message?.content || "{}";
        const result = JSON.parse(rawContent);

        console.log("=== RECOMMENDATION AGENT RESPONSE ===");
        console.log(JSON.stringify(result, null, 2));
        console.log("=====================================");

        return {
            ...state,
            recommendation: result,
            selectedProvider: result.recommendedProvider,
            logs: [
                ...(state.logs || []),
                {
                    step: "Recommendation Agent",
                    message: "Generated human reasoning and final alternatives."
                }
            ]
        };

    } catch (error: any) {
        console.error("Recommendation Agent Error:", error);
        return {
            ...state,
            error: error.message,
            logs: [
                ...(state.logs || []),
                {
                    step: "Recommendation Agent",
                    message: "Failed to generate recommendation"
                }
            ]
        };
    }
};

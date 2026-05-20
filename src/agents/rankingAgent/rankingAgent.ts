import { Type } from "@google/genai";
import { ai, GEMINI_MODELS } from "../../lib/gemini.js";

// Import your new ranking tools!
import {
  fetchProviderSchedulesTool,
  fetchProviderReviewsTool,
  fetchPricingReferenceTool,
  evaluateAndScoreProvidersTool
} from "../../tools/RankingTools.js";

const parseToolResponse = (res: any): string => {
  if (typeof res === "string") return res;
  if (res && typeof res.content === "string") return res.content;
  return JSON.stringify(res?.content || res || "");
};

export const rankingAgent = async (state: any) => {
  try {
    const intent = state.intent;
    const providers = state.providers || [];

    if (providers.length === 0) {
      return {
        ...state,
        providers: [],
        logs: [
          ...(state.logs || []),
          { step: "Ranking Agent", message: "No candidate providers to rank" }
        ]
      };
    }

    const systemPrompt = `
You are an AI Ranking Agent for a local service booking platform.
Your role is to evaluate and rank candidate service providers discovered by the Discovery Agent using exactly 9 factors.

You will receive:
- User Intent (contains 'service', 'location', and 'time')
- Candidate Providers (array from Discovery)

YOUR COGNITIVE MISSION:
1. FIRST TURN (Parallel Data Fetching): You MUST call these three tools in parallel in your very first turn:
   - 'fetch_pricing_reference' (passing the service category)
   - 'fetch_provider_schedules' (passing the list of provider IDs: ${JSON.stringify(providers.map((p: any) => p.id))})
   - 'fetch_provider_reviews' (passing the list of provider IDs: ${JSON.stringify(providers.map((p: any) => p.id))})
   You must call all three tools at the same time in parallel. Do not do them sequentially.
2. SECOND TURN (Score Providers): Once you receive the results of all three tools, call the 'evaluate_and_score_providers' tool. Pass the candidates, schedules, reviews, pricing config, targetLocation, targetTime (map intent's targetTimeWindow to targetTime), and targetDate (map intent's targetDate to targetDate).
3. THIRD TURN (Generate JSON Response): Format the mathematical scoring response into the strict JSON schema required:
   - Pick the absolute #1 ranked provider and format it as 'topProvider'.
   - Pick the #2 and #3 ranked providers (if available) and format them as the 'rankedProviders' array.
   - CRITICAL: Do NOT duplicate the #1 provider in the 'rankedProviders' array!
   - Write a simple, short, compelling human explanation ('reasoning') for both the top provider and the alternatives.

JSON SCHEMA FORMAT EXAMPLE:
{
  "topProvider": {
    "provider": {
      "id": "provider_1067e20e-82da-4b0a-afc6-12bce66f174a",
      "name": "Ahmed Khan's Services",
      "ownerName": "Ahmed Khan",
      "phone": "+92 320 2589455",
      "serviceCategories": ["cleaning"],
      "location": {
        "address": "House 22, Street 6, Gulistan-e-Johar",
        "area": "Gulistan-e-Johar",
        "lat": 24.84,
        "lng": 67.14,
        "city": "Karachi"
      },
      "rating": 3.79,
      "totalJobs": 201,
      "reliabilityScore": 94,
      "cancellationRate": 0.02,
      "priceRange": { "min": 1000, "max": 4000, "currency": "PKR" },
      "specializations": ["sofa cleaning"],
      "languages": ["Urdu", "English"],
      "isVerified": true
    },
    "score": 95,
    "computedDistance": "1.2 km away from Gulshan-e-Iqbal",
    "priceEvaluation": "Within standard budget",
    "matchedSlot": { "slotId": "slot_01", "date": "2026-05-21", "timeSlot": "09:00-11:00" },
    "alternativeSlots": []
  },
  "rankedProviders": [
    {
      "provider": {
        "id": "provider_cd042c72-7d11-4cbf-806e-dcdf6464d678",
        "name": "Ali Khan's Services",
        "ownerName": "Ali Khan",
        "phone": "+92 314 8181802",
        "serviceCategories": ["cleaning"],
        "location": {
          "address": "House 19, Street 8, Scheme 33",
          "area": "Scheme 33",
          "lat": 24.92,
          "lng": 67.04,
          "city": "Karachi"
        },
        "rating": 3.68,
        "totalJobs": 208,
        "reliabilityScore": 80,
        "cancellationRate": 0.06,
        "priceRange": { "min": 1000, "max": 4000, "currency": "PKR" },
        "specializations": ["sofa cleaning", "home cleaning"],
        "languages": ["Urdu", "English"],
        "isVerified": true
      },
      "score": 88,
      "computedDistance": "8.2 km away from Gulshan-e-Iqbal",
      "priceEvaluation": "Within standard budget",
      "matchedSlot": { "slotId": "slot_02", "date": "2026-05-21", "timeSlot": "10:00-12:00" },
      "alternativeSlots": []
    }
  ]
}

CRITICAL RULES:
- Never skip a tool. You must fetch all data and compute scores.
- Do NOT hallucinate provider details. Only return the exact providers returned by the final tool.
- Output ONLY pure JSON. No markdown formatting, no conversational text, no explanations. Just the final JSON object.
`;

    const userPrompt = `
User Intent: ${JSON.stringify(intent)}
Candidate Providers: ${JSON.stringify(providers)}
`;

    // 1. Candidate models pool to try sequentially in case of rate limits/quota exhaustion
    const modelsToTry = [
      GEMINI_MODELS.FLASH,
      "gemini-2.5-flash",
      "gemini-2.5-pro"
    ];

    let finalResult: any = null;
    let successModel = "";

    for (const activeModel of modelsToTry) {
      try {
        console.log(`[Gemini Ranking Agent] Attempting ReAct loop using model: ${activeModel}`);

        let messages: any[] = [
          { role: 'user', parts: [{ text: userPrompt }] }
        ];

        let loopCount = 0;
        let finished = false;
        let lastScoredList: any[] = [];

        while (loopCount < 8 && !finished) {
          const response = await ai.models.generateContent({
            model: activeModel,
            contents: messages,
            config: {
              systemInstruction: systemPrompt,
              tools: [{
                functionDeclarations: [
                  {
                    name: "fetch_pricing_reference",
                    description: "Call this to fetch the reference pricing guidelines and budgets for a service category.",
                    parameters: {
                      type: Type.OBJECT,
                      properties: {
                        serviceCategory: { type: Type.STRING, description: "The core service category (e.g. cleaning, electrician, plumbing)." }
                      },
                      required: ["serviceCategory"]
                    }
                  },
                  {
                    name: "fetch_provider_schedules",
                    description: "Call this to fetch schedules, availability slots, and workload limits for specific provider IDs.",
                    parameters: {
                      type: Type.OBJECT,
                      properties: {
                        providerIds: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "List of provider IDs to fetch schedules for."
                        }
                      },
                      required: ["providerIds"]
                    }
                  },
                  {
                    name: "fetch_provider_reviews",
                    description: "Call this to retrieve recent customer ratings, reviews, and timestamps for specific provider IDs.",
                    parameters: {
                      type: Type.OBJECT,
                      properties: {
                        providerIds: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "List of provider IDs to fetch reviews for."
                        }
                      },
                      required: ["providerIds"]
                    }
                  },
                  {
                    name: "evaluate_and_score_providers",
                    description: "Executes exact 9-factor mathematical weighting, slot matching, and coordinate proximity to return a sorted list of ranked providers.",
                    parameters: {
                      type: Type.OBJECT,
                      properties: {
                        providers: { type: Type.ARRAY, items: { type: Type.OBJECT }, description: "List of candidate providers from Discovery Agent." },
                        schedules: { type: Type.ARRAY, items: { type: Type.OBJECT }, description: "Raw schedules database records from fetch_provider_schedules." },
                        reviews: { type: Type.ARRAY, items: { type: Type.OBJECT }, description: "Raw reviews database records from fetch_provider_reviews." },
                        pricingConfig: { type: Type.OBJECT, description: "Pricing baseline config from fetch_pricing_reference." },
                        targetLocation: { type: Type.STRING, description: "Target user location (e.g. Scheme 33)." },
                        targetTime: { type: Type.STRING, description: "User's preferred booking time window (e.g. 'morning')." },
                        targetDate: { type: Type.STRING, description: "User's preferred booking date relative or absolute (e.g. 'tomorrow')." },
                        userLat: { type: Type.NUMBER, description: "User's latitude coordinate." },
                        userLng: { type: Type.NUMBER, description: "User's longitude coordinate." }
                      },
                      required: ["providers", "schedules", "reviews", "pricingConfig", "targetLocation"]
                    }
                  }
                ]
              }]
            }
          });

          // Add model's choice to conversation history
          messages.push({
            role: 'model',
            parts: response.candidates?.[0]?.content?.parts || []
          });

          const calls = response.functionCalls || [];
          if (calls.length > 0) {
            const functionResponses = [];

            for (const call of calls) {
              let toolOutput = "";
              console.log(`[Gemini Ranking Agent] Calling tool ${call.name} with args:`, call.args);

              if (call.name === "fetch_pricing_reference") {
                toolOutput = parseToolResponse(await fetchPricingReferenceTool.invoke(call.args as any));
              } else if (call.name === "fetch_provider_schedules") {
                toolOutput = parseToolResponse(await fetchProviderSchedulesTool.invoke(call.args as any));
              } else if (call.name === "fetch_provider_reviews") {
                toolOutput = parseToolResponse(await fetchProviderReviewsTool.invoke(call.args as any));
              } else if (call.name === "evaluate_and_score_providers") {
                toolOutput = parseToolResponse(await evaluateAndScoreProvidersTool.invoke(call.args as any));
                try {
                  lastScoredList = JSON.parse(toolOutput);
                } catch (e) {
                  console.warn("[Gemini Ranking Agent] Failed to parse evaluate_and_score_providers output in ReAct loop:", e);
                }
              }

              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { result: JSON.parse(toolOutput) }
                }
              });
            }

            // Add tool results to conversation history in one single turn
            messages.push({
              role: 'user',
              parts: functionResponses
            });
            loopCount++;
          } else {
            // No function call requested, model is finished!
            const text = response.text || "{}";
            try {
              const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
              finalResult = JSON.parse(cleanText);
            } catch (e) {
              console.warn(`[Gemini Ranking Agent] Failed to parse model direct JSON with model ${activeModel}, trying next model...`, e);
              throw new Error("Invalid model direct response");
            }
            finished = true;
          }
        }

        // Dynamic schema validation & automatic dynamic recovery:
        if (!finalResult || !finalResult.topProvider) {
          if (Array.isArray(lastScoredList) && lastScoredList.length > 0) {
            console.log(`[Gemini Ranking Agent] Model ${activeModel} output mismatch. Successfully recovered schema from evaluate_and_score_providers!`);
            finalResult = {
              topProvider: lastScoredList[0],
              rankedProviders: lastScoredList.slice(1, 4)
            };
          } else {
            throw new Error(`Invalid or empty response schema generated by model ${activeModel} and no scored list captured`);
          }
        }

        successModel = activeModel;
        break; // Success! Exit the model loop.
      } catch (activeModelError: any) {
        console.warn(`[Gemini Ranking Agent] Model ${activeModel} failed: ${activeModelError.message}. Trying next fallback model...`);
      }
    }

    if (!successModel || !finalResult) {
      throw new Error("All candidate Gemini LLM models failed or were rate-limited");
    }

    console.log(`=== RANKING AGENT RESPONSE (${successModel}) ===`);
    console.log(JSON.stringify(finalResult, null, 2));
    console.log("==================================================");

    // Ensure providers array is populated with the complete list of candidates (topProvider + rankedProviders)
    const completeList = [
      finalResult.topProvider,
      ...(finalResult.rankedProviders || [])
    ].filter(Boolean);

    return {
      ...state,
      selectedProvider: finalResult.topProvider,
      providers: completeList,
      logs: [
        ...(state.logs || []),
        { step: "Ranking Agent", message: `Successfully executed manual ReAct ranking loop using ${successModel}` }
      ]
    };

  } catch (error: any) {
    console.warn("Gemini Ranking Agent LLM failed or rate-limited. Falling back to robust Local Mathematical Engine...", error.message);
    try {
      const intent = state.intent;
      const providers = state.providers || [];
      const providerIds = providers.map((p: any) => p.id);

      // 1. Fetch data directly via tool invocations (completely offline from LLM)
      const schedulesStr = parseToolResponse(await fetchProviderSchedulesTool.invoke({ providerIds }));
      const reviewsStr = parseToolResponse(await fetchProviderReviewsTool.invoke({ providerIds }));
      const pricingConfigStr = parseToolResponse(await fetchPricingReferenceTool.invoke({ serviceCategory: intent.service || "cleaning" }));

      const schedules = JSON.parse(schedulesStr);
      const reviews = JSON.parse(reviewsStr);
      const pricingConfig = JSON.parse(pricingConfigStr);

      // 2. Compute exact scores mathematically via the scoring tool
      const scoredListStr = parseToolResponse(await evaluateAndScoreProvidersTool.invoke({
        providers,
        schedules,
        reviews,
        pricingConfig,
        targetLocation: intent.location,
        targetTime: intent.targetTimeWindow,
        targetDate: intent.targetDate,
        userLat: intent.coordinates?.lat,
        userLng: intent.coordinates?.lng
      }));

      const scoredList = JSON.parse(scoredListStr);

      // 3. Format into the strict JSON schema required
      const top = scoredList[0] || null;
      const alternatives = scoredList.slice(1, 4); // #2, #3, #4 alternatives

      const fallbackResult = {
        topProvider: top,
        rankedProviders: alternatives
      };

      console.log("=== LOCAL MATHEMATICAL ENGINE FALLBACK RESPONSE ===");
      console.log(JSON.stringify(fallbackResult, null, 2));
      console.log("=================================================");

      const fallbackCompleteList = Array.isArray(scoredList) ? scoredList : [];

      return {
        ...state,
        selectedProvider: fallbackResult.topProvider,
        providers: fallbackCompleteList, // Complete sorted list (contains both top provider and all alternatives!)
        logs: [
          ...(state.logs || []),
          { step: "Ranking Agent Fallback", message: "Executed robust local math engine fallback due to LLM rate limit" }
        ]
      };
    } catch (fallbackError: any) {
      console.error("Critical Fallback Error in Ranking Agent:", fallbackError);
      return {
        ...state,
        providers: [], // Guaranteed empty array on critical error
        selectedProvider: null,
        error: error.message
      };
    }
  }
};
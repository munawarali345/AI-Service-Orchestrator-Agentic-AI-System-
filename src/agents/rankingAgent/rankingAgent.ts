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

    const providerIds = providers.map((p: any) => p.id);
    console.log("[Ranking Agent] Starting Parallel Tool Calling Pipeline...");

    const startTime = Date.now();

    // 1. Parallel Data Fetching
    const [schedulesStr, reviewsStr, pricingConfigStr] = await Promise.all([
      fetchProviderSchedulesTool.invoke({ providerIds }),
      fetchProviderReviewsTool.invoke({ providerIds }),
      fetchPricingReferenceTool.invoke({ serviceCategory: intent.service || "cleaning" })
    ]);

    const schedules = JSON.parse(parseToolResponse(schedulesStr));
    const reviews = JSON.parse(parseToolResponse(reviewsStr));
    const pricingConfig = JSON.parse(parseToolResponse(pricingConfigStr));

    const fetchTime = Date.now() - startTime;
    console.log(`[Ranking Agent] Parallel Data Fetching Complete in ${fetchTime}ms.`);

    // 2. Mathematical Scoring Engine
    const scoreStartTime = Date.now();
    const scoredListStr = await evaluateAndScoreProvidersTool.invoke({
      providers,
      schedules,
      reviews,
      pricingConfig,
      targetLocation: intent.location,
      targetTime: intent.targetTimeWindow,
      targetDate: intent.targetDate,
      userLat: intent.coordinates?.lat,
      userLng: intent.coordinates?.lng,
      intent: intent
    });

    const scoredList = JSON.parse(parseToolResponse(scoredListStr));
    const scoreTime = Date.now() - scoreStartTime;

    if (!scoredList || scoredList.length === 0) {
      throw new Error("Scoring engine returned empty list");
    }

    // 3. Prepare for LLM Formatting
    const topProvider = scoredList[0];
    const alternatives = scoredList.slice(1, 4);

    const systemPrompt = `
You are an AI Ranking Formatter for a local service booking platform.
The system has ALREADY scored, evaluated, and ranked the providers mathematically.

YOUR ONLY MISSION:
1. Format the mathematically ranked providers into the EXACT strict JSON schema below.
2. DO NOT change the scores, do NOT recalculate anything, do NOT change the order.
3. Your only creative task is to generate a short, compelling human explanation ('reasoning') explaining WHY the top provider and alternatives were chosen (e.g. good price, close distance, great rating).

JSON SCHEMA FORMAT EXAMPLE:
{
  "topProvider": {
    "provider": { ...exact provider object passed to you... },
    "score": 95,
    "computedDistance": "1.2 km away",
    "priceEvaluation": "Within budget",
    "pricingDetails": {
      "basePrice": 2674,
      "complexityCost": 0,
      "urgencyCost": 800,
      "distanceCost": 1200,
      "peakCost": 450,
      "totalPrice": 5124,
      "explanation": [
        "Urgent booking surcharge applied",
        "12km travel distance added",
        "Peak hour demand pricing applied"
      ]
    },
    "matchedSlot": { ... },
    "alternativeSlots": []
  },
  "rankedProviders": [
    {
      "provider": { ... },
      "score": 88,
      "computedDistance": "8.2 km away",
      "priceEvaluation": "...",
      "pricingDetails": {
        "basePrice": 2674,
        "complexityCost": 0,
        "urgencyCost": 0,
        "distanceCost": 800,
        "peakCost": 0,
        "totalPrice": 3474,
        "explanation": [
          "8km travel distance added"
        ]
      },
      "matchedSlot": { ... },
      "alternativeSlots": []
    }
  ]
}

CRITICAL RULES:
- Output ONLY pure JSON. No markdown formatting, no conversational text.
- Do NOT hallucinate data. Only use the Exact pre-scored data provided in the user prompt.
`;

    const userPrompt = `
Pre-Scored Top Provider: ${JSON.stringify(topProvider)}
Pre-Scored Alternatives: ${JSON.stringify(alternatives)}
`;

    const modelsToTry = [
      GEMINI_MODELS.FLASH,
      "gemini-2.5-flash",
      "gemini-2.5-pro"
    ];

    let finalResult: any = null;
    let successModel = "";

    const llmStartTime = Date.now();
    for (const activeModel of modelsToTry) {
      try {
        console.log(`[Gemini Ranking Agent] Requesting final JSON format from model: ${activeModel}`);
        const response = await ai.models.generateContent({
          model: activeModel,
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction: systemPrompt
          }
        });

        const text = response.text || "{}";
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        finalResult = JSON.parse(cleanText);

        if (finalResult && finalResult.topProvider) {
          successModel = activeModel;
          break;
        }
      } catch (err: any) {
        console.warn(`[Gemini Ranking Agent] Model ${activeModel} failed formatting: ${err.message}. Trying next fallback model...`);
      }
    }
    const llmTime = Date.now() - llmStartTime;

    // Fallback if LLM formatting completely fails (we already have the scored data!)
    if (!finalResult || !finalResult.topProvider) {
      console.log("[Ranking Agent] LLM formatting failed, returning raw scored data directly.");
      finalResult = {
        topProvider: topProvider,
        rankedProviders: alternatives
      };
      successModel = "fallback mechanism if llm fails";
    }

    console.log(`=== RANKING AGENT RESPONSE (${successModel}) ===`);
    console.log(JSON.stringify(finalResult, null, 2));
    console.log("==================================================");

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
        { step: "Ranking Agent", message: ` Parallel Data Fetching Started: Schedules, Reviews, Pricing` },
        { step: "Ranking Agent", message: ` Fetched 3 databases concurrently using Promise.all in ${fetchTime}ms` },
        { step: "Ranking Agent", message: ` Executed 9-Factor Mathematical Scoring engine in ${scoreTime}ms` },
        { step: "Ranking Agent", message: ` Formatted reasoning using ${successModel} in ${llmTime}ms` }
      ]
    };

  } catch (error: any) {
    console.error("Critical Error in Pipeline Ranking Agent:", error);
    return {
      ...state,
      providers: [],
      selectedProvider: null,
      error: error.message
    };
  }
};
import client from "../../lib/groqClient.js";
import { discoverProvidersTool } from "../../tools/ProvidersByCategory.js";

export const discoveryAgent = async (state: any) => {
    try {
        const intent = state.intent;

        // 1. Prepare system instructions
        const systemInstruction = `
You are an AI Discovery Agent for a local service booking platform. 
Your role is to discover and filter the best service providers for a user based on their specific request.

You will receive the user's Intent Data (which contains the requested 'service', 'location', and 'time').

YOUR MISSION:
1. Call the 'discover_providers' tool. Pass the 'service' as serviceCategory and 'location' as location from the intent data.
2. Output ONLY the resulting array of full provider objects returned by the tool.

CRITICAL RULES:
- Never skip the tool. You must call it.
- Do NOT simplify the provider objects. Return the full objects as returned by the tool.
- Output ONLY pure JSON. No markdown formatting, no conversational text, no explanations. Just the array.
`;

        const userPrompt = `Execute discovery for this intent: ${JSON.stringify(intent)}`;

        // 2. Call Groq model with tool support
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: userPrompt }
            ],
            tools: [
                {
                    type: "function",
                    function: {
                        name: "discover_providers",
                        description: "Fetch and filter service providers from the database by service category and exact/nearby Karachi location clustering.",
                        parameters: {
                            type: "object",
                            properties: {
                                serviceCategory: { type: "string", description: "The requested service or keyword (e.g. cleaner, plumber)." },
                                location: { type: "string", description: "The user's requested area (e.g. Gulshan-e-Iqbal)." }
                            },
                            required: ["serviceCategory", "location"]
                        }
                    }
                }
            ],
            tool_choice: "auto"
        });

        // 3. Handle tool calls or final output
        let finalProviders = [];
        let calledTool = false;

        const responseMessage = completion.choices[0]?.message;
        const candidateCalls = responseMessage?.tool_calls || [];

        if (candidateCalls.length > 0) {
            const toolCall = candidateCalls[0];
            if (toolCall.function.name === "discover_providers") {
                const args = JSON.parse(toolCall.function.arguments);
                console.log(`[Groq Discovery Agent] Calling tool discover_providers with args:`, args);
                
                // Directly invoke the local tool in TypeScript
                const resultStr = await discoverProvidersTool.invoke({
                    serviceCategory: args.serviceCategory,
                    location: args.location
                });

                finalProviders = JSON.parse(resultStr);
                calledTool = true;
            }
        }

        // If the model did not request a tool call or returned text directly
        if (!calledTool) {
            const rawText = responseMessage?.content || "[]";
            try {
                // Strip markdown blocks if present
                const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
                finalProviders = JSON.parse(cleanText);
            } catch (e) {
                console.warn("[Groq Discovery Agent] Failed to parse model's direct text. Running local query fallback...", e);
                // 100% Reliable Local Query Fallback!
                const resultStr = await discoverProvidersTool.invoke({
                    serviceCategory: intent.service || "cleaning",
                    location: intent.location || "Gulshan-e-Iqbal"
                });
                finalProviders = JSON.parse(resultStr);
            }
        }

        console.log("=== DISCOVERY AGENT RESPONSE ===");
        console.log(JSON.stringify(finalProviders, null, 2));
        console.log("================================");

        return {
            ...state,
            providers: finalProviders,
            logs: [
                ...(state.logs || []),
                { step: "Discovery Agent", message: "Successfully executed tool-calling Groq loop" }
            ]
        };

    } catch (error: any) {
        console.error("Discovery Agent Error:", error);
        return {
            ...state,
            error: error.message
        };
    }
};
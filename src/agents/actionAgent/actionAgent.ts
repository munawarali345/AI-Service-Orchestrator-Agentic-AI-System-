import client from "../../lib/groqClient.js";

export const actionAgent = async (state: any) => {
    try {
        const { intent, selectedProvider } = state;

        if (!selectedProvider) {
            return {
                ...state,
                logs: [
                    ...(state.logs || []),
                    {
                        step: "Action Agent",
                        message: "Skipped booking: No provider available to book."
                    }
                ]
            };
        }

        const systemPrompt = `
You are an Action Simulation Agent in a Service Booking System.
Your job is to generate a booking simulation payload based on the user's intent and the selected provider.

You MUST output strictly in the following JSON format:
{
  "booking": {
    "providerId": "provider_123",
    "serviceType": "Plumber",
    "location": "Scheme 33",
    "scheduledTime": "10:30-11:30",
    "slotId": "exact slot id provided in context",
    "status": "confirmed"
  },
  "confirmation": {
    "message": "Your booking is confirmed for [Time] in [Location] with [Provider Name]."
  },
  "receipt": {
    "summary": "Booking created and provider assigned successfully."
  },
  "actions": [
    "booking confirmation simulated",
    "provider assignment simulated",
    "schedule reserved",
    "receipt generated"
  ]
}

- "providerId" must match the selected provider's ID exactly.
- "serviceType", "location", and "scheduledTime" should reflect the user intent.
- Do NOT add any extra text or markdown. Only return JSON.
        `;

        const userPrompt = `
User Intent:
${JSON.stringify(intent, null, 2)}

Selected Provider:
${JSON.stringify({
            id: selectedProvider.id || selectedProvider.provider?.id || "unknown",
            name: selectedProvider.name || selectedProvider.provider?.name || "Unknown Provider",
            matchedSlot: selectedProvider.matchedSlot || {}
        }, null, 2)}
        `;

        const completion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const rawContent = completion.choices[0]?.message?.content || "{}";
        const result = JSON.parse(rawContent);

        return {
            ...state,
            booking: result,
            logs: [
                ...(state.logs || []),
                {
                    step: "Action Agent",
                    message: "Booking payload generated successfully via LLM Simulation"
                }
            ]
        };
    } catch (error: any) {
        console.error("Action Agent Error:", error);
        return {
            ...state,
            error: error.message,
            logs: [
                ...(state.logs || []),
                {
                    step: "Action Agent",
                    message: "Booking simulation failed"
                }
            ]
        };
    }
};

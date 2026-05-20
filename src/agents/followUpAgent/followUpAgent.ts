import client from "../../lib/groqClient.js";

export const followUpAgent = async (bookingDetails: any, providerDetails: any) => {
    try {
        const systemPrompt = `
You are a Follow-Up Automation Agent for a service booking platform.

Your job is to read confirmed booking details and generate a realistic, simulated lifecycle communication plan.

You must generate exactly three lifecycle notifications:
1. "reminder" - Sent before the service starts.
2. "status_update" - Sent when the provider is dispatched.
3. "completion" - Sent after the job is finished, asking for a review.

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "followUpPlan": [
    {
      "type": "reminder",
      "triggerTime": "1 hour before service",
      "message": "Hi! Just a reminder that [Provider Name] is arriving at [Time]."
    },
    {
      "type": "status_update",
      "triggerTime": "on provider dispatch",
      "message": "[Provider Name] is on the way to [Location]."
    },
    {
      "type": "completion",
      "triggerTime": "after job completion",
      "message": "Job done! How was your experience with [Provider Name]? Reply with 1-5 stars."
    }
  ]
}

RULES:
- Use the actual provider name, location, and time from the context.
- Keep messages short and friendly (WhatsApp style).
- Do not use markdown blocks, return pure JSON.
        `;

        const userPrompt = `
Confirmed Booking Details:
${JSON.stringify(bookingDetails, null, 2)}

Provider Details:
${JSON.stringify(providerDetails, null, 2)}
        `;

        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
        return result.followUpPlan || [];

    } catch (error: any) {
        console.error("Follow-Up Agent Error:", error);
        return [];
    }
};

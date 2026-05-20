import client from "../../lib/groqClient.js";

export const mergeIntentAgent = async (previousIntent: any, missingFields: string[], newUserInput: string) => {
    try {
        const mergePrompt = `
            Previous partial intent: ${JSON.stringify(previousIntent)}
            Missing fields that we asked for: ${missingFields.join(", ")}
            User's new reply: "${newUserInput}"
            
            Merge the user's reply into the missing fields of the previous intent.
            Return ONLY the completed JSON object with keys: service, location, time.
        `;
        
        const completion = await client.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: mergePrompt }],
            response_format: { type: 'json_object' }
        });
        
        return JSON.parse(completion.choices[0]?.message?.content || "{}");
    } catch (error) {
        console.error("Merge Agent Error:", error);
        throw error;
    }
};

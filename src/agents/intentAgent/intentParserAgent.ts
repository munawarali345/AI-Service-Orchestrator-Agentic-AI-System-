// imports
import client from "../../lib/groqClient.js";

// Groq Client initialized
const grokClient = client;

// main intent agent function 
export const intentAgent = async (state: any) => {

    try {
        // Get raw user input from state
        const userInput = state.input;

        // -------------------------------
        //  SYSTEM PROMPT
        // -------------------------------
        const systemPrompt = `
You are an AI Intent Understanding Agent for a Service Booking System.

Your job is to understand multilingual user requests related to home and local services.

SUPPORTED LANGUAGES:
- English
- Urdu
- Roman Urdu
- Mixed language input
- Misspelled text

YOUR TASK:
Extract exactly these fields from the user input:
1. service: The category of service requested (e.g. "cleaning", "plumbing", "electrician"). Return null if missing.
2. location: The localized area requested (e.g. "Gulshan-e-Iqbal", "Scheme 33"). Return null if missing.
3. targetDate: The requested date relative to today ("today", "tomorrow", "+2 days", "next day"). Return null if missing.
4. targetTimeWindow: The preferred time window of the day ("morning", "noon", "evening", "night", "urgent"). Return null if missing.
5. language: The language used by the user ("English", "Urdu Script", "Roman Urdu").

IMPORTANT RULES:
- NEVER guess missing information.
- NEVER provide default values for missing information.
- If ANY of the 4 core fields (service, location, targetDate, targetTimeWindow) are missing or unclear:
  - set isClear = false
  - generate a polite clarification question IN THE EXACT SAME LANGUAGE (detected language) asking for the specific missing details.
- If ALL 4 fields are clearly understood:
  - set isClear = true
  - clarificationQuestion must be null.

EXAMPLES:

Input:
"Mujhe kal subah G-13 mein AC technician chahiye"

Output:
{
  "service": "AC Technician",
  "location": "G-13",
  "targetDate": "tomorrow",
  "targetTimeWindow": "morning",
  "language": "Roman Urdu",
  "isClear": true,
  "clarificationQuestion": null
}

Input:
"Mujhe subah ek electrician ki zaroorat hai."

Output:
{
  "service": "electrician",
  "location": null,
  "targetDate": "today",
  "targetTimeWindow": "morning",
  "language": "Roman Urdu",
  "isClear": false,
  "clarificationQuestion": "Theek hai, main electrician bhej deta hoon. Lakin kis area/location mein bhejna hai? Aur kis din (aaj ya kal)?"
}

Return ONLY a JSON object.
No explanation.
No markdown.
No extra text.
`;

        // user prompt
        const userPrompt = `
user request:
   "${userInput}"
`;

        // AI call using Groq Llama 3.3
        const completion = await grokClient.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' }
        }, {
            timeout: 10000 // 10 seconds timeout
        });

        // get AI response and parse into JSON
        const rawContent = completion.choices[0]?.message?.content || "{}";
        const result = JSON.parse(rawContent);

        // Calculate missing fields to store in state
        const missingFields = [];
        if (!result.service) missingFields.push("service");
        if (!result.location) missingFields.push("location");
        if (!result.targetDate) missingFields.push("targetDate");
        if (!result.targetTimeWindow) missingFields.push("targetTimeWindow");

        // Determine if clarification is needed
        const pendingClarification = result.isClear === false || missingFields.length > 0;

        return {
            // Preserve previous state
            ...state,

            // Intent data save (using double-population)
            intent: pendingClarification ? null : {
                service: result.service,
                location: result.location,
                targetDate: result.targetDate,
                targetTimeWindow: result.targetTimeWindow,
                language: result.language || 'English',
                date: result.targetDate, // Backward-compatibility
                time: result.targetTimeWindow // Backward-compatibility
            },

            // Store partial intent for future merge
            previousIntent: pendingClarification ? {
                service: result.service,
                location: result.location,
                targetDate: result.targetDate,
                targetTimeWindow: result.targetTimeWindow,
                language: result.language || 'English',
                date: result.targetDate,
                time: result.targetTimeWindow
            } : null,

            // Input clear status
            isInputClear: !pendingClarification,

            // Clarification question & status
            pendingClarification: pendingClarification,
            missingFields: pendingClarification ? missingFields : [],
            clarificationQuestion: result.clarificationQuestion ?? null,

            // Workflow logs
            logs: [
                ...state.logs,
                {
                    step: "Intent Agent",
                    message: pendingClarification ? "Clarification requested due to missing fields" : "Intent extracted successfully"
                }
            ]
        };

    } catch (error: any) {
        console.error("Intent Agent Error:", error);
        return {
            ...state,
            error: error.message,
            logs: [
                ...state.logs,
                {
                    step: "Intent Agent",
                    message: "Intent extraction failed"
                }
            ]
        };
    }
};
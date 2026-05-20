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
1. service: The category of service requested (e.g. "cleaning", "plumbing", "electrician").
2. location: The localized area requested (e.g. "Gulshan-e-Iqbal", "Scheme 33").
3. targetDate: The requested date relative to today. Choose exactly one of these allowed values:
   - "today" (for aj, aaj, today, now, abhi)
   - "tomorrow" (for kal, tomorrow)
   - "+2 days" (for parso, day after tomorrow)
   - "next day" (for next day)
   - If not mentioned at all, default to "tomorrow".
4. targetTimeWindow: The preferred time window of the day. Choose exactly one of these allowed values:
   - "morning" (for subha, subah, morning, early morning, fajar)
   - "noon" (for dopahar, dupehar, noon, afternoon)
   - "evening" (for sham, shaam, evening, asir, maghrib)
   - "night" (for raat, night, late night, isha)
   - "urgent" (for abhi, ab, right now, asap)
   - If not mentioned at all, default to "morning".

IMPORTANT RULES:
- Never guess unclear information.
- If user input is confusing, incomplete, mixed badly, or completely ambiguous:
  - set isClear = false
  - generate a short clarification question.
- If input is understandable:
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
  "isClear": true,
  "clarificationQuestion": null
}

Input:
"Mujhe plmbr chye DHA"

Output:
{
  "service": "Plumber",
  "location": "DHA",
  "targetDate": "tomorrow",
  "targetTimeWindow": "morning",
  "isClear": false,
  "clarificationQuestion": "What time of the day do you prefer for the plumber service?"
}

Input:
"kal wala kaam wahi"

Output:
{
  "service": "",
  "location": "",
  "targetDate": "",
  "targetTimeWindow": "",
  "isClear": false,
  "clarificationQuestion": "Can you please specify which service you need and the location?"
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
                date: result.targetDate, // Backward-compatibility
                time: result.targetTimeWindow // Backward-compatibility
            },

            // Store partial intent for future merge
            previousIntent: pendingClarification ? {
                service: result.service,
                location: result.location,
                targetDate: result.targetDate,
                targetTimeWindow: result.targetTimeWindow,
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
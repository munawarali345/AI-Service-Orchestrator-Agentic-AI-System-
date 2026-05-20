// Import LangGraph state creator utility
import { Annotation } from "@langchain/langgraph";

// Create initial state structure for the whole workflow
// This state moves through ALL agents

export const AppState = Annotation.Root({

    //  Raw user input
    input: Annotation<string>(),

    //  Extracted intent (service, location, time)
    intent: Annotation<any>(),

    //  Flag if input is clear or needs clarification
    isInputClear: Annotation<boolean>(),

    //  Clarification specific fields (conversational state)
    pendingClarification: Annotation<boolean>(),
    missingFields: Annotation<string[]>(),
    previousIntent: Annotation<any>(),
    clarificationQuestion: Annotation<string | null>(),
    conversationId: Annotation<string>(),
    mergedIntent: Annotation<any>(),

    //  Providers list from discovery agent
    providers: Annotation<any[]>(),

    //  Selected best provider after ranking
    selectedProvider: Annotation<any>(),

    //  Human readable recommendation and alternatives
    recommendation: Annotation<any>(),

    //  Pricing breakdown
    pricing: Annotation<any>(),

    //  Booking details
    booking: Annotation<any>(),

    //  Dispute or cancellation info
    dispute: Annotation<any>(),

    //  Follow Up lifecycle plan
    followUp: Annotation<any[]>(),

    //  Logs for traceability (VERY IMPORTANT)
    logs: Annotation<any[]>(),

    //  Errors if any step fails
    error: Annotation<any>()
});

// Helper function to create initial state
export const createInitialState = (input: string) => {
    return {
        input,
        intent: null,
        isInputClear: true,
        pendingClarification: false,
        missingFields: [],
        previousIntent: null,
        clarificationQuestion: null,
        conversationId: "default_session",
        mergedIntent: null,
        providers: [],
        selectedProvider: null,
        recommendation: null,
        pricing: null,
        booking: null,
        dispute: null,
        followUp: [],
        logs: [],
        error: null
    };
};
// Import LangGraph workflow builder
import { StateGraph, START, END } from "@langchain/langgraph";

import { intentAgent } from "../agents/intentAgent/intentParserAgent.js";
import { discoveryAgent } from "../agents/discoveryAgent/discoveryAgent.js";
import { rankingAgent } from "../agents/rankingAgent/rankingAgent.js";
import { recommendationAgent } from "../agents/recommendationAgent/recommendationAgent.js";
import { actionAgent } from "../agents/actionAgent/actionAgent.js";

// Import state
import { AppState } from "./state.js";


// ------------------------------
//  4. PRICING AGENT (Commented out for now)
// ------------------------------
// const pricingAgent = async (state: any) => {
// 
//     if (!state.selectedProvider) {
//         return state; // Skip if ranking failed to select a provider
//     }
// 
//     const base = 1000;
//     // Fallback to 5km if distance is not explicitly calculated by LLM
//     const providerDistance = state.selectedProvider.distance || 5; 
//     const distancePrice = providerDistance * 100;
//     const urgency = 1.2;
// 
//     const finalPrice = base + distancePrice * urgency;
// 
//     return {
//         ...state,
//         pricing: {
//             base,
//             distancePrice,
//             urgency,
//             finalPrice
//         },
//         logs: [...state.logs, "Pricing calculated"]
//     };
// };


// ------------------------------
//  5. ACTION AGENT (Replaces dummy booking)
// ------------------------------
// Handled by imported actionAgent

// ------------------------------
//  CONDITIONAL ROUTING
// ------------------------------

// Check if we resume directly to discovery or need intent extraction
const routeStart = (state: any) => {
    // If intent is already populated (via merge logic in orchestrator), skip to discovery
    if (state.intent && !state.pendingClarification) {
        return "discoveryNode";
    }
    return "intentParserAgent";
};

// Check if intent extraction succeeded or needs clarification
const routeIntent = (state: any) => {
    // If clarification is needed, PAUSE the workflow (go to END)
    if (state.pendingClarification) {
        return END;
    }
    return "discoveryNode";
};

// ------------------------------
//  BUILD GRAPH
// ------------------------------
const graph = new StateGraph(AppState)
    .addNode("intentParserAgent", intentAgent)
    .addNode("discoveryNode", discoveryAgent)
    .addNode("rankingNode", rankingAgent)
    .addNode("recommendationNode", recommendationAgent)
    // .addNode("pricingNode", pricingAgent)
    .addNode("bookingNode", actionAgent)

    // Route dynamically from start
    .addConditionalEdges(START, routeStart)

    // Route dynamically from intent agent
    .addConditionalEdges("intentParserAgent", routeIntent)

    .addEdge("discoveryNode", "rankingNode")
    .addEdge("rankingNode", "recommendationNode")
    .addEdge("recommendationNode", "bookingNode")
    .addEdge("bookingNode", END)

// Compile workflow
export const appWorkflow = graph.compile();
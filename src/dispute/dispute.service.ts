import admin from "../config/firebase.config.js";
import { runRebookingAgent } from "../agents/rebookingAgent/rebookingAgent.js";
import { runDisputeAgent } from "../agents/disputeAgent/disputeAgent.js";

const db = admin.firestore();

export const executeProviderCancellationService = async (bookingId: string, cancelReason: string) => {
    try {
        const result = await runRebookingAgent(bookingId, cancelReason);
        return result;
    } catch (error: any) {
        throw new Error(`Cancellation failed: ${error.message}`);
    }
};

export const executeCustomerDisputeService = async (bookingId: string, userComplaint: string) => {
    try {
        const result = await runDisputeAgent(bookingId, userComplaint);
        return result;
    } catch (error: any) {
        throw new Error(`Dispute resolution failed: ${error.message}`);
    }
};

export const getDisputeHistoryService = async (bookingId: string) => {
    try {
        const disputesSnap = await db.collection("disputes").where("bookingId", "==", bookingId).get();
        const logs: any[] = [];
        disputesSnap.forEach(doc => {
            logs.push({ id: doc.id, ...doc.data() });
        });
        return logs;
    } catch (error: any) {
        throw new Error(`Failed to retrieve dispute logs: ${error.message}`);
    }
};

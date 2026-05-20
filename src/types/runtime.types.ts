// ==========================================
// RUNTIME FIRESTORE COLLECTIONS SCHEMA
// These interfaces define the strict data structures 
// for runtime operations (no logic, only types).
// ==========================================

// ------------------------------------------
// 1. BOOKINGS COLLECTION (Root Collection: `bookings`)
// ------------------------------------------
export type BookingStatus =
    | "pending"
    | "matched"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "disputed"
    | "resolved";

export interface IntentData {
    serviceType: string;
    location: string;
    timePreference: string;
    urgency: "normal" | "urgent" | "emergency";
    detectedLanguage: string;
    confidence: number;
}

export interface MatchingResult {
    selectedProviderId: string;
    rankedProviders: string[]; // Array of provider IDs
    matchingReasoningId: string;
}

export interface PricingBreakdown {
    basePrice: number;
    urgency: number;
    complexity: number;
    distance: number;
    demand: number;
    total: number;
}

export interface PricingData {
    breakdown: PricingBreakdown;
    currency: "PKR";
    pricingReasoningId: string;
}

export interface ScheduledSlot {
    date: string; // Format YYYY-MM-DD
    time: string; // Format e.g. "14:00-15:00"
}

export interface TimelineEvent {
    status: BookingStatus;
    timestamp: Date; // Firestore Timestamp
    note?: string;
}

export interface BookingSchema {
    id: string; // Firebase Document ID
    userId: string; // Firebase Auth UID
    providerId: string | null;
    serviceCategory: string;
    status: BookingStatus;
    requestText: string;
    intentData: IntentData;
    matchingResult: MatchingResult | null;
    pricing: PricingData | null;
    scheduledSlot: ScheduledSlot | null;
    timeline: TimelineEvent[];
    reminderScheduled: boolean;
    antigravityTraceId: string | null;
    createdAt: Date; // Firestore Timestamp
    updatedAt: Date; // Firestore Timestamp
}

// ------------------------------------------
// 2. AGENT TRACES COLLECTION (Root Collection: `agentTraces`)
// ------------------------------------------
export type TraceStepStatus = "success" | "failed" | "in_progress";

export interface TraceStep {
    stepNumber: number;
    agentName: string;
    action: string;
    input: any; // Dynamic AI payload
    output: any; // Dynamic AI payload
    reasoning: string;
    toolsUsed: string[];
    duration: number; // in milliseconds
    status: TraceStepStatus;
}

export interface AgentTraceSchema {
    id: string; // Firebase Document ID
    bookingId: string;
    antigravityWorkplanId: string;
    startedAt: Date; // Firestore Timestamp
    completedAt: Date | null; // Firestore Timestamp
    totalDuration: number; // in milliseconds
    steps: TraceStep[];
    workflowSummary: string;
    decisionsLog: string[];
    failuresHandled: string[];
}

// ------------------------------------------
// 3. DISPUTES COLLECTION (Root Collection: `disputes`)
// ------------------------------------------
export type DisputeType = "no_show" | "delay" | "poor_quality" | "overcharge";
export type DisputeStatus = "open" | "investigating" | "resolved";

export interface AIResolution {
    recommendation: string;
    reasoning: string;
    compensationAmount: number; // In PKR
}

export interface DisputeSchema {
    id: string; // Firebase Document ID
    bookingId: string;
    userId: string; // Firebase Auth UID
    providerId: string;
    type: DisputeType;
    status: DisputeStatus;
    reportedAt: Date; // Firestore Timestamp
    aiResolution: AIResolution | null;
    resolvedAt: Date | null; // Firestore Timestamp
}

// ------------------------------------------
// 4. PRICING LOGS COLLECTION (Root Collection: `pricingLogs`)
// ------------------------------------------
export interface PricingLogSchema {
    id: string; // Firebase Document ID
    bookingId: string;
    serviceCategory: string;
    inputFactors: Record<string, any>; // Represents variables like distance, peak hours at the time of calculation
    breakdown: PricingBreakdown; // Exact mirror of the PricingBreakdown from Booking
    calculatedAt: Date; // Firestore Timestamp
}

// ------------------------------------------
// 5. NOTIFICATIONS COLLECTION (Root Collection: `notifications`)
// ------------------------------------------
export type NotificationType =
    | "booking_confirmed"
    | "reminder_1hr"
    | "provider_arriving"
    | "completed"
    | "dispute_resolved";

export interface NotificationSchema {
    id: string; // Firebase Document ID
    userId: string; // Firebase Auth UID
    bookingId: string;
    type: NotificationType;
    message: string;
    isRead: boolean;
    scheduledFor: Date; // Firestore Timestamp
    sentAt: Date | null; // Firestore Timestamp
}

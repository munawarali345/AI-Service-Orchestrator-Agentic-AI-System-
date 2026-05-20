import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getProviderSchedules } from "./providerTool.js";
import { getReviews } from "./reviewTool.js";
import { getPricingConfig } from "./pricingTool.js";

// Local Geocoding and Area Normalization Map for Karachi Seeded Areas
const KARACHI_AREAS_COORDINATES: Record<string, { lat: number; lng: number; fullName: string; synonyms: string[] }> = {
    "gulshan-e-iqbal": {
        fullName: "Gulshan-e-Iqbal",
        lat: 24.91,
        lng: 67.08,
        synonyms: ["gulshan", "gulshan iqbal", "gulshan-e-iqbal", "gulshan e iqbal"]
    },
    "gulistan-e-johar": {
        fullName: "Gulistan-e-Johar",
        lat: 24.90,
        lng: 67.12,
        synonyms: ["johar", "jauhar", "gulistan iohar", "gulistan-e-johar", "gulistan e johar", "gulistan-e-jauhar"]
    },
    "scheme 33": {
        fullName: "Scheme 33",
        lat: 24.96,
        lng: 67.14,
        synonyms: ["scheme 33", "scheme-33", "scheme33", "skeme 33"]
    },
    "safoora": {
        fullName: "Safoora",
        lat: 24.93,
        lng: 67.16,
        synonyms: ["safoora", "safoora goth", "safoora chowrangi"]
    },
    "gulzar-e-hijri": {
        fullName: "Gulzar-e-Hijri",
        lat: 24.94,
        lng: 67.13,
        synonyms: ["gulzar e hijri", "gulzar-e-hijri", "gulzar"]
    },
    "university road": {
        fullName: "University Road",
        lat: 24.92,
        lng: 67.11,
        synonyms: ["university road", "university", "uni road"]
    },
    "hassan square": {
        fullName: "Hassan Square",
        lat: 24.90,
        lng: 67.06,
        synonyms: ["hassan square", "hasan square", "hassan chowrangi"]
    },
    "bahadurabad": {
        fullName: "Bahadurabad",
        lat: 24.88,
        lng: 67.07,
        synonyms: ["bahadurabad", "bahadurabad chowrangi"]
    },
    "tariq road": {
        fullName: "Tariq Road",
        lat: 24.87,
        lng: 67.05,
        synonyms: ["tariq road", "tariq rd"]
    },
    "pechs": {
        fullName: "PECHS",
        lat: 24.86,
        lng: 67.06,
        synonyms: ["pechs", "p.e.c.h.s", "pechs society"]
    },
    "shahrah-e-faisal": {
        fullName: "Shahrah-e-Faisal",
        lat: 24.85,
        lng: 67.08,
        synonyms: ["shahrah-e-faisal", "shahra e faisal", "shara e faisal", "shahrah e faisal"]
    },
    "karsaz": {
        fullName: "Karsaz",
        lat: 24.89,
        lng: 67.09,
        synonyms: ["karsaz", "karsaz road"]
    }
};

const normalizeLocation = (rawLocation: string) => {
    const cleaned = (rawLocation || "").trim().toLowerCase();
    for (const key of Object.keys(KARACHI_AREAS_COORDINATES)) {
        const area = KARACHI_AREAS_COORDINATES[key];
        if (area.synonyms.some(syn => cleaned.includes(syn) || syn.includes(cleaned))) {
            return {
                location: area.fullName,
                coordinates: {
                    lat: area.lat,
                    lng: area.lng
                }
            };
        }
    }
    // Default fallback coordinates (Karachi Center - Gulshan-e-Iqbal) if not matched
    return {
        location: rawLocation || "Gulshan-e-Iqbal",
        coordinates: {
            lat: 24.91,
            lng: 67.08
        }
    };
};

// 1. Tool to fetch provider schedules (availability + workload)
export const fetchProviderSchedulesTool = tool(
    async ({ providerIds }) => {
        const schedules = await getProviderSchedules(providerIds);
        return JSON.stringify(schedules);
    },
    {
        name: "fetch_provider_schedules",
        description: "Call this to fetch schedules, availability slots, and workload limits for specific provider IDs.",
        schema: z.object({
            providerIds: z.array(z.string()).describe("List of provider IDs to fetch schedules for."),
        }),
    }
);

// 2. Tool to fetch provider reviews (ratings + feedback)
export const fetchProviderReviewsTool = tool(
    async ({ providerIds }) => {
        const reviews = await getReviews(providerIds);
        return JSON.stringify(reviews);
    },
    {
        name: "fetch_provider_reviews",
        description: "Call this to retrieve recent customer ratings, reviews, and timestamps for specific provider IDs.",
        schema: z.object({
            providerIds: z.array(z.string()).describe("List of provider IDs to fetch reviews for."),
        }),
    }
);

// 3. Tool to fetch baseline pricing references
export const fetchPricingReferenceTool = tool(
    async ({ serviceCategory }) => {
        const config = await getPricingConfig(serviceCategory);
        return JSON.stringify(config || {});
    },
    {
        name: "fetch_pricing_reference",
        description: "Call this to fetch the reference pricing guidelines and budgets for a service category.",
        schema: z.object({
            serviceCategory: z.string().describe("The core service category (e.g. cleaning, electrician, plumbing)."),
        }),
    }
);

// Helper function to resolve relative natural language date strings to absolute YYYY-MM-DD
const resolveTargetDateString = (targetDateStr: string): string => {
    const cleaned = (targetDateStr || "").trim().toLowerCase();
    const dateObj = new Date();

    if (cleaned.includes("tomorrow") || cleaned.includes("kal")) {
        dateObj.setDate(dateObj.getDate() + 1);
    } else if (cleaned.includes("+2 days") || cleaned.includes("parso") || cleaned.includes("parsoo")) {
        dateObj.setDate(dateObj.getDate() + 2);
    } else if (cleaned.includes("next day")) {
        dateObj.setDate(dateObj.getDate() + 1);
    }
    // "today" / "aj" / "aaj" / default keeps dateObj as today

    return dateObj.toISOString().split("T")[0];
};

// Helper function to parse time strings like "10:30-11:30" or natural language into decimal hours
const parseTimeToDecimal = (timeStr: string): number => {
    try {
        const cleaned = timeStr.trim().toLowerCase();

        // 1. Natural language mapping first
        if (cleaned.includes("subha") || cleaned.includes("subah") || cleaned.includes("morning")) {
            return 9.0;
        }
        if (cleaned.includes("dopahar") || cleaned.includes("dupehar") || cleaned.includes("noon") || cleaned.includes("afternoon")) {
            return 13.0;
        }
        if (cleaned.includes("sham") || cleaned.includes("shaam") || cleaned.includes("evening")) {
            return 17.0;
        }
        if (cleaned.includes("raat") || cleaned.includes("night")) {
            return 21.0;
        }
        if (cleaned.includes("abhi") || cleaned.includes("ab") || cleaned.includes("right now") || cleaned.includes("asap")) {
            const currentHour = new Date().getHours();
            return currentHour >= 24 ? 9.0 : currentHour + (new Date().getMinutes() / 60);
        }

        // 2. Fallback to standard HH:mm parsing
        const match = cleaned.match(/(\d+):(\d+)/);
        if (match) {
            let hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            
            if (cleaned.includes("pm") && hours < 12) {
                hours += 12;
            } else if (cleaned.includes("am") && hours === 12) {
                hours = 0;
            }
            return hours + minutes / 60;
        }
    } catch (e) {
        console.error("Error parsing time string:", timeStr, e);
    }
    return 12.0; // default to noon
};

// exact mathematical Haversine geodesic distance calculator in kilometers
function haversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Helper to robustly extract timestamps from various Firestore / JS formats
const getReviewTime = (review: any): number => {
    if (!review || !review.createdAt) return 0;
    if (typeof review.createdAt === 'string') {
        return new Date(review.createdAt).getTime();
    }
    if (typeof review.createdAt.toDate === 'function') {
        return review.createdAt.toDate().getTime();
    }
    if (review.createdAt._seconds !== undefined) {
        return review.createdAt._seconds * 1000 + (review.createdAt._nanoseconds || 0) / 1000000;
    }
    if (review.createdAt instanceof Date) {
        return review.createdAt.getTime();
    }
    return new Date(review.createdAt).getTime();
};

// Helper to normalize keyword synonyms into primary categories
const getNormalizedCategory = (rawStr: string): string => {
    const cleaned = (rawStr || "").trim().toLowerCase();
    if (cleaned.includes("ac") || cleaned.includes("hvac") || cleaned.includes("air condition")) {
        return "hvac";
    }
    if (cleaned.includes("plumb")) {
        return "plumbing";
    }
    if (cleaned.includes("electric") || cleaned.includes("wiring") || cleaned.includes("ups")) {
        return "electrical";
    }
    if (cleaned.includes("clean") || cleaned.includes("sofa")) {
        return "cleaning";
    }
    return cleaned;
};

// 4. Mathematical scoring engine tool implementing all 9 factors
export const evaluateAndScoreProvidersTool = tool(
    async ({ providers, schedules, reviews, pricingConfig, targetLocation, targetTime, targetDate, userLat, userLng }) => {
        const targetDateISO = resolveTargetDateString(targetDate || "");
        const targetDec = targetTime ? parseTimeToDecimal(targetTime) : 12.0;

        // Perform dynamic local Geocoding and Name Normalization inside the Ranking Tool!
        const normalized = normalizeLocation(targetLocation);
        const normalizedLocationName = normalized.location;

        // Resolve user lat/lng from parameters or targetLocation local map
        let resolvedUserLat = userLat;
        let resolvedUserLng = userLng;

        if (resolvedUserLat === undefined || resolvedUserLng === undefined) {
            resolvedUserLat = normalized.coordinates.lat;
            resolvedUserLng = normalized.coordinates.lng;
        }

        const scoredList = providers.map((p: any) => {
            const pid = p.id;
            
            // -------------------------------------------------------------
            // FACTOR 1: Distance (20% Weight) - Dynamic Haversine Geodesics
            // -------------------------------------------------------------
            const providerLat = p.location?.lat;
            const providerLng = p.location?.lng;

            let distanceScore = 0;
            let distanceVal = -1;
            let computedDistance = `unknown distance (missing provider coordinates)`;

            if (providerLat === undefined || providerLat === null || providerLng === undefined || providerLng === null) {
                console.warn(`[evaluateAndScoreProvidersTool] Warning: Missing provider coordinates for provider ID: ${pid} (${p.name})`);
            } else {
                const latNum = Number(providerLat);
                const lngNum = Number(providerLng);
                
                if (isNaN(latNum) || isNaN(lngNum)) {
                    console.warn(`[evaluateAndScoreProvidersTool] Warning: Missing provider coordinates for provider ID: ${pid} (${p.name})`);
                } else {
                    distanceVal = haversine(
                        resolvedUserLat!,
                        resolvedUserLng!,
                        latNum,
                        lngNum
                    );

                    // Compute distance score with smooth exponential decay, capped at maximum 85
                    distanceScore = Math.round(Math.min(85, 100 * Math.exp(-distanceVal / 6)));
                    computedDistance = `${distanceVal.toFixed(1)} km away from ${normalizedLocationName}`;
                }
            }

            // -------------------------------------------------------------
            // FACTOR 2: Availability (20% Weight)
            // -------------------------------------------------------------
            const providerSched = schedules.find((s: any) => s.providerId === pid);
            const rawSlots = providerSched?.slots || [];
            
            // Filter only for available slots
            const availableSlots = rawSlots.filter((slot: any) => slot.status === "available" || slot.isAvailable);

            let matchedSlot = null;
            let availabilityScore = 0;

            if (availableSlots.length > 0) {
                // Search for slot matching BOTH date AND preferred time window
                const bestSlot = availableSlots.find((slot: any) => {
                    const isDateMatch = slot.date === targetDateISO;
                    if (!isDateMatch) return false;

                    const times = (slot.timeSlot || "").split("-");
                    if (times.length === 2) {
                        const startDec = parseTimeToDecimal(times[0]);
                        const endDec = parseTimeToDecimal(times[1]);
                        return targetDec >= startDec && targetDec <= endDec;
                    }
                    return false;
                });

                if (bestSlot) {
                    matchedSlot = {
                        slotId: bestSlot.slotId,
                        date: bestSlot.date,
                        timeSlot: bestSlot.timeSlot
                    };
                    availabilityScore = 100;
                } else {
                    // FALLBACK LOGIC:
                    // 1. Try to find a slot matching targetDate first
                    const dateOnlySlot = availableSlots.find((slot: any) => slot.date === targetDateISO);
                    // 2. Otherwise fall back to the absolute first available slot
                    const fallbackSlot = dateOnlySlot || availableSlots[0];

                    if (fallbackSlot) {
                        matchedSlot = {
                            slotId: fallbackSlot.slotId,
                            date: fallbackSlot.date,
                            timeSlot: fallbackSlot.timeSlot
                        };
                        availabilityScore = 50; // Partial score penalty
                    } else {
                        matchedSlot = null;
                        availabilityScore = 0;
                    }
                }
            }

            // Gather alternative available slots (excluding matched one)
            const alternativeSlots = availableSlots
                .filter((slot: any) => !matchedSlot || slot.slotId !== matchedSlot.slotId)
                .map((slot: any) => ({
                    slotId: slot.slotId,
                    date: slot.date,
                    timeSlot: slot.timeSlot
                }))
                .slice(0, 3); // limit to 3 alternatives

            // -------------------------------------------------------------
            // FACTOR 3: Rating Score (15% Weight)
            // -------------------------------------------------------------
            const rawRating = Number(p.rating) || 4.0;
            const ratingScore = (rawRating / 5) * 100;

            // -------------------------------------------------------------
            // FACTOR 4: Review Recency (10% Weight)
            // -------------------------------------------------------------
            const providerReviews = reviews.filter((r: any) => r.providerId === pid);
            let recencyFactor = 0.85; // neutral recency

            if (providerReviews.length > 0) {
                // Sort reviews by createdAt descending before selecting latest review
                const sortedReviews = [...providerReviews].sort((a: any, b: any) => {
                    return getReviewTime(b) - getReviewTime(a);
                });

                const latestReview = sortedReviews[0];
                const latestTime = getReviewTime(latestReview);
                
                if (latestTime > 0) {
                    const diffMs = Math.abs(Date.now() - latestTime);
                    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                    
                    if (diffDays <= 30) recencyFactor = 1.0;
                    else if (diffDays <= 90) recencyFactor = 0.85;
                    else recencyFactor = 0.6;
                }
            }
            const recencyScore = recencyFactor * 100;

            // -------------------------------------------------------------
            // FACTOR 5: Reliability Score (10% Weight)
            // -------------------------------------------------------------
            const reliabilityScore = Number(p.reliabilityScore) || 80;

            // -------------------------------------------------------------
            // FACTOR 6: Skill Match (10% Weight) - Category-Based and Partial Match Scoring
            // -------------------------------------------------------------
            const requestedCategory = getNormalizedCategory(pricingConfig?.serviceCategory || "");
            const providerCategories = (p.serviceCategories || []).map((cat: string) => getNormalizedCategory(cat));
            const providerSpecs = p.specializations || [];

            let skillMatchScore = 50; // default baseline match

            const hasExactCategoryMatch = providerCategories.some((cat: string) => cat === requestedCategory);

            if (hasExactCategoryMatch) {
                skillMatchScore = 100;
            } else {
                // Check specializations for partial matches
                for (const spec of providerSpecs) {
                    const normalizedSpec = getNormalizedCategory(spec);
                    if (normalizedSpec === requestedCategory || spec.toLowerCase().includes(requestedCategory)) {
                        skillMatchScore = 80;
                        break;
                    } else if (requestedCategory.includes(normalizedSpec) || requestedCategory.includes(spec.toLowerCase())) {
                        skillMatchScore = 60;
                        break;
                    }
                }
            }

            // -------------------------------------------------------------
            // FACTOR 7: Price Fit (5% Weight)
            // -------------------------------------------------------------
            let priceFitScore = 100;
            let priceEvaluation = "Within standard budget";

            const providerPriceRange = String(p.priceRange || "").toLowerCase();
            const configPriceRef = pricingConfig?.referencePrice || "medium";

            if (providerPriceRange === "premium" && configPriceRef !== "premium") {
                priceFitScore = 60;
                priceEvaluation = "Premium pricing";
            }

            // -------------------------------------------------------------
            // FACTOR 8: Cancellation Rate (5% Weight) - Normalized & Clamped
            // -------------------------------------------------------------
            let rawCancelRate = Number(p.cancellationRate);
            if (isNaN(rawCancelRate)) {
                rawCancelRate = 0.05; // default 5%
            }
            if (rawCancelRate > 1) {
                rawCancelRate = rawCancelRate / 100;
            }
            // Clamp between 0 and 1
            const normalizedCancelRate = Math.max(0, Math.min(1, rawCancelRate));
            const cancellationScore = (1 - normalizedCancelRate) * 100;

            // -------------------------------------------------------------
            // FACTOR 9: Workload (5% Weight)
            // -------------------------------------------------------------
            const maxJobs = Number(providerSched?.maxJobsPerDay) || 5;
            const currentBookings = Number(providerSched?.currentBookingsCount) || 0;
            let workloadScore = 100;
            if (currentBookings >= maxJobs) {
                workloadScore = 0;
            }

            // -------------------------------------------------------------
            // FINAL WEIGHTED SUM (0 to 100) - SUM OF ALL 9 SEPARATE FACTORS = 1.00 (100%)
            // -------------------------------------------------------------
            const wDistance = 0.20;
            const wAvailability = 0.20;
            const wRating = 0.15;
            const wRecency = 0.10;
            const wReliability = 0.10;
            const wSkill = 0.10;
            const wPrice = 0.05;
            const wCancellation = 0.05;
            const wWorkload = 0.05;

            const totalWeight = Number((wDistance + wAvailability + wRating + wRecency + wReliability + wSkill + wPrice + wCancellation + wWorkload).toFixed(2));
            console.log("Total weight =", totalWeight);

            // Ensure all factor scores are strictly normalized/clamped between 0 and 100
            const normalizedReliabilityScore = Math.max(0, Math.min(100, reliabilityScore));

            let finalScore = Math.round(
                (distanceScore * wDistance) +
                (availabilityScore * wAvailability) +
                (ratingScore * wRating) +
                (recencyScore * wRecency) +
                (normalizedReliabilityScore * wReliability) +
                (skillMatchScore * wSkill) +
                (priceFitScore * wPrice) +
                (cancellationScore * wCancellation) +
                (workloadScore * wWorkload)
            );

            // Optional safety rule: If skillMatchScore < 60, apply slight penalty multiplier (0.80)
            if (skillMatchScore < 60) {
                finalScore = Math.round(finalScore * 0.80);
            }

            // -------------------------------------------------------------
            // DEBUG LOGGING
            // -------------------------------------------------------------
            console.log(`[evaluateAndScoreProvidersTool] Provider ID: ${pid} (${p.name})`);
            console.log({
                targetDate,
                targetTime,
                parsedTime: targetDec,
                matchedSlot,
                alternativeSlots,
                userLat: resolvedUserLat,
                userLng: resolvedUserLng,
                providerLat,
                providerLng,
                distanceVal: `${distanceVal.toFixed(2)} km`,
                distanceScore
            });
            console.log("-------------------------------------------------------------");

            return {
                provider: p,
                score: finalScore,
                computedDistance,
                priceEvaluation,
                matchedSlot,
                alternativeSlots
            };
        });

        // Sort from highest score to lowest
        scoredList.sort((a, b) => b.score - a.score);

        return JSON.stringify(scoredList);
    },
    {
        name: "evaluate_and_score_providers",
        description: "Always call this LAST. Executes exact 9-factor mathematical weighting, slot matching, and coordinate proximity to return a sorted list of ranked providers.",
        schema: z.object({
            providers: z.array(z.any()).describe("List of candidate providers from Discovery Agent."),
            schedules: z.array(z.any()).describe("Raw schedules database records from fetch_provider_schedules."),
            reviews: z.array(z.any()).describe("Raw reviews database records from fetch_provider_reviews."),
            pricingConfig: z.any().describe("Pricing baseline config from fetch_pricing_reference."),
            targetLocation: z.string().describe("Target user location (e.g. Scheme 33)."),
            targetTime: z.string().optional().describe("User's preferred booking time window (e.g. 'morning')."),
            targetDate: z.string().optional().describe("User's preferred booking date relative or absolute (e.g. 'tomorrow')."),
            userLat: z.number().optional().describe("User's latitude coordinate."),
            userLng: z.number().optional().describe("User's longitude coordinate.")
        }),
    }
);

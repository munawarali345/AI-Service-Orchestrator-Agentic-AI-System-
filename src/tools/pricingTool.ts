import admin from "../config/firebase.config.js";

const db = admin.firestore();

/**
 * Fetch pricing config for a specific service category to serve as price reference
 */
export const getPricingConfig = async (serviceCategory: string) => {
    if (!serviceCategory) return null;
    
    const doc = await db.collection("pricingConfigs").doc(serviceCategory).get();
    if (doc.exists) {
        return { id: doc.id, ...doc.data() };
    }
    
    return null;
};

// Helper function to parse time strings like "10:30-11:30" or natural language into decimal hours
const parseTimeToDecimal = (timeStr: string): number => {
    try {
        const cleaned = (timeStr || "").trim().toLowerCase();
        if (cleaned.includes("subha") || cleaned.includes("subah") || cleaned.includes("morning")) return 9.0;
        if (cleaned.includes("dopahar") || cleaned.includes("noon") || cleaned.includes("afternoon")) return 13.0;
        if (cleaned.includes("sham") || cleaned.includes("evening")) return 17.0;
        if (cleaned.includes("raat") || cleaned.includes("night")) return 21.0;
        if (cleaned.includes("abhi") || cleaned.includes("urgent")) return new Date().getHours();

        const match = cleaned.match(/(\d+):(\d+)/);
        if (match) {
            let hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            if (cleaned.includes("pm") && hours < 12) hours += 12;
            else if (cleaned.includes("am") && hours === 12) hours = 0;
            return hours + minutes / 60;
        }
    } catch (e) {
        console.error("Error parsing time for pricing:", timeStr, e);
    }
    return 12.0; // default to noon
};

/**
 * Dynamic Pricing Engine
 */
export const calculateDynamicPrice = (
    pricingConfig: any, 
    distanceKm: number, 
    targetTime: string, 
    urgencyLevel: string = "normal", 
    complexityLevel: string = "standard", 
    budget: { min: number, max: number } | null = null
) => {
    if (!pricingConfig) {
        return { 
            basePrice: 0, complexityCost: 0, urgencyCost: 0, distanceCost: 0, peakCost: 0, totalPrice: 0, explanation: [], budgetFit: "unknown"
        };
    }

    const basePrice = pricingConfig.basePrice || 1000;
    
    // 1. Distance Cost
    const distanceCost = Math.round(distanceKm * (pricingConfig.distanceSurcharge || 50));
    
    // 2. Multipliers
    const complexityMultiplier = (pricingConfig.complexityMultiplier && pricingConfig.complexityMultiplier[complexityLevel]) ? pricingConfig.complexityMultiplier[complexityLevel] : 1.0;
    const urgencyMultiplier = (pricingConfig.urgencyMultiplier && pricingConfig.urgencyMultiplier[urgencyLevel]) ? pricingConfig.urgencyMultiplier[urgencyLevel] : 1.0;
    
    let demandMultiplier = 1.0;
    const timeDec = parseTimeToDecimal(targetTime);

    if (pricingConfig.peakHours && Array.isArray(pricingConfig.peakHours)) {
        for (const peak of pricingConfig.peakHours) {
            const parts = peak.split("-");
            if (parts.length === 2) {
                const start = parseTimeToDecimal(parts[0]);
                const end = parseTimeToDecimal(parts[1]);
                if (timeDec >= start && timeDec <= end) {
                    demandMultiplier = pricingConfig.demandSurcharge || 1.2;
                    break;
                }
            }
        }
    }

    // Step-by-step cost breakdown (Compounding as per user formula)
    let currentTotal = basePrice;
    
    const complexityCost = Math.round((currentTotal * complexityMultiplier) - currentTotal);
    currentTotal += complexityCost;
    
    const urgencyCost = Math.round((currentTotal * urgencyMultiplier) - currentTotal);
    currentTotal += urgencyCost;

    const peakCost = Math.round((currentTotal * demandMultiplier) - currentTotal);
    currentTotal += peakCost;

    // 4. Final Equation
    const totalPrice = Math.round(currentTotal + distanceCost);

    // Explanations
    const explanation = [];
    if (distanceCost > 0) explanation.push(`Provider is ${distanceKm.toFixed(1)}km away so distance surcharge applied.`);
    if (urgencyCost > 0) explanation.push(`Urgent booking surcharge applied (${urgencyLevel}).`);
    if (peakCost > 0) explanation.push(`Peak hour demand pricing applied.`);
    if (complexityCost > 0) explanation.push(`Complexity surcharge applied (${complexityLevel}).`);

    // Budget check
    let budgetFit = "unknown";
    if (budget && budget.min !== undefined && budget.max !== undefined) {
        if (totalPrice >= budget.min && totalPrice <= budget.max) {
            budgetFit = "within_budget";
        } else if (totalPrice < budget.min) {
            budgetFit = "under_budget";
        } else if (totalPrice > budget.max) {
            budgetFit = "over_budget";
        }
    }

    return {
        basePrice,
        complexityCost,
        urgencyCost,
        distanceCost,
        peakCost,
        totalPrice,
        explanation,
        budgetFit
    };
};

import admin from "../config/firebase.config.js";
import { randomUUID } from "crypto";

const db = admin.firestore();

// ---------------------------------------------------------
// Helper Functions for Data Generation
// ---------------------------------------------------------
const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number) =>
    Number((Math.random() * (max - min) + min).toFixed(2));

const sample = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const sampleMultiple = <T>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// Seed metadata injected into every document
const SEED_METADATA = {
    isSynthetic: true,
    source: "seed",
    seedVersion: 1
};

// ---------------------------------------------------------
// Mock Data Dictionaries (Pakistan Localized)
// ---------------------------------------------------------
const CATEGORIES = ["electrician", "beautician", "decoration", "cleaning", "plumbing"];

const SPECIALIZATIONS: Record<string, string[]> = {
    electrician: ["wiring", "lighting", "repairs", "installation", "appliances", "UPS repair"],
    beautician: ["makeup", "hair styling", "skincare", "bridal", "mehndi"],
    decoration: ["wedding", "birthday", "corporate events", "floral", "balloons"],
    cleaning: ["deep cleaning", "office cleaning", "home cleaning", "sofa cleaning"],
    plumbing: ["leaks", "pipes", "installations", "clogs", "water heater/geyser"]
};

const FIRST_NAMES = ["Ahmed", "Ali", "Muhammad", "Ayesha", "Fatima", "Saad", "Hina", "Bilal", "Zainab", "Hamza", "Usman", "Sara"];
const LAST_NAMES = ["Khan", "Raza", "Usman", "Ali", "Hassan", "Tariq", "Ahmed", "Shah", "Malik", "Sheikh"];

const LANGUAGES = ["Urdu", "English"];

const COMMENTS = [
    "Bohat acha kaam kiya, highly recommended!",
    "Time pe service mili, satisfied.",
    "Thora late aya lekin kaam acha tha.",
    "Very professional and polite. Great work.",
    "Maza aa gaya, shandar service thi.",
    "Quick and efficient work, rate bhi theek tha.",
    "Not completely satisfied, kaam main behtari ki zaroorat hai.",
    "Fantastic experience from start to finish. 5 stars!",
    "Affordable, reliable, and trustworthy. Zabardast!",
    "Did a thorough job, left the place very clean. Shukriya!"
];

const CATEGORY_PRICES: Record<string, { min: number; max: number }> = {
    electrician: { min: 1500, max: 5000 },
    beautician: { min: 2000, max: 8000 },
    cleaning: { min: 1000, max: 4000 },
    plumbing: { min: 1500, max: 6000 },
    decoration: { min: 5000, max: 25000 }
};

// ---------------------------------------------------------
// 1. Seed Pricing Configs
// ---------------------------------------------------------
async function seedPricingConfigs() {
    console.log("Seeding Pricing Configs...");
    const batch = db.batch();

    for (const category of CATEGORIES) {
        const ref = db.collection("pricingConfigs").doc(category);
        const priceConfig = CATEGORY_PRICES[category];

        const data = {
            serviceCategory: category,
            basePrice: randomInt(priceConfig.min, priceConfig.max),
            urgencyMultiplier: {
                normal: 1.0,
                urgent: 1.3,
                emergency: 1.8
            },
            complexityMultiplier: {
                simple: 1.0,
                medium: 1.2,
                complex: 1.5
            },
            distanceSurcharge: 100,
            demandSurcharge: randomFloat(1.0, 1.5),
            peakHours: ["08:00", "09:00", "18:00", "19:00"],
            ...SEED_METADATA
        };

        batch.set(ref, data);
    }

    await batch.commit();
    console.log("Pricing Configs Seeded.");
}

// ---------------------------------------------------------
// 2, 3, 4. Seed Providers, Schedules, and Reviews
// ---------------------------------------------------------
async function seedProvidersAndRelated() {
    console.log("Seeding Providers, Schedules, and Reviews...");

    const karachiAreas = [
        "Gulshan-e-Iqbal", "Gulistan-e-Johar", "Scheme 33", "Safoora",
        "Gulzar-e-Hijri", "University Road", "Hassan Square", "Bahadurabad",
        "Tariq Road", "PECHS", "Shahrah-e-Faisal", "Karsaz"
    ];

    let count = 0;
    const totalProviders = karachiAreas.length * CATEGORIES.length;

    for (const selectedArea of karachiAreas) {
        for (const cat of CATEGORIES) {
            count++;

            const providerId = `provider_${randomUUID()}`;
            const ownerName = `${sample(FIRST_NAMES)} ${sample(LAST_NAMES)}`;

            // ✅ FIX: UNIQUE NAME (prevents duplicate UI confusion)
            const companyName = `${ownerName} - ${cat} - ${selectedArea} Services`;

            const providerSpecializations =
                sampleMultiple(SPECIALIZATIONS[cat], randomInt(1, 3));

            const minPrice = CATEGORY_PRICES[cat].min;
            const maxPrice = CATEGORY_PRICES[cat].max;

            const prefix = randomInt(300, 349);
            const numberStr = randomInt(1000000, 9999999);
            const phone = `+92 ${prefix} ${numberStr}`;

            const providerData = {
                id: providerId,
                name: companyName,
                ownerName,
                phone,
                serviceCategories: [cat],
                location: {
                    address: `House ${randomInt(1, 150)}, Street ${randomInt(1, 20)}, ${selectedArea}`,
                    area: selectedArea,
                    lat: randomFloat(24.75, 24.95),
                    lng: randomFloat(66.95, 67.15),
                    city: "Karachi"
                },
                rating: randomFloat(3.5, 5.0),
                totalJobs: randomInt(10, 500),
                reliabilityScore: randomInt(80, 100),
                cancellationRate: randomFloat(0.0, 0.15),
                avgResponseTime: randomInt(5, 60),
                priceRange: {
                    min: minPrice,
                    max: maxPrice,
                    currency: "PKR"
                },
                specializations: providerSpecializations,
                languages: LANGUAGES,
                isVerified: Math.random() > 0.2,
                joinedAt: admin.firestore.Timestamp.fromDate(
                    new Date(Date.now() - randomInt(1, 365) * 86400000)
                ),
                ...SEED_METADATA
            };

            await db.collection("providers").doc(providerId).set(providerData);

            // ---------------- Reviews ----------------
            const numReviews = randomInt(3, 5);
            const reviewsBatch = db.batch();

            for (let r = 0; r < numReviews; r++) {
                const reviewId = `review_${randomUUID()}`;
                reviewsBatch.set(db.collection("reviews").doc(reviewId), {
                    providerId,
                    userId: `user_${randomUUID()}`,
                    rating: randomInt(3, 5),
                    comment: sample(COMMENTS),
                    serviceCategory: cat,
                    createdAt: admin.firestore.Timestamp.fromDate(
                        new Date(Date.now() - randomInt(1, 30) * 86400000)
                    ),
                    ...SEED_METADATA
                });
            }

            await reviewsBatch.commit();

            // ---------------- Schedules ----------------
            const scheduleBatch = db.batch();
            const slotTimes = [
                "09:00-10:00", "10:30-11:30", "12:00-13:00",
                "14:00-15:00", "15:30-16:30", "17:00-18:00",
                "18:30-19:30"
            ];

            const statuses = [
                "available", "available", "available",
                "available", "available", "available",
                "available", "booked", "booked", "blocked"
            ];

            const parentScheduleRef = db.collection("providerSchedules").doc(providerId);

            scheduleBatch.set(parentScheduleRef, {
                providerId,
                maxJobsPerDay: randomInt(4, 10),
                currentBookingsCount: randomInt(0, 5),
                createdAt: admin.firestore.Timestamp.now(),
                ...SEED_METADATA
            });

            for (let day = 0; day < 7; day++) {
                const dateObj = new Date();
                dateObj.setDate(dateObj.getDate() + day);
                const dateStr = dateObj.toISOString().split("T")[0];

                for (const timeSlot of slotTimes) {
                    const slotId = `${dateStr}_${timeSlot}`;

                    scheduleBatch.set(
                        parentScheduleRef.collection("slots").doc(slotId),
                        {
                            providerId,
                            date: dateStr,
                            timeSlot,
                            status: sample(statuses),
                            isAvailable: true,
                            estimatedTravelTime: randomInt(10, 45),
                            bookingId: null,
                            travelBufferBefore: 30,
                            travelBufferAfter: 30,
                            ...SEED_METADATA
                        }
                    );
                }
            }

            await scheduleBatch.commit();

            console.log(
                `Seeded ${count}/${totalProviders}: ${companyName}`
            );
        }
    }
}

// ---------------------------------------------------------
// Main
// ---------------------------------------------------------
async function main() {
    try {
        console.log("Starting Firestore Seeding...");
        await seedPricingConfigs();
        await seedProvidersAndRelated();
        console.log("Seeding completed!");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

main();

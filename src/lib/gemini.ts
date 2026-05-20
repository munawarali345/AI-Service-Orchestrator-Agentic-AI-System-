import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
}

export const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
        headers: {
            "User-Agent": "aistudio-build",
        },
    },
});

export const GEMINI_MODELS = {
    FLASH: "gemini-2.0-flash",
    PRO: "gemini-2.0-flash", // Switching PRO to flash-2.0 as well to resolve quota issues reported by user
};
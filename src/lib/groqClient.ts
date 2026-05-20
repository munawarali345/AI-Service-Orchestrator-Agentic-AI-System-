import Groq from "groq-sdk";

// Groq client - api key is now guaranteed to exist
const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export default client;


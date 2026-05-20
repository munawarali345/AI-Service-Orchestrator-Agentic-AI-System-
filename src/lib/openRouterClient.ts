import { OpenRouter } from '@openrouter/sdk';

const OpenRouterClient = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export default OpenRouterClient;
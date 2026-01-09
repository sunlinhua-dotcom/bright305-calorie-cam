const { GoogleGenerativeAI } = require("@google/generative-ai");

async function list() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // The SDK strictly doesn't have a listModels method on the main class in some versions,
    // but let's try a raw fetch to be sure what is available for this key.

    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error structure:", data);
        }
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

list();

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Testing gemini-1.5-flash...");
        // 简单的文本测试
        await model.generateContent("Test");
        console.log("gemini-1.5-flash WORKS!");
    } catch (e) {
        console.log("gemini-1.5-flash FAILED:", e.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        console.log("Testing gemini-pro-vision...");
        // Vision model needs image usually but let's see if it initializes
        console.log("gemini-pro-vision initialized (cannot test without image easily in script)");
    } catch (e) {
        console.log("gemini-pro-vision FAILED:", e.message);
    }
}

listModels();

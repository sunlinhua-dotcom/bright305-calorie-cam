const OpenAI = require("openai");
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
    console.log("🔍 Testing connection to:", process.env.GEMINI_BASE_URL);

    const client = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: process.env.GEMINI_BASE_URL,
    });

    const modelsToTry = [
        "gemini-pro",
        "gemini-1.5-pro",
        "gemini-pro-vision",
        "gemini-1.5-flash",
        "gemini-2.0-flash-exp",
        "gemini-3-flash-preview"
    ];

    console.log("🚀 Starting model compatibility test...");

    for (const modelName of modelsToTry) {
        try {
            process.stdout.write(`⏳ Testing '${modelName}'... `);
            const response = await client.chat.completions.create({
                model: modelName,
                messages: [{ role: "user", content: "Hi" }],
                max_tokens: 10
            });

            console.log(`✅ OK!`);
            console.log(`   Response: "${response.choices[0].message.content}"`);
            console.log(`\n🎉 GREAT NEWS: Please use model name: "${modelName}" in your code.`);
            return;
        } catch (error) {
            console.log("❌ Fail");
            if (error.response && error.response.data) {
                console.log("   Details:", JSON.stringify(error.response.data.error || error.response.data));
            } else {
                console.log("   Details:", error.message);
            }
        }
    }
    console.log("\n😭 All models failed.");
}

test();

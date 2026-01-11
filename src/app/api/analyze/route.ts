import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    const baseUrl = process.env.GEMINI_BASE_URL || process.env.EXPO_PUBLIC_GEMINI_BASE_URL;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const { image, mimeType } = await req.json();
    // Remove prefix if present, though OpenAI mostly wants full data URI or URL.
    // For OpenAI inline image, it typically accepts `data:image/jpeg;base64,...`
    // For Google SDK, it wants raw base64.
    // Let's normalize variables.
    const base64Raw = image.replace(/^data:image\/\w+;base64,/, "");
    const mime = mimeType || "image/jpeg";

    // Prompt configuration
    const systemPrompt = `
        你是一个专业的营养师和五星级大厨。请分析这张图片中的食物。
        请务必以【严格的 JSON 格式】返回数据。不需要Markdown代码块。

        返回结构如下：
        {
            "foodName": "食物名称",
            "calories": 0, // 整数
            "macros": {
                "protein": "0g",
                "carbs": "0g",
                "fat": "0g"
            },
            "healthScore": 0, // 1-10
            "description": "30字以内的营养简评",
            "recipe": {
                "ingredients": ["食材1", "食材2"],
                "steps": ["步骤1", "步骤2"],
                "tips": "一句话烹饪技巧"
            }
        }
        请确保使用简体中文。如果不是食物，返回 { "error": "NOT_FOOD" }。
        `;

    let jsonString = "";

    // Check if using Third-Party OpenAI Compatible Service (starts with sk-)
    if (apiKey.startsWith("sk-")) {
      console.log("Using OpenAI Compatible Client. BaseURL:", baseUrl || "Default");

      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: baseUrl || "https://api.openai.com/v1",
        dangerouslyAllowBrowser: true
      });

      const response = await openai.chat.completions.create({
        model: "gemini-3-flash-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: systemPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mime};base64,${base64Raw}`,
                },
              },
            ],
          },
        ],
        max_tokens: 3000, // Increased to prevent truncation
        temperature: 0.2, // Lower temperature for more deterministic JSON
        // response_format: { type: "json_object" } // Some third-party proxies might not support this, so let's keeping it commented or rely on prompt. 
        // Actually, for "gemini-3-flash-preview" via OpenAI proxy, explicit json mode is often safer if supported.
        // Let's try without forcing the parameter first to avoid 400 errors from strict proxies, 
        // relying on the stronger prompt and cleanup logic.
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No content returned from API");
      jsonString = content;

    } else {
      // Use Official Google SDK
      console.log("Using Official Google SDK");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const result = await model.generateContent([
        systemPrompt,
        {
          inlineData: {
            data: base64Raw,
            mimeType: mime,
          },
        },
      ]);
      jsonString = result.response.text();
    }

    // Clean up markdown code blocks if present
    jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();

    // Attempt to extract purely the JSON object if there is extra text
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    console.log("Cleaned JSON String:", jsonString);

    let data;
    try {
      data = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Standard JSON.parse failed. Trying relaxed parsing approach...");
      // Fallback for sloppy JSON
      try {
        // eslint-disable-next-line no-new-func
        data = new Function("return " + jsonString)();
      } catch (evalError) {
        throw new Error("Failed to parse AI response as JSON: " + jsonString.slice(0, 100) + "...");
      }
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Analysis Error Details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}

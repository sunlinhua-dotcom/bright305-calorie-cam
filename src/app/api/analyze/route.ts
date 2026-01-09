import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API Key not configured" },
        { status: 500 }
      );
    }

    const { image, mimeType } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Convert base64 string to a format Gemini accepts
    // Expected incoming image is base64 string without data:image/xxx;base64, prefix if possible, or handle it
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    // 响应用户需求，切换至最新的 Gemini 3.0 Flash Preview 模型
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
    你是一个专业的营养师和五星级大厨。请分析这张图片中的食物。
    请以严格的 JSON 格式返回以下信息（不要包裹在 markdown 代码块中，直接返回 JSON 对象）：
    
    1. foodName: 食物名称 (String)
    2. calories: 估算的总热量 (Number, 单位 kcal)
    3. macros: 宏观营养素对象
       - protein: 蛋白质 (String, 如 "20g")
       - carbs: 碳水化合物 (String)
       - fat: 脂肪 (String)
    4. healthScore: 健康评分 1-10 (Number)
    5. description: wrap-up 简评，关于它的营养价值 (String, max 30 words)
    6. recipe: 简单的制作做法/食谱对象
       - ingredients: 主要食材列表 (Array of Strings)
       - steps: 制作步骤 (Array of Strings)
       - tips: 烹饪或健康小贴士 (String)

    请确保所有文本内容使用【简体中文】。如果图片中不是食物，请返回一个特定的错误 JSON: { "error": "NOT_FOOD" }。
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType || "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log("Gemini Raw Response:", text);

    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const data = JSON.parse(cleanText);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

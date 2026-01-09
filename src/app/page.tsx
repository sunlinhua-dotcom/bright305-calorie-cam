"use client";

import React, { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import FoodAnalysis from "@/components/FoodAnalysis";
import { Sparkles, ScanLine, Skull } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);

  const handleImageSelected = async (base64: string, mimeType: string) => {
    setImage(base64);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64,
          mimeType: mimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      if (data.error === "NOT_FOOD") {
        setError("这看起来不像食物！请拍摄真正的美食 🍔");
        setAnalysis(null);
      } else {
        setAnalysis(data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setImage(null);
    setError(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6 md:p-12 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none" />

      {/* Header */}
      <header className="z-10 flex flex-col items-center mb-12 text-center animate-float">
        <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm font-medium tracking-wide text-gray-300">AI Powered Nutritionist</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          BRIGHT305 <span className="text-[var(--primary)]">卡路里识别</span>
        </h1>
        <p className="max-w-md text-gray-400 text-lg">
          只需一张照片，立刻获取热量数据、营养成分与专属食谱。
        </p>
      </header>

      {/* Main Content Area */}
      <div className="z-10 w-full flex flex-col items-center transition-all duration-500 ease-in-out">

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200">
            <Skull className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={reset} className="ml-4 underline text-sm hover:text-white">重试</button>
          </div>
        )}

        {loading ? (
          <div className="glass-panel p-12 flex flex-col items-center animate-pulse">
            <ScanLine className="w-16 h-16 text-[var(--primary)] animate-bounce mb-6" />
            <h3 className="text-2xl font-bold mb-2">正在分析美食成分...</h3>
            <p className="text-gray-400">正在计算卡路里并生成食谱</p>
          </div>
        ) : analysis ? (
          <FoodAnalysis
            data={analysis}
            imageUrl={image!}
            onReset={reset}
          />
        ) : (
          <ImageUploader
            onImageSelected={handleImageSelected}
            isAnalyzing={loading}
          />
        )}

      </div>

      <footer className="mt-auto pt-12 text-gray-600 text-sm">
        BY BRIGHT(GEMINI)
      </footer>
    </main>
  );
}

import React from "react";
import { ChevronLeft, Save, RefreshCw } from "lucide-react";

interface FoodAnalysisProps {
    data: any;
    imageUrl: string;
    onReset: () => void;
    onSave?: () => void; // Optional save handler if we separate save from auto-save
}

export default function FoodAnalysis({ data, imageUrl, onReset, onSave }: FoodAnalysisProps) {
    if (!data) return null;

    return (
        <div className="flex flex-col h-full bg-white animate-fade-in relative">

            {/* 1. Header (Custom for this view) */}
            <div className="flex items-center px-4 py-4 mb-2">
                <button onClick={onReset} className="p-2 -ml-2 text-gray-800">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="flex-1 text-center text-lg font-bold text-gray-800 mr-8">分析结果</h1>
            </div>

            {/* 2. Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-32">

                {/* Main Image */}
                <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-sm mb-6 bg-gray-100">
                    <img src={imageUrl} alt="Food" className="w-full h-full object-cover" />
                </div>

                {/* Title & Calories */}
                <div className="text-center mb-8">
                    <div className="inline-block bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
                        AI 识别
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.foodName}</h2>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-black text-gray-900">{data.calories}</span>
                        <span className="text-gray-500 font-medium">千卡</span>
                    </div>
                </div>

                {/* Macros Circles */}
                <div className="flex justify-between px-4 mb-8">
                    <MacroCircle label="蛋白质" value={data.macros.protein} color="text-blue-500" borderColor="border-blue-500" />
                    <MacroCircle label="碳水" value={data.macros.carbs} color="text-green-500" borderColor="border-green-500" />
                    <MacroCircle label="脂肪" value={data.macros.fat} color="text-yellow-500" borderColor="border-yellow-500" />
                </div>

            </div>

            {/* 3. Bottom Actions (Fixed) */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-6 pb-8 flex gap-4">
                <button className="flex-1 bg-[var(--primary)] text-white font-bold py-4 rounded-full shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center gap-2" onClick={onSave || onReset}>
                    <Save size={20} /> 保存到日志
                </button>
                <button onClick={onReset} className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-full active:scale-95 transition-transform">
                    重新拍摄
                </button>
            </div>

        </div>
    );
}

function MacroCircle({ label, value, color, borderColor }: any) {
    // Extract number for display
    return (
        <div className="flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full border-4 ${borderColor} flex items-center justify-center mb-2 bg-white`}>
                <div className="text-center">
                    <span className={`block text-lg font-bold ${color}`}>{parseFloat(value)}</span>
                    <span className="text-[10px] text-gray-400">克</span>
                </div>
            </div>
            <span className="text-sm font-bold text-gray-600">{label}</span>
        </div>
    )
}

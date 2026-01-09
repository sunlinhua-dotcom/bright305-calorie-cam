import React from "react";
import { Flame, Activity, ChevronsRight, Info, Utensils } from "lucide-react";

interface MacroProps {
    label: string;
    value: string;
    color: string;
}

const MacroPill = ({ label, value, color }: MacroProps) => (
    <div className="glass-panel p-4 flex flex-col items-center justify-center gap-2" style={{ borderColor: `${color}40`, background: `${color}10` }}>
        <span className="text-gray-400 text-sm uppercase tracking-wider font-bold">{label}</span>
        <span className="text-xl font-bold text-white">{value}</span>
    </div>
);

interface AnalysisData {
    foodName: string;
    calories: number;
    macros: {
        protein: string;
        carbs: string;
        fat: string;
    };
    healthScore: number;
    description: string;
    recipe: {
        ingredients: string[];
        steps: string[];
        tips: string;
    };
}

interface FoodAnalysisProps {
    data: AnalysisData;
    imageUrl: string;
    onReset: () => void;
}

export default function FoodAnalysis({ data, imageUrl, onReset }: FoodAnalysisProps) {
    return (
        <div className="w-full max-w-[800px] animate-fade-in flex flex-col gap-6">

            {/* Header Card Re-imagined */}
            <div className="glass-panel overflow-hidden p-0">
                {/* Full Width Image Area */}
                <div className="relative w-full h-48 md:h-64 bg-black/20">
                    <img src={imageUrl} alt="Food" className="w-full h-full object-cover" />

                    {/* Health Score Badge (Floating Top Right) */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center gap-2">
                        <span className="text-[10px] text-gray-300 uppercase tracking-wider">健康分</span>
                        <span className={`text-lg font-bold ${data.healthScore >= 7 ? 'text-[var(--primary)]' : data.healthScore >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {data.healthScore}
                        </span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
                            {data.foodName}
                        </h2>
                        {/* Calorie Pill */}
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full w-fit mt-2"
                            style={{
                                backgroundColor: 'var(--primary)',
                                color: 'black',
                                boxShadow: '0 0 20px rgba(157,255,0,0.2)'
                            }}
                        >
                            <Flame className="w-4 h-4 fill-black stroke-black" />
                            <span className="text-xl font-bold">{data.calories}</span>
                            <span className="text-xs font-bold opacity-75 pt-[2px]">kcal</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4">
                <MacroPill label="蛋白质" value={data.macros.protein} color="#3b82f6" />
                <MacroPill label="碳水" value={data.macros.carbs} color="#eab308" />
                <MacroPill label="脂肪" value={data.macros.fat} color="#ef4444" />
            </div>

            {/* Description */}
            <div className="glass-panel p-6">
                <div className="flex items-center gap-2 mb-3 text-gray-300">
                    <Info className="w-5 h-5" />
                    <span className="font-bold">AI 营养简评</span>
                </div>
                <p className="text-gray-300 leading-relaxed text-lg">
                    {data.description}
                </p>
            </div>

            {/* Recipe */}
            <div className="glass-panel p-6">
                <div className="flex items-center gap-2 mb-6 text-[var(--secondary)]">
                    <Utensils className="w-6 h-6" />
                    <h3 className="text-xl font-bold m-0">建议做法</h3>
                </div>

                <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 tracking-wider">食材准备</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.recipe.ingredients.map((ing, i) => (
                            <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm border border-white/10">
                                {ing}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 tracking-wider">制作步骤</h4>
                    <div className="space-y-4">
                        {data.recipe.steps.map((step, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)] text-black flex items-center justify-center font-bold text-sm mt-1">
                                    {i + 1}
                                </div>
                                <p className="text-gray-300 flex-1 leading-relaxed">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {data.recipe.tips && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-sm text-gray-400 italic">
                            💡 小贴士: {data.recipe.tips}
                        </p>
                    </div>
                )}
            </div>

            <button onClick={onReset} className="mx-auto text-gray-500 hover:text-white transition-colors pb-12 flex items-center gap-2">
                <ChevronsRight className="w-4 h-4" /> 识别下一道菜
            </button>

        </div>
    );
}

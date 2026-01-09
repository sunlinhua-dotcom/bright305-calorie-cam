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

            {/* Header Card */}
            <div className="glass-panel p-4 flex flex-row gap-4 items-center justify-between">

                {/* Left: Thumbnail & Info */}
                <div className="flex items-center gap-4 overflow-hidden">
                    <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-xl overflow-hidden border-2 border-white/10 shrink-0">
                        <img src={imageUrl} alt="Food" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col justify-center text-left">
                        <h2 className="text-xl md:text-3xl font-bold text-white truncate max-w-[150px] md:max-w-none">{data.foodName}</h2>
                        <div className="flex items-center gap-1 text-[var(--primary)]">
                            <Flame className="w-4 h-4 md:w-6 md:h-6 fill-[var(--primary)]" />
                            <span className="text-2xl md:text-4xl font-extrabold">{data.calories}</span>
                            <span className="text-xs md:text-lg font-medium opacity-80 pt-1">kcal</span>
                        </div>
                    </div>
                </div>

                {/* Right: Health Score */}
                <div className="flex flex-col items-center justify-center pl-2 border-l border-white/10 shrink-0 min-w-[60px]">
                    <span className="text-[10px] md:text-xs text-gray-400 mb-0 md:mb-1">健康分</span>
                    <div className={`text-2xl md:text-3xl font-bold ${data.healthScore >= 7 ? 'text-[var(--primary)]' : data.healthScore >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {data.healthScore}
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

import React from "react";
import { Clock, Flame, ChevronRight, Trash2 } from "lucide-react";

interface HistoryItem {
    id: string;
    foodName: string;
    calories: number;
    date: string;
    imageUrl: string;
    macros: {
        protein: string;
        carbs: string;
        fat: string;
    }
}

interface HistoryViewProps {
    history: HistoryItem[];
    onClear: () => void;
}

export default function HistoryView({ history, onClear }: HistoryViewProps) {
    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-800 font-bold mb-2 text-lg">暂无记录</h3>
                <p className="text-gray-500 text-sm">去拍摄你的第一顿美食吧！</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md mx-auto pb-24 px-4 pt-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-800">饮食足迹</h2>
                <button onClick={onClear} className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1">
                    <Trash2 size={12} /> 清空
                </button>
            </div>

            <div className="space-y-4">
                {history.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-3 flex gap-4 card-shadow hover:shadow-lg transition-shadow cursor-pointer group">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0 overflow-hidden relative border border-gray-100">
                            <img src={item.imageUrl} alt={item.foodName} className="w-full h-full object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-gray-900 font-bold truncate pr-4 text-lg">{item.foodName}</h3>
                                <p className="text-gray-400 text-xs mt-1">{item.date}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[var(--primary)] bg-green-50 px-2 py-0.5 rounded-full">
                                    <Flame size={12} className="fill-[var(--primary)]" />
                                    <span className="text-sm font-black">{item.calories}</span>
                                    <span className="text-[10px] font-bold opacity-70">Kcal</span>
                                </div>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center justify-center pr-2">
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-[var(--primary)] transition-colors" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

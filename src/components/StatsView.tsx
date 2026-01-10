import React, { useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface StatsViewProps {
    history: any[];
}

export default function StatsView({ history }: StatsViewProps) {
    const [viewMode, setViewMode] = useState<"week" | "month">("week");

    // --- DATA PROCESSING ---
    const chartData = useMemo(() => {
        // 1. Init last 7 days map
        const days: { key: string; label: string; calories: number; height: number; }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString(); // e.g., 2024/5/20
            // Format for x-axis (e.g., "5/20" or "Mon")
            const label = `${d.getMonth() + 1}/${d.getDate()}`;
            days.push({ key, label, calories: 0, height: 0 });
        }

        // 2. Fill with history data
        history.forEach((item) => {
            // Assuming item.date is user's locale string, logic matches simply by string
            // In real app, better to work with ISO timestamps. 
            // Here we assume item.date matches d.toLocaleDateString format for simplicity in MVP.
            const dayStat = days.find(d => d.key === item.date);
            if (dayStat) {
                dayStat.calories += parseInt(item.calories) || 0;
            }
        });

        // 3. Calculate Heights (Max = 2500 or Actual Max)
        const maxCal = Math.max(...days.map(d => d.calories), 2000); // Baseline 2000
        days.forEach(d => {
            d.height = Math.round((d.calories / maxCal) * 100);
        });

        return days;
    }, [history]);

    // Today's stats
    const todayKey = new Date().toLocaleDateString();
    const todayCalories = chartData.find(d => d.key === todayKey)?.calories || 0;
    const targetCalories = 2000;

    return (
        <div className="w-full max-w-md mx-auto pb-24 px-4 pt-6 animate-fade-in">
            {/* Header & Toggle */}
            <div className="flex flex-col items-center mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">饮食统计</h2>
                <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                    <button
                        className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                        onClick={() => setViewMode("week")}
                    >
                        近7日
                    </button>
                    <button
                        className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                        onClick={() => setViewMode("month")}
                    >
                        按月
                    </button>
                </div>
            </div>

            {/* Date Picker (Mock) */}
            <div className="flex items-center justify-between text-gray-500 mb-6 px-2">
                <ChevronLeft size={20} />
                <div className="flex items-center gap-2 font-medium text-gray-800">
                    <Calendar size={16} />
                    <span>2026年1月</span>
                </div>
                <ChevronRight size={20} />
            </div>

            {/* Today's Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-gray-500 text-sm font-bold">今日总摄入</h3>
                    <div className="text-right">
                        <span className="text-3xl font-black text-gray-900">{todayCalories}</span>
                        <span className="text-xs text-gray-400 font-medium ml-1">千卡</span>
                    </div>
                </div>

                {/* Progress */}
                <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden flex items-center px-1">
                    <div
                        className="h-2 bg-[var(--primary)] rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((todayCalories / targetCalories) * 100, 100)}%` }}
                    />
                </div>

                <div className="flex justify-between mt-2 text-xs font-medium text-gray-400">
                    <span>0</span>
                    <span>目标: {targetCalories}</span>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-gray-800 font-bold mb-6">每日卡路里趋势</h3>

                <div className="h-48 flex items-end justify-between gap-2">
                    {chartData.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                            {/* Tooltip (Hover) */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded mb-1 whitespace-nowrap z-10">
                                {day.calories} kcal
                            </div>

                            {/* The Bar */}
                            <div className="w-full bg-gray-50 rounded-t-lg relative flex items-end overflow-hidden group-hover:bg-gray-100 transition-colors" style={{ height: '100%' }}>
                                <div
                                    className={`w-full rounded-t-lg transition-all duration-1000 ease-out ${day.key === todayKey ? 'bg-[var(--primary)]' : 'bg-[#81C784]'
                                        }`}
                                    style={{ height: `${day.height}%` }}
                                />
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] font-bold ${day.key === todayKey ? 'text-gray-900' : 'text-gray-400'}`}>
                                {day.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

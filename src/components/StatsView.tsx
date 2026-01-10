import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StatsViewProps {
    history: any[];
}

export default function StatsView({ history }: StatsViewProps) {
    const [viewMode, setViewMode] = useState<"week" | "month">("week");

    // --- DATA PROCESSING ---
    const chartData = useMemo(() => {
        // 1. Determine range based on viewMode
        const daysToShow = viewMode === "week" ? 7 : 30;

        const days: { key: string; label: string; calories: number; height: number; fullDate: string }[] = [];

        // Helper to normalize date to YYYY/M/D for comparison
        // We try to match history item's date string loosely
        const normalizeDate = (dateStr: string) => {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr; // Fallback to raw string if parse fails
            return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
        };

        for (let i = daysToShow - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);

            // Key for matching
            const key = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;

            // Label for display
            const label = `${d.getMonth() + 1}/${d.getDate()}`;

            days.push({ key, label, calories: 0, height: 0, fullDate: d.toDateString() });
        }

        // 2. Fill with history data
        history.forEach((item) => {
            // Normalize history item date
            const itemKey = normalizeDate(item.date);

            const dayStat = days.find(d => d.key === itemKey);
            if (dayStat) {
                dayStat.calories += parseInt(item.calories) || 0;
            }
        });

        // 3. Calculate Heights (Fixed Scale Max = 2500 for consistency)
        // If user eats > 2500, bar maxes out but tooltip shows real number
        const MAX_Y = 2500;
        days.forEach(d => {
            d.height = Math.min((d.calories / MAX_Y) * 100, 100);
        });

        return days;
    }, [history, viewMode]);

    // Today's stats calculation
    const today = new Date();
    const todayKey = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
    const todayData = chartData.find(d => d.key === todayKey);
    const todayCalories = todayData ? todayData.calories : 0;
    const targetCalories = 2000;

    return (
        <div className="w-full max-w-md mx-auto pb-24 px-4 pt-6 animate-fade-in flex flex-col h-full">
            {/* Header & Toggle */}
            <div className="flex flex-col items-center mb-6 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800 mb-4">饮食统计</h2>
                <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                    <button
                        className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400'}`}
                        onClick={() => setViewMode("week")}
                    >
                        近7日
                    </button>
                    <button
                        className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400'}`}
                        onClick={() => setViewMode("month")}
                    >
                        近30天
                    </button>
                </div>
            </div>

            {/* Today's Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 flex-shrink-0">
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-gray-500 text-sm font-bold">今日摄入</h3>
                    <div className="text-right">
                        <span className="text-3xl font-black text-gray-900">{todayCalories}</span>
                        <span className="text-xs text-gray-400 font-medium ml-1">/ {targetCalories}</span>
                    </div>
                </div>
                <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden flex items-center px-1">
                    <div
                        className={`h-2 rounded-full transition-all duration-1000 ${todayCalories > targetCalories ? 'bg-red-400' : 'bg-[var(--primary)]'}`}
                        style={{ width: `${Math.min((todayCalories / targetCalories) * 100, 100)}%` }}
                    />
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0">
                <h3 className="text-gray-800 font-bold mb-4 flex-shrink-0">卡路里趋势</h3>

                <div className="flex-1 relative w-full h-full min-h-[200px]">
                    {/* Y-Axis Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-300 pointer-events-none z-0">
                        {[2500, 2000, 1500, 1000, 500, 0].map((val, i) => (
                            <div key={i} className="w-full border-b border-gray-50 flex items-end h-full">
                                <span className="mb-[-8px]">{val > 0 ? val : ''}</span>
                            </div>
                        ))}
                    </div>

                    {/* Bars Container */}
                    <div className="absolute inset-0 pl-8 pt-2 pb-6 flex items-end overflow-x-auto no-scrollbar z-10" style={{ scrollBehavior: 'smooth' }}>
                        <div className="flex items-end h-full gap-2 pr-4" style={{ minWidth: '100%' }}>
                            {chartData.map((day, i) => (
                                <div key={i} className="flex flex-col items-center gap-1 group relative" style={{ flex: viewMode === 'week' ? 1 : 'none', width: viewMode === 'month' ? '20px' : 'auto' }}>

                                    {/* Bar */}
                                    <div className="w-full bg-gray-50 rounded-t md:rounded-t-lg relative flex items-end overflow-hidden group-hover:bg-gray-100 transition-colors h-full">
                                        <div
                                            className={`w-full rounded-t md:rounded-t-lg transition-all duration-500 ${day.key === todayKey ? 'bg-[var(--primary)]' : 'bg-[#81C784]'}`}
                                            style={{ height: `${day.height}%` }}
                                        />
                                    </div>

                                    {/* Label */}
                                    <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">
                                        {viewMode === 'month' && i % 3 !== 0 ? '' : day.label}
                                    </span>

                                    {/* Tooltip */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none left-1/2 transform -translate-x-1/2">
                                        {day.calories} kcal
                                        <div className="text-[8px] text-gray-400">{day.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React from "react";
import { Home, ClipboardList, BarChart2, User } from "lucide-react";

interface BottomNavProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
}

export default function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 pb-6 pt-3 px-6 flex items-center justify-between z-50">

            <NavItem
                icon={<Home size={24} />}
                label="主页"
                id="home"
                isActive={currentTab === "home"}
                onClick={() => onTabChange("home")}
            />

            <NavItem
                icon={<ClipboardList size={24} />}
                label="日志"
                id="history"
                isActive={currentTab === "history"}
                onClick={() => onTabChange("history")}
            />

            {/* 暂时用统计占位，您可以后续决定是整合进 Profile 还是独立页面 */}
            <NavItem
                icon={<BarChart2 size={24} />}
                label="统计"
                id="stats"
                isActive={currentTab === "stats"}
                onClick={() => onTabChange("stats")}
            />

            <NavItem
                icon={<User size={24} />}
                label="我的"
                id="profile"
                isActive={currentTab === "profile"}
                onClick={() => onTabChange("profile")}
            />

        </div>
    );
}

function NavItem({ icon, label, id, isActive, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 w-16 transition-colors duration-200 ${isActive ? "text-[var(--primary)]" : "text-gray-400"
                }`}
        >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}

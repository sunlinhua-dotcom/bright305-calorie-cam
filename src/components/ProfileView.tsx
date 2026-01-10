import React, { useState } from "react";
import { User, Settings, Award, Flame, LogOut, ChevronRight, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

interface ProfileViewProps {
    user: any;
    onLogin: (name: string) => void;
    onLogout: () => void;
    stats: {
        totalScans: number;
        totalCalories: number;
    }
}

export default function ProfileView({ user, onLogin, onLogout, stats }: ProfileViewProps) {
    const [isLoginMode, setIsLoginMode] = useState(true);

    // Form State
    const [inputName, setInputName] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [inputConfirmPassword, setInputConfirmPassword] = useState("");

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        setError(null);
        if (!inputName.trim() || !inputPassword.trim()) {
            setError("请输入完整的账号和密码");
            return;
        }
        if (!isLoginMode) {
            if (inputPassword !== inputConfirmPassword) {
                setError("两次输入的密码不一致");
                return;
            }
            if (inputPassword.length < 6) {
                setError("密码长度不能少于6位");
                return;
            }
        }
        onLogin(inputName);
    };

    if (!user) {
        // --- AUTH SCREEN (Light Mode) ---
        return (
            <div className="w-full max-w-md mx-auto flex flex-col justify-center min-h-[70vh] px-8 animate-fade-in pb-24">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 mb-2">{isLoginMode ? "欢迎回归" : "创建账号"}</h2>
                    <p className="text-gray-500 text-sm">
                        {isLoginMode ? "登录以同步你的饮食数据" : "注册开启你的 AI 营养之旅"}
                    </p>
                </div>

                <div className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    {/* Username Input */}
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="输入你的昵称 / ID"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-gray-900 focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-all placeholder:text-gray-400"
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="设置密码"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-12 py-4 text-gray-900 focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-all placeholder:text-gray-400"
                            value={inputPassword}
                            onChange={(e) => setInputPassword(e.target.value)}
                        />
                        <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Confirm Password */}
                    {!isLoginMode && (
                        <div className="relative animate-fade-in-down">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="再次确认密码"
                                className={`w-full bg-gray-50 border rounded-xl pl-12 pr-4 py-4 text-gray-900 focus:outline-none transition-all placeholder:text-gray-400 ${inputConfirmPassword && inputPassword !== inputConfirmPassword
                                        ? "border-red-300 focus:border-red-500 bg-red-50"
                                        : "border-gray-200 focus:border-[var(--primary)] focus:bg-white"
                                    }`}
                                value={inputConfirmPassword}
                                onChange={(e) => setInputConfirmPassword(e.target.value)}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-xs px-2 animate-shake font-medium">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 hover:shadow-green-300 active:scale-[0.98] transition-all mt-2"
                    >
                        {isLoginMode ? "立即登录" : "注册并登录"}
                    </button>
                </div>

                {/* Mode Toggle */}
                <div className="mt-8 text-center">
                    <span className="text-gray-400 text-xs">
                        {isLoginMode ? "还没有账号？" : "已有账号？"}
                    </span>
                    <button
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setError(null);
                            setInputPassword("");
                            setInputConfirmPassword("");
                        }}
                        className="text-[var(--primary)] text-xs font-bold ml-2 hover:underline"
                    >
                        {isLoginMode ? "立即注册" : "去登录"}
                    </button>
                </div>
            </div>
        );
    }

    // --- LOGGED IN DASHBOARD (Light Mode) ---
    return (
        <div className="w-full max-w-md mx-auto pb-24 px-4 pt-6 animate-fade-in">

            {/* Header Card */}
            <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-xl border-2 border-white shadow-sm">
                    {user.name[0].toUpperCase()}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded inline-block mt-1 font-medium">Level 1 新手营养师</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <StatCard label="累计识别" value={stats.totalScans} suffix="次" icon={<Award size={18} />} color="blue" />
                <StatCard label="记录热量" value={stats.totalCalories} suffix="kcal" icon={<Flame size={18} />} color="orange" />
            </div>

            {/* Menu List */}
            <div className="space-y-3">
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <MenuButton icon={<Settings size={18} />} label="应用设置" isLast={false} />
                    <div className="h-px bg-gray-50 mx-4" />
                    <MenuButton icon={<User size={18} />} label="账号安全" isLast={true} />
                </div>

                <button
                    onClick={() => {
                        if (confirm("确定要退出登录吗？")) onLogout();
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-red-100 text-red-500 shadow-sm active:scale-95 transition-all mt-8"
                >
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                        <LogOut size={16} />
                    </div>
                    <span className="font-medium flex-1 text-left">退出登录</span>
                </button>
            </div>

        </div>
    );
}

function StatCard({ label, value, suffix, icon, color }: any) {
    const colorStyles: any = {
        blue: "text-blue-500 bg-blue-50",
        orange: "text-orange-500 bg-orange-50"
    };

    return (
        <div className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden card-shadow">
            <div className="text-gray-500 mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className={`p-1 rounded-md ${colorStyles[color]}`}>{icon}</span>
                {label}
            </div>
            <div>
                <span className="text-3xl font-black text-gray-900">{value}</span>
                <span className="text-xs text-gray-400 ml-1">{suffix}</span>
            </div>
        </div>
    )
}

function MenuButton({ icon, label, isLast }: any) {
    return (
        <button className="w-full flex items-center gap-4 p-4 text-gray-600 hover:bg-gray-50 transition-colors group active:bg-gray-100">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                {icon}
            </div>
            <span className="font-medium flex-1 text-left group-hover:text-gray-900">{label}</span>
            <ChevronRight size={16} className="text-gray-300" />
        </button>
    )
}

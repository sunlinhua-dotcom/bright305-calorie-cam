"use client";

import React, { useState, useEffect } from "react";
import ImageUploader from "@/components/ImageUploader";
// import FoodAnalysis from "@/components/FoodAnalysis"; // No longer used in batch mode
import BottomNav from "@/components/BottomNav";
import HistoryView from "@/components/HistoryView";
import ProfileView from "@/components/ProfileView";
import StatsView from "@/components/StatsView";
import InstallPrompt from "@/components/InstallPrompt";
import { User as UserIcon, Calendar, Save, Trash2, RefreshCw, X } from "lucide-react";

// --- TYPES ---
interface BatchItem {
  id: string;
  image: string; // base64
  mimeType: string;
  status: 'pending' | 'analyzing' | 'done' | 'error';
  analysis?: any;
  errorMsg?: string;
}

export default function Home() {
  // --- APP STATE ---
  const [currentTab, setCurrentTab] = useState("home");
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // --- BATCH SCANNER STATE ---
  const [batchResults, setBatchResults] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- INIT LOAD ---
  useEffect(() => {
    const savedUser = localStorage.getItem("cico_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      const userHistoryKey = `cico_history_${parsedUser.id}`;
      const savedHistory = localStorage.getItem(userHistoryKey);
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } else {
      const savedHistory = localStorage.getItem("cico_history");
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // --- AUTH ACTIONS ---
  const handleLogin = (name: string) => {
    const stableId = "user_" + btoa(encodeURIComponent(name));
    const currentUser = { id: stableId, name: name, joinedAt: new Date().toISOString() };

    const allUsersStr = localStorage.getItem("cico_users_db");
    let allUsers = allUsersStr ? JSON.parse(allUsersStr) : {};
    allUsers[name] = currentUser;
    localStorage.setItem("cico_users_db", JSON.stringify(allUsers));

    setUser(currentUser);
    localStorage.setItem("cico_user", JSON.stringify(currentUser));

    const userHistoryKey = `cico_history_${stableId}`;
    const savedHistory = localStorage.getItem(userHistoryKey);
    setHistory(savedHistory ? JSON.parse(savedHistory) : []);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("cico_user");
    setHistory([]);
  };

  const clearHistory = () => {
    setHistory([]);
    const key = user ? `cico_history_${user.id}` : "cico_history";
    localStorage.removeItem(key);
  };

  // --- STORAGE HELPERS ---
  const safeSaveHistory = (key: string, historyData: any[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(historyData));
    } catch (e) {
      console.warn("Storage full, retrying without images...");
      const textOnlyHistory = historyData.map(item => ({ ...item, imageUrl: "" }));
      try {
        localStorage.setItem(key, JSON.stringify(textOnlyHistory));
      } catch (e2) {
        alert("存储空间已极限，无法保存新记录。");
      }
    }
  };

  const compressImage = (base64Str: string, maxWidth = 80, quality = 0.3): Promise<string> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') { resolve(base64Str); return; }
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scaleSize = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve("");
    });
  };

  // --- BATCH LOGIC ---
  const analyzeSingleItem = async (item: BatchItem): Promise<BatchItem> => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: item.image, mimeType: item.mimeType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed");

      if (data.error === "NOT_FOOD") {
        return { ...item, status: 'error', errorMsg: "非食物" };
      } else {
        return { ...item, status: 'done', analysis: data };
      }
    } catch (e: any) {
      return { ...item, status: 'error', errorMsg: "识别失败" };
    }
  };

  const handleImagesSelected = async (files: { base64: string; mimeType: string }[]) => {
    if (files.length === 0) return;
    setIsProcessing(true);

    // 1. Init items as 'analyzing'
    const newItems: BatchItem[] = files.map(f => ({
      id: Date.now() + Math.random().toString(),
      image: f.base64,
      mimeType: f.mimeType,
      status: 'analyzing'
    }));
    setBatchResults(prev => [...newItems, ...prev]);

    // 2. Parallel Process
    // We update state individually as they finish to make UI responsive
    // However, for simplicity in React state, we can use a functional update approach or just wait for all.
    // To show "real-time" progress, we'll fire them all and update state as each promise resolves.

    newItems.forEach(async (item) => {
      const result = await analyzeSingleItem(item);
      setBatchResults(prev => prev.map(p => p.id === item.id ? result : p));
    });

    setIsProcessing(false);
  };

  const handleSaveAll = async () => {
    if (!user) { alert("请先登录再保存记录！"); setCurrentTab("profile"); return; }

    // Filter only finished items
    const validItems = batchResults.filter(i => i.status === 'done' && i.analysis);
    if (validItems.length === 0) return;

    // Compress all thumbnails in parallel
    const thumbnails = await Promise.all(validItems.map(i => compressImage(i.image)));

    const newHistoryItems = validItems.map((item, idx) => ({
      id: Date.now() + idx.toString(),
      foodName: item.analysis.foodName,
      calories: item.analysis.calories,
      macros: item.analysis.macros,
      date: new Date().toLocaleDateString(),
      imageUrl: thumbnails[idx],
    }));

    const updatedHistory = [...newHistoryItems, ...history];
    setHistory(updatedHistory);
    const key = `cico_history_${user.id}`;
    safeSaveHistory(key, updatedHistory);

    alert(`✅ 已保存 ${validItems.length} 条记录`);
    setBatchResults([]); // Clear list
  };

  const removeItem = (id: string) => {
    setBatchResults(prev => prev.filter(i => i.id !== id));
  };


  // --- RENDER HELPERS ---
  const renderHome = () => {
    const dailyCal = history.reduce((acc, curr) => acc + (parseInt(curr.calories) || 0), 0);
    const targetCal = 2000;
    const percent = Math.min((dailyCal / targetCal) * 100, 100);

    // BATCH RESULTS VIEW
    if (batchResults.length > 0) {
      // Stats for current batch
      const doneCount = batchResults.filter(i => i.status === 'done').length;
      const totalCount = batchResults.length;
      const totalBatchCals = batchResults.reduce((acc, i) => acc + (i.analysis?.calories || 0), 0);

      return (
        <div className="flex flex-col h-full px-4 pt-6 pb-32 animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">识别结果 ({doneCount}/{totalCount})</h2>
            <button onClick={() => setBatchResults([])} className="p-2 bg-gray-100 rounded-full text-gray-500">
              <X size={20} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-20">
            {batchResults.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center animate-slide-up">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 relative">
                  <img src={item.image} className="w-full h-full object-cover" />
                  {item.status === 'analyzing' && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <RefreshCw className="text-white animate-spin" size={20} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {item.status === 'analyzing' && <p className="text-gray-400 text-sm font-medium">AI 正在分析...</p>}
                  {item.status === 'error' && <p className="text-red-500 text-sm font-bold">{item.errorMsg}</p>}
                  {item.status === 'done' && (
                    <div>
                      <h3 className="font-bold text-gray-900 truncate">{item.analysis.foodName}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[var(--primary)]">{item.analysis.calories}</span>
                        <span className="text-xs text-gray-400">kcal</span>
                      </div>
                      <div className="text-[10px] text-gray-400 flex gap-2 mt-1">
                        <span>C:{item.analysis.macros.carbs}</span>
                        <span>P:{item.analysis.macros.protein}</span>
                        <span>F:{item.analysis.macros.fat}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action */}
                <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Sticky Actions */}
          <div className="absolute bottom-6 left-0 w-full px-6">
            <button
              disabled={doneCount === 0}
              onClick={handleSaveAll}
              className="w-full bg-[var(--primary)] disabled:bg-gray-300 text-white font-bold py-4 rounded-full shadow-lg shadow-green-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save size={20} />
              保存全部 ({totalBatchCals} kcal)
            </button>
          </div>
        </div>
      )
    }

    // MAIN UPLOAD DASHBOARD
    return (
      <div className="flex flex-col h-full px-6 pt-8 pb-32 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">肥了么</h1>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">BRIGHT FOOD 卡路里计算</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <UserIcon size={16} />
          </div>
        </div>

        {/* Image Uploader (Big Button) */}
        <div className="flex-1 flex flex-col justify-center items-center mb-8">
          <div className="scale-110">
            <ImageUploader onImagesSelected={handleImagesSelected} isAnalyzing={isProcessing} />
          </div>
          <p className="text-gray-400 text-xs font-medium mt-6 text-center">
            支持多图上传 • 并发急速分析
          </p>
        </div>

        {/* Daily Card */}
        <div className="bg-white rounded-3xl p-6 card-shadow border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-700">今日进度</span>
          </div>

          <div className="flex justify-between items-end mb-2">
            <span className="text-xs text-gray-500">摄入热量</span>
            <div>
              <span className="text-2xl font-black text-gray-900">{dailyCal}</span>
              <span className="text-xs text-gray-400 ml-1">/ {targetCal} 千卡</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all duration-1000"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <InstallPrompt />
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-gray-900 relative flex flex-col font-sans overflow-hidden">

      {/* BACKGROUND DECORATION (Subtle Green Blob) */}
      <div className="fixed top-[-20%] right-[-20%] w-[500px] h-[500px] bg-green-200/20 blur-[100px] rounded-full pointer-events-none" />

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto relative z-10">
        {currentTab === "home" && renderHome()}
        {currentTab === "history" && <HistoryView history={history} onClear={clearHistory} />}
        {currentTab === "profile" && (
          <ProfileView
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            stats={{
              totalScans: history.length,
              totalCalories: history.reduce((acc, curr) => acc + (parseInt(curr.calories) || 0), 0)
            }}
          />
        )}
        {currentTab === "stats" && <StatsView history={history} />}
      </div>

      {/* BOTTOM NAVIGATION (Hide when scanning results shown to focus on save) */}
      {batchResults.length === 0 && (
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
      )}

    </main>
  );
}

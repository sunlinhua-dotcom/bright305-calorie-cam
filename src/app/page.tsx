"use client";

import React, { useState, useEffect } from "react";
import ImageUploader from "@/components/ImageUploader";
import FoodAnalysis from "@/components/FoodAnalysis";
import BottomNav from "@/components/BottomNav";
import HistoryView from "@/components/HistoryView";
import ProfileView from "@/components/ProfileView";
import StatsView from "@/components/StatsView";
import InstallPrompt from "@/components/InstallPrompt";
import { AlertTriangle, User as UserIcon, Calendar, Flame } from "lucide-react";

export default function Home() {
  // --- APP STATE ---
  const [currentTab, setCurrentTab] = useState("home");
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // --- SCANNER STATE ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);

  // --- INIT LOAD ---
  useEffect(() => {
    const savedUser = localStorage.getItem("cico_user");
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Load user-specific history if user is logged in
      const userHistoryKey = `cico_history_${parsedUser.id}`;
      const savedHistory = localStorage.getItem(userHistoryKey);
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } else {
      // Load general history for guest users
      const savedHistory = localStorage.getItem("cico_history");
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // --- ACTIONS ---
  const handleLogin = (name: string) => {
    // 1. Generate a stable ID based on username (Simple Base64 of name to avoid weird chars)
    // This ensures that "Alice" always gets the same ID, even if users_db is cleared but history remains.
    const stableId = "user_" + btoa(encodeURIComponent(name));

    // 2. Refresh User Session
    const currentUser = {
      id: stableId,
      name: name,
      joinedAt: new Date().toISOString()
    };

    // Update DB (optional now, mainly for list)
    const allUsersStr = localStorage.getItem("cico_users_db");
    let allUsers = allUsersStr ? JSON.parse(allUsersStr) : {};
    allUsers[name] = currentUser;
    localStorage.setItem("cico_users_db", JSON.stringify(allUsers));

    // 3. Set Session
    setUser(currentUser);
    localStorage.setItem("cico_user", JSON.stringify(currentUser));

    // 4. Load User's specific history
    const userHistoryKey = `cico_history_${stableId}`;
    const savedHistory = localStorage.getItem(userHistoryKey);
    setHistory(savedHistory ? JSON.parse(savedHistory) : []);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("cico_user");
    // Clear history from view
    setHistory([]);
  };

  const clearHistory = () => {
    setHistory([]);
    const key = user ? `cico_history_${user.id}` : "cico_history";
    localStorage.removeItem(key);
  };

  // Helper: Try to save, if full, drop images
  const safeSaveHistory = (key: string, historyData: any[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(historyData));
    } catch (e) {
      console.warn("Storage full, retrying without images...");
      // Fallback: Remove images from ALL items to save space
      const textOnlyHistory = historyData.map(item => ({
        ...item,
        imageUrl: "" // Drop image
      }));
      try {
        localStorage.setItem(key, JSON.stringify(textOnlyHistory));
      } catch (e2) {
        alert("存储空间已极限，无法保存新记录。请清空旧数据。");
      }
    }
  };

  // Helper to compress image for storage (Aggressively small for thumbnails)
  const compressImage = (base64Str: string, maxWidth = 80, quality = 0.3): Promise<string> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(base64Str);
        return;
      }
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
      img.onerror = () => resolve(""); // Fallback
    });
  };

  const handleImageSelected = async (base64: string, mimeType: string) => {
    setImage(base64);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType: mimeType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");

      if (data.error === "NOT_FOOD") {
        setError("这看起来不像食物！");
        setAnalysis(null);
      } else {
        setAnalysis(data);
        // NOTE: Auto-save removed. User must click Save.
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = async () => {
    // 1. Check Login
    if (!user) {
      alert("请先登录再保存记录！");
      setCurrentTab("profile");
      return;
    }

    if (!analysis || !image) return;

    // 2. Prepare Data
    // Compress thumbnail for storage
    const thumbnail = await compressImage(image);

    const newHistoryItem = {
      id: Date.now().toString(),
      foodName: analysis.foodName,
      calories: analysis.calories,
      macros: analysis.macros,
      date: new Date().toLocaleDateString(),
      imageUrl: thumbnail,
    };

    // Use functional state update to ensure we have latest history
    const currentHistory = [...history]; // This might be stale in closure, but sufficient for now as we re-read from state
    const updatedHistory = [newHistoryItem, ...currentHistory];

    setHistory(updatedHistory);

    // 3. Save
    const key = `cico_history_${user.id}`;
    safeSaveHistory(key, updatedHistory);

    // 4. Reset to Home
    resetScanner();
    alert("✅ 已保存到日志");
  };


  const resetScanner = () => { setAnalysis(null); setImage(null); setError(null); };

  // --- RENDER HELPERS ---
  const renderHome = () => {
    // Calculate daily stats (mock)
    const dailyCal = history.reduce((acc, curr) => acc + (parseInt(curr.calories) || 0), 0);
    const targetCal = 2000;
    const percent = Math.min((dailyCal / targetCal) * 100, 100);

    // If viewing analysis result
    if (image && analysis) {
      return <FoodAnalysis data={analysis} imageUrl={image} onReset={resetScanner} onSave={handleManualSave} />;
    }

    // Normal Home Dashboard
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
            <ImageUploader onImageSelected={handleImageSelected} isAnalyzing={loading} />
          </div>
          {error && <p className="text-red-500 text-sm mt-4 font-bold">{error}</p>}
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

      {/* BOTTOM NAVIGATION (Only hide when viewing analysis result) */}
      {!(image && analysis) && (
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
      )}

    </main>
  );
}

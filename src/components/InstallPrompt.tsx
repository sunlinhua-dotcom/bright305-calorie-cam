"use client";

import React, { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

export default function InstallPrompt() {
    const [showModal, setShowModal] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Capture install prompt for Android/Desktop
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === "accepted") {
                    setDeferredPrompt(null);
                }
            });
        } else {
            setShowModal(true);
        }
    };

    // Force button to show always
    // if (!showModal && !deferredPrompt && !isIOS) return null;

    return (
        <>
            {/* Static Footer Button (Fixed) */}
            <button
                onClick={handleInstallClick}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-gray-500 hover:bg-white/10 hover:text-white transition-all"
            >
                <Download className="w-3 h-3" />
                <span>保存应用到桌面</span>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-bold mb-4 text-center">添加到手机桌面</h3>

                        {isIOS ? (
                            <div className="flex flex-col gap-4 text-sm text-gray-300">
                                <p>在 Safari 浏览器中：</p>
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                    <span className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded text-white font-bold">1</span>
                                    <span>点击底部中间的 <strong className="text-white">分享按钮</strong> <Share className="inline w-4 h-4 mb-1" /></span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                    <span className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded text-white font-bold">2</span>
                                    <span>向下滑动，选择 <strong className="text-white">添加到主屏幕</strong> <PlusSquare className="inline w-4 h-4 mb-1" /></span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 text-sm text-gray-300">
                                <p>在 Chrome 浏览器中：</p>
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                    <span className="flex items-center justify-center w-8 h-8 bg-[var(--primary)] text-black font-bold">1</span>
                                    <span>点击浏览器右上角的 <strong className="text-white">菜单图标</strong> (⋮)</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                    <span className="flex items-center justify-center w-8 h-8 bg-[var(--primary)] text-black font-bold">2</span>
                                    <span>选择 <strong className="text-white">安装应用</strong> 或 <strong className="text-white">添加到主屏幕</strong></span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full mt-6 py-3 bg-[var(--primary)] text-black font-bold rounded-xl"
                        >
                            知道了
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

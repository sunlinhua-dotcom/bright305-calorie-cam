import React, { useRef } from "react";
import { Camera, Zap } from "lucide-react";

interface ImageUploaderProps {
    onImagesSelected: (images: { base64: string; mimeType: string }[]) => void;
    isAnalyzing: boolean;
}

export default function ImageUploader({ onImagesSelected, isAnalyzing }: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const promises = Array.from(files)
            .filter(file => file.type.startsWith("image/"))
            .map(file => {
                return new Promise<{ base64: string; mimeType: string }>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({
                            base64: reader.result as string,
                            mimeType: file.type
                        });
                    };
                    reader.readAsDataURL(file);
                });
            });

        const results = await Promise.all(promises);
        if (results.length > 0) {
            onImagesSelected(results);
        }
    };

    return (
        <div
            onClick={() => !isAnalyzing && inputRef.current?.click()}
            className="relative w-64 h-64 mx-auto rounded-full flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95 group"
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple // Enable multiple selection
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />

            {/* Outer Ring Glow */}
            <div className={`absolute inset-0 rounded-full bg-orange-400 opacity-20 blur-xl transition-all duration-1000 ${isAnalyzing ? "scale-110 animate-pulse" : "group-hover:scale-105"}`} />

            {/* Main Circle */}
            <div className={`w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-500 shadow-xl flex flex-col items-center justify-center text-white relative border-4 border-white/30 ${isAnalyzing ? "animate-spin-slow" : ""}`}>

                {isAnalyzing ? (
                    <Zap className="w-16 h-16 animate-bounce" />
                ) : (
                    <Camera className="w-16 h-16 mb-2" />
                )}

                <span className="text-lg font-bold tracking-wide">
                    {isAnalyzing ? "分析中..." : "点击拍摄食物"}
                </span>

            </div>

            {/* Decorative Ring */}
            <div className="absolute -inset-4 border border-orange-200 rounded-full opacity-60 pointer-events-none" />
        </div>
    );
}

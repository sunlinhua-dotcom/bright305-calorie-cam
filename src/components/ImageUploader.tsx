import React, { useRef } from "react";
import { Camera, Zap } from "lucide-react";

interface ImageUploaderProps {
    onImageSelected: (base64: string, mimeType: string) => void;
    isAnalyzing: boolean;
}

export default function ImageUploader({ onImageSelected, isAnalyzing }: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageSelected(reader.result as string, file.type);
            };
            reader.readAsDataURL(file);
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
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
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

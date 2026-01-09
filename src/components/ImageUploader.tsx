"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { Camera, Upload, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploaderProps {
    onImageSelected: (base64: string, mimeType: string) => void;
    isAnalyzing: boolean;
}

export default function ImageUploader({ onImageSelected, isAnalyzing }: ImageUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Extract MIME type properly if needed, but the API expects base64 + separate mimeType usually
                // or just the full data URL. Our API handles the stripping.
                onImageSelected(result, file.type);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            className={`glass-panel relative flex flex-col items-center justify-center w-full max-w-xl p-12 text-center transition-all duration-300 border-2 border-dashed cursor-pointer hover:bg-white/5 ${dragActive ? "border-[var(--primary)] bg-white/5 scale-[1.02]" : "border-white/20"
                } ${isAnalyzing ? "opacity-50 pointer-events-none" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
            style={{ minHeight: "300px" }}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
            />

            <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-[var(--primary)] blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    {isAnalyzing ? (
                        <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
                    ) : (
                        <Camera className="w-10 h-10 text-[var(--primary)]" />
                    )}
                </div>
            </div>

            <h3 className="text-2xl font-bold mb-2">拍摄或上传食物</h3>
            <p className="text-gray-400 mb-6 max-w-xs mx-auto">
                拖入图片，或点击开启摄像头识别
            </p>

            <div className="flex gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                    <ImageIcon size={14} /> 支持 JPG, PNG
                </span>
                <span className="flex items-center gap-1">
                    <Upload size={14} /> 极速分析
                </span>
            </div>
        </div>
    );
}

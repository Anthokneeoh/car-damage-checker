"use client"

import type React from "react"
import { useState } from "react"
import { Upload, ImageIcon, CheckCircle } from "lucide-react"

interface ImageUploadZoneProps {
    onImageSelect: (file: File) => void
}

export function ImageUploadZone({ onImageSelect }: ImageUploadZoneProps) {
    const [isDragActive, setIsDragActive] = useState(false)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(e.type === "dragenter" || e.type === "dragover")
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)

        const files = e.dataTransfer.files
        if (files?.[0]) {
            onImageSelect(files[0])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files?.[0]) {
            onImageSelect(files[0])
        }
    }

    return (
        <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer ${isDragActive
                ? "border-emerald-400 bg-emerald-50/50 scale-[1.02]"
                : "border-blue-300/50 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50/50"
                }`}
        >
            <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center justify-center gap-4">
                {/* Animated Icon Container */}
                <div
                    className={`relative p-4 rounded-2xl transition-all duration-300 ${isDragActive ? "bg-emerald-100 scale-110" : "bg-gradient-to-br from-blue-100 to-cyan-100"
                        }`}
                >
                    {isDragActive ? (
                        <CheckCircle className="w-8 h-8 text-emerald-500 animate-pulse" />
                    ) : (
                        <div className="relative">
                            <ImageIcon className="w-8 h-8 text-blue-500" />
                            <Upload className="w-4 h-4 text-cyan-500 absolute -bottom-1 -right-1" />
                        </div>
                    )}

                    {/* Animated ring */}
                    {isDragActive && <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-ping" />}
                </div>

                <div className="text-center space-y-2">
                    <p
                        className={`font-semibold text-lg transition-colors ${isDragActive ? "text-emerald-600" : "text-slate-700"
                            }`}
                    >
                        {isDragActive ? "Drop image here" : "Drag & drop car damage images here"}
                    </p>
                    <p className="text-slate-500">
                        or <span className="text-blue-600 font-medium hover:underline">click to browse</span>
                    </p>
                </div>

                {/* File restrictions */}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="px-2 py-1 rounded-full bg-slate-100">Max 10MB</span>
                    <span className="px-2 py-1 rounded-full bg-slate-100">JPG, PNG, WEBP</span>
                </div>
            </div>
        </div>
    )
}

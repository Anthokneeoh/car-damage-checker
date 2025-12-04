"use client"

import { useEffect, useState } from "react"
import { Upload, Scan, FileText, CheckCircle, Loader2 } from "lucide-react"

interface AnalysisProgressProps {
    currentStep: number
}

const steps = [
    { id: 1, label: "Uploading", icon: Upload },
    { id: 2, label: "Analyzing", icon: Scan },
    { id: 3, label: "Generating Report", icon: FileText },
    { id: 4, label: "Ready", icon: CheckCircle },
]

const loadingMessages = [
    "Analyzing dent patterns...",
    "Checking paint damage...",
    "Detecting scratches and chips...",
    "Estimating repair costs...",
    "Generating comprehensive report...",
]

export function AnalysisProgress({ currentStep }: AnalysisProgressProps) {
    const [messageIndex, setMessageIndex] = useState(0)

    // Rotate loading messages every 2.5 seconds
    useEffect(() => {
        if (currentStep < 4) {
            const interval = setInterval(() => {
                setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
            }, 2500)
            return () => clearInterval(interval)
        }
    }, [currentStep])

    return (
        <div className="glass rounded-2xl p-6 shadow-lg shadow-blue-500/5">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                Processing Your Image
            </h3>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => {
                    const Icon = step.icon
                    const isCompleted = currentStep > step.id
                    const isActive = currentStep === step.id
                    const isPending = currentStep < step.id

                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted
                                        ? "bg-emerald-500 text-white"
                                        : isActive
                                            ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white"
                                            : "bg-slate-200 text-slate-400"
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />

                                    {/* Active pulse ring */}
                                    {isActive && <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping" />}
                                </div>
                                <span
                                    className={`mt-2 text-xs font-medium whitespace-nowrap ${isCompleted ? "text-emerald-600" : isActive ? "text-blue-600" : "text-slate-400"
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connecting Line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-0.5 mx-2 mt-[-1.5rem] overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className={`h-full transition-all duration-700 ease-out ${isCompleted
                                            ? "bg-emerald-500 w-full"
                                            : isActive
                                                ? "bg-gradient-to-r from-blue-500 to-cyan-400 w-1/2 animate-pulse"
                                                : "w-0"
                                            }`}
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Shimmer Loading Bar */}
            <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>

            {/* Rotating Message */}
            <div className="text-center">
                <p className="text-slate-600 font-medium transition-all duration-300" key={messageIndex}>
                    {loadingMessages[messageIndex]}
                </p>
                <p className="text-xs text-slate-400 mt-2">This typically takes 10-30 seconds</p>
            </div>
        </div>
    )
}

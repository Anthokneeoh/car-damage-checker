"use client"

import { useState, useRef, useEffect } from "react"
import { RefreshCw, AlertCircle, Sparkles, Code2, Car } from "lucide-react"
import { Button } from "./ui/button"
import { ImageUploadZone } from "./image-upload-zone"
import { AnalysisProgress } from "./analysis-progress"
import { ResultsTabs } from "./results-tab"
import { InsuranceNuggets } from "./insurance-nuggets"
import { DisclaimerFooter } from "./disclaimer-footer"

// --- Interfaces based on your API response structure ---
interface Prediction {
    x: number
    y: number
    width: number
    height: number
    class: string
    confidence: number
}

interface StructuredFinding {
    part: string
    defect_type: string
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    repair_action: string
}

interface AnalysisResult {
    predictions: Prediction[]
    ai_summary?: string
    structured_findings?: StructuredFinding[]
    // Allow for any extra keys from your backend
    [key: string]: any
}

export function CarDamageAssessment() {
    // --- State Management ---
    const [imageBase64, setImageBase64] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<AnalysisResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [analysisStep, setAnalysisStep] = useState(0)

    // --- Refs for Canvas Drawing ---
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    // --- 1. Original Compression Logic (Preserved) ---
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = (event) => {
                const img = new Image()
                img.src = event.target?.result as string

                img.onload = () => {
                    const canvas = document.createElement("canvas")
                    const ctx = canvas.getContext("2d")

                    const MAX_WIDTH = 1280
                    const MAX_HEIGHT = 1280

                    let width = img.width
                    let height = img.height

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width
                            width = MAX_WIDTH
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height
                            height = MAX_HEIGHT
                        }
                    }

                    canvas.width = width
                    canvas.height = height
                    ctx?.drawImage(img, 0, 0, width, height)

                    // Returns JPEG with 0.85 quality
                    resolve(canvas.toDataURL("image/jpeg", 0.85))
                }
                img.onerror = reject
            }
            reader.onerror = reject
        })
    }

    // --- 2. Handle File Selection ---
    const handleImageSelect = async (file: File) => {
        setError(null)
        setResults(null)
        setLoading(true)
        setAnalysisStep(1) // Start visual progress

        try {
            const compressed = await compressImage(file)
            setImageBase64(compressed)
            setAnalysisStep(0) // Reset progress until they click Analyze
        } catch {
            setError("Failed to process image.")
        } finally {
            setLoading(false)
        }
    }

    // --- 3. Handle Analysis (Real API Call) ---
    const handleAnalyze = async () => {
        if (!imageBase64) {
            setError("Please select an image first.")
            return
        }

        setLoading(true)
        setError(null)
        setResults(null)
        setAnalysisStep(1)

        // Visual Candy: Simulate steps progressing while the API fetches
        const stepInterval = setInterval(() => {
            setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev))
        }, 1500)

        try {
            // REAL API CALL
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: imageBase64 }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "An unknown error occurred.")

            // Filter low-confidence predictions (Logic from old code)
            const validPredictions = data.predictions?.filter((pred: Prediction) => pred.confidence >= 0.3) || []

            if (validPredictions.length === 0) {
                setError("⚠️ No damage detected with sufficient confidence. Please upload a clearer car photo.")
                setResults(null)
                setAnalysisStep(0)
                setLoading(false)
                clearInterval(stepInterval)
                return
            }

            // Success!
            setResults({ ...data, predictions: validPredictions })
            setAnalysisStep(4) // Complete the visual bar

        } catch (err: any) {
            setError(err.message || "An error occurred during analysis.")
            setAnalysisStep(0)
        } finally {
            clearInterval(stepInterval)
            setLoading(false)
        }
    }

    const handleReset = () => {
        setImageBase64(null)
        setResults(null)
        setError(null)
        setAnalysisStep(0)
    }

    // --- 4. Canvas Drawing Logic (Merged Style) ---
    useEffect(() => {
        if (results?.predictions && imageRef.current && canvasRef.current) {
            const img = imageRef.current
            const canvas = canvasRef.current
            const ctx = canvas.getContext("2d")

            if (!ctx) return

            const drawBoxes = () => {
                canvas.width = img.naturalWidth
                canvas.height = img.naturalHeight

                // Draw the original image first
                ctx.drawImage(img, 0, 0)

                // Draw bounding boxes
                results.predictions.forEach((pred) => {
                    const { x, y, width, height, class: className, confidence } = pred

                    const boxX = x - width / 2
                    const boxY = y - height / 2

                    // Box Style (Emerald Green to match UI)
                    ctx.strokeStyle = "#10B981"
                    ctx.lineWidth = 4
                    ctx.strokeRect(boxX, boxY, width, height)

                    // Label Background
                    const label = `${className} ${(confidence * 100).toFixed(1)}%`
                    ctx.font = "bold 16px Inter, sans-serif"
                    const textWidth = ctx.measureText(label).width
                    const textHeight = 24

                    ctx.fillStyle = "#10B981"
                    ctx.fillRect(boxX, boxY - textHeight, textWidth + 12, textHeight)

                    // Label Text
                    ctx.fillStyle = "#FFFFFF"
                    ctx.fillText(label, boxX + 6, boxY - 6)
                })
            }

            if (img.complete) {
                drawBoxes()
            } else {
                img.onload = drawBoxes
            }
        }
    }, [results])

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-blue-100/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col items-center justify-center text-center gap-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                                <Car className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">InsurTech AI</h1>
                                <p className="text-xs text-slate-500">Damage Assessment Platform</p>
                            </div>
                        </div>
                        <div className="flex justify-center mb-4">
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                                v1.1 Stable
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Hero Section */}
                <section className="text-center max-w-3xl mx-auto animate-slide-up">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-balance">
                        AI-Powered Car Damage Analysis
                    </h2>
                    <p className="text-slate-600 text-lg leading-relaxed">
                        Upload an image to detect car damages using the{" "}
                        <span className="font-semibold text-blue-600">InsurTech-Damage-Audit</span> model.
                    </p>
                </section>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column: Upload & Image Preview */}
                    <div className="space-y-6">
                        {/* Upload Zone */}
                        <div
                            className="glass rounded-2xl p-6 shadow-lg shadow-blue-500/5 animate-slide-up"
                            style={{ animationDelay: "0.1s" }}
                        >
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-blue-100">
                                    <Sparkles className="w-4 h-4 text-blue-600" />
                                </div>
                                Upload Vehicle Image
                            </h3>

                            {imageBase64 ? (
                                <div className="space-y-4">
                                    <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 group">
                                        {/* Hidden image for canvas reference */}
                                        <img
                                            ref={imageRef}
                                            src={imageBase64}
                                            alt="Upload preview"
                                            className={results ? "hidden" : "w-full h-auto"}
                                        />
                                        {/* Canvas with bounding boxes */}
                                        {results && <canvas ref={canvasRef} className="w-full h-auto" />}
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleReset}
                                            variant="outline"
                                            className="flex-1 border-slate-300 hover:bg-slate-50 bg-transparent"
                                            disabled={loading}
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            New Image
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <ImageUploadZone onImageSelect={handleImageSelect} />
                            )}

                            {error && (
                                <div className="mt-4 flex gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* CTA Buttons */}
                        {imageBase64 && !results && !loading && (
                            <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                                <Button
                                    onClick={handleAnalyze}
                                    className="flex-1 h-12 px-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all"
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate AI-Powered Summary
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 px-6 border-2 border-slate-300 bg-transparent text-slate-400 cursor-not-allowed"
                                    disabled
                                >
                                    <Code2 className="w-5 h-5 mr-2" />
                                    View Technical Data
                                </Button>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="animate-slide-up">
                                <AnalysisProgress currentStep={analysisStep} />
                            </div>
                        )}
                    </div>

                    {/* Right Column: Results */}
                    <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
                        {results ? (
                            <ResultsTabs results={results} />
                        ) : (
                            <div className="glass rounded-2xl p-8 shadow-lg shadow-blue-500/5 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                                <div className="p-4 rounded-2xl bg-slate-100 mb-4">
                                    <Car className="w-12 h-12 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Analysis Yet</h3>
                                <p className="text-slate-500 max-w-xs">
                                    Upload an image and click "Generate AI-Powered Summary" to see detailed damage analysis
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Insurance Nuggets Section */}
                <InsuranceNuggets />
            </div>

            {/* Disclaimer Footer */}
            <DisclaimerFooter />
        </div>
    )
}
"use client"

import { useState } from "react"
// Make sure these files exist in your components/ui folder!
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Sparkles, Code2, Shield, AlertTriangle, CheckCircle, Copy, Check } from "lucide-react"

// --- Interfaces to match your API ---
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
    [key: string]: any // Allows for extra data without breaking
}

interface ResultsTabsProps {
    results: AnalysisResult
}

export function ResultsTabs({ results }: ResultsTabsProps) {
    const [copied, setCopied] = useState(false)

    const handleCopyJson = () => {
        navigator.clipboard.writeText(JSON.stringify(results, null, 2))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Helper to color-code damage severity
    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case "HIGH":
            case "CRITICAL":
                return {
                    bg: "bg-red-50",
                    border: "border-red-200",
                    text: "text-red-700",
                    badge: "bg-red-100 text-red-700",
                }
            case "MEDIUM":
                return {
                    bg: "bg-amber-50",
                    border: "border-amber-200",
                    text: "text-amber-700",
                    badge: "bg-amber-100 text-amber-700",
                }
            default:
                return {
                    bg: "bg-emerald-50",
                    border: "border-emerald-200",
                    text: "text-emerald-700",
                    badge: "bg-emerald-100 text-emerald-700",
                }
        }
    }

    // Logic: If structured findings exist, check them. If not, default to "Moderate" based on raw predictions.
    const overallSeverity = results.structured_findings?.some((f) => f.severity === "HIGH" || f.severity === "CRITICAL")
        ? "Severe"
        : results.structured_findings?.some((f) => f.severity === "MEDIUM")
            ? "Moderate"
            : results.predictions.length > 0 ? "Moderate" : "Minor" // Fallback if no structured data

    const severityBadgeStyles =
        overallSeverity === "Severe"
            ? "bg-red-100 text-red-700 border-red-200"
            : overallSeverity === "Moderate"
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-emerald-100 text-emerald-700 border-emerald-200"

    return (
        <div className="glass rounded-2xl shadow-lg shadow-blue-500/5 overflow-hidden animate-slide-up">
            <Tabs defaultValue="summary" className="w-full">
                {/* Tab Navigation Headers */}
                <TabsList className="w-full grid grid-cols-3 bg-slate-100/80 p-1 rounded-none border-b border-slate-200">
                    <TabsTrigger
                        value="summary"
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                    >
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="hidden sm:inline">AI Summary</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="technical"
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                    >
                        <Code2 className="w-4 h-4 text-slate-600" />
                        <span className="hidden sm:inline">Technical</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="insurance"
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                    >
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">Insurance</span>
                    </TabsTrigger>
                </TabsList>

                {/* 1. AI Summary Tab */}
                <TabsContent value="summary" className="p-6 space-y-6">
                    {/* Severity Badge */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800">Damage Assessment</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${severityBadgeStyles}`}>
                            {overallSeverity} Damage
                        </span>
                    </div>

                    {/* AI Summary Text */}
                    {results.ai_summary && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-500">
                            <p className="text-slate-700 leading-relaxed">{results.ai_summary}</p>
                        </div>
                    )}

                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-slate-50 border-slate-200 shadow-sm">
                            <CardContent className="p-4">
                                <p className="text-xs text-slate-500 mb-1">Damages Detected</p>
                                <p className="text-2xl font-bold text-blue-600">{results.predictions.length}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-50 border-slate-200 shadow-sm">
                            <CardContent className="p-4">
                                <p className="text-xs text-slate-500 mb-1">Avg. Confidence</p>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {(
                                        (results.predictions.reduce((acc, p) => acc + p.confidence, 0) / (results.predictions.length || 1)) *
                                        100
                                    ).toFixed(0)}
                                    %
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Scenario A: Backend returns Structured Findings (New V2 Model) */}
                    {results.structured_findings && results.structured_findings.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-semibold text-slate-700">Detailed Findings</h4>
                            {results.structured_findings.map((finding, idx) => {
                                const styles = getSeverityStyles(finding.severity)
                                return (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-xl ${styles.bg} border ${styles.border} flex items-center justify-between gap-4`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {finding.severity === "HIGH" || finding.severity === "CRITICAL" ? (
                                                <AlertTriangle className={`w-5 h-5 ${styles.text}`} />
                                            ) : (
                                                <CheckCircle className={`w-5 h-5 ${styles.text}`} />
                                            )}
                                            <div>
                                                <p className={`font-semibold ${styles.text}`}>{finding.part}</p>
                                                <p className="text-sm text-slate-600">{finding.defect_type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded-full ${styles.badge}`}>{finding.severity}</span>
                                            <p className="text-xs text-slate-500 mt-1">{finding.repair_action}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Scenario B: Backend only returns Predictions (Your Current Model) */}
                    {(!results.structured_findings || results.structured_findings.length === 0) && (
                        <div className="space-y-3">
                            <h4 className="font-semibold text-slate-700">Detected Damages</h4>
                            {results.predictions.map((pred, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-700 capitalize">{pred.class}</p>
                                        <p className="text-sm text-slate-500">Detection #{idx + 1}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-blue-600">{(pred.confidence * 100).toFixed(1)}%</p>
                                        <p className="text-xs text-slate-400">confidence</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* 2. Technical Data Tab */}
                <TabsContent value="technical" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Raw JSON Data</h3>
                        <Button variant="outline" size="sm" onClick={handleCopyJson} className="border-slate-300 bg-transparent hover:bg-slate-100">
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2 text-emerald-500" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy JSON
                                </>
                            )}
                        </Button>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner">
                        <pre className="text-emerald-400 text-sm font-mono leading-relaxed">{JSON.stringify(results, null, 2)}</pre>
                    </div>
                </TabsContent>

                {/* 3. Insurance Tab */}
                <TabsContent value="insurance" className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Insurance Recommendations</h3>

                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-blue-700">Claim Eligibility</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 text-sm">
                                Based on the detected damage, this incident may qualify for a comprehensive insurance claim. We
                                recommend contacting your insurance provider with this report.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-slate-700">Next Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                                    Download this damage report for your records
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                                    Contact your insurance provider within 24 hours
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                                    Schedule an in-person inspection at a certified repair shop
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { AlertTriangle, Info, CheckCircle, AlertOctagon } from "lucide-react"

// --- Interfaces matching your actual API ---
interface Prediction {
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
    [key: string]: any
}

interface ResultsDisplayProps {
    results: AnalysisResult
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
    // Helper to map API severity to UI colors
    const getSeverityStyles = (severity: string = "LOW") => {
        const norm = severity.toUpperCase();
        switch (norm) {
            case "HIGH":
            case "CRITICAL":
                return {
                    color: "text-red-600 dark:text-red-400",
                    bg: "bg-red-500/10",
                    border: "border-red-500/30",
                    badge: "bg-red-100 text-red-700",
                    bar: "bg-red-500"
                }
            case "MEDIUM":
                return {
                    color: "text-amber-600 dark:text-amber-400",
                    bg: "bg-amber-500/10",
                    border: "border-amber-500/30",
                    badge: "bg-amber-100 text-amber-700",
                    bar: "bg-amber-500"
                }
            default: // LOW
                return {
                    color: "text-emerald-600 dark:text-emerald-400",
                    bg: "bg-emerald-500/10",
                    border: "border-emerald-500/30",
                    badge: "bg-emerald-100 text-emerald-700",
                    bar: "bg-emerald-500"
                }
        }
    }

    // Determine data source (Structured Findings vs Raw Predictions)
    const hasStructured = results.structured_findings && results.structured_findings.length > 0;
    const itemsToDisplay = hasStructured ? results.structured_findings : results.predictions;

    return (
        <div className="space-y-4 animate-slide-up">
            {/* Summary Card */}
            <Card className="backdrop-blur-sm border-border/50 bg-card/50 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Assessment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">AI Analysis</p>
                        <p className="text-sm text-foreground leading-relaxed">
                            {results.ai_summary || "AI analysis completed. Detections are listed below."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                            <p className="text-xs text-muted-foreground mb-1">Detections</p>
                            <p className="font-bold text-xl text-primary">{itemsToDisplay?.length || 0}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                            <p className="text-xs text-muted-foreground mb-1">Avg. Confidence</p>
                            <p className="font-bold text-xl text-emerald-600">
                                {results.predictions.length > 0
                                    ? ((results.predictions.reduce((a, b) => a + b.confidence, 0) / results.predictions.length) * 100).toFixed(0)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Damages List */}
            <Card className="backdrop-blur-sm border-border/50 bg-card/50 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Detected Issues
                    </CardTitle>
                    <CardDescription>
                        {itemsToDisplay?.length || 0} issue{(itemsToDisplay?.length || 0) !== 1 ? "s" : ""} identified
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {/* Render Structured Findings (New V2 Model) */}
                        {hasStructured && results.structured_findings?.map((damage, idx) => {
                            const styles = getSeverityStyles(damage.severity);
                            return (
                                <div key={idx} className={`p-3 rounded-lg border ${styles.bg} ${styles.border}`}>
                                    <div className="flex justify-between items-start gap-3 mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-foreground">{damage.part}</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles.badge}`}>
                                                    {damage.severity}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{damage.defect_type}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-foreground/80 mt-2 text-xs">
                                        <span className="font-medium">Action:</span> {damage.repair_action}
                                    </p>
                                </div>
                            );
                        })}

                        {/* Fallback: Render Raw Predictions (Old V1 Model) */}
                        {!hasStructured && results.predictions.map((damage, idx) => {
                            // Raw predictions don't have severity, assume Medium/High based on confidence
                            const styles = getSeverityStyles(damage.confidence > 0.8 ? "HIGH" : "MEDIUM");
                            return (
                                <div key={idx} className="p-3 rounded-lg border bg-slate-50 border-slate-200">
                                    <div className="flex justify-between items-center gap-3">
                                        <div>
                                            <p className="font-semibold text-foreground capitalize">{damage.class}</p>
                                            <p className="text-xs text-muted-foreground">Detected Object</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${styles.color}`}>
                                                {(damage.confidence * 100).toFixed(0)}%
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">confidence</p>
                                        </div>
                                    </div>
                                    {/* Confidence Bar */}
                                    <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${styles.bar}`}
                                            style={{ width: `${damage.confidence * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Info Footer */}
            <div className="flex gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-snug">
                    This AI assessment provides an estimate. For official insurance claims, please consult a professional adjuster.
                </p>
            </div>
        </div>
    )
}
"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"

export function DisclaimerFooter() {
    const [isExpanded, setIsExpanded] = useState(true)

    // Check localStorage for mobile expanded preference
    useEffect(() => {
        const expanded = localStorage.getItem("disclaimerExpanded")
        if (expanded !== null) {
            setIsExpanded(expanded === "true")
        }
    }, [])

    const toggleExpanded = () => {
        const newValue = !isExpanded
        setIsExpanded(newValue)
        localStorage.setItem("disclaimerExpanded", String(newValue))
    }

    return (
        <footer className="border-t-2 border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mobile: Collapsible but always visible */}
                <div className="md:hidden">
                    <button
                        onClick={toggleExpanded}
                        className="w-full py-4 flex items-center justify-between text-slate-700"
                        aria-expanded={isExpanded}
                        aria-controls="disclaimer-content-mobile"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="text-sm font-semibold">Important Disclaimer</span>
                        </div>
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-500" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                        )}
                    </button>

                    <div
                        id="disclaimer-content-mobile"
                        className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0"
                            }`}
                    >
                        <div className="text-xs text-slate-600 leading-relaxed pl-11 space-y-3">
                            <p>
                                <span className="font-semibold text-slate-700">Please Note:</span> Car damage analysis is performed by
                                machine learning models and may be inaccurate in some cases. This tool provides estimates only and
                                should not replace professional inspection. Always consult with certified mechanics and insurance
                                professionals for accurate assessments.
                            </p>
                            <p>
                                Insurance quotes and recommendations displayed on this platform are for informational purposes only and
                                do not constitute binding offers or guarantees of coverage.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Desktop: Always fully visible */}
                <div className="hidden md:flex items-start gap-4 py-6">
                    <div className="p-2.5 bg-amber-100 rounded-xl flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-2">Disclaimer</h4>
                        <div className="space-y-3">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Car damage analysis is performed by machine learning models and may be inaccurate in some cases. This
                                tool provides estimates only and should not replace professional inspection. Always consult with
                                certified mechanics and insurance professionals for accurate assessments.
                            </p>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Insurance quotes and recommendations displayed on this platform are for informational purposes only and
                                do not constitute binding offers or guarantees of coverage.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom Bar */}
                <div className="border-t border-slate-200 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Car Damage Assessment. All rights reserved.</p>
                    <p>Powered by AI Technology</p>
                </div>
            </div>
        </footer>
    )
}

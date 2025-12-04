"use client"

import { Card, CardContent } from "./ui/card"

const nuggets = [
    {
        id: 1,
        title: "Third-Party Insurance is Now Strictly Enforced",
        description:
            "Starting 2025, Nigeria is strictly enforcing mandatory Third-Party auto insurance. Non-compliance attracts fines up to ₦250,000 and vehicle impoundment. Fixed annual premiums start from ₦15,000 for private vehicles.",
        color: "blue",
    },
    {
        id: 2,
        title: "Road Accidents Highlight Insurance Urgency",
        description:
            "Nigeria records over 12,000 road accidents annually. Comprehensive insurance coverage (₦35,000 - ₦150,000/year) protects you from repair costs averaging ₦500,000+ and third-party liabilities.",
        color: "amber",
    },
    {
        id: 3,
        title: "NAICOM Regulates for Better Protection",
        description:
            "NAICOM now standardizes premiums and mandates digital insurance verification. The Nigerian insurance market is projected to grow 15% by 2026, ensuring better protection and faster claims.",
        color: "emerald",
    },
]

function ShieldCheckIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    )
}

function CarCrashIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
            <path d="M5 17H3v-6l2-4h9l4 4h3v6h-2" />
            <path d="M9 17h6" />
            <path d="M12 6V2" />
            <path d="M9 3l3 3 3-3" />
        </svg>
    )
}

function CertificateIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <path d="M7 8h10" />
            <path d="M7 12h6" />
            <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.2" />
            <path d="M16 14v4" />
            <path d="M14 16h4" />
        </svg>
    )
}

const iconMap = {
    blue: ShieldCheckIcon,
    amber: CarCrashIcon,
    emerald: CertificateIcon,
}

export function InsuranceNuggets() {
    const getColorClasses = (color: string) => {
        switch (color) {
            case "blue":
                return {
                    iconBg: "bg-gradient-to-br from-blue-100 to-blue-200",
                    iconColor: "text-blue-600",
                    hoverBorder: "hover:border-blue-400",
                    accentGlow: "group-hover:shadow-blue-500/20",
                    titleColor: "text-blue-800",
                }
            case "amber":
                return {
                    iconBg: "bg-gradient-to-br from-amber-100 to-orange-200",
                    iconColor: "text-amber-600",
                    hoverBorder: "hover:border-amber-400",
                    accentGlow: "group-hover:shadow-amber-500/20",
                    titleColor: "text-amber-800",
                }
            case "emerald":
                return {
                    iconBg: "bg-gradient-to-br from-emerald-100 to-teal-200",
                    iconColor: "text-emerald-600",
                    hoverBorder: "hover:border-emerald-400",
                    accentGlow: "group-hover:shadow-emerald-500/20",
                    titleColor: "text-emerald-800",
                }
            default:
                return {
                    iconBg: "bg-slate-100",
                    iconColor: "text-slate-600",
                    hoverBorder: "hover:border-slate-300",
                    accentGlow: "group-hover:shadow-slate-500/20",
                    titleColor: "text-slate-800",
                }
        }
    }

    return (
        <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Insurance Solutions</h3>
                <p className="text-slate-600">Essential information about auto insurance in Nigeria</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {nuggets.map((nugget) => {
                    const Icon = iconMap[nugget.color as keyof typeof iconMap]
                    const colors = getColorClasses(nugget.color)

                    return (
                        <Card
                            key={nugget.id}
                            className={`relative glass border-2 border-slate-200 ${colors.hoverBorder} transition-all duration-300 hover:shadow-xl ${colors.accentGlow} hover:-translate-y-2 cursor-pointer group overflow-hidden`}
                        >
                            {/* Vivid Background Pattern */}
                            <div className="absolute inset-0 opacity-[0.03]">
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        backgroundImage: `radial-gradient(circle at 20% 80%, currentColor 1px, transparent 1px), radial-gradient(circle at 80% 20%, currentColor 1px, transparent 1px)`,
                                        backgroundSize: "30px 30px",
                                    }}
                                />
                            </div>

                            {/* Accent Line */}
                            <div
                                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${nugget.color === "blue"
                                    ? "from-blue-500 to-cyan-400"
                                    : nugget.color === "amber"
                                        ? "from-amber-500 to-orange-400"
                                        : "from-emerald-500 to-teal-400"
                                    }`}
                            />

                            <CardContent className="p-6 pt-8 relative flex flex-col items-center text-center">
                                <div
                                    className={`inline-flex p-4 rounded-2xl ${colors.iconBg} mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <Icon className={`w-7 h-7 ${colors.iconColor}`} />
                                </div>

                                <h4
                                    className={`text-base sm:text-lg font-bold ${colors.titleColor} mb-3 leading-snug max-w-[240px] mx-auto`}
                                >
                                    {nugget.title}
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed max-w-[280px] mx-auto">{nugget.description}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </section>
    )
}

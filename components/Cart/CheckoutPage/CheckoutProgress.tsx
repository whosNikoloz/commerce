"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckoutStep = "address" | "payment";

interface CheckoutProgressProps {
    currentStep: CheckoutStep;
    className?: string;
}

const STEPS = [
    { id: "address", label: "Shipping Address" },
    { id: "payment", label: "Payment Method" },
];

export default function CheckoutProgress({ currentStep, className }: CheckoutProgressProps) {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);

    return (
        <div className={cn("w-full max-w-2xl mx-auto mb-12", className)}>
            <div className="relative flex justify-between">
                {/* Background Line */}
                <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-200 dark:bg-white/10 z-0" />

                {/* Active Progress Line */}
                <div
                    className="absolute top-5 left-0 h-[2px] bg-brand-primary transition-all duration-700 z-0"
                    style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                                isCompleted ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20" :
                                    isActive ? "bg-white dark:bg-black border-brand-primary text-brand-primary shadow-xl ring-4 ring-brand-primary/10" :
                                        "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400"
                            )}>
                                {isCompleted ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <span className="text-xs font-black">{index + 1}</span>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                                isActive ? "text-brand-primary" : "text-slate-400"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

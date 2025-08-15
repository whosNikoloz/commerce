'use client';

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function Loading() {
    const cards = Array.from({ length: 12 });
    const isMobile = useIsMobile();

    return (
        <div className={cn(isMobile ? "min-h-screen" : "min-h-screen mt-16")}>
            <div className="container mx-auto px-4 py-4 lg:py-6">
                <div className="grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-8">
                    <div className="hidden lg:block bg-brand-muted dark:bg-brand-muteddark sticky top-6 h-fit max-h-[calc(100vh-3rem)] overflow-y-auto border rounded-lg p-6 shadow-sm">
                        <div className="space-y-6 animate-pulse">
                            <div>
                                <div className="h-5 w-32 rounded bg-gray-300/40 dark:bg-gray-600/40" />
                                <div className="mt-4 space-y-2">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="h-4 w-40 rounded bg-gray-300/40 dark:bg-gray-600/40" />
                                            <div className="h-4 w-10 rounded bg-gray-300/30 dark:bg-gray-600/30" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="h-5 w-28 rounded bg-gray-300/40 dark:bg-gray-600/40" />
                                    <div className="space-y-2">
                                        {Array.from({ length: 4 }).map((_, j) => (
                                            <div key={j} className="h-4 w-48 rounded bg-gray-300/30 dark:bg-gray-600/30" />
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="h-9 w-full rounded bg-gray-300/40 dark:bg-gray-600/40" />
                        </div>
                    </div>

                    <div className="space-y-4 lg:space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="space-y-2 animate-pulse">
                                <div className="h-6 w-40 rounded bg-gray-300/40 dark:bg-gray-600/40" />
                                <div className="h-4 w-28 rounded bg-gray-300/30 dark:bg-gray-600/30" />
                            </div>

                            <div className="flex items-center gap-2 lg:gap-4 animate-pulse">
                                <div className="h-9 w-36 rounded bg-gray-300/40 dark:bg-gray-600/40" />
                                <div className="flex">
                                    <div className="h-9 w-10 rounded-l-md bg-gray-300/40 dark:bg-gray-600/40" />
                                    <div className="h-9 w-10 rounded-r-md bg-gray-300/30 dark:bg-gray-600/30" />
                                </div>
                                <div className="h-6 w-8 rounded bg-gray-300/30 dark:bg-gray-600/30" />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 animate-pulse">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-6 w-24 rounded bg-gray-300/30 dark:bg-gray-600/30" />
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            {cards.map((_, i) => (
                                <div
                                    key={i}
                                    className="group bg-brand-muted dark:bg-brand-muteddark border rounded-lg shadow-sm p-3 lg:p-4"
                                >
                                    <div className="animate-pulse">
                                        <div className="w-full aspect-square rounded-md bg-gray-300/40 dark:bg-gray-600/40" />

                                        <div className="mt-3 space-y-2">
                                            <div className="h-4 w-3/4 rounded bg-gray-300/40 dark:bg-gray-600/40" />
                                            <div className="flex items-center gap-2">
                                                <div className="h-5 w-20 rounded bg-gray-300/40 dark:bg-gray-600/40" />
                                                <div className="h-4 w-12 rounded bg-gray-300/30 dark:bg-gray-600/30" />
                                            </div>
                                            <div className="h-3 w-32 rounded bg-gray-300/30 dark:bg-gray-600/30" />
                                            <div className="h-9 w-full rounded bg-gray-300/40 dark:bg-gray-600/40" />
                                            <div className="h-9 w-full rounded bg-gray-300/30 dark:bg-gray-600/30" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-center gap-2 animate-pulse">
                            <div className="h-9 w-20 rounded bg-gray-300/40 dark:bg-gray-600/40" />
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-9 w-9 rounded bg-gray-300/30 dark:bg-gray-600/30" />
                            ))}
                            <div className="h-9 w-20 rounded bg-gray-300/40 dark:bg-gray-600/40" />
                        </div>
                    </div>
                </div>

                <div className="lg:hidden mt-4 animate-pulse">
                    <div className="h-9 w-28 rounded bg-gray-300/40 dark:bg-gray-600/40" />
                </div>
            </div>
        </div>
    );
}

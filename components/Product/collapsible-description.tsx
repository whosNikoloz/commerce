"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useDictionary } from "@/app/context/dictionary-provider";
import { cn, stripInlineColors } from "@/lib/utils";

interface CollapsibleDescriptionProps {
    htmlContent: string;
    maxHeight?: number;
    className?: string;
}

export function CollapsibleDescription({
    htmlContent,
    maxHeight = 400,
    className = "",
}: CollapsibleDescriptionProps) {
    const dict = useDictionary();
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldCollapse, setShouldCollapse] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            // Small buffer (30px) so we don't collapse if it's only slightly over
            setShouldCollapse(contentRef.current.scrollHeight > maxHeight + 30);
        }
    }, [htmlContent, maxHeight]);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <div className={cn("relative w-full", className)}>
            <motion.div
                animate={{
                    height: isExpanded ? "auto" : shouldCollapse ? maxHeight : "auto",
                }}
                className={cn(
                    "overflow-hidden relative",
                    !isExpanded && shouldCollapse && "cursor-pointer"
                )}
                initial={false}
                transition={{
                    type: "tween",
                    duration: 0.4,
                    ease: [0.25, 0.1, 0.25, 1] // cubic-bezier for smooth ease-out
                }}
                onClick={() => !isExpanded && shouldCollapse && toggleExpand()}
            >
                <div
                    dangerouslySetInnerHTML={{ __html: stripInlineColors(htmlContent) }}
                    ref={contentRef}
                    className={cn(
                        "rich-content w-full prose prose-slate max-w-none",
                        // This line forces the text color to change based on the theme
                        "text-slate-900 dark:text-slate-100",
                        // This ensures the prose plugin respects the dark mode
                        "dark:prose-invert",
                        // Override paragraph colors specifically for dark mode
                        "prose-p:text-slate-700 dark:prose-p:text-slate-300",
                        !isExpanded && shouldCollapse && "[mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]"
                    )}
                />
            </motion.div>

            {shouldCollapse && (
                <div className="flex items-center justify-center gap-4 mt-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    <Button
                        className={cn(
                            "group flex items-center justify-center gap-2 px-6 py-2 h-9 min-w-[140px]",
                            "text-sm font-medium",
                            "border-border/60 hover:border-brand-primary/50",
                            "bg-background hover:bg-brand-primary/5",
                            "text-muted-foreground hover:text-brand-primary",
                            "rounded-full transition-all duration-200"
                        )}
                        size="sm"
                        variant="outline"
                        onClick={toggleExpand}
                    >
                        <span>{isExpanded ? dict.common.readLess : dict.common.readMore}</span>
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <ChevronDown className="h-4 w-4" />
                        </motion.div>
                    </Button>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
            )}
        </div>
    );
}
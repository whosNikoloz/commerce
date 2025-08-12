"use client";

import Link from "next/link";
import { useRef } from "react";

type LanguageKey = "en" | "ka";

interface HeroProps {
    lng: LanguageKey;
}

export default function Hero({ lng }: HeroProps) {
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const handleScroll = () => {
        window.scrollBy({
            top: window.innerHeight - 100,
            behavior: "smooth"
        });
    };

    const languageData: Record<LanguageKey, {
        span1: string;
        span2: string;
        h1: string;
        h1span: string;
        h1span2: string;
    }> = {
        en: {
            span1: "Discover the project",
            span2: "Learn More",
            h1: "Welcome to",
            h1span: "Test",
            h1span2: "test",
        },
        ka: {
            span1: "პროექტის მიზანი",
            span2: "გაიგე მეტი",
            h1: "მოგესალმებით",
            h1span: "Test",
            h1span2: "test",
        },
    };

    const { span1, span2, h1, h1span, h1span2 } = languageData[lng];

    return (
        <div className="flex flex-col justify-center items-center text-center h-full text-white">
            <h2 className="text-lg sm:text-xl font-light tracking-wide uppercase mb-4">
                {span1}
            </h2>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-tight mb-2">
                {h1}{" "}
                <span
                    className="bg-gradient-to-r from-blue-500 via-blue-400 to-white text-transparent bg-clip-text"
                >
                    {h1span}
                </span>
            </h1>

            <p className="text-lg sm:text-xl font-medium">{h1span2}</p>

            <button
                onClick={handleScroll}
                className="mt-12 px-6 py-3 border border-white text-white rounded-full hover:bg-white hover:text-black transition"
            >
                {span2}
            </button>

            <div ref={scrollRef}></div>
        </div>
    );
}

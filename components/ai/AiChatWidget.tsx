"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useParams } from "next/navigation";
import Link from "next/link";

import { useUser } from "@/app/context/userContext";

type Message = {
    role: "user" | "model";
    text: string;
};

export default function AiChatWidget() {
    const { user } = useUser();
    const params = useParams();
    const lang = (params?.lang as string) || "ka";

    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const initialMessage =
        lang === "ka"
            ? "გამარჯობა! მე ვარ თქვენი AI პროდუქტების კონსულტანტი. რით შემიძლია დაგეხმაროთ?"
            : "Hello! I'm your AI Product Consultant. How can I help you find the perfect product today?";

    const [messages, setMessages] = useState<Message[]>([
        { role: "model", text: initialMessage },
    ]);

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);

        checkMobile();
        window.addEventListener("resize", checkMobile, { passive: true });

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Scroll to bottom & lock body on mobile
    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            if (isMobile) {
                document.body.style.overflow = "hidden";
            }
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [messages, isOpen, isMobile, scrollToBottom]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();

        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
        setIsLoading(true);

        try {
            const history = messages
                .filter((_, index) => index > 0)
                .map((m) => ({
                    role: m.role,
                    parts: [{ text: m.text }],
                }));

            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: history,
                    lang: lang,
                }),
            });

            const data = await res.json();

            if (data.text) {
                setMessages((prev) => [...prev, { role: "model", text: data.text }]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "model",
                        text:
                            lang === "ka"
                                ? "წარმოიშვა შეცდომა. გთხოვთ სცადოთ მოგვიანებით."
                                : "Sorry, I encountered an error. Please try again.",
                    },
                ]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "model",
                    text:
                        lang === "ka"
                            ? "კავშირის შეცდომა. გთხოვთ შეამოწმოთ ინტერნეტი."
                            : "Connection error. Please check your internet.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* ===== FLOATING BUTTON ===== */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        animate={{ scale: 1, opacity: 1 }}
                        aria-label="Open AI Chat"
                        className="h-14 w-14 rounded-full bg-brand-primary text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow"
                        exit={{ scale: 0, opacity: 0 }}
                        initial={{ scale: 0, opacity: 0 }}
                        style={{
                            position: "fixed",
                            bottom: isMobile ? 16 : 24,
                            right: isMobile ? 16 : 24,
                            zIndex: 50,
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                    >
                        <Sparkles className="h-6 w-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ===== BACKDROP (mobile only) ===== */}
            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/50 z-[99] backdrop-blur-sm"
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* ===== CHAT WINDOW ===== */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
                        className={`
                            flex flex-col bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden
                            ${isMobile
                                ? "rounded-t-[32px]"
                                : "rounded-[28px] border border-zinc-200 dark:border-zinc-800"
                            }
                        `}
                        exit={isMobile ? { y: "100%" } : { opacity: 0, y: 20, scale: 0.95 }}
                        initial={isMobile ? { y: "100%" } : { opacity: 0, y: 20, scale: 0.95 }}
                        style={
                            isMobile
                                ? {
                                      position: "fixed",
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      height: "85dvh",
                                      zIndex: 100,
                                  }
                                : {
                                      position: "fixed",
                                      bottom: 24,
                                      right: 24,
                                      width: 400,
                                      height: 550,
                                      maxHeight: "80vh",
                                      zIndex: 100,
                                  }
                        }
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        {/* ----- HEADER ----- */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-[14px] bg-brand-primary/10 flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base text-zinc-900 dark:text-white">
                                        {lang === "ka" ? "AI კონსულტანტი" : "AI Consultant"}
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {lang === "ka" ? "ონლაინ" : "Online"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="h-9 w-9 rounded-[12px] flex items-center justify-center text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {isMobile ? <ChevronDown className="h-5 w-5" /> : <X className="h-5 w-5" />}
                            </button>
                        </div>

                        {/* ----- MESSAGES ----- */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950">
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`
                                            max-w-[85%] px-4 py-3 text-sm leading-relaxed
                                            ${m.role === "user"
                                                ? "bg-brand-primary text-white rounded-[22px] rounded-br-lg"
                                                : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-[22px] rounded-bl-lg shadow-sm border border-zinc-100 dark:border-zinc-700"
                                            }
                                        `}
                                    >
                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-ul:my-1 prose-li:my-0 prose-a:text-inherit prose-a:underline">
                                            <ReactMarkdown
                                                components={{
                                                    a: ({ node, ...props }) => (
                                                        <Link
                                                            className="underline underline-offset-2 hover:opacity-80"
                                                            href={props.href || "#"}
                                                        >
                                                            {props.children}
                                                        </Link>
                                                    ),
                                                }}
                                            >
                                                {m.text}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-zinc-800 rounded-[22px] rounded-bl-lg px-4 py-3 shadow-sm border border-zinc-100 dark:border-zinc-700">
                                        <div className="flex gap-1.5">
                                            {[0, 1, 2].map((i) => (
                                                <motion.span
                                                    key={i}
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    className="h-2 w-2 rounded-full bg-brand-primary"
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 1.2,
                                                        delay: i * 0.2,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* ----- INPUT ----- */}
                        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                            <form
                                className="flex items-center gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                            >
                                <input
                                    className="flex-1 px-4 py-3 rounded-[18px] bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all"
                                    disabled={isLoading}
                                    placeholder={
                                        lang === "ka"
                                            ? "დაწერეთ შეტყობინება..."
                                            : "Type a message..."
                                    }
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button
                                    className={`
                                        h-11 w-11 rounded-[14px] flex items-center justify-center transition-all
                                        ${input.trim()
                                            ? "bg-brand-primary text-white hover:bg-brand-primaryDark shadow-md"
                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                                        }
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                    disabled={!input.trim() || isLoading}
                                    type="submit"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </form>

                            {/* Safe area padding for iOS */}
                            <div className="h-[env(safe-area-inset-bottom)]" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

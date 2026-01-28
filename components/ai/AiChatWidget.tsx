"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@/app/context/userContext";
import { MessageCircle, X, Send, Sparkles, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

type Message = {
    role: "user" | "model";
    text: string;
}

export default function AiChatWidget() {
    const { user } = useUser();
    const params = useParams();
    const lang = (params?.lang as string) || "ka";

    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Initial greeting based on language
    const initialMessage = lang === "ka"
        ? "გამარჯობა! მე ვარ თქვენი AI პროდუქტების კონსულტანტი. რით შემიძლია დაგეხმაროთ?"
        : "Hello! I'm your AI Product Consultant. How can I help you find the perfect product today?";

    const [messages, setMessages] = useState<Message[]>([
        { role: "model", text: initialMessage }
    ]);

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            // Lock body scroll on mobile
            if (isMobile) {
                document.body.style.overflow = 'hidden';
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [messages, isOpen, isMobile]);

    if (!user) return null;


    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: userMessage }]);
        setIsLoading(true);

        try {
            // Prepare history for API
            // Filter out the initial greeting if it's the first message, as Gemini expects history to start with user
            const history = messages
                .filter((_, index) => index > 0)
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: history,
                    lang: lang
                })
            });

            const data = await res.json();

            if (data.text) {
                setMessages(prev => [...prev, { role: "model", text: data.text }]);
            } else {
                setMessages(prev => [...prev, {
                    role: "model",
                    text: lang === "ka" ? "წარმოიშვა შეცდომა. გთხოვთ სცადოთ მოგვიანებით." : "Sorry, I encountered an error. Please try again."
                }]);
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                role: "model",
                text: lang === "ka" ? "უკავშირო შეცდომა. გთხოვთ შეამოწმოთ ინტერნეტი." : "Sorry, check your connection and try again."
            }]);
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

    // Animation variants
    const desktopVariants = {
        initial: { opacity: 0, y: 20, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.9 },
    };

    const mobileVariants = {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
    };

    return (
        <>
            {/* Floating Button (visible when closed) */}
            <div className="fixed bottom-6 right-6 md:bottom-16 md:right-12 z-50">
                <AnimatePresence>
                    {!isOpen && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsOpen(true)}
                            className="h-14 w-14 rounded-full bg-brand-primary text-white shadow-xl shadow-brand-primary/20 flex items-center justify-center transition-all hover:bg-brand-primaryDark"
                            aria-label="Open AI Chat"
                        >
                            <Sparkles className="h-7 w-7" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Backdrop for mobile */}
            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black z-[90] md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={isMobile ? mobileVariants : desktopVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={clsx(
                            "fixed z-[100] flex flex-col bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden",
                            // Mobile: Bottom Sheet, fixed height with dvh
                            "inset-x-0 bottom-0 h-[85dvh] rounded-t-[2rem] md:rounded-none",
                            // Desktop: Floating widget
                            "md:inset-x-auto md:left-auto md:right-12 md:bottom-32 md:w-[400px] md:h-[650px] md:max-h-[80vh] md:rounded-3xl md:border md:border-zinc-200 md:dark:border-zinc-800"
                        )}
                    >
                        {/* Header */}
                        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 p-4 md:p-5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                                        {lang === 'ka' ? 'AI კონსულტანტი' : 'AI Consultant'}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {lang === 'ka' ? 'ონლაინ რეჟიმში' : 'Always active'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 dark:text-zinc-400"
                            >
                                {isMobile ? <ChevronDown className="h-6 w-6" /> : <X className="h-6 w-6" />}
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 bg-white dark:bg-zinc-900 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800"
                        >
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={clsx(
                                        "flex flex-col max-w-[85%] text-sm md:text-base leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300",
                                        m.role === "user"
                                            ? "self-end items-end"
                                            : "self-start items-start"
                                    )}
                                >
                                    <div className={clsx(
                                        "px-5 py-3.5 rounded-2xl shadow-sm",
                                        m.role === "user"
                                            ? "bg-brand-primary text-white rounded-br-sm"
                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-sm"
                                    )}>
                                        <div className="prose dark:prose-invert max-w-none text-inherit text-sm md:text-base prose-p:my-0 prose-ul:my-1 prose-li:my-0">
                                            <ReactMarkdown
                                                components={{
                                                    a: ({ node, ...props }) => (
                                                        <Link
                                                            href={props.href || "#"}
                                                            className="underline underline-offset-2 font-medium hover:opacity-80 transition-opacity"
                                                        >
                                                            {props.children}
                                                        </Link>
                                                    )
                                                }}
                                            >
                                                {m.text}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="self-start flex items-center gap-2 p-2">
                                    <div className="flex gap-1">
                                        <motion.span
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                                            className="h-2 w-2 rounded-full bg-brand-primary"
                                        />
                                        <motion.span
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                                            className="h-2 w-2 rounded-full bg-brand-primary"
                                        />
                                        <motion.span
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                                            className="h-2 w-2 rounded-full bg-brand-primary"
                                        />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-5 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 shrink-0 mb-[env(safe-area-inset-bottom)]">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={lang === 'ka' ? 'დაწერეთ შეტყობინება...' : 'Type your message...'}
                                    className="w-full pl-5 pr-14 py-4 rounded-[2rem] bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all border-none"
                                    disabled={isLoading}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={!input.trim() || isLoading}
                                        className={clsx(
                                            "h-10 w-10 rounded-full transition-all duration-200",
                                            input.trim()
                                                ? "bg-brand-primary text-white hover:bg-brand-primaryDark shadow-md"
                                                : "bg-transparent text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                        )}
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

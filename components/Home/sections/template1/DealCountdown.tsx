"use client"

import type { DealCountdownData, Locale } from "@/types/tenant"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Clock, Zap } from "lucide-react"

import { t } from "@/lib/i18n"

interface DealCountdownProps {
  data: DealCountdownData
  locale: Locale
}

export default function DealCountdown({ data, locale }: DealCountdownProps) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(data.endsAtISO).getTime()
      const distance = end - now

      if (distance < 0) {
        setTimeLeft("Ended")
        clearInterval(timer)

        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }, 1000)

    return () => clearInterval(timer)
  }, [data.endsAtISO])

  return (
    <section className="relative py-20 bg-gradient-to-br from-red-600 via-orange-600 to-pink-600 dark:from-red-900 dark:via-orange-900 dark:to-pink-900 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
            <Zap className="h-6 w-6 text-yellow-300 animate-pulse" />
            <Clock className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center text-balance">
            {t(data.title, locale)}
          </h2>
        </div>

        <div className="text-center mb-16">
          <div className="inline-block bg-white dark:bg-gray-900 px-10 py-6 rounded-2xl shadow-2xl border-4 border-white/20">
            <p className="text-4xl md:text-5xl font-mono font-bold text-red-600 dark:text-red-400 tracking-wider">
              {timeLeft || "Loading..."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {data.dealItems.map((item, idx) => (
            <Link
              key={idx}
              className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-white/50"
              href={item.href}
            >
              <div className="aspect-square relative overflow-hidden">
                <Image
                  fill
                  alt={t(item.title, locale)}
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  src={item.image || "/placeholder.svg"}
                />
                {item.originalPrice && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-snug min-h-[2.5rem]">
                  {t(item.title, locale)}
                </h3>

                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">${item.price}</span>
                  {item.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">${item.originalPrice}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

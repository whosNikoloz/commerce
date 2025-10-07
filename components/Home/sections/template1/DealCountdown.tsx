"use client"

import type { DealCountdownData, Locale } from "@/types/tenant"
import type { ProductResponseModel } from "@/types/product"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Clock, Zap } from "lucide-react"

import { t } from "@/lib/i18n"

interface DealCountdownProps {
  data: DealCountdownData
  locale: Locale
  template?: 1 | 2 | 3
  products?: ProductResponseModel[]
}

export default function DealCountdown({ data, locale, template = 1, products }: DealCountdownProps) {
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
    <section className="relative py-24 bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700 dark:from-rose-900 dark:via-pink-900 dark:to-purple-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-20 w-72 h-72 bg-yellow-400/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse delay-500" />
      </div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center gap-6 mb-12">
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/30 shadow-2xl">
            <Zap className="h-7 w-7 text-yellow-300 animate-pulse" />
            <Clock className="h-7 w-7 text-white animate-pulse delay-300" />
          </div>
          <h2 className="text-5xl md:text-6xl font-black font-heading text-white text-center text-balance">
            {t(data.title, locale)}
          </h2>
        </div>

        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl px-12 py-8 rounded-3xl shadow-2xl border-2 border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            <p className="text-5xl md:text-6xl font-mono font-black text-white tracking-widest relative z-10">
              {timeLeft || "Loading..."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {(products || []).slice(0, 4).map((product, idx) => {
            const discount = product.discountPrice ? product.discountPrice : null
            const originalPrice = discount ? product.price : null
            const price = discount || product.price

            return (
              <Link
                key={product.id}
                className="group bg-white dark:bg-brand-surfacedark rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-white/50"
                href={`/product/${product.id}`}
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    fill
                    alt={product.name || "Product"}
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    src={product.images?.[0] || "/placeholder.svg"}
                  />
                  {originalPrice && (
                    <div className="absolute top-3 right-3 bg-tech-plasma text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {Math.round((1 - price / originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-bold font-heading text-text-light dark:text-text-lightdark mb-3 line-clamp-2 leading-snug min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-tech-plasma dark:text-tech-plasma">${price}</span>
                    {originalPrice && (
                      <span className="text-sm text-text-subtle dark:text-text-subtledark line-through">
                        ${originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

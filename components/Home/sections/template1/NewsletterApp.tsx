"use client"

import type React from "react"
import type { NewsletterAppData, Locale } from "@/types/tenant"

import { useState } from "react"
import { Mail, Smartphone, Send } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { t } from "@/lib/i18n"

interface NewsletterAppProps {
  data: NewsletterAppData
  locale: Locale
}

export default function NewsletterApp({ data, locale }: NewsletterAppProps) {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Subscribe:", email)
  }

  return (
    <section className="relative py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1),transparent_40%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
                  <Mail className="h-8 w-8" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-balance">{t(data.title, locale)}</h2>
              </div>

              <p className="text-xl text-white/90 leading-relaxed">{t(data.description, locale)}</p>

              <form className="flex flex-col sm:flex-row gap-3 pt-2" onSubmit={handleSubmit}>
                <Input
                  required
                  className="flex-1 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm h-14 text-base border-2 border-white/20 focus:border-white shadow-lg"
                  placeholder={t(data.emailPlaceholder, locale)}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  className="bg-white text-purple-700 hover:bg-white/90 font-bold h-14 px-8 shadow-lg hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap"
                  size="lg"
                  type="submit"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {t(data.ctaLabel, locale)}
                </Button>
              </form>

              {data.appLinks && (
                <div className="pt-6 border-t border-white/20">
                  <p className="text-sm text-white/80 mb-4 flex items-center gap-2 font-semibold">
                    <Smartphone className="h-5 w-5" />
                    Download our mobile app
                  </p>
                  <div className="flex gap-4">
                    {data.appLinks.ios && (
                      <Link
                        className="h-12 w-36 relative opacity-90 hover:opacity-100 transition-all hover:scale-105"
                        href={data.appLinks.ios}
                      >
                        <Image fill alt="Download on App Store" className="object-contain" src="/app-store-badge.svg" />
                      </Link>
                    )}
                    {data.appLinks.android && (
                      <Link
                        className="h-12 w-36 relative opacity-90 hover:opacity-100 transition-all hover:scale-105"
                        href={data.appLinks.android}
                      >
                        <Image
                          fill
                          alt="Get it on Google Play"
                          className="object-contain"
                          src="/google-play-badge.svg"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/20 shadow-2xl">
                <div className="bg-gradient-to-br from-white/20 to-white/5 rounded-2xl p-8">
                  <Mail className="h-40 w-40 text-white/40 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import type React from "react"
import type { LocalizedText } from "@/types/tenant"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Moon, Sun, Globe, Phone, MapPin, ChevronDown } from "lucide-react"
import Image from "next/image"

import { useTenant } from "@/app/context/tenantContext"
import { useDictionary } from "@/app/context/dictionary-provider"

function getLocalizedText(text: LocalizedText | string | undefined, locale: string): string {
  if (!text) return ""
  if (typeof text === "string") return text

  return text[locale] || text.en || Object.values(text)[0] || ""
}

export default function Footer() {
  const { config } = useTenant()
  const dictionary = useDictionary()
  const pathname = usePathname()

  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [language, setLanguage] = useState("en")
  const [selectedStore, setSelectedStore] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)

  // Extract current locale from pathname
  const currentLocale = pathname.split("/")[1] || config?.siteConfig?.localeDefault || "en"

  useEffect(() => {
    setMounted(true)
    setLanguage(currentLocale)

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null

    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const initialTheme = prefersDark ? "dark" : "light"

      setTheme(initialTheme)
      document.documentElement.classList.toggle("dark", prefersDark)
    }

    // Initialize selected store from tenant business stores
    const stores = config?.siteConfig?.business?.stores

    if (stores && stores.length > 0 && !selectedStore) {
      const savedStore = localStorage.getItem("selectedStore")

      setSelectedStore(savedStore || stores[0].id)
    }
  }, [currentLocale, config, selectedStore])

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      if (!target.closest('.language-dropdown-container')) {
        setIsLanguageDropdownOpen(false)
      }
    }

    if (isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)

      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isLanguageDropdownOpen])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"

    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    localStorage.setItem("theme", newTheme)
  }

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang)
    localStorage.setItem("language", newLang)
    setIsLanguageDropdownOpen(false)

    // Navigate to the new language path
    const pathParts = pathname.split("/").filter(Boolean)
    const isLocaleInPath = pathParts[0] && /^[a-z]{2,3}$/.test(pathParts[0])

    let newPath = ""

    if (isLocaleInPath) {
      pathParts[0] = newLang
      newPath = "/" + pathParts.join("/")
    } else {
      newPath = `/${newLang}${pathname}`
    }

    window.location.href = newPath
  }

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStore(e.target.value)
    localStorage.setItem("selectedStore", e.target.value)
  }

  if (!mounted || !config) return null

  const { siteConfig } = config
  const business = siteConfig.business || {}
  const stores = business.stores || []
  const currentStore = stores.find((s) => s.id === selectedStore)
  const availableLocales = siteConfig.locales || ["en"]
  const socialLinks = siteConfig.links || {}

  // Get company info with fallbacks
  const companyName = getLocalizedText(business.companyName, currentLocale) || siteConfig.name
  const companyTagline = getLocalizedText(business.companyTagline, currentLocale) ||
    getLocalizedText(siteConfig.slogan, currentLocale) ||
    siteConfig.description
  const logoText = business.logoText || siteConfig.shortName?.substring(0, 2).toUpperCase() || "PS"
  const copyrightText = getLocalizedText(business.copyright, currentLocale) ||
    `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`

  // Build translations from dictionary
  const t = {
    information: dictionary?.footer?.information || "Information",
    delivery: dictionary?.footer?.delivery || "Delivery",
    faq: dictionary?.footer?.faq || "FAQ",
    guarantee: dictionary?.footer?.guarantee || "Guarantee",
    privacy: dictionary?.footer?.privacy || "Privacy Policy",
    returns: dictionary?.footer?.returns || "Return Policy",
    stores: dictionary?.footer?.stores || "Stores",
    terms: dictionary?.footer?.terms || "Terms & Conditions",
    about: dictionary?.footer?.about || "About Us",
    help: dictionary?.footer?.help || "Help & Support",
    language: dictionary?.common?.language || "Language",
    location: dictionary?.common?.location || "Location",
    visitStores: dictionary?.footer?.visitStores || "Visit Our Stores",
    address: dictionary?.common?.address || "Address",
    hours: dictionary?.common?.hours || "Hours",
    contact: dictionary?.common?.contact || "Contact",
    cookiePolicy: currentLocale === "ka" ? "Cookie პოლიტიკა" : "Cookie Policy",
  }

  // Build language options
  const languages: Record<string, string> = {}

  availableLocales.forEach((locale) => {
    const flagMap: Record<string, string> = {
      en: "🇬🇧",
      ka: "🇬🇪",
      es: "🇪🇸",
      fr: "🇫🇷",
      de: "🇩🇪",
      ru: "🇷🇺",
      uz: "🇺🇿",
    }
    const nameMap: Record<string, string> = {
      en: "English",
      ka: "ქართული",
      es: "Español",
      fr: "Français",
      de: "Deutsch",
      ru: "Русский",
      uz: "O'zbek",
    }

    languages[locale] = `${flagMap[locale] || ""} ${nameMap[locale] || locale.toUpperCase()}`
  })

  return (
    <footer className="border-t border-border bg-background text-foreground">
      {/* Store Locations Section - Only show if stores are configured */}
      {stores.length > 0 && (
        <div className="border-b border-border bg-secondary/40 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-heading mb-8 text-center text-2xl font-bold md:text-3xl">{t.visitStores}</h2>

            {/* Store Selector */}
            <div className="mb-8 flex justify-center">
              <select
                aria-label="Select store location"
                className="rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium outline-none cursor-pointer hover:bg-muted transition-colors"
                value={selectedStore}
                onChange={handleStoreChange}
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.flagEmoji ? `${store.flagEmoji} ` : ""}
                    {getLocalizedText(store.name, currentLocale)}
                  </option>
                ))}
              </select>
            </div>

            {/* Google Maps and Store Info Grid */}
            {currentStore && (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Google Maps Embed */}
                {(currentStore.mapsEmbed || business.mapsEmbed) && (
                  <div className="lg:col-span-2">
                    <div className="relative h-0 overflow-hidden rounded-lg shadow-lg" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        allowFullScreen
                        height="450"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={currentStore.mapsEmbed || business.mapsEmbed}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: 0,
                        }}
                        title={`${getLocalizedText(currentStore.name, currentLocale)} location on map`}
                        width="100%"
                      />
                    </div>
                  </div>
                )}

                {/* Store Details Card */}
                <div className={(currentStore.mapsEmbed || business.mapsEmbed) ? "" : "lg:col-span-3"}>
                  <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    <h3 className="font-heading mb-6 text-xl font-bold text-foreground">
                      {getLocalizedText(currentStore.name, currentLocale)}
                    </h3>

                    <div className="space-y-5">
                      {/* Address */}
                      <div>
                        <p className="font-primary mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {t.address}
                        </p>
                        <p className="font-primary text-sm text-foreground">
                          {getLocalizedText(currentStore.address, currentLocale)}
                        </p>
                      </div>

                      {/* Phone */}
                      <div>
                        <p className="font-primary mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {t.contact}
                        </p>
                        <a className="font-primary text-sm font-medium text-primary hover:underline transition-colors"
                          href={`tel:${getLocalizedText(currentStore.phone, currentLocale)}`}
                        >
                          {getLocalizedText(currentStore.phone, currentLocale)}
                        </a>
                      </div>

                      {/* Hours */}
                      <div>
                        <p className="font-primary mb-2 text-sm font-semibold text-muted-foreground">{t.hours}</p>
                        <p className="font-primary text-sm text-foreground">
                          {getLocalizedText(currentStore.hours, currentLocale)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Control Section */}
      <div className="border-b border-border px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0">
                <Image
                  alt={companyName}
                  className="object-contain"
                  height={100}
                  src={siteConfig.logoDark || siteConfig.logoLight || `https://via.placeholder.com/100x100.png?text=${logoText}`}
                  width={100}
                />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-balance">{companyName}</h3>
                <p className="font-primary text-xs text-muted-foreground">{companyTagline}</p>
              </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Theme Toggle */}
              <button
                aria-label="Toggle theme"
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-secondary"
                onClick={toggleTheme}
              >
                {theme === "light" ? (
                  <>
                    <Moon className="h-4 w-4" />
                    <span className="font-primary text-sm font-medium">Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4" />
                    <span className="font-primary text-sm font-medium">Light</span>
                  </>
                )}
              </button>

              {/* Language Selector */}
              {availableLocales.length > 1 && (
                <div className="relative language-dropdown-container">
                  <button
                    aria-label="Select language"
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-secondary"
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  >
                    <Globe className="h-4 w-4" />
                    <span className="font-primary text-sm font-medium">{languages[language]}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isLanguageDropdownOpen && (
                    <div className="absolute bottom-full mb-2 right-0 z-50 min-w-[180px] rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                      <div className="py-1">
                        {Object.entries(languages).map(([code, name]) => (
                          <button
                            key={code}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-secondary ${language === code ? 'bg-secondary/50 font-semibold' : ''
                              }`}
                            onClick={() => handleLanguageChange(code)}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
            {/* Information Column */}
            <div>
              <h4 className="font-heading mb-4 font-semibold text-foreground">{t.information}</h4>
              <ul className="space-y-3">
                <li>
                  <a className="font-primary text-sm text-muted-foreground hover:text-foreground transition-colors" href={`/${currentLocale}/info/delivery`}>
                    {t.delivery}
                  </a>
                </li>
                <li>
                  <a className="font-primary text-sm text-muted-foreground hover:text-foreground transition-colors" href={`/${currentLocale}/info/stores`}>
                    {t.stores}
                  </a>
                </li>
                <li>
                  <a className="font-primary text-sm text-muted-foreground hover:text-foreground transition-colors" href={`/${currentLocale}/info/about`}>
                    {t.about}
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="font-heading mb-4 font-semibold text-foreground">{t.help}</h4>
              <ul className="space-y-3">
                <li>
                  <a className="font-primary text-sm text-muted-foreground hover:text-foreground transition-colors" href={`/${currentLocale}/info/faq`}>
                    {t.faq}
                  </a>
                </li>
                <li>
                  <a className="font-primary text-sm text-muted-foreground hover:text-foreground transition-colors" href={`/${currentLocale}/info/return-policy`}>
                    {t.returns}
                  </a>
                </li>
                <li>
                  <a className="font-primary text-sm text-muted-foreground hover:text-foreground transition-colors" href={`/${currentLocale}/info/guarantee`}>
                    {t.guarantee}
                  </a>
                </li>
              </ul>
            </div>

            {/* Policies Column */}
            <div>
              <h4 className="font-heading mb-4 font-semibold text-foreground">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a className="font-primary text-sm text-muted-foreground hover:text-foreground transition-colors" href={`/${currentLocale}/info/privacy-policy`}>
                    {t.privacy}
                  </a>
                </li>
                <li>
                  <a className="font-primary text-sm text-muted-foreground hover:text-foreground transition-colors" href={`/${currentLocale}/info/terms-and-conditions`}>
                    {t.terms}
                  </a>
                </li>
                <li>
                  <a className="font-primary text-sm text-muted-foreground hover:text-foreground transition-colors" href={`/${currentLocale}/cookie-policy`}>
                    {t.cookiePolicy}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="font-primary text-xs text-muted-foreground">{copyrightText}</p>
            <div className="flex gap-6">
              {socialLinks.facebook && (
                <a className="font-primary text-xs text-muted-foreground hover:text-foreground transition-colors" href={socialLinks.facebook} rel="noopener noreferrer" target="_blank">
                  Facebook
                </a>
              )}
              {socialLinks.tiktok && (
                <a className="font-primary text-xs text-muted-foreground hover:text-foreground transition-colors" href={socialLinks.tiktok} rel="noopener noreferrer" target="_blank">
                  Tiktok
                </a>
              )}
              {socialLinks.instagram && (
                <a className="font-primary text-xs text-muted-foreground hover:text-foreground transition-colors" href={socialLinks.instagram} rel="noopener noreferrer" target="_blank">
                  Instagram
                </a>
              )}
              {socialLinks.twitter && (
                <a className="font-primary text-xs text-muted-foreground hover:text-foreground transition-colors" href={socialLinks.twitter} rel="noopener noreferrer" target="_blank">
                  Twitter
                </a>
              )}
              {socialLinks.youtube && (
                <a className="font-primary text-xs text-muted-foreground hover:text-foreground transition-colors" href={socialLinks.youtube} rel="noopener noreferrer" target="_blank">
                  YouTube
                </a>
              )}
              {socialLinks.linkedin && (
                <a className="font-primary text-xs text-muted-foreground hover:text-foreground transition-colors" href={socialLinks.linkedin} rel="noopener noreferrer" target="_blank">
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

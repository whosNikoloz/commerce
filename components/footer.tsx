"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Facebook, Instagram, Twitter, Youtube, Linkedin,
  Mail, Phone, MapPin, Clock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTenant } from "@/app/context/tenantContext";
import { useTranslation } from "@/hooks/useTranslation";

// --- helpers for BusinessInfo -----------------------------------------------
type LocalizedText = Record<string, string>;

function getLocalized(obj?: LocalizedText, lng?: string) {
  if (!obj) return "";
  if (lng && obj[lng]) return obj[lng];
  const first = Object.values(obj)[0];
  return first ?? "";
}

function formatAddress(addr?: {
  street?: string; city?: string; region?: string;
  postalCode?: string; country?: string;
}) {
  if (!addr) return "";
  const parts = [addr.street, addr.city, addr.region, addr.postalCode, addr.country].filter(Boolean);
  return parts.join(", ");
}

type OpeningHour = { dayOfWeek: string; opens: string; closes: string };

/** Group consecutive days that share the same hours: Mon–Fri 09:00–18:00 */
function groupOpeningHours(rows?: OpeningHour[]) {
  if (!rows?.length) return [] as { label: string; hours: string }[];

  const order = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const byOrder = [...rows].sort((a, b) => order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek));

  const out: { days: string[]; hours: string }[] = [];
  for (const r of byOrder) {
    const hours = `${r.opens}–${r.closes}`;
    const last = out[out.length - 1];
    if (last && last.hours === hours) last.days.push(r.dayOfWeek);
    else out.push({ days: [r.dayOfWeek], hours });
  }
  const short = (ds: string[]) =>
    ds.length > 2 ? `${ds[0].slice(0,3)}–${ds[ds.length-1].slice(0,3)}` : ds.map(d => d.slice(0,3)).join(", ");

  return out.map(g => ({ label: short(g.days), hours: g.hours }));
}

function buildMapsLink(addressStr: string, geo?: { latitude?: number; longitude?: number }) {
  if (geo?.latitude != null && geo?.longitude != null) {
    return `https://maps.google.com/?q=${geo.latitude},${geo.longitude}`;
  }
  if (addressStr) {
    return `https://maps.google.com/?q=${encodeURIComponent(addressStr)}`;
  }
  return "";
}

// ----------------------------------------------------------------------------

export function Footer() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const year = useMemo(() => new Date().getFullYear(), []);
  const { config, isLoading } = useTenant();
  const t = useTranslation();
  const params = useParams();
  const lng = (params.lang as string) || "ka";

  useEffect(() => setMounted(true), []);
  const toggleTheme = () => mounted && setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  if (isLoading || !config || !t) return null;

  const site = config.siteConfig;
  const business = site.business || {};
  const links = site.links || {};

  // safe translation groups + unified labels (handles key mismatches)
  const tf = (t && t.footer) || {};
  const tc = (t && t.common) || {};
  const labels = {
    stayUpdated: (tf as any).stayUpdated ?? "Stay updated",
    tagline:
      (tf as any).tagline ??
      (tf as any).weeklyDrops ??
      (tf as any).newsletterDescription ??
      "Weekly drops, exclusive deals, and news.",
    information: (tf as any).information ?? "Information",
    helpAndSupport: (tf as any).helpAndSupport ?? "Help & Support",
    about: (tf as any).about ?? (tf as any).aboutSection ?? "About",
    delivery: (tf as any).delivery ?? "Delivery",
    guarantee: (tf as any).guarantee ?? "Guarantee",
    privacyPolicy: (tf as any).privacyPolicy ?? "Privacy Policy",
    returnPolicy: (tf as any).returnPolicy ?? "Return Policy",
    stores: (tf as any).stores ?? "Stores",
    termsAndConditions:
      (tf as any).termsAndConditions ?? (tf as any).termsOfService ?? "Terms & Conditions",
    aboutUs: (tf as any).aboutUs ?? "About Us",
    faq: (tc as any).faq ?? "Frequently Asked Questions",
    viewOnMap: (tc as any).viewOnMap ?? "View on map",
    allRightsReserved: (tf as any).allRightsReserved ?? "All rights reserved",
  };

  // pick logo based on theme
  const logoSrc = (resolvedTheme === "dark" ? site.logoDark : site.logoLight) || site.logo || "/logo.svg";

  // BusinessInfo fields
  const phoneLocalized = getLocalized(business.phone as LocalizedText | undefined, lng);
  const emailAddr = business.email || "";
  const addressStr = formatAddress(business.address);
  const hoursGrouped = groupOpeningHours(business.openingHours);
  const mapsUrl = buildMapsLink(addressStr, business.geo);

  const socials = [
    links.facebook && { href: links.facebook, label: "Facebook", icon: Facebook },
    links.instagram && { href: links.instagram, label: "Instagram", icon: Instagram },
    links.twitter && { href: links.twitter, label: "Twitter / X", icon: Twitter },
    links.youtube && { href: links.youtube, label: "YouTube", icon: Youtube },
    links.linkedin && { href: links.linkedin, label: "LinkedIn", icon: Linkedin },
  ].filter(Boolean) as Array<{ href: string; label: string; icon: any }>;

  const infoLinks = [
    { label: labels.delivery, href: `/${lng}/info/delivery` },
    { label: labels.faq, href: `/${lng}/info/faq` },
    { label: labels.guarantee, href: `/${lng}/info/guarantee` },
    { label: labels.privacyPolicy, href: `/${lng}/info/privacy-policy` },
    { label: labels.returnPolicy, href: `/${lng}/info/return-policy` },
    { label: labels.stores, href: `/${lng}/info/stores` },
    { label: labels.termsAndConditions, href: `/${lng}/info/terms-and-conditions` },
    { label: labels.aboutUs, href: `/${lng}/info/about` },
  ];

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.name,
    url: site.url,
    image: site.ogImage || site.logo,
    email: emailAddr || undefined,
    telephone: phoneLocalized || undefined,
    legalName: business.legalName || undefined,
    vatID: business.vatNumber || undefined,
    taxID: business.registrationNumber || undefined,
    address: business.address && {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    geo: business.geo && (business.geo.latitude != null && business.geo.longitude != null) ? {
      "@type": "GeoCoordinates",
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    } : undefined,
    openingHoursSpecification: (business.openingHours || []).map(h => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: Object.values(links).filter(Boolean),
  };

  return (
    <footer className="border-t border-zinc-800 bg-[rgb(var(--brand-surface-dark))] text-[rgb(var(--text-light-dark))]">
      <div className="container mx-auto px-4 py-12">
        {/* TOP: logo + slogan + theme */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link aria-label={site.name} className="inline-flex items-center gap-3" href={`/${lng}`} prefetch={false}>
              <Image alt={site.name} className="h-9 w-auto object-contain" height={40} src={logoSrc} width={140} />
            </Link>
            {site.slogan && (
              <p className="text-sm text-zinc-400">
                {typeof site.slogan === "string" ? site.slogan : getLocalized(site.slogan, lng)}
              </p>
            )}
          </div>
          <button
            className="self-start rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-900 sm:self-auto"
            type="button"
            onClick={toggleTheme}
          >
            {mounted ? (resolvedTheme === "dark" ? "Light" : "Dark") : "Theme"}
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          {/* LEFT: Newsletter + contact */}
          <div className="lg:col-span-5">
            <h2 className="mb-2 text-2xl font-bold text-white leading-tight">{labels.stayUpdated}</h2>
            <p className="mb-4 text-sm text-zinc-400">{labels.tagline}</p>

            <form className="relative" onSubmit={handleNewsletterSubmit}>
              <Input
                required
                aria-label="Email address"
                autoComplete="email"
                className="h-11 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 pr-12"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                aria-label="Subscribe"
                className="absolute right-1 top-1 h-9 w-9 bg-white text-zinc-900 hover:bg-zinc-100"
                size="icon"
                type="submit"
              >
                →
              </Button>
            </form>

            <div className="mt-5 space-y-2 text-sm text-zinc-400">
              {phoneLocalized && (
                <a className="inline-flex items-center gap-2 hover:text-white" href={`tel:${phoneLocalized.replace(/\s+/g, "")}`}>
                  <Phone className="h-4 w-4" /> {phoneLocalized}
                </a>
              )}
              {emailAddr && (
                <a className="ml-4 inline-flex items-center gap-2 hover:text-white" href={`mailto:${emailAddr}`}>
                  <Mail className="h-4 w-4" /> {emailAddr}
                </a>
              )}
              {addressStr && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4" />
                  <p>
                    {addressStr}{" "}
                    {mapsUrl && (
                      <a
                        className="underline decoration-dotted underline-offset-2 hover:text-white"
                        href={mapsUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {labels.viewOnMap}
                      </a>
                    )}
                  </p>
                </div>
              )}

              {hoursGrouped.length > 0 && (
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4" />
                  <div className="space-y-0.5">
                    {hoursGrouped.map((g) => (
                      <p key={`${g.label}-${g.hours}`}>{g.label}: {g.hours}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: links */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <nav>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">
                {labels.information}
              </h3>
              <ul className="space-y-2">
                {infoLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link className="text-sm text-zinc-400 hover:text-white transition-colors" href={href} prefetch={false}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">
                {labels.helpAndSupport}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link className="text-sm text-zinc-400 hover:text-white transition-colors" href={`/${lng}/info/faq`} prefetch={false}>
                    {labels.faq}
                  </Link>
                </li>
                <li>
                  <Link className="text-sm text-zinc-400 hover:text-white transition-colors" href={`/${lng}/info/return-policy`} prefetch={false}>
                    {labels.returnPolicy}
                  </Link>
                </li>
                <li>
                  <Link className="text-sm text-zinc-400 hover:text-white transition-colors" href={`/${lng}/info/terms-and-conditions`} prefetch={false}>
                    {labels.termsAndConditions}
                  </Link>
                </li>
              </ul>
            </nav>

            <nav>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">
                {labels.about}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link className="text-sm text-zinc-400 hover:text-white transition-colors" href={`/${lng}/info/stores`} prefetch={false}>
                    {labels.stores}
                  </Link>
                </li>
                <li>
                  <Link className="text-sm text-zinc-400 hover:text-white transition-colors" href={`/${lng}/info/privacy-policy`} prefetch={false}>
                    {labels.privacyPolicy}
                  </Link>
                </li>
                <li>
                  <Link className="text-sm text-zinc-400 hover:text-white transition-colors" href={`/${lng}/info/guarantee`} prefetch={false}>
                    {labels.guarantee}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-8 flex flex-col gap-4 border-t border-zinc-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6 text-sm">
            <p className="text-zinc-500">
              © {year} {site.shortName || site.name}. {labels.allRightsReserved}
            </p>
            {socials.length > 0 && (
              <div className="flex gap-4">
                {socials.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    aria-label={label}
                    className="inline-flex items-center text-zinc-400 transition-colors hover:text-white"
                    href={href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {(business.legalName || business.vatNumber) && (
            <p className="text-xs text-zinc-500">
              {business.legalName && <span>{business.legalName}</span>}
              {business.legalName && business.vatNumber && " • "}
              {business.vatNumber && <span>VAT: {business.vatNumber}</span>}
            </p>
          )}
        </div>
      </div>

      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </footer>
  );
}

import type { Metadata } from "next";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Star,
  Wifi,
  CreditCard,
  ParkingMeter,
} from "lucide-react";

import { buildBreadcrumbJsonLd, buildI18nUrls, i18nPageMetadataAsync, getActiveSite } from "@/lib/seo";
import type { SiteConfig } from "@/types/tenant";
import StoreMapClient from "@/components/Info/stores/StoreMap.client";

const STORES = [
  {
    name: "PetDo — მთავარი მაღაზია",
    street: "რუსთაველის გამზირი 10",
    city: "თბილისი",
    region: "Tbilisi",
    postal: "0108",
    phone: "+995 577 60 23 99",
    lat: 41.7006,
    lng: 44.7966,
    hours: "ორშ-შაბ 10:00-20:00",
    description: "ჩვენი უმსხვილესი ფილიალი სრული ასორტიმენტით",
    features: ["parking", "wifi", "card"],
    rating: 4.8,
    isMain: true,
  },
  {
    name: "PetDo — ბათუმი",
    street: "ჭავჭავაძის 25",
    city: "ბათუმი",
    region: "Adjara",
    postal: "6000",
    phone: "+995 598 00 00 00",
    lat: 41.6168,
    lng: 41.6367,
    hours: "ორშ-შაბ 10:00-19:00",
    description: "ზღვისპირა ქალაქის მცხოვრებლებისთვის",
    features: ["parking", "card"],
    rating: 4.6,
    isMain: false,
  },
  {
    name: "PetDo — ვაკე",
    street: "ვაშლიჯვრის 15ბ",
    city: "თბილისი",
    region: "Tbilisi",
    postal: "0162",
    phone: "+995 577 11 22 33",
    lat: 41.7158,
    lng: 44.7742,
    hours: "ორშ-შაბ 10:00-19:00",
    description: "კომფორტული ლოკაცია ვაკეში",
    features: ["wifi", "card"],
    rating: 4.7,
    isMain: false,
  },
];

const FEATURE_ICONS = {
  parking: ParkingMeter,
  wifi: Wifi,
  card: CreditCard,
};

const FEATURE_LABELS = {
  parking: "პარკინგი",
  wifi: "უფასო Wi-Fi",
  card: "ბარათით გადახდა",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const site = await getActiveSite();

  return i18nPageMetadataAsync({
    title: "ფილიალები და მისამართები",
    description: "იპოვე უახლოესი ფილიალი — მისამართები, დროის რეჟიმი და ტელეფონები.",
    lang,
    path: "/info/stores",
    images: ["/og/stores-og.jpg"],
    index: true,
    siteOverride: site,
  });
}

async function JsonLd({ lang, site }: { lang: string; site: SiteConfig }) {
  const home = (await buildI18nUrls("/", lang, site)).canonical;
  const info = (await buildI18nUrls("/info", lang, site)).canonical;
  const page = (await buildI18nUrls("/info/stores", lang, site)).canonical;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "მთავარი", url: home },
    { name: "ინფო", url: info },
    { name: "ფილიალები", url: page },
  ]);

  const base = new URL(page).origin;
  const organizations = STORES.map((s) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: s.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.street,
      addressLocality: s.city,
      addressRegion: s.region,
      postalCode: s.postal,
      addressCountry: "GE",
    },
    telephone: s.phone,
    geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng },
    openingHours: s.hours,
    url: base,
  }));

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
        type="application/ld+json"
      />
      {organizations.map((o, i) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }}
          key={i}
          type="application/ld+json"
        />
      ))}
    </>
  );
}

export default async function StoresPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const site = await getActiveSite();

  const storesForMap = STORES.map((s) => ({
    name: s.name,
    lat: s.lat,
    lng: s.lng,
    address: `${s.street}, ${s.city}, ${s.region} ${s.postal}`,
    phone: s.phone,
    hours: s.hours,
    isMain: s.isMain,
  }));

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      {await JsonLd({ lang, site })}

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <Link className="hover:text-primary transition-colors" href="/">
          მთავარი
        </Link>
        <span className="mx-2">/</span>
        <span aria-current="page" className="text-foreground font-medium">
          ფილიალები
        </span>
      </nav>

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="mb-4 text-4xl p-1 font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
          ჩვენი ფილიალები
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          იპოვნეთ უახლოესი ფილიალი და ეწვიეთ ჩვენს მაღაზიებს. ყველა ლოკაციაზე ხელმისაწვდომია სრული
          ასორტიმენტი და პროფესიონალური კონსულტაცია.
        </p>
      </div>

      <section className="mb-12">
        <StoreMapClient className="mb-2" height={420} stores={storesForMap} />
        <p className="text-xs text-muted-foreground text-center">
          რუკა: OpenStreetMap • დააწკაპე „ჩემი მდებარეობა“, რომ ახლოს მდებარე ფილიალს მიუახლოვდე
        </p>
      </section>

      <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center rounded-xl bg-primary/5 p-6">
          <div className="text-3xl font-bold text-primary">{STORES.length}</div>
          <div className="text-sm text-muted-foreground">ფილიალი</div>
        </div>
        <div className="text-center rounded-xl bg-green-500/5 p-6">
          <div className="text-3xl font-bold text-green-600">2+</div>
          <div className="text-sm text-muted-foreground">ქალაქი</div>
        </div>
        <div className="text-center rounded-xl bg-blue-500/5 p-6">
          <div className="text-3xl font-bold text-blue-600">10-20</div>
          <div className="text-sm text-muted-foreground">სამუშაო საათი</div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {STORES.map((store, index) => (
          <article
            key={index}
            className={`group relative rounded-2xl border p-8 shadow-sm hover:shadow-lg transition-all duration-300 ${store.isMain ? "ring-2 ring-primary/20 bg-primary/5" : "bg-card"}`}
          >
            {/* Main Badge */}
            {store.isMain && (
              <div className="absolute -top-3 left-6">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  მთავარი ფილიალი
                </span>
              </div>
            )}

            {/* Store Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                {store.name}
              </h2>
              <p className="text-muted-foreground mb-3">{store.description}</p>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(store.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{store.rating}</span>
                <span className="text-xs text-muted-foreground">(124 შეფასება)</span>
              </div>
            </div>

            {/* Store Info */}
            <div className="space-y-4 mb-6">
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{store.street}</div>
                  <div className="text-sm text-muted-foreground">
                    {store.city}, {store.region} {store.postal}
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a
                  className="hover:text-primary hover:underline transition-colors font-medium"
                  href={`tel:${store.phone.replace(/\s+/g, "")}`}
                >
                  {store.phone}
                </a>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium">{store.hours}</span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                მომსახურება
              </h3>
              <div className="flex flex-wrap gap-2">
                {store.features.map((feature) => {
                  const Icon = FEATURE_ICONS[feature as keyof typeof FEATURE_ICONS];
                  const label = FEATURE_LABELS[feature as keyof typeof FEATURE_LABELS];

                  return (
                    <div
                      key={feature}
                      className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs"
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <a
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.lat},${store.lng}`)}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Navigation className="h-4 w-4" />
                რუკაზე ნახვა
              </a>
              <a
                className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
                href={`tel:${store.phone.replace(/\s+/g, "")}`}
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

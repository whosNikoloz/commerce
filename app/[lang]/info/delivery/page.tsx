import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  Package,
  RefreshCcw,
  ShieldCheck,
  Clock,
  MapPin,
  Star,
  CheckCircle,
} from "lucide-react";

import { i18nPageMetadata, buildBreadcrumbJsonLd, buildI18nUrls } from "@/lib/seo";

/* ---------------- SEO (i18n-aware) ---------------- */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return i18nPageMetadata({
    title: "მიწოდება — ვადები, ტარიფები და თვალთვალი",
    description:
      "გაიგე მიწოდების წესები: ვადები, ტარიფები, კურიერული ზონები და შეკვეთის თვალთვალი.",
    lang,
    path: "/info/delivery",
    images: ["/og/delivery-og.jpg"],
    index: true,
  });
}

/* ---------------- JSON-LD ---------------- */
function JsonLd({ lang }: { lang: string }) {
  const home = buildI18nUrls("/", lang).canonical;
  const info = buildI18nUrls("/info", lang).canonical;
  const delivery = buildI18nUrls("/info/delivery", lang).canonical;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "მთავარი", url: home },
    { name: "ინფო", url: info },
    { name: "მიწოდება", url: delivery },
  ]);

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "რა ვადებში ხდება მიწოდება?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "თბილისი 1–2 სამუშაო დღე, რეგიონები 2–4 სამუშაო დღე.",
        },
      },
      {
        "@type": "Question",
        name: "რამდენია მიწოდების ფასი?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "თბილისი 0–7 ₾ (შესაძლებელია უფასო მინ. შეკვეთიდან), რეგიონები 5–12 ₾.",
        },
      },
    ],
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        type="application/ld+json"
      />
    </>
  );
}

export default async function DeliveryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-surface via-white to-brand-surface/30">
      <JsonLd lang={lang} />

      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-primary via-brand-primarydark to-brand-primary">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container relative mx-auto px-4 py-16 md:px-6 md:py-24">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-8 text-sm">
            <Link className="text-white/80 hover:text-white transition-colors" href={`/${lang}`}>
              მთავარი
            </Link>
            <span className="mx-2 text-white/60">/</span>
            <Link
              className="text-white/80 hover:text-white transition-colors"
              href={`/${lang}/info`}
            >
              ინფო
            </Link>
            <span className="mx-2 text-white/60">/</span>
            <span aria-current="page" className="text-white font-medium">
              მიწოდება
            </span>
          </nav>

          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                სწრაფი მიწოდება
                <span className="block text-white/90">მთელ საქართველოში</span>
              </h1>
              <p className="mb-8 text-lg text-white/90 md:text-xl">
                სანდო კურიერული სერვისი, ვადების დაცვით და განსაკუთრებული ყურადღებით.
              </p>

              {/* Quick Stats */}
              <div className="mb-8 grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">1-2</div>
                  <div className="text-sm text-white/80">დღე თბილისში</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">2-4</div>
                  <div className="text-sm text-white/80">დღე რეგიონებში</div>
                </div>
              </div>

              <Link
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-brand-primary shadow-lg transition-all hover:bg-white/95 hover:shadow-xl hover:scale-105"
                href={`/${lang}/shop`}
              >
                <Package className="h-5 w-5" />
                ყიდვის დაწყება
              </Link>
            </div>

            <div className="relative">
              <div className="relative h-[400px] overflow-hidden rounded-2xl shadow-2xl md:h-[500px]">
                <Image
                  fill
                  priority
                  alt="კურიერული მიწოდება"
                  className="object-cover"
                  src="https://picsum.photos/id/257/900/600"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -bottom-6 -right-6 rounded-xl bg-white dark:bg-brand-surfacedark p-4 shadow-lg">
                <div className="flex items-center gap-2 text-brand-primary">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-semibold">4.9/5</span>
                </div>
                <div className="text-sm text-text-subtle dark:text-text-subtledark">
                  მომხმარებელთა შეფასება
                </div>
              </div>

              <div className="absolute -left-6 top-6 rounded-xl bg-white dark:bg-brand-surfacedark p-4 shadow-lg">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">99.2%</span>
                </div>
                <div className="text-sm text-text-subtle dark:text-text-subtledark">
                  წარმატებული მიწოდება
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 md:px-6">
        {/* Features Grid */}
        <section className="mb-20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-brand-primarydark md:text-4xl">
              რატომ ჩვენ?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-text-subtle">
              თანამედროვე ლოჯისტიკა და მაღალი ხარისხის სერვისი
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Truck,
                title: "სწრაფი მიტანა",
                text: "ოპტიმიზებული მარშრუტები და პარტნიორი კურიერები უზრუნველყოფენ მაქსიმალურ სისწრაფეს.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Package,
                title: "უსაფრთხო შეფუთვა",
                text: "სპეციალური შეფუთვის მასალები და ტექნოლოგიები პროდუქტის დაცვისთვის.",
                color: "from-green-500 to-green-600",
              },
              {
                icon: RefreshCcw,
                title: "თვალთვალის ბმული",
                text: "რეალურ დროში თვალყური ადევნე შენი შეკვეთის სტატუსს და მდებარეობას.",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: ShieldCheck,
                title: "24/7 მხარდაჭერა",
                text: "ჩვენი გუნდი ყოველთვის მზადაა დაგეხმაროს და უპასუხოს შეკითხვებს.",
                color: "from-blue-500 to-blue-600",
              },
            ].map((feature, i) => (
              <article
                key={i}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity group-hover:opacity-5`}
                 />

                <div
                  className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}
                >
                  <feature.icon className="h-8 w-8" />
                </div>

                <h3 className="mb-3 text-xl font-semibold text-brand-primarydark">
                  {feature.title}
                </h3>
                <p className="text-text-subtle leading-relaxed">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="mb-20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-brand-primarydark md:text-4xl">
              მიწოდების ტარიფები
            </h2>
            <p className="text-lg text-text-subtle">
              გამჭვირვალე ფასები, ფარული საკომისიოების გარეშე
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Tbilisi Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primarydark p-8 text-white">
              <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <MapPin className="h-6 w-6" />
                  <h3 className="text-2xl font-bold">თბილისი</h3>
                </div>

                <div className="mb-6">
                  <div className="text-4xl font-bold">0-7₾</div>
                  <div className="text-white/90">მინ. შეკვეთიდან უფასო</div>
                </div>

                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-white/80" />
                    <span>1-2 სამუშაო დღე</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-white/80" />
                    <span>უფასო 50₾+ შეკვეთაზე</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Regions Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-brand-surface p-8">
              <div className="absolute top-0 right-0 h-32 w-32 bg-brand-surface rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-brand-primary" />
                  <h3 className="text-2xl font-bold text-brand-primarydark">რეგიონები</h3>
                </div>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-brand-primarydark">5-12₾</div>
                  <div className="text-text-subtle">დამოკიდებულია მანძილზე</div>
                </div>

                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-text-subtle" />
                    <span className="text-text-subtle">2-4 სამუშაო დღე</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-text-subtle" />
                    <span className="text-text-subtle">უფასო 100₾+ შეკვეთაზე</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-primary via-brand-primarydark to-brand-primary">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container relative mx-auto px-4 py-16 text-center md:px-6 md:py-24">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">მზად ხარ შეკვეთისთვის?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
            აირჩიე პრემიუმ პროდუქტები და მიიღე სწრაფი, სანდო მიწოდება მთელ საქართველოში.
          </p>
          <Link
            className="inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-brand-primary shadow-lg transition-all hover:bg-white/95 hover:shadow-xl hover:scale-105"
            href={`/${lang}/shop`}
          >
            <Package className="h-5 w-5" />
            გადასვლა მაღაზიაში
          </Link>
        </div>
      </section>
    </div>
  );
}

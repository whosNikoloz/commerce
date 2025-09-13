import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";
import { Truck, Package, RefreshCcw, ShieldCheck } from "lucide-react";

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
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <JsonLd lang={lang} />

      <nav aria-label="breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link className="hover:text-primary" href={`/${lang}`}>
          მთავარი
        </Link>
        <span className="mx-2">/</span>
        <Link className="hover:text-primary" href={`/${lang}/info`}>
          ინფო
        </Link>
        <span className="mx-2">/</span>
        <span aria-current="page" className="text-foreground">
          მიწოდება
        </span>
      </nav>

      <header className="mb-8">
        <h1 className="mb-3 text-3xl font-bold">მიწოდება — ვადები, ტარიფები და თვალთვალი</h1>
        <p className="max-w-2xl text-muted-foreground">
          სწრაფი და სანდო კურიერული მიწოდება საქართველოში. იხილე ვადები, ფასები და თვალთვალის
          წესები.
        </p>
      </header>

      <section className="mb-14 grid items-center gap-8 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <h2 className="mb-4 text-ილ font-semibold">როგორ მუშაობს</h2>
          <ul className="mb-6 list-inside list-disc text-muted-foreground">
            <li>
              თბილისი: <strong>1–2</strong> სამუშაო დღე
            </li>
            <li>
              რეგიონები: <strong>2–4</strong> სამუშაო დღე
            </li>
            <li>დღესასწაულები/შაბათ-კვირა შეიძლება გავლენას ახდენდეს ვადებზე</li>
          </ul>
          <Link
            className="inline-flex rounded-lg bg-primary px-5 py-3 text-primary-foreground hover:opacity-90"
            href={`/${lang}/shop`}
          >
            ყიდვის დაწყება
          </Link>
        </div>

        <div className="relative order-1 h-[280px] overflow-hidden rounded-lg md:order-2 md:h-[360px]">
          <Image
            fill
            priority
            alt="კურიერული მიწოდება"
            className="object-cover"
            src="https://picsum.photos/id/257/900/600"
          />
        </div>
      </section>

      <section className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Truck,
            title: "სწრაფი მიტანა",
            text: "ოპტიმიზებული მარშრუტები და პარტნიორი კურიერები.",
          },
          { icon: Package, title: "უსაფრთხო შეფუთვა", text: "დაცული პაკეტი ტრანსპორტირებისას." },
          {
            icon: RefreshCcw,
            title: "თვალთვალის ბმული",
            text: "სტატუსის განახლებები თითოეულ ეტაპზე.",
          },
          { icon: ShieldCheck, title: "მხარდაჭერა", text: "სწრაფი დახმარება 09:00–21:00." },
        ].map((c, i) => (
          <article key={i} className="rounded-lg border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <c.icon aria-hidden="true" className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{c.title}</h3>
            <p className="text-muted-foreground">{c.text}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg bg-primary p-8 text-center text-primary-foreground md:p-12">
        <h2 className="mb-4 text-2xl font-bold md:text-3xl">შეუკვეთე მარტივად</h2>
        <p className="mx-auto mb-6 max-w-2xl">
          აირჩიე პრემიუმ პროდუქტები და მიიღე სწრაფი მიწოდება.
        </p>
        <Link
          className="inline-flex rounded-md bg-white px-6 py-3 text-base font-medium text-primary shadow-sm hover:opacity-90"
          href={`/${lang}/shop`}
        >
          გადასვლა მაღაზიაში
        </Link>
      </section>
    </div>
  );
}

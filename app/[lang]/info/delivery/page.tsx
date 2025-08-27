import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Truck, Package, RefreshCcw, ShieldCheck } from "lucide-react";

import { site as siteConfig } from "@/config/site";
import { basePageMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const base = siteConfig.url.replace(/\/$/, "");
  const url = `${base}/info/delivery`;
  return basePageMetadata({
    title: "მიწოდება — ვადები, ტარიფები და თვალთვალი | " + siteConfig.name,
    description:
      "გაიგე მიწოდების წესები: ვადები, ტარიფები, კურიერული ზონები და შეკვეთის თვალთვალი.",
    url,
    images: ["/og/delivery-og.jpg"],
    siteName: siteConfig.name,
    index: true,
  });
}

function JsonLd() {
  const base = siteConfig.url.replace(/\/$/, "");
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "მთავარი", url: `${base}/` },
    { name: "ინფო", url: `${base}/info` },
    { name: "მიწოდება", url: `${base}/info/delivery` },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}

export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <JsonLd />

      <nav aria-label="breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link className="hover:text-primary" href="/">მთავარი</Link>
        <span className="mx-2">/</span>
        <Link className="hover:text-primary" href="/info">ინფო</Link>
        <span className="mx-2">/</span>
        <span aria-current="page" className="text-foreground">მიწოდება</span>
      </nav>

      <header className="mb-8">
        <h1 className="mb-3 text-3xl font-bold">მიწოდება — ვადები, ტარიფები და თვალთვალი</h1>
        <p className="max-w-2xl text-muted-foreground">
          სწრაფი და სანდო კურიერული მიწოდება საქართველოში. იხილე ვადები, ფასები და თვალთვალის წესები.
        </p>
      </header>

      <section className="mb-14 grid items-center gap-8 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <h2 className="mb-4 text-2xl font-semibold">როგორ მუშაობს</h2>
          <ul className="mb-6 list-inside list-disc text-muted-foreground">
            <li>თბილისი: <strong>1–2</strong> სამუშაო დღე</li>
            <li>რეგიონები: <strong>2–4</strong> სამუშაო დღე</li>
            <li>დღესასწაულები/შაბათ-კვირა შეიძლება გავლენას ახდენდეს ვადებზე</li>
          </ul>
          <Link href="/shop" className="inline-flex rounded-lg bg-primary px-5 py-3 text-primary-foreground hover:opacity-90">
            ყიდვის დაწყება
          </Link>
        </div>

        <div className="relative order-1 h-[280px] overflow-hidden rounded-lg md:order-2 md:h-[360px]">
          <Image src="https://picsum.photos/id/257/900/600" alt="კურიერული მიწოდება" fill className="object-cover" priority />
        </div>
      </section>

      <section className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Truck, title: "სწრაფი მიტანა", text: "ოპტიმიზებული მარშრუტები და პარტნიორი კურიერები." },
          { icon: Package, title: "უსაფრთხო შეფუთვა", text: "დაცული პაკეტი ტრანსპორტირებისას." },
          { icon: RefreshCcw, title: "თვალთვალის ბმული", text: "სტატუსის განახლებები თითოეულ ეტაპზე." },
          { icon: ShieldCheck, title: "მხარდაჭერა", text: "სწრაფი დახმარება 09:00–21:00." },
        ].map((c, i) => (
          <article key={i} className="rounded-lg border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <c.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{c.title}</h3>
            <p className="text-muted-foreground">{c.text}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg bg-primary p-8 text-center text-primary-foreground md:p-12">
        <h2 className="mb-4 text-2xl font-bold md:text-3xl">შეუკვეთე მარტივად</h2>
        <p className="mx-auto mb-6 max-w-2xl">აირჩიე პრემიუმ პროდუქტები და მიიღე სწრაფი მიწოდება.</p>
        <Link href="/shop" className="inline-flex rounded-md bg-white px-6 py-3 text-base font-medium text-primary shadow-sm hover:opacity-90">
          გადასვლა მაღაზიაში
        </Link>
      </section>
    </div>
  );
}

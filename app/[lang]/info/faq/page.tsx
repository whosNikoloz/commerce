// /app/info/faq/page.tsx
import type { Metadata } from "next";
import NextLink from "next/link";
import { HelpCircle } from "lucide-react";

import { site as siteConfig } from "@/config/site";
import { basePageMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getAllFaqs } from "@/app/api/services/faqService";
import type { FAQModel } from "@/types/faq";
import { FAQList } from "@/components/Info/faq/FAQList";

export async function generateMetadata(): Promise<Metadata> {
  const base = siteConfig.url.replace(/\/$/, "");
  const url = `${base}/info/faq`;
  return basePageMetadata({
    title: "ხშირად დასმული კითხვები (FAQ)",
    description: "პასუხები გავრცელებულ შეკითხვებზე: მიწოდება, გადახდა, დაბრუნება, გარანტია.",
    url,
    images: ["/og/faq-og.jpg"],
    siteName: siteConfig.name,
    index: true,
  });
}

type FAQItem = { id: string; q: string; a: string };

// ASCII letters & digits + Georgian
const NON_ALNUM_GE = /[^0-9a-z\u10A0-\u10FF\u2D00-\u2D2F\u1C90-\u1CBF]+/gi;
const TRIM_DASH = /^-+|-+$/g;
const DIACRITICS = /[\u0300-\u036f]/g;
export function slugify(input: string) {
  return input.toLowerCase().normalize("NFKD").replace(DIACRITICS, "").replace(NON_ALNUM_GE, "-").replace(TRIM_DASH, "");
}

function JsonLd({ items }: { items: FAQItem[] }) {
  const base = siteConfig.url.replace(/\/$/, "");
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "მთავარი", url: `${base}/` },
    { name: "FAQ", url: `${base}/info/faq` },
  ]);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}

export default async function FAQPage() {
  let faqs: FAQModel[] = [];
  try { faqs = await getAllFaqs(); } catch { }

  const fallback: FAQItem[] = [
    { q: "როგორ ხდება მიწოდება?", a: "თბილისი 1–2, რეგიონები 2–4 სამუშაო დღე. სტატუსს მიიღებ SMS/ელ-ფოსტით.", id: `faq-${slugify("როგორ ხდება მიწოდება?")}` },
    { q: "რა გადახდის მეთოდებია?", a: "ბარათით ონლაინ, კურიერთან (სელექციურად), ან განვადებით.", id: `faq-${slugify("რა გადახდის მეთოდებია?")}` },
    { q: "როგორ დავაბრუნო პროდუქტი?", a: "14 დღეში, დაუზიანებელი პაკეტით და ქვითრით/ინვოისით.", id: `faq-${slugify("როგორ დავაბრუნო პროდუქტი?")}` },
    { q: "რაზე ვრცელდება გარანტია?", a: "ქარხნულ დეფექტებზე ბრენდის პოლიტიკის შესაბამისად.", id: `faq-${slugify("რაზე ვრცელდება გარანტია?")}` },
  ];

  const items: FAQItem[] = (faqs?.length
    ? faqs
      .filter((f) => f.isActive !== false)
      .sort((a, b) => (a.orderNum ?? 1e9) - (b.orderNum ?? 1e9))
      .map((f) => ({
        id: `faq-${slugify(f.question || String(f.id))}`,
        q: f.question ?? "",
        a: f.answer ?? "",
        featured: !!f.isFeatured,
      }))
      .filter((i) => i.q && i.a)
    : fallback);

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <JsonLd items={items} />

      <nav aria-label="breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <NextLink className="hover:text-primary" href="/"> მთავარი </NextLink>
        <span className="mx-2">/</span>
        <span aria-current="page" className="text-foreground"> FAQ </span>
      </nav>

      <header className="mb-10 rounded-2xl border bg-gradient-to-br from-primary/10 via-transparent to-transparent p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ხშირად დასმული კითხვები</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">მოკლე პასუხები მიწოდებაზე, გადახდაზე, დაბრუნებასა და გარანტიაზე.</p>
          </div>
        </div>
      </header>

      <FAQList items={items} />
    </div>
  );
}

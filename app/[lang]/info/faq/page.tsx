import type { Metadata } from "next";
import type { FAQModel } from "@/types/faq";
import type { SiteConfig } from "@/types/tenant";

import NextLink from "next/link";
import { HelpCircle } from "lucide-react";

import { i18nPageMetadataAsync, getActiveSite, buildBreadcrumbJsonLd, buildI18nUrls } from "@/lib/seo";
import { getAllFaqs } from "@/app/api/services/faqService";
import { FAQList } from "@/components/Info/faq/FAQList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const site = await getActiveSite();

  return i18nPageMetadataAsync({
    title: "ხშირად დასმული კითხვები (FAQ)",
    description: "პასუხები გავრცელებულ შეკითხვებზე: მიწოდება, გადახდა, დაბრუნება, გარანტია.",
    lang,
    path: "/info/faq",
    images: ["/og/faq-og.jpg"],
    index: true,
    siteOverride: site,
  });
}

type FAQItem = { id: string; q: string; a: string; featured?: boolean };

const NON_ALNUM_GE = /[^0-9a-z\u10A0-\u10FF\u2D00-\u2D2F\u1C90-\u1CBF]+/gi;
const TRIM_DASH = /^-+|-+$/g;
const DIACRITICS = /[\u0300-\u036f]/g;

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(DIACRITICS, "")
    .replace(NON_ALNUM_GE, "-")
    .replace(TRIM_DASH, "");
}

async function JsonLd({ items, lang, site }: { items: FAQItem[]; lang: string; site: SiteConfig }) {
  const home = (await buildI18nUrls("/", lang, site)).canonical;
  const faq = (await buildI18nUrls("/info/faq", lang, site)).canonical;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "მთავარი", url: home },
    { name: "FAQ", url: faq },
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
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        type="application/ld+json"
      />
    </>
  );
}

export default async function FAQPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const site = await getActiveSite();

  let faqs: FAQModel[] = [];

  try {
    faqs = await getAllFaqs();
  } catch {}

  const fallback: FAQItem[] = [
    {
      q: "როგორ ხდება მიწოდება?",
      a: "თბილისი 1–2, რეგიონები 2–4 სამუშაო დღე. სტატუსს მიიღებ SMS/ელ-ფოსტით.",
      id: `faq-${slugify("როგორ ხდება მიწოდება?")}`,
    },
    {
      q: "რა გადახდის მეთოდებია?",
      a: "ბარათით ონლაინ, კურიერს (სელექციურად), ან განვადებით.",
      id: `faq-${slugify("რა გადახდის მეთოდებია?")}`,
    },
    {
      q: "როგორ დავაბრუნო პროდუქტი?",
      a: "14 დღეში, დაუზიანებელი პაკეტით და ქვითრით/ინვოისით.",
      id: `faq-${slugify("როგორ დავაბრუნო პროდუქტი?")}`,
    },
    {
      q: "რაზე ვრცელდება გარანტია?",
      a: "ქარხნულ დეფექტებზე ბრენდის პოლიტიკის შესაბამისად.",
      id: `faq-${slugify("რაზე ვრცელდება გარანტია?")}`,
    },
  ];

  const items: FAQItem[] = faqs?.length
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
    : fallback;

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      {await JsonLd({ items, lang, site })}

      <nav aria-label="breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <NextLink className="hover:text-primary" href={`/${lang}`}>
          მთავარი
        </NextLink>
        <span className="mx-2">/</span>
        <span aria-current="page" className="text-foreground">
          FAQ
        </span>
      </nav>

      <header className="mb-10 rounded-2xl border bg-gradient-to-br from-primary/10 via-transparent to-transparent p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ხშირად დასმული კითხვები</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              მოკლე პასუხები მიწოდებაზე, გადახდაზე, დაბრუნებასა და გარანტიაზე.
            </p>
          </div>
        </div>
      </header>

      <FAQList items={items} />
    </div>
  );
}

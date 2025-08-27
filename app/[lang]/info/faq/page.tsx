import type { Metadata } from "next";
import NextLink from "next/link";
import { site as siteConfig } from "@/config/site";
import { basePageMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { HelpCircle, ChevronDown, Link as LinkIcon } from "lucide-react";

/* ---------------- SEO ---------------- */
export async function generateMetadata(): Promise<Metadata> {
  const base = siteConfig.url.replace(/\/$/, "");
  const url = `${base}/info/faq`;
  return basePageMetadata({
    title: "ხშირად დასმული კითხვები (FAQ)",
    description:
      "პასუხები გავრცელებულ შეკითხვებზე: მიწოდება, გადახდა, დაბრუნება, გარანტია.",
    url,
    images: ["/og/faq-og.jpg"],
    siteName: siteConfig.name,
    index: true,
  });
}

function JsonLd() {
  const base = siteConfig.url.replace(/\/$/, "");
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "მთავარი", url: `${base}/` },
    { name: "ინფო", url: `${base}/info` },
    { name: "FAQ", url: `${base}/info/faq` },
  ]);

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "როგორ ხდება მიწოდება?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "თბილისი 1–2, რეგიონები 2–4 სამუშაო დღე. სტატუსს მიიღებ SMS/ელ-ფოსტით.",
        },
      },
      {
        "@type": "Question",
        name: "რა გადახდის მეთოდებია?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "ბარათით ონლაინ, კურიერთან (სელექციურად), ან განვადებით.",
        },
      },
      {
        "@type": "Question",
        name: "როგორ დავაბრუნო პროდუქტი?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "14 დღეში, დაუზიანებელი პაკეტით და ქვითრით/ინვოისით.",
        },
      },
      {
        "@type": "Question",
        name: "რაზე ვრცელდება გარანტია?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "გარანტია ვრცელდება ქარხნულ დეფექტებზე ბრენდის პოლიტიკის შესაბამისად.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}

/* ---------------- Page ---------------- */
type FAQItem = { id: string; q: string; a: string };

// ASCII letters & digits + Georgian (Mkhedruli/Asomtavruli/Extended)
const NON_ALNUM_GE = /[^0-9a-z\u10A0-\u10FF\u2D00-\u2D2F\u1C90-\u1CBF]+/gi;
const TRIM_DASH = /^-+|-+$/g;
const DIACRITICS = /[\u0300-\u036f]/g; // strip combining marks after NFKD

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")        // split accents
    .replace(DIACRITICS, "")  // drop accents
    .replace(NON_ALNUM_GE, "-")
    .replace(TRIM_DASH, "");
}

export default function FAQPage() {
  const rawItems = [
    {
      q: "როგორ ხდება მიწოდება?",
      a: "თბილისი 1–2, რეგიონები 2–4 სამუშაო დღე. სტატუსს მიიღებ SMS/ელ-ფოსტით.",
    },
    {
      q: "რა გადახდის მეთოდებია?",
      a: "ბარათით ონლაინ, კურიერთან (სელექციურად), ან განვადებით.",
    },
    {
      q: "როგორ დავაბრუნო პროდუქტი?",
      a: "14 დღეში, დაუზიანებელი პაკეტით და ქვითრით/ინვოისით.",
    },
    {
      q: "რაზე ვრცელდება გარანტია?",
      a: "ქარხნულ დეფექტებზე ბრენდის პოლიტიკის შესაბამისად.",
    },
  ];

  const items: FAQItem[] = rawItems.map((it) => ({
    ...it,
    id: `faq-${slugify(it.q)}`,
  }));

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <JsonLd />

      {/* Breadcrumbs */}
      <nav
        aria-label="breadcrumb"
        className="mb-6 text-sm text-muted-foreground"
      >
        <NextLink className="hover:text-primary" href="/">
          მთავარი
        </NextLink>
        <span className="mx-2">/</span>
        <NextLink className="hover:text-primary" href="/info">
          ინფო
        </NextLink>
        <span className="mx-2">/</span>
        <span aria-current="page" className="text-foreground">
          FAQ
        </span>
      </nav>

      {/* Hero */}
      <header className="mb-10 rounded-2xl border bg-gradient-to-br from-primary/10 via-transparent to-transparent p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              ხშირად დასმული კითხვები
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              მოკლე პასუხები მიწოდებაზე, გადახდაზე, დაბრუნებასა და გარანტიაზე.
            </p>
          </div>
        </div>
      </header>

      {/* FAQ list */}
      <section
        aria-labelledby="faq-heading"
        className="rounded-2xl border bg-card"
      >
        <h2 id="faq-heading" className="sr-only">
          შეკითხვების სია
        </h2>

        <ul className="divide-y">
          {items.map((it) => (
            <li key={it.id} id={it.id}>
              <details className="group p-5 open:bg-muted/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="text-base font-medium">
                    {it.q}
                  </span>

                  {/* right side controls */}
                  <span className="flex items-center gap-3">
                    {/* anchor link to this item */}
                    <a
                      href={`#${it.id}`}
                      aria-label="ბმული ამ კითხვაზე"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </a>

                    {/* chevron */}
                    <span className="grid h-6 w-6 place-content-center rounded-md border">
                      <ChevronDown className="h-4 w-4 transition duration-200 group-open:rotate-180" />
                    </span>
                  </span>
                </summary>

                {/* animated-ish reveal using grid-rows trick (no JS) */}
                <div className="mt-3 grid grid-rows-[0fr] transition-all duration-200 group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden text-muted-foreground">
                    {it.a}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

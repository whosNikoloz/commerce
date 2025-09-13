import type { Metadata } from "next";

import Link from "next/link";
import {
  Calendar,
  CheckCircle,
  FileText,
  RefreshCw,
  AlertCircle,
  Phone,
  Package,
  CreditCard,
} from "lucide-react";

import { i18nPageMetadata, buildBreadcrumbJsonLd, buildI18nUrls } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return i18nPageMetadata({
    title: "დაბრუნება/გაცვლა — წესები",
    description: "დაბრუნებისა და გაცვლის პირობები: ვადა, კრიტერიუმები, პროცესი და ანაზღაურება.",
    lang,
    path: "/info/return-policy",
    images: ["/og/return-og.jpg"],
    index: true,
  });
}

function JsonLd({ lang }: { lang: string }) {
  const home = buildI18nUrls("/", lang).canonical;
  const page = buildI18nUrls("/info/return-policy", lang).canonical;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "მთავარი", url: home },
    { name: "დაბრუნება", url: page },
  ]);

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "რა ვადაში შეიძლება დაბრუნება?",
        acceptedAnswer: { "@type": "Answer", text: "შეძენიდან 14 დღეში, დაუზიანებელი პაკეტით." },
      },
      {
        "@type": "Question",
        name: "რა პირობებია დაბრუნებისთვის?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "სრული კომპლექტაცია, ქვითარი/ინვოისი, გამოყენების კვალის გარეშე.",
        },
      },
      {
        "@type": "Question",
        name: "როგორ ხდება თანხის დაბრუნება?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "იმავე გადახდის მეთოდით 3–10 სამუშაო დღეში (ბანკის წესების ფარგლებში).",
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

/* ---------------- Page ---------------- */

export default async function ReturnPolicyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  const conditions = [
    {
      title: "დროის ლიმიტი",
      description: "14 კალენდარული დღე შეძენის დღიდან",
      icon: Calendar,
      color: "blue" as const,
    },
    {
      title: "პროდუქტის მდგომარეობა",
      description: "დაუზიანებელი, სუფთა, გამოყენების კვალის გარეშე",
      icon: CheckCircle,
      color: "green" as const,
    },
    {
      title: "კომპლექტაცია",
      description: "სრული კომპლექტაცია და ყველა აქსესუარი",
      icon: Package,
      color: "purple" as const,
    },
    {
      title: "დოკუმენტაცია",
      description: "ქვითარი, ინვოისი ან შეძენის დამადასტურებელი",
      icon: FileText,
      color: "orange" as const,
    },
  ];

  const returnSteps = [
    {
      step: 1,
      title: "დაგვიკავშირდით",
      description: "დაუკავშირდით ჩვენს მხარდაჭერის სერვისს ან მოგვწერეთ",
      icon: Phone,
    },
    {
      step: 2,
      title: "შეავსეთ განაცხადი",
      description: "მიუთითეთ დაბრუნების მიზეზი და პროდუქტის დეტალები",
      icon: FileText,
    },
    {
      step: 3,
      title: "მოამზადეთ პროდუქტი",
      description: "შეფუთეთ დაუზიანებელ პაკეტში სრული კომპლექტაციით",
      icon: Package,
    },
    {
      step: 4,
      title: "მიიღეთ ანაზღაურება",
      description: "თანხა დაუბრუნდება იმავე გადახდის მეთოდით",
      icon: CreditCard,
    },
  ];

  const nonReturnableItems = [
    "პერსონალური ჰიგიენის პროდუქტები",
    "საკვები და ლაქომები (გახსნის შემდეგ)",
    "მედიკამენტები და ვიტამინები",
    "კასტომიზებული პროდუქტები",
    "ელექტრონული გიფთ ქარდები",
    "გამოყენებული ან დაზიანებული ნივთები",
  ];

  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
    green: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    purple: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
    orange: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <JsonLd lang={lang} />

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <Link className="hover:text-primary transition-colors" href={`/${lang}`}>
          მთავარი
        </Link>
        <span className="mx-2">/</span>
        <span aria-current="page" className="text-foreground font-medium">
          დაბრუნება
        </span>
      </nav>

      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl p-1 font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
          დაბრუნება/გაცვლა — წესები
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          ვაგრძელებთ მომხმარებლის კმაყოფილების უზრუნველყოფას. გაიგეთ როგორ მოახდინოთ პროდუქტების
          დაბრუნება ან გაცვლა ადვილად და სწრაფად.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-300">
          <RefreshCw className="h-4 w-4" />
          14 დღიანი დაბრუნების გარანტია
        </div>
      </div>

      {/* Key Conditions */}
      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-center">მთავარი პირობები</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {conditions.map((condition, i) => {
            const Icon = condition.icon;

            return (
              <div
                key={i}
                className={`rounded-xl border p-6 text-center transition-transform hover:scale-105 ${colorClasses[condition.color]}`}
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-white p-3 shadow-sm dark:bg-gray-800">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{condition.title}</h3>
                <p className="text-sm text-muted-foreground">{condition.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Return Process */}
      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-center">დაბრუნების პროცესი</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {returnSteps.map((step, i) => {
            const Icon = step.icon;

            return (
              <div key={i} className="relative">
                {i < returnSteps.length - 1 && (
                  <div className="absolute left-full top-12 hidden h-0.5 w-full translate-x-2 bg-gradient-to-r from-primary/50 to-transparent lg:block" />
                )}
                <div className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {step.step}
                    </div>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-Returnable Items */}
      <div className="mb-16 rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-950/20">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-red-100 p-3 dark:bg-red-900/30">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-semibold text-red-900 dark:text-red-100">
            რა პროდუქტები არ ექვემდებარება დაბრუნებას
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {nonReturnableItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-sm text-red-800 dark:text-red-200">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Information */}
      <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Refund Methods */}
        <div className="rounded-xl border bg-card p-8">
          <h3 className="mb-6 text-xl font-semibold">ანაზღაურების მეთოდები</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CreditCard className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <div className="font-medium">ბანკის ბარათი</div>
                <div className="text-sm text-muted-foreground">3–5 სამუშაო დღე</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <div className="font-medium">მაღაზიის კრედიტი</div>
                <div className="text-sm text-muted-foreground">მყისიერად ხელმისაწვდომი</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <div className="font-medium">საბანკო გადარიცხვა</div>
                <div className="text-sm text-muted-foreground">5–10 სამუშაო დღე</div>
              </div>
            </div>
          </div>
        </div>

        {/* Exchange Options */}
        <div className="rounded-xl border bg-card p-8">
          <h3 className="mb-6 text-xl font-semibold">გაცვლის ვარიანტები</h3>
          <div className="space-y-4">
            {[
              { title: "ზომის შეცვლა", desc: "იმავე პროდუქტის განსხვავებული ზომა" },
              { title: "ფერის შეცვლა", desc: "ხელმისაწვდომობის შემთხვევაში" },
              { title: "მსგავსი პროდუქტი", desc: "ფასის კომპენსაციით" },
            ].map((x, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                <div>
                  <div className="font-medium">{x.title}</div>
                  <div className="text-sm text-muted-foreground">{x.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-blue-600 p-8 text-center text-white">
        <h2 className="mb-4 text-2xl font-bold">კითხვები დაბრუნების შესახებ?</h2>
        <p className="mb-6 text-primary-foreground/90">
          ჩვენი მხარდაჭერის გუნდი მზადაა დაგეხმაროთ დაბრუნების პროცესში
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-primary transition-colors hover:bg-white/90"
            href={`/${lang}/contact`}
          >
            <Phone className="h-4 w-4" />
            დაგვიკავშირდით
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-medium text-white transition-colors hover:bg-white/20"
            href={`/${lang}/info/faq`}
          >
            FAQ გვერდი
          </Link>
        </div>
      </div>
    </div>
  );
}

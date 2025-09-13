import type { Metadata } from "next";

import Link from "next/link";
import { Shield, CheckCircle, XCircle, Wrench, Phone, FileText, AlertTriangle } from "lucide-react";

import { i18nPageMetadata, buildBreadcrumbJsonLd, buildI18nUrls } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return i18nPageMetadata({
    title: "გარანტია — პირობები და წესები",
    description: "გაიგე საგარანტიო მომსახურების წესები: ვადა, გავრცელების არეალი და გამონაკლისები.",
    lang,
    path: "/info/guarantee",
    images: ["/og/guarantee-og.jpg"],
    index: true,
  });
}

function JsonLd({ lang }: { lang: string }) {
  const home = buildI18nUrls("/", lang).canonical;
  const info = buildI18nUrls("/info", lang).canonical;
  const page = buildI18nUrls("/info/guarantee", lang).canonical;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "მთავარი", url: home },
    { name: "ინფო", url: info },
    { name: "გარანტია", url: page },
  ]);

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      type="application/ld+json"
    />
  );
}

export default async function GuaranteePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  const guaranteeTypes = [
    {
      category: "ელექტრონიკა",
      period: "24 თვე",
      color: "blue",
      items: ["ავტომატური კვებები", "LED განათება", "ტემპერატურის კონტროლერები", "ფილტრაცია"],
    },
    {
      category: "აქსესუარები",
      period: "12 თვე",
      color: "green",
      items: ["ტანკები და აკვარიუმები", "თერმომეტრები", "დეკორაციული ელემენტები"],
    },
    {
      category: "თოვლის პროდუქტები",
      period: "6 თვე",
      color: "purple",
      items: ["სამაგრი იარაღები", "ნაბიჯი და საწოლები", "სპორტული ინვენტარი"],
    },
    {
      category: "საკვები და ვიტამინები",
      period: "ვადის გასვლამდე",
      color: "orange",
      items: ["მშრალი საკვები", "ვიტამინური დანამატები", "ლაქომები"],
    },
  ];

  const warrantySteps = [
    {
      step: 1,
      title: "შეინარჩუნეთ ქვითარი",
      description: "დაინახეთ შეძენის ქვითარი და გარანტიული ბარათი",
      icon: FileText,
    },
    {
      step: 2,
      title: "დაგვიკავშირდით",
      description: "მოგვმართეთ პრობლემის აღწერით და შეძენის დეტალებით",
      icon: Phone,
    },
    {
      step: 3,
      title: "დიაგნოსტიკა",
      description: "ჩვენი ექსპერტები შეაფასებენ პროდუქტის მდგომარეობას",
      icon: Wrench,
    },
    {
      step: 4,
      title: "გადაწყვეტილება",
      description: "შევძლებთ შეცვლას, შეკეთებას ან თანხის დაბრუნებას",
      icon: CheckCircle,
    },
  ];

  const covered = [
    "ქარხნული დეფექტები და წარმოების ბრაკი",
    "ფუნქციონირების ნაკლები საწყისი პერიოდიდან",
    "არასწორი შეკვრა ან არასრული კომპლექტაცია",
    "მასალის ხარისხის პრობლემები",
    "ელექტრონული კომპონენტების გაუმართაობა",
    "მწარმოებლის მითითებული დახასიათებების შეუსაბამობა",
  ];

  const notCovered = [
    "მექანიკური დაზიანებები (დაცემა, დარტყმა)",
    "არასათანადო გამოყენების შედეგები",
    "სითხის ზემოქმედება (თუ პროდუქტი არ არის წყალგაძლიერი)",
    "ბუნებრივი ცვეთა ხანგრძლივი გამოყენების შემდეგ",
    "თვითნებური შეკეთების მცდელობები",
    "არაორიგინალური ნაწილებისა და აქსესუარების გამოყენება",
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
        <Link className="hover:text-primary transition-colors" href="/">
          მთავარი
        </Link>
        <span className="mx-2">/</span>
        <span aria-current="page" className="text-foreground font-medium">
          გარანტია
        </span>
      </nav>

      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl p-1 font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
          გარანტია — წესები და პირობები
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
          ჩვენ ვიზრუნებთ თქვენი ყიდვის ხარისხზე და ვაძლევთ საგარანტიო მომსახურებას ყველა პროდუქტზე
          ბრენდის პოლიტიკის შესაბამისად.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-50 dark:bg-green-950/20 px-4 py-2 text-sm text-green-700 dark:text-green-300">
          <Shield className="h-4 w-4" />
          ოფიციალური მწარმოებლის გარანტია
        </div>
      </div>

      {/* Guarantee Periods */}
      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-center">
          გარანტიის ვადები კატეგორიების მიხედვით
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guaranteeTypes.map((type, index) => (
            <div
              key={index}
              className={`rounded-xl border p-6 transition-transform hover:scale-105 ${colorClasses[type.color as keyof typeof colorClasses]}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{type.category}</h3>
                <div className="rounded-full bg-white dark:bg-gray-800 px-3 py-1 text-sm font-medium shadow-sm">
                  {type.period}
                </div>
              </div>
              <ul className="space-y-2">
                {type.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Warranty Process */}
      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-center">გარანტიის მოქმედების პროცესი</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {warrantySteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={index} className="relative">
                {/* Connection Line */}
                {index < warrantySteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent transform translate-x-2" />
                )}

                <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                  <div className="mb-4 inline-flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                      {step.step}
                    </div>
                  </div>
                  <Icon className="h-6 w-6 text-primary mx-auto mb-3" />
                  <h3 className="mb-2 font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What's Covered vs Not Covered */}
      <div className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Covered */}
        <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-green-100 dark:bg-green-900/30 p-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-green-900 dark:text-green-100">
              რა მოიცავს გარანტია
            </h3>
          </div>
          <ul className="space-y-3">
            {covered.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-800 dark:text-green-200">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Not Covered */}
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-red-100 dark:bg-red-900/30 p-3">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-red-900 dark:text-red-100">
              რა არ მოიცავს გარანტია
            </h3>
          </div>
          <ul className="space-y-3">
            {notCovered.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-800 dark:text-red-200">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Important Notice */}
      <div className="mb-16">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-amber-100 dark:bg-amber-900/30 p-3 flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-3">
                მნიშვნელოვანი ინფორმაცია
              </h3>
              <div className="space-y-3 text-sm text-amber-800 dark:text-amber-200">
                <p>• გარანტია ვალიდურია მხოლოდ ოფიციალური ქვითრის არსებობის შემთხვევაში</p>
                <p>
                  • გარანტიულ განიხილვამდე დარწმუნდით, რომ პროდუქტი გამოყენებულია მწარმოებლის
                  ინსტრუქციის შესაბამისად
                </p>
                <p>
                  • საგარანტიო მომსახურება მოიცავს უფასო შეკეთებას, შეცვლას ან თანხის დაბრუნებას
                  (პრობლემის ხასიათიდან გამომდინარე)
                </p>
                <p>
                  • გარანტიული პროდუქტები ექვემდებარება ტექნიკურ შემოწმებას ჩვენი სერვისცენტრის მიერ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extended Warranty Option */}
      <div className="mb-16">
        <div className="rounded-2xl bg-gradient-to-r from-primary/5 to-blue-500/5 border p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">გაფართოებული გარანტია</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mb-6">
            სასურველია გაფართოებული გარანტიის შეძენა? ზოგიერთი პროდუქტისთვის ხელმისაწვდომია
            დამატებითი დაცვის პაკეტები.
          </p>
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
            href="/contact"
          >
            <Shield className="h-4 w-4" />
            გაიგე მეტი
          </Link>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { site as siteConfig } from "@/config/site";
import { basePageMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { Calendar, CheckCircle, FileText, RefreshCw, AlertCircle, Phone, Package, CreditCard } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const base = siteConfig.url.replace(/\/$/, "");
  const url = `${base}/info/return-policy`;
  return basePageMetadata({
    title: "დაბრუნება/გაცვლა — წესები",
    description: "დაბრუნებისა და გაცვლის პირობები: ვადა, კრიტერიუმები, პროცესი და ანაზღაურება.",
    url,
    images: ["/og/return-og.jpg"],
    siteName: siteConfig.name,
    index: true,
  });
}

function JsonLd() {
  const base = siteConfig.url.replace(/\/$/, "");
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "მთავარი", url: `${base}/` },
    { name: "ინფო", url: `${base}/info` },
    { name: "დაბრუნება", url: `${base}/info/return-policy` },
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
        acceptedAnswer: { "@type": "Answer", text: "სრული კომპლექტაცია, ქვითარი/ინვოისი, გამოყენების კვალის გარეშე." },
      },
      {
        "@type": "Question",
        name: "როგორ ხდება თანხის დაბრუნება?",
        acceptedAnswer: { "@type": "Answer", text: "იმავე გადახდის მეთოდით 3–10 სამუშაო დღეში (ბანკის წესების ფარგლებში)." },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  )
}

export default function ReturnPolicyPage() {
  const returnSteps = [
    {
      step: 1,
      title: "დაგვიკავშირდით",
      description: "დაუკავშირდით ჩვენს მხარდაჭერის სერვისს ან მოგვწერეთ",
      icon: Phone
    },
    {
      step: 2,
      title: "შეავსეთ განაცხადი",
      description: "მიუთითეთ დაბრუნების მიზეზი და პროდუქტის დეტალები",
      icon: FileText
    },
    {
      step: 3,
      title: "მოამზადეთ პროდუქტი",
      description: "შეფუთეთ დაუზიანებელ პაკეტში სრული კომპლექტაციით",
      icon: Package
    },
    {
      step: 4,
      title: "მიიღეთ ანაზღაურება",
      description: "თანხა დაუბრუნდება იმავე გადახდის მეთოდით",
      icon: CreditCard
    }
  ];

  const conditions = [
    {
      title: "დროის ლიმიტი",
      description: "14 კალენდარული დღე შეძენის დღიდან",
      icon: Calendar,
      color: "blue"
    },
    {
      title: "პროდუქტის მდგომარეობა",
      description: "დაუზიანებელი, სუფთა, გამოყენების კვალის გარეშე",
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "კომპლექტაცია",
      description: "სრული კომპლექტაცია და ყველა აქსესუარი",
      icon: Package,
      color: "purple"
    },
    {
      title: "დოკუმენტაცია",
      description: "ქვითარი, ინვოისი ან შეძენის დამადასტურებელი",
      icon: FileText,
      color: "orange"
    }
  ];

  const nonReturnableItems = [
    "პერსონალური ჰიგიენის პროდუქტები",
    "საკვები და ლაქომები (გახსნის შემდეგ)",
    "მედიკამენტები და ვიტამინები",
    "კასტომიზებული პროდუქტები",
    "ელექტრონული გიფთ ქარდები",
    "გამოყენებული ან დაზიანებული ნივთები"
  ];

  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
    green: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    purple: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
    orange: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <JsonLd />

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <Link className="hover:text-primary transition-colors" href="/">მთავარი</Link>
        <span className="mx-2">/</span>
        <span aria-current="page" className="text-foreground font-medium">დაბრუნება</span>
      </nav>

      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl p-1 font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
          დაბრუნება/გაცვლა — წესები
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          ვაგრძელებთ მომხმარებლის კმაყოფილების უზრუნველყოფას.
          გაიგეთ როგორ მოახდინოთ პროდუქტების დაბრუნება ან გაცვლა ადვილად და სწრафად.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-50 dark:bg-green-950/20 px-4 py-2 text-sm text-green-700 dark:text-green-300">
          <RefreshCw className="h-4 w-4" />
          14 დღიანი დაბრუნების გარანტია
        </div>
      </div>

      {/* Key Conditions */}
      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-center">მთავარი პირობები</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {conditions.map((condition, index) => {
            const Icon = condition.icon;
            return (
              <div
                key={index}
                className={`rounded-xl border p-6 text-center transition-transform hover:scale-105 ${colorClasses[condition.color as keyof typeof colorClasses]}`}
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-white dark:bg-gray-800 p-3 shadow-sm">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {returnSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {index < returnSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent transform translate-x-2" />
                )}

                <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
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
      <div className="mb-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-red-100 dark:bg-red-900/30 p-3">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-red-900 dark:text-red-100">
              რა პროდუქტები არ ექვემდებარება დაბრუნებას
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nonReturnableItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm text-red-800 dark:text-red-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Refund Methods */}
        <div className="rounded-xl border bg-card p-8">
          <h3 className="mb-6 text-xl font-semibold">ანაზღაურების მეთოდები</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium">ბანკის ბარათი</div>
                <div className="text-sm text-muted-foreground">3-5 სამუშაო დღე</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium">მაღაზიის კრედიტი</div>
                <div className="text-sm text-muted-foreground">მყისიერად ხელმისაწვდომი</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium">საბანკო გადარიცხვა</div>
                <div className="text-sm text-muted-foreground">5-10 სამუშაო დღე</div>
              </div>
            </div>
          </div>
        </div>

        {/* Exchange Options */}
        <div className="rounded-xl border bg-card p-8">
          <h3 className="mb-6 text-xl font-semibold">გაცვლის ვარიანტები</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium">ზომის შეცვლა</div>
                <div className="text-sm text-muted-foreground">იმავე პროდუქტის განსხვავებული ზომა</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium">ფერის შეცვლა</div>
                <div className="text-sm text-muted-foreground">ხელმისაწვდომობის შემთხვევაში</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium">მსგავსი პროდუქტი</div>
                <div className="text-sm text-muted-foreground">ფასის კომპენსაციით</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-blue-600 p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">კითხვები დაბრუნების შესახებ?</h2>
        <p className="mb-6 text-primary-foreground/90">
          ჩვენი მხარდაჭერის გუნდი მზადაა დაგეხმაროთ დაბრუნების პროცესში
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-primary px-6 py-3 font-medium hover:bg-white/90 transition-colors"
          >
            <Phone className="h-4 w-4" />
            დაგვიკავშირდით
          </Link>
          <Link
            href="/info/faq"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 text-white px-6 py-3 font-medium hover:bg-white/20 transition-colors"
          >
            FAQ გვერდი
          </Link>
        </div>
      </div>
    </div>
  )
}
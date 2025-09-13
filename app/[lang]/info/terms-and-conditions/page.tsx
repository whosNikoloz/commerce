import type { Metadata } from "next";

import Link from "next/link";
import { CheckCircle, Shield, Truck, CreditCard, AlertTriangle, Users } from "lucide-react";

import { i18nPageMetadata, buildBreadcrumbJsonLd, buildI18nUrls } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return i18nPageMetadata({
    title: "წესები და პირობები",
    description:
      "სერვისის გამოყენების წესები: შეკვეთა, გადახდა, მიწოდება, პასუხისმგებლობა და დავები.",
    lang,
    path: "/info/terms-and-conditions",
    images: ["/og/terms-og.jpg"],
    index: true,
  });
}

function JsonLd({ lang }: { lang: string }) {
  const home = buildI18nUrls("/", lang).canonical;
  const page = buildI18nUrls("/info/terms-and-conditions", lang).canonical;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "მთავარი", url: home },
    { name: "წესები & პირობები", url: page },
  ]);

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      type="application/ld+json"
    />
  );
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  const sections = [
    {
      icon: CheckCircle,
      title: "შეკვეთა და ხელშეკრულება",
      content: [
        "შეკვეთის განთავსება წარმოადგენს იურიდიულად სავალდებულო შეთავაზებას",
        "ხელშეკრულება დაიდება შეკვეთის დადასტურების შემდეგ",
        "ვიტოვებთ უფლებას უარი ვთქვათ შეკვეთაზე გამართლებული მიზეზების გამო",
        "შეკვეთის მონაცემები უნდა იყოს სწორი და სრული",
      ],
    },
    {
      icon: CreditCard,
      title: "ფასები და გადასახადები",
      content: [
        "ყველა ფასი აღნიშნულია ლარებში (₾) და მოიცავს დღგ-ს",
        "ფასები შეიძლება შეიცვალოს წინასწარი გაფრთხილების გარეშე",
        "განსაკუთრებული შეთავაზებები ძალაშია მითითებულ ვადამდე",
        "დამატებითი მიწოდების ღირებულება განისაზღვრება მისამართისა და წონის მიხედვით",
      ],
    },
    {
      icon: Truck,
      title: "მიწოდება და შესრულება",
      content: [
        "მიწოდების ვადები და ტარიფები დეტალურად არის აღწერილი მიწოდების გვერდზე",
        "მიწოდების დრო არ არის გარანტირებული განსაკუთრებულ შემთხვევებში",
        "თბილისში - 1-2 სამუშაო დღე, რეგიონებში - 2-4 სამუშაო დღე",
        "დაზიანებული პროდუქტის შემთხვევაში დაუყოვნებლივ დაგვიკავშირდით",
      ],
    },
    {
      icon: Shield,
      title: "პასუხისმგებლობის შეზღუდვა",
      content: [
        "არაკოსმეტიკური ზარალი გამორიცხულია კანონის ნებადართული ფარგლების ფარგლებში",
        "არ ვიღებთ პასუხისმგებლობას არაპირდაპირ და შემთხვევით ზარალზე",
        "მაქსიმალური პასუხისმგებლობა შემოიფარგლება პროდუქტის ღირებულებით",
        "სპეციალური, გამოტოვებული სარგებელი არ ანაზღაურდება",
      ],
    },
    {
      icon: Users,
      title: "მომხმარებლის მოვალეობები",
      content: [
        "გამოიყენეთ სერვისი კანონიერი მიზნებისთვის",
        "არ გავრცელოთ ყალბი ან შეცდომაში შემყვანი ინფორმაცია",
        "დაიცავით სხვა მომხმარებლების უფლებები",
        "არ შეეცადოთ სისტემის უსაფრთხოების დარღვევას",
      ],
    },
    {
      icon: AlertTriangle,
      title: "დავების გამოსწორება",
      content: [
        "ყველა დავა გადაწყდება საქართველოს კანონმდებლობის შესაბამისად",
        "იურისდიქცია განისაზღვრება თბილისის სასამართლოებში",
        "პირველად ვცდილობთ დავის მშვიდობიან გამოსწორებას",
        "მედიაცია შესაძლებელია ორივე მხარის თანხმობით",
      ],
    },
  ];

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
          წესები & პირობები
        </span>
      </nav>

      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl p-1 font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          წესები და პირობები
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          გაეცანით ჩვენი სერვისის გამოყენების წესებს და პირობებს. ეს დოკუმენტი რეგულირებს
          ურთიერთობას თქვენსა და ჩვენს შორის.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/20 px-4 py-2 text-sm text-blue-700 dark:text-blue-300">
          <CheckCircle className="h-4 w-4" />
          ბოლოს განახლდა: 2024 წლის იანვარი
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => {
          const Icon = section.icon;

          return (
            <section
              key={index}
              className="rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">{section.title}</h2>
              </div>

              <ul className="space-y-3">
                {section.content.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-2 h-2 w-2 rounded-full bg-primary/60 flex-shrink-0" />
                    <span className="text-muted-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-12 rounded-xl bg-muted/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          შეკითხვების შემთხვევაში დაუკავშირდით ჩვენს მხარდაჭერის გუნდს{" "}
          <Link className="text-primary hover:underline font-medium" href="/contact">
            საკონტაქტო გვერდზე
          </Link>
        </p>
      </div>
    </div>
  );
}

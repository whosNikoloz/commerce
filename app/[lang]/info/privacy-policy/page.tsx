import type { Metadata } from "next";

import Link from "next/link";
import { Shield, Database, Users, Clock, Eye, Settings, Lock, Globe } from "lucide-react";

import { i18nPageMetadata, buildBreadcrumbJsonLd, buildI18nUrls } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return i18nPageMetadata({
    title: "კონფიდენციალურობის პოლიტიკა",
    description:
      "როგორ ვაგროვებთ და ვაცნობიერებთ პერსონალურ მონაცემებს: მიზნები, ვადები, მესამე პირები.",
    lang,
    path: "/info/privacy-policy",
    images: ["/og/privacy-og.jpg"],
    index: true,
  });
}

function JsonLd({ lang }: { lang: string }) {
  const home = buildI18nUrls("/", lang).canonical;
  const info = buildI18nUrls("/info", lang).canonical;
  const page = buildI18nUrls("/info/privacy-policy", lang).canonical;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "მთავარი", url: home },
    { name: "ინფო", url: info },
    { name: "კონფიდენციალურობა", url: page },
  ]);

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      type="application/ld+json"
    />
  );
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  const dataTypes = [
    {
      icon: Users,
      title: "პერსონალური ინფორმაცია",
      items: ["სახელი და გვარი", "ელექტრონული ფოსტა", "ტელეფონის ნომერი", "მისამართი"],
      color: "blue",
    },
    {
      icon: Database,
      title: "შეკვეთების ინფორმაცია",
      items: ["შეძენილი პროდუქტები", "გადახდის ისტორია", "მიწოდების დეტალები", "უკუგების შესახებ"],
      color: "green",
    },
    {
      icon: Globe,
      title: "ტექნიკური მონაცემები",
      items: ["IP მისამართი", "ბრაუზერის ინფორმაცია", "მოწყობილობის ტიპი", "ქუქი ფაილები"],
      color: "purple",
    },
    {
      icon: Eye,
      title: "ქცევითი მონაცემები",
      items: [
        "ვებსაიტზე აქტივობა",
        "კლიკების მიმდევრობა",
        "მოძებნული პროდუქტები",
        "გვერდების ნახვები",
      ],
      color: "orange",
    },
  ];

  const purposes = [
    {
      icon: Settings,
      title: "სერვისის მიწოდება",
      description: "შეკვეთების დამუშავება, მიწოდება და მომხმარებლის მხარდაჭერა",
    },
    {
      icon: Shield,
      title: "უსაფრთხოება",
      description: "თაღლითობის თავიდან აცილება და ანგარიშების დაცვა",
    },
    {
      icon: Database,
      title: "სერვისის გაუმჯობესება",
      description: "ანალიტიკა, მომხმარებლის გამოცდილების ოპტიმიზაცია",
    },
    {
      icon: Users,
      title: "კომუნიკაცია",
      description: "მარკეტინგული შეთავაზებები და პროდუქტების განახლებები",
    },
  ];

  const rights = [
    "წვდომა - თქვენს მონაცემებზე ინფორმაციის მიღება",
    "გამოსწორება - არასწორი მონაცემების შეცვლა",
    "წაშლა - მონაცემების სრული ამოშლა",
    "შეზღუდვა - დამუშავების შეწყვეტა",
    "პორტაბილურობა - მონაცემების ექსპორტი",
    "აღსრულების უარყოფა - ავტომატური გადაწყვეტილების წინააღმდეგ",
  ];

  const thirdParties = [
    {
      name: "გადახდის პროცესორები",
      purpose: "ბარათით გადახდების დამუშავება",
      data: "ფინანსური ინფორმაცია",
    },
    {
      name: "კურიერული სერვისები",
      purpose: "პროდუქტების მიწოდება",
      data: "სახელი, მისამართი, ტელეფონი",
    },
    {
      name: "ანალიტიკის სერვისები",
      purpose: "ვებსაიტის გაუმჯობესება",
      data: "ანონიმური გამოყენების სტატისტიკა",
    },
    {
      name: "ელფოსტის სერვისები",
      purpose: "ღია კომუნიკაცია",
      data: "ელფოსტა და საკომუნიკაციო პრეფერენსები",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
    green: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    purple: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
    orange: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800",
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
          კონფიდენციალურობა
        </span>
      </nav>

      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl p-1 font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          კონფიდენციალურობის პოლიტიკა
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
          ჩვენ ვზრუნავთ თქვენი პერსონალური მონაცემების უსაფრთხოებაზე და კონფიდენციალურობაზე. ეს
          პოლიტიკა აღწერს როგორ ვაგროვებთ, ვიყენებთ და ვიცავთ თქვენს ინფორმაციას.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-50 dark:bg-green-950/20 px-4 py-2 text-sm text-green-700 dark:text-green-300">
          <Lock className="h-4 w-4" />
          GDPR შესაბამისი დაცვა
        </div>
      </div>

      {/* Data Collection Overview */}
      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-center">რა მონაცემებს ვაგროვებთ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {dataTypes.map((type, index) => {
            const Icon = type.icon;

            return (
              <div
                key={index}
                className={`rounded-xl border p-6 transition-transform hover:scale-105 ${colorClasses[type.color as keyof typeof colorClasses]}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-white dark:bg-gray-800 p-2 shadow-sm">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{type.title}</h3>
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
            );
          })}
        </div>
      </div>

      {/* Usage Purposes */}
      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-center">რატომ ვიყენებთ თქვენს მონაცემებს</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {purposes.map((purpose, index) => {
            const Icon = purpose.icon;

            return (
              <div key={index} className="flex gap-4 rounded-xl border bg-card p-6 shadow-sm">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">{purpose.title}</h3>
                  <p className="text-sm text-muted-foreground">{purpose.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Retention */}
      <div className="mb-16">
        <div className="rounded-2xl border bg-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-primary/10 p-3">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">მონაცემების შენახვის ვადები</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">3 წელი</div>
              <div className="text-sm text-muted-foreground">შეკვეთების ისტორია</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">2 წელი</div>
              <div className="text-sm text-muted-foreground">მარკეტინგული მონაცემები</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">30 დღე</div>
              <div className="text-sm text-muted-foreground">ტექნიკური ლოგები</div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Parties */}
      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-center">მესამე პირები</h2>
        <div className="overflow-hidden rounded-xl border">
          <div className="bg-muted/50 px-6 py-4">
            <p className="text-sm text-muted-foreground">
              ჩვენ ვუზიარებთ მონაცემებს მხოლოდ სანდო პარტნიორებს სერვისის გაუმჯობესების მიზნით
            </p>
          </div>
          <div className="divide-y">
            {thirdParties.map((party, index) => (
              <div key={index} className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-medium">{party.name}</h3>
                  <p className="text-sm text-muted-foreground">{party.purpose}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{party.data}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Rights */}
      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-center">თქვენი უფლებები</h2>
        <div className="rounded-xl border bg-card p-8">
          <p className="mb-6 text-muted-foreground">
            საქართველოს პერსონალურ მონაცემთა დაცვის კანონის შესაბამისად, თქვენ გაქვთ შემდეგი
            უფლებები:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rights.map((right, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm">{right}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Measures */}
      <div className="mb-16">
        <div className="rounded-2xl bg-gradient-to-r from-primary/5 to-blue-500/5 border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">უსაფრთხოების ზომები</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mb-3 text-2xl">🔒</div>
              <h3 className="mb-2 font-medium">SSL შიფრაცია</h3>
              <p className="text-sm text-muted-foreground">ყველა მონაცემი იშიფრება გადაცემისას</p>
            </div>
            <div className="text-center">
              <div className="mb-3 text-2xl">🛡️</div>
              <h3 className="mb-2 font-medium">უსაფრთხო სერვერები</h3>
              <p className="text-sm text-muted-foreground">
                ISO 27001 სერტიფიცირებული ინფრასტრუქტურა
              </p>
            </div>
            <div className="text-center">
              <div className="mb-3 text-2xl">👥</div>
              <h3 className="mb-2 font-medium">შეზღუდული წვდომა</h3>
              <p className="text-sm text-muted-foreground">
                მონაცემებზე წვდომა მხოლოდ უფლებამოსილ პერსონალს
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact for Privacy */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-blue-600 p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">კითხვები კონფიდენციალურობის შესახებ?</h2>
        <p className="mb-6 text-primary-foreground/90">
          გვექნება სიხარული დაგეხმაროთ თქვენი მონაცემების უფლებების განხორციელებაში
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 text-white px-6 py-3 font-medium hover:bg-white/20 transition-colors"
            href="mailto:privacy@petdo.ge"
          >
            privacy@petdo.ge
          </a>
        </div>
      </div>
    </div>
  );
}

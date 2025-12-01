"use client";

import React from "react";
import { Shield, BarChart3, Target, Settings, Cookie } from "lucide-react";

import { useDictionary } from "@/app/context/dictionary-provider";
import { useCookieConsent } from "@/app/context/cookieConsentContext";

export default function CookiePolicyContent() {
  const { lang } = useDictionary();
  const { openManageModal } = useCookieConsent();

  const content = {
    en: {
      title: "Cookie Policy",
      lastUpdated: "Last Updated: December 1, 2025",
      intro: {
        title: "Introduction",
        text: "This Cookie Policy explains how our e-commerce platform uses cookies and similar tracking technologies. By using our website, you agree to the use of cookies as described in this policy.",
      },
      whatAreCookies: {
        title: "What Are Cookies?",
        text: "Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.",
      },
      howWeUse: {
        title: "How We Use Cookies",
        text: "We use cookies for several purposes:",
      },
      categories: [
        {
          icon: Shield,
          title: "Essential Cookies",
          required: true,
          description: "These cookies are necessary for the website to function properly. They enable core functionality such as:",
          examples: [
            "Authentication and login sessions",
            "Shopping cart functionality",
            "Security and fraud prevention",
            "Language and region preferences",
          ],
          retention: "Session cookies are deleted when you close your browser. Authentication cookies last up to 2 hours.",
          canDisable: false,
        },
        {
          icon: BarChart3,
          title: "Analytics Cookies",
          required: false,
          description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We use:",
          examples: [
            "Google Analytics 4 - Website traffic and user behavior analysis",
            "Hotjar - Session recordings and heatmaps to improve user experience",
            "Microsoft Clarity - User behavior analytics and insights",
          ],
          retention: "These cookies typically last between 1-24 months.",
          canDisable: true,
        },
        {
          icon: Target,
          title: "Marketing Cookies",
          required: false,
          description: "These cookies track your online activity to help deliver more relevant advertising or limit how many times you see an ad. We use:",
          examples: [
            "Facebook Pixel - Track conversions and build targeted audiences",
            "Google Ads - Measure advertising effectiveness and retargeting",
          ],
          retention: "These cookies typically last between 90 days and 2 years.",
          canDisable: true,
        },
        {
          icon: Settings,
          title: "Preference Cookies",
          required: false,
          description: "These cookies enable the website to remember information that changes the way the site behaves or looks, such as:",
          examples: [
            "Your preferred language",
            "Theme preferences (dark/light mode)",
            "Currency selection",
            "Layout preferences",
          ],
          retention: "These cookies typically last up to 1 year.",
          canDisable: true,
        },
      ],
      thirdParty: {
        title: "Third-Party Cookies",
        text: "Some cookies are placed by third-party services that appear on our pages. We do not control these cookies. Please check the third-party websites for more information:",
        services: [
          { name: "Google Analytics", url: "https://policies.google.com/privacy" },
          { name: "Facebook", url: "https://www.facebook.com/policy/cookies/" },
          { name: "Hotjar", url: "https://www.hotjar.com/legal/policies/privacy/" },
          { name: "Microsoft Clarity", url: "https://privacy.microsoft.com/en-us/privacystatement" },
        ],
      },
      manage: {
        title: "Managing Your Cookie Preferences",
        text: "You have the right to decide whether to accept or reject cookies. You can:",
        options: [
          "Click the button below to open our cookie preference center",
          "Set your browser to refuse all or some browser cookies",
          "Delete cookies that have already been set",
        ],
        warning: "Please note that if you disable essential cookies, some features of our website may not function properly.",
      },
      contact: {
        title: "Contact Us",
        text: "If you have any questions about our use of cookies, please contact us.",
      },
      manageButton: "Manage Cookie Preferences",
    },
    ka: {
      title: "ქუქიების პოლიტიკა",
      lastUpdated: "ბოლო განახლება: 1 დეკემბერი, 2025",
      intro: {
        title: "შესავალი",
        text: "ეს ქუქიების პოლიტიკა განმარტავს თუ როგორ იყენებს ჩვენი ელექტრონული კომერციის პლატფორმა ქუქიებს და მსგავს თვალთვალის ტექნოლოგიებს. ჩვენი ვებსაიტის გამოყენებით, თქვენ ეთანხმებით ქუქიების გამოყენებას, როგორც ეს აღწერილია ამ პოლიტიკაში.",
      },
      whatAreCookies: {
        title: "რა არის ქუქიები?",
        text: "ქუქიები არის პატარა ტექსტური ფაილები, რომლებიც თქვენს მოწყობილობაზე ინახება, როდესაც ეწვევით ვებსაიტს. ისინი ფართოდ გამოიყენება ვებსაიტების უფრო ეფექტურად მუშაობისთვის და ინფორმაციის მიწოდებისთვის.",
      },
      howWeUse: {
        title: "როგორ ვიყენებთ ქუქიებს",
        text: "ჩვენ ვიყენებთ ქუქიებს რამდენიმე მიზნით:",
      },
      categories: [
        {
          icon: Shield,
          title: "აუცილებელი ქუქიები",
          required: true,
          description: "ეს ქუქიები საჭიროა ვებსაიტის სწორად ფუნქციონირებისთვის. ისინი უზრუნველყოფენ ძირითად ფუნქციონალობას, როგორიცაა:",
          examples: [
            "ავთენტიფიკაცია და შესვლის სესიები",
            "კალათის ფუნქციონალობა",
            "უსაფრთხოება და თაღლითობის პრევენცია",
            "ენის და რეგიონის პრეფერენციები",
          ],
          retention: "სესიის ქუქიები იშლება ბრაუზერის დახურვისას. ავთენტიფიკაციის ქუქიები გრძელდება 2 საათამდე.",
          canDisable: false,
        },
        {
          icon: BarChart3,
          title: "ანალიტიკური ქუქიები",
          required: false,
          description: "ეს ქუქიები გვეხმარება გავიგოთ თუ როგორ ურთიერთობენ მომხმარებლები ჩვენს ვებსაიტთან ინფორმაციის ანონიმურად შეგროვებით. ჩვენ ვიყენებთ:",
          examples: [
            "Google Analytics 4 - ვებსაიტის ტრაფიკის და მომხმარებლის ქცევის ანალიზი",
            "Hotjar - სესიის ჩანაწერები და სითბოს რუკები მომხმარებლის გამოცდილების გასაუმჯობესებლად",
            "Microsoft Clarity - მომხმარებლის ქცევის ანალიტიკა და ინსაითები",
          ],
          retention: "ეს ქუქიები ჩვეულებრივ გრძელდება 1-დან 24 თვემდე.",
          canDisable: true,
        },
        {
          icon: Target,
          title: "მარკეტინგული ქუქიები",
          required: false,
          description: "ეს ქუქიები თვალს ადევნებენ თქვენს ონლაინ აქტივობას, რათა უფრო რელევანტური რეკლამა მოგაწოდონ. ჩვენ ვიყენებთ:",
          examples: [
            "Facebook Pixel - კონვერსიების თვალყურის დევნება და სამიზნე აუდიტორიის შექმნა",
            "Google Ads - სარეკლამო ეფექტურობის გაზომვა და რიტარგეტინგი",
          ],
          retention: "ეს ქუქიები ჩვეულებრივ გრძელდება 90 დღიდან 2 წლამდე.",
          canDisable: true,
        },
        {
          icon: Settings,
          title: "პრეფერენციული ქუქიები",
          required: false,
          description: "ეს ქუქიები საშუალებას აძლევს ვებსაიტს დაიმახსოვროს ინფორმაცია, რომელიც ცვლის საიტის ქცევას ან გარეგნობას, როგორიცაა:",
          examples: [
            "თქვენი სასურველი ენა",
            "თემის პრეფერენციები (მუქი/ღია რეჟიმი)",
            "ვალუტის არჩევანი",
            "განლაგების პრეფერენციები",
          ],
          retention: "ეს ქუქიები ჩვეულებრივ გრძელდება 1 წლამდე.",
          canDisable: true,
        },
      ],
      thirdParty: {
        title: "მესამე მხარის ქუქიები",
        text: "ზოგიერთ ქუქის აყენებენ მესამე მხარის სერვისები, რომლებიც გამოჩნდება ჩვენს გვერდებზე. ჩვენ არ ვაკონტროლებთ ამ ქუქიებს. გთხოვთ შეამოწმოთ მესამე მხარის ვებსაიტები დამატებითი ინფორმაციისთვის:",
        services: [
          { name: "Google Analytics", url: "https://policies.google.com/privacy" },
          { name: "Facebook", url: "https://www.facebook.com/policy/cookies/" },
          { name: "Hotjar", url: "https://www.hotjar.com/legal/policies/privacy/" },
          { name: "Microsoft Clarity", url: "https://privacy.microsoft.com/en-us/privacystatement" },
        ],
      },
      manage: {
        title: "თქვენი ქუქიების პრეფერენციების მართვა",
        text: "თქვენ გაქვთ უფლება გადაწყვიტოთ მიიღოთ თუ უარყოთ ქუქიები. შეგიძლიათ:",
        options: [
          "დააჭიროთ ქვემოთ მოცემულ ღილაკს ქუქიების პრეფერენციების ცენტრის გასახსნელად",
          "დააყენოთ თქვენი ბრაუზერი ყველა ან ზოგიერთი ქუქიის უარსაყოფად",
          "წაშალოთ ქუქიები, რომლებიც უკვე დაყენებულია",
        ],
        warning: "გთხოვთ გაითვალისწინოთ, რომ თუ გამორთავთ აუცილებელ ქუქიებს, ჩვენი ვებსაიტის ზოგიერთი ფუნქცია შეიძლება არ იმუშაოს სწორად.",
      },
      contact: {
        title: "დაგვიკავშირდით",
        text: "თუ გაქვთ რაიმე შეკითხვა ქუქიების გამოყენებასთან დაკავშირებით, გთხოვთ დაგვიკავშირდეთ.",
      },
      manageButton: "ქუქიების პრეფერენციების მართვა",
    },
  };

  const t = content[lang as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen  py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto  rounded-xl  p-8 md:p-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Cookie className="w-10 h-10 text-brand-primary dark:text-brand-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {t.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.lastUpdated}
            </p>
          </div>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            {t.intro.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {t.intro.text}
          </p>
        </section>

        {/* What Are Cookies */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            {t.whatAreCookies.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {t.whatAreCookies.text}
          </p>
        </section>

        {/* How We Use Cookies */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            {t.howWeUse.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            {t.howWeUse.text}
          </p>

          {/* Cookie Categories */}
          <div className="space-y-6">
            {t.categories.map((category, index) => {
              const Icon = category.icon;

              return (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-brand-primary/30 dark:hover:border-brand-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-lg">
                      <Icon className="w-6 h-6 text-brand-primary dark:text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {category.title}
                        </h3>
                        {category.required ? (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                            {lang === "ka" ? "აუცილებელი" : "Required"}
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                            {lang === "ka" ? "არჩევითი" : "Optional"}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {category.description}
                      </p>
                      <ul className="space-y-1 mb-3">
                        {category.examples.map((example, i) => (
                          <li
                            key={i}
                            className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                          >
                            <span className="text-brand-primary dark:text-brand-primary mt-1">•</span>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <strong>{lang === "ka" ? "შენახვა:" : "Retention:"}</strong>{" "}
                        {category.retention}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Third-Party Cookies */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            {t.thirdParty.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            {t.thirdParty.text}
          </p>
          <ul className="space-y-2">
            {t.thirdParty.services.map((service, index) => (
              <li key={index}>
                <a
                  className="text-brand-primary hover:text-brand-primarydark hover:underline transition-colors"
                  href={service.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {service.name} →
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Managing Preferences */}
        <section className="mb-8 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            {t.manage.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            {t.manage.text}
          </p>
          <ul className="space-y-2 mb-4">
            {t.manage.options.map((option, index) => (
              <li
                key={index}
                className="text-gray-600 dark:text-gray-300 flex items-start gap-2"
              >
                <span className="text-brand-primary dark:text-brand-primary mt-1">•</span>
                <span>{option}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
            ⚠️ {t.manage.warning}
          </p>
          <button
            className="px-6 py-3 bg-brand-primary hover:bg-brand-primarydark text-white rounded-lg font-medium transition-colors"
            onClick={openManageModal}
          >
            {t.manageButton}
          </button>
        </section>

        {/* Contact */}
        <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            {t.contact.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {t.contact.text}
          </p>
        </section>
      </div>
    </div>
  );
}

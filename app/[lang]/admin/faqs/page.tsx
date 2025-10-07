import type { Metadata } from "next";
import type { FAQModel } from "@/types/faq";
import type { Locale } from "@/i18n.config";

import { cache } from "react";

import { FaqsTable } from "@/components/admin/faq/faqs-table";
import { getAllFaqs } from "@/app/api/services/faqService";
import { i18nPageMetadataAsync } from "@/lib/seo"; // ← async SEO helper

const getFaqsCached = cache(async (): Promise<FAQModel[]> => {
  return await getAllFaqs();
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return i18nPageMetadataAsync({
    title: "Admin • FAQs",
    description: "Manage FAQs in the admin dashboard.",
    lang,
    path: "/admin/faqs",
    index: false, // noindex admin
  });
}

export default async function FaqsPage() {
  const faqs = await getFaqsCached();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-amber-900 to-cyan-900 dark:from-slate-100 dark:via-amber-100 dark:to-cyan-100 bg-clip-text text-transparent">
          FAQs
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
          Manage frequently asked questions and answers
        </p>
      </div>
      <FaqsTable initialFaqs={faqs} />
    </div>
  );
}

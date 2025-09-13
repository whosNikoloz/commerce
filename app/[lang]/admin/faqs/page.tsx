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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light">
          FAQs
        </h1>
      </div>
      <FaqsTable initialFaqs={faqs} />
    </div>
  );
}

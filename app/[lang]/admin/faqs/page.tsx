import type { Metadata } from "next";
import type { FAQModel } from "@/types/faq";
import type { Locale } from "@/i18n.config";

import { cache } from "react";

import { FaqsTable } from "@/components/admin/faq/faqs-table";
import { getAllFaqs } from "@/app/api/services/faqService";
import { i18nPageMetadata } from "@/lib/seo";
import { site as siteConfig } from "@/config/site";

const getFaqsCached = cache(async (): Promise<FAQModel[]> => {
  return await getAllFaqs();
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return i18nPageMetadata({
    title: "Admin • FAQs",
    description: "Manage FAQs in the admin dashboard.",
    lang,
    path: "/admin/faqs",
    images: [siteConfig.ogImage],
    siteName: siteConfig.name,
    index: false,
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

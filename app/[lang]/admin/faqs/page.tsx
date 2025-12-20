import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import { FaqsTable } from "@/components/admin/faq/faqs-table";
import { getAllFaqs } from "@/app/api/services/faqService";
import { i18nPageMetadataAsync } from "@/lib/seo";
import { getDictionary } from "@/lib/dictionaries";

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';

  const dict = await getDictionary(lang);

  return i18nPageMetadataAsync({
    title: dict.pages.admin.faqs.title,
    description: dict.pages.admin.faqs.description,
    lang,
    path: "/admin/faqs",
    index: false,
  });
}

export default async function FaqsPage(
  { params }: { params: Promise<{ lang: Locale }> }
) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';
  const dict = await getDictionary(lang);
  const faqs = await getAllFaqs();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl h-14 md:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-amber-900 to-cyan-900 dark:from-slate-100 dark:via-amber-100 dark:to-cyan-100 bg-clip-text text-transparent">
          {dict.pages.admin.faqs.heading}
        </h1>
        <p className="font-primary text-slate-600 dark:text-slate-400 text-lg font-medium">
          {dict.pages.admin.faqs.subtitle}
        </p>
      </div>

      <FaqsTable initialFaqs={faqs} />
    </div>
  );
}

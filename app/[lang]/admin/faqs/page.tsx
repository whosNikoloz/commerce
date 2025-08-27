// /app/admin/faqs/page.tsx
import { Metadata } from "next";
import { cache } from "react";
import { basePageMetadata } from "@/lib/seo";
import { site as siteConfig } from "@/config/site";
import { FaqsTable } from "@/components/admin/faq/faqs-table";
import { getAllFaqs } from "@/app/api/services/faqService";
import { FAQModel } from "@/types/faq";

const getFaqsCached = cache(async (): Promise<FAQModel[]> => {
  return await getAllFaqs();
});

export async function generateMetadata(): Promise<Metadata> {
  const url = `${siteConfig.url}/admin/faqs`;
  return basePageMetadata({
    title: "Admin • FAQs",
    description: "Manage FAQs in the admin dashboard.",
    url,
    index: false,
    siteName: siteConfig.name,
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

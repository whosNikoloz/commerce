import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import { PaymentsTable } from "@/components/admin/payments-table";
import { getDictionary } from "@/lib/dictionaries";
import { i18nPageMetadataAsync } from "@/lib/seo";

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';

  const dict = await getDictionary(lang, null, 'admin');

  return i18nPageMetadataAsync({
    title: dict.pages.admin.payments.title,
    description: dict.pages.admin.payments.description,
    lang,
    path: "/admin/payments",
    index: false,
  });
}

export default async function PaymentsPage(
  { params }: { params: Promise<{ lang: Locale }> }
) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';
  const dict = await getDictionary(lang, null, 'admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl h-14 font-bold tracking-tight">
          {dict.pages.admin.payments.title}
        </h1>

        <p className="font-primary text-muted-foreground">
          {dict.pages.admin.payments.description}
        </p>
      </div>

      <PaymentsTable />
    </div>
  );
}

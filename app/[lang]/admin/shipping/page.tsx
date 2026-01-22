import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import { ShippingTable } from "@/components/admin/shipping-table";
import { getDictionary } from "@/lib/dictionaries";
import { i18nPageMetadataAsync } from "@/lib/seo";

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';

  const dict = await getDictionary(lang, null, 'admin');

  return i18nPageMetadataAsync({
    title: dict.pages.admin.shipping.title,
    description: dict.pages.admin.shipping.description,
    lang,
    path: "/admin/shipping",
    index: false
  });
}

export default async function ShippingPage(
  { params }: { params: Promise<{ lang: Locale }> }
) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';
  const dict = await getDictionary(lang, null, 'admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold h-14 tracking-tight">
          {dict.pages.admin.shipping.title}
        </h1>

        <p className="font-primary text-muted-foreground">
          {dict.pages.admin.shipping.description}
        </p>
      </div>

      <ShippingTable />
    </div>
  );
}

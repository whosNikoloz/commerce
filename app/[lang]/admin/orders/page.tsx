import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import OrdersTable from "@/components/admin/order/orders-table";
import { getDictionary } from "@/lib/dictionaries";
import { i18nPageMetadataAsync } from "@/lib/seo";

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';

  const dict = await getDictionary(lang);

  return i18nPageMetadataAsync({
    title: dict.pages.admin.orders.title,
    description: dict.pages.admin.orders.description,
    lang,
    path: "/admin/orders",
    index: false,
  });
}

export default async function OrdersPage(
  { params }: { params: Promise<{ lang: Locale }> }
) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl h-14 font-bold tracking-tight">
          {dict.pages.admin.orders.title}
        </h1>

        <p className="font-primary text-muted-foreground">
          {dict.pages.admin.orders.description}
        </p>
      </div>

      <OrdersTable />
    </div>
  );
}

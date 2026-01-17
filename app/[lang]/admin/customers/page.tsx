import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import { CustomersTable } from "@/components/admin/customer/customers-table";
import { getDictionary } from "@/lib/dictionaries";
import { i18nPageMetadataAsync } from "@/lib/seo";

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';

  const dict = await getDictionary(lang);

  return i18nPageMetadataAsync({
    title: dict.pages.admin.customers.title,
    description: dict.pages.admin.customers.description,
    lang,
    path: "/admin/customers",
    index: false
  });
}

export default async function CustomersPage(
  { params }: { params: Promise<{ lang: Locale }> }
) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold h-14 tracking-tight">
          {dict.pages.admin.customers.title}
        </h1>
        <p className="font-primary text-muted-foreground">
          {dict.pages.admin.customers.description}
        </p>
      </div>

      <CustomersTable />
    </div>
  );
}

import type { Metadata } from "next";
import type { Locale } from "@/types/tenant";

import { generateInfoPageMetadata, renderInfoPage } from "@/components/Info/InfoPageRoute";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  return generateInfoPageMetadata({
    params,
    slug: "delivery",
    fallbackTitle: "მიწოდება — ვადები, ტარიფები და თვალთვალი",
    fallbackDescription: "გაიგე მიწოდების წესები: ვადები, ტარიფები, კურიერული ზონები და შეკვეთის თვალთვალი.",
  });
}

export default async function DeliveryPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return renderInfoPage({ params, slug: "delivery" });
}

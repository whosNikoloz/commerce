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
    slug: "stores",
    fallbackTitle: "მაღაზიები",
    fallbackDescription: "მაღაზიების მისამართები და საკონტაქტო ინფორმაცია",
  });
}

export default async function StoresPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return renderInfoPage({ params, slug: "stores" });
}

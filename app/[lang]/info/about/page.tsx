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
    slug: "about",
    fallbackTitle: "ჩვენს შესახებ",
    fallbackDescription: "გაიცანით ჩვენი კომპანია, მისი მისია და ღირებულებები",
  });
}

export default async function AboutPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return renderInfoPage({ params, slug: "about" });
}

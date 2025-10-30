import type { Metadata } from "next";

import { generateInfoPageMetadata, renderInfoPage } from "@/components/Info/InfoPageRoute";
import type { Locale } from "@/types/tenant";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  return generateInfoPageMetadata({
    params,
    slug: "return-policy",
    fallbackTitle: "დაბრუნება/გაცვლა — წესები",
    fallbackDescription: "დაბრუნებისა და გაცვლის პირობები: ვადა, კრიტერიუმები, პროცესი და ანაზღაურება.",
  });
}

export default async function ReturnPolicyPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return renderInfoPage({ params, slug: "return-policy" });
}

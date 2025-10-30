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
    slug: "privacy-policy",
    fallbackTitle: "კონფიდენციალურობის პოლიტიკა",
    fallbackDescription: "როგორ ვაგროვებთ და ვაცნობიერებთ პერსონალურ მონაცემებს: მიზნები, ვადები, მესამე პირები.",
  });
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return renderInfoPage({ params, slug: "privacy-policy" });
}

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
    slug: "terms-and-conditions",
    fallbackTitle: "წესები და პირობები",
    fallbackDescription: "სერვისის გამოყენების წესები: შეკვეთა, გადახდა, მიწოდება, პასუხისმგებლობა და დავები.",
  });
}

export default async function TermsAndConditionsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return renderInfoPage({ params, slug: "terms-and-conditions" });
}

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
    slug: "guarantee",
    fallbackTitle: "გარანტია — პირობები და წესები",
    fallbackDescription: "გაიგე საგარანტიო მომსახურების წესები: ვადა, გავრცელების არეალი და გამონაკლისები.",
  });
}

export default async function GuaranteePage({ params }: { params: Promise<{ lang: Locale }> }) {
  return renderInfoPage({ params, slug: "guarantee" });
}

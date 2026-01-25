import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import CheckoutPage from "@/components/Cart/CheckoutPage/checkout-page";
import { getDictionary } from "@/lib/dictionaries";
import { i18nPageMetadataAsync } from "@/lib/seo";

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';

  const dict = await getDictionary(lang);

  return i18nPageMetadataAsync({
    title: dict.checkout?.title ?? "Checkout",
    description: dict.checkout?.description ?? "Review your order and complete payment.",
    lang,
    path: "/checkout",
    images: ["/og/checkout-og.jpg"],
    index: false,
  });
}

export default function CheckoutPageRoute() {
  return <CheckoutPage />;
}

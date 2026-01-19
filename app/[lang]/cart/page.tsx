import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import CartPage from "@/components/Cart/CartPage/cart-page";
import { i18nPageMetadataAsync } from "@/lib/seo";
import { getDictionary } from "@/lib/dictionaries";

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';

  const dict = await getDictionary(lang);

  return i18nPageMetadataAsync({
    title: dict.cart.title,
    description: dict.cart.description,
    lang,
    path: "/cart",
    images: ["/og/cart-og.jpg"],
    index: false,  // Cart should NOT be indexed
  });
}

export default function CartPageRoute() {
  return <CartPage />;
}

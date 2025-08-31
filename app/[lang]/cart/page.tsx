import type { Metadata } from "next";

import CartPage from "@/components/Cart/CartPage/cart-page";
import { i18nPageMetadata } from "@/lib/seo";
import { site as siteConfig } from "@/config/site";
import { Locale } from "@/i18n.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKa = lang === "ka";

  return i18nPageMetadata({
    title: isKa ? "კალათა" : "Cart",
    description: isKa
      ? "ნახე კალათის შიგთავსი და გააგრძელე შეკვეთა."
      : "Review your cart and proceed to checkout.",
    lang,
    path: "/cart",
    images: ["/og/cart-og.jpg"],
    siteName: siteConfig.name,
    // Cart/Checkout pages should not be indexed
    index: false,
  });
}

export default function CartPageRoute() {
  return <CartPage />;
}

import type { Metadata } from "next";

import CheckoutPage from "@/components/Cart/CheckoutPage/checkout-page";
import { i18nPageMetadata } from "@/lib/seo";
import { Locale } from "@/i18n.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKa = lang === "ka";

  return i18nPageMetadata({
    title: isKa ? "გადახდა" : "Checkout",
    description: isKa
      ? "დაამოწმეთ შეკვეთა და დაასრულეთ გადახდა."
      : "Review your order and complete checkout.",
    lang,
    path: "/checkout",
    images: ["/og/checkout-og.jpg"],
    index: false,
  });
}

export default function CheckoutPageRoute() {
  return <CheckoutPage />;
}

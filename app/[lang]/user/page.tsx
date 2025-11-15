import type { Metadata } from "next";

import UserPanel from "@/components/user-panel/UserPanel-page";
import { i18nPageMetadataAsync } from "@/lib/seo";
import { Locale } from "@/i18n.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKa = lang === "ka";

  return i18nPageMetadataAsync({
    title: isKa ? "ჩემი ანგარიში" : "My Account",
    description: isKa
      ? "მართე შენი პროფილი, შეკვეთები და პარამეტრები."
      : "Manage your profile, orders, and preferences.",
    lang,
    path: "/user",
    index: false,
  });
}

export default function UserPanelPage() {
  return <UserPanel />;
}

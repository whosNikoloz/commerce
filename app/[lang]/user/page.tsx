import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import UserPanel from "@/components/user-panel/UserPanel-page";
import { i18nPageMetadataAsync } from "@/lib/seo";
import { getDictionary } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const dict = await getDictionary(lang);
  const t = dict.userPanel.meta;

  return i18nPageMetadataAsync({
    title: t.title,
    description: t.description,
    lang,
    path: "/user",
    index: false,
  });
}

export default function UserPanelPage() {
  return <UserPanel />;
}

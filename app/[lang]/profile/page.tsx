import { redirect } from "next/navigation";
import { Locale } from "@/i18n.config";

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    redirect(`/${lang}/profile/orders`);
}

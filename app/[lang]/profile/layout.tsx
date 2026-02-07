import { getDictionary } from "@/lib/dictionaries";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileLayoutShell from "@/components/profile/ProfileLayoutShell";
import { Locale } from "@/i18n.config";
import { DictionaryProvider } from "@/app/context/dictionary-provider";

export default async function ProfileLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang as Locale);

    return (
        <DictionaryProvider dictionary={dict}>
            <div className="min-h-screen bg-brand-surface dark:bg-brand-surfacedark mt-4 md:mt-32 px-4 md:px-10 animate-in fade-in duration-700">
                <ProfileLayoutShell
                    sidebar={<ProfileSidebar dict={dict} lang={lang} />}
                    lang={lang}
                >
                    {children}
                </ProfileLayoutShell>
            </div>
        </DictionaryProvider>
    );
}

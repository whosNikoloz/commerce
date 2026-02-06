import { getDictionary } from "@/lib/dictionaries";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
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
            <div className="flex flex-col md:flex-row min-h-screen bg-brand-surface dark:bg-brand-surfacedark mt-24 md:mt-32 px-4 md:px-10 gap-8 animate-in fade-in duration-700">
                <aside className="w-full md:w-80 shrink-0">
                    <div className="md:sticky md:top-32 h-fit">
                        <ProfileSidebar dict={dict} lang={lang} />
                    </div>
                </aside>
                <main className="flex-1 min-h-screen bg-brand-surface dark:bg-brand-surfacedark/50 pb-12 transition-colors duration-500">
                    {children}
                </main>
            </div>
        </DictionaryProvider>
    );
}

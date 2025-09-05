import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";
import { site as siteConfig } from "@/config/site";
import { i18nPageMetadata } from "@/lib/seo";
import FinaSyncPanel from "@/components/admin/fina-sync-panel";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
    const { lang } = await params;

    return i18nPageMetadata({
        title: "Admin • Synchronization",
        description: "Run synchronizations and view live logs.",
        lang,
        path: "/admin/sync",
        images: [siteConfig.ogImage],
        siteName: siteConfig.name,
        index: false,
    });
}

export default async function AdminSyncPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light">
                    Synchronization
                </h1>
                <p className="text-sm text-muted-foreground">
                    Trigger sync jobs, monitor status, and view a live activity log.
                </p>
            </div>
            <FinaSyncPanel />
        </div>
    );
}

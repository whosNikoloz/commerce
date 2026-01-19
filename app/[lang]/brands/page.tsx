import type { Metadata } from "next";

import { Locale } from "@/i18n.config";
import { getDictionary } from "@/lib/dictionaries";
import { i18nPageMetadataAsync } from "@/lib/seo";
import { getAllBrands } from "@/app/api/services/brandService";
import BrandsPage from "@/components/Brands/BrandsPage";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return i18nPageMetadataAsync({
        title: dict?.pages?.brands?.title,
        description: dict?.pages?.brands?.description,
        lang,
        path: "/brands",
    });
}

export default async function BrandsDirectoryPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    // Fetch all brands
    const brands = await getAllBrands();

    return <BrandsPage brands={brands} dict={dict} locale={lang} />;
}

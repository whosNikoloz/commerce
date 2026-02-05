import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { Locale } from "@/i18n.config";
import { getDictionary } from "@/lib/dictionaries";
import { i18nPageMetadataAsync } from "@/lib/seo";
import { getBrandById } from "@/app/api/services/brandService";
import { getBrandCoverImageUrl } from "@/types/brand";
import BrandDetailPage from "@/components/Brands/BrandDetailPage";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: Locale; id: string }>;
}): Promise<Metadata> {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    try {
        const brand = await getBrandById(id);

        return i18nPageMetadataAsync({
            title: brand.name || "Brand",
            description: brand.description || `Explore products from ${brand.name}`,
            lang,
            path: `/brand/${id}`,
            images: getBrandCoverImageUrl(brand.images) ? [getBrandCoverImageUrl(brand.images)!] : undefined,
        });
    } catch (error) {
        return i18nPageMetadataAsync({
            title: dict?.pages?.brand?.notFound || "Brand Not Found",
            description: "The brand you are looking for does not exist",
            lang,
            path: `/brand/${id}`,
        });
    }
}

export default async function BrandPage({
    params,
}: {
    params: Promise<{ lang: Locale; id: string }>;
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    try {
        const brand = await getBrandById(id);

        return <BrandDetailPage brand={brand} dict={dict} locale={lang} />;
    } catch (error) {
        notFound();
    }
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useDictionary } from "@/app/context/dictionary-provider";

export default function ProductNotFound() {
  const { lang } = useParams<{ lang?: string }>();
  const currentLang = lang || "en";

  const dict = useDictionary();
  const t = dict.product.notFound;

  return (
    <div className="flex min-h-[45vh] items-center justify-center bg-brand-surface dark:bg-brand-surfacedark">
      <div className="text-center space-y-4 text-text-light dark:text-text-lightdark">
        <h2 className="text-2xl font-semibold">{t.title}</h2>

        <p className="text-text-subtle dark:text-text-subtledark">
          {t.description}
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            className="px-4 py-2 rounded-md bg-brand-primary text-white hover:opacity-90"
            href={`/${currentLang}/category`}
          >
            {t.browseCategories}
          </Link>

          <Link
            className="px-4 py-2 rounded-md border border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark hover:bg-brand-muted/60 dark:hover:bg-brand-muteddark/60"
            href={`/${currentLang}`}
          >
            {t.goHome}
          </Link>
        </div>
      </div>
    </div>
  );
}

import type { Locale } from "@/i18n.config";

import Link from "next/link";

import { getDictionary } from "@/lib/dictionaries";

export default async function NotFound({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';
  const dict = await getDictionary(lang as Locale);
  const t = dict.notFound;

  return (
    <div className="container mx-auto px-4 py-16 text-center h-screen flex flex-col justify-center items-center">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          {t.code}
        </h1>

        <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
          {t.title}
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
            href={`/${lang}`}
          >
            {t.goHome}
          </Link>

          <Link
            className="inline-block px-6 py-3 border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary/5 transition-colors"
            href={`/${lang}/category`}
          >
            {t.viewCategories}
          </Link>
        </div>
      </div>
    </div>
  );
}

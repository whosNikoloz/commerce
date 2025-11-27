import type { Locale } from "@/i18n.config";

import React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { getDictionary } from "@/lib/dictionaries";

export default async function Loading({ params }: { params: Promise<{ lang: Locale }> }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light">
          {dict.pages.admin.categories.heading}
        </h1>
      </div>

      <div className="space-y-4 px-4 py-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-9 items-center gap-4 rounded-md border px-4 py-3 dark:border-slate-800"
          >
            <div className="col-span-1">
              <Skeleton className="h-[64px] w-[64px] rounded-xl" />
            </div>

            <div className="col-span-2 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>

            <div className="col-span-1">
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>

            <div className="col-span-1 flex justify-end">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

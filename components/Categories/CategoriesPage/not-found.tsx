"use client";

import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <div className="flex min-h-[45vh] items-center justify-center mt-20">
      <div className="text-center space-y-4">
        <h2 className="font-heading text-2xl font-semibold text-text-light dark:text-text-lightdark">
          Category not found
        </h2>
        <p className="font-primary text-text-subtle dark:text-text-subtledark">
          The category you&apos;re looking for doesn&apos;t exist or was removed.
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            className="px-4 py-2 rounded-md border border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark hover:bg-brand-surface/60 dark:hover:bg-brand-surfacedark/60"
            href="/"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

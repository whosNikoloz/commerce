import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[45vh] items-center justify-center bg-brand-surface dark:bg-brand-surfacedark">
      <div className="text-center space-y-4 text-text-light dark:text-text-lightdark">
        <h2 className="text-2xl font-semibold">Product not found</h2>
        <p className="text-text-subtle dark:text-text-subtledark">
          The product you&apos;re looking for doesn&apos;t exist or was removed.
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            className="px-4 py-2 rounded-md bg-brand-primary text-white hover:opacity-90"
            href="/category"
          >
            Browse categories
          </Link>
          <Link
            className="px-4 py-2 rounded-md border border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark hover:bg-brand-muted/60 dark:hover:bg-brand-muteddark/60"
            href="/"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

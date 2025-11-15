'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    // console.error(error); // Removed for production
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-surface dark:bg-brand-surfacedark p-4">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold text-text-light dark:text-text-lightdark">
          Something went wrong!
        </h2>
        <p className="mb-6 text-text-muted dark:text-text-muteddark">
          We apologize for the inconvenience. Please try again.
        </p>
        <button
          className="rounded-lg bg-brand-primary px-6 py-3 text-white font-semibold hover:bg-brand-primarydark transition-colors"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

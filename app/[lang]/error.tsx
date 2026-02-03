'use client';

import { useEffect, useState } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-surface dark:bg-brand-surfacedark p-4">
      <div className="max-w-2xl w-full text-center">
        <h2
          className="font-heading mb-4 text-2xl font-bold text-text-light dark:text-text-lightdark cursor-pointer"
          title="Double-click to toggle error details"
          onDoubleClick={() => setShowDetails(!showDetails)}
        >
          Something went wrong!
        </h2>
        <p className="font-primary mb-6 text-text-muted dark:text-text-muteddark">
          We apologize for the inconvenience. Please try again.
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            className="font-primary rounded-lg bg-brand-primary px-6 py-3 text-white font-semibold hover:bg-brand-primarydark transition-colors"
            onClick={() => reset()}
          >
            Try again
          </button>

          <button
            className="font-primary rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 text-text-muted dark:text-text-muteddark font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>

        {showDetails && (
          <div className="mt-4 text-left bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-auto max-h-96">
            <div className="space-y-3 text-sm font-mono">
              {error.digest && (
                <div>
                  <span className="text-slate-400">Digest: </span>
                  <span className="text-amber-400">{error.digest}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400">Message: </span>
                <span className="text-red-400">{error.message || 'No message available'}</span>
              </div>
              {error.name && (
                <div>
                  <span className="text-slate-400">Type: </span>
                  <span className="text-cyan-400">{error.name}</span>
                </div>
              )}
              {error.stack && (
                <div>
                  <span className="text-slate-400 block mb-1">Stack trace:</span>
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap overflow-x-auto">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {!showDetails && error.digest && (
          <p className="text-xs text-text-muted dark:text-text-muteddark opacity-50">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

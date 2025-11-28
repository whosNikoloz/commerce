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
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          backgroundColor: "#f3f4f6",
        }}
      >
        <div
          style={{
            minHeight: "90vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              maxWidth: "480px",
              width: "100%",
              textAlign: "center",
              backgroundColor: "#ffffff",
              padding: "24px 32px",
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
            }}
          >
            <h2
              style={{
                margin: "0 0 16px 0",
                fontSize: "24px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Something went wrong!
            </h2>

            <p
              style={{
                margin: "0 0 24px 0",
                fontSize: "14px",
                lineHeight: 1.5,
                color: "#4b5563",
              }}
            >
              We apologize for the inconvenience. Please try again.
            </p>

            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 24px",
                borderRadius: "9999px",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                backgroundColor: "#2563eb",
                color: "#ffffff",
                cursor: "pointer",
              }}
              type="button"
              onClick={() => reset()}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

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
              maxWidth: "640px",
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
                cursor: "pointer",
              }}
              title="Double-click to toggle error details"
              onDoubleClick={() => setShowDetails(!showDetails)}
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

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "16px" }}>
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

              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 16px",
                  borderRadius: "9999px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  fontWeight: 500,
                  backgroundColor: "#ffffff",
                  color: "#4b5563",
                  cursor: "pointer",
                }}
                type="button"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </button>
            </div>

            {showDetails && (
              <div
                style={{
                  marginTop: "16px",
                  textAlign: "left",
                  backgroundColor: "#0f172a",
                  borderRadius: "8px",
                  padding: "16px",
                  maxHeight: "300px",
                  overflow: "auto",
                }}
              >
                <div style={{ fontFamily: "monospace", fontSize: "13px" }}>
                  {error.digest && (
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#94a3b8" }}>Digest: </span>
                      <span style={{ color: "#fbbf24" }}>{error.digest}</span>
                    </div>
                  )}
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Message: </span>
                    <span style={{ color: "#f87171" }}>{error.message || 'No message available'}</span>
                  </div>
                  {error.name && (
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#94a3b8" }}>Type: </span>
                      <span style={{ color: "#22d3ee" }}>{error.name}</span>
                    </div>
                  )}
                  {error.stack && (
                    <div>
                      <span style={{ color: "#94a3b8", display: "block", marginBottom: "4px" }}>Stack trace:</span>
                      <pre style={{ fontSize: "11px", color: "#cbd5e1", whiteSpace: "pre-wrap", margin: 0, overflowX: "auto" }}>
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!showDetails && error.digest && (
              <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "8px" }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}

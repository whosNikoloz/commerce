'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      // You can send this to your analytics service
      // Example: analytics.track('web-vital', metric);

      // For now, we'll just store it for potential later use
      const body = JSON.stringify(metric);
      const url = '/api/analytics';

      // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, body);
      } else {
        fetch(url, { body, method: 'POST', keepalive: true }).catch(() => {
          // Silently fail if analytics endpoint doesn't exist
        });
      }
    }
  });

  return null;
}

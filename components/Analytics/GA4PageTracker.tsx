/**
 * GA4 Page Tracker Component
 * Client component that tracks page views on route changes
 */

'use client';

import { useGA4PageTracking } from '@/hooks/useGA4';

export default function GA4PageTracker() {
  useGA4PageTracking();

  return null;
}

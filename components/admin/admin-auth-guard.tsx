"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  useAdminAuth();

  return <>{children}</>;
}

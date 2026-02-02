"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import FinaSyncPanel from "@/components/admin/fina-sync-panel";
import { useDictionary } from "@/app/context/dictionary-provider";
import { getIntegrationStatus, IntegrationType } from "@/app/api/services/integrationService";

export default function AdminSyncPage() {
  const router = useRouter();
  const { lang } = useParams<{ lang?: string }>();
  const currentLang = (lang as string) || "en";
  const dict = useDictionary();

  const [isFinaEnabled, setIsFinaEnabled] = useState<boolean | null>(null);

  // Check if Fina integration is enabled
  useEffect(() => {
    getIntegrationStatus(IntegrationType.Fina)
      .then((status) => {
        setIsFinaEnabled(status.isEnabled);
        // Redirect if Fina is not enabled (custom merchant)
        if (!status.isEnabled) {
          router.push(`/${currentLang}/admin`);
        }
      })
      .catch(() => {
        // If check fails, redirect to admin
        router.push(`/${currentLang}/admin`);
      });
  }, [router, currentLang]);

  // Show loading while checking
  if (isFinaEnabled === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Don't render if Fina is not enabled
  if (!isFinaEnabled) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl md:text-5xl h-14 font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 dark:from-slate-100 dark:via-blue-100 dark:to-cyan-100 bg-clip-text text-transparent">
          {dict.pages.admin.sync.title}
        </h1>
        <p className="font-primary text-slate-600 dark:text-slate-400 text-lg font-medium">
          {dict.pages.admin.sync.description}
        </p>
      </div>
      <FinaSyncPanel />
    </div>
  );
}

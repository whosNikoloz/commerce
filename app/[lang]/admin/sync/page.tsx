"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import FinaSyncPanel from "@/components/admin/fina-sync-panel";
import { useTenant } from "@/app/context/tenantContext";
import { useDictionary } from "@/app/context/dictionary-provider";

export default function AdminSyncPage() {
  const { config } = useTenant();
  const router = useRouter();
  const { lang } = useParams<{ lang?: string }>();
  const currentLang = (lang as string) || "en";

  const dict = useDictionary();

  // Redirect if not FINA merchant
  useEffect(() => {
    if (config && config.merchantType !== "FINA") {
      router.push(`/${currentLang}/admin`);
    }
  }, [config, router, currentLang]);

  // Don't render if not FINA merchant
  if (!config || config.merchantType !== "FINA") {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl md:text-5xl h-14 font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 dark:from-slate-100 dark:via-blue-100 dark:to-cyan-100 bg-clip-text text-transparent">
          {dict.pages.admin.sync.heading}
        </h1>
        <p className="font-primary text-slate-600 dark:text-slate-400 text-lg font-medium">
          {dict.pages.admin.sync.subtitle}
        </p>
      </div>
      <FinaSyncPanel />
    </div>
  );
}

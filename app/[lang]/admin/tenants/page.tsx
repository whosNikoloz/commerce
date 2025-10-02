"use client";

import TenantsTable from "@/components/admin/tenant/tenants-table";

export default function TenantsPage() {
  return (
    <div className="flex w-full flex-col gap-4 p-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl h-14 md:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 dark:from-slate-100 dark:via-blue-100 dark:to-cyan-100 bg-clip-text text-transparent">
            Tenant Management
          </h1>
          <p className="mt-2 text-sm text-text-subtle dark:text-text-subtledark">
            Manage your multi-tenant configurations, themes, and homepage templates
          </p>
        </div>
      </div>
      <TenantsTable />
    </div>
  );
}
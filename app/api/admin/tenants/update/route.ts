import type { TenantConfig } from "@/types/tenant";

import fs from "fs/promises";
import path from "path";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    // Auth
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token");

    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { domain, config } = body as { domain: string; config: TenantConfig };

    // Validate
    if (!domain || !config) {
      return NextResponse.json(
        { success: false, message: "Domain and config are required" },
        { status: 400 },
      );
    }
    if (!config.templateId || !config.themeColor || !config.theme || !config.homepage) {
      return NextResponse.json(
        { success: false, message: "Invalid tenant configuration structure" },
        { status: 400 },
      );
    }

    // Tenant management has moved to the backend API
    // This endpoint is deprecated and should no longer be used
    return NextResponse.json(
      {
        success: false,
        message:
          "Tenant management has been moved to the backend API. Please use the backend admin panel to manage tenants.",
      },
      { status: 410 }, // 410 Gone - indicates resource permanently removed
    );

    /* DEPRECATED CODE - Tenant config is now managed via backend API
    const configPath = path.join(process.cwd(), "config", "tenat.ts");
    const fileContent = await fs.readFile(configPath, "utf-8");

    const headerMatch = fileContent.match(
      /^([\s\S]*?export\s+const\s+TENANTS\s*:\s*Record<string,\s*TenantConfig>\s*=\s*\{)/,
    );
    const footerMatch = fileContent.match(
      /(};[\s\S]*?export\s+const\s+DEFAULT_TENANT[\s\S]*)$/m,
    );

    if (!headerMatch || !footerMatch) {
      throw new Error("Could not parse tenant config file structure");
    }

    const header = headerMatch[1];
    const footer = footerMatch[1];

    const tenantsObj: Record<string, TenantConfig> = {};

    tenantsObj[domain] = config;

    // Pretty TS serializer (keeps arrays/objects formatted and supports ISO dates)
    const formatValue = (value: any, indent = 2): string => {
      const ind = " ".repeat(indent);
      const ind2 = " ".repeat(indent + 2);

      if (value === null) return "null";
      if (value === undefined) return "undefined";

      if (typeof value === "string") {
        // ISO date passthrough as expression (not a plain string)
        if (/^\d{4}-\d{2}-\d{2}T[\d:.]+Z?$/.test(value)) {
          return `new Date("${value}").toISOString()`;
        }

        return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
      }

      if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return "[]";
        const items = value.map((v) => formatValue(v, indent + 2)).join(`,\n${ind2}`);

        return `[\n${ind2}${items},\n${ind}]`;
      }

      if (typeof value === "object") {
        const entries = Object.entries(value);

        if (entries.length === 0) return "{}";
        const items = entries
          .map(([k, v]) => {
            const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;

            return `${key}: ${formatValue(v, indent + 2)}`;
          })
          .join(`,\n${ind2}`);

        return `{\n${ind2}${items},\n${ind}}`;
      }

      return String(value);
    };

    const tenantEntries = Object.entries(tenantsObj)
      .map(([key, value]) => `  "${key}": ${formatValue(value, 2)}`)
      .join(",\n\n");

    const newContent = `${header}\n${tenantEntries},\n${footer}`;

    await fs.writeFile(configPath, newContent, "utf-8");

    // Clear the module cache to force reload on next request
    try {
      const configModule = require.resolve("@/config/tenat");
      delete require.cache[configModule];

      // Also clear any related cached modules
      Object.keys(require.cache).forEach(key => {
        if (key.includes("tenat") || key.includes("config")) {
          delete require.cache[key];
        }
      });
    } catch (e) {
      console.warn("Could not clear module cache:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Tenant updated successfully! Please hard refresh (Ctrl+Shift+R) or restart dev server to see changes.",
    });
    */
  } catch (error: any) {
    console.error("Error updating tenant:", error);

    return NextResponse.json(
      { success: false, message: error?.message ?? "Failed to update tenant" },
      { status: 500 },
    );
  }
}

import type { TenantConfig } from "@/types/tenant";

import fs from "fs/promises";
import path from "path";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Require admin auth via cookie
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

    // Basic validation
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

    // LOCAL WRITE: update config/tenat.ts (intentionally spelled as in your project)
    const configPath = path.join(process.cwd(), "config", "tenat.ts");
    let fileContent = await fs.readFile(configPath, "utf-8");

    // Duplicate-tenant guard
    const domainKeyRegex = new RegExp(`["']${domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']\\s*:`);

    if (domainKeyRegex.test(fileContent)) {
      return NextResponse.json(
        { success: false, message: `Tenant "${domain}" already exists.` },
        { status: 409 },
      );
    }

    // Build the block to insert. Using JSON.stringify is safe in a TS object literal.
    // We keep quoted keys to avoid accidentally touching string contents.
    const json = JSON.stringify(config, null, 2);

    // Indent the JSON block by two spaces for nice formatting
    const indentedJson = json.split("\n").map((l, i) => (i === 0 ? l : "  " + l)).join("\n");
    const newTenantBlock = `  "${domain}": ${indentedJson}`;

    // Find the TENANTS object closing "};" and insert before it.
    // Handle both empty and non-empty object cases.
    const emptyObjectRegex = /(export\s+const\s+TENANTS\s*=\s*{\s*})\s*;\s*$/m;
    const closingRegex = /}\s*;\s*$/m;

    if (emptyObjectRegex.test(fileContent)) {
      // Object is empty: just place the new block inside without a leading comma
      fileContent = fileContent.replace(
        emptyObjectRegex,
        (_m, start) => `${start}\n${newTenantBlock}\n}`,
      );
    } else if (closingRegex.test(fileContent)) {
      // Non-empty: add a trailing comma before the closing brace and append the new block
      fileContent = fileContent.replace(
        closingRegex,
        `,\n${newTenantBlock}\n};`,
      );
    } else {
      // Fallback: if structure is unexpected, bail out with a helpful error
      return NextResponse.json(
        { success: false, message: "Unable to locate TENANTS object closing in tenat.ts." },
        { status: 500 },
      );
    }

    await fs.writeFile(configPath, fileContent, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Tenant created successfully in local config file!",
    });
  } catch (error: any) {
    console.error("Error creating tenant:", error);

    return NextResponse.json(
      { success: false, message: error?.message ?? "Failed to create tenant" },
      { status: 500 },
    );
  }
}

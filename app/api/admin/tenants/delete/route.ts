import fs from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(req: Request) {
  try {
    // Admin auth
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token");

    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { domain } = body as { domain: string };

    if (!domain) {
      return NextResponse.json(
        { success: false, message: "Domain is required" },
        { status: 400 },
      );
    }

    const configPath = path.join(process.cwd(), "config", "tenat.ts");
    let fileContent = await fs.readFile(configPath, "utf-8");

    // Quick presence check
    const keyPattern = `"${domain}"`;
    const keyIdx = fileContent.indexOf(keyPattern);

    if (keyIdx === -1) {
      return NextResponse.json(
        { success: false, message: `Tenant "${domain}" not found.` },
        { status: 404 },
      );
    }

    // Find the start of the entry: "<whitespace>" "<domain>" ":" <whitespace> "{"
    // Start exactly at the first quote of the domain key
    const colonIdx = fileContent.indexOf(":", keyIdx + keyPattern.length);

    if (colonIdx === -1) {
      return NextResponse.json(
        { success: false, message: "Malformed TENANTS entry (missing colon)." },
        { status: 500 },
      );
    }

    // Find the opening brace of the value object
    let openBraceIdx = fileContent.indexOf("{", colonIdx);

    if (openBraceIdx === -1) {
      return NextResponse.json(
        { success: false, message: "Malformed TENANTS entry (missing '{')." },
        { status: 500 },
      );
    }

    // Balance braces to find the end index of the object value
    let depth = 0;
    let endIdx = -1;

    for (let i = openBraceIdx; i < fileContent.length; i++) {
      const ch = fileContent[i];

      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          endIdx = i; // position of closing brace
          break;
        }
      }
    }

    if (endIdx === -1) {
      return NextResponse.json(
        { success: false, message: "Malformed TENANTS entry (unbalanced braces)." },
        { status: 500 },
      );
    }

    // Our tenant block spans from the start of key to right after the closing brace.
    // Now we need to remove the block AND handle commas around it.
    let removeStart = keyIdx;
    let removeEnd = endIdx + 1; // after closing '}'

    // Look ahead for a trailing comma after the block (typical middle/first item)
    let i = removeEnd;

    while (i < fileContent.length && /\s/.test(fileContent[i])) i++;
    const hasTrailingComma = fileContent[i] === ",";

    // Look back for a leading comma before the key (typical last item removal)
    let j = removeStart - 1;

    while (j >= 0 && /\s/.test(fileContent[j])) j--;
    const hasLeadingComma = fileContent[j] === ",";

    if (hasTrailingComma) {
      // Remove the trailing comma (block is middle or first)
      removeEnd = i + 1;
    } else if (hasLeadingComma) {
      // Remove the leading comma (block is last)
      removeStart = j; // include the comma before
    }
    // Else: only item — no commas to fix

    // Slice out the block
    const updatedContent =
      fileContent.slice(0, removeStart) + fileContent.slice(removeEnd);

    // Optional: clean up stray trailing whitespace before the closing of TENANTS
    // (purely cosmetic; keeps file tidy)
    const cleaned = updatedContent.replace(/\n\s*\n\s*}\s*;\s*$/m, "\n};");

    await fs.writeFile(configPath, cleaned, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Tenant deleted successfully from local config file!",
    });
  } catch (error: any) {
    console.error("Error deleting tenant:", error);

    return NextResponse.json(
      { success: false, message: error?.message ?? "Failed to delete tenant" },
      { status: 500 },
    );
  }
}

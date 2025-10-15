import { NextRequest, NextResponse } from "next/server";

type Params = { domain: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<Params> } // 👈 params is a Promise in Next 15
) {
  try {
    const { domain } = await params; // 👈 await it

    if (!domain) {
      return NextResponse.json(
        { success: false, message: "Domain is required" },
        { status: 400 }
      );
    }

    // Safely parse JSON
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Settings object is required" },
        { status: 400 }
      );
    }

    // Prepare settings dictionary (string values only, non-empty)
    const settingsDict: Record<string, string> = {};

    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      if (typeof value === "string" && value.trim() !== "") {
        settingsDict[key] = value;
      } else if (typeof value === "number" || typeof value === "boolean") {
        settingsDict[key] = String(value);
      }
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}Tenant/update-tenant-settings/${encodeURIComponent(
      domain
    )}`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        MAIN: "1",
      },
      body: JSON.stringify(settingsDict),
      // cache: "no-store", // uncomment if you want to avoid caching
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        { success: false, message: `Backend error: ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.text();

    return NextResponse.json({
      success: true,
      message: result || "Tenant settings updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating tenant settings:", error);

    return NextResponse.json(
      { success: false, message: error?.message ?? "Failed to update tenant settings" },
      { status: 500 }
    );
  }
}

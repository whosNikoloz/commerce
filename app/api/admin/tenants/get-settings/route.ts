import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { success: false, message: "Domain is required" },
        { status: 400 }
      );
    }

    // Call the backend API to get tenant settings
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}Tenant/get-tenant-settings/${domain}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // If settings don't exist, return empty object
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          settings: {},
        });
      }

      const errorText = await response.text();
      return NextResponse.json(
        { success: false, message: `Backend error: ${errorText}` },
        { status: response.status }
      );
    }

    const settings = await response.json();

    return NextResponse.json({
      success: true,
      settings: settings || {},
    });
  } catch (error: any) {
    console.error("Error fetching tenant settings:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch tenant settings" },
      { status: 500 }
    );
  }
}

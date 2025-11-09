import { ImageResponse } from "next/og";
import { headers } from "next/headers";

import { getTenantByHost } from "@/lib/getTenantByHost";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const tenant = await getTenantByHost(host);
  const site = tenant.siteConfig;

  // Get first letter of site name for icon
  const letter = (site.name || "E")[0].toUpperCase();
  // Use theme color from PWA config, or tenant theme, or fallback to black
  const themeColor = site.pwa?.themeColor || tenant.themeColor || "#000000";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: themeColor,
          borderRadius: "20px",
        }}
      >
        <div
          style={{
            fontSize: 100,
            fontWeight: "bold",
            color: "#ffffff",
          }}
        >
          {letter}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

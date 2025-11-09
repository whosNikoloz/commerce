import { ImageResponse } from "next/og";
import { headers } from "next/headers";

import { getTenantByHost } from "@/lib/getTenantByHost";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const tenant = await getTenantByHost(host);
  const site = tenant.siteConfig;

  // Use theme color from PWA config, or tenant theme, or fallback to black
  const themeColor = site.pwa?.themeColor || tenant.themeColor || "#000000";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          backgroundImage: `linear-gradient(135deg, ${themeColor}20 0%, ${themeColor}10 100%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: "bold",
              color: themeColor,
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              fontSize: 40,
              color: "#666",
              textAlign: "center",
              maxWidth: "800px",
            }}
          >
            {site.description || "Your trusted online shopping destination"}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

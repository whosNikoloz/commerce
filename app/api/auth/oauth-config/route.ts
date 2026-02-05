import { NextResponse } from "next/server";

import { getOAuthCredentials } from "@/app/api/services/authService";
import { apiFetch } from "@/app/api/client/fetcher";

const INTEGRATION_CHECK_URL = (process.env.NEXT_PUBLIC_API_URL ?? "") + "api/integration/check";

interface IntegrationCheckStatus {
  integrationType: number;
  isEnabled: boolean;
  isConfigured: boolean;
}

async function getIntegrationEnabled(integrationType: number): Promise<boolean | null> {
  try {
    const res = await apiFetch<IntegrationCheckStatus[]>(
      `${INTEGRATION_CHECK_URL}?integrationType=${integrationType}`,
      {
        method: "GET",
        requireAuth: false,
        failIfUnauthenticated: false,
        cache: "no-store",
      } as any,
    );

    const item = res?.[0];

    if (!item) return null;

    return !!item.isEnabled;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch auth integration status", integrationType, error);

    return null;
  }
}

export async function GET() {
  try {
    const credentials = await getOAuthCredentials();

    const googleClientId = credentials.googleClientId ?? "";
    const facebookClientId = credentials.facebookClientId ?? "";

    // 50 = BasicAuth, 51 = GoogleOAuth, 52 = Facebook OAuth
    const [basicStatus, googleStatus, facebookStatus] = await Promise.all([
      getIntegrationEnabled(50),
      getIntegrationEnabled(51),
      getIntegrationEnabled(52),
    ]);

    const basicEnabled = basicStatus ?? true;
    const googleEnabled = (googleStatus ?? true) && !!googleClientId;
    const facebookEnabled = (facebookStatus ?? true) && !!facebookClientId;

    return NextResponse.json({
      googleClientId,
      facebookClientId,
      basicEnabled,
      googleEnabled,
      facebookEnabled,
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch OAuth config:", error);

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    const facebookClientId = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || "";

    const [basicStatus, googleStatus, facebookStatus] = await Promise.all([
      getIntegrationEnabled(50),
      getIntegrationEnabled(51),
      getIntegrationEnabled(52),
    ]);

    const basicEnabled = basicStatus ?? true;
    const googleEnabled = (googleStatus ?? true) && !!googleClientId;
    const facebookEnabled = (facebookStatus ?? true) && !!facebookClientId;

    return NextResponse.json({
      googleClientId,
      facebookClientId,
      basicEnabled,
      googleEnabled,
      facebookEnabled,
    });
  }
}

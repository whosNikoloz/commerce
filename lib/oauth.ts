"use client";

function generateRandomString(length: number): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let text = "";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function generateCodeVerifier(): string {
  return generateRandomString(128);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return btoa(String.fromCharCode(...Array.from(new Uint8Array(digest))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export type OAuthProvider = "google" | "facebook";

interface OAuthConfig {
  clientId: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  redirectUri: string;
  scope: string;
  usePKCE: boolean;
}

function getOAuthConfig(provider: OAuthProvider): OAuthConfig {
  const redirectUri = `${window.location.origin}/api/auth/callback/${provider}`;

  if (provider === "google") {
    return {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
      redirectUri,
      scope: "openid profile email",
      usePKCE: true,
    };
  }

  return {
    clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || "",
    authorizationEndpoint: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenEndpoint: "https://graph.facebook.com/v18.0/oauth/access_token",
    redirectUri,
    scope: "email,public_profile",
    usePKCE: false, 
  };
}

export async function initiateOAuth(provider: OAuthProvider): Promise<void> {
  const config = getOAuthConfig(provider);

  if (!config.clientId) {
    throw new Error(`${provider} client ID not configured`);
  }

  const state = generateRandomString(32);

  sessionStorage.setItem(`oauth_state_${provider}`, state);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "token", 
    scope: config.scope,
    state,
  });

  if (provider === "google") {
    params.append("prompt", "select_account");
    params.append("access_type", "online");
  }

  const authUrl = `${config.authorizationEndpoint}?${params.toString()}`;

  window.location.href = authUrl;
}

export function handleOAuthCallback(provider: OAuthProvider): {
  accessToken: string | null;
  idToken: string | null;
  error: string | null;
} {
  // Check for error
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));

  const error = urlParams.get("error") || hashParams.get("error");

  if (error) {
    return { accessToken: null, idToken: null, error };
  }

  const accessToken = hashParams.get("access_token");
  const idToken = hashParams.get("id_token");
  const state = hashParams.get("state");

  const savedState = sessionStorage.getItem(`oauth_state_${provider}`);

  if (state && savedState && state !== savedState) {
    return { accessToken: null, idToken: null, error: "State mismatch - possible CSRF attack" };
  }

  sessionStorage.removeItem(`oauth_state_${provider}`);

  return { accessToken, idToken, error: null };
}

export async function initiateOAuthCodeFlow(provider: OAuthProvider): Promise<void> {
  const config = getOAuthConfig(provider);

  if (!config.clientId) {
    throw new Error(`${provider} client ID not configured`);
  }

  const state = generateRandomString(32);

  sessionStorage.setItem(`oauth_state_${provider}`, state);

  let codeVerifier = "";
  let codeChallenge = "";

  if (config.usePKCE) {
    codeVerifier = generateCodeVerifier();
    codeChallenge = await generateCodeChallenge(codeVerifier);
    sessionStorage.setItem(`oauth_verifier_${provider}`, codeVerifier);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scope,
    state,
  });

  if (config.usePKCE) {
    params.append("code_challenge", codeChallenge);
    params.append("code_challenge_method", "S256");
  }

  if (provider === "google") {
    params.append("prompt", "select_account");
    params.append("access_type", "online");
  }

  const authUrl = `${config.authorizationEndpoint}?${params.toString()}`;

  window.location.href = authUrl;
}

export async function exchangeCodeForToken(
  provider: OAuthProvider,
  code: string
): Promise<{ accessToken: string | null; idToken: string | null; error: string | null }> {
  const config = getOAuthConfig(provider);

  const body: any = {
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
    code,
  };

  if (config.usePKCE) {
    const verifier = sessionStorage.getItem(`oauth_verifier_${provider}`);

    if (verifier) {
      body.code_verifier = verifier;
      sessionStorage.removeItem(`oauth_verifier_${provider}`);
    }
  }

  try {
    const response = await fetch(config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(body).toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();

      return { accessToken: null, idToken: null, error: errorData.error_description || "Token exchange failed" };
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      idToken: data.id_token || null,
      error: null,
    };
  } catch (err) {
    return { accessToken: null, idToken: null, error: String(err) };
  }
}

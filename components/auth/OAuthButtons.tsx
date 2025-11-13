"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@heroui/button";

import { type OAuthProvider } from "@/lib/oauth";
import { useUser, Tokens } from "@/app/context/userContext";

interface OAuthButtonsProps {
  onSuccess?: () => void;
  variant?: "flat" | "solid" | "bordered" | "light" | "faded" | "shadow" | "ghost";
  className?: string;
}

interface OAuthConfig {
  googleClientId: string;
  facebookClientId: string;
}

export function OAuthButtons({ onSuccess, variant = "bordered", className }: OAuthButtonsProps) {
  const [loading, setLoading] = useState<OAuthProvider | null>(null);
  const [config, setConfig] = useState<OAuthConfig | null>(null);
  const { login } = useUser();

  // Fetch OAuth client IDs from server on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/auth/oauth-config");
        const data = await response.json();

        setConfig(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch OAuth config:", error);
        toast.error("Failed to load OAuth configuration");
      }
    };

    fetchConfig();
  }, []);

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    if (!config) {
      toast.error("OAuth configuration not loaded yet");

      return;
    }

    setLoading(provider);

    try {
      // Open OAuth in a popup window
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authUrl = getAuthUrl(provider);
      const popup = window.open(
        authUrl,
        `${provider}-oauth`,
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        toast.error("Please allow popups to continue with OAuth login");
        setLoading(null);

        return;
      }

      // Listen for messages from the popup
      const messageHandler = (event: MessageEvent) => {
        // Verify origin
        if (event.origin !== window.location.origin) return;

        const { type, provider: msgProvider, tokens, error } = event.data;

        if (type === "oauth-success" && msgProvider === provider) {
          // Successfully got tokens from backend
          login(Tokens.fromJSON(tokens));
          toast.success(`Successfully logged in with ${provider}`);
          window.removeEventListener("message", messageHandler);
          setLoading(null);
          onSuccess?.();
        } else if (type === "oauth-error" && msgProvider === provider) {
          toast.error(`${provider} login failed: ${error}`);
          window.removeEventListener("message", messageHandler);
          setLoading(null);
        }
      };

      window.addEventListener("message", messageHandler);

      // Check if popup was closed
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", messageHandler);
          setLoading(null);
        }
      }, 500);
    } catch (error: any) {
      toast.error(`OAuth error: ${error.message}`);
      setLoading(null);
    }
  };

  const getAuthUrl = (provider: OAuthProvider): string => {
    if (!config) return "";

    const redirectUri = `${window.location.origin}/api/auth/callback/${provider}`;

    if (provider === "google") {
      const params = new URLSearchParams({
        client_id: config.googleClientId,
        redirect_uri: redirectUri,
        response_type: "token id_token",
        scope: "openid profile email",
        prompt: "select_account",
        nonce: Math.random().toString(36).substring(7),
      });

      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    // Facebook
    const params = new URLSearchParams({
      client_id: config.facebookClientId,
      redirect_uri: redirectUri,
      response_type: "token",
      scope: "email,public_profile",
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  };

  return (
    <div className={`flex flex-col gap-3 ${className || ""}`}>
      <Button
        isDisabled={!!loading || !config}
        isLoading={loading === "google"}
        startContent={
          !loading && (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )
        }
        variant={variant}
        onPress={() => handleOAuthLogin("google")}
      >
        Continue with Google
      </Button>

      <Button
        isDisabled={!!loading || !config}
        isLoading={loading === "facebook"}
        startContent={
          !loading && (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                fill="#1877F2"
              />
            </svg>
          )
        }
        variant={variant}
        onPress={() => handleOAuthLogin("facebook")}
      >
        Continue with Facebook
      </Button>
    </div>
  );
}

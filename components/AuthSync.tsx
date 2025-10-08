"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

import { useUser } from "@/app/context/userContext";

/**
 * Syncs NextAuth session (OAuth) with UserContext (email/password)
 * This ensures both authentication methods update the same user state
 */
export function AuthSync() {
  const { data: session, status } = useSession();
  const { login, logout, user } = useUser();
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    // If NextAuth session exists and has accessToken, sync to UserContext
    if (status === "authenticated" && session?.accessToken) {
      // Only sync if the token has changed (prevents unnecessary re-renders)
      if (lastTokenRef.current !== session.accessToken) {
        lastTokenRef.current = session.accessToken;

        // Sync the token to UserContext
        // This will decode the JWT and set the user info
        login(session.accessToken);
      }
    }

    // If NextAuth session is unauthenticated, clear any stored token ref
    if (status === "unauthenticated") {
      lastTokenRef.current = null;
    }
  }, [session, status, login]);

  // This component doesn't render anything
  return null;
}

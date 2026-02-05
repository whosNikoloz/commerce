"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  userName: string;
  email: string;
  role: string | null;
  emailConfirmed: boolean;
}

interface UserContextType {
  user: User | null;
  accessToken: string | null;
  isInitializing: boolean;
  login: () => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserContext);

  if (!ctx) throw new Error("useUser must be used within UserProvider");

  return ctx;
};

async function fetchSession(): Promise<{ user: User | null; token: string | null }> {
  try {
    const res = await fetch("/api/auth/session", {
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!res.ok) return { user: null, token: null };

    return await res.json();
  } catch {
    return { user: null, token: null };
  }
}

export const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const login = async () => {
    const { user: u, token } = await fetchSession();

    setUser(u);
    setAccessToken(token);
  };

  const refresh = async () => {
    try {
      // First try to get the existing session (cookie may still be valid)
      const { user: u, token } = await fetchSession();

      if (u) {
        setUser(u);
        setAccessToken(token);
        setIsInitializing(false);

        return;
      }

      // Access token expired or missing — attempt refresh
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!res.ok) {
        setIsInitializing(false);
        await logout();

        return;
      }

      // Refresh succeeded, new cookies are set — fetch session
      await login();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Refresh error:", error);
      await logout();
    } finally {
      setIsInitializing(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);

    try {
      await fetch("/api/auth/logout", { credentials: "same-origin" });
    } catch {
      // ignore logout errors
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <UserContext.Provider value={{ user, accessToken, isInitializing, login, refresh, logout }}>
      {children}
    </UserContext.Provider>
  );
};

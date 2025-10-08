"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import { TokensResponse } from "../api/services/authService";


interface DecodedToken {
  id: string;
  user_name: string;
  email: string;
  email_confirmed: string;
  role?: string | string[];
  exp?: number;
}

interface User {
  id: string;
  userName: string;
  email: string;
  role: string | null;
  emailConfirmed: boolean;
}

export class Tokens {
  accessToken: string;
  refreshToken: string;

  constructor(accessToken: string, refreshToken: string) {
    if (!accessToken || !refreshToken)
      throw new Error("Invalid token payload");
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  static fromJSON(json: any): Tokens {
    const accessToken = json?.accessToken ?? json?.AccessToken;
    const refreshToken = json?.refreshToken ?? json?.RefreshToken;

    return new Tokens(accessToken, refreshToken);
  }

  toResponse(): TokensResponse {
    return { accessToken: this.accessToken, refreshToken: this.refreshToken };
  }
}

interface UserContextType {
  user: User | null;
  accessToken: string | null;
  login: (tokens: Tokens) => void;
  refresh: () => Promise<void>;
  logout: () => void;
  simulateLogin?: (userIdOrEmail: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserContext);

  if (!ctx) throw new Error("useUser must be used within UserProvider");

  return ctx;
};

export const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // store refresh token (only for demo; in production use httpOnly cookie)
  const REFRESH_KEY = "refreshToken";

  const decodeAccessToken = (token: string): User | null => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);

      return {
        id: decoded.id,
        userName: decoded.user_name,
        email: decoded.email,
        emailConfirmed: decoded.email_confirmed === "True",
        role: Array.isArray(decoded.role) ? decoded.role[0] : decoded.role ?? null,
      };
    } catch {
      return null;
    }
  };

  const login = ({ accessToken, refreshToken }: Tokens) => {
    const u = decodeAccessToken(accessToken);

    setUser(u);
    setAccessToken(accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  };

  const refresh = async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);

    if (!refreshToken) return logout();

    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return logout();

    const data = await res.json();

    if (data.accessToken) {
      login(Tokens.fromJSON(data));
    } else {
      logout();
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(REFRESH_KEY);
  };

  const simulateLogin = (userIdOrEmail: string) => {
        // Import dynamically to avoid server-side issues
        if (typeof window !== "undefined") {
            import("@/lib/mockAuth").then(({ simulateLogin: mockLogin }) => {
                const mockToken = mockLogin(userIdOrEmail);

                login(Tokens.fromJSON(mockToken));
            });
        }
    };

  // On first load: try to refresh access token automatically
  useEffect(() => {
    refresh();
  }, []);

  return (
    <UserContext.Provider value={{ user, accessToken, login, refresh, logout , simulateLogin }}>
      {children}
    </UserContext.Provider>
  );
};

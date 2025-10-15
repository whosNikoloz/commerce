"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import {TokensResponse } from "../api/services/authService";


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
  isInitializing: boolean;
  login: (tokens: Tokens) => void;
  refresh: () => Promise<void>;
  logout: () => void;
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
  const [isInitializing, setIsInitializing] = useState(true);

  // store tokens in localStorage
  const REFRESH_KEY = "refreshToken";
  const ACCESS_KEY = "accessToken";

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);

      if (!decoded.exp) return true;

      // Check if token expires in less than 30 seconds
      return decoded.exp * 1000 < Date.now() + 30000;
    } catch {
      return true;
    }
  };

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
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  };

  const refresh = async () => {
    try {
      // First, try to restore from stored access token (instant!)
      const storedAccessToken = localStorage.getItem(ACCESS_KEY);
      const refreshToken = localStorage.getItem(REFRESH_KEY);

      if (!refreshToken) {
        setIsInitializing(false);

        return logout();
      }

      // If we have a valid access token, use it immediately
      if (storedAccessToken && !isTokenExpired(storedAccessToken)) {
        const u = decodeAccessToken(storedAccessToken);

        setUser(u);
        setAccessToken(storedAccessToken);
        setIsInitializing(false);

        return;
      }

      // Access token expired or missing, refresh it
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        setIsInitializing(false);

        return logout();
      }

      const data = await res.json();

      if (data.accessToken) {
        login(Tokens.fromJSON(data));
      } else {
        logout();
      }
    } catch (error) {
      console.error("Refresh error:", error);
      logout();
    } finally {
      setIsInitializing(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ACCESS_KEY);

    //Serverlogout();
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

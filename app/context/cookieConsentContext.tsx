"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CookieCategory = "essential" | "analytics" | "marketing" | "preferences";

export interface CookieConsent {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CookieConsentContextType {
  consent: CookieConsent | null;
  hasConsented: boolean;
  showBanner: boolean;
  showManageModal: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  updateConsent: (consent: CookieConsent) => void;
  openManageModal: () => void;
  closeManageModal: () => void;
  closeBanner: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const CONSENT_KEY = "cookie-consent";
const CONSENT_VERSION = "1.0"; // Update this when cookie policy changes

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if version matches
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed.consent);
          setHasConsented(true);
          setShowBanner(false);
        } else {
          // Version changed, ask for consent again
          setShowBanner(true);
        }
      } else {
        // No consent stored, show banner
        setShowBanner(true);
      }
    } catch (error) {
      console.error("Error loading cookie consent:", error);
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (newConsent: CookieConsent) => {
    try {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({
          consent: newConsent,
          version: CONSENT_VERSION,
          timestamp: new Date().toISOString(),
        })
      );
      setConsent(newConsent);
      setHasConsented(true);
      setShowBanner(false);
      setShowManageModal(false);

      // Reload page to apply consent changes
      window.location.reload();
    } catch (error) {
      console.error("Error saving cookie consent:", error);
    }
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  };

  const rejectAll = () => {
    saveConsent({
      essential: true, // Always true
      analytics: false,
      marketing: false,
      preferences: false,
    });
  };

  const updateConsent = (newConsent: CookieConsent) => {
    // Ensure essential is always true
    saveConsent({
      ...newConsent,
      essential: true,
    });
  };

  const openManageModal = () => {
    setShowManageModal(true);
  };

  const closeManageModal = () => {
    setShowManageModal(false);
  };

  const closeBanner = () => {
    setShowBanner(false);
    // Don't save anything, banner will show again on next visit
  };

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasConsented,
        showBanner,
        showManageModal,
        acceptAll,
        rejectAll,
        updateConsent,
        openManageModal,
        closeManageModal,
        closeBanner,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
}

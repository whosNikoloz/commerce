import { Metadata } from "next";

import CookiePolicyContent from "@/components/CookieConsent/CookiePolicyContent";

export const metadata: Metadata = {
  title: "Cookie Policy | ქუქიების პოლიტიკა",
  description: "Learn about how we use cookies on our website and manage your cookie preferences.",
};

export default function CookiePolicyPage() {
  return <CookiePolicyContent />;
}

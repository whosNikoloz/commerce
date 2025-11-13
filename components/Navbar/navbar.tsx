"use client";

import { NavbarTemplate1 } from "./template1/NavbarTemplate1";
import { NavbarTemplate2 } from "./template2/NavbarTemplate2";

import { useTenant } from "@/app/context/tenantContext";

export function Navbar() {
  const { config } = useTenant();

  if (!config) return null;

  const navbarVariant = config.ui?.navbarVariant ?? config.templateId;

  if (navbarVariant === 2) {
    return <NavbarTemplate2 />;
  }

  return <NavbarTemplate1 />;
}

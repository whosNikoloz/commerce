import type { ThemeVars } from "@/types/tenant";
import type React from "react";

// Allow CSS custom properties even if @types/react is older
type CSSVarKey = `--${string}`;
type CustomCSSProperties = React.CSSProperties & Record<CSSVarKey, string | number>;

export function themeToStyle(theme: ThemeVars): CustomCSSProperties {
  const style: CustomCSSProperties = {};

  // Helper function to safely set properties
  const safeSet = (key: CSSVarKey, value: string | undefined) => {
    if (value) style[key] = value;
  };

  // brand
  safeSet("--brand-primary", theme.brand?.primary);
  safeSet("--brand-primary-dark", theme.brand?.primaryDark);
  safeSet("--brand-surface", theme.brand?.surface);
  safeSet("--brand-surface-dark", theme.brand?.surfaceDark);
  safeSet("--brand-muted", theme.brand?.muted);
  safeSet("--brand-muted-dark", theme.brand?.mutedDark);
  safeSet("--brand-accent", theme.brand?.accent);

  // text
  safeSet("--text-light", theme.text?.light);
  safeSet("--text-subtle", theme.text?.subtle);
  safeSet("--text-light-dark", theme.text?.lightDark);
  safeSet("--text-subtle-dark", theme.text?.subtleDark);

  // Fonts (safe guards + custom sizes/weights)
  const setVar = (key: CSSVarKey, val?: string | number | null) => {
    if (val !== undefined && val !== null && val !== "") style[key] = val;
  };

  // Fonts - simplified without dynamic-fonts
  if (theme.fonts) {
    if (theme.fonts.primary) {
      setVar("--font-primary", theme.fonts.primary);
    }
    if (theme.fonts.secondary) {
      setVar("--font-secondary", theme.fonts.secondary);
    }
    if (theme.fonts.heading) {
      setVar("--font-heading", theme.fonts.heading);
    }
    if (theme.fonts.sizes) {
      Object.entries(theme.fonts.sizes).forEach(([k, v]) =>
        setVar(`--font-size-${k}` as CSSVarKey, v || undefined),
      );
    }
    if (theme.fonts.weights) {
      Object.entries(theme.fonts.weights).forEach(([k, v]) =>
        setVar(`--font-weight-${k}` as CSSVarKey, v != null ? String(v) : undefined),
      );
    }
  }

  return style;
}

export function applyThemeOnDocument(theme: ThemeVars) {
  const root = document.documentElement;
  const vars = themeToStyle(theme);

  for (const [k, v] of Object.entries(vars)) {
    // Only apply custom properties (start with --) and stringify numbers
    if (k.startsWith("--"))
      root.style.setProperty(k, typeof v === "number" ? String(v) : (v as string));
  }
}

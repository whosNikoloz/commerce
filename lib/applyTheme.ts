import type { ThemeVars } from "@/types/tenant";

export function themeToStyle(theme: ThemeVars): React.CSSProperties {
  return {
    ["--brand-primary" as any]: theme.brand.primary,
    ["--brand-primary-dark" as any]: theme.brand.primaryDark,
    ["--brand-surface" as any]: theme.brand.surface,
    ["--brand-surface-dark" as any]: theme.brand.surfaceDark,
    ["--brand-muted" as any]: theme.brand.muted,
    ["--brand-muted-dark" as any]: theme.brand.mutedDark,

    ["--text-light" as any]: theme.text.light,
    ["--text-subtle" as any]: theme.text.subtle,
    ["--text-light-dark" as any]: theme.text.lightDark,
    ["--text-subtle-dark" as any]: theme.text.subtleDark,
  };
}

export function applyThemeOnDocument(theme: ThemeVars) {
  const r = document.documentElement;
  const s = themeToStyle(theme);

  for (const [k, v] of Object.entries(s)) {
    if (typeof v === "string") r.style.setProperty(k, v);
  }
}

export type ThemeVars = {
  mode: "light" | "dark";
  brand: {
    primary: string; // "37 99 235"
    primaryDark: string; // "44 109 238"
    surface: string; // "241 245 249"
    surfaceDark: string; // "2 6 23"
    muted: string; // "226 232 240"
    mutedDark: string; // "16 24 41"
    accent?: string; // optional extras
  };
  text: {
    light: string;
    subtle: string;
    lightDark: string;
    subtleDark: string;
  };
};

export type TenantConfig = {
  templateId: number;
  themeColor: string;
  theme: ThemeVars;
};

import type { TenantConfig } from "@/types/tenant";

export const TENANTS: Record<string, TenantConfig> = {
  "commerce-topaz-sigma-62.vercel.app": {
    templateId: 1,
    themeColor: "#2563eb",
    theme: {
      mode: "dark",
      brand: {
        primary: "37 99 235",
        primaryDark: "44 109 238",
        surface: "241 245 249",
        surfaceDark: "2 6 23",
        muted: "226 232 240",
        mutedDark: "16 24 41",
      },
      text: {
        light: "30 41 59",
        subtle: "100 116 139",
        lightDark: "228 221 222",
        subtleDark: "106 119 138",
      },
    },
  },

  "commerce-sxvadomain.vercel.app": {
    templateId: 3,
    themeColor: "#10b981", // emerald-500
    theme: {
      mode: "dark",
      brand: {
        primary: "16 185 129", // emerald-500
        primaryDark: "5 150 105", // emerald-600
        surface: "240 253 244", // emerald-50
        surfaceDark: "6 20 13",
        muted: "209 250 229", // emerald-100
        mutedDark: "19 78 74",
      },
      text: {
        light: "17 24 39", // gray-900
        subtle: "107 114 128", // gray-500
        lightDark: "236 253 245",
        subtleDark: "134 239 172", // emerald-300
      },
    },
  },

  "localhost:3000": {
    templateId: 4,
    themeColor: "#a855f7", // purple-500
    theme: {
      mode: "dark",
      brand: {
        primary: "168 85 247", // purple-500
        primaryDark: "126 34 206", // purple-700
        surface: "250 245 255", // purple-50
        surfaceDark: "26 20 35",
        muted: "233 213 255", // purple-200
        mutedDark: "88 28 135",
      },
      text: {
        light: "30 27 75", // custom deep purple
        subtle: "107 114 128",
        lightDark: "243 232 255", // purple-100
        subtleDark: "196 181 253", // purple-300
      },
    },
  },

  "nika,ge": {
    templateId: 2,
    themeColor: "#f97316", // orange-500
    theme: {
      mode: "dark",
      brand: {
        primary: "249 115 22", // orange-500
        primaryDark: "194 65 12", // orange-700
        surface: "255 247 237", // orange-50
        surfaceDark: "30 27 25",
        muted: "253 230 138",
        mutedDark: "66 32 6",
      },
      text: {
        light: "31 41 55",
        subtle: "107 114 128",
        lightDark: "250 250 249",
        subtleDark: "156 163 175",
      },
    },
  },
};

export const DEFAULT_TENANT: TenantConfig = TENANTS["localhost:3000"];

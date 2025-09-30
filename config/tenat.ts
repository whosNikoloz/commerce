import type { TenantConfig } from "@/types/tenant";

export const TENANTS: Record<string, TenantConfig> = {
  "commerce-topaz-sigma-62.vercel.app": {
    "templateId": 1,
    "themeColor": "#2563eb",
    "theme": {
      "mode": "dark",
      "brand": {
        "primary": "37 99 235",
        "primaryDark": "44 109 238",
        "surface": "241 245 249",
        "surfaceDark": "2 6 23",
        "muted": "226 232 240",
        "mutedDark": "16 24 41"
      },
      "text": {
        "light": "30 41 59",
        "subtle": "100 116 139",
        "lightDark": "228 221 222",
        "subtleDark": "106 119 138"
      }
    }
  },
  "commerce-sxvadomain.vercel.app": {
    "templateId": 3,
    "themeColor": "#10b981",
    "theme": {
      "mode": "dark",
      "brand": {
        "primary": "16 185 129",
        "primaryDark": "5 150 105",
        "surface": "240 253 244",
        "surfaceDark": "6 20 13",
        "muted": "209 250 229",
        "mutedDark": "19 78 74"
      },
      "text": {
        "light": "17 24 39",
        "subtle": "107 114 128",
        "lightDark": "236 253 245",
        "subtleDark": "134 239 172"
      }
    }
  },
  "localhost:3000": {
    "templateId": 4,
    "themeColor": "#a855f7",
    "theme": {
      "mode": "dark",
      "brand": {
        "primary": "168 85 247",
        "primaryDark": "126 34 206",
        "surface": "250 245 255",
        "surfaceDark": "26 20 35",
        "muted": "233 213 255",
        "mutedDark": "88 28 135"
      },
      "text": {
        "light": "30 27 75",
        "subtle": "107 114 128",
        "lightDark": "243 232 255",
        "subtleDark": "196 181 253"
      }
    }
  },
  "nika,ge": {
    "templateId": 2,
    "themeColor": "#f97316",
    "theme": {
      "mode": "dark",
      "brand": {
        "primary": "249 115 22",
        "primaryDark": "194 65 12",
        "surface": "255 247 237",
        "surfaceDark": "30 27 25",
        "muted": "253 230 138",
        "mutedDark": "66 32 6"
      },
      "text": {
        "light": "31 41 55",
        "subtle": "107 114 128",
        "lightDark": "250 250 249",
        "subtleDark": "156 163 175"
      }
    }
  },
  "test-shop.example.com": {
    "templateId": 3,
    "themeColor": "#a855f7",
    "theme": {
      "mode": "dark",
      "brand": {
        "primary": "168 85 247",
        "primaryDark": "168 85 247",
        "surface": "241 245 249",
        "surfaceDark": "2 6 23",
        "muted": "226 232 240",
        "mutedDark": "16 24 41"
      },
      "text": {
        "light": "30 41 59",
        "subtle": "100 116 139",
        "lightDark": "228 221 222",
        "subtleDark": "106 119 138"
      }
    },
    "homepage": {
      "templateId": 3,
      "sections": []
    }
  }
};

export const DEFAULT_TENANT: TenantConfig = TENANTS["localhost:3000"];

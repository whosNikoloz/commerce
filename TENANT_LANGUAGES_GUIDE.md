# Dynamic Multi-Language Support via Tenant Config

## Overview

The system now supports dynamic language configuration through the tenant system. Languages and their dictionaries are configured per tenant in the backend and loaded automatically.

## How It Works

### 1. Tenant Config Structure

Your backend should return a tenant config with this structure:

```json
{
  "templateId": 1,
  "themeColor": "#000000",
  "theme": { ... },
  "homepage": { ... },
  "siteConfig": {
    "name": "My Store",
    "locales": ["en", "uz", "ka"],  // ← Supported languages
    "localeDefault": "uz",           // ← Default language
    ...
  },
  "dictionaries": {                  // ← Language dictionaries
    "en": {
      "common": {
        "home": "Home",
        "catalog": "Catalog",
        ...
      },
      "cart": { ... },
      "auth": { ... }
    },
    "uz": {
      "common": {
        "home": "Bosh sahifa",
        "catalog": "Katalog",
        ...
      },
      "cart": { ... },
      "auth": { ... }
    },
    "ka": {
      "common": {
        "home": "მთავარი",
        "catalog": "კატალოგი",
        ...
      },
      "cart": { ... },
      "auth": { ... }
    }
  }
}
```

### 2. Language Types

**All Languages Come from Tenant Config**:
- All languages and their dictionaries are configured in tenant's `dictionaries` object
- Stored in your backend database
- No need to manually create JSON files - everything is managed in tenant config
- Languages are automatically available based on what you configure in tenant config

**Static Files (Fallback Only)**:
- Static JSON files in `/dictionaries` folder (en.json, ka.json) are **only used as fallback**
- Used only if tenant config doesn't provide dictionaries for a locale
- You don't need to create or maintain these files - they're just safety fallbacks

### 3. Priority System

When loading a dictionary for a locale, the system checks in this order:

1. **Tenant Config Dictionaries** (Highest Priority) - All languages from tenant config
   - If you update English in tenant config, it will override static English
   - All languages come from tenant config when provided
2. **Static Files** (Fallback) - Only used if tenant config doesn't have the locale
3. **English Fallback** - Falls back to English (from tenant config or static) if locale not found

## Backend Requirements

### API Endpoint

Ensure your backend endpoint `/Tenant/tenant-configuration` returns:

```typescript
{
  // ... other tenant config
  siteConfig: {
    locales: string[],      // e.g., ["en", "uz", "ru", "ka"]
    localeDefault: string,  // e.g., "uz"
    // ... other site config
  },
  dictionaries?: {
    [locale: string]: {
      // Dictionary structure (same as en.json/ka.json)
      common: { ... },
      auth: { ... },
      cart: { ... },
      // etc.
    }
  }
}
```

### Adding a New Language

To add a new language (e.g., Russian "ru"):

1. **Add to tenant's `siteConfig.locales`**:
   ```json
   "locales": ["en", "uz", "ka", "ru"]
   ```

2. **Add dictionary to `dictionaries` object**:
   ```json
   "dictionaries": {
     "ru": {
       "common": {
         "home": "Главная",
         "catalog": "Каталог",
         ...
       },
       "cart": { ... },
       "auth": { ... }
     }
   }
   ```

3. **Update localized content** in your tenant config:
   ```json
   {
     "title": {
       "en": "Welcome",
       "uz": "Xush kelibsiz",
       "ka": "მოგესალმებით",
       "ru": "Добро пожаловать"
     }
   }
   ```

### Managing Dictionaries in Backend

You should implement database tables/collections:

**Option 1: Store in TenantConfig document**
```
Tenant {
  id: string
  domain: string
  config: {
    siteConfig: {
      locales: string[]
      localeDefault: string
    }
    dictionaries: {
      [locale: string]: object
    }
  }
}
```

**Option 2: Separate Dictionary table**
```
TenantDictionary {
  tenantId: string
  locale: string
  dictionary: object
}
```

Then merge when returning tenant config.

## Frontend Usage

### In Server Components

```typescript
import { getTenantByHost } from "@/lib/getTenantByHost";
import { getTranslations } from "@/lib/get-dictionary";

export default async function Page({ params }) {
  const config = await getTenantByHost(host);
  const dict = await getTranslations(params.lang, config);

  return <div>{dict.common.home}</div>;
}
```

### In Client Components

```typescript
"use client";
import { useTenant } from "@/app/context/tenantContext";

export default function MyComponent() {
  const { config } = useTenant();
  const locales = config?.siteConfig.locales || ["en", "ka"];
  const defaultLocale = config?.siteConfig.localeDefault || "ka";

  // Use locales...
}
```

### Localized Content

For tenant config fields (banners, product rails, etc.):

```typescript
import { t } from "@/lib/i18n";

const title = t(banner.title, locale); // Extracts title for current locale
```

## URL Structure

- Default locale hidden: `/` (e.g., if default is "uz")
- Other locales shown: `/en/`, `/ka/`, `/ru/`
- Middleware handles routing automatically

## Migration from Static to Dynamic

**No Migration Needed!** The system is now fully dynamic:

1. **All languages come from tenant config** - Just add `dictionaries` to your tenant config
2. **No need to create JSON files** - Everything is managed in your backend/tenant config
3. **Static files are fallback only** - They're only used if tenant config doesn't provide a locale
4. **Tenant dictionaries completely override static files** - If you update English in tenant config, it will override static English
5. **System gracefully falls back** - If tenant config is missing or doesn't have a locale, it falls back to static files

**To get started:**
- Simply add the `dictionaries` object to your tenant config with all your languages
- The system will automatically use them - no file creation needed!

## Example: Complete Tenant Config

```json
{
  "templateId": 1,
  "themeColor": "#4F46E5",
  "theme": { ... },
  "homepage": { ... },
  "siteConfig": {
    "name": "MyStore",
    "locales": ["en", "uz", "ru"],
    "localeDefault": "uz",
    "currency": "UZS",
    "url": "https://mystore.uz"
  },
  "dictionaries": {
    "en": {
      "common": { "home": "Home", "catalog": "Catalog" },
      "auth": { "login": { "title": "Sign In" } }
    },
    "uz": {
      "common": { "home": "Bosh sahifa", "catalog": "Katalog" },
      "auth": { "login": { "title": "Kirish" } }
    },
    "ru": {
      "common": { "home": "Главная", "catalog": "Каталог" },
      "auth": { "login": { "title": "Войти" } }
    }
  }
}
```

## Notes

- **All language codes should be lowercase** (e.g., "en", "uz", "ka", "ru")
- **Dictionary structure should match the base dictionaries** (en.json, ka.json) - you can use those as a reference for structure
- **No need to create JSON files manually** - All languages come from tenant config
- **Tenant config dictionaries override static files completely** - If you change English in tenant config, it will override static English
- **Missing translations fall back to English** (from tenant config or static)
- **System caches tenant config** for 5 minutes in middleware
- **Client-side caches tenant config** in localStorage
- **Static files are only used as fallback** - They're not required, just there as a safety net

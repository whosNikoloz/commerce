# Multi-Tenant Management System

## Overview

This project includes a comprehensive **GitHub-based tenant management system** that allows you to manage multiple tenant configurations without manual code changes or local development.

## Features

✨ **Live Editing** - Edit tenant configs from production admin panel
✨ **Auto-Deploy** - Changes push to GitHub and trigger automatic Vercel rebuild
✨ **No Downtime** - 2-3 minute deployment, site stays online
✨ **Version Control** - All changes tracked in Git history
✨ **Content Management** - Edit themes, sections, and content in both languages (Georgian & English)
✨ **Security** - Admin authentication required, encrypted tokens

---

## Architecture

```
┌─────────────────┐
│  Admin UI       │  User edits tenant config on live site
│  (Production)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Routes     │  Validates and processes changes
│  /api/admin/    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub Service │  Writes to config/tenat.ts on GitHub
│  (Octokit)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub Repo    │  Commit created, webhook fires
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel         │  Auto-rebuild triggered
│  (2-3 minutes)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Live Site      │  Changes deployed ✅
└─────────────────┘
```

---

## Quick Start

### Prerequisites
- GitHub repository
- Vercel deployment from GitHub
- Admin access

### Setup (5 minutes)

1. **Create GitHub Token**
   ```
   https://github.com/settings/tokens
   → Generate new token (classic)
   → Check ✅ repo permission
   → Copy token
   ```

2. **Add Environment Variables**

   **Local (`.env`):**
   ```bash
   GITHUB_TOKEN=ghp_your_token
   GITHUB_OWNER=your-username
   GITHUB_REPO=commerce
   GITHUB_BRANCH=main
   ```

   **Vercel:**
   ```
   Settings → Environment Variables
   → Add all 4 variables above
   → Select all environments
   → Redeploy
   ```

3. **Done!** Test at `/admin/tenants`

---

## File Structure

```
app/
├── api/
│   ├── admin/
│   │   └── tenants/
│   │       ├── create/route.ts      # Create tenant API
│   │       ├── update/route.ts      # Update tenant API
│   │       └── delete/route.ts      # Delete tenant API
│   └── services/
│       └── githubService.ts         # GitHub integration
│
components/
└── admin/
    └── tenant/
        ├── tenants-table.tsx        # Tenant list/management
        ├── add-tenant-modal.tsx     # Create new tenant
        ├── edit-tenant-modal.tsx    # Edit existing tenant
        └── section-content-editor.tsx # Edit section content

config/
└── tenat.ts                         # Tenant configurations (edited by API)

docs/
├── TENANT_MANAGEMENT_SETUP.md       # Full setup guide
├── TENANT_MANAGEMENT_QUICK_START.md # Quick reference
└── HOMEPAGE_TEMPLATING.md           # Template system docs
```

---

## Usage

### Create New Tenant
```
1. /admin/tenants → Add Tenant
2. Enter domain (e.g., shop.example.com)
3. Select template (Tech/Furniture/Beauty)
4. Choose theme color and mode
5. Save → Wait 2-3 min → Live ✅
```

### Edit Tenant
```
1. /admin/tenants → Edit button
2. Modify theme, sections, or content
3. Save → Wait 2-3 min → Live ✅
```

### Edit Section Content
```
1. /admin/tenants → Edit → Sections tab
2. Click pencil icon on section
3. Edit text in English & Georgian
4. Save → Wait 2-3 min → Live ✅
```

---

## Templates

### Template 1: Tech/Electronics
- Search-focused hero
- Product comparisons
- Deal countdowns
- Brand strips

### Template 2: Home/Furniture
- Lifestyle imagery
- Product configurator
- Customer gallery
- Brand story

### Template 3: Beauty/Health
- Social proof focus
- Influencer content
- Product bundles
- Review walls

---

## API Reference

### Create Tenant
```http
POST /api/admin/tenants/create
Content-Type: application/json

{
  "domain": "shop.example.com",
  "config": {
    "templateId": 1,
    "themeColor": "#2563eb",
    "theme": { ... },
    "homepage": { ... }
  }
}
```

### Update Tenant
```http
PUT /api/admin/tenants/update
Content-Type: application/json

{
  "domain": "shop.example.com",
  "config": { ... }
}
```

### Delete Tenant
```http
DELETE /api/admin/tenants/delete
Content-Type: application/json

{
  "domain": "shop.example.com"
}
```

---

## Security

- ✅ **Authentication**: Admin token required (cookie-based)
- ✅ **Authorization**: Only admins can access tenant management
- ✅ **Encryption**: GitHub token stored in encrypted env vars
- ✅ **Audit Trail**: All changes logged in Git commits
- ✅ **Validation**: Config structure validated before save
- ✅ **Rate Limiting**: API routes protected

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "GitHub configuration missing" | Add environment variables to Vercel |
| Changes not appearing | Check Vercel deployments tab |
| 401 Unauthorized | Regenerate GitHub token with `repo` permission |
| Deployment failed | Check Vercel logs for build errors |

---

## Performance

- **Edit time**: ~1 second (write to GitHub)
- **Deploy time**: 2-3 minutes (Vercel rebuild)
- **Runtime performance**: Blazing fast (static config imports)
- **Caching**: ISR with 5-minute revalidation

---

## Limitations

❌ **Cannot edit via UI:**
- Template ID changes
- New section types
- Section type changes

✅ **Requires manual code change:**
- Adding new templates
- Creating new section types
- Modifying section schemas

---

## Development

### Local Testing
```bash
# 1. Add GitHub token to .env
# 2. Start dev server
npm run dev

# 3. Test at http://localhost:3000/admin/tenants
```

### Testing GitHub Integration
```bash
# After making changes via UI, check:
git log config/tenat.ts  # See commit
git show HEAD            # See changes
```

---

## Deployment Checklist

Before going live:

- [ ] GitHub token created with `repo` permission
- [ ] Environment variables added to Vercel
- [ ] Vercel redeployed to pick up env vars
- [ ] Test tenant creation on staging
- [ ] Test tenant editing on staging
- [ ] Verify changes deploy correctly
- [ ] Check GitHub commits are created
- [ ] Test with actual production domain

---

## Documentation

- **Setup Guide**: [`docs/TENANT_MANAGEMENT_SETUP.md`](./docs/TENANT_MANAGEMENT_SETUP.md)
- **Quick Start**: [`docs/TENANT_MANAGEMENT_QUICK_START.md`](./docs/TENANT_MANAGEMENT_QUICK_START.md)
- **Template System**: [`docs/HOMEPAGE_TEMPLATING.md`](./docs/HOMEPAGE_TEMPLATING.md)

---

## Support

For issues or questions:
1. Check troubleshooting guides
2. Review Vercel deployment logs
3. Check GitHub commits
4. Verify environment variables

---

## Version History

- **v1.0** - Initial implementation
  - GitHub-based tenant management
  - Admin UI for CRUD operations
  - Auto-deploy on changes
  - Bilingual content editing
  - Section management

---

## License

Part of the Next.js Commerce project.
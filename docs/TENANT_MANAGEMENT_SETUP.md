# Tenant Management Setup Guide

This guide explains how to set up the GitHub-based tenant management system that allows you to update tenant configurations from the admin UI without manual code changes.

## Overview

The tenant management system:
- ✅ Edits `config/tenat.ts` directly on GitHub
- ✅ Automatically triggers Vercel rebuild
- ✅ Changes go live in 2-3 minutes
- ✅ Works from production admin panel
- ✅ No local project editing needed

---

## Prerequisites

- GitHub repository for your project
- Vercel project deployed from GitHub (auto-deploy enabled)
- Admin access to your project

---

## Setup Steps

### 1. Create GitHub Personal Access Token

1. **Go to GitHub Settings**
   - Navigate to https://github.com/settings/tokens
   - Or: GitHub Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Click "Generate new token (classic)"
   - Give it a descriptive name: `Commerce Tenant Management`

3. **Set Permissions**
   - Check **`repo`** (Full control of private repositories)
     - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
   - Leave all other permissions unchecked

4. **Set Expiration**
   - Recommended: **No expiration** (for production)
   - Or: **1 year** (more secure, but needs renewal)

5. **Generate Token**
   - Click "Generate token" at the bottom
   - **IMPORTANT:** Copy the token immediately (starts with `ghp_`)
   - You won't be able to see it again!

---

### 2. Add Environment Variables Locally

1. **Open `.env` file** in your project root

2. **Add these variables:**
   ```bash
   # GitHub Integration for Tenant Management
   GITHUB_TOKEN=ghp_your_actual_token_here
   GITHUB_OWNER=your-github-username
   GITHUB_REPO=commerce
   GITHUB_BRANCH=main
   ```

3. **Replace values:**
   - `GITHUB_TOKEN`: Paste the token you copied
   - `GITHUB_OWNER`: Your GitHub username (e.g., `johndoe`)
   - `GITHUB_REPO`: Repository name (usually `commerce`)
   - `GITHUB_BRANCH`: Branch to update (usually `main`)

**Example:**
```bash
GITHUB_TOKEN=ghp_AbCdEf123456789XyZ
GITHUB_OWNER=johndoe
GITHUB_REPO=commerce
GITHUB_BRANCH=main
```

---

### 3. Add Environment Variables to Vercel

**IMPORTANT:** Environment variables must be added to Vercel for production.

1. **Open Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your project

2. **Go to Settings → Environment Variables**
   - Click "Settings" tab
   - Click "Environment Variables" in sidebar

3. **Add Each Variable:**

   **a) GITHUB_TOKEN**
   - Name: `GITHUB_TOKEN`
   - Value: `ghp_your_actual_token_here`
   - Environments: Check ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   **b) GITHUB_OWNER**
   - Name: `GITHUB_OWNER`
   - Value: `your-github-username`
   - Environments: Check ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   **c) GITHUB_REPO**
   - Name: `GITHUB_REPO`
   - Value: `commerce`
   - Environments: Check ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   **d) GITHUB_BRANCH**
   - Name: `GITHUB_BRANCH`
   - Value: `main`
   - Environments: Check ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

4. **Redeploy**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - This picks up the new environment variables

---

### 4. Verify Setup

1. **Test Locally First:**
   ```bash
   npm run dev
   ```
   - Navigate to `http://localhost:3000/admin`
   - Log in to admin panel
   - Go to "Tenants" section
   - Try creating a test tenant
   - Check GitHub repo for the commit

2. **Test on Production:**
   - Wait for Vercel redeployment to complete
   - Navigate to `https://your-domain.com/admin`
   - Log in
   - Edit a tenant's content
   - Wait 2-3 minutes
   - Refresh and verify changes are live

---

## How It Works

### User Flow:
```
1. Admin opens /admin/tenants on LIVE site
2. Edits tenant (headline, theme, sections, etc.)
3. Clicks "Save Changes"
   ↓
4. API writes to GitHub (config/tenat.ts)
   ↓
5. GitHub webhook triggers Vercel
   ↓
6. Vercel rebuilds automatically (2-3 min)
   ↓
7. Changes go LIVE ✅
```

### Behind the Scenes:
```javascript
Admin UI → API Route → GitHub API → Commit to repo
                                         ↓
                              GitHub webhook to Vercel
                                         ↓
                              Vercel: npm install → build → deploy
                                         ↓
                              Site updated with new config
```

---

## Security Considerations

### ✅ **What's Protected:**
- Admin authentication required (existing system)
- GitHub token stored in environment variables (not in code)
- Token has limited scope (only repo access)
- All changes tracked in Git history
- Rate limiting on API routes

### 🔒 **Token Security:**
- **Never** commit `.env` to Git
- `.env` is in `.gitignore` by default
- Vercel environment variables are encrypted
- Only admins can access the tenant UI

### 📝 **Audit Trail:**
- All changes create Git commits
- Commit messages include tenant domain
- View history: `git log config/tenat.ts`

---

## Troubleshooting

### Error: "GitHub configuration missing"

**Problem:** Environment variables not set

**Solution:**
1. Check `.env` file has all 4 variables
2. Check Vercel dashboard has all 4 variables
3. Redeploy on Vercel after adding variables

---

### Error: "Failed to fetch tenant config from GitHub"

**Problem:** Invalid token or permissions

**Solution:**
1. Verify token has `repo` permission
2. Generate a new token if expired
3. Update token in `.env` and Vercel
4. Redeploy

---

### Error: "Tenant with domain already exists"

**Problem:** Trying to create duplicate tenant

**Solution:**
- Edit existing tenant instead of creating new one
- Or delete old tenant first, then create new one

---

### Changes Not Appearing After 3 Minutes

**Problem:** Vercel didn't rebuild, or build failed

**Solution:**
1. Check Vercel dashboard → Deployments
2. Look for new deployment triggered by GitHub
3. Check deployment logs for errors
4. Verify GitHub commit was created: Check repo commits

---

### 401 Unauthorized Error

**Problem:** GitHub token invalid or expired

**Solution:**
1. Go to GitHub → Settings → Personal access tokens
2. Check token status (active/expired)
3. Generate new token if needed
4. Update in `.env` and Vercel
5. Redeploy

---

## Usage Examples

### Example 1: Change Theme Color

```
1. Go to /admin/tenants
2. Click Edit on a tenant
3. Go to "Theme" tab
4. Change color picker to new color
5. Click "Save Changes"
6. Wait 2-3 minutes
7. Site now has new theme color ✅
```

### Example 2: Edit Section Content

```
1. Go to /admin/tenants
2. Click Edit on a tenant
3. Go to "Sections" tab
4. Click pencil icon on "Hero With Search"
5. Edit headline in English and Georgian
6. Click "Save Changes" in content editor
7. Click "Save Changes" in tenant modal
8. Wait 2-3 minutes
9. Homepage now shows new headline ✅
```

### Example 3: Toggle Section On/Off

```
1. Go to /admin/tenants
2. Click Edit on a tenant
3. Go to "Sections" tab
4. Toggle switch on "Product Rail Laptops"
5. Click "Save Changes"
6. Wait 2-3 minutes
7. Section is now hidden on homepage ✅
```

---

## Next Steps

After setup is complete:

1. ✅ Test creating a new tenant
2. ✅ Test editing existing tenant
3. ✅ Test deleting a tenant
4. ✅ Verify changes appear after 2-3 minutes
5. ✅ Check Git commits are created properly

---

## Support

If you encounter issues:

1. Check this troubleshooting guide first
2. Check Vercel deployment logs
3. Check GitHub repository for commits
4. Verify all environment variables are set correctly

---

## Important Notes

- **2-3 Minute Delay:** This is normal for Vercel rebuilds
- **No Local Editing:** You never need to edit files locally for tenant changes
- **Git History:** All changes are version controlled
- **Safe to Test:** You can always revert via Git if needed
- **Production Ready:** This system is designed for live production use

---

## What Gets Updated

When you edit a tenant through the admin UI:

✅ **Instant Changes (on GitHub):**
- Theme colors
- Section enable/disable toggles
- Section content (headlines, descriptions, images)
- Section order

✅ **Live After Rebuild (2-3 min):**
- All the above changes reflected on the site

❌ **Not Editable via UI:**
- Template ID (requires manual code change)
- Section types (requires manual code change)
- New section types (requires developer)

---

## Backup and Recovery

### Manual Backup:
```bash
# Download current config
git pull
cp config/tenat.ts config/tenat.backup.ts
```

### Restore from Backup:
```bash
# If something goes wrong
git revert HEAD  # Undo last commit
git push         # Vercel will redeploy with old config
```

---

## Advanced: Monitoring Deployments

Optional: Add deployment monitoring

```typescript
// app/api/admin/tenants/status/route.ts
export async function GET() {
  // Check latest Vercel deployment status
  // Return deployment progress
  // Use for "Deployment in progress" UI
}
```

This is optional - basic functionality works without it.
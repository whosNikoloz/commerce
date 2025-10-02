# Tenant Management - Quick Start

## 🚀 What This Does

Edit tenant configurations (themes, content, sections) from your admin panel on the **live production site**. Changes automatically update GitHub and redeploy in 2-3 minutes.

**No local editing. No manual deployments. Just click, save, and wait.**

---

## ⚡ Quick Setup (5 Minutes)

### 1. Create GitHub Token
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Check ✅ **`repo`** permission
4. Copy token (starts with `ghp_`)

### 2. Add to Local `.env`
```bash
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-username
GITHUB_REPO=commerce
GITHUB_BRANCH=main
```

### 3. Add to Vercel
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all 4 variables above
3. Select: ✅ Production, ✅ Preview, ✅ Development
4. Redeploy

---

## ✅ You're Done!

### Test It:
1. Go to `https://your-site.com/admin/tenants`
2. Edit a tenant
3. Change theme color or headline
4. Click Save
5. Wait 2-3 minutes
6. Refresh → Changes are live ✨

---

## 📖 Full Documentation

See [`TENANT_MANAGEMENT_SETUP.md`](./TENANT_MANAGEMENT_SETUP.md) for:
- Detailed setup instructions
- Troubleshooting guide
- Security considerations
- Usage examples

---

## 🔥 Common Actions

### Change Theme Color
```
Admin → Tenants → Edit → Theme tab → Color picker → Save
Wait 2-3 min → Live ✅
```

### Edit Section Content
```
Admin → Tenants → Edit → Sections tab → Pencil icon → Edit → Save
Wait 2-3 min → Live ✅
```

### Toggle Section On/Off
```
Admin → Tenants → Edit → Sections tab → Toggle switch → Save
Wait 2-3 min → Live ✅
```

---

## ⚠️ Important Notes

- **2-3 minute delay** is normal (Vercel rebuild time)
- **All changes tracked** in Git history
- **Can't break production** - always revertable via Git
- **Works from anywhere** - edit from live admin panel
- **Secure** - admin auth required, token encrypted

---

## 🆘 Troubleshooting

### "GitHub configuration missing"
→ Add environment variables to Vercel and redeploy

### Changes not appearing
→ Check Vercel deployments tab for build status

### 401 Unauthorized
→ Generate new GitHub token with `repo` permission

---

## 🎯 What You Can Edit

✅ **Theme colors**
✅ **Section content** (headlines, images, text)
✅ **Section toggles** (show/hide)
✅ **Theme mode** (light/dark)

❌ **Template ID** (requires code change)
❌ **Section types** (requires developer)

---

**Questions?** See full docs or check GitHub commits for your changes.
# Setup Checklist: GitHub-Based Tenant Management

## 📋 Pre-Deployment Checklist

### ✅ Step 1: Create GitHub Personal Access Token

- [ ] Go to https://github.com/settings/tokens
- [ ] Click "Generate new token (classic)"
- [ ] Name: `Commerce Tenant Management`
- [ ] Select scope: ✅ **`repo`** (Full control of private repositories)
- [ ] Click "Generate token"
- [ ] **Copy token** (starts with `ghp_`) - You won't see it again!

---

### ✅ Step 2: Configure Local Environment

- [ ] Open `.env` file in project root
- [ ] Add the following variables:
  ```bash
  GITHUB_TOKEN=ghp_paste_your_token_here
  GITHUB_OWNER=your-github-username
  GITHUB_REPO=commerce
  GITHUB_BRANCH=main
  ```
- [ ] Replace `ghp_paste_your_token_here` with actual token
- [ ] Replace `your-github-username` with your GitHub username
- [ ] Save `.env` file

---

### ✅ Step 3: Test Locally

- [ ] Run `npm run dev`
- [ ] Navigate to `http://localhost:3000/admin`
- [ ] Log in to admin panel
- [ ] Go to "Tenants" section
- [ ] Click "Add Tenant"
- [ ] Create a test tenant (domain: `test.localhost`)
- [ ] Check if GitHub commit was created:
  ```bash
  git log config/tenat.ts
  ```
- [ ] Verify commit message includes "Add tenant configuration for test.localhost"
- [ ] Delete test tenant

---

### ✅ Step 4: Push to GitHub

- [ ] Commit has been created (already done ✅)
- [ ] Push to GitHub:
  ```bash
  git push origin main
  ```
- [ ] Verify push succeeded

---

### ✅ Step 5: Configure Vercel

- [ ] Go to https://vercel.com/dashboard
- [ ] Select your project
- [ ] Click "Settings" → "Environment Variables"
- [ ] Add **GITHUB_TOKEN**:
  - Name: `GITHUB_TOKEN`
  - Value: `ghp_your_token_here`
  - Environments: ✅ Production, ✅ Preview, ✅ Development
  - Click "Save"
- [ ] Add **GITHUB_OWNER**:
  - Name: `GITHUB_OWNER`
  - Value: `your-github-username`
  - Environments: ✅ Production, ✅ Preview, ✅ Development
  - Click "Save"
- [ ] Add **GITHUB_REPO**:
  - Name: `GITHUB_REPO`
  - Value: `commerce`
  - Environments: ✅ Production, ✅ Preview, ✅ Development
  - Click "Save"
- [ ] Add **GITHUB_BRANCH**:
  - Name: `GITHUB_BRANCH`
  - Value: `main`
  - Environments: ✅ Production, ✅ Preview, ✅ Development
  - Click "Save"

---

### ✅ Step 6: Redeploy on Vercel

- [ ] Go to "Deployments" tab in Vercel
- [ ] Click "..." menu on latest deployment
- [ ] Click "Redeploy"
- [ ] Wait for deployment to complete (~2-3 minutes)
- [ ] Check deployment status - should show "Ready"

---

### ✅ Step 7: Test on Production

- [ ] Navigate to `https://your-production-domain.com/admin`
- [ ] Log in with admin credentials
- [ ] Go to "Tenants" section
- [ ] Verify existing tenants are listed
- [ ] Click "Edit" on a tenant
- [ ] Go to "Theme" tab
- [ ] Change theme color slightly
- [ ] Click "Save Changes"
- [ ] Look for toast: "Tenant updated! Changes will be live in 2-3 minutes"
- [ ] Wait 3 minutes
- [ ] Refresh page
- [ ] Verify color change is visible

---

### ✅ Step 8: Verify GitHub Integration

- [ ] Go to your GitHub repository
- [ ] Click on "Commits"
- [ ] Verify you see a commit with message: "Update tenant configuration for [domain]"
- [ ] Click on the commit
- [ ] Verify `config/tenat.ts` was modified
- [ ] Check commit author (should be your GitHub username)

---

### ✅ Step 9: Verify Vercel Auto-Deploy

- [ ] In Vercel dashboard, go to "Deployments"
- [ ] Look for deployment triggered by the GitHub commit
- [ ] Click on deployment
- [ ] Check build logs - should show successful build
- [ ] Verify deployment status: "Ready"

---

### ✅ Step 10: Final Smoke Tests

**Test 1: Create Tenant**
- [ ] Admin → Tenants → Add Tenant
- [ ] Domain: `test-shop.example.com`
- [ ] Template: Tech/Electronics
- [ ] Theme: Choose color
- [ ] Save
- [ ] Check GitHub for commit
- [ ] Wait 3 minutes
- [ ] Check Vercel deployments
- [ ] Verify deployment succeeded

**Test 2: Edit Section Content**
- [ ] Admin → Tenants → Edit (any tenant)
- [ ] Sections tab → Click pencil on "Hero With Search"
- [ ] Change headline in English
- [ ] Save content editor → Save tenant modal
- [ ] Check GitHub for commit
- [ ] Wait 3 minutes
- [ ] Refresh homepage
- [ ] Verify new headline appears

**Test 3: Delete Tenant**
- [ ] Admin → Tenants → Delete `test-shop.example.com`
- [ ] Confirm deletion
- [ ] Check GitHub for commit
- [ ] Wait 3 minutes
- [ ] Verify deployment
- [ ] Verify tenant removed from list

---

## 🎉 You're All Set!

If all checkboxes above are checked, your tenant management system is fully operational!

---

## 📊 System Status Check

Run this checklist periodically to ensure everything is working:

- [ ] Can access `/admin/tenants` on production
- [ ] Can create new tenants
- [ ] Can edit existing tenants
- [ ] Can delete tenants
- [ ] Changes appear on GitHub within 1 minute
- [ ] Changes deploy on Vercel within 3 minutes
- [ ] Changes visible on live site after deployment
- [ ] No error messages in browser console
- [ ] No failed deployments in Vercel

---

## 🆘 Troubleshooting

If something doesn't work, check:

1. **Environment Variables**
   - [ ] All 4 variables set in Vercel
   - [ ] Values are correct (no typos)
   - [ ] Vercel was redeployed after adding variables

2. **GitHub Token**
   - [ ] Token is valid (not expired)
   - [ ] Token has `repo` permission
   - [ ] Token matches username/repo specified

3. **Vercel Deployment**
   - [ ] Build succeeds (check logs)
   - [ ] No errors during deployment
   - [ ] Latest commit is deployed

4. **Git Configuration**
   - [ ] Repository URL is correct
   - [ ] Branch name is correct (`main` or `master`)
   - [ ] You have push access to repository

---

## 📚 Documentation

- **Setup Guide**: `docs/TENANT_MANAGEMENT_SETUP.md`
- **Quick Start**: `docs/TENANT_MANAGEMENT_QUICK_START.md`
- **System Overview**: `README_TENANT_SYSTEM.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`

---

## ✉️ Need Help?

1. Read troubleshooting sections in documentation
2. Check Vercel deployment logs
3. Check browser console for errors
4. Verify all environment variables are set
5. Test locally first before production

---

**Last Updated:** Implementation completed
**Status:** Ready for production use ✅
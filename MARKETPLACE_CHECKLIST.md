# Marketplace Submission Checklist

Use this checklist to track your progress toward private marketplace distribution.

---

## Phase 1: Preparation ✅

- [x] App tested and working in development
- [x] Code quality checked (forge lint)
- [x] README.md comprehensive and up-to-date
- [x] Distribution guides created
- [x] All recent changes committed to repository

---

## Phase 2: Production Deployment

### Configure Module Type

- [ ] Choose module type for marketplace distribution
  - [ ] **Recommended**: `jira:projectSettingsPage` (Project Settings → Apps, admin-only)
  - [ ] **Alternative**: `jira:projectPage` (all project sidebars, all users)
  - [ ] Edit `manifest.yml` to enable chosen module type (see inline comments)
  - [ ] Document your choice for user guides

### Deploy to Production Environment

- [ ] Deploy to production
  ```bash
  forge deploy --environment production
  ```

- [ ] Test on production environment
  ```bash
  # Install on your test site
  forge install --site <your-test-site> --environment production

  # Set production environment variable (site URL is auto-detected)
  forge variables set OPENAI_API_KEY "your-key" --environment production
  ```

- [ ] Verify app works correctly on production
  - [ ] Can access "AI-powered Release Notes" (check project sidebar OR Project Settings → Apps based on module type)
  - [ ] Can generate release notes successfully
  - [ ] Confluence draft page is created
  - [ ] All links work correctly

---

## Phase 3: Marketplace Setup

### Access Developer Console

- [ ] Go to https://developer.atlassian.com/console/myapps/
- [ ] Click on your app: **"release-notes-generator"**
- [ ] Navigate to **Distribution** tab

### Fill in Marketplace Information

- [ ] **App Name**: AI-powered Release Notes Generator
- [ ] **App Summary** (one sentence):
  ```
  Automatically generate AI-powered release notes from Jira sprints and create Confluence draft pages.
  ```
- [ ] **App Description** (detailed) - Copy from DISTRIBUTION.md
- [ ] **Categories**: Developer Tools, Project Management
- [ ] **Pricing**: Free
- [ ] **Support URL**: Your GitHub repo or support channel
- [ ] **Support Email**: Your email

### Screenshots & Media

- [ ] Take screenshots of the app in action:
  1. Main form in Jira project page
  2. Generated Confluence draft page
  3. Example of classified tickets (New Features, Enhancements, Bugs)

- [ ] Upload at least 3 screenshots
- [ ] Consider adding a short demo video (optional but helpful)

### Privacy & Security

- [ ] Privacy Policy URL (if required)
- [ ] Terms of Use URL (optional)
- [ ] Security practices documented

---

## Phase 4: Set Private Distribution

- [ ] In Distribution settings, select **"Private"**
- [ ] Add initial list of colleague email addresses:
  ```
  colleague1@company.com
  colleague2@company.com
  colleague3@company.com
  ```
- [ ] Review who has access

---

## Phase 5: Submission

- [ ] Review all information for accuracy
- [ ] Click **"Submit for review"**
- [ ] Note submission date: _______________
- [ ] Wait for approval email (typically 3-5 business days)

---

## Phase 6: Post-Approval

### After App is Approved

- [ ] Receive approval notification
- [ ] Verify app appears in marketplace for invited users
- [ ] Test installation process as a colleague would

### Notify Colleagues

- [ ] Send email to colleagues with:
  - [ ] Link to QUICK_START_FOR_USERS.md
  - [ ] Marketplace link (they'll receive invitation email too)
  - [ ] Your contact info for support
  - [ ] Any company-specific setup instructions

### Set Up Support Channel

- [ ] Create support channel (email, Slack, etc.)
- [ ] Document common issues and solutions
- [ ] Set up monitoring for errors (forge logs)

---

## Phase 7: Ongoing Maintenance

### Weekly Tasks
- [ ] Check forge logs for errors
- [ ] Monitor OpenAI API usage
- [ ] Respond to colleague questions/issues

### Monthly Tasks
- [ ] Review colleague feedback
- [ ] Consider improvements or new features
- [ ] Update documentation if needed

### As Needed
- [ ] Add/remove colleague access in marketplace
- [ ] Deploy updates to production
- [ ] Communicate major changes to users

---

## Quick Reference Commands

### Check current deployment
```bash
forge deploy list
```

### View production logs
```bash
forge logs --environment production
```

### Deploy update to production
```bash
forge deploy --environment production
# Users get update automatically - no reinstall needed!
```

### Manage environment variables
```bash
# List current variables
forge variables list --environment production

# Set/update variable
forge variables set VARIABLE_NAME "value" --environment production
```

---

## Important URLs

- **Developer Console**: https://developer.atlassian.com/console/myapps/
- **Marketplace**: https://marketplace.atlassian.com/
- **Your App ID**: `ari:cloud:ecosystem::app/2ef8450b-7377-4520-bf7d-7274d6e5bd45`
- **Support Documentation**: See DISTRIBUTION.md

---

## Notes

- Private marketplace apps can have up to 100 installations
- Updates deploy automatically to all users
- You maintain full control over who can access
- Approval process usually takes 3-5 business days
- You can add/remove users anytime after approval

---

## Current Status

**Current Phase**: ☐ Phase 1 ☐ Phase 2 ☐ Phase 3 ☐ Phase 4 ☐ Phase 5 ☐ Phase 6 ☐ Phase 7

**Last Updated**: _______________

**Notes**:

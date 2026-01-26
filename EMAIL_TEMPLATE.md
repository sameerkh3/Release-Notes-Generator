# Email Template for Colleagues

Copy and customize this email to send to colleagues after your app is approved on the marketplace.

---

**Subject**: 🚀 New Tool: AI-powered Release Notes Generator for Jira

---

Hi team,

I'm excited to share a new tool I've built to streamline our release notes process: **AI-powered Release Notes Generator**.

## What it does

This Jira app automatically:
- ✅ Fetches sprint tickets marked for release notes
- ✅ Uses AI to classify them (New Features, Enhancements, Bug Fixes)
- ✅ Generates user-friendly summaries (no technical jargon)
- ✅ Creates a formatted Confluence draft page with custom titles
- ✅ Processes large sprints efficiently

**Result**: Release notes that used to take 1-2 hours now take 2 minutes!

## Installation (One-Time, ~5 minutes)

### Step 1: Install from Marketplace
You should receive an invitation email shortly. Alternatively:
1. Go to [Atlassian Marketplace](https://marketplace.atlassian.com/)
2. Search for "AI-powered Release Notes Generator"
3. Click "Get it now" and select your Atlassian site
4. Grant access to Jira and Confluence

### Step 2: Environment Setup
I'll configure the required settings for your site. Please send me:
- Your Atlassian site URL (e.g., `https://your-company.atlassian.net`)
- Whether you want to use a shared OpenAI key or your own

### Step 3: Add Custom Field (Jira Admins)
In Jira → Settings → Issues → Custom fields:
- Create field: **"Release Notes Required"**
- Type: Select List (single choice)
- Options: **Yes**, **No**

## How to Use (Every Sprint)

1. Mark tickets with "Release Notes Required = Yes"
2. Open "AI-powered Release Notes" in your Jira project sidebar
3. Fill in:
   - Page title (e.g., "Release Notes - Sprint 36 - January 2026")
   - Sprint ID
   - Confluence space key
   - Parent page ID (optional)
4. Click "Generate Release Notes"
5. Review the draft in Confluence and publish!

## Cost

- **Very affordable**: ~$0.10-0.30 per 50-ticket sprint
- We can use a shared OpenAI key or individual keys

## Quick Start Guide

I've prepared a detailed quick start guide: [Link to QUICK_START_FOR_USERS.md]

## Support

If you run into any issues:
- **Email me**: [Your email]
- **Slack**: [Your Slack handle/channel]
- **Documentation**: [Link to repository/docs]

## Demo (Optional)

I'm happy to do a quick 10-minute demo if you'd like to see it in action before installing. Just let me know!

---

Looking forward to making release notes less painful for everyone! 🎉

Best,
[Your name]

---

## Attachment Checklist

When sending this email, consider attaching:
- [ ] QUICK_START_FOR_USERS.md (simplified guide)
- [ ] Screenshots of the app in action
- [ ] Example generated release notes (Confluence page)


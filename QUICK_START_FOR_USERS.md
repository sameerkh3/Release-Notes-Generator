# Quick Start Guide for Users

## Installation (One-Time Setup)

### 1. Install from Marketplace
- You'll receive an email invitation to install the app
- Click the link or go to Atlassian Marketplace
- Search for **"AI-powered Release Notes Generator"**
- Click **"Get it now"** and select your site
- Grant access to Jira and Confluence

### 2. Get Your Environment Variables Ready
Contact the app owner (the person who sent you this) to configure:
- Your Jira site URL (e.g., `https://your-company.atlassian.net`)
- Your OpenAI API key (or use a shared company key)

### 3. Add the Custom Field (One-Time)
In Jira → Settings → Issues → Custom fields:
- Create: **"Release Notes Required"**
- Type: Select List (single choice)
- Options: **Yes**, **No**

---

## Usage (Every Sprint)

### Step 1: Mark Tickets for Release Notes
In your sprint, set "Release Notes Required" = **Yes** for tickets you want included.

### Step 2: Open the App
1. Go to any Jira project
2. Find **"AI-powered Release Notes"** in the left sidebar

### Step 3: Fill in the Form
- **Page Title**: e.g., "Release Notes - Sprint 36 - January 2026"
- **Sprint ID**: The number from your sprint URL
- **Space Key**: Your Confluence space (e.g., "RN" from `/wiki/spaces/RN`)
- **Parent Page ID** (optional): Page ID where you want to nest the draft

### Step 4: Generate
Click **"Generate Release Notes"** and wait ~30 seconds.

### Step 5: Review & Publish
Click the generated Confluence URL, review the draft, edit if needed, and publish!

---

## What the App Does

✅ Fetches all tickets marked "Release Notes Required = Yes" from your sprint
✅ Uses AI to classify them: New Features, Enhancements, Bug Fixes
✅ Writes user-friendly summaries (not technical jargon)
✅ Creates a formatted Confluence draft page
✅ Includes links to all Jira tickets

---

## Common Issues

**"Missing environment variable"**
→ Contact the app owner to set up your site URL and OpenAI key

**"Custom field not found"**
→ Create "Release Notes Required" field as described above

**"No tickets found"**
→ Make sure tickets have "Release Notes Required = Yes" set

**"Page not found" after generation**
→ Check your Space Key and Parent Page ID are correct

---

## Cost

- **Forge**: Free for development, minimal for production
- **OpenAI**: ~$0.10-0.30 per 50-ticket sprint (very cheap!)

Your company can use a shared OpenAI key, or each user can provide their own.

---

## Support

Questions? Contact: [Your email/team channel]

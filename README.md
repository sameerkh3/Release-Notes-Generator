# Release Notes Generator (Forge)

A private Atlassian Forge app that generates sprint-based release notes from Jira issues and (optionally) creates a Confluence draft page. It uses OpenAI to classify and rewrite release notes.

---

## What this app provides
- **Jira Project Page**: "Release Notes Generator"
- Fetches issues from a Sprint where **"Release Notes Required" = Yes** (regardless of status)
- Groups issues into release sections (new features, enhancements, bugs)
- Creates a **Confluence draft page**
- Uses **OpenAI** for summarization and classification

---

## Prerequisites
You will need:
- **Node.js** (Forge runtime uses `nodejs24.x`, Node 24 recommended)
- **Atlassian Forge CLI**
- An Atlassian **site** with Jira (and Confluence if using draft pages)
- **Site admin** permissions (or access to a site admin)
- An **OpenAI API key**

### Install Forge CLI
```bash
npm install -g @forge/cli
forge --version
```

Login to Forge:
```bash
forge login
```

---

## Clone the repository
```bash
git clone <REPOSITORY_URL>
cd <REPOSITORY_FOLDER>
```

Install dependencies:
```bash
npm install
```

---

## Register the app
Each person installing the app must register it under their own Atlassian account.

```bash
forge register
```

---

## Configure environment variables
This app requires two environment variables to be configured as Forge variables.

### Required: Jira Site URL
Set your Atlassian instance URL:
```bash
forge variables set JIRA_SITE_URL "https://your-site.atlassian.net" --environment development
```

**Important**: This variable is required. The app will not work without it. Replace `your-site` with your actual Atlassian site subdomain.

(Optional) If deploying to production later:
```bash
forge variables set JIRA_SITE_URL "https://your-site.atlassian.net" --environment production
```

### Required: OpenAI API Key
Set it for development:
```bash
forge variables set OPENAI_API_KEY "YOUR_OPENAI_API_KEY" --environment development
```

(Optional) If deploying to production later:
```bash
forge variables set OPENAI_API_KEY "YOUR_OPENAI_API_KEY" --environment production
```

---

## Deploy the app
Deploy to the development environment:
```bash
forge deploy --environment development
```

---

## Install the app
Install the app on your Atlassian site:
```bash
forge install --environment development
```

During installation:
- Select your Atlassian site
- Choose Jira (and Confluence if prompted)

After installation, open any **Jira project** and locate **Release Notes Generator** in the project navigation.

---

## Permissions (FYI)
The app requests the following scopes:
- `read:jira-work`
- `write:confluence-content`
- `read:confluence-content.summary`
- `read:space:confluence`
- `write:page:confluence`

External API access:
- `api.openai.com`

---

## Common issues
### Missing JIRA_SITE_URL environment variable
If you see an error about JIRA_SITE_URL being required:
```bash
forge variables set JIRA_SITE_URL "https://your-site.atlassian.net" --environment development
```
Replace `your-site` with your actual Atlassian site subdomain.

### Missing or invalid OpenAI API key
If you see errors related to OpenAI:
```bash
forge variables set OPENAI_API_KEY "YOUR_OPENAI_API_KEY" --environment development
```
**Note**: OpenAI API keys must start with `sk-`. The app validates this format and will error if the key is invalid.

### No tickets found in release notes
Ensure your Jira tickets have the custom field **"Release Notes Required"** set to **"Yes"**. The app only includes tickets explicitly marked for release notes, regardless of their status (To Do, In Progress, Done, etc.).

### Permission or 401/403 errors
If scopes were updated in `manifest.yml`:
1. Redeploy the app
2. Reinstall the app so permissions are re-approved

### Confluence draft creation issues
- Ensure Confluence was selected during installation
- Verify you have access to the target space and parent page

---

## Useful commands
View logs:
```bash
forge logs --environment development
```

Reinstall or upgrade the app:
```bash
forge install --environment development
```

Deploy to production (optional):
```bash
forge deploy --environment production
forge install --environment production
```

---

## Notes
- This app is intended for **internal/private use**
- OpenAI usage and costs are owned by the installer
- Do not commit API keys to the repository

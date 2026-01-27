# Private Marketplace Distribution Guide

This document explains how to distribute the Release Notes Generator app as a private marketplace listing.

---

## For the App Owner (You)

### Prerequisites
- Atlassian Developer account (free)
- App registered and tested in development
- App deployed to production environment

### Step 1: Deploy to Production

```bash
# Deploy the latest version to production
forge deploy --environment production

# Verify deployment
forge install --site <your-test-site> --environment production --upgrade
```

### Step 2: Access Atlassian Developer Console

1. Go to: https://developer.atlassian.com/console/myapps/
2. Click on your app: "release-notes-generator"
3. Navigate to the **Distribution** tab

### Step 3: Configure Private Distribution

1. In the Distribution tab, click **"Distribute via Marketplace"**
2. Fill in the required marketplace information:

#### App Details
- **App Name**: AI-powered Release Notes Generator
- **App Key**: `release-notes-generator` (auto-generated)
- **Summary** (one sentence):
  ```
  Automatically generate AI-powered release notes from Jira sprints and create Confluence draft pages.
  ```
- **Description** (detailed):
  ```
  The AI-powered Release Notes Generator streamlines your release documentation process by:

  • Fetching sprint tickets from Jira with smart filtering
  • Using OpenAI to classify tickets into New Features, Enhancements, and Bug Fixes
  • Generating user-friendly, non-technical summaries
  • Creating formatted Confluence draft pages with custom titles
  • Processing large sprints efficiently with batch processing

  Perfect for teams who want to automate release note creation while maintaining
  quality and consistency.
  ```

#### Categories
- Select: **Developer Tools**
- Secondary: **Project Management**

#### Support Information
- **Support URL**: Your GitHub repository issues page or internal support channel
- **Support Email**: Your team email
- **Privacy Policy URL**: (Required if collecting data)
- **Terms of Use URL**: (Optional)

#### Pricing
- Select: **Free**

### Step 4: Set Distribution to Private

1. In the **Distribution settings**, choose **"Private"**
2. Add email addresses of colleagues who can install:
   - colleague1@company.com
   - colleague2@company.com
   - etc.
3. Only these invited users will see the app in the marketplace

### Step 5: Submit for Review

1. Click **"Submit for review"**
2. Atlassian will review your app (usually 3-5 business days)
3. You'll receive email notifications about approval status

### Step 6: Managing Access

After approval, you can manage access:

1. Go to Developer Console → Your App → Distribution
2. Under "Private listing", add or remove email addresses
3. Invited users will receive an email with installation instructions

---

## For Colleagues (Installation Instructions)

Share these instructions with colleagues after your app is approved:

### Prerequisites
- Site admin access on your Atlassian instance
- OpenAI API key (starts with `sk-`)
- Jira site URL (e.g., `https://your-company.atlassian.net`)

### Step 1: Receive Invitation

You should receive an email invitation to install the app. If not:
1. Go to: https://marketplace.atlassian.com/
2. Log in with your Atlassian account
3. Search for "AI-powered Release Notes Generator"
4. The app will appear if you've been invited

### Step 2: Install the App

1. Click **"Try it free"** or **"Get it now"**
2. Select your Atlassian site
3. Choose products to install on:
   - ✅ Jira Software
   - ✅ Confluence
4. Review permissions and click **"Grant access"**
5. Wait for installation to complete

### Step 3: Configure OpenAI API Key

**IMPORTANT**: The app requires an OpenAI API key to function.

You have two options:

#### Option A: Contact App Owner
Ask the app owner to set the OpenAI API key for your site through the Forge console.

#### Option B: Request Forge CLI Access (Advanced)
If you have Forge CLI access with proper permissions:

```bash
# Set your OpenAI API key
forge variables set --app <app-id> OPENAI_API_KEY "sk-your-openai-key" --environment production
```

**Note**: You need the app owner to provide the `<app-id>`. The site URL is automatically detected from your Atlassian installation.

### Step 4: Add Custom Field to Jira

The app requires a custom field called **"Release Notes Required"**.

1. Go to Jira → **Settings** → **Issues** → **Custom fields**
2. Create a new custom field:
   - Type: **Select List (single choice)**
   - Name: **Release Notes Required**
   - Options: **Yes**, **No**
3. Associate with your project(s)
4. Add to appropriate issue screens

### Step 5: Start Using

1. Open any Jira project
2. Look for **"AI-powered Release Notes"** in the project sidebar
3. Fill in the form and generate your first release notes!

---

## Troubleshooting

### "App not found in marketplace"
- Ensure you're logged in with the email address that was invited
- Check your email for the invitation
- Contact the app owner to verify your email is in the approved list

### "Missing environment variable" errors
- Contact the app owner to set up `OPENAI_API_KEY`
- The site URL is automatically detected from your installation

### "Custom field not found"
- Create the "Release Notes Required" custom field as described above
- Ensure it's associated with your project

### Permission errors
- Ensure app was installed with both Jira and Confluence access
- Reinstall if needed: Manage apps → Release Notes Generator → Uninstall → Reinstall

---

## Updating the App

### For App Owner

When you push updates:

```bash
# Deploy new version
forge deploy --environment production

# Users will automatically get the update
# No reinstallation required
```

### For Users

Updates are automatic! When the app owner deploys a new version:
- Changes apply automatically within minutes
- No action needed from users
- Check release notes for new features

---

## Cost Information

### For Each User
- **Forge Platform**: Free for development, production costs depend on usage
- **OpenAI API**: ~$0.10-0.30 per 50-ticket sprint (gpt-4.1-mini)
- **Atlassian Licensing**: No additional cost

### OpenAI API Key
Each site needs their own OpenAI API key. Options:
1. **Company shared key**: One key for all users (owner manages costs)
2. **Individual keys**: Each user provides their own key (distributed costs)

---

## Support

For issues, feature requests, or questions:
- GitHub Issues: [Your repo URL]
- Email: [Your support email]
- Documentation: [Link to README.md]

---

## Security & Privacy

- **Data Storage**: All data stays within Atlassian and OpenAI infrastructure
- **API Keys**: Stored securely in Forge environment variables
- **Permissions**: App requests minimal required scopes
- **Privacy**: No data collected by the app owner

---

## Maintenance

### Regular Tasks
- Monitor OpenAI API usage and costs
- Check for Forge platform updates
- Review and update environment variables as needed
- Keep OpenAI model configuration optimal

### Emergency Support
If the app is down or not working:
1. Check Forge logs: `forge logs --environment production`
2. Verify environment variables are set correctly
3. Check OpenAI API status
4. Contact app owner for assistance

# Release Notes Generator (Forge)

A private Atlassian Forge app that generates sprint-based release notes from Jira issues and creates a Confluence draft page. It uses OpenAI to classify and rewrite release notes.

---

## What this app provides
- **Jira Project Page**: "AI-powered Release Notes" - accessible from any Jira project
- **Custom Page Titles**: Users can specify custom titles for their Confluence draft pages
- **Smart Filtering**: Fetches only tickets marked with **"Release Notes Required" = Yes** (all statuses included)
- **AI Classification**: Uses OpenAI (gpt-4.1-mini) to classify tickets into categories:
  - New Features
  - Enhancements
  - Bug Fixes
- **AI Summarization**: Generates user-friendly, non-technical release note summaries
- **Confluence Integration**: Creates draft pages with formatted release notes in ADF (Atlassian Document Format)
- **Batch Processing**: Handles large sprints by processing tickets in batches of 12

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

After installation, open any **Jira project** and locate **AI-powered Release Notes** in the project navigation.

---

## How to use

1. Open any Jira project
2. Navigate to **AI-powered Release Notes** in the project sidebar
3. Fill in the required fields:
   - **Page Title**: Custom title for your Confluence draft (e.g., "Release Notes - Sprint 36 - January 2026")
   - **Sprint ID**: The numeric sprint ID (found in sprint URLs or metadata)
   - **Space Key**: Your Confluence space key (e.g., "RN" from `/wiki/spaces/RN`)
   - **Parent Page ID** (optional): Confluence page ID to nest the draft under
4. Click **Generate Release Notes**
5. The app will:
   - Fetch all tickets from the sprint marked with "Release Notes Required = Yes"
   - Use OpenAI to classify each ticket (new feature, enhancement, or bug)
   - Generate user-friendly summaries for each ticket
   - Create a Confluence draft page with formatted release notes
6. Click the generated Confluence URL to review and edit the draft

**Note**: All generated pages are drafts. Review and publish manually when ready.

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

## Architecture

### Project Structure
```
src/
├── frontend/
│   └── index.jsx           # React UI for the Jira project page
├── resolvers/
│   └── index.js            # Main resolver orchestrating the workflow
├── services/
│   ├── jira.service.js     # Jira API integration (fetch sprint tickets)
│   ├── openai.service.js   # OpenAI integration (classification & summarization)
│   └── confluence.service.js # Confluence API integration (create draft pages)
├── builders/
│   └── adf.builder.js      # ADF (Atlassian Document Format) builders
└── utils/
    ├── text.utils.js       # Text processing utilities (ADF extraction, chunking)
    └── json.utils.js       # JSON parsing utilities (safe parsing from AI responses)
```

### Workflow

1. **Frontend** ([index.jsx](src/frontend/index.jsx))
   - Modern card-based UI with Forge React components
   - Form validation for required fields
   - Invokes backend resolver with user inputs

2. **Resolver** ([index.js](src/resolvers/index.js))
   - Validates inputs (page title, sprint ID)
   - Orchestrates the three-step workflow:
     1. Fetch tickets from Jira
     2. Classify and enhance with OpenAI
     3. Create Confluence draft page

3. **Jira Service** ([jira.service.js](src/services/jira.service.js))
   - Fetches tickets from sprint using JQL: `Sprint = {sprintId} AND "Release Notes Required" = Yes`
   - Extracts plain text from ADF descriptions
   - Constructs Jira URLs for each ticket

4. **OpenAI Service** ([openai.service.js](src/services/openai.service.js))
   - Processes tickets in batches of 12 to stay within API limits
   - Uses gpt-4.1-mini with temperature 0.2 for consistent results
   - Classifies tickets into: `new_feature`, `enhancement`, `bug`
   - Generates user-friendly release summaries (1 sentence, non-technical)
   - Returns grouped tickets by category

5. **Confluence Service** ([confluence.service.js](src/services/confluence.service.js))
   - Looks up Confluence space ID from space key
   - Builds ADF document with release notes sections
   - Creates draft page using Confluence V2 API
   - Returns resumedraft.action URL for editing

6. **ADF Builder** ([adf.builder.js](src/builders/adf.builder.js))
   - Constructs Atlassian Document Format nodes
   - Creates structured release notes with:
     - Heading: "Release Notes (Sprint {id})"
     - Three sections: New features, Enhancements, Fixes
     - Bullet lists with linked Jira tickets
     - User-friendly summaries from OpenAI

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JIRA_SITE_URL` | Yes | - | Your Atlassian instance URL (e.g., `https://your-site.atlassian.net`) |
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4.1-mini` | OpenAI model to use for classification |

### OpenAI Configuration

- **Model**: gpt-4.1-mini (cost-effective, fast responses)
- **Temperature**: 0.2 (consistent, focused outputs)
- **Batch Size**: 12 tickets per API call
- **Prompt Strategy**: Strict JSON output with clear category definitions
- **Validation**: Checks API key format and validates response structure

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
- Draft pages use `resumedraft.action` URLs - these are editable draft links
- If you see "page not found", verify the space key and parent page ID are correct

### OpenAI model customization
You can optionally override the default OpenAI model:
```bash
forge variables set OPENAI_MODEL "gpt-4o" --environment development
```
Default is `gpt-4.1-mini` which provides good results at lower cost.

---

## Features & Implementation Details

### Custom Page Titles (RNG-7)
- Users can specify custom titles for Confluence draft pages
- Title is required and validated on both frontend and backend
- Replaces previous auto-generated format: `Release Notes - Sprint {id} - {date}`

### Smart Ticket Filtering
- Only includes tickets with custom field "Release Notes Required" = "Yes"
- Includes tickets from ALL statuses (To Do, In Progress, Done, etc.)
- Uses JQL for efficient server-side filtering

### AI-Powered Classification
- **New Features**: Wholly new user-visible capabilities
- **Enhancements**: Improvements to existing features (UX, performance, stability)
- **Bug Fixes**: Corrections to incorrect behavior
- Confidence scoring for transparency
- One-sentence summaries focused on user impact, not implementation

### Batch Processing
- Handles large sprints by processing in chunks of 12 tickets
- Prevents API timeout and token limit issues
- Enriches AI output with Jira URLs for proper linking

### ADF Generation
- Programmatically builds Atlassian Document Format
- Creates hierarchical document structure (headings, paragraphs, lists)
- Includes hyperlinks to Jira tickets
- Handles empty sections gracefully

### URL Generation
- Uses `resumedraft.action` format for draft pages
- Enables editing of Forge app-created drafts
- Constructs URLs from Confluence API `_links.webui` field

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

## Development

### Running locally
```bash
# Watch for changes and rebuild
npm run dev

# Deploy changes
forge deploy --environment development

# View logs in real-time
forge logs --environment development
```

### Testing

To test the app:
1. Create a Jira sprint with sample tickets
2. Add custom field "Release Notes Required" to tickets and set to "Yes"
3. Open the Release Notes Generator in Jira
4. Fill in test values and generate
5. Verify draft page is created in Confluence

### Code Quality

Run linter:
```bash
forge lint
```

Fix common issues before deploying.

---

## Security & Best Practices

- **API Keys**: Never commit API keys to the repository
- **Environment Variables**: Use Forge variables for sensitive data
- **API Key Validation**: App validates OpenAI key format before use
- **Error Handling**: Comprehensive error messages for debugging
- **Permission Scopes**: Minimal required permissions requested
- **Draft Pages**: All pages created as drafts for manual review before publishing

---

## Cost Considerations

### OpenAI API Usage
- Model: gpt-4.1-mini (cost-effective)
- Typical cost: ~$0.10-0.30 per 50-ticket sprint
- Batch processing reduces API calls
- Consider monitoring usage if processing many large sprints

### Forge Platform
- Development environment: Free
- Production deployments may incur costs based on usage
- See [Forge Pricing](https://www.atlassian.com/licensing/forge#pricing-1) for details

---

## Contributing

This is a private/internal app. For bug reports or feature requests:
1. Create an issue in the repository
2. Include relevant logs from `forge logs`
3. Describe steps to reproduce

---

## Notes
- This app is intended for **internal/private use**
- OpenAI usage and costs are owned by the installer
- Do not commit API keys to the repository
- All pages are created as **drafts** - review before publishing
- The app uses **gpt-4.1-mini** for cost efficiency
- Batch size of 12 tickets balances speed and token limits

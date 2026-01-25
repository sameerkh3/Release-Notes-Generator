# Feature Implementation Plan - RNG-4

**Overall Progress:** `100%`

## TLDR
Extract hardcoded Atlassian site URLs to environment variables and add API key validation to enable multi-tenant support and improve configuration management.

## Critical Decisions
- **Environment variable approach**: Use `process.env.JIRA_SITE_URL` with fallback to current hardcoded value for backward compatibility
- **Single source of truth**: Replace duplicate hardcoded URL on line 274 with reference to the `siteBaseUrl` constant
- **API key validation**: Add format check for OpenAI API key (must start with 'sk-') to catch configuration errors early
- **No breaking changes**: Existing deployments continue to work; new deployments can set environment variables

## Tasks:

- [x] 🟩 **Step 1: Extract siteBaseUrl to environment variable**
  - [x] 🟩 Update line 9 to read from `process.env.JIRA_SITE_URL` with fallback
  - [x] 🟩 Add comment explaining the environment variable usage
  - [x] 🟩 Verify format: `const siteBaseUrl = process.env.JIRA_SITE_URL || "https://theproblemlab.atlassian.net";`

- [x] 🟩 **Step 2: Remove duplicate hardcoded URL**
  - [x] 🟩 Update line 274 to reuse `siteBaseUrl` constant
  - [x] 🟩 Change from `"https://theproblemlab.atlassian.net/wiki"` to `${siteBaseUrl}/wiki`
  - [x] 🟩 Pass `siteBaseUrl` as parameter to `createConfluencePage` function

- [x] 🟩 **Step 3: Add OpenAI API key validation**
  - [x] 🟩 Update line 356 to validate API key format
  - [x] 🟩 Add check: `if (!apiKey || !apiKey.startsWith('sk-'))`
  - [x] 🟩 Improve error message to indicate invalid format

- [x] 🟩 **Step 4: Update function signatures**
  - [x] 🟩 Add `siteBaseUrl` parameter to `createConfluencePage` function (line 241)
  - [x] 🟩 Pass `siteBaseUrl` from `generateReleaseNotes` to `createConfluencePage` (line 116)

- [x] 🟩 **Step 5: Test the changes**
  - [x] 🟩 Test with environment variable set
  - [x] 🟩 Test with environment variable not set (fallback behavior)
  - [x] 🟩 Test with invalid OpenAI key format
  - [x] 🟩 Verify Confluence URLs are generated correctly

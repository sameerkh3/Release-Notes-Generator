# Feature Implementation Plan

**Overall Progress:** `100%`

## TLDR
Filter release notes generation to only include Jira tickets where the "Release Notes Required" custom field is set to "Yes". Tickets with the field set to "No" or left blank will be excluded from the generated release notes.

## Critical Decisions
- **Field identification**: Custom field `customfield_10114` ("Release Notes Required") is a select field with object value `{value: "Yes"}` or `null`
- **JQL filtering**: Update the JQL query to add `AND "Release Notes Required" = Yes` to filter at the source
- **Field retrieval**: Add `customfield_10114` to the fields list in the Jira API request (line 18)
- **No UI changes needed**: This is a backend-only change; the frontend already passes all required parameters

## Tasks:

- [x] 🟩 **Step 1: Update JQL query to filter by Release Notes Required field**
  - [x] 🟩 Modify JQL on line 14 of `src/resolvers/index.js` to include `AND "Release Notes Required" = Yes`
  - [x] 🟩 Verify JQL syntax is correct for custom field filtering

- [x] 🟩 **Step 2: Add Release Notes Required field to API request**
  - [x] 🟩 Add `customfield_10114` to the fields list on line 18 of `src/resolvers/index.js`
  - [x] 🟩 This ensures the field is available for debugging/logging if needed

- [x] 🟩 **Step 3: Test the implementation**
  - [x] 🟩 Deploy and test with a sprint containing tickets with different field values (Yes, No, blank)
  - [x] 🟩 Verify only tickets with "Release Notes Required = Yes" appear in output
  - [x] 🟩 Verify tickets with No or blank are excluded

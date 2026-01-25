# Feature Implementation Plan - RNG-3

**Overall Progress:** `67%`

## TLDR
Remove the "statusCategory = Done" filter from the JQL query so that release notes include tickets from ANY status (To Do, In Progress, Done, etc.) as long as they have "Release Notes Required = Yes".

## Critical Decisions
- **Remove status filter entirely**: The JQL will only filter by Sprint ID and "Release Notes Required = Yes"
- **Include all workflow statuses**: Tickets in any status (To Do, In Progress, Done, Review, etc.) will be included if marked for release notes
- **Single line change**: Only requires updating the JQL string on line 17 of `src/resolvers/index.js`
- **Update comment**: Modify the comment on line 15 to reflect that status is no longer a filter criterion

## Tasks:

- [x] 🟩 **Step 1: Remove statusCategory = Done from JQL query**
  - [x] 🟩 Update JQL on line 17 to remove `AND statusCategory = Done`
  - [x] 🟩 Update comment on line 15 to remove mention of "status" filter
  - [x] 🟩 Verify new JQL: `Sprint = ${sprintId} AND "Release Notes Required" = Yes ORDER BY key ASC`

- [ ] 🟥 **Step 2: Test the updated filter**
  - [ ] 🟥 Test JQL against Jira API with tickets in different statuses
  - [ ] 🟥 Verify tickets with "Release Notes Required = Yes" are included regardless of status
  - [ ] 🟥 Verify tickets without "Release Notes Required = Yes" are still excluded

- [ ] 🟥 **Step 3: Update plan tracking**
  - [ ] 🟥 Mark all steps complete with 🟩
  - [ ] 🟥 Update overall progress to 100%

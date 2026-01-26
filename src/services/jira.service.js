/**
 * Jira API service for fetching sprint tickets and issue data.
 * @module services/jira
 */

import api, { route } from "@forge/api";
import { extractPlainText } from "../utils/text.utils.js";

/**
 * Fetches tickets from a Jira sprint that are marked for release notes.
 * Only includes tickets where "Release Notes Required" custom field is set to "Yes".
 * Includes tickets from ANY status (To Do, In Progress, Done, etc.).
 *
 * @param {number} sprintId - The Jira sprint ID
 * @returns {Promise<Array<Object>>} Array of ticket objects with release note data
 * @throws {Error} If sprint ID is invalid or Jira API request fails
 *
 * @example
 * const tickets = await fetchSprintTickets(36);
 * // Returns: [
 * //   {
 * //     key: 'RNG-1',
 * //     summary: 'Add login feature',
 * //     descriptionPlain: 'Users should be able to...',
 * //     components: ['Frontend'],
 * //     issueType: 'Story',
 * //     jiraUrl: 'https://site.atlassian.net/browse/RNG-1'
 * //   }
 * // ]
 */
export async function fetchSprintTickets(sprintId) {
  // Validate sprint ID
  if (!sprintId || Number.isNaN(sprintId)) {
    throw new Error("Invalid Sprint ID. Please enter a number.");
  }

  // Site base URL - configurable via JIRA_SITE_URL environment variable
  // Defaults to theproblemlab instance for backward compatibility
  const siteBaseUrl = process.env.JIRA_SITE_URL || "https://theproblemlab.atlassian.net";

  // JQL query to filter by sprint and "Release Notes Required" custom field
  // Only include tickets where Release Notes Required = Yes (excludes No and blank/null values)
  // Tickets from ANY status (To Do, In Progress, Done, etc.) are included
  const jql = `Sprint = ${sprintId} AND "Release Notes Required" = Yes ORDER BY key ASC`;

  // Fetch tickets using Jira REST API v3
  // Include customfield_10114 (Release Notes Required) for visibility/debugging
  const res = await api.asApp().requestJira(
    route`/rest/api/3/search/jql?jql=${jql}&fields=summary,description,components,issuetype,customfield_10114`
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jira search failed (${res.status}): ${text}`);
  }

  const data = await res.json();

  // Transform Jira issues into simplified ticket objects
  const tickets = (data.issues || []).map((issue) => {
    const key = issue.key;
    return {
      key,
      summary: issue.fields?.summary || "",
      // Extract plain text from ADF description and limit to 1500 chars for AI processing
      descriptionPlain: extractPlainText(issue.fields?.description).slice(0, 1500),
      components: (issue.fields?.components || []).map((c) => c.name),
      issueType: issue.fields?.issuetype?.name || "",
      jiraUrl: `${siteBaseUrl}/browse/${key}`,
    };
  });

  return tickets;
}

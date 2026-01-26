/**
 * Confluence API service for creating and managing release note pages.
 * Uses Confluence V2 REST API.
 * @module services/confluence
 */

import api, { route } from "@forge/api";
import { buildReleaseNotesAdf } from "../builders/adf.builder.js";

/**
 * Retrieves the space ID for a given Confluence space key.
 * Required for creating pages using Confluence V2 API.
 *
 * @param {string} spaceKey - The Confluence space key (e.g., 'RN')
 * @returns {Promise<string>} The numeric space ID
 * @throws {Error} If space is not found or API request fails
 * @private
 */
async function getConfluenceSpaceId(spaceKey) {
  // Confluence v2 spaces endpoint
  const res = await api.asApp().requestConfluence(
    route`/wiki/api/v2/spaces?keys=${spaceKey}&limit=1`,
    { headers: { Accept: "application/json" } }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Confluence space lookup failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const space = data?.results?.[0];

  if (!space?.id) {
    throw new Error(`Could not find Confluence spaceId for key: ${spaceKey}`);
  }

  return String(space.id);
}

/**
 * Creates a Confluence page with ADF content.
 * Uses Confluence V2 API to create draft pages.
 *
 * @param {Object} options - Page creation options
 * @param {string} options.spaceKey - Confluence space key
 * @param {number|null} options.parentPageId - Optional parent page ID
 * @param {string} options.title - Page title
 * @param {Object} options.adfBody - ADF document content
 * @param {string} options.siteBaseUrl - Base URL for the Atlassian site
 * @returns {Promise<Object>} Created page details
 * @returns {string} return.pageId - The created page ID
 * @returns {string|null} return.pageUrl - URL to view the page
 * @returns {string} return.spaceId - The space ID where page was created
 * @throws {Error} If page creation fails
 * @private
 */
async function createConfluencePage({ spaceKey, parentPageId, title, adfBody, siteBaseUrl }) {
  const spaceId = await getConfluenceSpaceId(spaceKey);

  const body = {
    spaceId,
    status: "draft",
    title,
    body: {
      representation: "atlas_doc_format",
      value: JSON.stringify(adfBody),
    },
  };

  if (parentPageId) {
    body.parentId = String(parentPageId);
  }

  // Confluence V2 endpoint for page creation
  const res = await api.asApp().requestConfluence(route`/wiki/api/v2/pages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Confluence create failed (${res.status}): ${text}`);
  }

  const created = await res.json();
  const pageId = created?.id || null;

  // Build URL for draft page using the base URL from Confluence API response
  // This ensures we always have the correct protocol (https://) and domain
  const base = created?._links?.base || `${siteBaseUrl}/wiki`;

  // For draft pages, use the webui link which provides the resumedraft.action URL
  // This URL format allows editing draft pages created by Forge apps
  const webuiLink = created?._links?.webui;
  const pageUrl = webuiLink ? `${base}${webuiLink}` : null;

  return { pageId, pageUrl, spaceId };
}

/**
 * Creates a release notes Confluence page from grouped ticket data.
 * Combines ADF generation and Confluence page creation into a single operation.
 *
 * @param {Object} options - Release notes creation options
 * @param {number} options.sprintId - The sprint identifier
 * @param {Object} options.grouped - Grouped tickets (new_features, enhancements, bugs)
 * @param {string} options.spaceKey - Confluence space key where page will be created
 * @param {number|null} options.parentPageId - Optional parent page ID
 * @param {string} options.pageTitle - Custom page title provided by user
 * @returns {Promise<Object>} Confluence page details
 * @returns {boolean} return.created - Whether page was created
 * @returns {string} return.spaceKey - The space key
 * @returns {string} return.spaceId - The space ID
 * @returns {number|null} return.parentPageId - Parent page ID if provided
 * @returns {string} return.pageId - Created page ID
 * @returns {string} return.pageUrl - URL to view the page
 * @returns {string} return.title - Page title
 * @throws {Error} If page creation fails
 *
 * @example
 * const result = await createReleaseNotesPage({
 *   sprintId: 36,
 *   grouped: { new_features: [...], enhancements: [...], bugs: [...] },
 *   spaceKey: 'RN',
 *   parentPageId: 123456,
 *   pageTitle: 'Release Notes - Sprint 36 - January 2026'
 * });
 */
export async function createReleaseNotesPage({ sprintId, grouped, spaceKey, parentPageId, pageTitle }) {
  // Site base URL - REQUIRED environment variable for Jira instance URL
  const siteBaseUrl = process.env.JIRA_SITE_URL;

  // Validate required environment variable
  if (!siteBaseUrl) {
    throw new Error(
      'JIRA_SITE_URL environment variable is required. ' +
      'Please set it using: forge variables set JIRA_SITE_URL "https://your-site.atlassian.net" --environment development'
    );
  }

  // Use custom page title provided by user
  const title = pageTitle;

  // Build ADF document content
  const adfBody = buildReleaseNotesAdf({
    sprintId,
    grouped,
    fixesLabel: "Fixes", // Can be changed to "Bugs" if preferred
  });

  // Create the Confluence page
  const { pageId, pageUrl, spaceId } = await createConfluencePage({
    spaceKey,
    parentPageId,
    title,
    adfBody,
    siteBaseUrl,
  });

  return {
    created: true,
    spaceKey,
    spaceId,
    parentPageId: parentPageId || null,
    pageId,
    pageUrl,
    title,
  };
}

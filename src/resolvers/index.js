/**
 * Main resolver for the Release Notes Generator Forge app.
 * Orchestrates the release notes generation workflow by coordinating
 * Jira, OpenAI, and Confluence services.
 * @module resolvers/index
 */

import Resolver from "@forge/resolver";
import { fetchSprintTickets } from "../services/jira.service.js";
import { classifyTickets } from "../services/openai.service.js";
import { createReleaseNotesPage } from "../services/confluence.service.js";

const resolver = new Resolver();

/**
 * Generates release notes for a sprint.
 *
 * Workflow:
 * 1. Fetch tickets from Jira sprint (filtered by "Release Notes Required" = Yes)
 * 2. If useAI is false, return raw ticket data
 * 3. If useAI is true, classify tickets using OpenAI and generate user-friendly summaries
 * 4. If spaceKey is provided, create a Confluence draft page with the release notes
 *
 * @param {Object} payload - Request payload
 * @param {number} payload.sprintId - Jira sprint ID
 * @param {boolean} payload.useAI - Whether to use AI for classification and summarization
 * @param {string} [payload.spaceKey] - Confluence space key (optional)
 * @param {number} [payload.parentPageId] - Confluence parent page ID (optional)
 * @returns {Promise<Object>} Release notes result with tickets and optional Confluence page info
 */
resolver.define("generateReleaseNotes", async ({ payload }) => {
  // Extract and validate user-provided page title for Confluence draft
  const pageTitle = (payload.pageTitle || "").trim();
  const sprintId = Number(payload.sprintId);
  const useAI = Boolean(payload?.useAI); // ✅ toggle AI mode

  // Validate required fields
  if (!pageTitle) {
    throw new Error("Page title is required. Please enter a custom title for the Confluence draft.");
  }

  if (!sprintId || Number.isNaN(sprintId)) {
    throw new Error("Invalid Sprint ID. Please enter a number.");
  }

  // Fetch tickets from Jira sprint
  // Filtered by sprint and "Release Notes Required" = Yes (handled in service layer)
  const tickets = await fetchSprintTickets(sprintId);

  // Non-AI mode: return raw ticket data
  if (!useAI) {
    return {
      ok: true,
      sprintId,
      count: tickets.length,
      tickets,
    };
  }

  // AI mode: classify and enhance tickets with OpenAI
  const grouped = await classifyTickets(tickets);

  // Extract Confluence parameters
  const spaceKey = (payload.spaceKey || "").trim();
  const parentPageId = payload.parentPageId ? Number(payload.parentPageId) : null;

  // If no Confluence space provided, return grouped data without creating a page
  if (!spaceKey) {
    return {
      ok: true,
      sprintId,
      total: tickets.length,
      grouped,
      confluence: { created: false, reason: "Missing spaceKey" },
    };
  }

  // Create Confluence page with release notes
  const confluence = await createReleaseNotesPage({
    sprintId,
    grouped,
    spaceKey,
    parentPageId,
  });

  return {
    ok: true,
    sprintId,
    total: tickets.length,
    grouped,
    confluence,
  };
});

export const handler = resolver.getDefinitions();

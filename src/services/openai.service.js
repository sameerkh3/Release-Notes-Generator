/**
 * OpenAI service for AI-powered ticket classification and summarization.
 * @module services/openai
 */

import { chunkArray } from "../utils/text.utils.js";
import { safeParseJson } from "../utils/json.utils.js";

/**
 * Maximum number of tickets to process in a single OpenAI API call.
 * Keeps requests under token limits and ensures reasonable response times.
 */
const OPENAI_BATCH_SIZE = 12;

/**
 * OpenAI model to use for classification.
 * Can be overridden via OPENAI_MODEL environment variable.
 */
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

/**
 * Temperature setting for OpenAI API (0.0 - 2.0).
 * Lower values (0.2) produce more consistent, focused outputs.
 */
const OPENAI_TEMPERATURE = 0.2;

/**
 * Classifies and enhances tickets using OpenAI.
 * Groups tickets into categories (new_feature, enhancement, bug) and generates
 * user-friendly release note summaries.
 *
 * @param {Array<Object>} tickets - Array of ticket objects from Jira
 * @returns {Promise<Object>} Grouped tickets by category with enhanced summaries
 * @throws {Error} If OpenAI API fails or returns invalid data
 *
 * @example
 * const tickets = [{ key: 'RNG-1', summary: '...', ... }];
 * const result = await classifyTickets(tickets);
 * // Returns: {
 * //   new_features: [...],
 * //   enhancements: [...],
 * //   bugs: [...]
 * // }
 */
export async function classifyTickets(tickets) {
  // Prepare input data for AI processing (only include relevant fields)
  const modelInput = tickets.map((t) => ({
    key: t.key,
    summary: t.summary,
    descriptionPlain: t.descriptionPlain,
    components: t.components,
    issueType: t.issueType,
  }));

  // Process tickets in batches to stay within API limits
  const chunks = chunkArray(modelInput, OPENAI_BATCH_SIZE);
  let items = [];

  for (const chunk of chunks) {
    const prompt = buildClassificationPrompt(chunk);
    const out = await callOpenAIJson(prompt);

    if (!out?.items?.length) {
      throw new Error("Model returned no items (empty items array).");
    }

    items = items.concat(out.items);
  }

  // Enrich AI output with Jira URLs for linking later
  const byKey = new Map(tickets.map((t) => [t.key, t]));
  const enriched = items.map((i) => ({
    ...i,
    jiraUrl: byKey.get(i.key)?.jiraUrl || "",
  }));

  // Group into release note sections
  const grouped = {
    new_features: enriched.filter((i) => i.category === "new_feature"),
    enhancements: enriched.filter((i) => i.category === "enhancement"),
    bugs: enriched.filter((i) => i.category === "bug"),
  };

  return grouped;
}

/**
 * Builds the classification prompt for OpenAI.
 * Provides clear instructions and schema for consistent JSON output.
 *
 * @param {Array<Object>} tickets - Tickets to classify
 * @returns {string} Formatted prompt for OpenAI
 * @private
 */
function buildClassificationPrompt(tickets) {
  return `
Return STRICT JSON only. No markdown. No extra text.

Classify each Jira ticket into a release note category and rewrite a user-friendly summary.

Rules:
- Allowed categories: "new_feature", "enhancement", "bug"
- "new_feature": new user-visible capability
- "enhancement": improvement to existing capability (UX/perf/stability users notice)
- "bug": fixes incorrect behavior
- release_summary: 1 sentence, user-friendly, impact > implementation, avoid internal jargon
- Use ONLY the input data.

Output schema:
{
  "items": [
    {
      "key": "TR-7",
      "category": "new_feature|enhancement|bug",
      "confidence": 0.0,
      "release_summary": "One sentence summary",
      "notes": ""
    }
  ]
}

Tickets:
${JSON.stringify(tickets, null, 2)}
`.trim();
}

/**
 * Calls OpenAI API with a prompt and returns parsed JSON response.
 * Uses the configured model and temperature settings.
 *
 * @param {string} prompt - The prompt to send to OpenAI
 * @returns {Promise<Object>} Parsed JSON response from OpenAI
 * @throws {Error} If API key is missing/invalid or API call fails
 * @private
 */
async function callOpenAIJson(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;

  // Validate API key exists and has correct format (OpenAI keys start with 'sk-')
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY Forge variable");
  }
  if (!apiKey.startsWith('sk-')) {
    throw new Error("Invalid OPENAI_API_KEY format. OpenAI API keys must start with 'sk-'");
  }

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: OPENAI_TEMPERATURE,
      messages: [
        { role: "system", content: "You output STRICT JSON only." },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(`OpenAI error: ${resp.status} ${JSON.stringify(data)}`);

  const text = data.choices?.[0]?.message?.content || "";
  return safeParseJson(text);
}

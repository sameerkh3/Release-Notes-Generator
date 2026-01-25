/**
 * JSON utility functions for parsing and handling JSON data.
 * @module utils/json
 */

/**
 * Safely extracts and parses JSON from text that may contain additional content.
 * Handles cases where AI models return JSON wrapped in markdown or other text.
 *
 * @param {string} text - The text containing JSON
 * @returns {Object} Parsed JSON object
 * @throws {Error} If no valid JSON object is found in the text
 *
 * @example
 * const text = 'Here is the result: {"key": "value"} end';
 * safeParseJson(text); // Returns { key: 'value' }
 */
export function safeParseJson(text) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("No JSON object found in model output");
  }
  return JSON.parse(text.slice(first, last + 1));
}

/**
 * Text utility functions for processing and transforming text content.
 * @module utils/text
 */

/**
 * Extracts plain text from Atlassian Document Format (ADF) content.
 * Recursively walks the ADF tree structure and concatenates all text nodes.
 *
 * @param {Object|string} adf - The ADF document or plain string
 * @returns {string} Plain text extracted from the ADF document
 *
 * @example
 * const adf = {
 *   type: 'doc',
 *   content: [
 *     { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }
 *   ]
 * };
 * extractPlainText(adf); // Returns 'Hello'
 */
export function extractPlainText(adf) {
  if (!adf) return "";
  if (typeof adf === "string") return adf;

  try {
    const out = [];
    const walk = (node) => {
      if (!node) return;
      if (Array.isArray(node)) return node.forEach(walk);
      if (node.type === "text" && node.text) out.push(node.text);
      if (node.content) walk(node.content);
    };
    walk(adf);
    return out.join(" ").replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

/**
 * Splits an array into chunks of a specified size.
 * Useful for batch processing when APIs have size limits.
 *
 * @param {Array} arr - The array to chunk
 * @param {number} size - The maximum size of each chunk
 * @returns {Array<Array>} Array of chunks
 *
 * @example
 * chunkArray([1, 2, 3, 4, 5], 2); // Returns [[1, 2], [3, 4], [5]]
 */
export function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

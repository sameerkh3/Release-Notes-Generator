/**
 * Atlassian Document Format (ADF) builder functions.
 * Provides utilities to construct ADF documents for Confluence pages.
 * @module builders/adf
 * @see https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/
 */

/**
 * Creates an ADF heading node.
 *
 * @param {string} text - The heading text
 * @param {number} level - Heading level (1-6), defaults to 2
 * @returns {Object} ADF heading node
 */
export function adfHeading(text, level = 2) {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  };
}

/**
 * Creates an ADF paragraph node with plain text.
 *
 * @param {string} text - The paragraph text
 * @returns {Object} ADF paragraph node
 */
export function adfParagraph(text) {
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
}

/**
 * Creates an ADF bullet list node.
 *
 * @param {Array<Array>} items - Array of inline content arrays (each item contains text/link nodes)
 * @returns {Object} ADF bullet list node
 *
 * @example
 * const items = [
 *   [{ type: 'text', text: 'Item 1' }],
 *   [{ type: 'text', text: 'Item 2' }]
 * ];
 * adfBulletList(items);
 */
export function adfBulletList(items) {
  return {
    type: "bulletList",
    content: items.map((itemInlineContent) => ({
      type: "listItem",
      content: [
        {
          type: "paragraph",
          content: itemInlineContent,
        },
      ],
    })),
  };
}

/**
 * Creates inline content with an optional hyperlink.
 * Returns an array of ADF inline nodes suitable for use in paragraphs or list items.
 *
 * @param {string} text - The text to display
 * @param {string} [href] - Optional URL to link to
 * @returns {Array<Object>} Array containing ADF text node with optional link mark
 */
export function adfInlineLink(text, href) {
  return [
    {
      type: "text",
      text,
      marks: href ? [{ type: "link", attrs: { href } }] : [],
    },
  ];
}

/**
 * Builds a complete ADF document for release notes.
 * Creates a structured document with sections for new features, enhancements, and bugs/fixes.
 *
 * @param {Object} options - Configuration options
 * @param {number} options.sprintId - The sprint identifier
 * @param {Object} options.grouped - Grouped release note items
 * @param {Array} options.grouped.new_features - Array of new feature items
 * @param {Array} options.grouped.enhancements - Array of enhancement items
 * @param {Array} options.grouped.bugs - Array of bug fix items
 * @param {string} [options.fixesLabel='Fixes'] - Label for the bugs section
 * @returns {Object} Complete ADF document ready for Confluence
 */
export function buildReleaseNotesAdf({ sprintId, grouped, fixesLabel = "Fixes" }) {
  const newFeatures = grouped?.new_features || [];
  const enhancements = grouped?.enhancements || [];
  const bugs = grouped?.bugs || [];

  // Helper to convert items to bullet list format
  const toBullets = (arr) =>
    arr.map((i) => {
      const key = i.key || "";
      const url = i.jiraUrl || "";
      const summary = i.release_summary || "";
      return [
        ...adfInlineLink(key, url),
        { type: "text", text: " - " },
        { type: "text", text: summary },
      ];
    });

  return {
    type: "doc",
    version: 1,
    content: [
      adfHeading(`Release Notes (Sprint ${sprintId})`, 2),
      adfParagraph("Draft generated automatically. Please review before sharing."),

      adfHeading("New features", 3),
      newFeatures.length ? adfBulletList(toBullets(newFeatures)) : adfParagraph("No new features included."),

      adfHeading("Enhancements", 3),
      enhancements.length ? adfBulletList(toBullets(enhancements)) : adfParagraph("No enhancements included."),

      adfHeading(fixesLabel, 3),
      bugs.length ? adfBulletList(toBullets(bugs)) : adfParagraph(`No ${fixesLabel.toLowerCase()} included.`),
    ],
  };
}

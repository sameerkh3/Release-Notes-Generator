import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";

const resolver = new Resolver();

resolver.define("generateReleaseNotes", async ({ payload }) => {
  const sprintId = Number(payload.sprintId);
  const useAI = Boolean(payload?.useAI); // ✅ toggle AI mode
  const siteBaseUrl = "https://theproblemlab.atlassian.net"; // change if needed

  if (!sprintId || Number.isNaN(sprintId)) {
    throw new Error("Invalid Sprint ID. Please enter a number.");
  }

  const jql = `Sprint = ${sprintId} AND statusCategory = Done ORDER BY key ASC`;

  // ✅ Use the new endpoint
  const res = await api.asApp().requestJira(
    route`/rest/api/3/search/jql?jql=${jql}&fields=summary,description,components,issuetype`
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jira search failed (${res.status}): ${text}`);
  }

  const data = await res.json();

  const tickets = (data.issues || []).map((issue) => {
    const key = issue.key;
    return {
      key,
      summary: issue.fields?.summary || "",
      descriptionPlain: extractPlainText(issue.fields?.description).slice(0, 1500),
      components: (issue.fields?.components || []).map((c) => c.name),
      issueType: issue.fields?.issuetype?.name || "",
      jiraUrl: `${siteBaseUrl}/browse/${key}`,
    };
  });

  // ✅ Step 1 behavior remains available (no AI)
  if (!useAI) {
    return {
      ok: true,
      sprintId,
      count: tickets.length,
      tickets,
    };
  }

  // ✅ Step 2: GenAI classification + user-friendly summaries (STRICT JSON)
  const modelInput = tickets.map((t) => ({
    key: t.key,
    summary: t.summary,
    descriptionPlain: t.descriptionPlain,
    components: t.components,
    issueType: t.issueType,
  }));

  const chunks = chunkArray(modelInput, 12);
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

  // ✅ STEP 3C: Create Confluence draft page (when spaceKey is provided)
  const spaceKey = (payload.spaceKey || "").trim();
  const parentPageId = payload.parentPageId ? Number(payload.parentPageId) : null;

  // If user didn't provide Confluence details, still return grouped JSON
  if (!spaceKey) {
    return {
      ok: true,
      sprintId,
      total: tickets.length,
      grouped,
      confluence: { created: false, reason: "Missing spaceKey" },
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const title = `Release Notes - Sprint ${sprintId} - ${today}`;

  const adfBody = buildReleaseNotesAdf({
    sprintId,
    grouped,
    fixesLabel: "Fixes", // change to "Bugs" if you prefer
  });

  const { pageId, pageUrl, spaceId } = await createConfluencePage({
    spaceKey,
    parentPageId,
    title,
    adfBody,
  });

  return {
    ok: true,
    sprintId,
    total: tickets.length,
    grouped,
    confluence: {
      created: true,
      spaceKey,
      spaceId,
      parentPageId: parentPageId || null,
      pageId,
      pageUrl,
      title,
    },
  };
});

// -------------------- STEP 3A: ADF builders --------------------
function adfHeading(text, level = 2) {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  };
}

function adfParagraph(text) {
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
}

function adfBulletList(items) {
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

function adfInlineLink(text, href) {
  return [
    {
      type: "text",
      text,
      marks: href ? [{ type: "link", attrs: { href } }] : [],
    },
  ];
}

function buildReleaseNotesAdf({ sprintId, grouped, fixesLabel = "Fixes" }) {
  const newFeatures = grouped?.new_features || [];
  const enhancements = grouped?.enhancements || [];
  const bugs = grouped?.bugs || [];

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

// -------------------- ✅ Confluence V2 helpers --------------------
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

// -------------------- ✅ STEP 3B: Confluence create page (V2) --------------------
async function createConfluencePage({ spaceKey, parentPageId, title, adfBody }) {
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

  // ✅ Confluence V2 endpoint
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

  // Build URL (v2 may return different link shapes depending on rollout)
  const base = "https://theproblemlab.atlassian.net/wiki";
  const webui =
    created?._links?.webui ||
    created?.links?.webui ||
    created?._links?.tinyui ||
    created?.links?.tinyui ||
    null;

  const pageUrl = webui ? `${base}${webui}` : pageId ? `${base}/pages/${pageId}` : null;

  return { pageId, pageUrl, spaceId };
}

// -------------------- Existing helpers --------------------
function extractPlainText(adf) {
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

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function safeParseJson(text) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("No JSON object found in model output");
  }
  return JSON.parse(text.slice(first, last + 1));
}

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

async function callOpenAIJson(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY Forge variable");

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.2,
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

export const handler = resolver.getDefinitions();

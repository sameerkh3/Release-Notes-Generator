import React, { useMemo, useState } from "react";
import { invoke } from "@forge/bridge";
import ForgeReconciler, { Text, Textfield, Button, Stack, Box, Heading, xcss, Link, Spinner } from "@forge/react";

// Elevated card styling with semi-transparent appearance
const cardStyles = xcss({
  backgroundColor: 'color.background.neutral.subtle',
  borderColor: 'color.border',
  borderWidth: 'border.width',
  borderStyle: 'solid',
  borderRadius: 'border.radius.200',
  padding: 'space.500',
  boxShadow: 'elevation.shadow.raised',
  maxWidth: '700px',
});

// Dark background container
const backgroundStyles = xcss({
  backgroundColor: 'color.background.inverse',
  padding: 'space.600',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  paddingTop: 'space.800',
});

const App = () => {
  // Form state: pageTitle is required for custom Confluence page titles
  const [pageTitle, setPageTitle] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [spaceKey, setSpaceKey] = useState("");
  const [parentPageId, setParentPageId] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  const isGenerating = status === "Generating…";

  // Form validation: ensure all required fields are valid before allowing submission
  const canSubmit = useMemo(() => {
    // Page title is required and must be non-empty
    if (!pageTitle.trim()) return false;

    // Sprint ID must be a positive integer
    const s = Number(sprintId);
    if (!sprintId || Number.isNaN(s) || s <= 0) return false;

    // Space key is required and must be non-empty
    if (!spaceKey.trim()) return false;

    // Parent page ID is optional, but if provided must be a valid number
    if (parentPageId.trim() && Number.isNaN(Number(parentPageId))) return false;

    return true;
  }, [pageTitle, sprintId, spaceKey, parentPageId]);

  const onGenerate = async () => {
    setStatus("Generating…");
    setResult(null);

    try {
      // Invoke backend resolver with user-provided page title
      const res = await invoke("generateReleaseNotes", {
        pageTitle: pageTitle.trim(),
        sprintId: Number(sprintId),
        spaceKey: spaceKey.trim(),
        parentPageId: parentPageId.trim() ? Number(parentPageId) : null,
        useAI: true,
      });

      setResult(res);

      if (res?.confluence?.created && res?.confluence?.pageUrl) {
        setStatus("Done ✅ Confluence draft created.");
      } else {
        setStatus("Done ✅ Generated release notes (no Confluence page created).");
      }
    } catch (e) {
      setStatus(`Error: ${e?.message || String(e)}`);
    }
  };

  const confluenceUrl = result?.confluence?.pageUrl || "";
  const grouped = result?.grouped || {};
  const newFeatures = grouped?.new_features || [];
  const enhancements = grouped?.enhancements || [];
  const bugs = grouped?.bugs || [];

  const renderItems = (items) => {
    if (!items.length) return <Text>• None</Text>;
    return items.map((i) => (
      <Text key={i.key}>
        • {i.key}: {i.release_summary}
        {"  "}
        ({i.jiraUrl})
      </Text>
    ));
  };

  return (
    <Box xcss={backgroundStyles}>
      <Box xcss={cardStyles}>
        <Stack space="space.400">
          {/* Header Section */}
          <Stack space="space.200">
            <Heading as="h1" size="large">AI-powered Release Notes from your Jira sprints</Heading>
          </Stack>

          {/* Form Fields */}
          <Stack space="space.300">
            {/* Page Title - Required field for custom Confluence page title */}
            <Stack space="space.100">
              <Text weight="bold">Release Notes Title</Text>
              <Text>Enter a title for your Confluence release notes page.</Text>
              <Textfield
                name="pageTitle"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="e.g. Release Notes - Sprint 36 - January 2026"
              />
            </Stack>

            {/* Sprint ID */}
            <Stack space="space.100">
              <Text weight="bold">Sprint ID</Text>
              <Text>Enter Sprint ID from sprint URL or sprint metadata.</Text>
              <Textfield
                name="sprintId"
                value={sprintId}
                onChange={(e) => setSprintId(e.target.value)}
                placeholder="e.g. 36"
              />
            </Stack>

            {/* Space Key */}
            <Stack space="space.100">
              <Text weight="bold">Confluence Space Key</Text>
              <Text>Enter Confluence Space Key from the URL like /wiki/spaces/RN → Space Key is RN.</Text>
              <Textfield
                name="spaceKey"
                value={spaceKey}
                onChange={(e) => setSpaceKey(e.target.value)}
                placeholder="e.g. RN"
              />
            </Stack>

            {/* Parent Page ID */}
            <Stack space="space.100">
              <Text weight="bold">Confluence Parent Page ID (Optional)</Text>
              <Text>Enter Parent Page ID from the URL like /pages/123456. Leave empty to create at space root.</Text>
              <Textfield
                name="parentPageId"
                value={parentPageId}
                onChange={(e) => setParentPageId(e.target.value)}
                placeholder="e.g. 123456"
              />
            </Stack>
          </Stack>

          {/* Button */}
          <Button
            appearance="primary"
            onClick={onGenerate}
            isDisabled={!canSubmit || isGenerating}
            shouldFitContainer={true}
          >
            {isGenerating ? "Generating..." : "Generate Release Notes"}
          </Button>

          {/* Status Messages */}
          {isGenerating ? (
            <Stack space="space.100" alignInline="center">
              <Spinner />
            </Stack>
          ) : status && !isGenerating ? (
            <Box
              xcss={xcss({
                padding: 'space.200',
                backgroundColor: status.startsWith('Error')
                  ? 'color.background.danger'
                  : status.includes('Done')
                  ? 'color.background.success'
                  : 'color.background.information',
                borderRadius: 'border.radius.100',
              })}
            >
              <Text>{status}</Text>
            </Box>
          ) : null}

          {/* Confluence Link */}
          {confluenceUrl ? (
            <Link href={confluenceUrl} openNewTab={true}>
              {confluenceUrl}
            </Link>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );  
};

ForgeReconciler.render(<App />);

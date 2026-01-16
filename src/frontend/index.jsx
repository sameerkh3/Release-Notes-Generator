import React, { useMemo, useState } from "react";
import { invoke } from "@forge/bridge";
import ForgeReconciler, { Text, Textfield, Button, Stack } from "@forge/react";

const App = () => {
  const [sprintId, setSprintId] = useState("");
  const [spaceKey, setSpaceKey] = useState("");
  const [parentPageId, setParentPageId] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  const isGenerating = status === "Generating…";

  const canSubmit = useMemo(() => {
    const s = Number(sprintId);
    if (!sprintId || Number.isNaN(s) || s <= 0) return false;
    if (!spaceKey.trim()) return false;
    if (parentPageId.trim() && Number.isNaN(Number(parentPageId))) return false;
    return true;
  }, [sprintId, spaceKey, parentPageId]);

  const onGenerate = async () => {
    setStatus("Generating…");
    setResult(null);

    try {
      const res = await invoke("generateReleaseNotes", {
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
    <Stack space="space.400" alignInline="start">
      <Stack space="space.200" style={{ maxWidth: 600, width: "100%" }}>

  
        {/* Sprint ID */}
        <Stack space="space.100">
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
          <Text>Enter Parent Page ID (optional) from the URL like /pages/123456. Leave empty to create at space root.</Text>
          <Textfield
            name="parentPageId"
            value={parentPageId}
            onChange={(e) => setParentPageId(e.target.value)}
            placeholder="e.g. 123456"
          />
        </Stack>
  
        {/* Button */}
        <Stack space="space.100" alignInline="start">
          <Button
            appearance="primary"
            onClick={onGenerate}
            isDisabled={!canSubmit}
            shouldFitContainer={false}
          >
            Generate Release Notes
          </Button>
        </Stack>
  
        {status ? <Text>{status}</Text> : null}
  
        {confluenceUrl ? (
          <Stack space="space.100">
            <Text>Confluence draft link:</Text>
            <Text>{confluenceUrl}</Text>
          </Stack>
        ) : null}
      </Stack>
    </Stack>
  );  
};

ForgeReconciler.render(<App />);

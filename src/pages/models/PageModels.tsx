import { MainLayout } from "../../layout/MainLayout";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { SelectFileButton } from "../../common/input/SelectFileButton";
import { usePageTitle } from "../../common/utils/usePageTitle";
import { useTranslation } from "react-i18next";
import { delay } from "../../common/utils/delay";
import { parsePckFile } from "../../domain/pck/PckParser";
import { PckFile } from "../../domain/pck/PckFile";
import {
  ParsedModelFiles,
  mergeModelPckEntries,
} from "./utils/parseModelPckEntries";
import { ResolvedModel, resolveModelChain } from "./utils/resolveModelChain";
import { ModelTextureProvider } from "./utils/resolveTextures";
import { ModelTreeView } from "./components/ModelTreeView";
import { ModelViewport } from "./components/ModelViewport";

type RenderingMode = "untextured" | "textured";

interface ModelsState {
  parsed: ParsedModelFiles;
  models: ResolvedModel[];
}

/** Prefers a faction model archive (gfx/mdl/armyN.gfx) as primary texture source. */
function pickDefaultGfxPath(parsed: ParsedModelFiles): string {
  if (parsed.gfxFiles.length === 0) {
    return "";
  }
  const mdlGfx = parsed.gfxFiles.filter((gfx) => gfx.path.startsWith("gfx/mdl/"));
  return (
    mdlGfx.find((gfx) => gfx.path === "gfx/mdl/army1.gfx")?.path ??
    mdlGfx[0]?.path ??
    parsed.gfxFiles[0].path
  );
}

const PageModels = () => {
  const { t } = useTranslation();
  const title = t("models.title");
  usePageTitle(title);

  const [loadedPcks, setLoadedPcks] = useState<string[]>([]);
  const [modelsState, setModelsState] = useState<ModelsState | null>(null);
  const [selectedModelIndex, setSelectedModelIndex] = useState<number | null>(null);
  const [renderingMode, setRenderingMode] = useState<RenderingMode>("untextured");
  const [wireframe, setWireframe] = useState(false);
  const [selectedGfxPath, setSelectedGfxPath] = useState<string>("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseFailed, setParseFailed] = useState(false);

  const selectedModel =
    modelsState && selectedModelIndex !== null
      ? (modelsState.models[selectedModelIndex] ?? null)
      : null;

  const textureProvider = useMemo(() => {
    if (!modelsState || modelsState.parsed.gfxFiles.length === 0) {
      return null;
    }
    // The user-selected faction archive gets priority; remaining archives
    // (effect.gfx etc.) serve as fallback for their subresource ranges.
    const files = [...modelsState.parsed.gfxFiles];
    const selectedIndex = files.findIndex((gfx) => gfx.path === selectedGfxPath);
    if (selectedIndex > 0) {
      const [selected] = files.splice(selectedIndex, 1);
      files.unshift(selected);
    }
    // faction palettes pair with their gfx archive (armyN.pal ↔ armyN.gfx)
    const palettePath = selectedGfxPath.replace(/\.gfx$/, ".pal");
    const palette =
      modelsState.parsed.palFiles.find((pal) => pal.path === palettePath)?.file.colorsArgb ??
      [];
    return new ModelTextureProvider(files, palette);
  }, [modelsState, selectedGfxPath]);

  const handleFilesChanged = async (files: File[]) => {
    if (files.length === 0 || isParsing) {
      return;
    }
    setIsParsing(true);
    setParseFailed(false);
    try {
      await delay(250); // wait for ui to update because parsing is resource intensive
      let parsed: ParsedModelFiles;      const pckNames: string[] = [];
      if (modelsState) {
        parsed = modelsState.parsed;
      } else {
        parsed = {
          armFiles: [],
          mdlRecords: new Map(),
          sprFiles: new Map(),
          gfxFiles: [],
          palFiles: [],
          helpText: null,
        };
      }
      for (const file of files) {
        const pck: PckFile = await parsePckFile(file);
        mergeModelPckEntries(parsed, pck);
        pckNames.push(pck.filename);
      }
      const models = resolveModelChain(parsed);
      setLoadedPcks((previous) => [...previous, ...pckNames]);
      setModelsState({ parsed, models });
      setSelectedModelIndex(models.length > 0 ? 0 : null);
      setSelectedGfxPath(pickDefaultGfxPath(parsed));
    } catch (error) {
      console.error(error);
      setParseFailed(true);
    } finally {
      setIsParsing(false);
    }
  };

  // Merged state persists across selections (models are spread over several
  // archives), so stale entries from earlier picks would keep winning the
  // first-wins merges. Discarding resets to a clean corpus.
  const handleClearLoaded = () => {
    if (isParsing) {
      return;
    }
    setLoadedPcks([]);
    setModelsState(null);
    setSelectedModelIndex(null);
    setSelectedGfxPath("");
    setParseFailed(false);
  };

  return (
    <MainLayout withPadding={false}>
      <Stack sx={{ height: "calc(100vh - 64px)" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            padding: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
          <SelectFileButton
            accept=".pck"
            multiple
            onFileChanged={(file) => handleFilesChanged(file ? [file] : [])}
            onFilesChanged={handleFilesChanged}
            disabled={isParsing}
          >
            {t("models.select-pck")}
          </SelectFileButton>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={renderingMode}
            onChange={(_, mode: RenderingMode) => mode && setRenderingMode(mode)}
          >
            <ToggleButton value="untextured">{t("models.untextured")}</ToggleButton>
            <ToggleButton value="textured" disabled={!textureProvider}>
              {t("models.textured")}
            </ToggleButton>
          </ToggleButtonGroup>
          {modelsState && modelsState.parsed.gfxFiles.length > 0 && (
            <TextField
              select
              size="small"
              label={t("models.texture-archive")}
              value={selectedGfxPath}
              onChange={(event) => setSelectedGfxPath(event.target.value)}
              sx={{ minWidth: 220 }}
            >
              {modelsState.parsed.gfxFiles.map((gfx) => (
                <MenuItem key={gfx.path} value={gfx.path}>
                  {gfx.path}
                </MenuItem>
              ))}
            </TextField>
          )}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2">{t("models.wireframe")}</Typography>
            <Switch checked={wireframe} onChange={(_, checked) => setWireframe(checked)} />
          </Box>
        </Box>
        {parseFailed && (
          <Typography color="error" sx={{ paddingX: 2 }}>
            {t("models.parse-failed")}
          </Typography>
        )}
        {loadedPcks.length > 0 && (
          <Box sx={{ paddingX: 2, paddingBottom: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {loadedPcks.map((name) => (
              <Chip key={name} label={name} size="small" />
            ))}
            <Button size="small" onClick={handleClearLoaded} disabled={isParsing}>
              {t("models.clear-loaded")}
            </Button>
            {modelsState && !modelsState.parsed.helpText && modelsState.models.length > 0 && (
              <Typography variant="body2" sx={{ alignSelf: "center" }}>
                {t("models.name-hint")}
              </Typography>
            )}
          </Box>
        )}
        <Box sx={{ display: "flex", flexGrow: 1, minHeight: 0 }}>
          <Box
            sx={{
              width: 320,
              overflowY: "auto",
              borderRight: 1,
              borderColor: "divider",
              padding: 1,
            }}
          >
            {modelsState && (
              <ModelTreeView
                models={modelsState.models}
                selectedIndex={selectedModelIndex}
                onSelect={setSelectedModelIndex}
              />
            )}
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <ModelViewport
              model={selectedModel}
              textureProvider={textureProvider}
              textured={renderingMode === "textured"}
              wireframe={wireframe}
            />
          </Box>
        </Box>
      </Stack>
    </MainLayout>
  );
};

export default PageModels;

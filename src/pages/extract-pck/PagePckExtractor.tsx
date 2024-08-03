import { useTranslation } from "react-i18next";
import { MainLayout } from "../../layout/MainLayout";
import { Stack, Typography } from "@mui/material";
import { useState } from "react";
import { PckFile } from "../../domain/pck/PckFile";
import { parsePckFile } from "../../domain/pck/PckParser";
import { PckHeaderInfo } from "./components/PckHeaderInfo";
import { PckEntryList } from "./components/PckEntryList";
import { AboutCard } from "./components/AboutCard";
import { delay } from "../../common/utils/delay";
import { ParseFailedError } from "./components/ParseFailedError";
import { usePageTitle } from "../../common/utils/usePageTitle";

const PagePckExtractor = () => {
    const { t } = useTranslation();
    const pckExtractor = t("pck-extractor.title");
    usePageTitle(pckExtractor);

    const [selectedFile, setSelectedFile] = useState<File>();
    const [pckFile, setPckFile] = useState<PckFile>();
    const [parseFailed, setParseFailed] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    const handleFileChanged = async (file?: File) => {
        setParseFailed(false);
        setPckFile(undefined);
        if (file && !isParsing) {
            setIsParsing(true);
            setSelectedFile(file);
            try {
                await delay(250); // wait for ui to update because parsing is resource intensive
                const pckTask = parsePckFile(file);
                await delay(250); // reduces Layout shifting in short time
                const pck = await pckTask;
                setPckFile(pck);
            } catch {
                setParseFailed(true);
            } finally {
                setIsParsing(false);
            }
        }
        return;
    };

    return (
        <MainLayout>
            <Typography variant="h3" component="h2" display="block" gutterBottom>
                {pckExtractor}
            </Typography>
            <Stack gap="16px">
                <ParseFailedError failed={parseFailed} />
                <AboutCard onFileChanged={handleFileChanged} disableSelection={isParsing} />
                <PckHeaderInfo file={pckFile} selectedFile={selectedFile} isLoading={isParsing} />
                <PckEntryList entries={pckFile?.pckFileEntries} />
            </Stack>
        </MainLayout>
    );
};

export default PagePckExtractor;

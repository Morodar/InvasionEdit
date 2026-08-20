import { MainLayout } from "../../layout/MainLayout";
import { Stack, Typography } from "@mui/material";
import { useState } from "react";
import { StrSelectFileCard } from "./components/StrSelectFileCard";
import { ParseFailedError } from "./components/ParseFailedError";
import { usePageTitle } from "../../common/utils/usePageTitle";
import { useTranslation } from "react-i18next";
import { StrFile } from "../../domain/str/StrFile";
import { StrUtils } from "../../domain/str/StrUtils";
import { StrHeaderInfo } from "./components/StrHeaderInfo";
import { StrLocaleList } from "./components/StrLocaleList";

const PageStrParser = () => {
    const { t } = useTranslation();
    const strParser = t("str-parser.title");
    usePageTitle(strParser);

    const [selectedFile, setSelectedFile] = useState<File>();
    const [strFile, setStrFile] = useState<StrFile>();
    const [parseFailed, setParseFailed] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    const handleFileChanged = async (file?: File) => {
        setParseFailed(false);
        setStrFile(undefined);
        setSelectedFile(file);
        if (file && !isParsing) {
            setIsParsing(true);
            try {
                const parsed = StrUtils.fromArrayBuffer(await file.arrayBuffer()).parseStrFile();
                setStrFile(parsed);
            } catch {
                setParseFailed(true);
            } finally {
                setIsParsing(false);
            }
        }
    };

    return (
        <MainLayout mainMaxWidth={900}>
            <Typography variant="h3" component="h2" display="block" gutterBottom>
                {strParser}
            </Typography>
            <Stack gap="16px">
                <ParseFailedError failed={parseFailed} />
                <StrSelectFileCard onFileChanged={handleFileChanged} disableSelection={isParsing} />
                <StrHeaderInfo strFile={strFile} selectedFile={selectedFile} />
                {strFile && <StrLocaleList strFile={strFile} />}
            </Stack>
        </MainLayout>
    );
};

export default PageStrParser;

import { Box, Button, Card, CardContent, CircularProgress, Stack } from "@mui/material";
import { PckFile, downloadPckFileAsZip } from "../../../domain/pck/PckFile";
import { H3 } from "../../../common/header/Headers";
import SaveIcon from "@mui/icons-material/Save";
import { useTranslation } from "react-i18next";

interface PckHeaderInfoProps {
    file?: PckFile;
    selectedFile?: File;
    isLoading: boolean;
}

export const PckHeaderInfo = (props: PckHeaderInfoProps) => {
    const { file, selectedFile, isLoading } = props;
    const { t } = useTranslation();

    if (!file && !selectedFile) {
        return <></>;
    }
    const hasAnyEntry = (file?.pckFileEntries?.length ?? 0) > 0;
    const header = file?.header;

    const downloadPckZip = async () => {
        if (file) {
            await downloadPckFileAsZip(file);
        }
    };

    return (
        <Card>
            <CardContent>
                <Stack direction="row">
                    <H3 variant="h5">{t("pck-extractor.pck-header")}</H3>
                    <Box sx={{ flexGrow: 1 }} component="div" />
                    {hasAnyEntry && (
                        <Button variant="contained" startIcon={<SaveIcon />} onClick={downloadPckZip}>
                            {t("pck-extractor.save-zip")}{" "}
                        </Button>
                    )}
                </Stack>
                <ul>
                    {selectedFile && <li>Name: {selectedFile.name}</li>}
                    {header && (
                        <>
                            <li>
                                {t("common.date")}: {header.date1.toISOString()}
                            </li>
                            <li>
                                {t("common.pc-name")}: {header.pcName1}
                            </li>
                            <li>
                                {t("common.file-count")}: {header.fileCount}
                            </li>
                            <li>
                                {t("common.file-size")}: {header.fileSize} bytes
                            </li>
                        </>
                    )}
                </ul>
                {isLoading && (
                    <Stack direction="row" justifyContent="center">
                        <CircularProgress disableShrink />
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
};

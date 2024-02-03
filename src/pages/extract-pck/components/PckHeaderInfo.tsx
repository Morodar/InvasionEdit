import { Box, Button, Card, CardContent, CircularProgress, Stack } from "@mui/material";
import { PckFile, downloadPckFileAsZip } from "../../../domain/pck/PckFile";
import { H3 } from "../../../common/header/Headers";
import SaveIcon from "@mui/icons-material/save";

interface PckHeaderInfoProps {
    file?: PckFile;
    selectedFile?: File;
    isLoading: boolean;
}

export const PckHeaderInfo = (props: PckHeaderInfoProps) => {
    const { file, selectedFile, isLoading } = props;

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
                    <H3 variant="h5">PCK Header</H3>
                    <Box sx={{ flexGrow: 1 }} component="div" />
                    {hasAnyEntry && (
                        <Button variant="contained" startIcon={<SaveIcon />} onClick={downloadPckZip}>
                            Save ZIP
                        </Button>
                    )}
                </Stack>
                <ul>
                    {selectedFile && <li>Name: {selectedFile.name}</li>}
                    {header && (
                        <>
                            <li>Date: {header.date1.toISOString()}</li>
                            <li>PC Name: {header.pcName1}</li>
                            <li>File count: {header.fileCount}</li>
                            <li>File size: {header.fileSize} bytes</li>
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

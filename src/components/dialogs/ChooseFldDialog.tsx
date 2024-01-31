import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { SelectFileButton } from "../common/input/SelectFileButton";
import { useEffect, useState } from "react";
import { FldFile } from "../../domain/FldFile";
import { parseFldFile } from "../../domain/parseFldFile";
import { useFldMapContext } from "../../context/fld/useFldMapContext";
import { useTranslation } from "react-i18next";

export interface ChooseFldDialogProps {
    open: boolean;
    onClose: () => void;
}

export const ChooseFldDialog = (props: ChooseFldDialogProps) => {
    const { t } = useTranslation();
    const { onClose, open } = props;
    const { setFldFile } = useFldMapContext();
    const [tmpFldFile, setTmpFldFile] = useState<FldFile>();
    useEffect(() => {
        if (open) {
            setTmpFldFile(undefined);
        }
    }, [open]);

    const handleFileChanged = async (file?: File) => {
        if (file) {
            const parsedFldFile = await parseFldFile(file);
            setTmpFldFile(parsedFldFile);
        }
    };

    const applyFldFile = () => {
        if (tmpFldFile) {
            setFldFile(tmpFldFile);
            onClose();
        }
    };

    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle>{t("choose-fld-file")}</DialogTitle>
            <DialogContent>
                <ShowFileInfo fldFile={tmpFldFile} />
            </DialogContent>
            <DialogActions>
                <SelectFileButton onFileChanged={handleFileChanged}>{t("select-file")}</SelectFileButton>
                <Button onClick={onClose}>{t("cancel")}</Button>
                <Button disabled={!tmpFldFile} onClick={applyFldFile}>
                    {t("confirm")}{" "}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

interface ShowFileInfo {
    fldFile?: FldFile;
}

const ShowFileInfo = (props: ShowFileInfo) => {
    const { t } = useTranslation();
    const { fldFile } = props;
    if (!fldFile) {
        return (
            <Typography variant="body1" display="block" gutterBottom>
                {t("please-select-a-fld-file")}
            </Typography>
        );
    }
    return (
        <Stack direction="row" spacing={1}>
            <Chip label={fldFile.name} color="success" />
            <Chip label={`${fldFile.width} x ${fldFile.height}`} />
            <Chip label={`${fldFile.fileSize} bytes`} />
        </Stack>
    );
};

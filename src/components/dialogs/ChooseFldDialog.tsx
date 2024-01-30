import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { SelectFileButton } from "../common/input/SelectFileButton";
import { useEffect, useState } from "react";
import { FldFile } from "../../domain/FldFile";
import { parseFldFile } from "../../domain/parseFldFile";
import { useFldMapContext } from "../../context/fld/useFldMapContext";

export interface ChooseFldDialogProps {
    open: boolean;
    onClose: () => void;
}

export const ChooseFldDialog = (props: ChooseFldDialogProps) => {
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
            <DialogTitle>Choose Fld File</DialogTitle>
            <DialogContent>
                <ShowFileInfo fldFile={tmpFldFile} />
            </DialogContent>
            <DialogActions>
                <SelectFileButton onFileChanged={handleFileChanged}>Select File</SelectFileButton>
                <Button onClick={onClose}>Cancel</Button>
                <Button disabled={!tmpFldFile} onClick={applyFldFile}>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

interface ShowFileInfo {
    fldFile?: FldFile;
}

const ShowFileInfo = (props: ShowFileInfo) => {
    const { fldFile } = props;
    if (!fldFile) {
        return (
            <Typography variant="body1" display="block" gutterBottom>
                Please select a fld file.
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

import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { SelectFileButton } from "../common/input/SelectFileButton";
import { useState } from "react";
import { useFldMapContext } from "../../context/fld/FldMapContext";
import { FldFile } from "../../domain/FldFile";
import { parseFldFile } from "../../domain/parseFldFile";

export interface ChooseFldDialogProps {
    open: boolean;
    onClose: () => void;
}

export const ChooseFldDialog = (props: ChooseFldDialogProps) => {
    const { onClose, open } = props;
    const [file, setFile] = useState<File>();
    const { setFldFile, fldFile } = useFldMapContext();
    const [tmpFldFile, setTmpFldFile] = useState<FldFile>();

    const handleFileChanged = async (file?: File) => {
        if (file) {
            const parsedFldFile = await parseFldFile(file);
            setTmpFldFile(parsedFldFile);
        }
    };

    const applyFldFile = () => {
        if (tmpFldFile) {
            setFldFile(tmpFldFile);
        }
    };

    const handleClose = () => {
        onClose();
        setFile(undefined);
        setTmpFldFile(undefined);
    };

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Choose Fld File</DialogTitle>
            <DialogContent>
                <ShowFileInfo fldFile={tmpFldFile} />
            </DialogContent>
            <DialogActions>
                <SelectFileButton onFileChanged={handleFileChanged}>Select File</SelectFileButton>
                <Button onClick={handleClose}>Cancel</Button>
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

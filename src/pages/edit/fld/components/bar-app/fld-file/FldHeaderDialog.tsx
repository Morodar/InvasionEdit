import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, Typography } from "@mui/material";
import { FldFile } from "../../../../../../domain/fld/FldFile";
import { useTranslation } from "react-i18next";

export interface FldHeaderDialogProps {
    open: boolean;
    fldFile: FldFile;
    onClose: () => void;
}

export const FldHeaderDialog = (props: FldHeaderDialogProps) => {
    const { onClose, open, fldFile } = props;
    const { t } = useTranslation();

    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle>FLD Header</DialogTitle>
            <DialogContent>
                <Typography>
                    <List dense>
                        <ListItem>Name: {fldFile.name}</ListItem>
                        <ListItem>
                            {t("common.file-size")}: {fldFile.fileSize} bytes
                        </ListItem>
                        <ListItem>Meta Save Location: {fldFile.devSaveLocation}</ListItem>
                        <ListItem>Unknown 0x0B0: {fldFile.unknown0xB0}</ListItem>
                        <ListItem>Unknown 0x0B4: {fldFile.unknown0xB4}</ListItem>
                    </List>
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("common.close")}</Button>
            </DialogActions>
        </Dialog>
    );
};

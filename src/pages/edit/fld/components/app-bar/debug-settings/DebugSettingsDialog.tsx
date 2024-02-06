import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    FormGroup,
    Switch,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDebugSettingsContext } from "../../../context/DebugSettingsContext";

export interface DebugSettingsDialogProps {
    open: boolean;
    onClose: () => void;
}

export const DebugSettingsDialog = (props: DebugSettingsDialogProps) => {
    const { t } = useTranslation();
    const { onClose, open } = props;
    const { debugSettings, setShowDebugCube, showDebugCursorPosition } = useDebugSettingsContext();

    const handleDebugCubeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowDebugCube(event.target.checked);
    };
    const handleDebugCursorPositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        showDebugCursorPosition(event.target.checked);
    };

    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle>{t("fld-editor.debug.settings")}</DialogTitle>
            <DialogContent>
                <FormGroup>
                    <FormControlLabel
                        control={<Switch checked={debugSettings.showDebugCube} onChange={handleDebugCubeChange} />}
                        label={t("fld-editor.debug.cube")}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={debugSettings.showDebugCursorPosition}
                                onChange={handleDebugCursorPositionChange}
                            />
                        }
                        label={t("fld-editor.debug.cursor-position")}
                    />
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("common.close")}</Button>
            </DialogActions>
        </Dialog>
    );
};

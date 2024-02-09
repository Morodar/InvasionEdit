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
    const { onClose, open } = props;
    const { t } = useTranslation();
    const { debugSettings, setShowDebugCube, showDebugCursorPosition, setShowDebugCube3x3 } = useDebugSettingsContext();

    const handleDebugCubeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowDebugCube(event.target.checked);
    };
    const handleDebugCubeChange3x3 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowDebugCube3x3(event.target.checked);
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
                            <Switch checked={debugSettings.showDebugCube3x3} onChange={handleDebugCubeChange3x3} />
                        }
                        label={t("fld-editor.debug.cube") + "3x3"}
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

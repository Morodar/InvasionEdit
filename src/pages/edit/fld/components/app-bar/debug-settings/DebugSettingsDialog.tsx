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
            <DialogTitle>Debug Settings</DialogTitle>
            <DialogContent>
                <FormGroup>
                    <FormControlLabel
                        control={<Switch checked={debugSettings.showDebugCube} onChange={handleDebugCubeChange} />}
                        label="Debug Cube"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={debugSettings.showDebugCursorPosition}
                                onChange={handleDebugCursorPositionChange}
                            />
                        }
                        label="Debug Cursor Position"
                    />
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

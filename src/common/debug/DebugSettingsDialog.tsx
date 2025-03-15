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
import { useDebugSettingsContext } from "./DebugSettingsContext";

export interface DebugSettingsDialogProps {
    open: boolean;
    onClose: () => void;
}

export const DebugSettingsDialog = (props: DebugSettingsDialogProps) => {
    const { onClose, open } = props;
    const { t } = useTranslation();
    const {
        debugSettings,
        setShowAllLayers,
        setShowDebugCube,
        showDebugCursorPosition,
        setShowDebugCube3x3,
        setShowEntitiesList,
    } = useDebugSettingsContext();

    const handleShowAllLayersChange = (event: React.ChangeEvent<HTMLInputElement>) =>
        setShowAllLayers(event.target.checked);

    const handleDebugCubeChange = (event: React.ChangeEvent<HTMLInputElement>) =>
        setShowDebugCube(event.target.checked);

    const handleDebugCubeChange3x3 = (event: React.ChangeEvent<HTMLInputElement>) =>
        setShowDebugCube3x3(event.target.checked);

    const handleDebugCursorPositionChange = (event: React.ChangeEvent<HTMLInputElement>) =>
        showDebugCursorPosition(event.target.checked);

    const handleShowEntitiesListChange = (event: React.ChangeEvent<HTMLInputElement>) =>
        setShowEntitiesList(event.target.checked);

    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle>{t("fld-editor.debug.settings")}</DialogTitle>
            <DialogContent>
                <FormGroup>
                    <FormControlLabel
                        control={<Switch checked={debugSettings.showAllLayers} onChange={handleShowAllLayersChange} />}
                        label={t("fld-editor.debug.show-all-layers")}
                    />
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
                    <FormControlLabel
                        control={
                            <Switch checked={debugSettings.showEntitiesList} onChange={handleShowEntitiesListChange} />
                        }
                        label={t("fld-editor.debug.show-entities-list")}
                    />
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("common.close")}</Button>
            </DialogActions>
        </Dialog>
    );
};

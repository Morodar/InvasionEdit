import SaveIcon from "@mui/icons-material/Save";
import { IconButton, Tooltip } from "@mui/material";
import saveAs from "file-saver";
import { useTranslation } from "react-i18next";
import { useEditLevelContext } from "../../../pages/edit/level/EditLevelContext";
import { LevelUtils } from "../../level/LevelUtils";

export const SaveLevelButton = () => {
    const { t } = useTranslation();
    const { levelPck } = useEditLevelContext();

    const downloadFile = () => {
        if (levelPck) {
            const file: File = LevelUtils.buildLevelFile(levelPck);
            const blob = new Blob([file], { type: file.type });
            saveAs(blob, file.name);
        }
    };

    return (
        <IconButton disabled={!levelPck} onClick={downloadFile}>
            <Tooltip title={t("lvl-editor.save-levels")}>
                <SaveIcon />
            </Tooltip>
        </IconButton>
    );
};

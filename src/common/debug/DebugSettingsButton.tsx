import { Tooltip, IconButton } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CodeIcon from "@mui/icons-material/Code";
import { DebugSettingsDialog } from "./DebugSettingsDialog";

export const DebugSettingsButton = () => {
    const { t } = useTranslation();

    const [showDialog, setShowDialog] = useState(false);
    const onShowDialog = () => setShowDialog(true);
    const onHideDialog = () => setShowDialog(false);

    return (
        <>
            <Tooltip title={t("fld-editor.debug.settings")}>
                <IconButton onClick={onShowDialog}>
                    <CodeIcon />
                </IconButton>
            </Tooltip>
            <DebugSettingsDialog open={showDialog} onClose={onHideDialog} />
        </>
    );
};

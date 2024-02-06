import { Tooltip, IconButton } from "@mui/material";
import { useState } from "react";
import UploadIcon from "@mui/icons-material/Upload";
import { useTranslation } from "react-i18next";
import { ChooseFldDialog } from "./ChooseFldDialog";

export const ChooseFldButton = () => {
    const { t } = useTranslation();

    const [showFldDialog, setShowFldDialog] = useState(false);
    const onShowFldDialog = () => setShowFldDialog(true);
    const onHideFldDialog = () => setShowFldDialog(false);

    return (
        <>
            <Tooltip title={t("btn.load.fld")}>
                <IconButton onClick={onShowFldDialog}>
                    <UploadIcon />
                </IconButton>
            </Tooltip>
            <ChooseFldDialog open={showFldDialog} onClose={onHideFldDialog} />
        </>
    );
};

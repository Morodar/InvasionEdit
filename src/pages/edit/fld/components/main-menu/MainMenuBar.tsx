import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import "./MainMenuBar.css";
import { ChooseFldDialog } from "../choose-fld/ChooseFldDialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import UploadIcon from "@mui/icons-material/Upload";
import { HomeIconButton } from "../../../../../common/icon-buttons/HomeIconButton";
import { ProjectIconButton } from "../../../../../common/icon-buttons/ProjectIconButton";

export const MainMenuBar = () => {
    const [showFldDialog, setShowFldDialog] = useState(false);
    const { t } = useTranslation();
    const onShowFldDialog = () => setShowFldDialog(true);
    const onHideFldDialog = () => setShowFldDialog(false);

    return (
        <Stack className="main-menu-bar" direction="row" spacing={2}>
            <Typography variant="h4" component="h1" display="block" gutterBottom>
                {t("app_name")}
            </Typography>
            <div>
                <Tooltip title={t("btn.load.fld")}>
                    <IconButton onClick={onShowFldDialog}>
                        <UploadIcon />
                    </IconButton>
                </Tooltip>
                <HomeIconButton />
                <ProjectIconButton />
            </div>
            <ChooseFldDialog open={showFldDialog} onClose={onHideFldDialog} />
        </Stack>
    );
};

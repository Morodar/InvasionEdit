import { Button, Stack, Typography } from "@mui/material";
import "./MainMenuBar.css";
import { ChooseFldDialog } from "../ChooseFldDialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
            <Button variant="contained" color="success" onClick={onShowFldDialog}>
                {t("btn.load.fld")}
            </Button>
            <ChooseFldDialog open={showFldDialog} onClose={onHideFldDialog} />
        </Stack>
    );
};

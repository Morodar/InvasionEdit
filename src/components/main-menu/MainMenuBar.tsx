import { Button, Stack, Typography } from "@mui/material";
import "./MainMenuBar.css";
import { ChooseFldDialog } from "../dialogs/ChooseFldDialog";
import { useState } from "react";

export const MainMenuBar = () => {
    const [showFldDialog, setShowFldDialog] = useState(false);

    const onShowFldDialog = () => setShowFldDialog(true);
    const onHideFldDialog = () => setShowFldDialog(false);

    return (
        <Stack className="main-menu-bar" direction="row" spacing={2}>
            <Typography variant="h4" component="h1" display="block" gutterBottom>
                Invasion Edit
            </Typography>
            <Button variant="contained" color="success" onClick={onShowFldDialog}>
                Load Fld
            </Button>
            <ChooseFldDialog open={showFldDialog} onClose={onHideFldDialog} />
        </Stack>
    );
};

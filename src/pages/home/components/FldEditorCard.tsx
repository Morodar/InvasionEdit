import { Card, CardMedia, CardContent, Typography, CardActions, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { EDIT_FLD } from "../../../conf/AppRoutes";

export const FldEditorCard = () => {
    const { t } = useTranslation();
    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardMedia component="img" height="140" image="img/fld-editor.png" />
            <CardContent>
                <Typography gutterBottom variant="h5" component="h3">
                    {t("fld-editor.title")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t("fld-editor.short-description")}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" component={Link} to={EDIT_FLD}>
                    {t("fld-editor.start-editor")}
                </Button>
            </CardActions>
        </Card>
    );
};

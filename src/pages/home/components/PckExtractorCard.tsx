import { Card, CardMedia, CardContent, Typography, CardActions, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { EXTRACT_PCK } from "../../../conf/AppRoutes";

export const PckExtractorCard = () => {
    const { t } = useTranslation();
    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardMedia component="img" height="140" image="img/extract-pck.png" />
            <CardContent>
                <Typography gutterBottom variant="h5" component="h3">
                    {t("pck-extractor.title")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t("pck-extractor.short-description")}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" component={Link} to={EXTRACT_PCK}>
                    {t("pck-extractor.start-extractor")}
                </Button>
            </CardActions>
        </Card>
    );
};

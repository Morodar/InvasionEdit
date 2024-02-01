import { Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { EDIT_FLD } from "../../conf/AppRoutes";
import { useTranslation } from "react-i18next";

const PageHome = () => {
    const { t } = useTranslation();
    return (
        <section>
            <Typography variant="h4" component="h1" display="block" gutterBottom>
                {t("app_name")}
            </Typography>
            <Typography variant="h5" component="h2" display="block" gutterBottom>
                {t("home")}
            </Typography>
            <Button>Pck Extractor</Button>
            <Button component={Link} to={EDIT_FLD}>
                {t("fld-editor")}
            </Button>
        </section>
    );
};

export default PageHome;

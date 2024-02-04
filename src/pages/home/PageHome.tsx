import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import "./PageHome.css";
import { MainLayout } from "../../layout/MainLayout";
import { PckExtractorCard } from "./components/PckExtractorCard";
import { FldEditorCard } from "./components/FldEditorCard";
import { usePageTitle } from "../../common/utils/usePageTitle";

const PageHome = () => {
    const { t } = useTranslation();
    const home = t("home");
    usePageTitle(home);
    return (
        <MainLayout>
            <Typography variant="h3" component="h2" gutterBottom>
                {home}
            </Typography>
            <Stack gap="32px" direction="row" flexWrap="wrap">
                <PckExtractorCard />
                <FldEditorCard />
            </Stack>
        </MainLayout>
    );
};

export default PageHome;

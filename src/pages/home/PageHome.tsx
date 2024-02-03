import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import "./PageHome.css";
import { MainLayout } from "../../layout/MainLayout";
import { PckExtractorCard } from "./components/PckExtractorCard";
import { FldEditorCard } from "./components/FldEditorCard";

const PageHome = () => {
    const { t } = useTranslation();
    return (
        <MainLayout>
            <Typography variant="h3" component="h2" gutterBottom>
                {t("home")}
            </Typography>
            <Stack gap="32px" direction="row" flexWrap="wrap">
                <PckExtractorCard />
                <FldEditorCard />
            </Stack>
        </MainLayout>
    );
};

export default PageHome;

import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import "./PageHome.css";
import { MainLayout } from "../../layout/MainLayout";
import { PckExtractorCard } from "./components/PckExtractorCard";
import { FldEditorCard } from "./components/FldEditorCard";
import { usePageTitle } from "../../common/utils/usePageTitle";
import { LevelEditorCard } from "./components/LevelEditorCard";
import { SamDecoderCard } from "./components/SamDecoderCard";
import { FlmDecoderCard } from "./components/FlmDecoderCard";

const PageHome = () => {
    const { t } = useTranslation();
    const home = t("common.editors");
    usePageTitle(home);
    return (
        <MainLayout>
            <Stack gap="32px" direction="column">
                <Typography variant="h3" component="h2" gutterBottom>
                    {home}
                </Typography>
                <Stack gap="32px" direction="row" flexWrap="wrap">
                    <LevelEditorCard />
                    <FldEditorCard />
                </Stack>
                <Typography variant="h3" component="h2" gutterBottom>
                    {t("common.extractors")}
                </Typography>
                <Stack gap="32px" direction="row" flexWrap="wrap">
                    <PckExtractorCard />
                    <SamDecoderCard />
                    <FlmDecoderCard />
                </Stack>
            </Stack>
        </MainLayout>
    );
};

export default PageHome;

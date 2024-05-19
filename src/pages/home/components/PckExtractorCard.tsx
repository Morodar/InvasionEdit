import { useTranslation } from "react-i18next";
import { EXTRACT_PCK } from "../../../conf/AppRoutes";
import { HomeCard } from "./HomeCard";

export const PckExtractorCard = () => {
    const { t } = useTranslation();
    return (
        <HomeCard
            description={t("pck-extractor.short-description")}
            imgUrl="img/extract-pck.png"
            linkDest={EXTRACT_PCK}
            linkText={t("pck-extractor.start-extractor")}
            title={t("pck-extractor.title")}
        />
    );
};

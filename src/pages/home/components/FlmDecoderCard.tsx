import { useTranslation } from "react-i18next";
import { FLM_DECODER } from "../../../conf/AppRoutes";
import { HomeCard } from "./HomeCard";

export const FlmDecoderCard = () => {
    const { t } = useTranslation();
    return (
        <HomeCard
            description={t("flm-extractor.description-short")}
            imgUrl="img/extract-flm.png"
            linkDest={FLM_DECODER}
            linkText={t("flm-extractor.start-extractor")}
            title={t("flm-extractor.title")}
        />
    );
};

import { useTranslation } from "react-i18next";
import { FLM_DECODER } from "../../../conf/AppRoutes";
import { HomeCard } from "./HomeCard";

export const FlmDecoderCard = () => {
    const { t } = useTranslation();
    return (
        <HomeCard
            description={"Flm decoder desctiption"}
            imgUrl="img/extract-pck.png"
            linkDest={FLM_DECODER}
            linkText={t("exe-patcher.start-extractor")}
            title={"FLM_DECODER title"}
        />
    );
};

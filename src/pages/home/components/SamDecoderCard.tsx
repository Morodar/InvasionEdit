import { useTranslation } from "react-i18next";
import { SAM_DECODER } from "../../../conf/AppRoutes";
import { HomeCard } from "./HomeCard";

export const SamDecoderCard = () => {
    const { t } = useTranslation();
    return (
        <HomeCard
            description={"Sam decoder desctiption"}
            imgUrl="img/extract-pck.png"
            linkDest={SAM_DECODER}
            linkText={t("exe-patcher.start-extractor")}
            title={"SAM_DECODER title"}
        />
    );
};

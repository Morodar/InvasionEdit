import { useTranslation } from "react-i18next";
import { SAM_DECODER } from "../../../conf/AppRoutes";
import { HomeCard } from "./HomeCard";

export const SamDecoderCard = () => {
    const { t } = useTranslation();
    return (
        <HomeCard
            description={t("sam-decoder.short-description")}
            imgUrl="img/extract-pck.png"
            linkDest={SAM_DECODER}
            linkText={t("sam-decoder.start")}
            title={t("sam-decoder.title")}
        />
    );
};

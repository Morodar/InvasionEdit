import { useTranslation } from "react-i18next";
import { STR_PARSER } from "../../../conf/AppRoutes";
import { HomeCard } from "./HomeCard";

export const StrParserCard = () => {
    const { t } = useTranslation();
    return (
        <HomeCard
            description={t("str-parser.short-description")}
            imgUrl="img/extract-str.png"
            linkDest={STR_PARSER}
            linkText={t("str-parser.start")}
            title={t("str-parser.title")}
        />
    );
};

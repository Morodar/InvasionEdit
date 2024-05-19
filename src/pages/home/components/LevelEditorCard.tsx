import { useTranslation } from "react-i18next";
import { HomeCard } from "./HomeCard";
import { EDIT_LVL } from "../../../conf/AppRoutes";

export const LevelEditorCard = () => {
    const { t } = useTranslation();
    return (
        <HomeCard
            description={t("lvl-editor.short-description")}
            imgUrl="img/fld-editor.png"
            linkDest={EDIT_LVL}
            linkText={t("fld-editor.start-editor")}
            title={t("lvl-editor.title")}
        />
    );
};

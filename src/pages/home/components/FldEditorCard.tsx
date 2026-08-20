import { useTranslation } from "react-i18next";
import { EDIT_FLD } from "../../../conf/AppRoutes";
import { HomeCard } from "./HomeCard";

export const FldEditorCard = () => {
  const { t } = useTranslation();
  return (
    <HomeCard
      description={t("fld-editor.short-description")}
      imgUrl="img/fld-editor.png"
      linkDest={EDIT_FLD}
      linkText={t("fld-editor.start-editor")}
      title={t("fld-editor.title")}
    />
  );
};

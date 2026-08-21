import { useTranslation } from "react-i18next";
import { MODELS } from "../../../conf/AppRoutes";
import { HomeCard } from "./HomeCard";

export const ModelsCard = () => {
  const { t } = useTranslation();
  return (
    <HomeCard
      description={t("models.short-description")}
      imgUrl="img/lev-editor.png"
      linkDest={MODELS}
      linkText={t("models.start")}
      title={t("models.title")}
    />
  );
};

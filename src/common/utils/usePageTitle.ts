import { useTranslation } from "react-i18next";

export const usePageTitle = (...titleParts: string[]) => {
    const { t } = useTranslation();
    const app = t("app_name");
    const title = [titleParts, app].join(" | ");
    document.title = title;
};

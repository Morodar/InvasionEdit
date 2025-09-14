import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const usePageTitle = (...titleParts: string[]) => {
    const { t } = useTranslation();
    const app = t("common.app_name");
    const title = [titleParts, app].join(" | ");
    useEffect(() => {
        document.title = title;
    }, [title]);
};

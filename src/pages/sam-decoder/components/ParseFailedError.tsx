import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";

interface ParseFailedErrorProps {
    failed: boolean;
}

export const ParseFailedError = ({ failed }: ParseFailedErrorProps) => {
    const { t } = useTranslation();

    if (!failed) {
        return <></>;
    }

    return <Alert severity="warning">{t("sam-decoder.error.parse-failed")}</Alert>;
};

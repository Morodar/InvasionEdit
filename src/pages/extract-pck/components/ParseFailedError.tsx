import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";

interface ParseFailedErrorProps {
    failed: boolean;
}

export const ParseFailedError = (props: ParseFailedErrorProps) => {
    const { failed } = props;
    const { t } = useTranslation();

    if (!failed) {
        return <></>;
    }

    return <Alert severity="warning">{t("pck-extractor.unknown-error")}</Alert>;
};

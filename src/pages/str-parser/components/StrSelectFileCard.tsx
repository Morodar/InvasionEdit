import { useTranslation } from "react-i18next";
import { SelectFileButton } from "../../../common/input/SelectFileButton";
import { Card, CardContent, Stack } from "@mui/material";

interface StrSelectFileCardProps {
    onFileChanged: (file?: File) => void;
    disableSelection: boolean;
}

export const StrSelectFileCard = (props: StrSelectFileCardProps) => {
    const { t } = useTranslation();
    const { onFileChanged, disableSelection } = props;
    return (
        <Card>
            <CardContent>
                <p>{t("str-parser.short-description")}</p>
                <Stack direction="row" justifyContent="end">
                    <SelectFileButton onFileChanged={onFileChanged} accept=".str" disabled={disableSelection}>
                        {t("str-parser.select-file")}
                    </SelectFileButton>
                </Stack>
            </CardContent>
        </Card>
    );
};

import { useTranslation } from "react-i18next";
import { SelectFileButton } from "../../../common/input/SelectFileButton";
import { Card, CardContent, Stack } from "@mui/material";

interface AboutCardProps {
    onFileChanged: (file?: File) => void;
    disableSelection: boolean;
}

export const AboutCard = (props: AboutCardProps) => {
    const { t } = useTranslation();
    const { onFileChanged, disableSelection } = props;
    return (
        <Card>
            <CardContent>
                <p>{t("flm-extractor.description-short")}</p>

                <Stack direction="row" justifyContent="end">
                    <SelectFileButton onFileChanged={onFileChanged} accept=".flm" disabled={disableSelection}>
                        {t("flm-extractor.select-file")}
                    </SelectFileButton>
                </Stack>
            </CardContent>
        </Card>
    );
};

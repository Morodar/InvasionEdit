import { useTranslation } from "react-i18next";
import { SelectFileButton } from "../../../common/input/SelectFileButton";
import { Card, CardContent, Stack } from "@mui/material";

interface AboutCardProps {
    onFileChanged: (file?: File) => void;
    disableSelection: boolean;
}

export const AboutCard = (props: AboutCardProps) => {
    const { onFileChanged, disableSelection } = props;
    const { t } = useTranslation();
    return (
        <Card>
            <CardContent>
                <p>{t("pck-extractor.short-description")}</p>

                <Stack direction="row" justifyContent="end">
                    <SelectFileButton onFileChanged={onFileChanged} accept=".pck" disabled={disableSelection}>
                        {t("pck-extractor.extract-pck-file")}
                    </SelectFileButton>
                </Stack>
            </CardContent>
        </Card>
    );
};

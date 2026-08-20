import { Card, CardContent, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { StrFile } from "../../../domain/str/StrFile";

interface StrHeaderInfoProps {
    strFile?: StrFile;
    selectedFile?: File;
}

const COUNTRY_NAMES: Record<number, string> = {
    39: "Italian",
    34: "Spanish",
    33: "French",
    44: "English",
    49: "German",
    1: "Japanese",
};

export const StrHeaderInfo = (props: StrHeaderInfoProps) => {
    const { strFile, selectedFile } = props;
    const { t } = useTranslation();

    if (!strFile && !selectedFile) {
        return <></>;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    {t("str-parser.title")}
                </Typography>
                <ul>
                    {selectedFile && <li>Name: {selectedFile.name}</li>}
                    {strFile && (
                        <>
                            <li>
                                {t("str-parser.locale-count")}: {strFile.localeCount}
                            </li>
                            <li>
                                {t("str-parser.locales")}:
                                <ul>
                                    {strFile.blocks.map((block) => (
                                        <li key={block.countryCode}>
                                            {COUNTRY_NAMES[block.countryCode] || `Code ${block.countryCode}`} (
                                            {block.strings.length} {t("str-parser.strings")})
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        </>
                    )}
                </ul>
            </CardContent>
        </Card>
    );
};

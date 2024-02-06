import { Card, CardContent } from "@mui/material";
import { PckFileEntry } from "../../../domain/pck/PckFileEntry";
import { H3 } from "../../../common/header/Headers";
import { useTranslation } from "react-i18next";

interface PckEntryListProps {
    entries?: PckFileEntry[];
}

export const PckEntryList = (props: PckEntryListProps) => {
    const { entries } = props;
    const { t } = useTranslation();

    if (!entries || entries.length === 0) {
        return <></>;
    }

    const listItems = entries.map((entry) => {
        return <li key={entry.name}>{entry.name}</li>;
    });

    return (
        <Card>
            <CardContent>
                <H3 variant="h5">{t("pck-extractor.pck-files")}</H3>
                <ul>{listItems}</ul>
            </CardContent>
        </Card>
    );
};

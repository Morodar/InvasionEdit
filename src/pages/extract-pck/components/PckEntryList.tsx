import { Card, CardContent } from "@mui/material";
import { PckFileEntry } from "../../../domain/pck/PckFileEntry";
import { H3 } from "../../../common/header/Headers";

interface PckEntryListProps {
    entries?: PckFileEntry[];
}

export const PckEntryList = (props: PckEntryListProps) => {
    const { entries } = props;

    if (!entries || entries.length === 0) {
        return <></>;
    }

    const listItems = entries.map((entry) => {
        return <li key={entry.name}>{entry.name}</li>;
    });

    return (
        <Card>
            <CardContent>
                <H3 variant="h5">PCK Files</H3>
                <ul>{listItems}</ul>
            </CardContent>
        </Card>
    );
};

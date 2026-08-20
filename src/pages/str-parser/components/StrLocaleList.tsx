import { useState } from "react";
import { Card, CardContent, Tab, Tabs } from "@mui/material";
import { StrFile } from "../../../domain/str/StrFile";
import { StrStringTable } from "./StrStringTable";

const COUNTRY_NAMES: Record<number, string> = {
    44: "English",
    49: "German",
    1: "Japanese",
};

interface StrLocaleListProps {
    strFile: StrFile;
}

export const StrLocaleList = (props: StrLocaleListProps) => {
    const { strFile } = props;
    const [selectedLocale, setSelectedLocale] = useState(0);

    if (strFile.blocks.length === 0) {
        return <></>;
    }

    return (
        <Card>
            <CardContent>
                <Tabs
                    value={selectedLocale}
                    onChange={(_, newValue) => setSelectedLocale(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {strFile.blocks.map((block) => (
                        <Tab
                            key={block.countryCode}
                            label={`${COUNTRY_NAMES[block.countryCode] || `Code ${block.countryCode}`} (${block.strings.length})`}
                        />
                    ))}
                </Tabs>
                {strFile.blocks[selectedLocale] && (
                    <StrStringTable block={strFile.blocks[selectedLocale]} />
                )}
            </CardContent>
        </Card>
    );
};

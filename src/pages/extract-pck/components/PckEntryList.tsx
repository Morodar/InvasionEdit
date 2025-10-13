import { Card, CardContent } from "@mui/material";
import { PckFileEntry } from "../../../domain/pck/PckFileEntry";
import { H3 } from "../../../common/header/Headers";
import { useTranslation } from "react-i18next";
import { coeffs } from "../../../domain/sam/AudioCoeffs";
import { decodeFileAllBlocks } from "../../../domain/sam/SamUtils";
import SamPlayer from "../../sam-decoder/components/SamPlayer";

interface PckEntryListProps {
    entries?: PckFileEntry[];
}

export const PckEntryList = (props: PckEntryListProps) => {
    const { entries } = props;
    const { t } = useTranslation();

    if (!entries || entries.length === 0) {
        return <></>;
    }

    return (
        <Card>
            <CardContent>
                <H3 variant="h5">{t("pck-extractor.pck-files")}</H3>
                <ul>
                    {entries.map((entry) => (
                        <PckEntry key={entry.name} entry={entry} />
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

const PckEntry = ({ entry }: { entry: PckFileEntry }) => {
    if (entry.name.endsWith(".sam")) {
        return <SamRow entry={entry} />;
    }
    return <li>{entry.name}</li>;
};

const SamRow = ({ entry }: { entry: PckFileEntry }) => {
    const audio = convertToPcm(entry);

    return (
        <li style={{ color: "orange" }}>
            {entry.name} <SamPlayer pcmDataView={audio} />
        </li>
    );
};

function convertToPcm(entry: PckFileEntry): DataView<ArrayBuffer> {
    const offsetView = new DataView(
        entry.dataBytes.buffer,
        entry.dataBytes.byteOffset + 0x200,
        entry.dataBytes.byteLength - 0x200,
    );
    const output: Uint8Array<ArrayBuffer> = decodeFileAllBlocks(offsetView, coeffs);
    return new DataView(output.buffer);
}

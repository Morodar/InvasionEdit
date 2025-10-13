import { MainLayout } from "../../layout/MainLayout";
import { Stack, Typography } from "@mui/material";
import { useState } from "react";
import { AboutCard } from "./components/AboutCard";
import { delay } from "../../common/utils/delay";
import { ParseFailedError } from "./components/ParseFailedError";
import { usePageTitle } from "../../common/utils/usePageTitle";
import { decodeFileAllBlocks } from "../../domain/SamUtils";
import { coeffs } from "./AudioCoeffs";

import saveAs from "file-saver";

import { Card, CardContent } from "@mui/material";
import { H3 } from "../../common/header/Headers";

interface SetSamData {
    data: string;
}
export const SamData = (props: SetSamData) => {
    const { data } = props;

    return (
        <Card>
            <CardContent>
                <H3 variant="h5">{"test"}</H3>
                <div>{data}</div>
            </CardContent>
        </Card>
    );
};

let samData = "";

const PageSamDecoder = () => {
    const samDecoder = "SAM Decoder Title";
    usePageTitle(samDecoder);

    const [parseFailed, setParseFailed] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    const handleFileChanged = async (file?: File) => {
        // This is where the parsing would go
        setParseFailed(false);
        if (file && !isParsing) {
            setIsParsing(true);
            try {
                await delay(250); // wait for ui to update because parsing is resource intensive
                // const pckTask = parsePckFile(file);
                const content: ArrayBuffer = await file.arrayBuffer();
                const dataArray = new Uint8Array(content, 0x200, content.byteLength - 0x200);
                const output = decodeFileAllBlocks(dataArray, coeffs);
                const blob = new Blob([output], { type: "text/plain" });
                saveAs(blob, file.name + ".pcm");
            } catch (Error) {
                setParseFailed(true);
            } finally {
                setIsParsing(false);
            }
        }
        return;
    };

    return (
        <MainLayout>
            <Typography variant="h3" component="h2" display="block" gutterBottom>
                {samDecoder}
            </Typography>
            <Stack gap="16px">
                <ParseFailedError failed={parseFailed} />
                <AboutCard onFileChanged={handleFileChanged} disableSelection={isParsing} />
                <SamData data={samData} />
            </Stack>
        </MainLayout>
    );
};

export default PageSamDecoder;

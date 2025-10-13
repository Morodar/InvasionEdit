import { MainLayout } from "../../layout/MainLayout";
import { Stack, Typography } from "@mui/material";
import { useState } from "react";
import { AboutCard } from "./components/AboutCard";
import { delay } from "../../common/utils/delay";
import { ParseFailedError } from "./components/ParseFailedError";
import { usePageTitle } from "../../common/utils/usePageTitle";
import { decodeFileAllBlocks } from "../../domain/sam/SamUtils";
import { coeffs } from "../../domain/sam/AudioCoeffs";

import saveAs from "file-saver";

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
                const content: ArrayBuffer = await file.arrayBuffer();
                const view: DataView = new DataView(content, 0x200, content.byteLength - 0x200);
                const output: Uint8Array<ArrayBuffer> = decodeFileAllBlocks(view, coeffs);
                const blob = new Blob([output.buffer], { type: "text/plain" });
                saveAs(blob, file.name + ".pcm");
            } catch (Error) {
                console.error(Error);
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
            </Stack>
        </MainLayout>
    );
};

export default PageSamDecoder;

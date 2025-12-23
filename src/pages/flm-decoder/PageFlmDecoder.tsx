import { MainLayout } from "../../layout/MainLayout";
import { Stack, Typography } from "@mui/material";
import { useState } from "react";
import { AboutCard } from "./components/AboutCard";
import { delay } from "../../common/utils/delay";
import { ParseFailedError } from "./components/ParseFailedError";
import { usePageTitle } from "../../common/utils/usePageTitle";
import { decodeFLMvideo } from "../../domain/FlmUtils";
import { LUT } from "./LUT";
import { decodeFileAllBlocks } from "../../domain/sam/SamUtils";
import { coeffs } from "../../domain/sam/AudioCoeffs";
import saveAs from "file-saver";
import { useTranslation } from "react-i18next";
import { VideoFFmpegCard } from "./components/VideoFfmpegCard";
import { AudioFFmpegCard } from "./components/AudioFFmpegCard";

async function decodeFlm(file: File): Promise<{ flm: Blob; pcm: Blob | undefined }> {
    const content: ArrayBuffer = await file.arrayBuffer();
    const fileArray = new Uint32Array(content);

    const width = fileArray[0xb0 / 4];
    const height = fileArray[0xb4 / 4];
    const frames = fileArray[0xb8 / 4];
    const flmDataLength = fileArray[0xc0 / 4];
    const samFileLength = fileArray[0xc4 / 4];
    // const fps = fileArray[0xfc / 4];

    const outBuffer = new Uint32Array(height * width);
    const dataArray = new Uint8Array(content, 0x200, flmDataLength);
    const lookupTable = LUT;
    let offset = 0;
    const outFile = new Uint32Array((outBuffer.byteLength / 4) * frames);

    for (let i = 0; i < frames; i++) {
        offset += decodeFLMvideo(height, width, outBuffer, dataArray, lookupTable, offset);
        outFile.set(outBuffer, i * outBuffer.length);
    }
    const flm = new Blob([outFile], { type: "text/plain" });
    let pcm: Blob | undefined = undefined;
    //Does file have audio? Parse it too
    if (samFileLength > 0) {
        const audioDataOffset = 0x200 + flmDataLength + 0x200; //0x200 from flm header + flm data + 0x200 from audio header
        const audioDataLength = samFileLength - 0x200;
        const audioView = new DataView(content, audioDataOffset, audioDataLength);
        const output = decodeFileAllBlocks(audioView, coeffs);
        pcm = new Blob([output], { type: "text/plain" });
    }
    return { flm, pcm };
}

const PageFlmDecoder = () => {
    const { t } = useTranslation();
    const title = t("flm-extractor.title");
    usePageTitle(title);

    const [parseFailed, setParseFailed] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    // const FlmData = FUN_00418560(test);
    const handleFileChanged = async (file?: File) => {
        // This is where the parsing would go
        if (file && !isParsing) {
            setIsParsing(true);
            try {
                await delay(250); // wait for ui to update because parsing is resource intensive
                const { flm, pcm } = await decodeFlm(file);
                saveAs(flm, file.name + ".raw");
                if (pcm) {
                    saveAs(pcm, file.name + ".pcm");
                }
            } catch {
                setParseFailed(true);
            } finally {
                setIsParsing(false);
            }
        }
        return;
    };

    return (
        <MainLayout mainMaxWidth={900}>
            <Typography variant="h3" component="h2" display="block" gutterBottom>
                {title}
            </Typography>
            <Stack gap="16px">
                <ParseFailedError failed={parseFailed} />
                <AboutCard onFileChanged={handleFileChanged} disableSelection={isParsing} />
                <VideoFFmpegCard />
                <AudioFFmpegCard />
            </Stack>
        </MainLayout>
    );
};

export default PageFlmDecoder;

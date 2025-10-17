import { useTranslation } from "react-i18next";
import { MainLayout } from "../../layout/MainLayout";
import { Stack, Typography } from "@mui/material";
import { useState } from "react";
import { PckFile } from "../../domain/pck/PckFile";
import { AboutCard } from "./components/AboutCard";
import { delay } from "../../common/utils/delay";
import { ParseFailedError } from "./components/ParseFailedError";
import { usePageTitle } from "../../common/utils/usePageTitle";
import { decodeFLMvideo } from "../../domain/FlmUtils";
import { LUT } from "./LUT";
import { createVideoFromFrames } from "../../domain/VideoUtil";

import saveAs from "file-saver";



import { Card, CardContent } from "@mui/material";
import { H3 } from "../../common/header/Headers";
import { off } from "process";


interface SetFlmData {
    data: string;
}
export const FlmData = (props: SetFlmData) => {
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




let flmData = "";


const PageFlmDecoder = () => {
    const { t } = useTranslation();
    const FlmDecoder = "Flm Decoder Title";
    usePageTitle(FlmDecoder);

    const [selectedFile, setSelectedFile] = useState<File>();
    const [pckFile, setPckFile] = useState<PckFile>();
    const [parseFailed, setParseFailed] = useState(false);
    const [isParsing, setIsParsing] = useState(false);


    const test = new Uint8Array(10);
    // const FlmData = FUN_00418560(test);
    const handleFileChanged = async (file?: File) => {
        // This is where the parsing would go
        setParseFailed(false);
        setPckFile(undefined);
        if (file && !isParsing) {
            setIsParsing(true);
            setSelectedFile(file);
            try {
                await delay(250); // wait for ui to update because parsing is resource intensive
                // const pckTask = parsePckFile(file);
                const content: ArrayBuffer = await file.arrayBuffer();
                const fileArray =new Uint32Array(content);
                // const LUT =new Uint8Array(content);
                // const offset = 0x200;
                const dataArray =new Uint8Array(content, 0x200, content.byteLength - 0x200);
                const width = fileArray[0xb0/4];
                const height = fileArray[0xb4/4];
                const outBuffer = new Uint32Array(height * width);
                const lookupTable = LUT
                let offset = 0;
                const frames = fileArray[0xb8/4];
                const outFile = new Uint32Array(outBuffer.byteLength/4 * frames);

                const frames32: Uint32Array[] = [];

                for(let i=0; i < frames; i++){
                    offset += decodeFLMvideo(height, width, outBuffer, dataArray, lookupTable, offset);
                    //)
                    outFile.set(outBuffer, i * outBuffer.length);
                    
                    frames32.push(outBuffer.slice());

                }
                const blob = new Blob([outFile], { type: "text/plain" });
                saveAs(blob, file.name + ".raw");
                
                // function convertFrame(frame32: Uint32Array): Uint8Array {
                // return new Uint8Array(frame32.buffer);
                // }
                // const rgba8Frames = frames32.map(convertFrame);
                // const frames8: Uint8Array[] = frames32.map(f32 => new Uint8Array(f32.buffer));
                function convertFrameRGBA(frame32: Uint32Array): Uint8Array {
                const out = new Uint8Array(frame32.length * 4);
                for (let i = 0; i < frame32.length; i++) {
                    const pixel = frame32[i];
                    // adjust based on your packing:
                    // this assumes pixel = 0xAARRGGBB (common format)
                    const a = (pixel >>> 24) & 0xFF;
                    const r = (pixel >>> 16) & 0xFF;
                    const g = (pixel >>> 8) & 0xFF;
                    const b = pixel & 0xFF;

                    const j = i * 4;
                    out[j + 0] = r;
                    out[j + 1] = g;
                    out[j + 2] = b;
                    out[j + 3] = a;
                }
                return out;
                }

                // Convert all frames safely:
                const frames8 = frames32.map(convertFrameRGBA);

                // const outFileRGBA = new Uint8Array(outFile.buffer);
                const blobVideo = await createVideoFromFrames(frames8, width, height, 30);
                const url = URL.createObjectURL(blobVideo);
                const video = document.createElement("video");
                video.src = url;
                video.controls = true;
                document.body.appendChild(video);

                // const output = decodeFileAllBlocks(dataArray, LUT);
                // console.log("output: \n", outBuffer.toHex())
                // FlmData = output.toHex();

                // let newFile = new Blob([result['list'].join('\n')], {type: "text/plain", endings: 'native'});

                // await delay(250); // reduces Layout shifting in short time
                // const pck = await pckTask;
                // setPckFile(pck);
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
                {FlmDecoder}
            </Typography>
            <Stack gap="16px">
                <ParseFailedError failed={parseFailed} />
                <AboutCard onFileChanged={handleFileChanged} disableSelection={isParsing} />
                {/* <PckHeaderInfo file={pckFile} selectedFile={selectedFile} isLoading={isParsing} /> */}
                <FlmData data={flmData} />
            </Stack>
        </MainLayout>
    );
};

export default PageFlmDecoder;

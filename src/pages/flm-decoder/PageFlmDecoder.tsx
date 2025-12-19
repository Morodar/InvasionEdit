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
import { decodeFileAllBlocks } from "../../domain/sam/SamUtils";
import { coeffs } from "../../domain/sam/AudioCoeffs";
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
                const content: ArrayBuffer = await file.arrayBuffer();
                const fileArray =new Uint32Array(content);

                const width = fileArray[0xb0/4];
                const height = fileArray[0xb4/4];
                const frames = fileArray[0xb8/4];
                const flmDataLength = fileArray[0xc0/4];
                const samFileLength = fileArray[0xc4/4];
                const fps = fileArray[0xfc/4];

                const outBuffer = new Uint32Array(height * width);
                const dataArray =new Uint8Array(content, 0x200, flmDataLength);
                const lookupTable = LUT;
                let offset = 0;
                const outFile = new Uint32Array(outBuffer.byteLength/4 * frames);

                for(let i=0; i < frames; i++){
                    offset += decodeFLMvideo(height, width, outBuffer, dataArray, lookupTable, offset);
                    outFile.set(outBuffer, i * outBuffer.length);
                }
                const blob = new Blob([outFile], { type: "text/plain" });
                saveAs(blob, file.name + ".raw");


                //Does file have audio? Parse it too
                if(samFileLength > 0){
                    const audioDataOffset = 0x200 + flmDataLength + 0x200;//0x200 from flm header + flm data + 0x200 from audio header
                    const audioDataLength = samFileLength - 0x200;
                    const audioDataArray = new Uint8Array(content, audioDataOffset, audioDataLength);

                    const output = decodeFileAllBlocks(audioDataArray, coeffs);
                    const blob = new Blob([output], { type: "text/plain" });
                    saveAs(blob, file.name + ".pcm");
                }
                
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

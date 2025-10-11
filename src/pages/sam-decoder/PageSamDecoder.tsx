import { useTranslation } from "react-i18next";
import { MainLayout } from "../../layout/MainLayout";
import { Stack, Typography } from "@mui/material";
import { useState } from "react";
import { PckFile } from "../../domain/pck/PckFile";
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
    const { t } = useTranslation();
    const samDecoder = "SAM Decoder Title";
    usePageTitle(samDecoder);

    const [selectedFile, setSelectedFile] = useState<File>();
    const [pckFile, setPckFile] = useState<PckFile>();
    const [parseFailed, setParseFailed] = useState(false);
    const [isParsing, setIsParsing] = useState(false);


    const test = new Uint8Array(10);
    // const samData = FUN_00418560(test);
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
                const fileArray =new Uint8Array(content);
                // const coeffs =new Uint8Array(content);
                // const offset = 0x200;
                const dataArray =new Uint8Array(content, 0x200, content.byteLength - 0x200);

                const output = decodeFileAllBlocks(dataArray, coeffs);
                console.log("output: \n", output.toHex())
                // samData = output.toHex();

                // let newFile = new Blob([result['list'].join('\n')], {type: "text/plain", endings: 'native'});
                const blob = new Blob([output], { type: "text/plain" });
                saveAs(blob, file.name + ".pcm");

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
                {samDecoder}
            </Typography>
            <Stack gap="16px">
                <ParseFailedError failed={parseFailed} />
                <AboutCard onFileChanged={handleFileChanged} disableSelection={isParsing} />
                {/* <PckHeaderInfo file={pckFile} selectedFile={selectedFile} isLoading={isParsing} /> */}
                <SamData data={samData} />
            </Stack>
        </MainLayout>
    );
};

export default PageSamDecoder;

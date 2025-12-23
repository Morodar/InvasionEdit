import { Card, CardContent, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

const VIDEO_COMMAND = "ffmpeg -i {inputVideoFile} -i {inputAudioFile} -c:v copy -c:a aac {outputFile}";

export const AudioFFmpegCard = () => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardContent>
                <p>{t("flm-extractor.description.audio")}</p>
                <Paper style={{ padding: "8px" }} variant="outlined" elevation={0}>
                    <code>{VIDEO_COMMAND}</code>
                </Paper>
            </CardContent>
        </Card>
    );
};

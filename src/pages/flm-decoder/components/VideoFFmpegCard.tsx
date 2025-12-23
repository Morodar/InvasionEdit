import { Card, CardContent, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

const VIDEO_COMMAND = "ffmpeg -f rawvideo -pix_fmt bgra -s 512x288 -r {fps} -i {inputFile} -c:v libx264 {outputFile}";

export const VideoFFmpegCard = () => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardContent>
                <p>{t("flm-extractor.description-video")}</p>
                <Paper style={{ padding: "8px" }} variant="outlined" elevation={0}>
                    <code>{VIDEO_COMMAND}</code>
                </Paper>
            </CardContent>
        </Card>
    );
};

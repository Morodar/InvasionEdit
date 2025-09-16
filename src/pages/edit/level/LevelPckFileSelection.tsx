import { PropsWithChildren, useState } from "react";
import { useEditLevelContext } from "./EditLevelContext";
import { LevelPckParser } from "../../../domain/pck/level/LevelPckParser";
import { useTranslation } from "react-i18next";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { usePageTitle } from "../../../common/utils/usePageTitle";
import { H2 } from "../../../common/header/Headers";
import { SelectFileButton } from "../../../common/input/SelectFileButton";

export const LevelPckFileSelection = (props: PropsWithChildren) => {
    const { levelPck, setLevelPck } = useEditLevelContext();
    const { t } = useTranslation();
    const title = t("lvl-editor.title");
    usePageTitle(title);

    const [, setParseError] = useState<string>();
    const [isParsing, setIsParsing] = useState(false);

    const parsePckFile = (file?: File) => {
        if (!file) {
            return;
        }
        setIsParsing(true);
        LevelPckParser.parseLevelPck(file)
            .then((level) => setLevelPck(level))
            .catch((e) => {
                console.debug(e);
                setParseError("failed to parse file");
            })
            .finally(() => setIsParsing(false));
    };

    if (levelPck) {
        return props.children;
    }

    return (
        <>
            <Typography variant="h4" component="h2" display="block" gutterBottom>
                {title}
            </Typography>
            <Stack gap="16px">
                <Card>
                    <CardContent>
                        <H2 variant="h5">{t("lvl-editor.select-file")}</H2>
                        <span>
                            Choose your existing <em>level.pck</em> or <em>level00.pck</em> to get started.
                        </span>
                        <Stack direction="row" justifyContent="end">
                            <SelectFileButton onFileChanged={parsePckFile} accept=".pck" disabled={isParsing}>
                                Select
                            </SelectFileButton>
                        </Stack>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <H2 variant="h5">Create New Level File</H2>
                        <span>This feature is not available yet.</span>
                    </CardContent>
                </Card>
            </Stack>
        </>
    );
};

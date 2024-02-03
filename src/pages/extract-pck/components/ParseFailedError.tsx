import { Alert } from "@mui/material";

interface ParseFailedErrorProps {
    failed: boolean;
}

export const ParseFailedError = (props: ParseFailedErrorProps) => {
    const { failed } = props;

    if (!failed) {
        return <></>;
    }

    return <Alert severity="warning">An unknown error occured while reading the PCK file.</Alert>;
};

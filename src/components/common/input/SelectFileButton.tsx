import { Button, styled } from "@mui/material";
import { PropsWithChildren } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export interface SelectFileButtonProps extends PropsWithChildren {
    onFileChanged: (file?: File) => void;
}

export const SelectFileButton = (props: SelectFileButtonProps) => {
    const { onFileChanged, children } = props;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files ?? [];
        if (fileList.length === 1) {
            const file = fileList[0];
            onFileChanged(file);
        }
    };

    return (
        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
            <VisuallyHiddenInput multiple={false} type="file" accept=".fld" onChange={handleFileChange} />
            {children}
        </Button>
    );
};

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

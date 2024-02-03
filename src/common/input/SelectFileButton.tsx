import { Button, styled } from "@mui/material";
import { PropsWithChildren } from "react";
import FileUploadIcon from "@mui/icons-material/fileUpload";

export interface SelectFileButtonProps extends PropsWithChildren {
    onFileChanged: (file?: File) => void;
    disabled?: boolean;
    accept: string;
}

export const SelectFileButton = (props: SelectFileButtonProps) => {
    const { onFileChanged, children, accept, disabled } = props;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files ?? [];
        if (fileList.length === 1) {
            const file = fileList[0];
            onFileChanged(file);
        }
    };

    return (
        <Button component="label" variant="contained" startIcon={<FileUploadIcon />} disabled={disabled}>
            <VisuallyHiddenInput multiple={false} type="file" accept={accept} onChange={handleFileChange} />
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

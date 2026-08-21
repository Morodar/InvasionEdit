import { Button, styled } from "@mui/material";
import { PropsWithChildren } from "react";
import FileUploadIcon from "@mui/icons-material/FileUpload";

export interface SelectFileButtonProps extends PropsWithChildren {
  onFileChanged: (file?: File) => void;
  /** When provided together with multiple, receives every selected file instead. */
  onFilesChanged?: (files: File[]) => void;
  disabled?: boolean;
  accept: string;
  multiple?: boolean;
}

export const SelectFileButton = (props: SelectFileButtonProps) => {
  const { onFileChanged, onFilesChanged, children, accept, disabled, multiple } = props;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files ?? [];
    if (fileList.length === 0) {
      return;
    }
    if (multiple && onFilesChanged) {
      onFilesChanged(Array.from(fileList));
      return;
    }
    onFileChanged(fileList[0]);
  };

  return (
    <Button
      component="label"
      variant="contained"
      startIcon={<FileUploadIcon />}
      disabled={disabled}
    >
      <VisuallyHiddenInput
        multiple={multiple ?? false}
        type="file"
        accept={accept}
        onChange={handleFileChange}
      />
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

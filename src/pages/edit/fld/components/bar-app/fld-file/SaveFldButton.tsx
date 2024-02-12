import saveAs from "file-saver";
import { useFldMapContext } from "../../../context/FldMapContext";
import { saveFldFile } from "../../../../../../domain/fld/saveFldFile";
import { IconButton, Tooltip } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useTranslation } from "react-i18next";

export const SaveFldButton = () => {
    const { t } = useTranslation();
    const { fldFile } = useFldMapContext();

    const downloadFile = () => {
        if (fldFile) {
            const file: File = saveFldFile(fldFile);
            const blob = new Blob([file], { type: file.type });
            saveAs(blob, file.name);
        }
    };

    return (
        <IconButton disabled={!fldFile} onClick={downloadFile}>
            <Tooltip title={t("fld-editor.save-fld")}>
                <SaveIcon />
            </Tooltip>
        </IconButton>
    );
};

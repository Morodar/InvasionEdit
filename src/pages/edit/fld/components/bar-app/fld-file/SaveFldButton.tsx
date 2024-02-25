import saveAs from "file-saver";
import { useFldMapContext } from "../../../context/FldMapContext";
import { IconButton, Tooltip } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useTranslation } from "react-i18next";
import { FldUtils } from "../../../../../../domain/fld/FldUtils";

export const SaveFldButton = () => {
    const { t } = useTranslation();
    const { fldFile } = useFldMapContext();

    const downloadFile = () => {
        if (fldFile) {
            const file: File = FldUtils.buildFldFile(fldFile);
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

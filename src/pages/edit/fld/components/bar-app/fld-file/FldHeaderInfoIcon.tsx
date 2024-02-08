import { useTranslation } from "react-i18next";
import { FldFile } from "../../../../../../domain/fld/FldFile";
import { IconButton, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useState } from "react";
import { FldHeaderDialog } from "./FldHeaderDialog";

interface FldHeaderInfoIconProps {
    fldFile?: FldFile;
}

export const FldHeaderInfoIcon = (props: FldHeaderInfoIconProps) => {
    const { t } = useTranslation();
    const { fldFile } = props;

    const [showDialog, setShowDialog] = useState(false);
    const onShowDialog = () => setShowDialog(true);
    const onHideDialog = () => setShowDialog(false);

    if (!fldFile) {
        return <></>;
    }

    return (
        <>
            <Tooltip title={t("fld-editor.debug.settings")}>
                <IconButton onClick={onShowDialog}>
                    <InfoIcon />
                </IconButton>
            </Tooltip>
            <FldHeaderDialog open={showDialog} fldFile={fldFile} onClose={onHideDialog} />
        </>
    );
};

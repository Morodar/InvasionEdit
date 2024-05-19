import { useFldMapContext } from "../FldMapContext";
import { FldHeaderInfoIcon } from "./FldHeaderInfoIcon";

export const FldName = () => {
    const { fldFile } = useFldMapContext();

    if (!fldFile) {
        return <></>;
    }

    return (
        <small>
            {fldFile.name} ({fldFile.height}x{fldFile.width})
            <FldHeaderInfoIcon fldFile={fldFile} />
        </small>
    );
};

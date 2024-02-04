import { useFldMapContext } from "../../context/FldMapContext";

export const FldName = () => {
    const { fldFile } = useFldMapContext();

    if (!fldFile) {
        return <></>;
    }

    return (
        <small>
            {fldFile.name} ({fldFile.height}x{fldFile.width})
        </small>
    );
};

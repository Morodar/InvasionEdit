import { useFldMapContext } from "../../context/useFldMapContext";

export const FldName = () => {
    const { fldFile } = useFldMapContext();

    if (!fldFile) {
        return <></>;
    }

    return <small>{fldFile.name}</small>;
};

import { useEffect } from "react";
import { useFldMapContext } from "../context/FldMapContext";
export const useInitFld = () => {
    const { tryUseFldFile, fldFile } = useFldMapContext();
    useEffect(() => {
        if (fldFile) {
            return;
        }

        const fetchFld = async () => {
            try {
                const response = await fetch("fld/lucas03.fld");
                if (response.ok) {
                    const blob = await response.blob();
                    const file = new File([blob], "lucas03.fld", { type: blob.type });
                    tryUseFldFile(file);
                }
            } catch (Error) {
                console.log("failed to load lucas03.fld");
            }
        };

        // can't use await in useEffect
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchFld();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};

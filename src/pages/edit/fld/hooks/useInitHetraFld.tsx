import { useEffect } from "react";
import { useFldMapContext } from "../context/FldMapContext";
export const useInitHetraFld = () => {
    const { tryUseFldFile, fldFile } = useFldMapContext();
    useEffect(() => {
        if (fldFile) {
            return;
        }

        const fetchFld = async () => {
            try {
                const response = await fetch("fld/hetra.fld");
                if (response.ok) {
                    const blob = await response.blob();
                    const file = new File([blob], "hetra.fld", { type: blob.type });
                    tryUseFldFile(file);
                }
            } catch (Error) {
                console.log("failed to load hetra.fld");
            }
        };

        // can't use await in useEffect
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchFld();
    }, []);
};

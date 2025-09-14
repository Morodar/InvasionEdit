import { useEffect } from "react";
import { useFldMapContext } from "../../../domain/fld/FldMapContext";
export const useInitFld = () => {
    const { tryUseFldFile } = useFldMapContext();
    useEffect(() => {
        fetch("fld/lucas03.fld")
            .then((result) => {
                if (result.ok) {
                    result
                        .blob()
                        .then((blob) => {
                            const file = new File([blob], "lucas03.fld", { type: blob.type });
                            tryUseFldFile(file);
                        })
                        .catch(() => console.error("failed to parse fld file"));
                }
            })
            .catch(() => console.error("failed to download initial map"));
    }, [tryUseFldFile]);
};

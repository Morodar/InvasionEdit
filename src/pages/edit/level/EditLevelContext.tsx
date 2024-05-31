/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useContext, useMemo, useState } from "react";
import { LevelPck } from "../../../domain/pck/level/LevelPck";
import { LayerViewContextProvider } from "../../../domain/fld/layers/LayerViewContext";
import { DebugSettingsContextProvider } from "../../../common/debug/DebugSettingsContext";
import { CursorContextProvider } from "../../../common/controls/CursorContext";
import { FldMapContextProvider } from "../../../domain/fld/FldMapContext";
import { FldPrimaryActionContextProvider } from "../../../domain/fld/action-bar/FldPrimaryActionContext";
import { GenericActionContextProvider } from "../../../domain/fld/generic/GenericActionContext";
import { LandscapeActionContextProvider } from "../../../domain/fld/landsacpe/LandscapeActionContext";
import { ResourceActionContextProvider } from "../../../domain/fld/resource/ResourceActionContext";
import { WaterActionContextProvider } from "../../../domain/fld/water/WaterActionContext";
import { LevelPckSelectionContextProvider } from "../../../domain/pck/level/LevelPckSelectionContext";

export interface EditLevelContextProps {
    levelPck?: LevelPck;
    setLevelPck: React.Dispatch<LevelPck | undefined>;
}

export const EditLevelContext = createContext<EditLevelContextProps | undefined>(undefined);

export const useEditLevelContext = (): EditLevelContextProps => {
    const context = useContext(EditLevelContext);
    if (!context) {
        throw new Error("EditLevelContext not initialized");
    }
    return context;
};

export const EditLevelContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [levelPck, setLevelPck] = useState<LevelPck>();

    const value: EditLevelContextProps = useMemo(() => ({ setLevelPck, levelPck }), [levelPck]);

    return (
        <EditLevelContext.Provider value={value}>
            <LayerViewContextProvider>
                <DebugSettingsContextProvider>
                    <CursorContextProvider>
                        <FldPrimaryActionContextProvider>
                            <LandscapeActionContextProvider>
                                <ResourceActionContextProvider>
                                    <WaterActionContextProvider>
                                        <GenericActionContextProvider>
                                            <FldMapContextProvider>
                                                <LevelPckSelectionContextProvider>
                                                    {children}
                                                </LevelPckSelectionContextProvider>
                                            </FldMapContextProvider>
                                        </GenericActionContextProvider>
                                    </WaterActionContextProvider>
                                </ResourceActionContextProvider>
                            </LandscapeActionContextProvider>
                        </FldPrimaryActionContextProvider>
                    </CursorContextProvider>
                </DebugSettingsContextProvider>
            </LayerViewContextProvider>
        </EditLevelContext.Provider>
    );
};

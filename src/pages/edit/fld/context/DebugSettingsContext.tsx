/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DebugSettings, DebugSettingsService } from "../../../../services/DebugSettingsService";

export interface DebugSettingsContextProps {
    // state
    debugSettings: DebugSettings;
    // functions
    setShowDebugCube: (value: boolean) => void;
    setShowDebugCube3x3: (value: boolean) => void;
    showDebugCursorPosition: (value: boolean) => void;
}
export const DebugSettingsContext = createContext<DebugSettingsContextProps | undefined>(undefined);

export const useDebugSettingsContext = (): DebugSettingsContextProps => {
    const context = useContext(DebugSettingsContext);
    if (!context) {
        throw new Error("DebugSettingsContext not initialized");
    }
    return context;
};

const service = new DebugSettingsService();

export const DebugSettingsContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const isFirstRender = useRef(true);
    const [settings, setSettings] = useState<DebugSettings>(initSettings());

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        service.saveSettings(settings);
    }, [settings]);

    const setShowDebugCube = (value: boolean) => setSettings((old) => ({ ...old, showDebugCube: value }));
    const setShowDebugCube3x3 = (value: boolean) => setSettings((old) => ({ ...old, showDebugCube3x3: value }));

    const showDebugCursorPosition = (value: boolean) =>
        setSettings((old) => ({ ...old, showDebugCursorPosition: value }));

    const contextValue: DebugSettingsContextProps = useMemo(
        () => ({
            debugSettings: settings,
            setShowDebugCube,
            setShowDebugCube3x3,
            showDebugCursorPosition,
        }),
        [settings],
    );

    return <DebugSettingsContext.Provider value={contextValue}>{children}</DebugSettingsContext.Provider>;
};

const initSettings = () => {
    console.log("init settings");
    return service.loadSettings();
};

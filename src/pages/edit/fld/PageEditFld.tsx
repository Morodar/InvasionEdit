import { MapView } from "./components/map-view/MapView";
import { MainLayout } from "../../../layout/MainLayout";
import { ChooseFldButton } from "./components/bar-app/choose-fld/ChooseFldButton";
import { FldName } from "./components/bar-app/fld-file/FldName";
import { usePageTitle } from "../../../common/utils/usePageTitle";
import { useTranslation } from "react-i18next";
import { FldMapContextProvider } from "./context/FldMapContext";
import { CursorContexProvider } from "./context/CursorContext";
import { DebugSettingsContextProvider } from "./context/DebugSettingsContext";
import { DebugSettingsButton } from "./components/bar-app/debug-settings/DebugSettingsButton";

const PageEditFld = (): React.JSX.Element => {
    const { t } = useTranslation();
    const fldEditor = t("fld-editor.title");
    usePageTitle(fldEditor);

    return (
        <FldMapContextProvider>
            <DebugSettingsContextProvider>
                <CursorContexProvider>
                    <MainLayout
                        withPadding={false}
                        centerElements={<FldName />}
                        rightSideElements={<RightSideElements />}
                    >
                        <MapView />
                    </MainLayout>
                </CursorContexProvider>
            </DebugSettingsContextProvider>
        </FldMapContextProvider>
    );
};
export default PageEditFld;

const RightSideElements = () => {
    return (
        <>
            <DebugSettingsButton />
            <ChooseFldButton />
        </>
    );
};

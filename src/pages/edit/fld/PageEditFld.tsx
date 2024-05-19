import { MapView } from "./MapView";
import { MainLayout } from "../../../layout/MainLayout";
import { ChooseFldButton } from "../../../domain/fld/file/ChooseFldButton";
import { FldName } from "../../../domain/fld/file/FldName";
import { usePageTitle } from "../../../common/utils/usePageTitle";
import { useTranslation } from "react-i18next";
import { FldMapContextProvider } from "../../../domain/fld/FldMapContext";
import { CursorContextProvider } from "../../../common/controls/CursorContext";
import { DebugSettingsContextProvider } from "../../../common/debug/DebugSettingsContext";
import { DebugSettingsButton } from "../../../common/debug/DebugSettingsButton";
import { FldPrimaryActionContextProvider } from "../../../domain/fld/action-bar/FldPrimaryActionContext";
import { ResourceActionContextProvider } from "../../../domain/fld/resource/ResourceActionContext";
import { SaveFldButton } from "../../../domain/fld/file/SaveFldButton";
import { LandscapeActionContextProvider } from "../../../domain/fld/landsacpe/LandscapeActionContext";
import { LayerViewContextProvider } from "../../../domain/fld/layers/LayerViewContext";
import { GenericActionContextProvider } from "../../../domain/fld/generic/GenericActionContext";
import { WaterActionContextProvider } from "../../../domain/fld/water/WaterActionContext";

const PageEditFld = (): React.JSX.Element => {
    const { t } = useTranslation();
    const fldEditor = t("fld-editor.title");
    usePageTitle(fldEditor);

    return (
        <LayerViewContextProvider>
            <DebugSettingsContextProvider>
                <CursorContextProvider>
                    <FldPrimaryActionContextProvider>
                        <LandscapeActionContextProvider>
                            <ResourceActionContextProvider>
                                <WaterActionContextProvider>
                                    <GenericActionContextProvider>
                                        <FldMapContextProvider>
                                            <MainLayout
                                                withPadding={false}
                                                centerElements={<FldName />}
                                                rightSideElements={<RightSideElements />}
                                            >
                                                <MapView />
                                            </MainLayout>
                                        </FldMapContextProvider>
                                    </GenericActionContextProvider>
                                </WaterActionContextProvider>
                            </ResourceActionContextProvider>
                        </LandscapeActionContextProvider>
                    </FldPrimaryActionContextProvider>
                </CursorContextProvider>
            </DebugSettingsContextProvider>
        </LayerViewContextProvider>
    );
};
export default PageEditFld;

const RightSideElements = () => {
    return (
        <>
            <DebugSettingsButton />
            <ChooseFldButton />
            <SaveFldButton />
        </>
    );
};

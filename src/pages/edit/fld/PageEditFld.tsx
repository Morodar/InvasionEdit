import { MapView } from "./components/map-view/MapView";
import { FldMapContextProvider } from "./context/FldMapContextProvider";
import { MainLayout } from "../../../layout/MainLayout";
import { ChooseFldButton } from "./components/choose-fld/ChooseFldButton";
import { FldName } from "./components/app-bar/FldName";
import { usePageTitle } from "../../../common/utils/usePageTitle";
import { useTranslation } from "react-i18next";

const PageEditFld = (): React.JSX.Element => {
    const { t } = useTranslation();
    const fldEditor = t("fld-editor");
    usePageTitle(fldEditor);

    return (
        <FldMapContextProvider>
            <MainLayout withPadding={false} centerElements={<FldName />} rightSideElements={<ChooseFldButton />}>
                <MapView />
            </MainLayout>
        </FldMapContextProvider>
    );
};
export default PageEditFld;

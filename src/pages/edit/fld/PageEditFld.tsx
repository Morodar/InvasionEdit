import { MapView } from "./components/map-view/MapView";
import { FldMapContextProvider } from "./context/FldMapContextProvider";
import { MainLayout } from "../../../layout/MainLayout";
import { ChooseFldButton } from "./components/choose-fld/ChooseFldButton";
import { FldName } from "./components/app-bar/FldName";

const PageEditFld = (): React.JSX.Element => {
    return (
        <FldMapContextProvider>
            <MainLayout withPadding={false} centerElements={<FldName />} rightSideElements={<ChooseFldButton />}>
                <MapView />
            </MainLayout>
        </FldMapContextProvider>
    );
};
export default PageEditFld;

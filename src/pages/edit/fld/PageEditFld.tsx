import { MapView } from "./components/map-view/MapView";
import { FldMapContextProvider } from "./context/FldMapContextProvider";
import { MainLayout } from "../../../layout/MainLayout";
import { ChooseFldButton } from "./components/choose-fld/ChooseFldButton";

const PageEditFld = (): React.JSX.Element => {
    return (
        <FldMapContextProvider>
            <MainLayout withPadding={false} rightSideElements={<ChooseFldButton />}>
                <MapView />
            </MainLayout>
        </FldMapContextProvider>
    );
};
export default PageEditFld;

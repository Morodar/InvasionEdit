import { MainMenuBar } from "./components/main-menu/MainMenuBar";
import { MapView } from "./components/map-view/MapView";
import { FldMapContextProvider } from "../../../context/fld/FldMapContextProvider";

const PageEditFld = (): React.JSX.Element => {
    return (
        <FldMapContextProvider>
            <MainMenuBar />
            <MapView />
        </FldMapContextProvider>
    );
};
export default PageEditFld;

import { ThemeProvider, createTheme } from "@mui/material";
import { MapView } from "./map-view/MapView";
import { MainMenuBar } from "./main-menu/MainMenuBar";
import { FldMapContextProvider } from "../context/fld/FldMapContext";

const darkTheme = createTheme({ palette: { mode: "dark" } });

export const App = () => (
    <ThemeProvider theme={darkTheme}>
        <FldMapContextProvider>
            <MainMenuBar />
            <MapView />
        </FldMapContextProvider>
    </ThemeProvider>
);

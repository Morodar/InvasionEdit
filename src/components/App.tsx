import { ThemeProvider, createTheme } from "@mui/material";
import { MapView } from "./map-view/MapView";
import { MainMenuBar } from "./main-menu/MainMenuBar";
import { FldMapContextProvider } from "../context/fld/FldMapContextProvider";
import { Suspense } from "react";

const darkTheme = createTheme({ palette: { mode: "dark" } });

export const App = () => (
    <Suspense fallback="loading">
        <ThemeProvider theme={darkTheme}>
            <FldMapContextProvider>
                <MainMenuBar />
                <MapView />
            </FldMapContextProvider>
        </ThemeProvider>
    </Suspense>
);

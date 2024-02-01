import { Box, LinearProgress, ThemeProvider, createTheme } from "@mui/material";
import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageHome from "../pages/home/PageHome";

const PageEditFld = lazy(() => import("../pages/edit/fld/PageEditFld"));
const darkTheme = createTheme({ palette: { mode: "dark" } });
const baseDir = import.meta.env.BASE_DIR as string;

export const PROJECT_URL = "https://github.com/Morodar/InvasionEdit";
export const HOME = "/home";
export const EDIT_FLD = "/edit/fld";

export const AppRoutes = () => (
    <ThemeProvider theme={darkTheme}>
        <Router basename={baseDir}>
            <Suspense fallback={<LoadingBar />}>
                <Routes>
                    <Route path={EDIT_FLD} element={<PageEditFld />} />
                    <Route path={HOME} element={<PageHome />} />
                    <Route path="*" element={<Navigate to={HOME} />} />
                </Routes>
            </Suspense>
        </Router>
    </ThemeProvider>
);

const LoadingBar = () => {
    return (
        <Box sx={{ width: "100%" }} component="div">
            <LinearProgress />
        </Box>
    );
};

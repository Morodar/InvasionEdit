import { ThemeProvider, createTheme } from "@mui/material";
import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageHome from "../pages/home/PageHome";

const PageEditFld = lazy(() => import("../pages/edit/fld/PageEditFld"));
const darkTheme = createTheme({ palette: { mode: "dark" } });
const baseDir = import.meta.env.BASE_DIR as string;

export const EDIT_FLD = "/edit/fld";

export const AppRoutes = () => (
    <ThemeProvider theme={darkTheme}>
        <Router basename={baseDir}>
            <Suspense fallback="loading">
                <Routes>
                    <Route path={EDIT_FLD} element={<PageEditFld />} />
                    <Route path="/home" element={<PageHome />} />
                    <Route path="*" element={<Navigate to="/home" />} />
                </Routes>
            </Suspense>
        </Router>
    </ThemeProvider>
);

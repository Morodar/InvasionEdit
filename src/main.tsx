import React from "react";
import ReactDOM from "react-dom/client";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { setupI18n } from "./conf/i18n.ts";
import { AppRoutes } from "./conf/AppRoutes.tsx";
import "./domain/constants/Colors.css";

void setupI18n();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AppRoutes />
    </React.StrictMode>,
);

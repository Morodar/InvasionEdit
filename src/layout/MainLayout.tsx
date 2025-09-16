import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { PropsWithChildren, ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { HOME } from "../conf/AppRoutes";
import "./MainLayout.css";
import { ProjectIconButton } from "../common/icon-buttons/ProjectIconButton";
import packageJson from "../../package.json";

interface MainLayoutProps extends PropsWithChildren {
    withPadding?: boolean;
    centerElements?: ReactElement;
    rightSideElements?: ReactElement;
}

export const MainLayout = ({ withPadding = true, centerElements, rightSideElements, children }: MainLayoutProps) => {
    const { t } = useTranslation();
    const withPaddingClass = withPadding ? "with-padding" : "";
    const version = packageJson.version;

    return (
        <Typography component="div" className="main-layout">
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="h1" mr={2}>
                        <Link to={HOME} className="link-no-decoration">
                            {t("common.app_name")}
                        </Link>
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} component="div" />
                    <div>{centerElements}</div>
                    <Box sx={{ flexGrow: 1 }} component="div" />
                    <div>
                        {rightSideElements}
                        <ProjectIconButton />
                        <small className="version">{version}</small>
                    </div>
                </Toolbar>
            </AppBar>
            <main className={withPaddingClass}>
                <div>{children}</div>
            </main>
        </Typography>
    );
};

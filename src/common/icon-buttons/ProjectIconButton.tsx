import { IconButton, Tooltip } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { PROJECT_URL } from "../../conf/AppRoutes";

export const ProjectIconButton = () => {
    return (
        <Tooltip title={"GitHub Repository"}>
            <a href={PROJECT_URL} target="_blank" rel="noreferrer">
                <IconButton>
                    <GitHubIcon />
                </IconButton>
            </a>
        </Tooltip>
    );
};

import { IconButton, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/House";
import { HOME } from "../../conf/AppRoutes";

export const HomeIconButton = () => {
    return (
        <Tooltip title={"Home"}>
            <IconButton component={Link} to={HOME}>
                <HomeIcon />
            </IconButton>
        </Tooltip>
    );
};

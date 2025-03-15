import { PropsWithChildren, ReactElement } from "react";
import "./RightSideContainer.css";
import { combineClassNames } from "../common/utils/classNameUtils";

interface RightSideContainerProps extends PropsWithChildren {
    verticalCenter?: boolean;
}

export const RightSideContainer = ({ verticalCenter, children }: RightSideContainerProps): ReactElement => {
    const className = combineClassNames("right-side-container", verticalCenter ? "vertical-center" : "");
    return <div className={className}>{children}</div>;
};

import { Typography } from "@mui/material";
import { PropsWithChildren } from "react";

export type Headers = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type Variants = Headers | "subtitle1" | "subtitle2";

interface HeaderProps extends SpecificHeaderProps {
    component: Headers;
}

interface SpecificHeaderProps extends PropsWithChildren {
    variant?: Variants;
}

export const Header = (props: HeaderProps) => {
    return (
        <Typography variant={props.variant} component={props.component} gutterBottom>
            {props.children}
        </Typography>
    );
};

export const H1 = (props: SpecificHeaderProps) => (
    <Header component="h1" variant={props.variant}>
        {props.children}
    </Header>
);

export const H2 = (props: SpecificHeaderProps) => (
    <Header component="h2" variant={props.variant}>
        {props.children}
    </Header>
);

export const H3 = (props: SpecificHeaderProps) => (
    <Header component="h3" variant={props.variant}>
        {props.children}
    </Header>
);

export const H4 = (props: SpecificHeaderProps) => (
    <Header component="h4" variant={props.variant}>
        {props.children}
    </Header>
);

export const H5 = (props: SpecificHeaderProps) => (
    <Header component="h5" variant={props.variant}>
        {props.children}
    </Header>
);

export const H6 = (props: SpecificHeaderProps) => (
    <Header component="h6" variant={props.variant}>
        {props.children}
    </Header>
);

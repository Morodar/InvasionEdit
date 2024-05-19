import { Card, CardMedia, CardContent, Typography, CardActions, Button } from "@mui/material";
import { Link } from "react-router-dom";

interface HomeCardProps {
    description: string;
    imgUrl: string;
    linkText: string;
    linkDest: string;
    title: string;
}

export const HomeCard = ({ description, imgUrl, linkDest, linkText, title }: HomeCardProps) => {
    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardMedia component="img" height="140" image={imgUrl} />
            <CardContent>
                <Typography gutterBottom variant="h5" component="h3">
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" component={Link} to={linkDest}>
                    {linkText}
                </Button>
            </CardActions>
        </Card>
    );
};

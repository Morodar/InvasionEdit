import { SelectFileButton } from "../../../common/input/SelectFileButton";
import { Card, CardContent, Stack } from "@mui/material";

interface AboutCardProps {
    onFileChanged: (file?: File) => void;
    disableSelection: boolean;
}

export const AboutCard = (props: AboutCardProps) => {
    const { onFileChanged, disableSelection } = props;
    return (
        <Card>
            <CardContent>
                <p>{"Sam decoder description"}</p>

                <Stack direction="row" justifyContent="end">
                    <SelectFileButton onFileChanged={onFileChanged} accept=".sam" disabled={disableSelection}>
                        {"SAM decoder button text"}
                    </SelectFileButton>
                </Stack>
            </CardContent>
        </Card>
    );
};

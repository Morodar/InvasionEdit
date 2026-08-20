import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import { StrLocaleBlock } from "../../../domain/str/StrFile";

interface StrStringTableProps {
    block: StrLocaleBlock;
}

export const StrStringTable = (props: StrStringTableProps) => {
    const { block } = props;
    const { t } = useTranslation();

    return (
        <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>{t("str-parser.string-index")}</TableCell>
                        <TableCell>{t("str-parser.string-content")}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {block.strings.map((str, index) => (
                        <TableRow key={index}>
                            <TableCell>{index}</TableCell>
                            <TableCell sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                {str}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

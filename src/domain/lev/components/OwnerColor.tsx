import { Owner } from "../../constants/Owner";
import { OwnerColors } from "../constants/OwnerColors";

interface OwnerColorProps {
    owner: Owner;
}
export const OwnerColor = ({ owner }: OwnerColorProps) => {
    const color = OwnerColors[owner];

    return <div style={{ width: "16px", height: "16px", backgroundColor: color }}></div>;
};

import { C } from "../../constants/Colors";
import { Owner } from "../../constants/Owner";

export const OwnerColors: Record<Owner, string> = {
    [Owner.Neutral]: C.NEUTRAL,
    [Owner.Ares]: C.ARES,
    [Owner.Thorgon]: C.THORGON,
    [Owner.Devoken]: C.DEVOKEN,
    [Owner.Illurer]: C.ILLURER,
    [Owner.Albor]: C.ALBOR,
    [Owner.Urdoner]: C.URDONER,
    [Owner.Alderaden]: C.ALDERADEN,
    [Owner.Golrathen]: C.GOLRATHEN,
};

export function determineColor(owner: Owner, isSelected = false, isHovering = false): string {
    const ownerColor = OwnerColors[owner];
    if (isSelected) {
        return C.SELECTED;
    }
    if (isHovering) {
        return C.HOVERING;
    }
    return ownerColor;
}

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

export const OwnerPreviewColors: Record<Owner, string> = {
    [Owner.Neutral]: C.NEUTRAL_PREVIEW,
    [Owner.Ares]: C.ARES_PREVIEW,
    [Owner.Thorgon]: C.THORGON_PREVIEW,
    [Owner.Devoken]: C.DEVOKEN_PREVIEW,
    [Owner.Illurer]: C.ILLURER_PREVIEW,
    [Owner.Albor]: C.ALBOR_PREVIEW,
    [Owner.Urdoner]: C.URDONER_PREVIEW,
    [Owner.Alderaden]: C.ALDERADEN_PREVIEW,
    [Owner.Golrathen]: C.GOLRATHEN_PREVIEW,
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

export function determinePreviewColor(owner: Owner): string {
    return OwnerPreviewColors[owner];
}

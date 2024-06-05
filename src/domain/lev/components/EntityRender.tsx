import { ReactElement, useState } from "react";
import { useLevContext } from "../LevContext";
import { LevEntity } from "../LevEntity";
import { OwnerColors } from "../constants/OwnerColors";
import { useFldMapContext } from "../../fld/FldMapContext";
import { Layer } from "../../fld/layers/Layer";
import { useSelectedEntityContext } from "../entities/SelectedEntityContext";

export const EntityRender = () => {
    const { levFile } = useLevContext();
    const { fldFile } = useFldMapContext();

    if (!levFile || !fldFile) {
        return <></>;
    }
    const { width, height } = fldFile;
    const lanscapeMap = fldFile.layers[Layer.Landscape];

    return levFile.entities.map((e) => (
        <EntityObject
            key={`${e.type}-${e.owner}-${e.x}-${e.z}-${e.rotation}`}
            entity={e}
            mapWidth={width}
            mapHeight={height}
            lanscapeMap={lanscapeMap}
        />
    ));
};

interface EntityObjectProps {
    entity: LevEntity;
    mapHeight: number;
    mapWidth: number;
    lanscapeMap: DataView;
}

export const EntityObject = ({ entity, mapWidth, mapHeight, lanscapeMap }: EntityObjectProps): ReactElement => {
    const { selectedEntity, setSelectedEntity } = useSelectedEntityContext();
    const isSelected = entity === selectedEntity;
    const [isHovering, setIsHovering] = useState(false);
    const handleClick = () => {
        setSelectedEntity((prev: LevEntity | undefined) => {
            if (prev !== entity) {
                return entity;
            }
            return undefined;
        });
    };

    const x = mapHeight - -entity.z / 1999;
    const z = (entity.x - (mapHeight - x) * 1152) / 2305;
    const index = Math.floor(mapHeight - x) * mapWidth + Math.floor(z);
    const height = lanscapeMap.getUint8(index);

    const ownerColor = OwnerColors[entity.owner];
    const color = determineColor(isSelected, isHovering, ownerColor);

    return (
        <mesh
            position={[x, height / 8 + 0.01, z]}
            onClick={handleClick}
            onPointerEnter={() => setIsHovering(true)}
            onPointerLeave={() => setIsHovering(false)}
        >
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
};

function determineColor(isSelected: boolean, isHovering: boolean, ownerColor: string): string {
    if (isSelected) {
        return "#FFCA28";
    }
    if (isHovering) {
        return "#FFEB3B";
    }
    return ownerColor;
}

import { ReactElement, Suspense, useEffect, useRef, useState } from "react";
import { useLevContext } from "../LevContext";
import { LevEntity } from "../LevEntity";
import { useFldMapContext } from "../../fld/FldMapContext";
import { Layer } from "../../fld/layers/Layer";
import { useSelectedEntityContext } from "./SelectedEntityContext";
import { Euler, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { ThreeEvent } from "@react-three/fiber";
import { determineColor } from "../constants/OwnerColors";
import { useEntityModel } from "../constants/entityTypeTo3dModel";

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

    const color = determineColor(entity.owner, isSelected, isHovering);
    const position: Vector3 = new Vector3(x - 1, height / 8 + 0.3, z);
    const rotation = entity.rotation * ((Math.PI * 2) / 65535) + Math.PI / 2;
    return (
        <Suspense
            fallback={
                <FallbackModel
                    entityType={entity.type}
                    position={position}
                    rotation={rotation}
                    color={color}
                    onClick={handleClick}
                    onPointerEnter={() => setIsHovering(true)}
                    onPointerLeave={() => setIsHovering(false)}
                />
            }
        >
            <RenderModel
                entityType={entity.type}
                position={position}
                rotation={rotation}
                color={color}
                onClick={handleClick}
                onPointerEnter={() => setIsHovering(true)}
                onPointerLeave={() => setIsHovering(false)}
            />
        </Suspense>
    );
};

interface RenderModelProps {
    entityType: number;
    position: Vector3;
    rotation: number;
    color: string;
    onClick?: ((event: ThreeEvent<MouseEvent>) => void) | undefined;
    onPointerEnter?: ((event: ThreeEvent<PointerEvent>) => void) | undefined;
    onPointerLeave?: ((event: ThreeEvent<PointerEvent>) => void) | undefined;
}

function RenderModel({
    position,
    rotation,
    color,
    entityType,
    onClick,
    onPointerEnter,
    onPointerLeave,
}: RenderModelProps) {
    const model = useEntityModel(entityType);
    const modelRef = useRef<Group>(null);

    useEffect(() => {
        if (model && modelRef.current != null) {
            modelRef.current.traverse((child) => {
                if (child instanceof Mesh) {
                    const newMaterial = new MeshStandardMaterial({ color: color });
                    child.material = newMaterial;
                }
            });
        }
    }, [color, model]);

    useEffect(() => {
        if (model && modelRef.current) {
            modelRef.current.scale.copy({ x: 0.5, y: 0.5, z: 0.5 });
            modelRef.current.position.copy(position);
            modelRef.current.rotation.copy(new Euler(0, rotation, 0));
        }
    }, [model, position, rotation]);

    return (
        <primitive
            object={model}
            ref={modelRef}
            onClick={onClick}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
        />
    );
}

function FallbackModel({ position, color, onClick, onPointerEnter, onPointerLeave }: RenderModelProps) {
    return (
        <mesh position={position} onClick={onClick} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

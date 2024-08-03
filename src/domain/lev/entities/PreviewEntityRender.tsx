import { ReactElement, Suspense, useEffect, useRef } from "react";
import THREE, { MeshStandardMaterial, Vector3 } from "three";
import { determinePreviewColor } from "../constants/OwnerColors";
import { useEntityModel } from "../constants/entityTypeTo3dModel";
import { Owner } from "../../constants/Owner";
import { usePlaceEntityContext } from "./PlaceEntityContext";
import { useFldPrimaryActionContext } from "../../fld/action-bar/FldPrimaryActionContext";
import { useCursorContext } from "../../../common/controls/CursorContext";
import { useFldMapContext } from "../../fld/FldMapContext";
import { Layer } from "../../fld/layers/Layer";

export const PreviewEntityRender = () => {
    const { owner, placingEntity } = usePlaceEntityContext();
    const { primaryAction } = useFldPrimaryActionContext();
    const { rawPoint } = useCursorContext();
    const { fldFile } = useFldMapContext();

    if (primaryAction !== "BUILDING" || !rawPoint || !placingEntity || fldFile == null) {
        return <></>;
    }
    const { width, height, layers } = fldFile;
    const lanscapeMap = layers[Layer.Landscape];

    return (
        <EntityObject
            entityType={placingEntity}
            owner={owner}
            x={rawPoint.x}
            z={rawPoint.z}
            mapWidth={width}
            mapHeight={height}
            lanscapeMap={lanscapeMap}
        />
    );
};

interface EntityObjectProps {
    entityType: number;
    owner: Owner;
    x: number;
    z: number;
    mapHeight: number;
    mapWidth: number;
    lanscapeMap: DataView;
}

export const EntityObject = ({
    entityType,
    owner,
    x,
    z,
    mapWidth,
    mapHeight,
    lanscapeMap,
}: EntityObjectProps): ReactElement => {
    const index = Math.floor(mapHeight - x) * mapWidth + Math.floor(z);
    const height = lanscapeMap.getUint8(index);

    const color = determinePreviewColor(owner);
    const position: Vector3 = new Vector3(x - 1, height / 8 + 0.3, z);

    return (
        <Suspense fallback={<FallbackModel entityType={entityType} position={position} color={color} />}>
            <RenderModel entityType={entityType} position={position} color={color} />
        </Suspense>
    );
};

interface RenderModelProps {
    entityType: number;
    position: Vector3;
    color: string;
}

function RenderModel({ position, color, entityType }: RenderModelProps) {
    const model = useEntityModel(entityType);
    const modelRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (model && modelRef.current) {
            modelRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const newMaterial = new MeshStandardMaterial({ color: color });
                    child.material = newMaterial;
                }
            });
        }
    }, [color, model]);

    useEffect(() => {
        if (model && modelRef.current) {
            modelRef.current.position.copy(position);
        }
    }, [model, position]);

    return <primitive object={model} ref={modelRef} />;
}

function FallbackModel({ position, color }: RenderModelProps) {
    return (
        <mesh position={position}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

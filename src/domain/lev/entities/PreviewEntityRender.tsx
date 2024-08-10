import { Dispatch, ReactElement, Suspense, useEffect, useRef } from "react";
import { Euler, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { determinePreviewColor } from "../constants/OwnerColors";
import { useEntityModel } from "../constants/entityTypeTo3dModel";
import { Owner } from "../../constants/Owner";
import { usePlaceEntityContext } from "./PlaceEntityContext";
import { useFldPrimaryActionContext } from "../../fld/action-bar/FldPrimaryActionContext";
import { useCursorContext } from "../../../common/controls/CursorContext";
import { useFldMapContext } from "../../fld/FldMapContext";
import { Layer } from "../../fld/layers/Layer";
import { useLevContext } from "../LevContext";
import { LevAction } from "../LevReducer";
import { useLeftClickAction } from "../../../common/controls/useLeftClickAction";
import { useKeyboardHoldDelayAction } from "../../../common/controls/useKeyboardHoldDelayAction";

export const PreviewEntityRender = () => {
    const { owner, placingEntity } = usePlaceEntityContext();
    const { primaryAction } = useFldPrimaryActionContext();
    const { rawPoint } = useCursorContext();
    const { fldFile } = useFldMapContext();
    const { dispatch } = useLevContext();

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
            dispatch={dispatch}
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
    dispatch: Dispatch<LevAction>;
}

export const EntityObject = ({
    entityType,
    owner,
    x,
    z,
    mapWidth,
    mapHeight,
    lanscapeMap,
    dispatch,
}: EntityObjectProps): ReactElement => {
    const index = Math.floor(mapHeight - x) * mapWidth + Math.floor(z);
    const height = lanscapeMap.getUint8(index);

    const color = determinePreviewColor(owner);
    const position: Vector3 = new Vector3(x, height / 8 + 0.3, z);

    const { rotation, setRotation } = usePlaceEntityContext();

    useKeyboardHoldDelayAction(() => setRotation((old) => old + 1000), "r", 20, []);
    useKeyboardHoldDelayAction(() => setRotation((old) => old - 1000), "t", 20, []);

    const adjustedX = mapHeight - 1 - x;
    const zPlacing = Math.floor(adjustedX * -1999);
    const xPlacing = Math.floor(adjustedX * 1152 + z * 2305);
    const visualRotation = rotation * ((Math.PI * 2) / 65535) + Math.PI / 2;

    useLeftClickAction(() =>
        dispatch({ type: "PLACE_ENTITY", entityType, owner, x: xPlacing, z: zPlacing, rotation: rotation }),
    );

    return (
        <Suspense
            fallback={
                <FallbackModel entityType={entityType} position={position} color={color} rotation={visualRotation} />
            }
        >
            <RenderModel entityType={entityType} position={position} color={color} rotation={visualRotation} />
        </Suspense>
    );
};

interface RenderModelProps {
    entityType: number;
    position: Vector3;
    color: string;
    rotation: number;
}

function RenderModel({ position, color, entityType, rotation }: RenderModelProps) {
    const model = useEntityModel(entityType);
    const modelRef = useRef<Group>(null);

    useEffect(() => {
        if (model && modelRef.current) {
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
            modelRef.current.position.copy(position);
            modelRef.current.rotation.copy(new Euler(0, rotation, 0));
        }
    }, [model, position, rotation]);

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

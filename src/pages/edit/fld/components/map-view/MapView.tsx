import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import "./MapView.css";
import { Reference } from "./entities/Reference";
import { create128x128 } from "./entities/ExamplePoints";
import { HeightLayerRender } from "./layers/HeightLayerRender";
import { ResourceView } from "./layers/ResourceView";
import { useInitHetraFld } from "../../hooks/useInitHetraFld";
import { FldFile } from "../../../../../domain/fld/FldFile";
import { useFldMapContext } from "../../context/FldMapContext";
import { useCenterCamera } from "../../hooks/useCenterCamera";
import * as DREI from "@react-three/drei";
import { OrbitControls } from "three-stdlib";
import { Stats } from "@react-three/drei";
import { HeightLayerMesh } from "./layers/HeightLayerMesh";
import { DebugSidebar } from "../debug/DebugSidebar";
import { DebugBox } from "../debug/DebugBox";
import { Debug3x3Box } from "../debug/Debug3x3Box";
import { PirmaryActionBar } from "../bar-action/PrimaryActionBar";
import { SecondaryActionBar } from "../bar-action/SecondaryActionBar";
import { ResourceActionPreview } from "./previews/ResourceActionPreview";
import * as THREE from "three";
import { useKeyboardControls } from "../../hooks/useKeyboardControls";

const layer = create128x128();

export const MapView = (): React.JSX.Element => {
    const orbitControlsRef = useRef<OrbitControls>(null);

    useInitHetraFld();
    const { fldFile } = useFldMapContext();

    const height = getHeightOrDefault(fldFile);
    const referenceX = height / 2 - 10;

    const width = getWidhtOrDefault(fldFile);
    const referenceY = width / 2 - 10;

    return (
        <div className="map-view">
            <Canvas className="map">
                <ambientLight intensity={3} />
                <directionalLight position={[0, 100, 0]} intensity={2} />

                <DREI.OrbitControls
                    target={[60, 0, 60]}
                    ref={orbitControlsRef}
                    mouseButtons={{ RIGHT: THREE.MOUSE.RIGHT }}
                />
                <MapViewUtil orbitControlsRef={orbitControlsRef} />

                {false && (
                    <Reference x={referenceX} y={-0.05} z={referenceY} depth={height} height={0.1} width={width} />
                )}
                {false && <HeightLayerRender layer={fldFile ?? layer} />}
                <ResourceView />
                <Stats className="fps-counter" />
                <HeightLayerMesh layer={fldFile ?? layer} />
                <DebugBox />
                <Debug3x3Box />
                <ResourceActionPreview />
            </Canvas>
            <DebugSidebar />
            <PirmaryActionBar />
            <SecondaryActionBar />
        </div>
    );
};

interface MapViewUtilProps {
    orbitControlsRef?: React.RefObject<OrbitControls>;
}

const MapViewUtil = (props: MapViewUtilProps) => {
    useCenterCamera(props.orbitControlsRef);
    useKeyboardControls(props.orbitControlsRef);
    return <></>;
};

const getHeightOrDefault = (fldFile?: FldFile | null) => (fldFile ? fldFile.height + 20 : 256);
const getWidhtOrDefault = (fldFile?: FldFile | null) => (fldFile ? fldFile.width + 20 : 256);

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
                <directionalLight position={[5, 5, 5]} intensity={0.5} />

                <DREI.OrbitControls target={[60, 0, 60]} ref={orbitControlsRef} />
                <MapViewUtil orbitControlsRef={orbitControlsRef} />

                {false && (
                    <Reference x={referenceX} y={-0.05} z={referenceY} depth={height} height={0.1} width={width} />
                )}
                {false && <HeightLayerRender layer={fldFile ?? layer} />}
                <ResourceView />
                <Stats className="fps-counter" />
                <HeightLayerMesh layer={fldFile ?? layer} />
                <DebugBox />
            </Canvas>
            <DebugSidebar />
        </div>
    );
};

interface MapViewUtilProps {
    orbitControlsRef?: React.RefObject<OrbitControls>;
}

const MapViewUtil = (props: MapViewUtilProps) => {
    useCenterCamera(props.orbitControlsRef);
    return <></>;
};

const getHeightOrDefault = (fldFile?: FldFile | null) => (fldFile ? fldFile.height + 20 : 256);
const getWidhtOrDefault = (fldFile?: FldFile | null) => (fldFile ? fldFile.width + 20 : 256);

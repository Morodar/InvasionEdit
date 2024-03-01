import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import "./MapView.css";
import { ResourceMeshes } from "./layers/ResourceMeshes";
import { useInitFld } from "../../hooks/useInitFld";
import { useCenterCamera } from "../../hooks/useCenterCamera";
import { OrbitControls as DreiObitControls, Stats } from "@react-three/drei";
import { LandscapeMesh } from "./layers/LandscapeMesh";
import { DebugSidebar } from "../debug/DebugSidebar";
import { DebugBox } from "../debug/DebugBox";
import { Debug3x3Box } from "../debug/Debug3x3Box";
import { PirmaryActionBar } from "../bar-action/PrimaryActionBar";
import { SecondaryActionBar } from "../bar-action/SecondaryActionBar";
import { ResourceActionPreview } from "./previews/ResourceActionPreview";
import { useKeyboardControls } from "../../hooks/useKeyboardControls";
import { LandscapeActionPreview } from "./previews/LandscapeActionPreview";
import { LayerSettings } from "../layer-settings/LayerSettings";
import { UnknownMeshes } from "./layers/UnknownMeshes";
import { GenericActionPreview } from "./previews/GenericActionPreview";
import { OrbitControls } from "../../../../../common/utils/OrbitControls";
import { MOUSE } from "three";
import { WaterMesh } from "./layers/WaterMesh";
import { WaterActionPreview } from "./previews/WaterActionPreview";

export const MapView = (): React.JSX.Element => {
    const orbitControlsRef = useRef<OrbitControls>(null);

    return (
        <div className="map-view">
            <Canvas className="map">
                <ambientLight intensity={3} />
                <directionalLight position={[0, 100, 0]} intensity={2} />

                <DreiObitControls
                    target={[60, 0, 60]}
                    ref={orbitControlsRef}
                    mouseButtons={{ RIGHT: MOUSE.RIGHT }}
                    minDistance={20}
                    maxDistance={120}
                />
                <MapViewUtil orbitControlsRef={orbitControlsRef} />

                <Stats className="fps-counter" />
                <DebugBox />
                <Debug3x3Box />

                <ResourceActionPreview />
                <LandscapeActionPreview />
                <WaterActionPreview />
                <GenericActionPreview />

                <ResourceMeshes />
                <LandscapeMesh />
                <WaterMesh />
                <UnknownMeshes />
            </Canvas>
            <DebugSidebar />
            <PirmaryActionBar />
            <SecondaryActionBar />
            <LayerSettings />
        </div>
    );
};

interface MapViewUtilProps {
    orbitControlsRef: React.RefObject<OrbitControls>;
}

const MapViewUtil = (props: MapViewUtilProps) => {
    useInitFld();
    useCenterCamera(props.orbitControlsRef);
    useKeyboardControls(props.orbitControlsRef);

    return <></>;
};

import { OrbitControls as DreiObitControls, Stats } from "@react-three/drei";
import { OrbitControls } from "../../../common/camera/OrbitControls";

import { Canvas } from "@react-three/fiber";
import React, { ReactElement, useRef } from "react";
import { MOUSE } from "three";
import { useCenterCamera } from "../../../common/camera/useCenterCamera";
import { Debug3x3Box } from "../../../common/debug/Debug3x3Box";
import { DebugBox } from "../../../common/debug/DebugBox";
import { DebugSidebar } from "../../../common/debug/DebugSidebar";
import { PirmaryActionBar } from "../../fld/action-bar/PrimaryActionBar";
import { SecondaryActionBar } from "../../fld/action-bar/SecondaryActionBar";
import { GenericActionPreview } from "../../fld/generic/GenericActionPreview";
import { LandscapeActionPreview } from "../../fld/landsacpe/LandscapeActionPreview";
import { LandscapeMesh } from "../../fld/meshes/LandscapeMesh";
import { ResourceMeshes } from "../../fld/meshes/ResourceMeshes";
import { UnknownMeshes } from "../../fld/meshes/UnknownMeshes";
import { WaterMesh } from "../../fld/meshes/WaterMesh";
import { ResourceActionPreview } from "../../fld/resource/ResourceActionPreview";
import { WaterActionPreview } from "../../fld/water/WaterActionPreview";
import { useKeyboardControls } from "../../../common/controls/useKeyboardControls";
import "./LevelView.css";
import { LevelRail } from "../../../pages/edit/level/rail/LevelRail";

export const LevelView = (): ReactElement => {
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
            <LevelRail />
        </div>
    );
};

interface MapViewUtilProps {
    orbitControlsRef: React.RefObject<OrbitControls>;
}

const MapViewUtil = (props: MapViewUtilProps) => {
    useCenterCamera(props.orbitControlsRef);
    useKeyboardControls(props.orbitControlsRef);

    return <></>;
};

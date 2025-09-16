import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import "./FldView.css";
import { ResourceMeshes } from "../../../domain/fld/meshes/ResourceMeshes";
import { useInitFld } from "./useInitFld";
import { useCenterCamera } from "../../../common/camera/useCenterCamera";
import { OrbitControls as DreiObitControls, Stats } from "@react-three/drei";
import { LandscapeMesh } from "../../../domain/fld/meshes/LandscapeMesh";
import { DebugSidebar } from "../../../common/debug/DebugSidebar";
import { DebugBox } from "../../../common/debug/DebugBox";
import { Debug3x3Box } from "../../../common/debug/Debug3x3Box";
import { PirmaryActionBar } from "../../../domain/fld/action-bar/PrimaryActionBar";
import { SecondaryActionBar } from "../../../domain/fld/action-bar/SecondaryActionBar";
import { ResourceActionPreview } from "../../../domain/fld/resource/ResourceActionPreview";
import { useKeyboardControls } from "../../../common/controls/useKeyboardControls";
import { LandscapeActionPreview } from "../../../domain/fld/landsacpe/LandscapeActionPreview";
import { LayerSettings } from "../../../domain/fld/layers/LayerSettings";
import { UnknownMeshes } from "../../../domain/fld/meshes/UnknownMeshes";
import { GenericActionPreview } from "../../../domain/fld/generic/GenericActionPreview";
import { OrbitControls } from "../../../common/camera/OrbitControls";
import { MOUSE } from "three";
import { WaterMesh } from "../../../domain/fld/meshes/WaterMesh";
import { WaterActionPreview } from "../../../domain/fld/water/WaterActionPreview";
import { RightSideContainer } from "../../../layout/RightSideContainer";

export const FldView = (): React.JSX.Element => {
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
                    minDistance={5}
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
            <RightSideContainer verticalCenter>
                <LayerSettings />
            </RightSideContainer>
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

import { OrbitControls as DreiOrbitControls, Stats } from "@react-three/drei";
import { OrbitControls } from "three-stdlib";
import { Canvas } from "@react-three/fiber";
import { ReactElement, RefObject, useRef } from "react";
import { MOUSE } from "three";
import { useCenterCamera } from "../../../../common/camera/useCenterCamera";
import { Debug3x3Box } from "../../../../common/debug/Debug3x3Box";
import { DebugBox } from "../../../../common/debug/DebugBox";
import { DebugSidebar } from "../../../../common/debug/DebugSidebar";
import { PirmaryActionBar } from "../../../fld/action-bar/PrimaryActionBar";
import { SecondaryActionBar } from "../../../fld/action-bar/SecondaryActionBar";
import { GenericActionPreview } from "../../../fld/generic/GenericActionPreview";
import { LandscapeActionPreview } from "../../../fld/landsacpe/LandscapeActionPreview";
import { LandscapeMesh } from "../../../fld/meshes/LandscapeMesh";
import { ResourceMeshes } from "../../../fld/meshes/ResourceMeshes";
import { UnknownMeshes } from "../../../fld/meshes/UnknownMeshes";
import { WaterMesh } from "../../../fld/meshes/WaterMesh";
import { ResourceActionPreview } from "../../../fld/resource/ResourceActionPreview";
import { WaterActionPreview } from "../../../fld/water/WaterActionPreview";
import { useKeyboardControls } from "../../../../common/controls/useKeyboardControls";
import "./LevelView.css";
import { LevelRail } from "../../../../pages/edit/level/rail/LevelRail";
import { EntityRender } from "../../../lev/entities/EntityRender";
import { PreviewEntityRender } from "../../../lev/entities/PreviewEntityRender";

export const LevelView = (): ReactElement => {
    const orbitControlsRef = useRef<OrbitControls>(null);

    return (
        <div className="map-view">
            <Canvas className="map">
                <ambientLight intensity={3} />
                <directionalLight position={[0, 100, 0]} intensity={2} />

                <DreiOrbitControls
                    ref={orbitControlsRef}
                    target={[60, 0, 60]}
                    mouseButtons={{ RIGHT: MOUSE.RIGHT }}
                    minDistance={20}
                    maxDistance={200}
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
                <EntityRender />
                <PreviewEntityRender />
            </Canvas>
            <DebugSidebar />
            <PirmaryActionBar />
            <SecondaryActionBar />
            <LevelRail />
        </div>
    );
};

interface MapViewUtilProps {
    orbitControlsRef: RefObject<OrbitControls | null>;
}

const MapViewUtil = ({ orbitControlsRef }: MapViewUtilProps) => {
    useCenterCamera(orbitControlsRef);
    useKeyboardControls(orbitControlsRef);

    return <></>;
};

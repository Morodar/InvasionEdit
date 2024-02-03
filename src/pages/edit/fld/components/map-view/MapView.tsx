import React from "react";
import { Canvas } from "@react-three/fiber";
import "./MapView.css";
import { OrbitControls } from "@react-three/drei";
import { Reference } from "./entities/Reference";
import { create128x128 } from "./entities/ExamplePoints";
import { MapHeightLayerRender } from "./entities/MapHeightLayerRender";
import { useFldMapContext } from "../../../../../context/fld/useFldMapContext";

const layer = create128x128();

export const MapView = (): React.JSX.Element => {
    const { fldFile } = useFldMapContext();

    return (
        <div className="map-view">
            <Canvas camera={{ position: [200, 400, 200], rotation: [0, 0, 0] }}>
                <ambientLight intensity={Math.PI / 2} />
                <pointLight position={[50, 30, 50]} decay={0.1} intensity={Math.PI * 2} />
                <Reference x={0} y={-0.05} z={0} depth={400} height={0.1} width={400} />
                <MapHeightLayerRender layer={fldFile ?? layer} />
                <OrbitControls />
            </Canvas>
        </div>
    );
};

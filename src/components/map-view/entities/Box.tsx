import { ThreeElements } from "@react-three/fiber";
import { useState } from "react";

export function Box(props: ThreeElements["mesh"]) {
    const [hovered, setHovered] = useState(false);
    const [active, setActive] = useState(false);
    return (
        <mesh
            {...props}
            scale={active ? 1.5 : 1}
            onClick={(_) => setActive(!active)}
            onPointerOver={(_) => setHovered(true)}
            onPointerOut={(_) => setHovered(false)}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
        </mesh>
    );
}

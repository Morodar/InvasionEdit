interface HeightPoint {
    x: number;
    z: number;
    height: number;
}

export const MapHeightPoint = ({ x, z, height }: HeightPoint): React.JSX.Element => {
    return (
        <mesh position={[x + 0.5, height - 128, z + 0.5]}>
            {Box}
            {Orange}
        </mesh>
    );
};

const Orange = <meshStandardMaterial color={"orange"} />;
const Box = <boxGeometry args={[1, 256, 1]} />;

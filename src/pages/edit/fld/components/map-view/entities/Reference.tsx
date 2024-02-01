interface HeightPointProps {
    x: number;
    y: number;
    z: number;
    height: number;
    width: number;
    depth: number;
}

export const Reference = ({ x, y, z, height, width, depth }: HeightPointProps): React.JSX.Element => {
    return (
        <mesh position={[x, y, z]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={"gray"} />
        </mesh>
    );
};

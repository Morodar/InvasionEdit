export interface Point3D {
    x: number;
    z: number;
    value: number;
}

export interface IndexPoint3D extends Point3D {
    index: number;
}

export interface MapLayer {
    height: number;
    width: number;
    points: Point3D[];
}

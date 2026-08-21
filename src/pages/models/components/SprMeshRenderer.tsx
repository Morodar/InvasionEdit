import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { SprMesh, SprVertex } from "../../../domain/spr/SprFile";
import {
  normalizeSpriteTextureUV,
  SPR_UNTEXTURED_SUBRESOURCE,
} from "../../../domain/spr/SprUtils";
import { ModelTextureProvider } from "../utils/resolveTextures";

const DEFAULT_TEXTURE_DIMENSIONS = { width: 256, height: 256 };
const UNTEXTURED_COLOR = "#9ecbff";

export interface SprMeshRendererProps {
  mesh: SprMesh;
  textureProvider?: ModelTextureProvider | null;
  textured?: boolean;
  wireframe?: boolean;
}

interface SubresourceGeometry {
  subresource: number;
  geometry: THREE.BufferGeometry;
}

/**
 * Renders a single SPR mesh. Triangles are grouped by their texture subresource
 * so that every group can carry its own material in textured mode.
 */
export const SprMeshRenderer = ({
  mesh,
  textureProvider = null,
  textured = false,
  wireframe = false,
}: SprMeshRendererProps) => {
  const geometries = useMemo(
    () => buildSubresourceGeometries(mesh, textureProvider),
    [mesh, textureProvider],
  );

  useEffect(
    () => () => geometries.forEach(({ geometry }) => geometry.dispose()),
    [geometries],
  );

  return (
    <>
      {geometries.map(({ subresource, geometry }) => (
        <SprSubresourceMesh
          key={subresource}
          subresource={subresource}
          geometry={geometry}
          textureProvider={textureProvider}
          textured={textured}
          wireframe={wireframe}
        />
      ))}
    </>
  );
};

interface SprSubresourceMeshProps {
  subresource: number;
  geometry: THREE.BufferGeometry;
  textureProvider: ModelTextureProvider | null;
  textured: boolean;
  wireframe: boolean;
}

const SprSubresourceMesh = ({
  subresource,
  geometry,
  textureProvider,
  textured,
  wireframe,
}: SprSubresourceMeshProps) => {
  const material = useMemo(() => {
    const map =
      textured && subresource !== SPR_UNTEXTURED_SUBRESOURCE
        ? (textureProvider?.getTexture(subresource) ?? null)
        : null;
    return new THREE.MeshStandardMaterial({
      color: map ? "#ffffff" : UNTEXTURED_COLOR,
      map: map ?? null,
      side: THREE.DoubleSide,
      wireframe,
      flatShading: !map,
    });
  }, [textured, textureProvider, subresource, wireframe]);

  useEffect(() => () => material.dispose(), [material]);

  return <mesh geometry={geometry} material={material} />;
};

function buildSubresourceGeometries(
  mesh: SprMesh,
  textureProvider: ModelTextureProvider | null,
): SubresourceGeometry[] {
  const cornersBySubresource = new Map<number, SprVertex[]>();
  const vertexCount = mesh.indices.length;
  if (vertexCount % 3 !== 0) {
    throw new Error("SPR mesh index stream is not triangle aligned");
  }

  for (let index = 0; index < vertexCount; index++) {
    const vertex = mesh.vertices[mesh.indices[index]];
    let corners = cornersBySubresource.get(vertex.textureSubresource);
    if (!corners) {
      corners = [];
      cornersBySubresource.set(vertex.textureSubresource, corners);
    }
    corners.push(vertex);
  }

  const result: SubresourceGeometry[] = [];
  for (const [subresource, corners] of cornersBySubresource) {
    result.push({
      subresource,
      geometry: buildGeometry(corners, subresource, textureProvider),
    });
  }
  return result;
}

function buildGeometry(
  corners: SprMesh["vertices"],
  subresource: number,
  textureProvider: ModelTextureProvider | null,
): THREE.BufferGeometry {
  const positions = new Float32Array(corners.length * 3);
  const normals = new Float32Array(corners.length * 3);
  const uvs = new Float32Array(corners.length * 2);

  const dimensions =
    textureProvider?.getDimensions(subresource) ?? DEFAULT_TEXTURE_DIMENSIONS;

  corners.forEach((vertex, index) => {
    positions[index * 3] = vertex.position.x;
    positions[index * 3 + 1] = vertex.position.y;
    positions[index * 3 + 2] = vertex.position.z;
    normals[index * 3] = vertex.normal.x;
    normals[index * 3 + 1] = vertex.normal.y;
    normals[index * 3 + 2] = vertex.normal.z;
    const [u, v] = normalizeSpriteTextureUV(
      vertex.textureU,
      vertex.textureV,
      dimensions.width,
      dimensions.height,
    );
    uvs[index * 2] = u;
    uvs[index * 2 + 1] = v;
  });

  const indices = new Uint32Array(corners.length);
  for (let index = 0; index < corners.length; index++) {
    indices[index] = index;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  return geometry;
}

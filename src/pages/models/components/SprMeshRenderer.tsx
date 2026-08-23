import { useEffect, useMemo, useRef, MutableRefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SprMesh, SprVertex } from "../../../domain/spr/SprFile";
import {
  normalizeSpriteTextureUV,
  SPR_UNTEXTURED_SUBRESOURCE,
} from "../../../domain/spr/SprUtils";
import { buildingTextureWaveOffset } from "../utils/modelAnimation";
import { ModelTextureProvider } from "../utils/resolveTextures";

const DEFAULT_TEXTURE_DIMENSIONS = { width: 256, height: 256 };
/** Fallback for untextured triangles when no faction palette is loaded (0xFFB8BEC6). */
const UNTEXTURED_COLOR = "#b8bec6";

export interface SprMeshRendererProps {
  mesh: SprMesh;
  textureProvider?: ModelTextureProvider | null;
  textured?: boolean;
  wireframe?: boolean;
  /** class-13 root overlay: this subresource's V coordinates follow the wave */
  animatedSubresource?: number | null;
  animationTickRef?: MutableRefObject<number> | null;
  /**
   * Effect puffs: constant alpha 0..1 with per-pixel blending instead of the
   * hard alphaTest cutout; disables depth writes to avoid smoke sorting gaps.
   */
  opacity?: number | null;
  /** Texture subresource override for cycling effect frames (EFF shading range). */
  frameSubresource?: number | null;
}

interface TriangleGroup {
  /** texture subresource, or SPR_UNTEXTURED_SUBRESOURCE for flat-colored triangles */
  subresource: number;
  /** render flags of untextured triangles; their low 9 bits select a palette color */
  renderFlags: number;
  geometry: THREE.BufferGeometry;
}

/**
 * Renders a single SPR mesh. Triangles are grouped by texture subresource
 * (untextured triangles additionally by their render flags) so that every
 * group can carry its own material.
 */
export const SprMeshRenderer = ({
  mesh,
  textureProvider = null,
  textured = false,
  wireframe = false,
  animatedSubresource = null,
  animationTickRef = null,
  opacity = null,
  frameSubresource = null,
}: SprMeshRendererProps) => {
  const groups = useMemo(
    () => buildTriangleGroups(mesh, textureProvider),
    [mesh, textureProvider],
  );

  useEffect(
    () => () => groups.forEach(({ geometry }) => geometry.dispose()),
    [groups],
  );

  return (
    <>
      {groups.map((group, index) => (
        <SprGroupMesh
          key={index}
          group={group}
          textureProvider={textureProvider}
          textured={textured}
          wireframe={wireframe}
          animated={
            textured && animatedSubresource !== null && group.subresource === animatedSubresource
          }
          animationTickRef={animationTickRef}
          opacity={opacity}
          frameSubresource={frameSubresource}
        />
      ))}
    </>
  );
};

interface SprGroupMeshProps {
  group: TriangleGroup;
  textureProvider: ModelTextureProvider | null;
  textured: boolean;
  wireframe: boolean;
  animated: boolean;
  animationTickRef: MutableRefObject<number> | null;
  opacity: number | null;
  frameSubresource: number | null;
}

const SprGroupMesh = ({
  group,
  textureProvider,
  textured,
  wireframe,
  animated,
  animationTickRef,
  opacity,
  frameSubresource,
}: SprGroupMeshProps) => {
  const isEffect = opacity !== null;
  const material = useMemo(() => {
    const untextured = group.subresource === SPR_UNTEXTURED_SUBRESOURCE;
    const isEffect = opacity !== null;
    const textureSubresource =
      textured && !untextured && frameSubresource !== null
        ? frameSubresource
        : group.subresource;
    const map =
      textured && !untextured
        ? (textureProvider?.getTexture(textureSubresource) ?? null)
        : null;

    if (untextured) {
      // the low 9 bits of the render flags select a faction palette entry
      const argb = textureProvider?.getPaletteColor(group.renderFlags) ?? null;
      return new THREE.MeshStandardMaterial({
        color: argb === null ? UNTEXTURED_COLOR : new THREE.Color(argb),
        side: THREE.DoubleSide,
        wireframe,
        flatShading: true,
        transparent: isEffect,
        depthWrite: !isEffect,
      });
    }

    if (isEffect) {
      return new THREE.MeshStandardMaterial({
        color: "#ffffff",
        map: map ?? null,
        side: THREE.DoubleSide,
        wireframe,
        transparent: true,
        opacity,
        depthWrite: false,
      });
    }

    return new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: map ?? null,
      side: THREE.DoubleSide,
      wireframe,
      alphaTest: 0.5,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textured, textureProvider, group, wireframe, isEffect, frameSubresource]);

  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    if (opacity !== null) {
      material.opacity = opacity;
    }
  }, [material, opacity]);


  // Class-13 building overlay (model.vert): the animated subresource's V
  // coordinates ride a deterministic triangle wave; all other groups stay put.
  const baseV = useRef<Float32Array | null>(null);
  useFrame(() => {
    if (!animated || !animationTickRef) {
      return;
    }
    const uv = group.geometry.getAttribute("uv") as THREE.BufferAttribute | undefined;
    if (!uv) {
      return;
    }
    if (baseV.current === null || baseV.current.length !== uv.count) {
      baseV.current = new Float32Array(uv.count);
      for (let index = 0; index < uv.count; index++) {
        baseV.current[index] = uv.getY(index);
      }
    }
    const offset = buildingTextureWaveOffset(animationTickRef.current);
    for (let index = 0; index < uv.count; index++) {
      uv.setY(index, baseV.current[index] + offset);
    }
    uv.needsUpdate = true;
  });

  return <mesh geometry={group.geometry} material={material} />;
};

function buildTriangleGroups(
  mesh: SprMesh,
  textureProvider: ModelTextureProvider | null,
): TriangleGroup[] {
  const cornersByGroup = new Map<string, { group: Omit<TriangleGroup, "geometry">; corners: SprVertex[] }>();
  const vertexCount = mesh.indices.length;
  if (vertexCount % 3 !== 0) {
    throw new Error("SPR mesh index stream is not triangle aligned");
  }

  for (let index = 0; index < vertexCount; index++) {
    const vertex = mesh.vertices[mesh.indices[index]];
    const untextured = vertex.textureSubresource === SPR_UNTEXTURED_SUBRESOURCE;
    const key = untextured ? `u-${vertex.renderFlags & 0x1ff}` : `t-${vertex.textureSubresource}`;
    let entry = cornersByGroup.get(key);
    if (!entry) {
      entry = {
        group: {
          subresource: vertex.textureSubresource,
          renderFlags: untextured ? vertex.renderFlags : 0,
        },
        corners: [],
      };
      cornersByGroup.set(key, entry);
    }
    entry.corners.push(vertex);
  }

  const result: TriangleGroup[] = [];
  for (const { group, corners } of cornersByGroup.values()) {
    result.push({
      ...group,
      geometry: buildGeometry(corners, group.subresource, textureProvider),
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

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Box3, Group, Vector3 } from "three";
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import { ModelChainNode, ResolvedModel } from "../utils/resolveModelChain";
import { fixedModelRotationMatrix } from "../utils/modelHierarchy";
import {
  animatedChild2TranslationQ12,
  childUsesBoundedVerticalChannel,
  modelRuntimeChildYawStep,
  SUBNODE_ANIMATION_TICKS_PER_SECOND,
  wrapTurn16,
} from "../utils/modelAnimation";
import { ModelTextureProvider } from "../utils/resolveTextures";
import { SprMeshRenderer } from "./SprMeshRenderer";

/** Serialized child-slot translations are Q12 fixed point. */
const Q12_ONE = 4096;

export interface ModelViewportProps {
  model: ResolvedModel | null;
  textureProvider: ModelTextureProvider | null;
  /** factionless army0 family for spr/extras nodes; falls back to textureProvider */
  neutralTextureProvider?: ModelTextureProvider | null;
  textured: boolean;
  wireframe: boolean;
}

/**
 * R3F viewport rendering the resolved ARM→MDL→SPR hierarchy of one model.
 *
 * Thandor model space is Z-up; the whole model is rotated into Three.js Y-up space.
 */
export const ModelViewport = ({
  model,
  textureProvider,
  neutralTextureProvider,
  textured,
  wireframe,
}: ModelViewportProps) => {
  const gridSize = useMemo(() => {
    if (!model || model.nodes.length === 0) {
      return 64;
    }
    const box = computeApproximateWorldBounds(model);
    const size = box.getSize(new Vector3()).length();
    return Math.max(8, Math.ceil(size / 8) * 8);
  }, [model]);

  // Shared presentation-tick clock; one driver advances it, animated groups read it.
  const animationTickRef = useRef(0);

  return (
    <Canvas
      camera={{ fov: 50, position: [40, 30, 40], near: 0.1, far: 10000 }}
      style={{ width: "100%", height: "100%" }}
    >
      <AnimationTickDriver tickRef={animationTickRef} />
      <color attach="background" args={["#1a1f26"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[60, 80, 40]} intensity={1.2} />
      <directionalLight position={[-50, 30, -60]} intensity={0.4} />
      <gridHelper args={[gridSize * 2, gridSize / 2, "#3a4552", "#2a333d"]} />
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {model &&
          model.nodes.map((node, nodeIndex) =>
            node.parentIndex === -1 ? (
              <HierarchyNodeGroup
                key={nodeIndex}
                nodeIndex={nodeIndex}
                node={node}
                nodes={model.nodes}
                animationTickRef={animationTickRef}
                textureProvider={textureProvider}
                neutralTextureProvider={neutralTextureProvider}
                textured={textured}
                wireframe={wireframe}
              />
            ) : null,
          )}
      </group>
      <OrbitControls makeDefault />
      <CameraFraming model={model} />
    </Canvas>
  );
};

const AnimationTickDriver = ({
  tickRef,
}: {
  tickRef: MutableRefObject<number>;
}) => {
  useFrame((_, delta) => {
    tickRef.current += delta * SUBNODE_ANIMATION_TICKS_PER_SECOND;
  });
  return null;
};

interface HierarchyNodeGroupProps {
  nodeIndex: number;
  node: ModelChainNode;
  nodes: ModelChainNode[];
  animationTickRef: MutableRefObject<number>;
  textureProvider: ModelTextureProvider | null;
  neutralTextureProvider?: ModelTextureProvider | null;
  textured: boolean;
  wireframe: boolean;
}

/**
 * Renders one hierarchy node and its subtree.
 *
 * Ports the authored subnode animation of ArmyRuntime_UpdateAnimatedModelSubnodes
 * (editor_app.cpp): a live child slot 0/1 spins with its parent's yaw velocity or
 * acceleration (continuous radar class 10 included), and slot 2 oscillates
 * vertically between the parent's serialized q12 bounds. The yaw delta applies to
 * the child's local_rotation_angle2 field, exactly as the stock renderer does
 * before FixedTransform_BuildRotationBasis.
 */
const HierarchyNodeGroup = ({
  nodeIndex,
  node,
  nodes,
  animationTickRef,
  textureProvider,
  neutralTextureProvider,
  textured,
  wireframe,
}: HierarchyNodeGroupProps) => {
  const parentSimulation =
    node.parentIndex === -1 ? null : nodes[node.parentIndex].simulation;
  const yawStep = parentSimulation
    ? modelRuntimeChildYawStep(parentSimulation, node.childSlot)
    : 0;
  const bobbing =
    parentSimulation !== null &&
    childUsesBoundedVerticalChannel(parentSimulation, node.childSlot);
  const animated = yawStep !== 0 || bobbing;

  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!animated || !groupRef.current) {
      return;
    }
    const tick = Math.floor(animationTickRef.current);
    const angles = node.mdlNode.localRotationAngles;
    const translation = node.attachmentTranslation;
    const bobQ12 =
      parentSimulation !== null && bobbing
        ? animatedChild2TranslationQ12(parentSimulation, tick)
        : null;
    const yawAngle =
      yawStep !== 0 ? wrapTurn16(angles[2] + yawStep * tick) : angles[2];
    groupRef.current.matrix.copy(
      fixedModelRotationMatrix(
        angles[0],
        angles[1],
        yawAngle,
        bobQ12 === null
          ? translation
          : { x: translation.x, y: translation.y, z: bobQ12 / Q12_ONE },
      ),
    );
  });

  // Neutral scenery sprites (trees, stones, ruins under spr/extras) use the
  // factionless army0 family; everything else uses the selected faction.
  const nodeTextureProvider =
    node.sprPath.startsWith("spr/extras/") && neutralTextureProvider
      ? neutralTextureProvider
      : textureProvider;

  return (
    <group
      ref={groupRef}
      matrix={useMemo(
        () =>
          fixedModelRotationMatrix(
            node.mdlNode.localRotationAngles[0],
            node.mdlNode.localRotationAngles[1],
            node.mdlNode.localRotationAngles[2],
            node.attachmentTranslation,
          ),
        [node],
      )}
      matrixAutoUpdate={false}
    >
      {node.sprFile && node.sprFile.lodGroups.length > 0 && (
        <SprMeshRenderer
          mesh={node.sprFile.lodGroups[0].mesh}
          textureProvider={nodeTextureProvider}
          textured={textured}
          wireframe={wireframe}
        />
      )}
      {nodes.map((child, childIndex) =>
        child.parentIndex === nodeIndex ? (
          <HierarchyNodeGroup
            key={childIndex}
            nodeIndex={childIndex}
            node={child}
            nodes={nodes}
            animationTickRef={animationTickRef}
            textureProvider={textureProvider}
            neutralTextureProvider={neutralTextureProvider}
            textured={textured}
            wireframe={wireframe}
          />
        ) : null,
      )}
    </group>
  );
};

/**
 * Positions the camera so the selected model fills the viewport.
 */
const CameraFraming = ({ model }: { model: ResolvedModel | null }) => {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls);

  useEffect(() => {
    if (!model || model.nodes.length === 0) {
      return;
    }
    const box = computeApproximateWorldBounds(model);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3()).length() || 10;

    camera.position.set(
      center.x + size * 0.7,
      center.y + size * 0.5,
      center.z + size * 0.7,
    );
    camera.lookAt(center);
    if (controls && "target" in controls) {
      (controls as { target: Vector3 }).target.copy(center);
      (controls as { update: () => void }).update();
    }
  }, [model, camera, controls]);

  return null;
};

/**
 * Approximate world-space bounds: accumulates every node's SPR header bounds
 * translated along its parent chain (rotations are ignored).
 */
function computeApproximateWorldBounds(model: ResolvedModel): Box3 {
  const box = new Box3();
  const nodeTranslations = model.nodes.map((node) => {
    const translation = { x: 0, y: 0, z: 0 };
    let cursor: ModelChainNode | null = node;
    while (cursor) {
      translation.x += cursor.attachmentTranslation.x;
      translation.y += cursor.attachmentTranslation.y;
      translation.z += cursor.attachmentTranslation.z;
      cursor = cursor.parentIndex === -1 ? null : model.nodes[cursor.parentIndex];
    }
    return translation;
  });

  model.nodes.forEach((node, index) => {
    const spr = node.sprFile;
    if (!spr) {
      return;
    }
    const translation = nodeTranslations[index];
    box.expandByPoint({
      x: spr.boundsMin.x + translation.x,
      y: spr.boundsMin.y + translation.y,
      z: spr.boundsMin.z + translation.z,
    } as Vector3);
    box.expandByPoint({
      x: spr.boundsMax.x + translation.x,
      y: spr.boundsMax.y + translation.y,
      z: spr.boundsMax.z + translation.z,
    } as Vector3);
  });

  if (box.isEmpty()) {
    box.set(new Vector3(-8, -8, -8), new Vector3(8, 8, 8));
  }
  return box;
}

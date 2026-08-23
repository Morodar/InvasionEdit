import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Box3, Group, Matrix4, Vector3 } from "three";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  EffRecord,
} from "../../../domain/eff/EffFile";
import {
  ParsedModelFiles,
} from "../utils/parseModelPckEntries";
import {
  ModelChainNode,
  ResolvedModel,
  TimedEffect,
} from "../utils/resolveModelChain";
import { SprFile, SprVec3 } from "../../../domain/spr/SprFile";
import { fixedModelRotationMatrix } from "../utils/modelHierarchy";
import {
  animatedChild2TranslationQ12,
  childUsesBoundedVerticalChannel,
  effectAlphaAtAge,
  effectFrameAtAge,
  effectLifetimeTicks,
  effectScaleAtAge,
  effectTransition2DisplacementAtAge,
  emitterIntervalTicks,
  modelRuntimeChildYawStep,
  resourceRandomNextPrimary,
  SUBNODE_ANIMATION_TICKS_PER_SECOND,
  wrapTurn16,
} from "../utils/modelAnimation";
import { ModelTextureProvider } from "../utils/resolveTextures";
import { SPR_UNTEXTURED_SUBRESOURCE } from "../../../domain/spr/SprUtils";
import { SprMeshRenderer } from "./SprMeshRenderer";

/** Serialized child-slot translations are Q12 fixed point. */
const Q12_ONE = 4096;

export interface ModelViewportProps {
  model: ResolvedModel | null;
  textureProvider: ModelTextureProvider | null;
  /** factionless army0 family for spr/extras nodes; falls back to textureProvider */
  neutralTextureProvider?: ModelTextureProvider | null;
  /** parsed archives - source of effect definitions and their SPR sprites */
  parsedFiles?: ParsedModelFiles | null;
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
  parsedFiles = null,
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
        {model && parsedFiles && (
          <TimedEffectEmitters
            model={model}
            parsedFiles={parsedFiles}
            textureProvider={textureProvider}
            neutralTextureProvider={neutralTextureProvider}
            animationTickRef={animationTickRef}
            textured={textured}
          />
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
    groupRef.current.matrixWorldNeedsUpdate = true;
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
          animatedSubresource={
            node.parentIndex === -1 ? node.textureAnimation?.primarySubresource ?? null : null
          }
          animationTickRef={animationTickRef}
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
 * Spawns and animates the timed-effect puffs (chimney smoke & friends) of
 * every root node that carries an MDL timed effect.
 *
 * Ports the static-placement preview of editor_app.cpp append_effect_visual:
 * pulses fire at MDL interval ± random ticks through the stock resource RNG,
 * each puff picks a kind-6 attachment point of the root sprite, then lives
 * for the EFF lifetime while scaling between the authored Q12 bounds, fading
 * in/out and drifting along the transition-kind-2 displacement field.
 */
const TimedEffectEmitters = ({
  model,
  parsedFiles,
  textureProvider,
  neutralTextureProvider,
  animationTickRef,
  textured,
}: {
  model: ResolvedModel;
  parsedFiles: ParsedModelFiles;
  textureProvider: ModelTextureProvider | null;
  neutralTextureProvider?: ModelTextureProvider | null;
  animationTickRef: MutableRefObject<number>;
  textured: boolean;
}) => (
  <>
    {model.nodes.map((node, nodeIndex) => {
      if (node.parentIndex !== -1 || !node.timedEffect) {
        return null;
      }
      const definition = parsedFiles.effectRecords.get(node.timedEffect.id);
      if (!definition) {
        return null;
      }
      const effectSpr = parsedFiles.sprFiles.get(definition.spritePath);
      if (!effectSpr || effectSpr.lodGroups.length === 0) {
        return null;
      }
      const attachmentPoints = node.sprFile?.type6AttachmentPoints ?? [];
      if (attachmentPoints.length === 0) {
        return null;
      }
      return (
        <TimedEffectPuffs
          key={nodeIndex}
          definition={definition}
          effectSpr={effectSpr}
          attachmentPoints={attachmentPoints}
          timedEffect={node.timedEffect}
          seed={((nodeIndex + 1) * 2654435761) ^ (definition.definitionId * 40503)}
          textureProvider={textureProvider}
          neutralTextureProvider={neutralTextureProvider}
          effectTexturePath={definition.spritePath}
          animationTickRef={animationTickRef}
          textured={textured}
        />
      );
    })}
  </>
);

interface EffectPuff {
  spawnTick: number;
  attachmentIndex: number;
  orientationRandom: number;
}

const MAX_PUFFS = 128;

/**
 * One active effect puff: derives pose/alpha/frame from its age at the
 * parent's current presentation tick.
 */
const EffectPuffView = ({
  puff,
  renderTick,
  definition,
  effectSpr,
  attachmentPoints,
  meshSubresource,
  textureProvider,
  textured,
}: {
  puff: EffectPuff;
  renderTick: number;
  definition: EffRecord;
  effectSpr: SprFile;
  attachmentPoints: SprVec3[];
  meshSubresource: number | null;
  textureProvider: ModelTextureProvider | null;
  textured: boolean;
}) => {
  const lifetime = effectLifetimeTicks(definition);
  const age = renderTick - puff.spawnTick;
  if (lifetime === 0 || age < 0 || age >= lifetime) {
    return null;
  }
  const alpha = effectAlphaAtAge(definition, age) / 255;
  if (alpha <= 0) {
    return null;
  }
  const point = attachmentPoints[puff.attachmentIndex];
  // matches effect_transition2_displacement_at_age: azimuth from the low
  // half word, elevation derived from the top bits (chimneys rise, not sink)
  const displacement = effectTransition2DisplacementAtAge(
    definition,
    age,
    wrapTurn16(0x4000 - (puff.orientationRandom >>> 20)),
    puff.orientationRandom & 0xffff,
  );
  const scale = effectScaleAtAge(definition, age);
  const frameOffset = effectFrameAtAge(definition, age) - definition.shadingStartFrame;

  let basis = new Matrix4();
  if ((definition.creationFlags & 1) !== 0) {
    // creation flags bit 0: random yaw/pitch orientation per puff
    const random =
      (Math.imul(puff.orientationRandom, 1664525) + 1013904223 +
        definition.definitionId) >>>
      0;
    basis = fixedModelRotationMatrix(
      wrapTurn16(random >>> 16),
      wrapTurn16(random & 0xffff),
      0,
      { x: 0, y: 0, z: 0 },
    );
  }
  const matrix = basis.clone();
  matrix.setPosition(
    point.x + displacement.x,
    point.y + displacement.y,
    point.z + displacement.z,
  );
  matrix.scale(new Vector3(scale, scale, scale));

  return (
    <group matrix={matrix} matrixAutoUpdate={false}>
      <SprMeshRenderer
        mesh={effectSpr.lodGroups[0].mesh}
        textureProvider={textureProvider}
        textured={textured}
        wireframe={false}
        opacity={alpha}
        frameSubresource={
          textured && meshSubresource !== null && frameOffset !== 0
            ? meshSubresource + frameOffset
            : null
        }
      />
    </group>
  );
};

const TimedEffectPuffs = ({
  definition,
  effectSpr,
  attachmentPoints,
  timedEffect,
  seed,
  textureProvider,
  neutralTextureProvider,
  effectTexturePath,
  animationTickRef,
  textured,
}: {
  definition: EffRecord;
  effectSpr: SprFile;
  attachmentPoints: SprVec3[];
  timedEffect: TimedEffect;
  seed: number;
  textureProvider: ModelTextureProvider | null;
  neutralTextureProvider?: ModelTextureProvider | null;
  effectTexturePath: string;
  animationTickRef: MutableRefObject<number>;
  textured: boolean;
}) => {
  const lifetime = effectLifetimeTicks(definition);
  const [puffs, setPuffs] = useState<EffectPuff[]>([]);
  const [renderTick, setRenderTick] = useState(0);
  const nextSpawnTickRef = useRef(0);
  const rngStateRef = useRef(seed >>> 0);

  // Neutral scenery sprites use the factionless family; effect textures live
  // in gfx/texturen/effect.gfx which every provider reaches as a fallback.
  const effectTextureProvider =
    effectTexturePath.startsWith("spr/extras/") && neutralTextureProvider
      ? neutralTextureProvider
      : textureProvider;

  useFrame(() => {
    if (lifetime === 0) {
      return;
    }
    const tick = Math.floor(animationTickRef.current);
    for (let budget = MAX_PUFFS; nextSpawnTickRef.current <= tick; budget--) {
      if (budget === 0) {
        // far behind (tab was throttled): skip the backlog instead of
        // spawning hundreds of catch-up puffs at once
        nextSpawnTickRef.current = tick + 1;
        break;
      }
      const spawnTick = nextSpawnTickRef.current;
      const [intervalRandom, rngAfterInterval] =
        resourceRandomNextPrimary(rngStateRef.current);
      const interval = emitterIntervalTicks(
        timedEffect.intervalTicks,
        timedEffect.randomTicks,
        intervalRandom,
      );
      const [attachmentRandom, rngAfterAttachment] =
        resourceRandomNextPrimary(rngAfterInterval);
      const [orientationRandom, rngAfterOrientation] =
        resourceRandomNextPrimary(rngAfterAttachment);
      rngStateRef.current = rngAfterOrientation;
      setPuffs((previous) => [
        ...previous.slice(-MAX_PUFFS + 1),
        {
          spawnTick,
          attachmentIndex: attachmentRandom % attachmentPoints.length,
          orientationRandom,
        },
      ]);
      nextSpawnTickRef.current = spawnTick + Math.max(1, interval);
    }
    setPuffs((previous) => {
      const alive = previous.filter((puff) => tick - puff.spawnTick < lifetime);
      return alive.length === previous.length ? previous : alive;
    });
  });

  // While puffs are alive, refresh their age-driven pose/alpha every
  // presentation frame; idle emitters cost nothing.
  const hasPuffs = puffs.length > 0;
  useEffect(() => {
    if (!hasPuffs) {
      return;
    }
    let frame: number;
    const loop = () => {
      setRenderTick(Math.floor(animationTickRef.current));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [hasPuffs, animationTickRef]);

  const meshSubresource = useMemo(() => {
    for (const group of effectSpr.lodGroups) {
      for (const vertex of group.mesh.vertices) {
        if (vertex.textureSubresource !== SPR_UNTEXTURED_SUBRESOURCE) {
          return vertex.textureSubresource;
        }
      }
    }
    return null;
  }, [effectSpr]);

  return (
    <>
      {puffs.map((puff, index) => (
        <EffectPuffView
          key={`${puff.spawnTick}-${index}`}
          puff={puff}
          renderTick={renderTick}
          definition={definition}
          effectSpr={effectSpr}
          attachmentPoints={attachmentPoints}
          meshSubresource={meshSubresource}
          textureProvider={effectTextureProvider}
          textured={textured}
        />
      ))}
    </>
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

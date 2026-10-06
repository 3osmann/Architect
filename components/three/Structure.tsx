"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges, useGLTF } from "@react-three/drei";
import type { Group } from "three";

/* ------------------------------------------------------------------
   PLACEHOLDER FOR YOUR OWN MODEL
   ------------------------------------------------------------------
   1. Drop your file in  /public/models/structure.glb
   2. Flip USE_CUSTOM_MODEL to `true`.
   The <Suspense> boundary in Hero3D handles loading + the loader UI.

   const { scene } = useGLTF("/models/structure.glb");
   useGLTF.preload("/models/structure.glb");
------------------------------------------------------------------ */
const USE_CUSTOM_MODEL = false;
const MODEL_PATH = "/models/structure.glb";

/** Loads a .glb/.gltf asset (suspends until ready — used inside <Suspense>). */
function CustomModel() {
  const { scene } = useGLTF(MODEL_PATH);
  return <primitive object={scene} />;
}

/**
 * Procedural brutalist massing: stacked slabs + a cantilevered block,
 * rendered as concrete volumes with hard wireframe edges.
 *
 * Motion: slow continuous Y rotation + pointer-driven parallax (the whole
 * group eases toward the normalized mouse position each frame).
 */
export default function Structure() {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const { pointer } = state; // normalized -1..1 across the viewport

    // Constant, slow turntable rotation
    group.current.rotation.y += delta * 0.15;

    // Parallax: ease the tilt/offset toward the cursor (frame-rate independent lerp)
    const targetX = pointer.y * 0.18;
    const targetY = pointer.x * 0.35;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05;
    group.current.position.x += (pointer.x * 0.35 - group.current.position.x) * 0.05;
    group.current.position.y += (1.4 + pointer.y * 0.2 - group.current.position.y) * 0.05;
  });

  if (USE_CUSTOM_MODEL) return <CustomModel />;

  const concrete = "#b7b5ae"; // raw concrete tone

  return (
    <group ref={group} position={[0, 1.4, 0]} scale={0.95}>
      {/* Base plinth */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[3.4, 0.25, 3.4]} />
        <meshStandardMaterial color={concrete} roughness={0.95} metalness={0.05} />
        <Edges color="#0a0a0a" />
      </mesh>

      {/* Main tower */}
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[1.5, 2.8, 1.5]} />
        <meshStandardMaterial color={concrete} roughness={0.9} metalness={0.05} />
        <Edges color="#0a0a0a" />
      </mesh>

      {/* Cantilevered block */}
      <mesh position={[0.95, 0.7, 0.2]}>
        <boxGeometry args={[1.6, 0.9, 1.9]} />
        <meshStandardMaterial color="#9d9b95" roughness={0.85} metalness={0.1} />
        <Edges color="#0a0a0a" />
      </mesh>

      {/* Pure wireframe volume — reads as an unbuilt/future phase */}
      <mesh position={[0.3, 1.9, -0.4]}>
        <boxGeometry args={[1.1, 1.4, 1.1]} />
        <meshBasicMaterial color="#e6e5e1" wireframe transparent opacity={0.45} />
      </mesh>

      {/* Floating slab — adds depth and a touch of weightlessness */}
      <mesh position={[-1.1, 1.35, 0.9]} rotation={[0, 0.4, 0.12]}>
        <boxGeometry args={[1.9, 0.12, 1.2]} />
        <meshStandardMaterial color="#d3d1cb" roughness={0.7} metalness={0.15} />
        <Edges color="#0a0a0a" />
      </mesh>

      {/* Ground grid reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.34, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

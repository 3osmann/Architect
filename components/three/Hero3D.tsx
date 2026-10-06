"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import Structure from "./Structure";
import CanvasLoader from "./CanvasLoader";

/**
 * HERO 3D SETUP
 * -------------
 * - Client-only (imported via `dynamic(..., { ssr: false })` from <Hero />) —
 *   WebGL must never run on the server.
 * - Suspense wraps the model: any `.glb`/`.gltf` fetched by `Structure`
 *   suspends until ready, and <CanvasLoader /> renders in the meantime.
 * - `dpr` is capped at 1.75 for a good quality/perf balance on 2× displays.
 * - `<Environment resolution={256}>` uses built-in `Lightformer`s, so no
 *   external HDRI download is needed (keeps the bundle offline-friendly).
 */
export default function Hero3D() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.4, 7], fov: 35 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
    >
      {/* Ambient fill + hard key light: brutalist shadow edges */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 6, 4]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-6, 2, -4]} intensity={0.8} color="#8fa3b8" />

      <Suspense fallback={<CanvasLoader />}>
        <Structure />
        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.55}
          scale={14}
          blur={2.6}
          far={4}
          color="#000000"
        />
        <Environment resolution={256}>
          {/* Procedural studio lighting — swap for <Environment preset="city" /> if desired */}
          <Lightformer intensity={4} position={[0, 4, -6]} scale={[10, 4, 1]} />
          <Lightformer intensity={2} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 1, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
  );
}

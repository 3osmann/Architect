"use client";

import { Html, useProgress } from "@react-three/drei";

/**
 * Suspense fallback rendered *inside* the Canvas while the scene/model loads.
 * `useProgress` reports real asset progress once a `.glb` is being fetched;
 * until then it shows a minimal structural placeholder.
 */
export default function CanvasLoader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-pulseLine border border-white/40" />
        <p className="font-mono text-[10px] uppercase tracking-brutal text-white/60">
          Assembling structure — {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

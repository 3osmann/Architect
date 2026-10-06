"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProgress } from "@react-three/drei";

/**
 * Full-screen intro loader.
 * Hooks into drei's `useProgress` so real assets (a .glb, textures) drive the
 * bar automatically. With the procedural scene (no assets) it falls back to a
 * short timed sequence so the intro still feels deliberate.
 */
export default function Preloader() {
  const { progress, active } = useProgress();
  const [hidden, setHidden] = useState(false);

  // Real asset completion → finish shortly after the bar hits 100%.
  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setHidden(true), 500);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  // Fallback: no assets requested → complete after a fixed beat.
  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-ink p-5 sm:p-8"
        >
          <div className="flex items-center justify-between">
            <span className="label text-paper">Atelier Monolith</span>
            <span className="label">Loading</span>
          </div>

          <div className="flex items-end justify-between gap-6">
            <div className="h-px flex-1 self-center bg-white/15">
              <motion.div
                className="h-px bg-paper"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.max(progress, 12)}%` }}
                transition={{ duration: 0.4, ease: "linear" }}
              />
            </div>
            <span className="font-mono text-[11px] tracking-brutal text-fog">
              {String(Math.round(progress)).padStart(3, "0")}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="label">Structure / Light / Mass</span>
            <span className="label">Est. 1998</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

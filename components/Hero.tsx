"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { HeroContent } from "@/lib/types";

// The canvas must never execute on the server → loaded client-side only.
// While the chunk downloads, a lightweight overlay (Preloader) is on screen.
const Hero3D = dynamic(() => import("@/components/three/Hero3D"), {
  ssr: false,
  loading: () => null,
});

export default function Hero({ content }: { content: HeroContent }) {
  const lines = content.lines.slice(0, 3);
  const last = lines.length - 1;

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-ink">
      {/* Interactive 3D layer */}
      <div className="absolute inset-0 z-0">
        <Hero3D />
      </div>

      {/* Vignette + grid so type stays readable over the model */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(10,10,10,0.85)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-10 grid-overlay opacity-60" />

      {/* Headline overlay */}
      <div className="relative z-20 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="label mb-6"
            >
              {content.eyebrow}
            </motion.p>

            <h1 className="text-[13vw] font-semibold uppercase leading-[0.86] tracking-[-0.03em] sm:text-[11vw] lg:text-[8.5vw]">
              {lines.map((line, i) => (
                <span key={`${line}-${i}`} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 1.1,
                      delay: 1 + i * 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {/* Last line: first word italic/concrete, remainder upright/paper */}
                    {i === last && line.includes(" ") ? (
                      <span className="text-concrete italic">
                        {line.slice(0, line.lastIndexOf(" "))}{" "}
                        <span className="not-italic text-paper">
                          {line.slice(line.lastIndexOf(" ") + 1)}
                        </span>
                      </span>
                    ) : (
                      line
                    )}
                  </motion.span>
                </span>
              ))}
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start gap-6 lg:items-end"
          >
            <p className="max-w-xs text-sm leading-relaxed text-fog lg:text-right">{content.sub}</p>

            {/* CTA — hard-edged fill on hover */}
            <a
              href="#work"
              className="group relative inline-flex items-center gap-4 overflow-hidden border border-paper px-8 py-4"
            >
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-paper transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100" />
              <span className="relative font-mono text-[11px] uppercase tracking-brutal text-paper transition-colors duration-500 group-hover:text-ink">
                {content.cta}
              </span>
              <span className="relative text-paper transition-all duration-500 group-hover:translate-x-1 group-hover:text-ink">
                ↓
              </span>
            </a>
          </motion.div>
        </div>

        {/* Bottom technical strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="mt-12 hidden items-center justify-between border-t border-white/10 pt-5 md:flex"
        >
          <span className="label">{content.metaLeft}</span>
          <span className="label">{content.coords}</span>
          <span className="label">{content.metaRight}</span>
        </motion.div>
      </div>
    </section>
  );
}

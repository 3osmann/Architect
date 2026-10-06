"use client";

import { motion } from "framer-motion";
import type { Project } from "@/lib/types";
import Reveal from "./Reveal";

/** Hover state machine: children inherit these labels for staggered reveals. */
const hoverState = {
  rest: {},
  hover: {},
};

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="relative bg-ink">
      <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        {/* Section header */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="label">02 — Selected Work</span>
            <h2 className="mt-4 text-5xl font-semibold uppercase tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              Projects
            </h2>
          </div>
          <p className="max-w-xs font-mono text-[11px] leading-relaxed text-steel sm:text-right">
            {String(projects.length).padStart(2, "0")} works
            <br />
            Residential · Cultural · Civic
          </p>
        </div>

        {/* Empty state (DB reachable but nothing published yet) */}
        {projects.length === 0 && (
          <div className="mt-12 border border-dashed border-white/15 px-6 py-20 text-center">
            <p className="label">No published projects</p>
            <p className="mt-3 text-sm text-fog">
              Sign in to the admin dashboard and publish your first project.
            </p>
          </div>
        )}

        {/* Masonry grid — CSS columns give true masonry, framer handles motion */}
        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {projects.map((project, i) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
                delay: (i % 3) * 0.1,
              }}
              className="mb-5 break-inside-avoid"
            >
              {/* Hover propagator: `rest` ↔ `hover` flows to every motion child */}
              <motion.div
                initial="rest"
                whileHover="hover"
                animate="rest"
                variants={hoverState}
                className="group relative block w-full cursor-pointer overflow-hidden bg-carbon"
              >
                {/* Media */}
                <div className={`relative w-full ${project.ratio} overflow-hidden`}>
                  <motion.div
                    variants={{
                      rest: { scale: 1 },
                      hover: {
                        scale: 1.07,
                        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                      },
                    }}
                    className={`absolute inset-0 bg-gradient-to-br ${project.tone}`}
                  >
                    {/* Structural drawing overlay = placeholder for project photography */}
                    <div className="grid-overlay absolute inset-0 opacity-70" />
                    <div className="absolute inset-0 border border-white/10" />
                    <span className="absolute left-4 top-4 font-mono text-[10px] tracking-brutal text-white/50">
                      {String(project.sort_order || i + 1).padStart(2, "0")}
                    </span>
                  </motion.div>

                  {/* Desktop: staggered reveal on hover */}
                  <div className="absolute inset-0 z-10 hidden flex-col justify-end bg-gradient-to-t from-black/85 via-black/20 to-transparent p-6 md:flex">
                    <motion.h3
                      variants={{
                        rest: { opacity: 0, y: 18 },
                        hover: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.05 } },
                      }}
                      className="text-2xl font-semibold uppercase tracking-tight text-white"
                    >
                      {project.title}
                    </motion.h3>
                    <motion.div
                      variants={{
                        rest: { opacity: 0, y: 14 },
                        hover: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.14 } },
                      }}
                      className="mt-2 flex items-center justify-between gap-4"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-brutal text-white/70">
                        {project.location}
                      </span>
                      <span className="font-mono text-[10px] text-white/50">{project.year}</span>
                    </motion.div>

                    <motion.span
                      variants={{
                        rest: { opacity: 0, x: -8 },
                        hover: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.22 } },
                      }}
                      className="mt-4 font-mono text-[10px] uppercase tracking-brutal text-concrete"
                    >
                      View project →
                    </motion.span>
                  </div>
                </div>

                {/* Mobile: caption is always visible (no hover on touch) */}
                <div className="flex items-baseline justify-between gap-4 px-1 py-4 md:hidden">
                  <div>
                    <h3 className="text-lg font-semibold uppercase tracking-tight">
                      {project.title}
                    </h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-brutal text-steel">
                      {project.location}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-steel">{project.year}</span>
                </div>
              </motion.div>

              {/* Desktop: technical caption row below the media */}
              <div className="hidden items-center justify-between border-t border-white/10 px-1 pt-3 md:flex">
                <span className="font-mono text-[10px] uppercase tracking-brutal text-steel">
                  {project.category}
                </span>
                <span className="font-mono text-[10px] text-steel">
                  {String(project.sort_order || i + 1).padStart(2, "0")}
                </span>
              </div>
            </motion.article>
          ))}
        </div>

        <Reveal className="mt-8">
          <div className="flex justify-center">
            <a
              href="#contact"
              className="group relative inline-flex items-center gap-4 overflow-hidden border border-white/25 px-8 py-4"
            >
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-paper transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100" />
              <span className="relative font-mono text-[11px] uppercase tracking-brutal text-paper transition-colors duration-500 group-hover:text-ink">
                Full archive
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

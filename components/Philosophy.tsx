"use client";

import Reveal from "./Reveal";
import type { PhilosophyContent } from "@/lib/types";

/**
 * Philosophy / About — inverted (paper) section for editorial contrast.
 * Asymmetrical 12-column layout: sticky index on the left, statement on the right.
 * All copy comes from the `philosophy` settings row.
 */
export default function Philosophy({ content }: { content: PhilosophyContent }) {
  return (
    <section id="philosophy" className="relative bg-paper text-ink">
      <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Sticky technical index */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <span className="label !text-ink/50">{content.label}</span>
              <div className="mt-6 h-px w-full bg-ink/15" />
              <p className="mt-6 max-w-[22ch] whitespace-pre-line font-mono text-[11px] leading-relaxed text-ink/60">
                {content.studio.join("\n")}
              </p>
            </div>
          </div>

          {/* Statement */}
          <div className="lg:col-span-9">
            <Reveal>
              <h2 className="text-[9vw] font-semibold uppercase leading-[0.9] tracking-[-0.03em] sm:text-[6vw] lg:text-[4.2vw]">
                {content.heading[0]}
                <br />
                <span className="italic text-ink/40">{content.heading[1]}</span>
                <br />
                {content.heading[2]}
              </h2>
            </Reveal>

            {/* Asymmetric split: offset image-block vs. text */}
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
              <Reveal className="md:col-span-5 md:col-start-1" delay={0.05}>
                <figure>
                  <div className="concrete relative aspect-[4/5] w-full border border-ink/10">
                    {/* Structural line drawing — placeholder for studio photography */}
                    <svg
                      viewBox="0 0 200 250"
                      className="absolute inset-0 h-full w-full"
                      aria-hidden="true"
                    >
                      <g stroke="#f2f1ee" strokeOpacity="0.35" fill="none" strokeWidth="0.5">
                        <rect x="30" y="60" width="90" height="150" />
                        <rect x="120" y="110" width="55" height="100" />
                        <line x1="30" y1="95" x2="200" y2="95" />
                        <line x1="30" y1="150" x2="200" y2="150" />
                        <line x1="75" y1="60" x2="75" y2="210" />
                        <line x1="10" y1="210" x2="190" y2="45" strokeDasharray="3 4" />
                      </g>
                    </svg>
                    <figcaption className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-brutal text-white/70">
                      {content.figCaption}
                    </figcaption>
                  </div>
                </figure>
              </Reveal>

              <Reveal className="md:col-span-6 md:col-start-7 md:pt-24" delay={0.15}>
                <p className="text-lg leading-relaxed text-ink/75 sm:text-xl">{content.intro}</p>
                <p className="mt-6 text-sm leading-relaxed text-ink/55 sm:text-base">
                  {content.body}
                </p>

                <div className="mt-10 grid grid-cols-3 gap-4 border-t border-ink/15 pt-6">
                  {content.stats.map((s) => (
                    <div key={s.label}>
                      <p className="text-3xl font-semibold tracking-tight sm:text-4xl">{s.value}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink/50">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Principles */}
            <div className="mt-20 grid grid-cols-1 border-t border-ink/15 sm:grid-cols-3">
              {content.principles.map((p, i) => (
                <Reveal
                  key={`${p.n}-${p.title}`}
                  delay={i * 0.08}
                  className="border-b border-ink/15 py-8 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0"
                >
                  <span className="font-mono text-[10px] tracking-brutal text-ink/40">{p.n}</span>
                  <h3 className="mt-3 text-2xl font-semibold uppercase tracking-tight">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/60">{p.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

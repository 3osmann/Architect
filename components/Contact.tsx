"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "./Reveal";
import type { ContactContent } from "@/lib/types";

const inputBase =
  "w-full border-b border-white/20 bg-transparent py-4 text-base text-paper outline-none transition-colors placeholder:text-steel focus:border-paper";

export default function Contact({ content }: { content: ContactContent }) {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Wire this to your API route / email provider (Resend, SendGrid…).
    setSent(true);
  }

  return (
    <footer id="contact" className="relative bg-ink">
      {/* Marquee divider */}
      <div className="overflow-hidden border-y border-white/10 py-5">
        <div className="flex w-max animate-marquee">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 items-center">
              {Array.from({ length: 6 }).map((__, j) => (
                <span
                  key={j}
                  className="px-8 font-mono text-[11px] uppercase tracking-brutal text-steel"
                >
                  Mass · Light · Void ·
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Statement */}
          <div className="lg:col-span-6">
            <span className="label">{content.label}</span>
            <Reveal>
              <h2 className="mt-6 text-[11vw] font-semibold uppercase leading-[0.88] tracking-[-0.03em] sm:text-[8vw] lg:text-[5vw]">
                {content.heading[0]}
                <br />
                <span className="italic text-concrete">{content.heading[1]}</span>
                <br />
                {content.heading[2]}
              </h2>
            </Reveal>

            <Reveal delay={0.1} className="mt-10">
              <a
                href={`mailto:${content.email}`}
                className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-brutal text-fog transition-colors hover:text-paper sm:text-sm"
              >
                {content.email}
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </a>
            </Reveal>

            <Reveal delay={0.15} className="mt-10">
              <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8 sm:grid-cols-3">
                <div>
                  <p className="label mb-3">Studio</p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-fog">
                    {content.address}
                  </p>
                </div>
                <div>
                  <p className="label mb-3">Phone</p>
                  <p className="text-sm leading-relaxed text-fog">{content.phone}</p>
                </div>
                <div>
                  <p className="label mb-3">Hours</p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-fog">
                    {content.hours}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal>
              <div className="concrete border border-white/10 p-6 sm:p-10">
                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="flex min-h-[340px] flex-col justify-center"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-brutal text-concrete">
                        Message received
                      </span>
                      <p className="mt-4 text-2xl font-semibold uppercase tracking-tight">
                        Thank you.
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-fog">
                        We review every enquiry personally and reply within two working days.
                      </p>
                      <button
                        onClick={() => setSent(false)}
                        className="mt-8 self-start border border-white/25 px-5 py-3 font-mono text-[10px] uppercase tracking-brutal text-paper transition-colors hover:bg-paper hover:text-ink"
                      >
                        Send another
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col gap-6"
                    >
                      <span className="label">Project enquiry</span>

                      <motion.input
                        required
                        name="name"
                        type="text"
                        placeholder="Name *"
                        whileFocus={{ borderColor: "#f2f1ee" }}
                        className={inputBase}
                      />
                      <motion.input
                        required
                        name="email"
                        type="email"
                        placeholder="Email *"
                        whileFocus={{ borderColor: "#f2f1ee" }}
                        className={inputBase}
                      />
                      <motion.input
                        name="location"
                        type="text"
                        placeholder="Site location"
                        whileFocus={{ borderColor: "#f2f1ee" }}
                        className={inputBase}
                      />
                      <motion.textarea
                        required
                        name="brief"
                        rows={4}
                        placeholder="Tell us about the project *"
                        whileFocus={{ borderColor: "#f2f1ee" }}
                        className={`${inputBase} resize-none`}
                      />

                      <button
                        type="submit"
                        className="group relative mt-2 inline-flex items-center justify-center gap-3 overflow-hidden border border-paper px-8 py-4"
                      >
                        <span className="absolute inset-0 origin-bottom scale-y-0 bg-paper transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100" />
                        <span className="relative font-mono text-[11px] uppercase tracking-brutal text-paper transition-colors duration-500 group-hover:text-ink">
                          Send enquiry
                        </span>
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {content.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="group font-mono text-[10px] uppercase tracking-brutal text-steel transition-colors hover:text-paper"
              >
                {s.label}
                <span className="ml-1 inline-block opacity-0 transition-opacity group-hover:opacity-100">
                  ↗
                </span>
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <span className="label">{content.copyright}</span>
            <span className="label">{content.coords}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

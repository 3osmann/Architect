"use client";

import { motion } from "framer-motion";
import type { NavContent } from "@/lib/types";

/** Fixed top bar — `mix-blend-difference` keeps it legible over canvas and paper alike. */
export default function Navbar({ content }: { content: NavContent }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-40 mix-blend-difference"
    >
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <a href="#" className="group flex items-baseline gap-3">
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-white sm:text-base">
            {content.brand}
          </span>
          <span className="font-mono text-[10px] tracking-brutal text-white/60 transition-colors group-hover:text-white">
            {content.brandMark}
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {content.links.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              className="group relative font-mono text-[11px] uppercase tracking-brutal text-white/70 transition-colors hover:text-white"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all duration-500 group-hover:w-full" />
            </a>
          ))}
        </div>

        <a
          href="#contact"
          className="border border-white/40 px-4 py-2 font-mono text-[10px] uppercase tracking-brutal text-white transition-colors hover:bg-white hover:text-black sm:px-5"
        >
          {content.cta}
        </a>
      </nav>
    </motion.header>
  );
}

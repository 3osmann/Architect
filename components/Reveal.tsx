"use client";

import { motion, type Variants } from "framer-motion";

const variants: Variants = {
  hidden: (_custom) => ({ opacity: 0, y: 28 }),
  visible: (custom: { delay: number; y: number }) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      delay: custom.delay,
    },
  }),
};

type RevealProps = {
  children: React.ReactNode;
  /** Seconds of delay — use for staggered groups */
  delay?: number;
  className?: string;
  /** Travel distance in px while revealing */
  y?: number;
};

/** Reusable scroll-reveal: fades + slides in once, when ~15% into view. */
export default function Reveal({ children, delay = 0, className, y = 28 }: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={variants}
      custom={{ delay, y }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-15% 0px" }}
    >
      {children}
    </motion.div>
  );
}

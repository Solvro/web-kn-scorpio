"use client";

import { MotionConfig, motion } from "motion/react";
import type { ReactNode } from "react";

/** Disables transform animations for people who prefer reduced motion. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/**
 * Fades and slides content up. Plays on scroll into view by default,
 * or immediately on page load with `onLoad` (use it for the hero).
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 24,
  onLoad = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  onLoad?: boolean;
}) {
  const target = { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(onLoad
        ? { animate: target }
        : {
            whileInView: target,
            viewport: { once: true, margin: "-80px" },
          })}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/** One line of a headline that slides up from behind a mask on page load. */
export function LineReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <span className="block overflow-hidden pb-[0.1em]">
      <motion.span
        className={className ?? "block"}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, delay, ease: "easeOut" }}
      >
        {children}
      </motion.span>
    </span>
  );
}

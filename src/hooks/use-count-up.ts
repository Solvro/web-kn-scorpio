"use client";

import { animate, useMotionValue, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Count-up for a stat. Returns a MotionValue to render as
 * `<motion.span>{value}</motion.span>`: Motion owns that text node, so React
 * never fights over it, and the server renders the real value (crawlers, link
 * previews, no JavaScript). The browser resets it to 0 only when `ref` starts
 * below the viewport, then counts up once `active` turns true.
 */
function useCountUp(
  ref: RefObject<HTMLElement | null>,
  target: number,
  active: boolean,
  duration = 1.6,
): MotionValue<number> {
  const count = useMotionValue(target);
  const rounded = useTransform(count, (value) => Math.round(value));
  const armed = useRef(false);

  useLayoutEffect(() => {
    const element = ref.current;
    const reduced = prefersReducedMotion();
    if (
      element != null &&
      !reduced &&
      element.getBoundingClientRect().top > window.innerHeight
    ) {
      count.jump(0);
      armed.current = true;
    }
  }, [count, ref]);

  // A new value (e.g. after revalidation) replaces the shown one, unless the
  // count-up hasn't run yet; then it simply counts to the new target.
  useEffect(() => {
    if (!armed.current) {
      count.jump(target);
    }
  }, [count, target]);

  useEffect(() => {
    if (!active || !armed.current) {
      return;
    }
    armed.current = false;
    const controls = animate(count, target, {
      duration,
      ease: [0.33, 1, 0.68, 1],
    });
    return () => {
      controls.stop();
    };
  }, [active, count, duration, target]);

  return rounded;
}

export { useCountUp };

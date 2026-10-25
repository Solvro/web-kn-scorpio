"use client";

import { inView } from "motion/react";
import { useLayoutEffect } from "react";
import type { RefObject } from "react";

/**
 * Server-visible scroll reveal. The element renders in its final state (no
 * JavaScript, slow hydration, crawlers). Before the first client paint, an
 * element still below the viewport gets data-reveal="pending"; it switches to
 * "shown" when it scrolls into view. Style the hidden state with
 * `data-[reveal=pending]:` classes and add a transition.
 */
export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  amount = 0.2,
) {
  useLayoutEffect(() => {
    const element = ref.current;
    if (
      element == null ||
      element.getBoundingClientRect().top <= window.innerHeight
    ) {
      return;
    }
    element.dataset.reveal = "pending";
    // Fires once when the element enters the viewport.
    const stop = inView(
      element,
      () => {
        element.dataset.reveal = "shown";
      },
      { amount },
    );
    return () => {
      stop();
      // If the effect re-runs (or unmounts) before the reveal, don't leave the
      // element hidden with no observer left to show it.
      if (element.dataset.reveal === "pending") {
        delete element.dataset.reveal;
      }
    };
  }, [amount, ref]);
}

"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** Current preference, for code that runs in effects (not during render). */
export function prefersReducedMotion() {
  return window.matchMedia(QUERY).matches;
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => {
    media.removeEventListener("change", onChange);
  };
}

/**
 * Hydration-safe reduced-motion preference. Motion's useReducedMotion reads
 * the media query during the first client render, which differs from the
 * server (false) and breaks hydration when styles depend on it. This returns
 * false while hydrating, then the real preference, and follows changes.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}

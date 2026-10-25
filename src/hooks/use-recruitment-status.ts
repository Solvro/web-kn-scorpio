"use client";

import { useCallback, useSyncExternalStore } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;

function subscribeToMinuteTick(onTick: () => void) {
  const interval = window.setInterval(onTick, 60_000);
  return () => {
    window.clearInterval(interval);
  };
}

export interface RecruitmentStatus {
  isOpen: boolean;
  /** Whole days left, or null until the browser clock is known (server render). */
  daysLeft: number | null;
}

/**
 * Single source of truth for "is recruitment open". Uses the server-computed
 * value until hydration, then the browser clock, updated every minute. Call it
 * once per page and pass the result down, so every section switches together.
 */
export function useRecruitmentStatus(
  deadline: string | null,
  serverIsOpen: boolean,
): RecruitmentStatus {
  const getDaysLeft = useCallback(() => {
    if (deadline == null) {
      return null;
    }
    const remaining = new Date(deadline).getTime() - Date.now();
    return Math.ceil(remaining / DAY_MS);
  }, [deadline]);
  const daysLeft = useSyncExternalStore<number | null>(
    subscribeToMinuteTick,
    getDaysLeft,
    () => null,
  );
  return {
    isOpen: daysLeft == null ? serverIsOpen : daysLeft > 0,
    daysLeft,
  };
}

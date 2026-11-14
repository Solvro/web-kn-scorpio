"use client";

import { motion } from "motion/react";
import { useId } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

export interface FilterChip<T extends string> {
  value: T;
  label: string;
  count: number;
}

/** Toggle buttons for filtering a list; the orange pill slides to the active one. */
export function FilterChips<T extends string>({
  label,
  chips,
  value,
  onChange,
  className,
}: {
  /** Accessible name of the group, e.g. "Filtruj według kategorii". */
  label: string;
  chips: FilterChip<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const layoutId = useId();

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {chips.map((chip) => {
        const active = chip.value === value;
        return (
          <button
            key={chip.value}
            type="button"
            aria-pressed={active}
            onClick={() => {
              onChange(chip.value);
            }}
            className={cn(
              "focus-visible:ring-ring/50 relative inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 active:scale-[0.98]",
              active
                ? "text-primary-foreground border-transparent"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 380, damping: 34 }
                }
                className="bg-primary absolute inset-0 rounded-full"
              />
            ) : null}
            <span className="relative">{chip.label}</span>
            <span
              className={cn(
                "relative tabular-nums",
                active
                  ? "text-primary-foreground/75"
                  : "text-muted-foreground/70",
              )}
            >
              {chip.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

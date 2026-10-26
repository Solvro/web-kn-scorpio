"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** Fades content up when it scrolls into view; visible in the server HTML (see useScrollReveal). */
function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollReveal(ref);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${String(delay)}ms` }}
      className={cn(
        "motion-safe:ease-out-expo data-[reveal=pending]:translate-y-8 data-[reveal=pending]:opacity-0 motion-safe:transition-all motion-safe:duration-700",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { Reveal };

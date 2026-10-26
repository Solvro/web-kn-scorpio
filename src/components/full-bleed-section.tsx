import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Section that breaks out of the max-w-7xl layout wrapper to span the viewport.
 * Accepts a ref (React 19) for scroll-linked animations. The 100vw overhang
 * caused by the vertical scrollbar is clipped on html/body in globals.css.
 */
function FullBleedSection({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "relative left-1/2 w-screen -translate-x-1/2 overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

export { FullBleedSection };

"use client";

import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string;
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean;
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode;
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean;
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number;
}

const MarqueeCopyContext = createContext(false);

/**
 * True inside the repeated copies that only exist for the seamless loop.
 * Interactive children should use it to leave the Tab order (tabIndex={-1});
 * the copies stay clickable because the animation keeps them on screen.
 */
export function useIsMarqueeCopy() {
  return useContext(MarqueeCopyContext);
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className,
      )}
    >
      {Array.from({ length: repeat }, (_, index) => (
        <div
          key={index}
          // Copies exist only for the seamless loop: hidden from assistive tech,
          // but not inert, since they are on screen and must stay clickable.
          aria-hidden={index > 0 ? true : undefined}
          className={cn("flex shrink-0 justify-around gap-(--gap)", {
            "animate-marquee flex-row": !vertical,
            "animate-marquee-vertical flex-col": vertical,
            "group-hover:[animation-play-state:paused]": pauseOnHover,
            "[animation-direction:reverse]": reverse,
            // Hold still for visitors who asked for less motion.
            "motion-reduce:[animation-play-state:paused]": true,
          })}
        >
          <MarqueeCopyContext value={index > 0}>{children}</MarqueeCopyContext>
        </div>
      ))}
    </div>
  );
}

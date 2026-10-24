"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { FIELD_MOMENTS } from "@/app/temporary-data";
import { cn } from "@/lib/utils";

// Alternating heights give the strip a rhythm instead of a uniform filmstrip.
const HEIGHTS = ["h-[58vh]", "h-[44vh]", "h-[50vh]", "h-[40vh]"];

const DESKTOP_QUERY = "(min-width: 768px)";

function subscribeToDesktop(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

/** Pin and pan only on desktop with motion allowed; otherwise fall back to native swipe. */
function usePinnedPan() {
  const reduce = useReducedMotion() ?? false;
  const isDesktop = useSyncExternalStore(
    subscribeToDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
  return isDesktop && !reduce;
}

export function FieldGallerySection() {
  const wrapRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pinned = usePinnedPan();
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!pinned || track == null) {
      return;
    }
    const measure = () => {
      setDistance(Math.max(track.scrollWidth - window.innerWidth, 0));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  return (
    <section
      ref={wrapRef}
      aria-labelledby="field-heading"
      className="relative left-1/2 w-screen -translate-x-1/2"
      style={
        pinned ? { height: `calc(100dvh + ${String(distance)}px)` } : undefined
      }
    >
      <div
        className={cn(
          pinned
            ? "sticky top-0 flex h-[100dvh] items-center overflow-hidden"
            : "py-24",
        )}
      >
        <motion.div
          ref={trackRef}
          style={pinned ? { x } : undefined}
          className={cn(
            "flex items-end gap-5 px-4 sm:px-6 md:gap-8 md:pr-[12vw] md:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]",
            !pinned &&
              "snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] overflow-x-auto sm:scroll-px-6 [&::-webkit-scrollbar]:hidden",
          )}
        >
          <div className="flex w-[min(26rem,78vw)] shrink-0 snap-start flex-col justify-end self-stretch pb-10 md:pb-16">
            <h2
              id="field-heading"
              className="text-foreground text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl"
            >
              W terenie
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
              Łazik sprawdza się dopiero tam, gdzie kończy się asfalt. Kilka
              kadrów z zawodów i testów.
            </p>
          </div>

          {FIELD_MOMENTS.map((moment, index) => (
            <figure
              key={moment.src}
              className={cn(
                "shrink-0 snap-start",
                index % 2 === 1 ? "md:mb-16" : "md:mb-0",
              )}
            >
              <div
                className={cn(
                  "group relative max-w-[86vw] overflow-hidden rounded-lg",
                  pinned ? HEIGHTS[index % HEIGHTS.length] : "h-[52vh]",
                )}
                style={{
                  aspectRatio: `${String(moment.width)} / ${String(moment.height)}`,
                }}
              >
                <Image
                  src={moment.src}
                  alt={moment.alt}
                  fill
                  sizes="(min-width: 768px) 60vw, 86vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <figcaption className="text-muted-foreground mt-3 text-sm">
                {moment.caption}
              </figcaption>
            </figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

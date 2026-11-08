"use client";

import type { MotionValue } from "motion/react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef, useSyncExternalStore } from "react";

import { HighlightedText } from "@/components/highlighted-text";
import { Reveal } from "@/components/reveal";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { toRoman } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";
import { cmsImageLoader } from "@/lib/cms-image";
import { cn } from "@/lib/utils";

// Cards stack (sticky) only from md up; below that they are a plain list.
const STACK_QUERY = "(min-width: 768px)";

function subscribeToStackQuery(onChange: () => void) {
  const media = window.matchMedia(STACK_QUERY);
  media.addEventListener("change", onChange);
  return () => {
    media.removeEventListener("change", onChange);
  };
}

function isStacked() {
  return window.matchMedia(STACK_QUERY).matches;
}

function isStackedOnServer() {
  return false;
}

function resultLabel(item: Achievement): string {
  if (item.result === "place" && item.place != null) {
    return `${toRoman(item.place)}\u00A0miejsce`;
  }
  return item.result === "distinction" ? "Wyróżnienie" : "Tytuł";
}

function StoryCard({
  item,
  index,
  count,
  progress,
  animated,
}: {
  item: Achievement;
  index: number;
  count: number;
  progress: MotionValue<number>;
  animated: boolean;
}) {
  // Each card recedes a little more for every card that lands on top of it.
  const scale = useTransform(
    progress,
    [index / count, 1],
    [1, 1 - (count - 1 - index) * 0.04],
  );

  return (
    <div
      style={{ top: `calc(6rem + ${String(index * 1.5)}rem)` }}
      className="md:sticky md:pb-[18vh] md:last:pb-0"
    >
      <motion.article
        style={animated ? { scale } : undefined}
        className="bg-card border-border grid origin-top grid-cols-1 overflow-hidden rounded-lg border shadow-[0_-24px_60px_-20px_oklch(0.1_0.005_285/0.8)] md:min-h-[520px] md:grid-cols-2"
      >
        <div className="flex flex-col justify-between gap-10 p-8 sm:p-10 lg:p-14">
          <div className="flex items-start justify-between gap-6">
            <p
              aria-hidden
              className={cn(
                "text-7xl leading-none font-bold tracking-tighter sm:text-8xl lg:text-9xl",
                item.place === 1 ? "text-primary" : "text-foreground/90",
              )}
            >
              {item.result === "place" && item.place != null
                ? toRoman(item.place)
                : null}
            </p>
            {item.year == null ? null : (
              <p className="text-muted-foreground pt-2 text-lg font-medium tabular-nums">
                {item.year}
              </p>
            )}
          </div>
          <div>
            <p className="text-primary text-sm font-medium">
              {item.category == null
                ? resultLabel(item)
                : `${resultLabel(item)}, ${item.category}`}
            </p>
            <h3 className="text-foreground mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              {item.title}
            </h3>
            {item.story == null ? null : (
              <p className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed sm:text-lg">
                {item.story}
              </p>
            )}
          </div>
        </div>

        <div
          className={cn(
            "relative min-h-[260px]",
            item.imageIsCutout &&
              "bg-[radial-gradient(circle_at_60%_55%,var(--accent),transparent_70%)]",
          )}
        >
          {item.image == null ? (
            <div className="from-primary/90 to-secondary absolute inset-0 bg-linear-to-br" />
          ) : (
            <Image
              loader={cmsImageLoader}
              src={item.image.src}
              alt={item.image.alt}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className={
                item.imageIsCutout ? "object-contain p-10" : "object-cover"
              }
            />
          )}
        </div>
      </motion.article>
    </div>
  );
}

export function StoriesSection({
  title,
  stories,
}: {
  title: string | null;
  stories: Achievement[];
}) {
  const container = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const stacked = useSyncExternalStore(
    subscribeToStackQuery,
    isStacked,
    isStackedOnServer,
  );
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  if (stories.length === 0) {
    return null;
  }

  // A plain section (no FullBleedSection): its overflow clipping would break sticky.
  return (
    <section className="px-4 py-24 sm:px-6 lg:py-32">
      {title == null ? null : (
        <Reveal>
          <h2 className="text-foreground max-w-3xl text-4xl font-bold tracking-tighter text-balance sm:text-5xl lg:text-6xl">
            <HighlightedText text={title} />
          </h2>
        </Reveal>
      )}
      <div ref={container} className="mt-12 flex flex-col gap-6 md:gap-0">
        {stories.map((item, index) => (
          <StoryCard
            key={item.id}
            item={item}
            index={index}
            count={stories.length}
            progress={scrollYProgress}
            animated={stacked ? !reduce : false}
          />
        ))}
      </div>
    </section>
  );
}

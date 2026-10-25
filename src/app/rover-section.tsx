"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import type { PanInfo, Variants } from "motion/react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

import { FullBleedSection } from "@/components/full-bleed-section";
import { HighlightedText } from "@/components/highlighted-text";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { SectionHeading } from "@/lib/api/home-page";
import type { Rover } from "@/lib/api/rovers";
import { cmsImageLoader } from "@/lib/cms-image";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 400;

const roverVariants: Variants = {
  enter: (direction: number) => ({
    x: `${String(direction * 45)}%`,
    rotate: direction * 6,
    opacity: 0,
    filter: "blur(14px)",
  }),
  center: { x: "0%", rotate: 0, opacity: 1, filter: "blur(0px)" },
  exit: (direction: number) => ({
    x: `${String(direction * -45)}%`,
    rotate: direction * -6,
    opacity: 0,
    filter: "blur(14px)",
  }),
};

const fadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const glyphVariants: Variants = {
  enter: (direction: number) => ({ x: direction * 160, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction * -160, opacity: 0 }),
};

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

export function RoverSection({
  heading,
  rovers,
}: {
  heading: SectionHeading;
  rovers: Rover[];
}) {
  const reduce = usePrefersReducedMotion();
  // Open on the newest rover, the rail then reads as a trip back in time.
  const [[index, direction], setPage] = useState<[number, number]>([
    Math.max(rovers.length - 1, 0),
    0,
  ]);
  const rover = rovers.at(index);

  const goTo = (next: number) => {
    if (next === index) {
      return;
    }
    setPage([wrapIndex(next, rovers.length), next > index ? 1 : -1]);
  };
  const step = (delta: number) => {
    const next = wrapIndex(index + delta, rovers.length);
    setPage([next, delta]);
    return next;
  };
  const railReferences = useRef<(HTMLButtonElement | null)[]>([]);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 120,
    damping: 18,
  });
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [6, -6]), {
    stiffness: 120,
    damping: 18,
  });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };
  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) {
      step(1);
    } else if (
      info.offset.x > SWIPE_DISTANCE ||
      info.velocity.x > SWIPE_VELOCITY
    ) {
      step(-1);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    // Move focus with the selection, so Enter acts on the generation now shown.
    if (event.key === "ArrowRight") {
      event.preventDefault();
      railReferences.current[step(1)]?.focus();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      railReferences.current[step(-1)]?.focus();
    }
  };

  if (rover == null) {
    return null;
  }

  return (
    <FullBleedSection id="generacje" className="scroll-mt-16 py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal>
          {heading.title === "" ? null : (
            <h2 className="text-foreground text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              <HighlightedText text={heading.title} />
            </h2>
          )}
          {heading.intro == null ? null : (
            <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
              {heading.intro}
            </p>
          )}
        </Reveal>

        <div
          role="region"
          aria-roledescription="karuzela"
          aria-label="Generacje łazika Scorpio"
          className="relative mt-10 lg:mt-4"
        >
          <div className="relative grid min-h-[560px] grid-cols-1 items-center lg:min-h-[500px] lg:grid-cols-12">
            {/* Oversized generation mark sitting behind the rover */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden lg:justify-end"
            >
              <AnimatePresence
                initial={false}
                custom={direction}
                mode="popLayout"
              >
                <motion.span
                  key={rover.id}
                  custom={direction}
                  variants={reduce ? fadeVariants : glyphVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
                  className="text-[clamp(13rem,34vw,30rem)] leading-none font-bold tracking-tighter text-transparent select-none [-webkit-text-stroke:1.5px_oklch(1_0_0/0.13)] lg:pr-8"
                >
                  {rover.glyph}
                </motion.span>
              </AnimatePresence>
            </div>

            <div
              aria-live="polite"
              className="relative order-2 min-h-[220px] lg:order-1 lg:col-span-4"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={rover.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                >
                  {rover.year == null ? null : (
                    <p className="text-muted-foreground font-mono text-sm tabular-nums">
                      {rover.year}
                    </p>
                  )}
                  <h3 className="text-foreground mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                    {rover.name}
                  </h3>
                  <p className="text-primary mt-4 text-lg font-medium">
                    {rover.highlight}
                  </p>
                  <p className="text-muted-foreground mt-3 max-w-sm text-base leading-relaxed">
                    {rover.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div
              className="relative order-1 h-[340px] cursor-grab touch-pan-y active:cursor-grabbing sm:h-[420px] lg:order-2 lg:col-span-8 lg:h-[500px]"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={handleDragEnd}
              onPointerMove={handlePointerMove}
              onPointerLeave={resetPointer}
              style={{ perspective: 1200 }}
            >
              <div
                aria-hidden
                className="bg-primary/25 absolute inset-x-[18%] bottom-[4%] h-16 rounded-[100%] blur-3xl"
              />
              <AnimatePresence
                initial={false}
                custom={direction}
                mode="popLayout"
              >
                <motion.div
                  key={rover.id}
                  custom={direction}
                  variants={reduce ? fadeVariants : roverVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.75, ease: EASE_OUT_EXPO }}
                  className="absolute inset-0"
                >
                  <motion.div
                    className="relative h-full w-full"
                    style={reduce ? undefined : { rotateX, rotateY }}
                  >
                    <Image
                      loader={cmsImageLoader}
                      src={rover.image.src}
                      alt={rover.name}
                      fill
                      draggable={false}
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      className="pointer-events-none object-contain p-4 drop-shadow-[0_30px_40px_oklch(0.18_0.005_285/0.7)] sm:p-8"
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="mt-8 flex items-center gap-3 sm:gap-5">
            <Button
              variant="outline"
              size="icon-lg"
              className="shrink-0 rounded-full"
              onClick={() => {
                step(-1);
              }}
            >
              <ArrowLeftIcon weight="bold" />
              <span className="sr-only">Poprzednia generacja</span>
            </Button>

            <ol className="flex flex-1 snap-x [scrollbar-width:none] gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {rovers.map((generation, generationIndex) => {
                const active = generationIndex === index;
                return (
                  <li
                    key={generation.id}
                    className="min-w-[88px] flex-1 snap-start"
                  >
                    <button
                      ref={(node) => {
                        railReferences.current[generationIndex] = node;
                      }}
                      type="button"
                      aria-current={active ? "true" : undefined}
                      onClick={() => {
                        goTo(generationIndex);
                      }}
                      onKeyDown={handleKeyDown}
                      className={cn(
                        "group relative flex w-full flex-col items-center gap-2 rounded-md px-2 pt-2 pb-4 transition-colors",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span className="relative h-12 w-full">
                        <Image
                          loader={cmsImageLoader}
                          src={generation.image.src}
                          alt=""
                          fill
                          sizes="96px"
                          className={cn(
                            "object-contain transition-all duration-300",
                            active
                              ? "opacity-100"
                              : "opacity-40 grayscale group-hover:opacity-80",
                          )}
                        />
                      </span>
                      <span className="text-xs font-medium whitespace-nowrap">
                        {generation.name.replace("Scorpio ", "")}
                      </span>
                      {active ? (
                        <motion.span
                          layoutId="rover-rail-indicator"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                          className="bg-primary absolute inset-x-3 bottom-0 h-0.5 rounded-full"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ol>

            <Button
              variant="outline"
              size="icon-lg"
              className="shrink-0 rounded-full"
              onClick={() => {
                step(1);
              }}
            >
              <ArrowRightIcon weight="bold" />
              <span className="sr-only">Następna generacja</span>
            </Button>
          </div>
        </div>
      </div>
    </FullBleedSection>
  );
}

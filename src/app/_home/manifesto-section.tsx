"use client";

import type { MotionValue } from "motion/react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { useMemo, useRef, useSyncExternalStore } from "react";

import { FullBleedSection } from "@/components/full-bleed-section";
import { useCountUp } from "@/hooks/use-count-up";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { HomePageContent } from "@/lib/api/home-page";
import type { Stat } from "@/lib/api/stats";
import { highlightedWords, wordText } from "@/lib/highlight";
import type { HighlightedWord } from "@/lib/highlight";

const PHOTO_MARKER = "{foto}";

/** Photo markers are no longer rendered; strip them so they don't show up as text. */
function buildWords(text: string): HighlightedWord[] {
  return highlightedWords(text.replaceAll(PHOTO_MARKER, " "));
}

function unsubscribeFromNothing() {
  // Nothing to clean up: hydration state never changes after mount.
}

function subscribeToNothing() {
  return unsubscribeFromNothing;
}

function RevealWord({
  word,
  progress,
  range,
  animated,
}: {
  word: HighlightedWord;
  progress: MotionValue<number>;
  range: [number, number];
  /** False on the server and with reduced motion: render fully lit. */
  animated: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);

  return (
    <motion.span style={animated ? { opacity } : undefined}>
      {word.parts.map((part, partIndex) => (
        <span
          key={`${String(partIndex)}-${part.text}`}
          className={part.highlighted ? "text-primary" : undefined}
        >
          {part.text}
        </span>
      ))}{" "}
    </motion.span>
  );
}

function StatCounter({
  value,
  label,
  active,
}: {
  value: number;
  label: string;
  active: boolean;
}) {
  const numberRef = useRef<HTMLParagraphElement>(null);
  const shown = useCountUp(numberRef, value, active);
  return (
    <div className="border-border border-l pl-5 sm:pl-8">
      <p
        ref={numberRef}
        className="text-foreground text-6xl font-bold tracking-tighter tabular-nums sm:text-7xl lg:text-8xl"
      >
        <motion.span>{shown}</motion.span>
      </p>
      <p className="text-muted-foreground mt-1 text-sm sm:text-base">{label}</p>
    </div>
  );
}

export function ManifestoSection({
  manifesto,
  stats,
}: {
  manifesto: HomePageContent["manifesto"];
  stats: Stat[];
}) {
  const words = useMemo(
    () => (manifesto == null ? [] : buildWords(manifesto.text)),
    [manifesto],
  );
  const textRef = useRef<HTMLParagraphElement>(null);
  const reduce = usePrefersReducedMotion();
  // The scroll-linked lighting starts after hydration; the server HTML (and
  // visitors without JavaScript) get the text fully lit.
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const animated = hydrated && !reduce;
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ["start 0.85", "end 0.45"],
  });
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.4 });

  if (words.length === 0 && stats.length === 0) {
    return null;
  }

  return (
    <FullBleedSection className="py-28 lg:py-40">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <p
          ref={textRef}
          className="text-foreground max-w-5xl text-3xl leading-[1.2] font-medium tracking-tight sm:text-4xl lg:text-[3.4rem]"
        >
          {words.map((word, index) => {
            const start = index / words.length;
            const end = start + 1 / words.length;
            return (
              <RevealWord
                key={`${wordText(word)}-${String(index)}`}
                word={word}
                progress={scrollYProgress}
                range={[start, end]}
                animated={animated}
              />
            );
          })}
        </p>

        <div
          ref={statsRef}
          className="mt-20 grid grid-cols-1 gap-10 sm:grid-cols-3 lg:mt-28"
        >
          {stats.map((stat) => (
            <StatCounter
              key={stat.id}
              value={stat.value}
              label={stat.label}
              active={statsInView}
            />
          ))}
        </div>
      </div>
    </FullBleedSection>
  );
}

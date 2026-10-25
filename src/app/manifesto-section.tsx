"use client";

import type { MotionValue } from "motion/react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useMemo, useRef, useSyncExternalStore } from "react";

import { FullBleedSection } from "@/components/full-bleed-section";
import { useCountUp } from "@/hooks/use-count-up";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { HomePageContent } from "@/lib/api/home-page";
import type { Stat } from "@/lib/api/stats";
import { cmsImageLoader } from "@/lib/cms-image";
import type { CmsImage } from "@/lib/cms-image";
import { highlightedWords, wordText } from "@/lib/highlight";
import type { HighlightedWord } from "@/lib/highlight";

type Token =
  { kind: "word"; word: HighlightedWord } | { kind: "image"; image: CmsImage };

const PHOTO_MARKER = "{foto}";

/** The i-th {foto} marker shows photos[i]; an empty slot drops its marker. */
function buildTokens(text: string, photos: (CmsImage | null)[]): Token[] {
  const parts = text.split(PHOTO_MARKER);
  return parts.flatMap((part, index): Token[] => {
    const words: Token[] = highlightedWords(part).map((word) => ({
      kind: "word",
      word,
    }));
    const photo = photos.at(index);
    const isLastPart = index === parts.length - 1;
    return isLastPart || photo == null
      ? words
      : [...words, { kind: "image", image: photo }];
  });
}

function unsubscribeFromNothing() {
  // Nothing to clean up: hydration state never changes after mount.
}

function subscribeToNothing() {
  return unsubscribeFromNothing;
}

function RevealToken({
  token,
  progress,
  range,
  animated,
}: {
  token: Token;
  progress: MotionValue<number>;
  range: [number, number];
  /** False on the server and with reduced motion: render fully lit. */
  animated: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const scale = useTransform(progress, range, [0.6, 1]);

  if (token.kind === "image") {
    return (
      <motion.span
        style={animated ? { opacity, scale } : undefined}
        className="relative mx-[0.12em] inline-block h-[0.82em] w-[1.9em] overflow-hidden rounded-full align-[-0.08em]"
      >
        <Image
          loader={cmsImageLoader}
          src={token.image.src}
          alt={token.image.alt}
          fill
          sizes="160px"
          className="object-cover"
        />
      </motion.span>
    );
  }

  return (
    <motion.span style={animated ? { opacity } : undefined}>
      {token.word.parts.map((part, partIndex) => (
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
  const tokens = useMemo(
    () =>
      manifesto == null ? [] : buildTokens(manifesto.text, manifesto.photos),
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

  if (tokens.length === 0 && stats.length === 0) {
    return null;
  }

  return (
    <FullBleedSection className="py-28 lg:py-40">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <p
          ref={textRef}
          className="text-foreground max-w-5xl text-3xl leading-[1.2] font-medium tracking-tight sm:text-4xl lg:text-[3.4rem]"
        >
          {tokens.map((token, index) => {
            const start = index / tokens.length;
            const end = start + 1 / tokens.length;
            const key =
              token.kind === "word"
                ? `${wordText(token.word)}-${String(index)}`
                : `${token.image.src}-${String(index)}`;
            return (
              <RevealToken
                key={key}
                token={token}
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

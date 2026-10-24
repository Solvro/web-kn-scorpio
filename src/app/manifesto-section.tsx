"use client";

import type { MotionValue } from "motion/react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import { STATS } from "@/app/temporary-data";
import { FullBleedSection } from "@/components/full-bleed-section";
import { useCountUp } from "@/hooks/use-count-up";
import { useInView } from "@/hooks/use-in-view";

type Token =
  | { kind: "word"; text: string; accent?: boolean }
  | { kind: "image"; src: string; alt: string };

const word = (text: string, accent = false): Token => ({
  kind: "word",
  text,
  accent,
});

const TOKENS: Token[] = [
  ..."Od 2006 roku projektujemy i budujemy".split(" ").map((t) => word(t)),
  word("łaziki", true),
  word("marsjańskie", true),
  {
    kind: "image",
    src: "/images/field-river.jpg",
    alt: "Łazik nad rzeką na tle płaskowyżów",
  },
  ..."Startujemy w zawodach Rover Challenge na całym świecie,"
    .split(" ")
    .map((t) => word(t)),
  {
    kind: "image",
    src: "/images/team-competition.jpg",
    alt: "Zespół Scorpio z łazikiem po zawodach",
  },
  ..."bronimy tytułu w Anatolian Rover Challenge i gościliśmy w"
    .split(" ")
    .map((t) => word(t)),
  word("NASA", true),
  word("JPL.", true),
];

function RevealToken({
  token,
  progress,
  range,
}: {
  token: Token;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const scale = useTransform(progress, range, [0.6, 1]);

  if (token.kind === "image") {
    return (
      <motion.span
        style={{ opacity, scale }}
        className="relative mx-[0.12em] inline-block h-[0.82em] w-[1.9em] overflow-hidden rounded-full align-[-0.08em]"
      >
        <Image
          src={token.src}
          alt={token.alt}
          fill
          sizes="160px"
          className="object-cover"
        />
      </motion.span>
    );
  }

  return (
    <motion.span
      style={{ opacity }}
      className={token.accent === true ? "text-primary" : undefined}
    >
      {token.text}{" "}
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
  const count = useCountUp(value, active);
  return (
    <div className="border-border border-l pl-5 sm:pl-8">
      <p className="text-foreground text-6xl font-bold tracking-tighter tabular-nums sm:text-7xl lg:text-8xl">
        {count}
      </p>
      <p className="text-muted-foreground mt-1 text-sm sm:text-base">{label}</p>
    </div>
  );
}

export function ManifestoSection() {
  const textRef = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ["start 0.85", "end 0.45"],
  });
  const { ref: statsRef, inView: statsInView } = useInView<HTMLDivElement>({
    threshold: 0.4,
  });

  return (
    <FullBleedSection className="py-28 lg:py-40">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <p
          ref={textRef}
          className="text-foreground max-w-5xl text-3xl leading-[1.2] font-medium tracking-tight sm:text-4xl lg:text-[3.4rem]"
        >
          {TOKENS.map((token, index) => {
            const start = index / TOKENS.length;
            const end = start + 1 / TOKENS.length;
            const key =
              token.kind === "word"
                ? `${token.text}-${String(index)}`
                : token.src;
            // With reduced motion the range sits before 0, so every token renders fully lit.
            return (
              <RevealToken
                key={key}
                token={token}
                progress={scrollYProgress}
                range={reduce ? [-1, 0] : [start, end]}
              />
            );
          })}
        </p>

        <div
          ref={statsRef}
          className="mt-20 grid grid-cols-1 gap-10 sm:grid-cols-3 lg:mt-28"
        >
          {STATS.map((stat) => (
            <StatCounter
              key={stat.label}
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

"use client";

import {
  EnvelopeSimpleIcon,
  HourglassMediumIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import type { MotionValue } from "motion/react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useRef, useSyncExternalStore } from "react";

import {
  APPLICATION_FORM_URL,
  RECRUITMENT_DEADLINE,
  RECRUITMENT_DEADLINE_DATE,
  RECRUITMENT_EMAIL,
} from "@/app/recruitment/temporary-data";
import { Button } from "@/components/ui/button";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const DAY_MS = 24 * 60 * 60 * 1000;

function pluralDays(days: number) {
  if (days === 1) {
    return "dzień";
  }
  return "dni";
}

function subscribeToMinuteTick(onTick: () => void) {
  const interval = window.setInterval(onTick, 60_000);
  return () => {
    window.clearInterval(interval);
  };
}

function getDaysLeft() {
  const remaining = new Date(RECRUITMENT_DEADLINE_DATE).getTime() - Date.now();
  return Math.ceil(remaining / DAY_MS);
}

/** Days left until the deadline, null on the server so SSR markup stays stable. */
function useDaysLeft() {
  return useSyncExternalStore<number | null>(
    subscribeToMinuteTick,
    getDaysLeft,
    () => null,
  );
}

const COLLAGE = [
  {
    src: "/images/team-competition.jpg",
    alt: "Zespół Scorpio z łazikiem po zawodach",
    className: "inset-x-[6%] top-[14%] aspect-[3/2] z-10",
    rotate: -2,
    depth: 0.4,
  },
  {
    src: "/images/field-arm-repair.jpg",
    alt: "Serwis ramienia manipulatora",
    className: "right-0 top-0 w-[42%] aspect-[3/2] z-20",
    rotate: 5,
    depth: 1,
  },
  {
    src: "/images/dept-marketing.jpg",
    alt: "Prezentacja ramienia łazika podczas wydarzenia",
    className: "left-0 bottom-0 w-[38%] aspect-square z-20",
    rotate: -6,
    depth: 1.4,
  },
];

function CollageImage({
  item,
  index,
  progress,
  reduce,
}: {
  item: (typeof COLLAGE)[number];
  index: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const y = useTransform(progress, [0, 1], [0, -120 * item.depth]);

  return (
    <motion.div
      className={`absolute ${item.className}`}
      style={reduce ? undefined : { y }}
    >
      <motion.div
        className="ring-border relative h-full w-full overflow-hidden rounded-lg shadow-[0_30px_60px_-20px_oklch(0.1_0.005_285/0.8)] ring-1"
        initial={
          reduce ? false : { opacity: 0, scale: 0.8, rotate: item.rotate * 3 }
        }
        animate={{ opacity: 1, scale: 1, rotate: item.rotate }}
        whileHover={reduce ? undefined : { scale: 1.04, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 18,
          delay: reduce ? 0 : 0.2 + index * 0.15,
        }}
      >
        <Image
          src={item.src}
          alt={item.alt}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 40vw, 90vw"
          className="object-cover"
        />
      </motion.div>
    </motion.div>
  );
}

export function RecruitmentHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const daysLeft = useDaysLeft();
  const isClosed = daysLeft != null && daysLeft <= 0;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  return (
    <section
      ref={ref}
      className="relative mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-7xl grid-cols-1 items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-20"
    >
      <motion.div
        className="lg:col-span-6"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE_OUT }}
      >
        <div className="border-primary/40 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
          <HourglassMediumIcon weight="bold" className="size-4" />
          {isClosed ? (
            "Rekrutacja zakończona"
          ) : (
            <span>
              Rekrutacja trwa do {RECRUITMENT_DEADLINE}
              {daysLeft == null ? null : (
                <span className="text-foreground tabular-nums">
                  {" "}
                  (jeszcze {daysLeft} {pluralDays(daysLeft)})
                </span>
              )}
            </span>
          )}
        </div>

        <h1 className="text-foreground mt-6 text-5xl leading-[1.05] font-bold tracking-tighter sm:text-6xl lg:text-7xl">
          Zbuduj z nami <span className="text-primary">kolejny łazik.</span>
        </h1>

        <p className="text-muted-foreground mt-6 max-w-lg text-base leading-relaxed sm:text-lg">
          Studia nie muszą być tylko teorią. Szukamy pasjonatów do pięciu
          działów, od konstrukcji po marketing.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          {isClosed ? null : (
            <Button
              size="lg"
              className="h-12 gap-2 px-6 text-base active:scale-[0.98]"
              nativeButton={false}
              render={
                <a
                  href={APPLICATION_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PaperPlaneTiltIcon weight="bold" />
                  Wyślij zgłoszenie
                </a>
              }
            />
          )}
          <Button
            size="lg"
            variant="outline"
            className="h-12 gap-2 px-6 text-base active:scale-[0.98]"
            nativeButton={false}
            render={
              <a href={`mailto:${RECRUITMENT_EMAIL}`}>
                <EnvelopeSimpleIcon weight="bold" />
                Napisz do nas
              </a>
            }
          />
        </div>
      </motion.div>

      <div className="relative aspect-[5/4] w-full lg:col-span-6">
        {COLLAGE.map((item, index) => (
          <CollageImage
            key={item.src}
            item={item}
            index={index}
            progress={scrollYProgress}
            reduce={reduce}
          />
        ))}
      </div>
    </section>
  );
}

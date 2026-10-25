"use client";

import {
  EnvelopeSimpleIcon,
  HourglassMediumIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import type { MotionValue } from "motion/react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import type { CSSProperties } from "react";

import { HighlightedText } from "@/components/highlighted-text";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { RecruitmentStatus } from "@/hooks/use-recruitment-status";
import type { RecruitmentPageContent } from "@/lib/api/recruitment-page";
import { cmsImageLoader } from "@/lib/cms-image";
import type { CmsImage } from "@/lib/cms-image";
import { formatDeadline } from "@/lib/recruitment-deadline";

function pluralDays(days: number) {
  if (days === 1) {
    return "dzień";
  }
  return "dni";
}

// Fixed slots for the CMS collage photos: large, top-right, bottom-left.
const COLLAGE_SLOTS = [
  {
    name: "main",
    className: "inset-x-[6%] top-[14%] aspect-[3/2] z-10",
    rotate: -2,
    depth: 0.4,
  },
  {
    name: "top-right",
    className: "right-0 top-0 w-[42%] aspect-[3/2] z-20",
    rotate: 5,
    depth: 1,
  },
  {
    name: "bottom-left",
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
  item: (typeof COLLAGE_SLOTS)[number] & { image: CmsImage };
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
      {/* Entrance is a CSS keyframe (globals.css), so the photos are visible
          without JavaScript; hover straightens them with a CSS transition. */}
      <div
        style={
          {
            "--rotate": `${String(item.rotate)}deg`,
            animationDelay: `${String(0.2 + index * 0.15)}s`,
          } as CSSProperties
        }
        className="ring-border motion-safe:animate-collage-in motion-safe:ease-out-expo relative h-full w-full [transform:rotate(var(--rotate))] overflow-hidden rounded-lg shadow-[0_30px_60px_-20px_oklch(0.1_0.005_285/0.8)] ring-1 motion-safe:transition-transform motion-safe:duration-500 motion-safe:hover:[transform:scale(1.04)_rotate(0deg)]"
      >
        <Image
          loader={cmsImageLoader}
          src={item.image.src}
          alt={item.image.alt}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 40vw, 90vw"
          className="object-cover"
        />
      </div>
    </motion.div>
  );
}

export function RecruitmentHero({
  page,
  status,
}: {
  page: RecruitmentPageContent;
  /** Shared with the closing band, so both switch at the same moment. */
  status: RecruitmentStatus;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const { daysLeft } = status;
  const collage = COLLAGE_SLOTS.flatMap((slot, index) => {
    const image = page.collage.at(index);
    return image == null ? [] : [{ ...slot, image }];
  });
  const isClosed = !status.isOpen;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  return (
    <section
      ref={ref}
      className="relative mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-7xl grid-cols-1 items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-20"
    >
      <div className="motion-safe:animate-fade-up lg:col-span-6">
        <div className="border-primary/40 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
          <HourglassMediumIcon weight="bold" className="size-4" />
          {isClosed ? (
            "Rekrutacja zakończona"
          ) : (
            <span>
              Rekrutacja trwa do {formatDeadline(page.deadline)}
              {daysLeft == null ? null : (
                <span className="text-foreground tabular-nums">
                  {" "}
                  (jeszcze {daysLeft} {pluralDays(daysLeft)})
                </span>
              )}
            </span>
          )}
        </div>

        <h1 className="text-foreground mt-6 text-5xl leading-[1.05] font-bold tracking-tighter text-balance sm:text-6xl lg:text-7xl">
          <HighlightedText text={page.hero.title} />
        </h1>

        {page.hero.subtitle == null ? null : (
          <p className="text-muted-foreground mt-6 max-w-lg text-base leading-relaxed sm:text-lg">
            {page.hero.subtitle}
          </p>
        )}

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          {isClosed ? null : (
            <Button
              size="lg"
              className="h-12 gap-2 px-6 text-base active:scale-[0.98]"
              nativeButton={false}
              render={
                <a
                  href={page.formUrl}
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
              <a href={`mailto:${page.contactEmail}`}>
                <EnvelopeSimpleIcon weight="bold" />
                Napisz do nas
              </a>
            }
          />
        </div>
      </div>

      <div className="relative aspect-[5/4] w-full lg:col-span-6">
        {collage.map((item, index) => (
          <CollageImage
            key={item.name}
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

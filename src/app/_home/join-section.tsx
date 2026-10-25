"use client";

import { ArrowRightIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { FullBleedSection } from "@/components/full-bleed-section";
import { HighlightedText } from "@/components/highlighted-text";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useRecruitmentStatus } from "@/hooks/use-recruitment-status";
import type { HomePageContent } from "@/lib/api/home-page";
import { cmsImageLoader } from "@/lib/cms-image";
import { formatDeadline } from "@/lib/recruitment-deadline";

export function JoinSection({
  join,
  recruitment,
  contactEmail,
}: {
  join: NonNullable<HomePageContent["join"]>;
  recruitment: { deadline: string; isOpen: boolean } | null;
  contactEmail: string | null;
}) {
  // Same live status as the recruitment page, so both switch at the same moment.
  const status = useRecruitmentStatus(
    recruitment?.deadline ?? null,
    recruitment?.isOpen ?? false,
  );
  const recruitmentNotice =
    recruitment != null && status.isOpen
      ? `Rekrutacja trwa do ${formatDeadline(recruitment.deadline)}.`
      : null;
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <FullBleedSection ref={ref} className="flex min-h-[85dvh] items-end">
      <motion.div
        className="absolute inset-[-14%_0]"
        style={reduce ? undefined : { y }}
      >
        {join.image == null ? null : (
          <Image
            loader={cmsImageLoader}
            src={join.image.src}
            alt={join.image.alt}
            fill
            sizes="100vw"
            className="object-cover object-[50%_60%]"
          />
        )}
      </motion.div>
      <div className="from-background via-background/60 absolute inset-0 bg-linear-to-t to-transparent" />
      <div className="from-background/70 absolute inset-0 hidden bg-linear-to-r to-transparent md:block" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-40 pb-20 sm:px-6 lg:pb-28">
        <Reveal className="max-w-2xl">
          {join.title === "" ? null : (
            <h2 className="text-foreground text-4xl leading-[1.05] font-bold tracking-tighter text-balance sm:text-6xl lg:text-7xl">
              <HighlightedText text={join.title} />
            </h2>
          )}
          {join.subtitle == null && recruitmentNotice == null ? null : (
            <p className="text-foreground/80 mt-5 max-w-md text-base leading-relaxed sm:text-lg">
              {[join.subtitle, recruitmentNotice]
                .filter((sentence) => sentence != null)
                .join(" ")}
            </p>
          )}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {/* recruitment is null when /recruitment would render nothing */}
            {recruitment == null ? null : (
              <Button
                size="lg"
                className="h-12 gap-2 px-6 text-base active:scale-[0.98]"
                nativeButton={false}
                render={
                  <Link href="/recruitment">
                    Dołącz do nas
                    <ArrowRightIcon
                      weight="bold"
                      className="transition-transform group-hover/button:translate-x-1"
                    />
                  </Link>
                }
              />
            )}
            {contactEmail == null ? null : (
              <Button
                size="lg"
                variant="outline"
                className="bg-background/40 hover:bg-background/70 h-12 gap-2 px-6 text-base backdrop-blur-md active:scale-[0.98]"
                nativeButton={false}
                render={
                  <a href={`mailto:${contactEmail}`}>
                    <EnvelopeSimpleIcon weight="bold" />
                    Napisz do nas
                  </a>
                }
              />
            )}
          </div>
        </Reveal>
      </div>
    </FullBleedSection>
  );
}

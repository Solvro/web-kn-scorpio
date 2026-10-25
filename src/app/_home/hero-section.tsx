"use client";

import { ArrowRightIcon } from "@phosphor-icons/react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { FullBleedSection } from "@/components/full-bleed-section";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { HomePageContent } from "@/lib/api/home-page";
import { cmsImageLoader } from "@/lib/cms-image";
import { highlightedWords, wordText } from "@/lib/highlight";

export function HeroSection({
  hero,
  showRoversLink,
  recruitmentAvailable,
}: {
  hero: NonNullable<HomePageContent["hero"]>;
  /** "Poznaj łaziki" jumps to #generacje, which only exists when rovers are shown. */
  showRoversLink: boolean;
  /** Links to /recruitment only when that page would render something. */
  recruitmentAvailable: boolean;
}) {
  const words = highlightedWords(hero.title);
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Push into the photo as the visitor leaves the hero, so the rover reads as the subject.
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.6]);

  return (
    <FullBleedSection ref={ref} className="-mt-16 h-[100dvh] min-h-[640px]">
      {/* Intro animations are CSS keyframes (globals.css): they start from the
          server HTML without waiting for hydration and end visible. */}
      <div className="motion-safe:animate-clip-reveal absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={reduce ? undefined : { scale: imageScale, y: imageY }}
        >
          <div className="motion-safe:animate-zoom-out absolute inset-0">
            {hero.image == null ? null : (
              <Image
                loader={cmsImageLoader}
                src={hero.image.src}
                alt={hero.image.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover object-[55%_35%]"
              />
            )}
          </div>
        </motion.div>
        <div className="from-background via-background/60 md:via-background/30 absolute inset-0 bg-linear-to-t to-transparent" />
        <div className="from-background/80 absolute inset-0 hidden bg-linear-to-r via-transparent to-transparent md:block" />
        <motion.div
          className="bg-background absolute inset-0"
          style={{ opacity: reduce ? 0 : dim }}
        />
      </div>

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 sm:px-6 md:pb-24"
      >
        {hero.eyebrow == null ? null : (
          <p
            style={{ animationDelay: "0.25s" }}
            className="text-primary motion-safe:animate-fade-up text-sm font-semibold tracking-[0.2em] uppercase"
          >
            {hero.eyebrow}
          </p>
        )}

        <h1 className="text-foreground mt-4 max-w-4xl text-5xl leading-[1.05] font-bold tracking-tighter text-balance sm:text-6xl lg:text-8xl">
          {words.map((word, index) => (
            <span
              key={`${String(index)}-${wordText(word)}`}
              className="inline-block overflow-hidden pr-[0.22em] pb-1 align-bottom"
            >
              <span
                style={{ animationDelay: `${String(0.35 + index * 0.08)}s` }}
                className="motion-safe:animate-rise-in inline-block"
              >
                {word.parts.map((part, partIndex) => (
                  <span
                    key={`${String(partIndex)}-${part.text}`}
                    className={part.highlighted ? "text-primary" : undefined}
                  >
                    {part.text}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </h1>

        <div
          style={{ animationDelay: "0.75s" }}
          className="motion-safe:animate-fade-up"
        >
          {hero.subtitle == null ? null : (
            <p className="text-foreground/80 mt-6 max-w-lg text-base leading-relaxed sm:text-lg">
              {hero.subtitle}
            </p>
          )}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {recruitmentAvailable ? (
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
            ) : null}
            {showRoversLink ? (
              <Button
                size="lg"
                variant="outline"
                className="bg-background/40 hover:bg-background/70 h-12 px-6 text-base backdrop-blur-md active:scale-[0.98]"
                nativeButton={false}
                render={<a href="#generacje">Poznaj łaziki</a>}
              />
            ) : null}
          </div>
        </div>
      </motion.div>
    </FullBleedSection>
  );
}

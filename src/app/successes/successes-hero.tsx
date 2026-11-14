"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import { FullBleedSection } from "@/components/full-bleed-section";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { SuccessesPageContent } from "@/lib/api/achievements";
import { cmsImageLoader } from "@/lib/cms-image";
import { highlightedWords, wordText } from "@/lib/highlight";

export function SuccessesHero({
  hero,
}: {
  hero: SuccessesPageContent["hero"];
}) {
  const words = highlightedWords(hero.title);
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Same depth cue as the home hero: the photo drifts as the visitor scrolls on.
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <FullBleedSection ref={ref} className="-mt-16 h-[88dvh] min-h-[600px]">
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
                className="object-cover object-[50%_40%]"
              />
            )}
          </div>
        </motion.div>
        <div className="from-background via-background/55 absolute inset-0 bg-linear-to-t to-transparent" />
        <div className="from-background/75 absolute inset-0 hidden bg-linear-to-r via-transparent to-transparent md:block" />
      </div>

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 sm:px-6 md:pb-24">
        <h1 className="text-foreground max-w-5xl text-5xl leading-[1.05] font-bold tracking-tighter text-balance sm:text-6xl lg:text-7xl">
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
        {hero.subtitle == null ? null : (
          <p
            style={{ animationDelay: "0.8s" }}
            className="text-foreground/80 motion-safe:animate-fade-up mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
          >
            {hero.subtitle}
          </p>
        )}
      </div>
    </FullBleedSection>
  );
}

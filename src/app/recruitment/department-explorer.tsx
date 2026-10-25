"use client";

import {
  ArrowUpRightIcon,
  CodeIcon,
  CpuIcon,
  FlaskIcon,
  MegaphoneIcon,
  WrenchIcon,
} from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent } from "react";

import { HighlightedText } from "@/components/highlighted-text";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { Division, DivisionIcon } from "@/lib/api/divisions";
import type { RecruitmentPageContent } from "@/lib/api/recruitment-page";
import { cmsImageLoader } from "@/lib/cms-image";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
  };
}

const DIVISION_ICONS = {
  wrench: WrenchIcon,
  cpu: CpuIcon,
  code: CodeIcon,
  flask: FlaskIcon,
  megaphone: MegaphoneIcon,
} satisfies Record<DivisionIcon, unknown>;

function DivisionIconGlyph({
  icon,
  ...props
}: IconProps & { icon: DivisionIcon }) {
  const Icon = DIVISION_ICONS[icon];
  return <Icon {...props} />;
}

export function DepartmentExplorer({
  heading,
  divisions,
}: {
  heading: RecruitmentPageContent["divisions"];
  divisions: Division[];
}) {
  const reduce = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const tabReferences = useRef<(HTMLButtonElement | null)[]>([]);
  // Deep links from the home page land as /recruitment#software. The hash is
  // read as external state; a click on a tab takes precedence over it.
  const hashSlug = useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash.slice(1),
    () => "",
  );
  const [chosenSlug, setChosenSlug] = useState<string | null>(null);
  const activeSlug = chosenSlug ?? hashSlug;
  // Unknown slugs (e.g. a stale #hash) fall back to the first division.
  const activeIndex = Math.max(
    divisions.findIndex((dept) => dept.slug === activeSlug),
    0,
  );
  const active = divisions.at(activeIndex);

  // Bring the explorer into view when the page was opened with a division hash.
  useEffect(() => {
    const slug = window.location.hash.slice(1);
    if (
      slug !== "" &&
      document.querySelector(`#tab-${CSS.escape(slug)}`) != null
    ) {
      sectionRef.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
      });
    }
  }, [reduce]);

  const select = (index: number) => {
    const dept = divisions[index];
    setChosenSlug(dept.slug);
    window.history.replaceState(null, "", `#${dept.slug}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const count = divisions.length;
    let next: number;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight": {
        next = (activeIndex + 1) % count;
        break;
      }
      case "ArrowUp":
      case "ArrowLeft": {
        next = (activeIndex - 1 + count) % count;
        break;
      }
      case "Home": {
        next = 0;
        break;
      }
      case "End": {
        next = count - 1;
        break;
      }
      default: {
        return;
      }
    }
    event.preventDefault();
    select(next);
    tabReferences.current[next]?.focus();
  };

  if (active == null) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="dzialy"
      className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 lg:py-32"
    >
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

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div
          role="tablist"
          aria-label="Działy"
          aria-orientation="vertical"
          className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:col-span-4 lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          {divisions.map((dept, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={dept.id}
                ref={(node) => {
                  tabReferences.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`tab-${dept.slug}`}
                aria-selected={selected}
                aria-controls={`panel-${dept.slug}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  select(index);
                }}
                onKeyDown={handleKeyDown}
                className={cn(
                  "focus-visible:ring-ring/50 relative flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left outline-none focus-visible:ring-3 lg:px-5 lg:py-5",
                  selected
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {selected ? (
                  <motion.span
                    layoutId="department-tab"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    className="bg-card ring-border absolute inset-0 rounded-lg ring-1"
                  />
                ) : null}
                <DivisionIconGlyph
                  icon={dept.icon}
                  weight={selected ? "fill" : "regular"}
                  className={cn(
                    "relative size-5 lg:size-6",
                    selected && "text-primary",
                  )}
                />
                <span className="relative text-base font-semibold whitespace-nowrap lg:text-xl">
                  {dept.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              role="tabpanel"
              id={`panel-${active.slug}`}
              aria-labelledby={`tab-${active.slug}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
              className="grid grid-cols-1 gap-8 md:grid-cols-2"
            >
              <div className="bg-muted relative aspect-[4/5] overflow-hidden rounded-lg">
                <motion.div
                  className="absolute inset-0"
                  initial={reduce ? false : { scale: 1.12 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
                >
                  {active.image == null ? null : (
                    <Image
                      loader={cmsImageLoader}
                      src={active.image.src}
                      alt={active.image.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  )}
                </motion.div>
              </div>

              <div className="flex flex-col">
                <h3 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                  {active.name}
                </h3>
                {active.pitch == null ? null : (
                  <p className="text-primary mt-3 text-lg leading-snug font-medium">
                    {active.pitch}
                  </p>
                )}
                <div className="text-muted-foreground mt-5 space-y-4 text-sm leading-relaxed sm:text-base">
                  {active.paragraphs.map((paragraph, index) => (
                    <p key={`${String(index)}-${paragraph}`}>{paragraph}</p>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {active.tools.map((tool, index) => (
                    <Badge
                      key={`${String(index)}-${tool}`}
                      variant="outline-sm"
                    >
                      {tool}
                    </Badge>
                  ))}
                </div>
                {active.taskUrl == null ? null : (
                  <div className="mt-auto pt-8">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-11 gap-2 px-5 active:scale-[0.98]"
                      nativeButton={false}
                      render={
                        <a
                          href={active.taskUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Zadanie rekrutacyjne
                          <ArrowUpRightIcon weight="bold" />
                        </a>
                      }
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

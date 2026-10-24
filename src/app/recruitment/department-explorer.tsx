"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { RECRUITMENT_DEPARTMENTS } from "@/app/recruitment/temporary-data";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function DepartmentExplorer() {
  const reduce = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const tabReferences = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeSlug, setActiveSlug] = useState(RECRUITMENT_DEPARTMENTS[0].slug);
  const activeIndex = RECRUITMENT_DEPARTMENTS.findIndex(
    (dept) => dept.slug === activeSlug,
  );
  const active = RECRUITMENT_DEPARTMENTS[activeIndex];

  // Deep links from the home page land as /recruitment#software.
  useEffect(() => {
    const slug = window.location.hash.slice(1);
    if (RECRUITMENT_DEPARTMENTS.some((dept) => dept.slug === slug)) {
      setActiveSlug(slug);
      sectionRef.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
      });
    }
  }, [reduce]);

  const select = (index: number) => {
    const dept = RECRUITMENT_DEPARTMENTS[index];
    setActiveSlug(dept.slug);
    window.history.replaceState(null, "", `#${dept.slug}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const count = RECRUITMENT_DEPARTMENTS.length;
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

  return (
    <section
      ref={sectionRef}
      id="dzialy"
      className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 lg:py-32"
    >
      <Reveal>
        <h2 className="text-foreground text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
          Znajdź swój dział
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
          Każdy dział ma własne zadanie rekrutacyjne. Wybierz, sprawdź i wyślij
          rozwiązanie razem ze zgłoszeniem.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div
          role="tablist"
          aria-label="Działy"
          aria-orientation="vertical"
          className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:col-span-4 lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          {RECRUITMENT_DEPARTMENTS.map((dept, index) => {
            const selected = dept.slug === activeSlug;
            return (
              <button
                key={dept.slug}
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
                <dept.icon
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
              key={active.slug}
              role="tabpanel"
              id={`panel-${active.slug}`}
              aria-labelledby={`tab-${active.slug}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="grid grid-cols-1 gap-8 md:grid-cols-2"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                <motion.div
                  className="absolute inset-0"
                  initial={reduce ? false : { scale: 1.12 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.1, ease: EASE_OUT }}
                >
                  <Image
                    src={active.image.src}
                    alt={active.image.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </motion.div>
              </div>

              <div className="flex flex-col">
                <h3 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                  {active.name}
                </h3>
                <p className="text-primary mt-3 text-lg leading-snug font-medium">
                  {active.pitch}
                </p>
                <div className="text-muted-foreground mt-5 space-y-4 text-sm leading-relaxed sm:text-base">
                  {active.description.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {active.tools.map((tool) => (
                    <Badge key={tool} variant="outline-sm">
                      {tool}
                    </Badge>
                  ))}
                </div>
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
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

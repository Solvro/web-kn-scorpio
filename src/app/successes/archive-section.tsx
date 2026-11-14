"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { FilterChips } from "@/components/filter-chips";
import { HighlightedText } from "@/components/highlighted-text";
import { Reveal } from "@/components/reveal";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { ACHIEVEMENT_SERIES_LABELS } from "@/lib/achievements";
import type { Achievement, AchievementSeries } from "@/lib/achievements";
import { EASE_OUT_EXPO } from "@/lib/motion";

import { PlaceBadge } from "./place-badge";

type Filter = AchievementSeries | "all";

function detail(item: Achievement): string | null {
  if (item.result === "distinction") {
    return item.category == null
      ? "Wyróżnienie"
      : `Wyróżnienie: ${item.category}`;
  }
  if (item.result === "place" && item.category == null) {
    return item.series === "rover_challenge" ? "Klasyfikacja generalna" : null;
  }
  return item.category;
}

function groupByYear(items: Achievement[]) {
  const groups: { year: number | null; items: Achievement[] }[] = [];
  for (const item of items) {
    const last = groups.at(-1);
    if (last?.year === item.year) {
      last.items.push(item);
    } else {
      groups.push({ year: item.year, items: [item] });
    }
  }
  return groups;
}

export function ArchiveSection({
  title,
  achievements,
}: {
  title: string | null;
  achievements: Achievement[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const reduce = usePrefersReducedMotion();
  if (achievements.length === 0) {
    return null;
  }

  const seriesChips = (
    Object.keys(ACHIEVEMENT_SERIES_LABELS) as AchievementSeries[]
  )
    .map((series) => ({
      value: series,
      label: ACHIEVEMENT_SERIES_LABELS[series],
      count: achievements.filter((item) => item.series === series).length,
    }))
    .filter((chip) => chip.count > 0);
  const visible =
    filter === "all"
      ? achievements
      : achievements.filter((item) => item.series === filter);
  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.45, ease: EASE_OUT_EXPO };

  return (
    <section id="wszystkie" className="px-4 py-24 sm:px-6 lg:py-32">
      <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        {title == null ? null : (
          <h2 className="text-foreground text-4xl font-bold tracking-tighter text-balance sm:text-5xl lg:text-6xl">
            <HighlightedText text={title} />
          </h2>
        )}
        {seriesChips.length > 1 ? (
          <FilterChips
            label="Filtruj sukcesy"
            value={filter}
            onChange={setFilter}
            chips={[
              { value: "all", label: "Wszystkie", count: achievements.length },
              ...seriesChips,
            ]}
          />
        ) : null}
      </Reveal>

      <div className="mt-12">
        <AnimatePresence mode="popLayout" initial={false}>
          {groupByYear(visible).map((group) => (
            <motion.div
              key={`${filter}-${String(group.year)}`}
              layout="position"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={transition}
              className="border-border grid grid-cols-1 gap-6 border-t py-8 md:grid-cols-12 md:gap-10"
            >
              <h3 className="text-foreground/25 text-4xl font-bold tracking-tighter tabular-nums md:sticky md:top-24 md:col-span-3 md:self-start md:text-6xl">
                {group.year ?? "Bez daty"}
              </h3>
              <ul className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 md:col-span-9">
                {group.items.map((item) => {
                  const itemDetail = detail(item);
                  return (
                    <li key={item.id} className="flex items-start gap-4">
                      <PlaceBadge item={item} />
                      <div className="pt-1">
                        <p className="text-foreground text-base leading-snug font-semibold">
                          {item.title}
                        </p>
                        {itemDetail == null ? null : (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {itemDetail}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

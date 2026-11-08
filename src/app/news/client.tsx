"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { FilterChips } from "@/components/filter-chips";
import { Reveal } from "@/components/reveal";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { NewsItem } from "@/lib/api/news";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { NEWS_CATEGORY_LABELS, newsYear } from "@/lib/news";
import type { NewsCategory } from "@/lib/news";
import { cn } from "@/lib/utils";

import { NewsCard, NewsCover, NewsMeta } from "./news-card";

type Filter = NewsCategory | "all";

interface YearGroup {
  year: string;
  items: NewsItem[];
}

function groupByYear(items: NewsItem[]): YearGroup[] {
  const groups: YearGroup[] = [];
  for (const item of items) {
    const year = newsYear(item.publishedAt) ?? "Wcześniej";
    const last = groups.at(-1);
    if (last?.year === year) {
      last.items.push(item);
    } else {
      groups.push({ year, items: [item] });
    }
  }
  return groups;
}

function FeaturedNews({ item }: { item: NewsItem }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group grid grid-cols-1 gap-6 rounded-lg outline-offset-4 lg:grid-cols-12 lg:items-end lg:gap-10"
    >
      <NewsCover
        item={item}
        priority
        sizes="(min-width: 1024px) 58vw, 100vw"
        className="aspect-[3/2] lg:col-span-7"
      />
      <div className="lg:col-span-5 lg:pb-2">
        <NewsMeta item={item} />
        <h2 className="text-foreground group-hover:text-primary mt-4 text-3xl leading-tight font-bold tracking-tight text-balance transition-colors duration-300 sm:text-4xl lg:text-5xl">
          {item.title}
        </h2>
        {item.excerpt == null ? null : (
          <p className="text-muted-foreground mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
            {item.excerpt}
          </p>
        )}
        <span className="bg-primary text-primary-foreground group-hover:bg-primary/85 mt-8 inline-flex h-12 items-center gap-2 rounded-md px-6 text-base font-medium transition-colors">
          Czytaj artykuł
          <ArrowUpRightIcon
            aria-hidden
            weight="bold"
            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </Link>
  );
}

export function NewsPageClient({ news }: { news: NewsItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const reduce = usePrefersReducedMotion();

  // Only categories that have articles, in the CMS order of choices.
  const counts = useMemo(() => {
    const result = new Map<NewsCategory, number>();
    for (const item of news) {
      if (item.category != null) {
        result.set(item.category, (result.get(item.category) ?? 0) + 1);
      }
    }
    return (Object.keys(NEWS_CATEGORY_LABELS) as NewsCategory[])
      .filter((category) => result.has(category))
      .map((category) => ({ category, count: result.get(category) ?? 0 }));
  }, [news]);

  const visible =
    filter === "all" ? news : news.filter((item) => item.category === filter);
  const featured = visible.at(0);
  const groups = groupByYear(visible.slice(1));

  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.6, ease: EASE_OUT_EXPO };

  return (
    <div className="px-4 pt-14 pb-24 sm:px-6 lg:pt-20 lg:pb-32">
      <header>
        <h1 className="text-foreground motion-safe:animate-fade-up text-5xl font-bold tracking-tighter sm:text-6xl lg:text-8xl">
          Aktualności
        </h1>

        {counts.length > 1 ? (
          <div
            style={{ animationDelay: "0.12s" }}
            className="motion-safe:animate-fade-up mt-8"
          >
            <FilterChips
              label="Filtruj według kategorii"
              value={filter}
              onChange={setFilter}
              chips={[
                { value: "all", label: "Wszystkie", count: news.length },
                ...counts.map(({ category, count }) => ({
                  value: category,
                  label: NEWS_CATEGORY_LABELS[category],
                  count,
                })),
              ]}
            />
          </div>
        ) : null}
      </header>

      {featured == null ? (
        <p className="text-muted-foreground mt-16 max-w-md text-lg">
          Nie ma jeszcze żadnych wpisów. Zajrzyj tu wkrótce.
        </p>
      ) : (
        <LayoutGroup>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`featured-${featured.slug}`}
              layout="position"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={transition}
              style={{ animationDelay: "0.2s" }}
              className="motion-safe:animate-fade-up mt-12 lg:mt-16"
            >
              <FeaturedNews item={featured} />
            </motion.div>

            {groups.map((group) => (
              <motion.section
                key={`year-${group.year}`}
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
                aria-labelledby={`rok-${group.year}`}
                className="border-border mt-20 grid grid-cols-1 gap-8 border-t pt-8 lg:mt-28 lg:grid-cols-12 lg:gap-10"
              >
                <Reveal className="lg:col-span-3">
                  <h2
                    id={`rok-${group.year}`}
                    className="text-foreground/15 text-6xl font-bold tracking-tighter tabular-nums lg:sticky lg:top-24 lg:text-8xl"
                  >
                    {group.year}
                  </h2>
                </Reveal>
                <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:col-span-9">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {group.items.map((item, index) => {
                      // An odd count opens with a wide card, so the grid never has a hole.
                      const wide = group.items.length % 2 === 1 && index === 0;
                      return (
                        <motion.div
                          key={item.slug}
                          layout="position"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={transition}
                          className={cn(wide && "md:col-span-2")}
                        >
                          <Reveal delay={(index % 2) * 90} className="h-full">
                            <NewsCard item={item} wide={wide} />
                          </Reveal>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.section>
            ))}
          </AnimatePresence>
        </LayoutGroup>
      )}
    </div>
  );
}

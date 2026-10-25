"use client";

import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import Link from "next/link";

import { FullBleedSection } from "@/components/full-bleed-section";
import { HighlightedText } from "@/components/highlighted-text";
import { Reveal } from "@/components/reveal";
import type { NewsItem } from "@/lib/api/news";

export function NewsSection({
  title,
  news,
}: {
  title: string;
  news: NewsItem[];
}) {
  const featured = news.at(0);
  const rest = news.slice(1);
  if (featured == null) {
    return null;
  }

  return (
    <FullBleedSection className="py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal className="flex items-end justify-between gap-6">
          {title === "" ? null : (
            <h2 className="text-foreground text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              <HighlightedText text={title} />
            </h2>
          )}
          <Link
            href="/news"
            className="text-primary group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium"
          >
            Wszystkie
            <ArrowRightIcon
              weight="bold"
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </Link>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Reveal delay={100} className="lg:col-span-7">
            <Link
              href="/news"
              className="group bg-card hover:bg-accent/60 relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-lg p-8 transition-colors duration-300 sm:p-10"
            >
              <div
                aria-hidden
                className="bg-primary/20 group-hover:bg-primary/30 absolute -top-24 -right-24 size-72 rounded-full blur-3xl transition-colors duration-500"
              />
              <h3 className="text-foreground relative max-w-lg text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
                {featured.title}
              </h3>
              <div className="relative mt-10 flex items-end justify-between gap-6">
                <p className="text-muted-foreground max-w-md text-base leading-relaxed">
                  {featured.excerpt ?? ""}
                </p>
                <ArrowUpRightIcon
                  weight="bold"
                  className="text-primary size-6 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </div>
            </Link>
          </Reveal>

          <div className="flex flex-col gap-4 lg:col-span-5">
            {rest.slice(0, 3).map((item, index) => (
              <Reveal key={item.id} delay={180 + index * 80} className="flex-1">
                <Link
                  href="/news"
                  className="group border-border hover:border-primary/60 flex h-full items-center justify-between gap-6 rounded-lg border p-6 transition-colors duration-300"
                >
                  <h3 className="text-foreground text-lg leading-snug font-semibold">
                    {item.title}
                  </h3>
                  <ArrowRightIcon
                    weight="bold"
                    className="text-muted-foreground group-hover:text-primary size-5 shrink-0 transition-all duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </FullBleedSection>
  );
}

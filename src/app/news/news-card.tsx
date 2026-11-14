"use client";

import {
  ArrowUpRightIcon,
  CalendarStarIcon,
  HandshakeIcon,
  NewspaperIcon,
  NotebookIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import type { NewsItem } from "@/lib/api/news";
import { cmsImageLoader } from "@/lib/cms-image";
import { NEWS_CATEGORY_LABELS, formatNewsDate } from "@/lib/news";
import type { NewsCategory } from "@/lib/news";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<NewsCategory, Icon> = {
  competitions: TrophyIcon,
  events: CalendarStarIcon,
  partners: HandshakeIcon,
  summary: NotebookIcon,
};

export function NewsMeta({
  item,
  className,
}: {
  item: Pick<NewsItem, "publishedAt" | "category">;
  className?: string;
}) {
  if (item.publishedAt == null && item.category == null) {
    return null;
  }
  return (
    <p
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm",
        className,
      )}
    >
      {item.publishedAt == null ? null : (
        <time dateTime={item.publishedAt}>
          {formatNewsDate(item.publishedAt)}
        </time>
      )}
      {item.category == null ? null : (
        <span className="text-primary font-medium">
          {NEWS_CATEGORY_LABELS[item.category]}
        </span>
      )}
    </p>
  );
}

/** Cover photo, or an orange tile with the category icon when there is none. */
export function NewsCover({
  item,
  sizes,
  priority = false,
  className,
}: {
  item: NewsItem;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const CategoryIcon =
    item.category == null ? NewspaperIcon : CATEGORY_ICONS[item.category];
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {item.image == null ? (
        <div className="from-primary/90 to-secondary absolute inset-0 flex items-center justify-center bg-linear-to-br">
          <CategoryIcon
            aria-hidden
            weight="thin"
            className="text-primary-foreground/70 size-24 transition-transform duration-700 ease-out group-hover:scale-110 sm:size-32"
          />
        </div>
      ) : (
        <Image
          loader={cmsImageLoader}
          src={item.image.src}
          alt={item.image.alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      )}
    </div>
  );
}

export function NewsCard({
  item,
  wide = false,
}: {
  item: NewsItem;
  /** Horizontal layout spanning both grid columns. */
  wide?: boolean;
}) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className={cn(
        "group flex h-full flex-col gap-5 rounded-lg outline-offset-4",
        wide && "md:grid md:grid-cols-2 md:items-center md:gap-8",
      )}
    >
      <NewsCover
        item={item}
        sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
        className="aspect-[16/10]"
      />
      <div className="flex flex-1 flex-col">
        <NewsMeta item={item} />
        <h3
          className={cn(
            "text-foreground group-hover:text-primary mt-3 font-bold tracking-tight text-balance transition-colors duration-300",
            wide ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
          )}
        >
          {item.title}
        </h3>
        {item.excerpt == null ? null : (
          <p className="text-muted-foreground mt-3 line-clamp-3 text-base leading-relaxed">
            {item.excerpt}
          </p>
        )}
        <span className="text-foreground mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
          Czytaj
          <ArrowUpRightIcon
            aria-hidden
            weight="bold"
            className="text-primary size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </Link>
  );
}

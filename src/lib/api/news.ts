import { readItems } from "@directus/sdk";

import { cleanText } from "@/lib/api/text";
import { fileFields, toCmsImage } from "@/lib/cms-image";
import type { CmsFile, CmsImage } from "@/lib/cms-image";
import { directus, logDirectusError } from "@/lib/directus";
import { isNewsCategory } from "@/lib/news";
import type { NewsCategory } from "@/lib/news";

interface NewsRecord {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  category: string | null;
  image: CmsFile | null;
  image_alt: string | null;
}

export interface NewsItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  /** Date only (YYYY-MM-DD). */
  publishedAt: string | null;
  category: NewsCategory | null;
  image: CmsImage | null;
}

export type NewsBlock =
  { type: "heading"; text: string } | { type: "paragraph"; text: string };

export interface NewsArticle extends NewsItem {
  blocks: NewsBlock[];
  readingMinutes: number;
}

const LIST_FIELDS = [
  "id",
  "slug",
  "title",
  "excerpt",
  "published_at",
  "category",
  "image_alt",
  ...fileFields("image"),
];

function toNewsItem(record: NewsRecord): NewsItem {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    excerpt: cleanText(record.excerpt),
    publishedAt: record.published_at,
    category:
      record.category != null && isNewsCategory(record.category)
        ? record.category
        : null,
    image: toCmsImage(record.image, cleanText(record.image_alt) ?? ""),
  };
}

/** Body text: paragraphs separated by blank lines, "## " starts a subheading. */
function parseBody(body: string | null): NewsBlock[] {
  return (cleanText(body) ?? "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block !== "")
    .map((block) =>
      block.startsWith("## ")
        ? { type: "heading", text: block.slice(3).trim() }
        : { type: "paragraph", text: block },
    );
}

// Newest first; the manual sort only breaks ties between articles of one day.
const NEWS_SORT = ["-published_at", "sort"];

export async function getNews(limit?: number): Promise<NewsItem[]> {
  try {
    const records = (await directus.request(
      readItems("news", {
        fields: LIST_FIELDS,
        sort: NEWS_SORT,
        limit: limit ?? -1,
      }),
    )) as NewsRecord[];
    return records.map((record) => toNewsItem(record));
  } catch (error) {
    logDirectusError("news", error);
    return [];
  }
}

/**
 * `null` means no article has this slug. A failed request throws instead, so a
 * CMS outage during revalidation can't replace a cached article with a 404.
 */
export async function getNewsArticle(
  slug: string,
): Promise<NewsArticle | null> {
  let records: (NewsRecord & { body: string | null })[];
  try {
    records = (await directus.request(
      readItems("news", {
        fields: [...LIST_FIELDS, "body"],
        filter: { slug: { _eq: slug } },
        limit: 1,
      }),
    )) as (NewsRecord & { body: string | null })[];
  } catch (error) {
    logDirectusError("news", error);
    throw error;
  }
  const record = records.at(0);
  if (record == null) {
    return null;
  }
  const blocks = parseBody(record.body);
  const words = blocks
    .map((block) => block.text)
    .join(" ")
    .split(/\s+/).length;
  return {
    ...toNewsItem(record),
    blocks,
    // About 200 words a minute, at least one.
    readingMinutes: Math.max(1, Math.round(words / 200)),
  };
}

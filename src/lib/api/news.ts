import { readItems } from "@directus/sdk";

import { cleanText } from "@/lib/api/text";
import { directus, logDirectusError } from "@/lib/directus";

export interface NewsItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
}

export async function getNews(limit?: number): Promise<NewsItem[]> {
  try {
    const items = (await directus.request(
      readItems("news", {
        fields: ["id", "slug", "title", "excerpt"],
        sort: ["sort"],
        limit: limit ?? -1,
      }),
    )) as NewsItem[];
    return items.map((item) => ({ ...item, excerpt: cleanText(item.excerpt) }));
  } catch (error) {
    logDirectusError("news", error);
    return [];
  }
}

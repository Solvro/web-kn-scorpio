import { readItems, readSingleton } from "@directus/sdk";

import { ACHIEVEMENT_SERIES_LABELS } from "@/lib/achievements";
import type {
  Achievement,
  AchievementResult,
  AchievementSeries,
} from "@/lib/achievements";
import { cleanText } from "@/lib/api/text";
import { fileFields, toCmsImage } from "@/lib/cms-image";
import type { CmsFile, CmsImage } from "@/lib/cms-image";
import { directus, logDirectusError } from "@/lib/directus";

interface AchievementRecord {
  id: number;
  title: string;
  year: number | null;
  series: string | null;
  result: string | null;
  place: number | null;
  category: string | null;
  featured: boolean | null;
  story: string | null;
  image: (CmsFile & { type: string | null }) | null;
  image_alt: string | null;
}

const RESULTS = new Set<string>(["place", "distinction", "title"]);

function isSeries(value: string | null): value is AchievementSeries {
  return value != null && Object.hasOwn(ACHIEVEMENT_SERIES_LABELS, value);
}

function isResult(value: string | null): value is AchievementResult {
  return value != null && RESULTS.has(value);
}

/** Newest first; undated entries last. The manual sort orders one year. */
export async function getAchievements(): Promise<Achievement[]> {
  try {
    const records = (await directus.request(
      readItems("achievements", {
        fields: [
          "id",
          "title",
          "year",
          "series",
          "result",
          "place",
          "category",
          "featured",
          "story",
          "image_alt",
          ...fileFields("image"),
          "image.type",
        ],
        sort: ["-year", "sort"],
        limit: -1,
      }),
    )) as AchievementRecord[];

    const items: Achievement[] = [];
    for (const record of records) {
      const title = cleanText(record.title);
      if (title == null || !isSeries(record.series)) {
        continue;
      }
      const result = isResult(record.result) ? record.result : "title";
      items.push({
        id: record.id,
        title,
        year: record.year,
        series: record.series,
        result,
        place: result === "place" ? record.place : null,
        category: cleanText(record.category),
        featured: record.featured === true,
        story: cleanText(record.story),
        image: toCmsImage(record.image, cleanText(record.image_alt) ?? ""),
        imageIsCutout: record.image?.type === "image/png",
      });
    }
    // SQLite already sorts NULL last in descending order; this keeps undated
    // entries last on databases that sort NULL first.
    return [
      ...items.filter((item) => item.year != null),
      ...items.filter((item) => item.year == null),
    ];
  } catch (error) {
    logDirectusError("achievements", error);
    return [];
  }
}

interface SuccessesPageRecord {
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image: CmsFile | null;
  hero_image_alt: string | null;
  tally_title: string | null;
  tally_image: CmsFile | null;
  tally_image_alt: string | null;
  stories_title: string | null;
  matrix_title: string | null;
  matrix_intro: string | null;
  archive_title: string | null;
}

export interface SuccessesPageContent {
  hero: { title: string; subtitle: string | null; image: CmsImage | null };
  tally: { title: string | null; image: CmsImage | null };
  storiesTitle: string | null;
  matrix: { title: string | null; intro: string | null };
  archiveTitle: string | null;
}

export async function getSuccessesPage(): Promise<SuccessesPageContent | null> {
  try {
    const page = (await directus.request(
      readSingleton("successes_page", {
        fields: [
          "*",
          ...fileFields("hero_image"),
          ...fileFields("tally_image"),
        ],
      }),
    )) as SuccessesPageRecord | null;
    const heroTitle = cleanText(page?.hero_title);
    if (page == null || heroTitle == null) {
      return null;
    }
    return {
      hero: {
        title: heroTitle,
        subtitle: cleanText(page.hero_subtitle),
        image: toCmsImage(page.hero_image, cleanText(page.hero_image_alt)),
      },
      tally: {
        title: cleanText(page.tally_title),
        image: toCmsImage(page.tally_image, cleanText(page.tally_image_alt)),
      },
      storiesTitle: cleanText(page.stories_title),
      matrix: {
        title: cleanText(page.matrix_title),
        intro: cleanText(page.matrix_intro),
      },
      archiveTitle: cleanText(page.archive_title),
    };
  } catch (error) {
    logDirectusError("successes_page", error);
    return null;
  }
}

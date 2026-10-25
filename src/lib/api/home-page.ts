import { readSingleton } from "@directus/sdk";

import { cleanText } from "@/lib/api/text";
import { fileFields, toCmsImage } from "@/lib/cms-image";
import type { CmsFile, CmsImage } from "@/lib/cms-image";
import { directus, logDirectusError } from "@/lib/directus";

interface HomePageRecord {
  hero_eyebrow: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image: CmsFile | null;
  hero_image_alt: string | null;
  manifesto: string | null;
  manifesto_photo_1: CmsFile | null;
  manifesto_photo_1_alt: string | null;
  manifesto_photo_2: CmsFile | null;
  manifesto_photo_2_alt: string | null;
  rovers_title: string | null;
  rovers_intro: string | null;
  field_title: string | null;
  field_intro: string | null;
  projects_title: string | null;
  projects_intro: string | null;
  divisions_eyebrow: string | null;
  divisions_title: string | null;
  news_title: string | null;
  join_title: string | null;
  join_subtitle: string | null;
  join_image: CmsFile | null;
  join_image_alt: string | null;
}

export interface SectionHeading {
  title: string;
  intro: string | null;
}

export interface HomePageContent {
  hero: {
    eyebrow: string | null;
    title: string;
    subtitle: string | null;
    image: CmsImage | null;
  } | null;
  /** photos[i] belongs to the i-th {foto} marker; null keeps an empty slot. */
  manifesto: { text: string; photos: (CmsImage | null)[] } | null;
  rovers: SectionHeading;
  field: SectionHeading;
  projects: SectionHeading;
  divisions: { eyebrow: string | null; title: string };
  newsTitle: string;
  join: {
    title: string;
    subtitle: string | null;
    image: CmsImage | null;
  } | null;
}

export async function getHomePage(): Promise<HomePageContent | null> {
  try {
    const page = (await directus.request(
      readSingleton("home_page", {
        fields: [
          "*",
          ...fileFields("hero_image"),
          ...fileFields("manifesto_photo_1"),
          ...fileFields("manifesto_photo_2"),
          ...fileFields("join_image"),
        ],
      }),
    )) as HomePageRecord | null;
    if (page == null) {
      return null;
    }
    const heroTitle = cleanText(page.hero_title);
    const manifestoText = cleanText(page.manifesto);
    const joinTitle = cleanText(page.join_title);

    return {
      hero:
        heroTitle == null
          ? null
          : {
              eyebrow: cleanText(page.hero_eyebrow),
              title: heroTitle,
              subtitle: cleanText(page.hero_subtitle),
              image: toCmsImage(
                page.hero_image,
                cleanText(page.hero_image_alt),
              ),
            },
      manifesto:
        manifestoText == null
          ? null
          : {
              text: manifestoText,
              photos: [
                toCmsImage(
                  page.manifesto_photo_1,
                  cleanText(page.manifesto_photo_1_alt),
                ),
                toCmsImage(
                  page.manifesto_photo_2,
                  cleanText(page.manifesto_photo_2_alt),
                ),
              ],
            },
      rovers: {
        title: cleanText(page.rovers_title) ?? "",
        intro: cleanText(page.rovers_intro),
      },
      field: {
        title: cleanText(page.field_title) ?? "",
        intro: cleanText(page.field_intro),
      },
      projects: {
        title: cleanText(page.projects_title) ?? "",
        intro: cleanText(page.projects_intro),
      },
      divisions: {
        eyebrow: cleanText(page.divisions_eyebrow),
        title: cleanText(page.divisions_title) ?? "",
      },
      newsTitle: cleanText(page.news_title) ?? "",
      join:
        joinTitle == null
          ? null
          : {
              title: joinTitle,
              subtitle: cleanText(page.join_subtitle),
              image: toCmsImage(
                page.join_image,
                cleanText(page.join_image_alt),
              ),
            },
    };
  } catch (error) {
    logDirectusError("home_page", error);
    return null;
  }
}

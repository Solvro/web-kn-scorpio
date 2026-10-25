import { readItems } from "@directus/sdk";

import { cleanText } from "@/lib/api/text";
import { fileFields, toCmsImage } from "@/lib/cms-image";
import type { CmsFile, CmsImage } from "@/lib/cms-image";
import { directus, logDirectusError } from "@/lib/directus";

export type DivisionIcon = "wrench" | "cpu" | "code" | "flask" | "megaphone";

interface DivisionRecord {
  id: number;
  slug: string;
  name: string;
  icon: DivisionIcon;
  tagline: string;
  pitch: string | null;
  description: string;
  tools: string[] | null;
  task_url: string | null;
  image: CmsFile | null;
  image_alt: string | null;
}

export interface Division {
  id: number;
  slug: string;
  name: string;
  icon: DivisionIcon;
  tagline: string;
  pitch: string | null;
  paragraphs: string[];
  tools: string[];
  taskUrl: string | null;
  image: CmsImage | null;
}

export async function getDivisions(): Promise<Division[]> {
  try {
    const records = (await directus.request(
      readItems("divisions", {
        fields: [
          "id",
          "slug",
          "name",
          "icon",
          "tagline",
          "pitch",
          "description",
          "tools",
          "task_url",
          "image_alt",
          ...fileFields("image"),
        ],
        sort: ["sort"],
      }),
    )) as DivisionRecord[];

    return records.map((record) => ({
      id: record.id,
      slug: record.slug,
      name: record.name,
      icon: record.icon,
      tagline: record.tagline,
      pitch: cleanText(record.pitch),
      paragraphs: record.description
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph !== ""),
      tools: record.tools ?? [],
      taskUrl: cleanText(record.task_url),
      image: toCmsImage(record.image, record.image_alt),
    }));
  } catch (error) {
    logDirectusError("divisions", error);
    return [];
  }
}

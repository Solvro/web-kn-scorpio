import { readItems } from "@directus/sdk";

import { fileFields, toCmsImage } from "@/lib/cms-image";
import type { CmsFile, CmsImage } from "@/lib/cms-image";
import { directus, logDirectusError } from "@/lib/directus";

interface RoverRecord {
  id: number;
  slug: string;
  name: string;
  glyph: string;
  year: string | null;
  highlight: string;
  description: string;
  image: CmsFile | null;
}

export interface Rover {
  id: number;
  slug: string;
  name: string;
  glyph: string;
  year: string | null;
  highlight: string;
  description: string;
  image: CmsImage;
}

/** Rover generations, oldest first. Rovers without an image are skipped. */
export async function getRovers(): Promise<Rover[]> {
  try {
    const records = (await directus.request(
      readItems("rovers", {
        fields: [
          "id",
          "slug",
          "name",
          "glyph",
          "year",
          "highlight",
          "description",
          ...fileFields("image"),
        ],
        sort: ["sort"],
      }),
    )) as RoverRecord[];

    return records.flatMap((record) => {
      const image = toCmsImage(record.image, record.name);
      return image == null ? [] : [{ ...record, image }];
    });
  } catch (error) {
    logDirectusError("rovers", error);
    return [];
  }
}

import { readItems } from "@directus/sdk";

import { fileFields, toCmsImage } from "@/lib/cms-image";
import type { CmsFile, CmsImage } from "@/lib/cms-image";
import { directus, logDirectusError } from "@/lib/directus";

interface ProjectRecord {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: CmsFile | null;
  image_alt: string | null;
}

export interface Project {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: CmsImage | null;
}

export async function getProjects(): Promise<Project[]> {
  try {
    const records = (await directus.request(
      readItems("projects", {
        fields: [
          "id",
          "slug",
          "name",
          "tagline",
          "description",
          "image_alt",
          ...fileFields("image"),
        ],
        sort: ["sort"],
      }),
    )) as ProjectRecord[];

    return records.map((record) => ({
      id: record.id,
      slug: record.slug,
      name: record.name,
      tagline: record.tagline,
      description: record.description,
      image: toCmsImage(record.image, record.image_alt ?? record.name),
    }));
  } catch (error) {
    logDirectusError("projects", error);
    return [];
  }
}

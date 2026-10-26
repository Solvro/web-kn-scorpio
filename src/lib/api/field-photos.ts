import { readItems } from "@directus/sdk";

import { fileFields, toCmsImage } from "@/lib/cms-image";
import type { CmsFile, CmsImage } from "@/lib/cms-image";
import { directus, logDirectusError } from "@/lib/directus";

interface FieldPhotoRecord {
  id: number;
  caption: string;
  alt: string;
  image: CmsFile | null;
}

export interface FieldPhoto {
  id: number;
  caption: string;
  image: CmsImage;
}

export async function getFieldPhotos(): Promise<FieldPhoto[]> {
  try {
    const records = (await directus.request(
      readItems("field_photos", {
        fields: ["id", "caption", "alt", ...fileFields("image")],
        sort: ["sort"],
      }),
    )) as FieldPhotoRecord[];

    return records.flatMap((record) => {
      const image = toCmsImage(record.image, record.alt);
      return image == null
        ? []
        : [{ id: record.id, caption: record.caption, image }];
    });
  } catch (error) {
    logDirectusError("field_photos", error);
    return [];
  }
}

import { readItems } from "@directus/sdk";

import { fileFields, toCmsImage } from "@/lib/cms-image";
import type { CmsFile, CmsImage } from "@/lib/cms-image";
import { directus, logDirectusError } from "@/lib/directus";

interface RecruitmentBenefitRecord {
  id: number;
  title: string;
  text: string;
  image: CmsFile | null;
  image_alt: string | null;
}

export interface RecruitmentBenefit {
  id: number;
  title: string;
  text: string;
  image: CmsImage;
}

export async function getRecruitmentBenefits(): Promise<RecruitmentBenefit[]> {
  try {
    const records = (await directus.request(
      readItems("recruitment_benefits", {
        fields: ["id", "title", "text", "image_alt", ...fileFields("image")],
        sort: ["sort"],
      }),
    )) as RecruitmentBenefitRecord[];

    return records.flatMap((record) => {
      const image = toCmsImage(record.image, record.image_alt);
      return image == null
        ? []
        : [{ id: record.id, title: record.title, text: record.text, image }];
    });
  } catch (error) {
    logDirectusError("recruitment_benefits", error);
    return [];
  }
}

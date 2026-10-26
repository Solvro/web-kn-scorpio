import { readSingleton } from "@directus/sdk";

import { cleanText } from "@/lib/api/text";
import { fileFields, toCmsImage } from "@/lib/cms-image";
import type { CmsFile, CmsImage } from "@/lib/cms-image";
import { directus, logDirectusError } from "@/lib/directus";

interface RecruitmentPageRecord {
  deadline: string | null;
  application_form_url: string | null;
  contact_email: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  collage_photo_1: CmsFile | null;
  collage_photo_1_alt: string | null;
  collage_photo_2: CmsFile | null;
  collage_photo_2_alt: string | null;
  collage_photo_3: CmsFile | null;
  collage_photo_3_alt: string | null;
  steps_title: string | null;
  divisions_title: string | null;
  divisions_intro: string | null;
  benefits_title: string | null;
}

export interface RecruitmentPageContent {
  /** ISO timestamp of the end of recruitment. */
  deadline: string;
  formUrl: string;
  contactEmail: string;
  hero: { title: string; subtitle: string | null };
  /** Large photo first, then the two small ones; missing photos are omitted. */
  collage: (CmsImage | null)[];
  stepsTitle: string;
  divisions: { title: string; intro: string | null };
  benefitsTitle: string;
}

// Without these the recruitment page renders nothing, so every page that links
// to or talks about recruitment must use the same check (requiredValues).
const REQUIRED_FIELDS = [
  "deadline",
  "application_form_url",
  "contact_email",
  "hero_title",
] as const;

function requiredValues<
  T extends Pick<RecruitmentPageRecord, (typeof REQUIRED_FIELDS)[number]>,
>(page: T | null) {
  const heroTitle = cleanText(page?.hero_title);
  const formUrl = cleanText(page?.application_form_url);
  const contactEmail = cleanText(page?.contact_email);
  if (
    page?.deadline == null ||
    formUrl == null ||
    contactEmail == null ||
    heroTitle == null
  ) {
    return null;
  }
  // `page` is returned narrowed, so callers need only one null check.
  return { page, deadline: page.deadline, formUrl, contactEmail, heroTitle };
}

export async function getRecruitmentPage(): Promise<RecruitmentPageContent | null> {
  try {
    const page = (await directus.request(
      readSingleton("recruitment_page", {
        fields: [
          "*",
          ...fileFields("collage_photo_1"),
          ...fileFields("collage_photo_2"),
          ...fileFields("collage_photo_3"),
        ],
      }),
    )) as RecruitmentPageRecord | null;
    const required = requiredValues(page);
    if (required == null) {
      return null;
    }
    const { deadline, formUrl, contactEmail, heroTitle } = required;
    const record = required.page;

    return {
      deadline,
      formUrl,
      contactEmail,
      hero: { title: heroTitle, subtitle: cleanText(record.hero_subtitle) },
      collage: [
        toCmsImage(
          record.collage_photo_1,
          cleanText(record.collage_photo_1_alt),
        ),
        toCmsImage(
          record.collage_photo_2,
          cleanText(record.collage_photo_2_alt),
        ),
        toCmsImage(
          record.collage_photo_3,
          cleanText(record.collage_photo_3_alt),
        ),
      ],
      stepsTitle: cleanText(record.steps_title) ?? "",
      divisions: {
        title: cleanText(record.divisions_title) ?? "",
        intro: cleanText(record.divisions_intro),
      },
      benefitsTitle: cleanText(record.benefits_title) ?? "",
    };
  } catch (error) {
    logDirectusError("recruitment_page", error);
    return null;
  }
}

/**
 * The deadline, for pages that only need to know whether recruitment is open.
 * Null when the recruitment page itself would render nothing (same check as
 * getRecruitmentPage), so other pages never promote an empty /recruitment.
 */
export async function getRecruitmentDeadline(): Promise<string | null> {
  try {
    const page = (await directus.request(
      readSingleton("recruitment_page", { fields: [...REQUIRED_FIELDS] }),
    )) as Pick<RecruitmentPageRecord, (typeof REQUIRED_FIELDS)[number]> | null;
    return requiredValues(page)?.deadline ?? null;
  } catch (error) {
    logDirectusError("recruitment_page", error);
    return null;
  }
}

/**
 * Whether /recruitment renders anything. Every link to the recruitment page
 * (navbar, footer, home page) must check this, so none points to an empty page.
 */
export async function isRecruitmentAvailable(): Promise<boolean> {
  return (await getRecruitmentDeadline()) != null;
}

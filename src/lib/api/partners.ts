import { readItems, readSingleton } from "@directus/sdk";

import { cleanText } from "@/lib/api/text";
import { fileFields, toCmsImage } from "@/lib/cms-image";
import type { CmsFile, CmsImage } from "@/lib/cms-image";
import { directus, logDirectusError } from "@/lib/directus";
import { directusUrl } from "@/lib/directus-url";

export type PartnerTier = "main" | "partner" | "supporter";

interface PartnerRecord {
  id: number;
  name: string;
  tier: string | null;
  url: string | null;
  description: string | null;
  logo: CmsFile | null;
}

export interface Partner {
  id: number;
  name: string;
  tier: PartnerTier;
  url: string | null;
  description: string | null;
  logo: CmsImage;
}

const TIERS = new Set<string>(["main", "partner", "supporter"]);

function isTier(value: string | null): value is PartnerTier {
  return value != null && TIERS.has(value);
}

/** Partners with a logo, in CMS order. */
export async function getPartners(): Promise<Partner[]> {
  try {
    const records = (await directus.request(
      readItems("partners", {
        fields: [
          "id",
          "name",
          "tier",
          "url",
          "description",
          ...fileFields("logo"),
        ],
        sort: ["sort"],
        limit: -1,
      }),
    )) as PartnerRecord[];

    const partners: Partner[] = [];
    for (const record of records) {
      const name = cleanText(record.name);
      const logo = toCmsImage(record.logo, name);
      if (name == null || logo == null) {
        continue;
      }
      partners.push({
        id: record.id,
        name,
        tier: isTier(record.tier) ? record.tier : "partner",
        url: cleanText(record.url),
        description: cleanText(record.description),
        logo,
      });
    }
    return partners;
  } catch (error) {
    logDirectusError("partners", error);
    return [];
  }
}

interface PartnersPageRecord {
  hero_title: string | null;
  intro: string | null;
  hero_image: CmsFile | null;
  hero_image_alt: string | null;
  pitch_title: string | null;
  pitch_text: string | null;
  offer_file: {
    id: string;
    filesize: number | null;
    type: string | null;
  } | null;
  contact_email: string | null;
}

export interface PartnersPageContent {
  hero: { title: string; intro: string | null; image: CmsImage | null };
  pitch: { title: string | null; text: string | null };
  /** Download link of the cooperation offer, with its size for the label. */
  offer: { url: string; sizeLabel: string | null } | null;
  contactEmail: string | null;
}

const SIZE_FORMAT = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 1,
});

function offerSizeLabel(file: NonNullable<PartnersPageRecord["offer_file"]>) {
  if (file.filesize == null) {
    return null;
  }
  const kind = file.type === "application/pdf" ? "PDF" : "plik";
  return `${kind}, ${SIZE_FORMAT.format(file.filesize / 1024 / 1024)}\u00A0MB`;
}

export async function getPartnersPage(): Promise<PartnersPageContent | null> {
  try {
    const page = (await directus.request(
      readSingleton("partners_page", {
        fields: [
          "*",
          ...fileFields("hero_image"),
          "offer_file.id",
          "offer_file.filesize",
          "offer_file.type",
        ],
      }),
    )) as PartnersPageRecord | null;
    const heroTitle = cleanText(page?.hero_title);
    if (page == null || heroTitle == null) {
      return null;
    }
    return {
      hero: {
        title: heroTitle,
        intro: cleanText(page.intro),
        image: toCmsImage(page.hero_image, cleanText(page.hero_image_alt)),
      },
      pitch: {
        title: cleanText(page.pitch_title),
        text: cleanText(page.pitch_text),
      },
      offer:
        page.offer_file == null
          ? null
          : {
              url: `${directusUrl}/assets/${page.offer_file.id}?download`,
              sizeLabel: offerSizeLabel(page.offer_file),
            },
      contactEmail: cleanText(page.contact_email),
    };
  } catch (error) {
    logDirectusError("partners_page", error);
    return null;
  }
}

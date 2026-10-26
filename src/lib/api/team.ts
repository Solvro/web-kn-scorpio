import { readItems } from "@directus/sdk";

import {
  directus,
  getDirectusAssetUrl,
  logDirectusError,
} from "@/lib/directus";

export type TeamGroup =
  | "management"
  | "advisor"
  | "construction"
  | "electronics"
  | "software"
  | "science"
  | "marketing";

export interface TeamPhoto {
  src: string;
  alt: string;
}

/** What the page and components receive. */
export interface TeamMemberData {
  id: string;
  name: string;
  role: string | null;
  group: TeamGroup;
  photo: TeamPhoto | null;
  photo_hover: TeamPhoto | null;
}

/** A row as Directus returns it: file fields are bare file ids. */
interface DirectusTeamMember {
  id: string | number;
  name: string;
  role: string | null;
  group: TeamGroup;
  photo: string | null;
  photo_hover: string | null;
}

function toPhoto(fileId: string | null, alt: string): TeamPhoto | null {
  return fileId == null ? null : { src: getDirectusAssetUrl(fileId), alt };
}

export async function getTeamMembers(): Promise<TeamMemberData[]> {
  try {
    const items = (await directus.request(
      readItems("team_members", {
        fields: ["id", "name", "role", "group", "photo", "photo_hover"],
        filter: { status: { _eq: "published" } },
        limit: -1,
      }),
    )) as DirectusTeamMember[];

    return items.map((member) => ({
      id: String(member.id),
      name: member.name,
      role: member.role,
      group: member.group,
      photo: toPhoto(member.photo, member.name),
      photo_hover: toPhoto(member.photo_hover, member.name),
    }));
  } catch (error) {
    logDirectusError("team", error);
    return [];
  }
}

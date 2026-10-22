import { readItems } from "@directus/sdk";

import {
  directus,
  getDirectusAssetUrl,
  logDirectusError,
} from "@/lib/directus";

export interface ManagementTeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  avatar: string;
}

export async function getManagementTeam() {
  try {
    const data = (await directus.request(
      readItems("management_team", {
        fields: ["id", "name", "role", "phone", "avatar"],
      }),
    )) as ManagementTeamMember[];

    return data.map((member) => ({
      ...member,
      avatar: getDirectusAssetUrl(member.avatar),
    }));
  } catch (error) {
    logDirectusError("management_team", error);
    return [];
  }
}

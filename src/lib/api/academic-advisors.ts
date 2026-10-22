import { readItems } from "@directus/sdk";

import {
  directus,
  getDirectusAssetUrl,
  logDirectusError,
} from "@/lib/directus";

export interface AcademicAdvisor {
  id: string;
  name: string;
  email: string;
  phone: string;
  web: string;
  avatar: string;
}

export async function getAcademicAdvisors() {
  try {
    const data = (await directus.request(
      readItems("academic_advisors", {
        fields: ["id", "name", "email", "phone", "web", "avatar"],
      }),
    )) as AcademicAdvisor[];

    return data.map((member) => ({
      ...member,
      avatar: getDirectusAssetUrl(member.avatar),
    }));
  } catch (error) {
    logDirectusError("academic_advisors", error);
    return [];
  }
}

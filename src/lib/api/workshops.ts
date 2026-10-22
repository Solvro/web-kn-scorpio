import { readItems } from "@directus/sdk";

import { directus, logDirectusError } from "@/lib/directus";

export interface Workshop {
  id: string;
  city: string;
  location: string;
  street: string;
}

export async function getWorkshops() {
  try {
    return (await directus.request(
      readItems("workshops", {
        fields: ["id", "city", "location", "street"],
      }),
    )) as Workshop[];
  } catch (error) {
    logDirectusError("workshops", error);
    return [];
  }
}

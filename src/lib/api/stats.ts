import { readItems } from "@directus/sdk";

import { directus, logDirectusError } from "@/lib/directus";

export interface Stat {
  id: number;
  value: number;
  label: string;
}

export async function getStats(): Promise<Stat[]> {
  try {
    return (await directus.request(
      readItems("stats", { fields: ["id", "value", "label"], sort: ["sort"] }),
    )) as Stat[];
  } catch (error) {
    logDirectusError("stats", error);
    return [];
  }
}

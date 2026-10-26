import { readItems } from "@directus/sdk";

import { directus, logDirectusError } from "@/lib/directus";

export type RecruitmentStepIcon =
  "cursor-click" | "clipboard-text" | "paper-plane-tilt";

export interface RecruitmentStep {
  id: number;
  icon: RecruitmentStepIcon;
  title: string;
  text: string;
}

export async function getRecruitmentSteps(): Promise<RecruitmentStep[]> {
  try {
    return (await directus.request(
      readItems("recruitment_steps", {
        fields: ["id", "icon", "title", "text"],
        sort: ["sort"],
      }),
    )) as RecruitmentStep[];
  } catch (error) {
    logDirectusError("recruitment_steps", error);
    return [];
  }
}

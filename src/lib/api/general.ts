import { readSingleton } from "@directus/sdk";

import { directus, logDirectusError } from "@/lib/directus";

export interface General {
  id: string;
  location_department: string;
  location_street: string;
  location_city: string;
  contact_email: string;
  social_fb: string;
  social_ig: string;
  social_ln: string;
  social_yt: string;
}

const GENERAL_INFO_FALLBACK: General = {
  id: "",
  location_department: "",
  location_street: "",
  location_city: "",
  contact_email: "",
  social_fb: "",
  social_ig: "",
  social_ln: "",
  social_yt: "",
};

export async function getGeneralInfo(): Promise<General> {
  try {
    return (await directus.request(
      readSingleton("general", {
        fields: [
          "id",
          "location_department",
          "location_street",
          "location_city",
          "contact_email",
          "social_fb",
          "social_ig",
          "social_ln",
          "social_yt",
        ],
      }),
    )) as General;
  } catch (error) {
    logDirectusError("general", error);
    return GENERAL_INFO_FALLBACK;
  }
}

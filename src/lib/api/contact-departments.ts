import { readItems } from "@directus/sdk";

import { directus, logDirectusError } from "@/lib/directus";

export interface ContactDepartment {
  id: string;
  role: string;
  name: string;
  email: string;
  description: string;
}

export async function getContactDepartments() {
  try {
    return (await directus.request(
      readItems("contact_departments", {
        fields: ["id", "role", "name", "email", "description"],
      }),
    )) as ContactDepartment[];
  } catch (error) {
    logDirectusError("contact_departments", error);
    return [];
  }
}

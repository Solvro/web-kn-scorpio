/** Base URL of the Directus CMS. Kept free of the SDK so client code can import it. */
export const directusUrl =
  process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "http://localhost:8055";

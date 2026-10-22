import { createDirectus, rest } from "@directus/sdk";

const directusUrl =
  process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "http://localhost:8055";

export const directus = createDirectus(directusUrl).with(rest());

export function logDirectusError(scope: string, error: unknown): void {
  if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
    console.warn(`[Directus:${scope}]`, error);
  }
}

export function getDirectusAssetUrl(fileId?: string | null): string {
  if (fileId == null) {
    return "/placeholder-avatar.png";
  }
  return `${directusUrl}/assets/${fileId}`;
}

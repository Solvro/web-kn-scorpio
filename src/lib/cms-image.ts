import type { ImageLoaderProps } from "next/image";

import { directusUrl } from "@/lib/directus-url";

/** File fields to request from Directus for any image field. */
export function fileFields(field: string) {
  return [`${field}.id`, `${field}.width`, `${field}.height`];
}

export interface CmsFile {
  id: string;
  width: number | null;
  height: number | null;
}

export interface CmsImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export function toCmsImage(
  file: CmsFile | null | undefined,
  alt: string | null | undefined,
): CmsImage | null {
  if (file == null) {
    return null;
  }
  return {
    src: `${directusUrl}/assets/${file.id}`,
    width: file.width ?? 1600,
    height: file.height ?? 1067,
    alt: alt ?? "",
  };
}

/**
 * next/image loader for CMS images: Directus resizes and picks AVIF/WebP itself,
 * so images don't go through the Next optimizer (which refuses local CMS hosts).
 */
export function cmsImageLoader({ src, width, quality }: ImageLoaderProps) {
  return `${src}?width=${String(width)}&quality=${String(quality ?? 75)}&format=auto`;
}

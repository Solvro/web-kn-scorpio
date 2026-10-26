/** Trims CMS text and treats empty or whitespace-only values as missing. */
export function cleanText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

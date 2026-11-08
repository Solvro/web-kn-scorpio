// News helpers without the Directus SDK, safe to import in client components.

/** Labels of the CMS `news.category` choices (cms/scripts/setup-pages.mjs). */
export const NEWS_CATEGORY_LABELS = {
  competitions: "Zawody",
  events: "Wydarzenia",
  partners: "Partnerzy",
  summary: "Podsumowania",
} as const;

export type NewsCategory = keyof typeof NEWS_CATEGORY_LABELS;

export function isNewsCategory(value: string): value is NewsCategory {
  return Object.hasOwn(NEWS_CATEGORY_LABELS, value);
}

const DATE_FORMAT = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "20 lipca 2026", with non-breaking spaces so the date never wraps. */
export function formatNewsDate(date: string): string {
  return DATE_FORMAT.format(new Date(`${date}T00:00:00Z`)).replaceAll(
    " ",
    "\u00A0",
  );
}

export function newsYear(date: string | null): string | null {
  return date?.slice(0, 4) ?? null;
}

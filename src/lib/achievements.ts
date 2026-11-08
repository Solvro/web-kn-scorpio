// Achievement helpers without the Directus SDK, safe to import in client components.
import type { CmsImage } from "@/lib/cms-image";

/** Labels of the CMS `achievements.series` choices (cms/scripts/setup-pages.mjs). */
export const ACHIEVEMENT_SERIES_LABELS = {
  rover_challenge: "Rover Challenge",
  competition: "Inne konkursy",
  honor: "Tytuły i nagrody",
} as const;

export type AchievementSeries = keyof typeof ACHIEVEMENT_SERIES_LABELS;
export type AchievementResult = "place" | "distinction" | "title";

export interface Achievement {
  id: number;
  title: string;
  year: number | null;
  series: AchievementSeries;
  result: AchievementResult;
  /** Only for result "place". */
  place: number | null;
  category: string | null;
  featured: boolean;
  story: string | null;
  image: CmsImage | null;
  /** Transparent PNG (e.g. a rover drawing): shown whole, not cropped. */
  imageIsCutout: boolean;
}

const ROMAN: [number, string][] = [
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

/** Places as the team writes them: "I", "II", "XIII". */
export function toRoman(value: number): string {
  let rest = value;
  let result = "";
  for (const [amount, numeral] of ROMAN) {
    while (rest >= amount) {
      result += numeral;
      rest -= amount;
    }
  }
  return result;
}

export function isPodium(item: Achievement): boolean {
  return (
    item.result === "place" &&
    item.place != null &&
    item.place >= 1 &&
    item.place <= 3
  );
}

const PLURAL_RULES = new Intl.PluralRules("pl-PL");

/** Polish noun form for a count: 1 miejsce, 2 miejsca, 5 miejsc. */
export function plural(
  count: number,
  forms: { one: string; few: string; many: string },
): string {
  const rule = PLURAL_RULES.select(count);
  if (rule === "one") {
    return forms.one;
  }
  return rule === "few" ? forms.few : forms.many;
}

export interface AchievementTally {
  podium: number;
  /** Count of 1st, 2nd and 3rd places. */
  medals: [number, number, number];
  roverChallengeWins: number;
  distinctions: number;
  titles: number;
}

/** Every number on the successes page is counted from the CMS list. */
export function tallyAchievements(items: Achievement[]): AchievementTally {
  const medals: [number, number, number] = [0, 0, 0];
  for (const item of items) {
    if (isPodium(item) && item.place != null) {
      medals[item.place - 1] += 1;
    }
  }
  return {
    podium: medals[0] + medals[1] + medals[2],
    medals,
    roverChallengeWins: items.filter(
      (item) =>
        item.series === "rover_challenge" &&
        item.result === "place" &&
        item.place === 1,
    ).length,
    distinctions: items.filter((item) => item.result === "distinction").length,
    titles: items.filter((item) => item.result === "title").length,
  };
}

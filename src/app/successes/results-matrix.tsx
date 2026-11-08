"use client";

import { StarIcon } from "@phosphor-icons/react";

import { HighlightedText } from "@/components/highlighted-text";
import { Reveal } from "@/components/reveal";
import { plural, toRoman } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";

import { PlaceBadge } from "./place-badge";

interface Cell {
  place: number | null;
  distinctions: string[];
}

interface Row {
  competition: string;
  cells: Map<number, Cell>;
}

/** Rover Challenge results as competition × year, ordered by first start. */
function buildMatrix(items: Achievement[]) {
  const rows = new Map<string, Row>();
  const years = new Set<number>();
  // Oldest first, so rows appear in the order the team first entered each competition.
  const sorted = items
    .filter((item) => item.series === "rover_challenge" && item.year != null)
    .toSorted((a, b) => (a.year ?? 0) - (b.year ?? 0));

  for (const item of sorted) {
    const year = item.year ?? 0;
    years.add(year);
    const row = rows.get(item.title) ?? {
      competition: item.title,
      cells: new Map<number, Cell>(),
    };
    rows.set(item.title, row);
    const cell = row.cells.get(year) ?? { place: null, distinctions: [] };
    row.cells.set(year, cell);
    if (item.result === "place" && item.place != null) {
      cell.place = Math.min(cell.place ?? item.place, item.place);
    } else if (item.result === "distinction" && item.category != null) {
      cell.distinctions.push(item.category);
    }
  }
  return {
    rows: [...rows.values()],
    years: [...years].toSorted((a, b) => a - b),
  };
}

function cellLabel(competition: string, year: number, cell: Cell): string {
  const parts = [`${competition} ${String(year)}`];
  if (cell.place != null) {
    parts.push(`${toRoman(cell.place)} miejsce`);
  }
  if (cell.distinctions.length > 0) {
    parts.push(`wyróżnienia: ${cell.distinctions.join(", ")}`);
  }
  return parts.join(", ");
}

export function ResultsMatrix({
  title,
  intro,
  achievements,
}: {
  title: string | null;
  intro: string | null;
  achievements: Achievement[];
}) {
  const { rows, years } = buildMatrix(achievements);
  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-24 sm:px-6 lg:py-32">
      <Reveal className="max-w-3xl">
        {title == null ? null : (
          <h2 className="text-foreground text-4xl font-bold tracking-tighter text-balance sm:text-5xl lg:text-6xl">
            <HighlightedText text={title} />
          </h2>
        )}
        {intro == null ? null : (
          <p className="text-muted-foreground mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
            {intro}
          </p>
        )}
      </Reveal>

      <Reveal delay={120} className="mt-12">
        {/* Scrolls sideways on narrow screens; the competition column stays put. */}
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[680px] border-separate border-spacing-0">
            <caption className="sr-only">
              Wyniki w zawodach Rover Challenge według roku
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="bg-background sticky left-0 z-10 w-36 pb-4 text-left text-sm font-medium sm:w-56 lg:w-72"
                >
                  <span className="sr-only">Zawody</span>
                </th>
                {years.map((year) => (
                  <th
                    key={year}
                    scope="col"
                    className="text-muted-foreground pb-4 text-center font-mono text-xs font-medium tabular-nums sm:text-sm"
                  >
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const wins = [...row.cells.values()].filter(
                  (cell) => cell.place === 1,
                ).length;
                return (
                  <tr key={row.competition} className="group">
                    <th
                      scope="row"
                      className="bg-background border-border sticky left-0 z-10 border-t py-5 pr-6 text-left align-middle"
                    >
                      <span className="text-foreground block text-sm font-semibold sm:text-lg">
                        {row.competition}
                      </span>
                      {wins === 0 ? null : (
                        <span className="text-primary mt-0.5 block text-sm">
                          {`${String(wins)}\u00A0${plural(wins, {
                            one: "zwycięstwo",
                            few: "zwycięstwa",
                            many: "zwycięstw",
                          })}`}
                        </span>
                      )}
                    </th>
                    {years.map((year) => {
                      const cell = row.cells.get(year);
                      return (
                        <td
                          key={year}
                          className="border-border group-hover:bg-foreground/[0.03] border-t pt-5 pb-7 text-center align-middle transition-colors"
                        >
                          {cell == null ? (
                            <span
                              aria-hidden
                              className="bg-border mx-auto block h-px w-3"
                            />
                          ) : (
                            <span
                              title={cellLabel(row.competition, year, cell)}
                              className="relative inline-flex"
                            >
                              <span className="sr-only">
                                {cellLabel(row.competition, year, cell)}
                              </span>
                              {cell.place == null ? null : (
                                <span aria-hidden>
                                  <PlaceBadge
                                    item={{
                                      result: "place",
                                      place: cell.place,
                                    }}
                                    size="sm"
                                  />
                                </span>
                              )}
                              {cell.distinctions.length === 0 ? null : (
                                <span
                                  aria-hidden
                                  // Below the badge without shifting it, so badges stay on one line.
                                  className="text-muted-foreground absolute top-full left-1/2 mt-1 inline-flex -translate-x-1/2 items-center gap-0.5 text-xs tabular-nums"
                                >
                                  <StarIcon
                                    weight="fill"
                                    className="text-primary size-3"
                                  />
                                  {cell.distinctions.length}
                                </span>
                              )}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ul className="text-muted-foreground mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          {[1, 2, 3, 5].map((place) => (
            <li key={place} className="inline-flex items-center gap-2">
              <span aria-hidden>
                <PlaceBadge item={{ result: "place", place }} size="sm" />
              </span>
              {place > 3 ? "dalsze miejsce" : `${toRoman(place)}\u00A0miejsce`}
            </li>
          ))}
          <li className="inline-flex items-center gap-2">
            <StarIcon
              aria-hidden
              weight="fill"
              className="text-primary size-4"
            />
            wyróżnienia w konkurencjach
          </li>
        </ul>
      </Reveal>
    </section>
  );
}

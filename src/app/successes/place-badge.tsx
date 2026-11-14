import { SealCheckIcon, StarIcon } from "@phosphor-icons/react";

import { toRoman } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-10 text-sm [&_svg]:size-4",
  md: "size-12 text-base [&_svg]:size-5",
};

/** Place as a roman numeral: 1st filled orange, 2nd outlined, 3rd faint; icons for other results. */
export function PlaceBadge({
  item,
  size = "md",
  className,
}: {
  item: Pick<Achievement, "result" | "place">;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const base = cn(
    "inline-flex shrink-0 items-center justify-center rounded-full font-bold tabular-nums",
    SIZES[size],
    className,
  );

  if (item.result === "place" && item.place != null) {
    return (
      <span
        className={cn(
          base,
          item.place === 1 && "bg-primary text-primary-foreground",
          item.place === 2 && "border-primary text-primary border-2",
          item.place === 3 && "border-primary/45 text-foreground border-2",
          item.place > 3 && "border-border text-muted-foreground border",
        )}
      >
        <span className="sr-only">{`Miejsce ${String(item.place)}: `}</span>
        <span aria-hidden>{toRoman(item.place)}</span>
      </span>
    );
  }

  const Icon = item.result === "distinction" ? StarIcon : SealCheckIcon;
  return (
    <span className={cn(base, "border-border text-primary border")}>
      <Icon weight="fill" aria-hidden />
      <span className="sr-only">
        {item.result === "distinction" ? "Wyróżnienie: " : "Tytuł: "}
      </span>
    </span>
  );
}

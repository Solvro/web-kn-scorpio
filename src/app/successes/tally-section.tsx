"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import { HighlightedText } from "@/components/highlighted-text";
import { Reveal } from "@/components/reveal";
import { useCountUp } from "@/hooks/use-count-up";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { plural, toRoman } from "@/lib/achievements";
import type { AchievementTally } from "@/lib/achievements";
import type { SuccessesPageContent } from "@/lib/api/achievements";
import { cmsImageLoader } from "@/lib/cms-image";
import { cn } from "@/lib/utils";

const MEDAL_SHADES = ["bg-primary", "bg-primary/55", "bg-primary/25"];

function CountUp({ value, className }: { value: number; className: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const active = useInView(ref, { once: true, amount: 0.6 });
  const shown = useCountUp(ref, value, active);
  return (
    <p ref={ref} className={className}>
      <motion.span>{shown}</motion.span>
    </p>
  );
}

/** One bar split by medal colour; it grows in from the left when scrolled into view. */
function MedalBar({ medals }: { medals: AchievementTally["medals"] }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollReveal(ref, 0.6);
  const total = medals[0] + medals[1] + medals[2];
  return (
    <div
      ref={ref}
      aria-hidden
      className="motion-safe:ease-out-expo flex h-3 origin-left gap-1 data-[reveal=pending]:scale-x-0 motion-safe:transition-transform motion-safe:delay-200 motion-safe:duration-[1400ms]"
    >
      {medals.map((count, index) =>
        count === 0 ? null : (
          <div
            // Fixed three slots: 1st, 2nd and 3rd place.
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            style={{ flexGrow: count / total }}
            className={cn("rounded-sm", MEDAL_SHADES[index])}
          />
        ),
      )}
    </div>
  );
}

export function TallySection({
  tally,
  content,
}: {
  tally: AchievementTally;
  content: SuccessesPageContent["tally"];
}) {
  if (tally.podium === 0) {
    return null;
  }

  const secondary = [
    {
      value: tally.roverChallengeWins,
      label: plural(tally.roverChallengeWins, {
        one: "zwycięstwo w Rover Challenge",
        few: "zwycięstwa w Rover Challenge",
        many: "zwycięstw w Rover Challenge",
      }),
    },
    {
      value: tally.distinctions,
      label: plural(tally.distinctions, {
        one: "wyróżnienie",
        few: "wyróżnienia",
        many: "wyróżnień",
      }),
    },
    {
      value: tally.titles,
      label: plural(tally.titles, {
        one: "tytuł i nagroda",
        few: "tytuły i nagrody",
        many: "tytułów i nagród",
      }),
    },
  ].filter((stat) => stat.value > 0);

  return (
    <section className="grid grid-cols-1 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:py-32">
      <div className="lg:col-span-7">
        {content.title == null ? null : (
          <Reveal>
            <h2 className="text-foreground text-4xl font-bold tracking-tighter text-balance sm:text-5xl lg:text-6xl">
              <HighlightedText text={content.title} />
            </h2>
          </Reveal>
        )}

        <Reveal delay={100} className="mt-12 flex items-end gap-5">
          <CountUp
            value={tally.podium}
            className="text-foreground text-[7rem] leading-[0.8] font-bold tracking-tighter tabular-nums sm:text-[10rem]"
          />
          <p className="text-muted-foreground max-w-[12ch] pb-1 text-lg leading-snug sm:text-xl">
            {plural(tally.podium, {
              one: "miejsce na podium",
              few: "miejsca na podium",
              many: "miejsc na podium",
            })}
          </p>
        </Reveal>

        <Reveal delay={180} className="mt-10 max-w-xl">
          <MedalBar medals={tally.medals} />
          <dl className="mt-4 grid grid-cols-3 gap-4">
            {tally.medals.map((count, index) => (
              <div
                // Fixed three slots: 1st, 2nd and 3rd place.
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="flex items-baseline gap-2"
              >
                <dt className="text-muted-foreground text-sm">
                  {`${toRoman(index + 1)}\u00A0miejsce`}
                </dt>
                <dd className="text-foreground order-first text-2xl font-bold tabular-nums">
                  {count}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {secondary.length === 0 ? null : (
          <dl className="border-border mt-14 grid grid-cols-1 gap-8 border-t pt-10 sm:grid-cols-3">
            {secondary.map((stat, index) => (
              <Reveal
                key={stat.label}
                delay={240 + index * 80}
                className="flex flex-col-reverse"
              >
                <dt className="text-muted-foreground mt-1 text-sm">
                  {stat.label}
                </dt>
                <dd>
                  <CountUp
                    value={stat.value}
                    className="text-foreground text-5xl font-bold tracking-tighter tabular-nums"
                  />
                </dd>
              </Reveal>
            ))}
          </dl>
        )}
      </div>

      {content.image == null ? null : (
        <Reveal delay={120} className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
            <Image
              loader={cmsImageLoader}
              src={content.image.src}
              alt={content.image.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover object-[45%_50%]"
            />
          </div>
        </Reveal>
      )}
    </section>
  );
}

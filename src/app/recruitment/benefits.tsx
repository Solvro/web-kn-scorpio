import { cn } from "cn";
import Image from "next/image";

import { HighlightedText } from "@/components/highlighted-text";
import { Reveal } from "@/components/reveal";
import type { RecruitmentBenefit } from "@/lib/api/recruitment-benefits";
import { cmsImageLoader } from "@/lib/cms-image";

// The first benefit takes the large tile.
const BENEFIT_TILES = [
  "md:col-span-7 md:row-span-2 min-h-[420px]",
  "md:col-span-5 min-h-[260px]",
  "md:col-span-5 min-h-[260px]",
];

export function Benefits({
  title,
  benefits,
}: {
  title: string;
  benefits: RecruitmentBenefit[];
}) {
  if (benefits.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:pb-32">
      <Reveal>
        {title === "" ? null : (
          <h2 className="text-foreground text-4xl font-bold tracking-tighter sm:text-5xl">
            <HighlightedText text={title} />
          </h2>
        )}
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-12">
        {benefits.slice(0, BENEFIT_TILES.length).map((benefit, index) => (
          <Reveal
            key={benefit.id}
            delay={index * 100}
            className={cn(
              "group relative overflow-hidden rounded-lg",
              BENEFIT_TILES[index],
            )}
          >
            <Image
              loader={cmsImageLoader}
              src={benefit.image.src}
              alt={benefit.image.alt}
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <div className="from-background via-background/50 absolute inset-0 bg-linear-to-t to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <h3 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                {benefit.title}
              </h3>
              <p className="text-foreground/80 mt-2 max-w-md text-sm leading-relaxed sm:text-base">
                {benefit.text}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

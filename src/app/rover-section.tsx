"use client";

import { RocketIcon, TrophyIcon } from "lucide-react";
import Image from "next/image";

import { ACHIEVEMENTS, ROVER_GENERATIONS } from "@/app/temporary-data";
import { FullBleedSection } from "@/components/full-bleed-section";
import { Reveal } from "@/components/reveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const EDGE_FADE =
  "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]";

export function RoverSection() {
  return (
    <FullBleedSection className="bg-card/20 border-border/50 border-t py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal className="max-w-xl">
            <div className="text-primary mb-4 flex items-center gap-2">
              <RocketIcon className="size-5" />
              <span className="text-sm font-semibold">Projekt Scorpio</span>
            </div>
            <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Osiem generacji łazika
            </h2>
            <p className="text-muted-foreground mt-5 text-base leading-relaxed sm:text-lg">
              Łazik Scorpio startuje w międzynarodowych zawodach Rover
              Challenge, zdobywając medale i mierząc się z najlepszymi drużynami
              świata.
            </p>
          </Reveal>

          <Reveal delay={150} className="flex gap-8">
            {ACHIEVEMENTS.map((achievement) => (
              <div key={achievement.competition} className="flex gap-3">
                <TrophyIcon className="text-primary mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    {achievement.competition}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {achievement.result}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>

      <Reveal delay={200} className="mt-14">
        <Carousel opts={{ loop: true, align: "center" }} className="w-full">
          <CarouselContent
            className="-ml-6"
            viewportClassName={cn("px-4 sm:px-10 lg:px-20", EDGE_FADE)}
          >
            {ROVER_GENERATIONS.map((rover) => (
              <CarouselItem
                key={rover.name}
                className="basis-[85%] pl-6 sm:basis-[60%] lg:basis-[42%]"
              >
                <div className="border-border/70 bg-foreground/5 relative h-[55vh] overflow-hidden rounded-lg border">
                  <Image
                    src={rover.src}
                    alt={rover.name}
                    fill
                    className="object-contain p-6"
                    sizes="(min-width: 1024px) 42vw, (min-width: 640px) 60vw, 85vw"
                  />
                  <div className="from-background/90 absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent p-6 pt-12">
                    <span className="text-foreground text-xl font-bold tracking-tight">
                      {rover.name}
                    </span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 hidden sm:left-10 sm:inline-flex lg:left-20" />
          <CarouselNext className="right-4 hidden sm:right-10 sm:inline-flex lg:right-20" />
        </Carousel>
      </Reveal>
    </FullBleedSection>
  );
}

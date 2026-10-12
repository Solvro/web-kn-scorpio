"use client";

import { ArrowRightIcon, NewspaperIcon } from "lucide-react";
import Link from "next/link";

import { NEWS_HIGHLIGHTS } from "@/app/temporary-data";
import { FullBleedSection } from "@/components/full-bleed-section";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
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

export function NewsSection() {
  return (
    <FullBleedSection className="border-border/50 border-t py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-4">
        <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="flex items-center gap-3">
            <NewspaperIcon className="text-primary size-8" />
            <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Aktualności
            </h2>
          </div>
          <Button
            variant="link"
            className="text-primary px-0"
            nativeButton={false}
            render={
              <Link href="/news" className="group inline-flex gap-1.5">
                Zobacz więcej
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            }
          />
        </Reveal>
      </div>

      <Reveal delay={150} className="mt-12">
        <Carousel opts={{ loop: true, align: "start" }} className="w-full">
          <CarouselContent
            viewportClassName={cn("px-4 sm:px-10 lg:px-20", EDGE_FADE)}
          >
            {NEWS_HIGHLIGHTS.map((title) => (
              <CarouselItem key={title} className="sm:basis-1/2 lg:basis-1/3">
                <div className="border-border/70 bg-card/60 hover:border-primary/50 flex h-48 flex-col justify-between rounded-lg border p-6 transition-colors">
                  <p className="text-foreground text-lg leading-snug font-semibold">
                    {title}
                  </p>
                  <span className="text-primary text-sm font-medium">
                    Czytaj więcej
                  </span>
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

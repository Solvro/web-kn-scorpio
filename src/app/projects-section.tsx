"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import { PROJECTS } from "@/app/temporary-data";
import { FullBleedSection } from "@/components/full-bleed-section";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

// 4-2 / 2-4 rhythm on desktop so the wide Twardowsky render gets the wide slot.
const SPANS = [
  "md:col-span-4",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-4",
];

export function ProjectsSection() {
  return (
    <FullBleedSection className="py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-foreground text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              Nie tylko łazik
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg text-base leading-relaxed sm:text-lg">
              Projektujemy też kolonie, lądowniki i rozwiązania dla rolnictwa.
            </p>
          </div>
          <Link
            href="/projects"
            className="text-primary group inline-flex items-center gap-1.5 text-sm font-medium"
          >
            Wszystkie projekty
            <ArrowUpRightIcon
              weight="bold"
              className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-[340px_340px]">
          {PROJECTS.map((project, index) => (
            <Reveal
              key={project.name}
              delay={index * 90}
              className={cn(
                "group relative min-h-[300px] overflow-hidden rounded-lg",
                SPANS[index],
                project.image == null &&
                  "from-primary/90 to-secondary bg-linear-to-br",
              )}
            >
              {project.image == null ? null : (
                <>
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    sizes="(min-width: 768px) 66vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                  <div className="from-background via-background/60 absolute inset-0 bg-linear-to-t to-transparent to-70%" />
                </>
              )}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p
                  className={cn(
                    "text-sm font-medium",
                    project.image == null
                      ? "text-primary-foreground/80"
                      : "text-foreground/75",
                  )}
                >
                  {project.tagline}
                </p>
                <h3 className="text-foreground mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  {project.name}
                </h3>
                <p
                  className={cn(
                    "mt-2 max-w-md text-sm leading-relaxed",
                    project.image == null
                      ? "text-primary-foreground/90"
                      : "text-muted-foreground",
                  )}
                >
                  {project.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </FullBleedSection>
  );
}

"use client";

import { ArrowRightIcon } from "@phosphor-icons/react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { FullBleedSection } from "@/components/full-bleed-section";
import { HighlightedText } from "@/components/highlighted-text";
import { Reveal } from "@/components/reveal";
import type { Division } from "@/lib/api/divisions";
import type { HomePageContent } from "@/lib/api/home-page";
import { cmsImageLoader } from "@/lib/cms-image";

const ROW_CLASS =
  "group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 outline-none sm:gap-8 md:grid-cols-[1fr_1fr_auto] md:py-8";

function DivisionRowContent({ dept }: { dept: Division }) {
  return (
    <>
      <span className="bg-muted relative size-14 overflow-hidden rounded-md md:hidden">
        {dept.image == null ? null : (
          <Image
            loader={cmsImageLoader}
            src={dept.image.src}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        )}
      </span>
      <span className="text-foreground group-hover:text-primary group-focus-visible:text-primary text-3xl font-bold tracking-tight transition-colors duration-300 sm:text-4xl lg:text-6xl">
        {dept.name}
      </span>
      <span className="text-muted-foreground hidden max-w-sm text-base leading-relaxed md:block">
        {dept.tagline}
      </span>
    </>
  );
}

export function DepartmentsSection({
  heading,
  divisions,
  recruitmentAvailable,
}: {
  heading: HomePageContent["divisions"];
  divisions: Division[];
  /** Rows link to /recruitment#<slug> only when that page would render something. */
  recruitmentAvailable: boolean;
}) {
  if (divisions.length === 0) {
    return null;
  }

  return (
    <FullBleedSection className="py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal>
          {heading.eyebrow == null ? null : (
            <p className="text-primary mb-3 text-sm font-semibold tracking-[0.2em] uppercase">
              {heading.eyebrow}
            </p>
          )}
          {heading.title === "" ? null : (
            <h2 className="text-foreground text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              <HighlightedText text={heading.title} />
            </h2>
          )}
        </Reveal>

        <ul className="mt-12">
          {divisions.map((dept, index) => (
            <li key={dept.id} className="border-border border-t last:border-b">
              <Reveal delay={index * 70}>
                {recruitmentAvailable ? (
                  <Link
                    href={`/recruitment#${dept.slug}` as Route}
                    className={ROW_CLASS}
                  >
                    <DivisionRowContent dept={dept} />
                    <span className="border-border group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-11 items-center justify-center rounded-full border transition-all duration-300 group-hover:-rotate-45">
                      <ArrowRightIcon weight="bold" className="size-4" />
                    </span>
                  </Link>
                ) : (
                  <div className={ROW_CLASS}>
                    <DivisionRowContent dept={dept} />
                  </div>
                )}
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </FullBleedSection>
  );
}

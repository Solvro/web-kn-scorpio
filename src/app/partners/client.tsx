"use client";

import {
  ArrowRightIcon,
  DownloadSimpleIcon,
  EnvelopeSimpleIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import { NewsCard } from "@/app/news/news-card";
import { FullBleedSection } from "@/components/full-bleed-section";
import { HighlightedText } from "@/components/highlighted-text";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import type { NewsItem } from "@/lib/api/news";
import type { Partner, PartnersPageContent } from "@/lib/api/partners";
import type { Stat } from "@/lib/api/stats";
import { cmsImageLoader } from "@/lib/cms-image";
import { parseHighlights } from "@/lib/highlight";

import {
  MainPartners,
  PartnerBand,
  PartnerGrid,
  Supporters,
} from "./partner-sections";

/** "Oferta współpracy" and "Napisz do nas": the same two actions in the hero and the closing pitch. */
function PartnerActions({
  offer,
  contactEmail,
}: Pick<PartnersPageContent, "offer" | "contactEmail">) {
  if (offer == null && contactEmail == null) {
    return null;
  }
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      {offer == null ? null : (
        <div>
          <Button
            size="lg"
            className="h-12 w-full gap-2 px-6 text-base active:scale-[0.98] sm:w-auto"
            nativeButton={false}
            render={
              <a href={offer.url} download>
                Oferta współpracy
                <DownloadSimpleIcon
                  aria-hidden
                  weight="bold"
                  className="transition-transform group-hover/button:translate-y-0.5"
                />
              </a>
            }
          />
          {offer.sizeLabel == null ? null : (
            <p className="text-muted-foreground mt-2 text-xs sm:text-center">
              {offer.sizeLabel}
            </p>
          )}
        </div>
      )}
      {contactEmail == null ? null : (
        <Button
          size="lg"
          variant="outline"
          className="bg-background/40 hover:bg-background/70 h-12 gap-2 px-6 text-base active:scale-[0.98]"
          nativeButton={false}
          render={
            <a href={`mailto:${contactEmail}`}>
              <EnvelopeSimpleIcon aria-hidden weight="bold" />
              Napisz do nas
            </a>
          }
        />
      )}
    </div>
  );
}

function PartnersHero({ page }: { page: PartnersPageContent }) {
  return (
    <section className="grid grid-cols-1 items-center gap-12 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:pt-20 lg:pb-24">
      <div className="lg:col-span-6">
        <h1 className="text-foreground motion-safe:animate-fade-up text-5xl leading-[1.05] font-bold tracking-tighter text-balance sm:text-6xl lg:text-7xl">
          <HighlightedText text={page.hero.title} />
        </h1>
        {page.hero.intro == null ? null : (
          <p
            style={{ animationDelay: "0.12s" }}
            className="text-muted-foreground motion-safe:animate-fade-up mt-6 max-w-lg text-base leading-relaxed sm:text-lg"
          >
            {page.hero.intro}
          </p>
        )}
        <div
          style={{ animationDelay: "0.24s" }}
          className="motion-safe:animate-fade-up mt-9"
        >
          <PartnerActions offer={page.offer} contactEmail={page.contactEmail} />
        </div>
      </div>
      {page.hero.image == null ? null : (
        <div className="motion-safe:animate-clip-reveal relative aspect-[4/3] overflow-hidden rounded-lg lg:col-span-6">
          <Image
            loader={cmsImageLoader}
            src={page.hero.image.src}
            alt={page.hero.image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="motion-safe:animate-zoom-out object-cover"
          />
        </div>
      )}
    </section>
  );
}

function PartnerNews({ news }: { news: NewsItem[] }) {
  if (news.length === 0) {
    return null;
  }
  return (
    <section className="px-4 py-20 sm:px-6 lg:py-28">
      <Reveal>
        <h2 className="text-foreground text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">
          Współpraca w aktualnościach
        </h2>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:mt-12">
        {news.slice(0, 2).map((item, index) => (
          <Reveal
            key={item.slug}
            delay={index * 90}
            className={news.length === 1 ? "md:col-span-2" : undefined}
          >
            <NewsCard item={item} wide={news.length === 1} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Closing pitch for companies: why partner with us, in the team's own numbers. */
function PitchSection({
  page,
  stats,
}: {
  page: PartnersPageContent;
  stats: Stat[];
}) {
  if (page.pitch.title == null) {
    return null;
  }
  return (
    <FullBleedSection
      id="zostan-partnerem"
      className="border-border bg-card scroll-mt-16 border-t py-24 lg:py-32"
    >
      <div
        aria-hidden
        className="bg-primary/15 absolute -top-40 -left-40 size-[520px] rounded-full blur-3xl"
      />
      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:items-end">
        <Reveal className="lg:col-span-6">
          <h2 className="text-foreground text-4xl font-bold tracking-tighter text-balance sm:text-5xl lg:text-6xl">
            <HighlightedText text={page.pitch.title} />
          </h2>
          {page.pitch.text == null ? null : (
            <p className="text-muted-foreground mt-5 max-w-lg text-base leading-relaxed sm:text-lg">
              {page.pitch.text}
            </p>
          )}
          <div className="mt-9">
            <PartnerActions
              offer={page.offer}
              contactEmail={page.contactEmail}
            />
          </div>
        </Reveal>

        {stats.length === 0 ? null : (
          <Reveal delay={120} className="lg:col-span-5 lg:col-start-8">
            <dl className="flex flex-wrap gap-x-10 gap-y-6">
              {stats.map((stat) => (
                <div key={stat.id} className="flex min-w-28 flex-col-reverse">
                  <dt className="text-muted-foreground mt-1 text-sm">
                    {stat.label}
                  </dt>
                  <dd className="text-foreground text-5xl font-bold tracking-tighter tabular-nums sm:text-6xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
            <Link
              href="/successes"
              className="text-primary group mt-8 inline-flex items-center gap-1.5 text-sm font-medium"
            >
              Zobacz nasze sukcesy
              <ArrowRightIcon
                aria-hidden
                weight="bold"
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </Reveal>
        )}
      </div>
    </FullBleedSection>
  );
}

export function PartnersPageClient({
  page,
  partners,
  stats,
  news,
}: {
  page: PartnersPageContent | null;
  partners: Partner[];
  stats: Stat[];
  news: NewsItem[];
}) {
  return (
    <>
      {page == null ? (
        <h1 className="text-foreground px-4 pt-14 text-5xl font-bold tracking-tighter sm:px-6 sm:text-6xl lg:pt-20 lg:text-8xl">
          Partnerzy
        </h1>
      ) : (
        <PartnersHero page={page} />
      )}
      {partners.length === 0 ? null : (
        <PartnerBand>
          <MainPartners
            partners={partners.filter((partner) => partner.tier === "main")}
          />
          <PartnerGrid
            partners={partners.filter((partner) => partner.tier === "partner")}
            invite={
              page?.pitch.title == null
                ? null
                : {
                    label: parseHighlights(page.pitch.title)
                      .map((segment) => segment.text)
                      .join(""),
                    href: "#zostan-partnerem",
                  }
            }
          />
          <Supporters
            partners={partners.filter(
              (partner) => partner.tier === "supporter",
            )}
          />
        </PartnerBand>
      )}
      <PartnerNews news={news} />
      {page == null ? null : <PitchSection page={page} stats={stats} />}
    </>
  );
}

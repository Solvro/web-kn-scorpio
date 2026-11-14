"use client";

import { ArrowDownRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { useRef } from "react";

import { FullBleedSection } from "@/components/full-bleed-section";
import { Reveal } from "@/components/reveal";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import type { Partner } from "@/lib/api/partners";
import { cn } from "@/lib/utils";

import { LogoMark } from "./logo-mark";

/** The whole cell links to the partner's site when there is one. */
function PartnerLink({
  partner,
  className,
  children,
}: {
  partner: Partner;
  className?: string;
  children: React.ReactNode;
}) {
  const classes = cn(
    "group focus-visible:outline-primary relative block h-full -outline-offset-4",
    className,
  );
  if (partner.url == null) {
    return <div className={classes}>{children}</div>;
  }
  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
    >
      {children}
      <span className="sr-only">(otwiera się w nowej karcie)</span>
    </a>
  );
}

/**
 * Huge ghosted tier heading, like the years on the successes page: it fades
 * out downward.
 */
function TierHeading({ count, children }: { count: number; children: string }) {
  return (
    <Reveal>
      <div className="border-border flex items-start justify-between gap-6 border-t pt-6">
        <h2 className="from-foreground/50 to-foreground/10 bg-linear-to-b bg-clip-text text-6xl leading-[0.85] font-bold tracking-tighter text-balance text-transparent uppercase sm:text-8xl lg:text-9xl">
          {children}
        </h2>
        <span
          aria-hidden
          className="text-primary pt-2 text-3xl font-bold tracking-tighter tabular-nums sm:text-5xl"
        >
          {String(count).padStart(2, "0")}
        </span>
      </div>
    </Reveal>
  );
}

// Fixed tilts and nudges, so the sheet looks hand-applied but renders the same
// on the server and the client.
const TILTS = [-2.5, 1.5, -1, 3, -3.5, 2, 0.5, -2, 2.5, -1.5, 1, -3];
const NUDGES = [0, 6, -4, 8, -2, 4, -6, 2];

/**
 * One sticker. It lands as it scrolls into view (as if slapped on), and
 * straightens and lifts on hover or keyboard focus.
 */
function Decal({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLLIElement>(null);
  useScrollReveal(ref, 0.4);
  return (
    <li
      ref={ref}
      style={
        {
          "--tilt": `${String(TILTS[index % TILTS.length])}deg`,
          "--nudge": `${String(NUDGES[index % NUDGES.length])}px`,
          transitionDelay: `${String((index % 6) * 50)}ms`,
        } as React.CSSProperties
      }
      className={cn(
        "relative data-[reveal=pending]:scale-125 data-[reveal=pending]:opacity-0 motion-safe:transition-[scale,opacity] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.34,1.4,0.64,1)]",
        className,
      )}
    >
      {children}
    </li>
  );
}

/** The sticker itself: a light die-cut plate, tilted, that settles on hover. */
const STICKER =
  "bg-plate flex items-center justify-center rounded-xl translate-y-(--nudge) rotate-(--tilt) shadow-[0_14px_30px_-14px_oklch(0.1_0.005_285/0.9)] transition-[rotate,translate,scale,box-shadow] duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.04] group-hover:rotate-0 group-hover:shadow-[0_24px_40px_-16px_oklch(0.1_0.005_285/0.9)] group-focus-visible:rotate-0 motion-reduce:transition-none";

/** Main partners: two big stickers with the full description under each. */
export function MainPartners({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) {
    return null;
  }
  return (
    <div>
      <TierHeading count={partners.length}>Partnerzy główni</TierHeading>
      <ul
        className={cn(
          "mt-10 grid grid-cols-1 gap-x-12 gap-y-14 lg:mt-14",
          partners.length > 1 && "md:grid-cols-2",
        )}
      >
        {partners.map((partner, index) => (
          <Decal key={partner.id} index={index * 3}>
            <PartnerLink partner={partner} className="outline-offset-8">
              <div className={cn(STICKER, "aspect-[16/9] p-8")}>
                <LogoMark partner={partner} area={34_000} className="p-0" />
              </div>
              <h3 className="text-foreground mt-8 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {partner.name}
                {partner.url == null ? null : (
                  <ArrowUpRightIcon
                    aria-hidden
                    weight="bold"
                    className="text-primary size-6 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                )}
              </h3>
              {partner.description == null ? null : (
                <p className="text-muted-foreground mt-3 max-w-xl text-base leading-relaxed">
                  {partner.description}
                </p>
              )}
            </PartnerLink>
          </Decal>
        ))}
      </ul>
    </div>
  );
}

/**
 * A logo sticker. On wide screens with a mouse the name and description open
 * in a card under it; elsewhere they are printed under it, so nothing depends
 * on hover.
 */
function LogoDecal({
  partner,
  index,
  area,
  size,
}: {
  partner: Partner;
  index: number;
  area: number;
  size: string;
}) {
  return (
    <Decal
      index={index}
      className="focus-within:z-10 hover:z-10 md:max-w-[20rem]"
    >
      <PartnerLink partner={partner} className="outline-offset-8">
        <div className={cn(STICKER, size)}>
          <LogoMark partner={partner} area={area} className="p-0" />
        </div>
        <div
          className={cn(
            "mt-5",
            "[@media(hover:hover)_and_(min-width:48rem)]:hidden",
          )}
        >
          <h3 className="text-foreground text-base font-bold tracking-tight">
            {partner.name}
          </h3>
          {partner.description == null ? null : (
            <p className="text-muted-foreground mt-1 line-clamp-3 text-sm leading-relaxed">
              {partner.description}
            </p>
          )}
        </div>
        <div
          aria-hidden
          className={cn(
            "bg-card border-border pointer-events-none absolute top-full left-1/2 mt-4 hidden w-72 -translate-x-1/2 translate-y-2 rounded-lg border p-4 opacity-0 shadow-[0_20px_50px_-20px_oklch(0.1_0.005_285/0.9)] transition-[opacity,translate] duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
            "[@media(hover:hover)_and_(min-width:48rem)]:block",
          )}
        >
          <p className="text-foreground flex items-center justify-between gap-2 text-base font-bold tracking-tight">
            {partner.name}
            {partner.url == null ? null : (
              <ArrowUpRightIcon
                aria-hidden
                weight="bold"
                className="text-primary size-4 shrink-0"
              />
            )}
          </p>
          {partner.description == null ? null : (
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              {partner.description}
            </p>
          )}
        </div>
      </PartnerLink>
    </Decal>
  );
}

/**
 * A sheet of stickers: a list of two columns on phones, a loose centred
 * scatter on wider screens. Rows of any length look right, so no count
 * leaves a hole.
 */
const SHEET =
  "mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:flex md:flex-wrap md:items-center md:justify-center md:gap-x-10 md:gap-y-14 lg:mt-14";

/** Partners: a sheet of logo stickers, closed by an orange invite sticker. */
export function PartnerGrid({
  partners,
  invite,
}: {
  partners: Partner[];
  /** Label and target of the closing sticker, e.g. the pitch section. */
  invite: { label: string; href: string } | null;
}) {
  if (partners.length === 0) {
    return null;
  }
  return (
    <div>
      <TierHeading count={partners.length}>Partnerzy</TierHeading>
      <ul className={SHEET}>
        {partners.map((partner, index) => (
          <LogoDecal
            key={partner.id}
            partner={partner}
            index={index}
            area={7000}
            size="min-h-24 px-6 py-5 md:min-h-28 md:px-8"
          />
        ))}
        {invite == null ? null : (
          <Decal index={partners.length} className="self-start md:self-auto">
            <a
              href={invite.href}
              className="group focus-visible:outline-foreground block rounded-xl outline-offset-8"
            >
              <span
                className={cn(
                  STICKER,
                  "bg-primary text-primary-foreground min-h-24 gap-4 px-6 py-5 md:min-h-28 md:px-8",
                )}
              >
                <span className="text-xl font-bold tracking-tight sm:text-2xl">
                  {invite.label}
                </span>
                <ArrowDownRightIcon
                  aria-hidden
                  weight="bold"
                  className="size-6 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1"
                />
              </span>
            </a>
          </Decal>
        )}
      </ul>
    </div>
  );
}

/** Supporters: the same sheet with smaller stickers. */
export function Supporters({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) {
    return null;
  }
  return (
    <div>
      <TierHeading count={partners.length}>Wspierają nas też</TierHeading>
      <ul className={SHEET}>
        {partners.map((partner, index) => (
          <LogoDecal
            key={partner.id}
            partner={partner}
            // Offset, so this sheet doesn't repeat the tilts of the one above.
            index={index + 5}
            area={5000}
            size="min-h-20 px-5 py-4 md:min-h-24 md:px-7"
          />
        ))}
      </ul>
    </div>
  );
}

/** One continuous band behind all three tiers, with warm gradient glows. */
export function PartnerBand({ children }: { children: React.ReactNode }) {
  return (
    <FullBleedSection className="border-border from-background via-card to-background border-y bg-linear-to-b py-8 lg:py-12">
      <div
        aria-hidden
        className="bg-primary/20 absolute -top-40 -right-40 size-[700px] rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="bg-primary/10 absolute top-1/2 -left-72 size-[800px] rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="bg-secondary/60 absolute -right-60 -bottom-40 size-[700px] rounded-full blur-3xl"
      />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 py-12 sm:px-6 lg:gap-32 lg:py-16">
        {children}
      </div>
    </FullBleedSection>
  );
}

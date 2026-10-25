"use client";

import { MagnifyingGlassPlusIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";

import { FullBleedSection } from "@/components/full-bleed-section";
import { HighlightedText } from "@/components/highlighted-text";
import { Reveal } from "@/components/reveal";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Marquee, useIsMarqueeCopy } from "@/components/ui/marquee";
import type { FieldPhoto } from "@/lib/api/field-photos";
import type { SectionHeading } from "@/lib/api/home-page";
import { cmsImageLoader } from "@/lib/cms-image";

// Narrow fade on phones so more cards stay visible, deep fade from tablet up.
const EDGE_FADE =
  "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] sm:[mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]";

// Shared by the card and the modal placeholder so the modal reuses the cached card image.
const CARD_SIZES = "(min-width: 1024px) 600px, (min-width: 640px) 480px, 200px";

type Moment = FieldPhoto;

function MomentCard({
  moment,
  onOpen,
}: {
  moment: Moment;
  onOpen: () => void;
}) {
  const isCopy = useIsMarqueeCopy();
  return (
    <figure className="w-[200px] shrink-0 sm:w-[480px] lg:w-[600px]">
      <button
        type="button"
        tabIndex={isCopy ? -1 : undefined}
        onClick={onOpen}
        aria-label={`Powiększ zdjęcie: ${moment.caption}`}
        className="group/card focus-visible:ring-ring/50 relative block aspect-[3/2] w-full cursor-zoom-in overflow-hidden rounded-lg outline-none focus-visible:ring-3"
      >
        <Image
          loader={cmsImageLoader}
          src={moment.image.src}
          alt={moment.image.alt}
          fill
          sizes={CARD_SIZES}
          className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.05]"
        />
        <span className="bg-background/70 text-foreground absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover/card:opacity-100 group-focus-visible/card:opacity-100">
          <MagnifyingGlassPlusIcon weight="bold" className="size-4" />
        </span>
      </button>
      <figcaption className="text-muted-foreground mt-2 text-xs sm:mt-3 sm:text-sm">
        {moment.caption}
      </figcaption>
    </figure>
  );
}

export function FieldGallerySection({
  heading,
  photos,
}: {
  heading: SectionHeading;
  photos: FieldPhoto[];
}) {
  const midpoint = Math.ceil(photos.length / 2);
  const topRow = photos.slice(0, midpoint);
  const bottomRow = photos.slice(midpoint);
  // Kept separately from `open` so the photo stays rendered during the close animation.
  const [selected, setSelected] = useState<Moment | null>(null);
  const [open, setOpen] = useState(false);
  const [loadedSource, setLoadedSource] = useState<string | null>(null);
  const show = (moment: Moment) => {
    setSelected(moment);
    setOpen(true);
  };

  if (photos.length === 0) {
    return null;
  }

  return (
    <FullBleedSection className="py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal>
          {heading.title === "" ? null : (
            <h2 className="text-foreground text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              <HighlightedText text={heading.title} />
            </h2>
          )}
          {heading.intro == null ? null : (
            <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
              {heading.intro}
            </p>
          )}
        </Reveal>
      </div>

      <Reveal delay={150} className={`mt-12 flex flex-col gap-4 ${EDGE_FADE}`}>
        {/* Top row drifts right, bottom row drifts left */}
        <Marquee
          reverse
          pauseOnHover
          className="[--duration:70s] [--gap:0.75rem] sm:[--gap:1.25rem]"
        >
          {topRow.map((moment) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              onOpen={() => {
                show(moment);
              }}
            />
          ))}
        </Marquee>
        {bottomRow.length === 0 ? null : (
          <Marquee
            pauseOnHover
            className="[--duration:60s] [--gap:0.75rem] sm:[--gap:1.25rem]"
          >
            {bottomRow.map((moment) => (
              <MomentCard
                key={moment.id}
                moment={moment}
                onOpen={() => {
                  show(moment);
                }}
              />
            ))}
          </Marquee>
        )}
      </Reveal>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          overlayClassName={`bg-background/85 supports-backdrop-filter:backdrop-blur-md duration-500 data-closed:duration-300 ease-out-expo`}
          className={`[&_[data-slot=dialog-close]]:bg-background/70 data-open:blur-in-sm data-open:slide-in-from-bottom-6 data-open:zoom-in-90 data-closed:blur-out-sm data-closed:zoom-out-95 ease-out-expo w-fit max-w-[92vw] bg-transparent p-0 ring-0 duration-600 data-closed:duration-300 motion-reduce:duration-0 sm:max-w-[92vw] [&_[data-slot=dialog-close]]:backdrop-blur-md`}
        >
          {selected == null ? null : (
            <figure>
              <div
                className="bg-muted relative overflow-hidden rounded-lg"
                // Largest size that fits 92vw x 80dvh while keeping the photo's ratio.
                style={{
                  width: `min(92vw, calc(80dvh * ${String(selected.image.width / selected.image.height)}))`,
                  aspectRatio: `${String(selected.image.width)} / ${String(selected.image.height)}`,
                }}
              >
                {/* Card-sized copy is already cached, so something shows instantly */}
                <Image
                  loader={cmsImageLoader}
                  src={selected.image.src}
                  alt=""
                  fill
                  sizes={CARD_SIZES}
                  className="scale-105 object-cover blur-sm"
                />
                <Image
                  loader={cmsImageLoader}
                  src={selected.image.src}
                  alt={selected.image.alt}
                  fill
                  sizes="92vw"
                  onLoad={() => {
                    setLoadedSource(selected.image.src);
                  }}
                  className={`ease-out-expo object-cover transition-opacity duration-500 ${
                    loadedSource === selected.image.src
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                />
              </div>
              <DialogTitle
                render={<figcaption />}
                className="text-muted-foreground mt-4 text-center text-sm font-normal"
              >
                {selected.caption}
              </DialogTitle>
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </FullBleedSection>
  );
}

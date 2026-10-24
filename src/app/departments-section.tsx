"use client";

import { ArrowRightIcon } from "@phosphor-icons/react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { PointerEvent } from "react";

import { DEPARTMENTS } from "@/app/temporary-data";
import { FullBleedSection } from "@/components/full-bleed-section";
import { Reveal } from "@/components/reveal";

const PREVIEW_SIZE = 260;

export function DepartmentsSection() {
  const reduce = useReducedMotion() ?? false;
  const [hovered, setHovered] = useState<string | null>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 260, damping: 28, mass: 0.6 });
  const y = useSpring(pointerY, { stiffness: 260, damping: 28, mass: 0.6 });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(event.clientX - bounds.left - PREVIEW_SIZE / 2);
    pointerY.set(event.clientY - bounds.top - PREVIEW_SIZE / 2);
  };

  const active = DEPARTMENTS.find((dept) => dept.slug === hovered);

  return (
    <FullBleedSection className="py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
            Zespół
          </p>
          <h2 className="text-foreground mt-3 text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
            Pięć działów, jeden łazik
          </h2>
        </Reveal>

        <div
          className="relative mt-12"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            setHovered(null);
          }}
        >
          {/* Cursor-following preview, desktop pointer only */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 z-10 hidden overflow-hidden rounded-lg md:block"
            style={{ x, y, width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
          >
            <AnimatePresence>
              {active == null ? null : (
                <motion.div
                  key={active.slug}
                  className="absolute inset-0"
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.85, rotate: -4 }
                  }
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                >
                  <Image
                    src={active.image}
                    alt=""
                    fill
                    sizes={`${String(PREVIEW_SIZE)}px`}
                    className="object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <ul>
            {DEPARTMENTS.map((dept, index) => (
              <li
                key={dept.slug}
                className="border-border border-t last:border-b"
              >
                <Reveal delay={index * 70}>
                  <Link
                    href={`/recruitment#${dept.slug}` as Route}
                    onPointerEnter={() => {
                      setHovered(dept.slug);
                    }}
                    onFocus={() => {
                      setHovered(dept.slug);
                    }}
                    onBlur={() => {
                      setHovered(null);
                    }}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 outline-none sm:gap-8 md:grid-cols-[1fr_1fr_auto] md:py-8"
                  >
                    <span className="relative size-14 overflow-hidden rounded-md md:hidden">
                      <Image
                        src={dept.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </span>
                    <span className="text-foreground group-hover:text-primary group-focus-visible:text-primary text-3xl font-bold tracking-tight transition-colors duration-300 sm:text-4xl lg:text-6xl">
                      {dept.name}
                    </span>
                    <span className="text-muted-foreground hidden max-w-sm text-base leading-relaxed md:block">
                      {dept.tagline}
                    </span>
                    <span className="border-border group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-11 items-center justify-center rounded-full border transition-all duration-300 group-hover:-rotate-45">
                      <ArrowRightIcon weight="bold" className="size-4" />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </FullBleedSection>
  );
}

"use client";

import { MailIcon, SatelliteIcon, SparklesIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { NewsSection } from "@/app/news-section";
import { RoverSection } from "@/app/rover-section";
import { DEPARTMENTS, PROJECTS, STATS } from "@/app/temporary-data";
import { FullBleedSection } from "@/components/full-bleed-section";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCountUp } from "@/hooks/use-count-up";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

function StatCounter({
  value,
  label,
  active,
}: {
  value: number;
  label: string;
  active: boolean;
}) {
  const count = useCountUp(value, active);
  return (
    <div className="text-center">
      <p className="text-primary text-7xl font-extrabold tracking-tighter tabular-nums sm:text-8xl md:text-9xl">
        {count}
      </p>
      <p className="text-muted-foreground mt-2 text-sm tracking-wide sm:text-base">
        {label}
      </p>
    </div>
  );
}

export function HomePageClient() {
  const { ref: statsRef, inView: statsInView } = useInView<HTMLDivElement>({
    threshold: 0.4,
  });
  const [flagshipProject, ...otherProjects] = PROJECTS;

  return (
    <main className="flex flex-col">
      <FullBleedSection className="-mt-16 flex min-h-dvh items-center">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Image
            src="https://www.scorpio.pwr.edu.pl/wp-content/uploads/2026/01/Kopia-Projekt_Scorpio_3-1024x683.jpg"
            alt="Łazik marsjański Scorpio"
            fill
            priority
            className="object-cover opacity-25"
          />
          <div className="from-background via-background/70 absolute inset-0 bg-linear-to-t to-transparent" />
          <div className="bg-primary/10 absolute -top-32 left-1/2 h-88 w-lg -translate-x-1/2 rounded-full blur-[110px]" />
        </div>

        <div className="mx-auto w-full max-w-3xl px-4 text-center">
          <Badge
            variant="outline"
            className="border-primary/30 bg-background/80 text-primary shadow-sm backdrop-blur-md"
          >
            <SparklesIcon className="size-3.5" />
            Politechnika Wrocławska
          </Badge>

          <h1 className="text-foreground mt-6 text-5xl font-extrabold tracking-tighter sm:text-6xl lg:text-7xl">
            Budujemy łaziki na <span className="text-primary">Marsa</span>.
          </h1>

          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
            Koło Naukowe SCORPIO projektuje i buduje łaziki marsjańskie na
            Politechnice Wrocławskiej od 2006 roku.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              nativeButton={false}
              render={<Link href="/recruitment">Dołącz do nas</Link>}
            />
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              nativeButton={false}
              render={<Link href="/projects">Poznaj nasze projekty</Link>}
            />
          </div>
        </div>
      </FullBleedSection>

      <FullBleedSection className="border-border/50 border-t py-24 lg:py-32">
        <div
          ref={statsRef}
          className="mx-auto w-full max-w-5xl px-4 text-center"
        >
          <p className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Dwie dekady, jeden cel.
          </p>

          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {STATS.map((stat) => (
              <StatCounter
                key={stat.label}
                value={stat.value}
                label={stat.label}
                active={statsInView}
              />
            ))}
          </div>

          <p className="text-muted-foreground mx-auto mt-14 max-w-xl text-sm leading-relaxed sm:text-base">
            Promujemy sektor kosmiczny w Polsce i gościmy w ośrodkach badawczych
            takich jak NASA Jet Propulsion Laboratory.
          </p>
        </div>
      </FullBleedSection>

      <RoverSection />

      <FullBleedSection className="bg-card/20 border-border/50 border-t py-24 lg:py-32">
        <div className="mx-auto w-full max-w-7xl px-4">
          <Reveal>
            <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Nie tylko łazik
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
              Poza łazikiem Scorpio realizujemy projekty, które wykraczają
              daleko za granice Marsa.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-3 md:grid-rows-2">
            <Reveal
              delay={100}
              className="relative overflow-hidden rounded-lg md:col-span-2 md:row-span-2"
            >
              <div className="relative h-72 md:h-full">
                {flagshipProject.image == null ? null : (
                  <Image
                    src={flagshipProject.image}
                    alt={flagshipProject.name}
                    fill
                    className="object-cover"
                  />
                )}
                <div className="from-background via-background/40 absolute inset-0 bg-linear-to-t to-transparent" />
                <div className="absolute bottom-0 left-0 p-7">
                  <span className="text-primary text-xs font-semibold tracking-wide uppercase">
                    {flagshipProject.tagline}
                  </span>
                  <h3 className="text-foreground mt-1 text-3xl font-bold">
                    {flagshipProject.name}
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                    {flagshipProject.description}
                  </p>
                </div>
              </div>
            </Reveal>

            {otherProjects.map((project, index) => (
              <Reveal
                key={project.name}
                delay={200 + index * 100}
                className={cn(
                  "border-border/60 flex flex-col justify-end rounded-lg border p-6",
                  index === 0 ? "bg-accent/40" : "bg-secondary/40",
                )}
              >
                <span className="text-primary text-xs font-semibold tracking-wide uppercase">
                  {project.tagline}
                </span>
                <h3 className="text-foreground mt-1 text-xl font-bold">
                  {project.name}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {project.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </FullBleedSection>

      <FullBleedSection className="border-border/50 border-t py-24 lg:py-32">
        <div className="mx-auto w-full max-w-7xl px-4">
          <Reveal className="flex items-center gap-3">
            <UsersIcon className="text-primary size-8" />
            <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Wybierz swój dział
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
              Pięć działów, jedna misja - każdy wnosi coś innego do budowy
              łazika.
            </p>
          </Reveal>

          <div className="divide-border/60 border-border/60 mt-12 grid gap-0 divide-y border-t sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-5">
            {DEPARTMENTS.map((dept, index) => (
              <Reveal
                key={dept.name}
                delay={index * 80}
                className="group hover:bg-card/40 flex flex-col gap-4 px-2 py-8 transition-colors sm:px-6"
              >
                <dept.icon className="text-primary size-8 transition-transform group-hover:scale-110" />
                <h3 className="text-foreground text-lg font-bold">
                  {dept.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {dept.tagline}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={400} className="mt-12 flex justify-center">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              nativeButton={false}
              render={<Link href="/recruitment">Dołącz do nas</Link>}
            />
          </Reveal>
        </div>
      </FullBleedSection>

      <NewsSection />

      <FullBleedSection className="border-border/50 flex min-h-dvh items-center border-t">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="bg-primary/15 absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
        </div>

        <div className="mx-auto w-full max-w-2xl px-4 text-center">
          <SatelliteIcon className="text-primary mx-auto size-10" />
          <h2 className="text-foreground mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Chcesz budować z nami?
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
            Koło Naukowe SCORPIO to przestrzeń, w której studenci zdobywają i
            rozwijają swoje umiejętności inżynierskie.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              nativeButton={false}
              render={<Link href="/recruitment">Dołącz do nas</Link>}
            />
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              nativeButton={false}
              render={
                <a href="mailto:marketing@scorpio.pwr.edu.pl">
                  <MailIcon className="size-4" />
                  Napisz do nas
                </a>
              }
            />
          </div>
        </div>
      </FullBleedSection>
    </main>
  );
}

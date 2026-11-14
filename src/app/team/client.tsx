"use client";

import type { LucideIcon } from "lucide-react";
import {
  FlashlightIcon,
  FlaskConicalIcon,
  MegaphoneIcon,
  MonitorIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

import { TeamMember } from "@/app/team/team-member";
import type { TeamGroup, TeamMemberData } from "@/lib/api/team";
import { cn } from "@/lib/utils";

const SECTIONS: {
  group: TeamGroup;
  title: string;
  description: string;
  icon: LucideIcon;
  gridClass: string;
}[] = [
  {
    group: "management",
    title: "Zarząd",
    description:
      "Osoby odpowiedzialne za kierunek rozwoju projektu i koordynację prac zespołu.",
    icon: UsersIcon,
    gridClass: "sm:grid-cols-2 lg:grid-cols-4",
  },
  {
    group: "advisor",
    title: "Opiekunowie",
    description:
      "Kadra akademicka wspierająca projekt merytorycznie i naukowo.",
    icon: UserIcon,
    gridClass: "md:grid-cols-3",
  },
  {
    group: "construction",
    title: "Konstrukcja",
    description:
      "Projektowanie i rozwój mechanicznej konstrukcji łazików marsjańskich.",
    icon: SettingsIcon,
    gridClass: "sm:grid-cols-2 lg:grid-cols-4",
  },
  {
    group: "electronics",
    title: "Elektronika",
    description: "Układy zasilania, PCB i systemy sterowania platformy.",
    icon: FlashlightIcon,
    gridClass: "sm:grid-cols-2 lg:grid-cols-4",
  },
  {
    group: "software",
    title: "Software",
    description:
      "Oprogramowanie autonomii, telemetrii, sterowania i przetwarzania danych.",
    icon: MonitorIcon,
    gridClass: "sm:grid-cols-2 lg:grid-cols-4",
  },
  {
    group: "science",
    title: "Science",
    description:
      "Eksperymenty naukowe, analiza próbek i scenariusze misji badawczych.",
    icon: FlaskConicalIcon,
    gridClass: "sm:grid-cols-2 lg:grid-cols-4",
  },
  {
    group: "marketing",
    title: "Marketing",
    description:
      "Komunikacja zespołu, partnerstwa i obecność projektu w mediach.",
    icon: MegaphoneIcon,
    gridClass: "sm:grid-cols-2 lg:grid-cols-4",
  },
];

const STANDALONE_GROUPS = new Set<TeamGroup>(["management", "advisor"]);

const STANDALONE_SECTIONS = SECTIONS.filter((section): boolean =>
  STANDALONE_GROUPS.has(section.group),
);
const DEPARTMENT_SECTIONS = SECTIONS.filter(
  (section) => !STANDALONE_GROUPS.has(section.group),
);

/* -------------------------------------------------------------------------- */
/* Motion helpers                                                              */
/* -------------------------------------------------------------------------- */

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ value }: { value: number }) {
  const reference = useRef<HTMLSpanElement>(null);
  const inView = useInView(reference, { once: true });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || reduce === true) {
      return;
    }
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplay(Math.round(latest));
      },
    });
    return () => {
      controls.stop();
    };
  }, [inView, reduce, value]);

  return <span ref={reference}>{reduce === true ? value : display}</span>;
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="bg-primary/10 border-primary/20 text-primary rounded-lg border p-2.5">
        <Icon aria-hidden className="size-6" />
      </div>
      <div>
        <h2 className="text-foreground text-2xl font-bold tracking-tighter sm:text-3xl">
          {title}
        </h2>
        <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function MembersGrid({
  members,
  gridClass,
}: {
  members: TeamMemberData[];
  gridClass: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-6", gridClass)}>
      {members.map((member, index) => (
        <TeamMember key={member.id} member={member} index={index} />
      ))}
    </div>
  );
}

function DepartmentTabs({ members }: { members: TeamMemberData[] }) {
  const tabReferences = useRef<(HTMLButtonElement | null)[]>([]);
  const [selected, setSelected] = useState<TeamGroup | null>(null);

  const departments = DEPARTMENT_SECTIONS.filter((section) =>
    members.some((member) => member.group === section.group),
  );

  if (departments.length === 0) {
    return null;
  }

  const activeIndex = Math.max(
    departments.findIndex((section) => section.group === selected),
    0,
  );
  const active = departments[activeIndex];
  const activeMembers = members.filter(
    (member) => member.group === active.group,
  );

  const select = (index: number) => {
    setSelected(departments[index].group);
    tabReferences.current[index]?.scrollIntoView({
      inline: "center",
      block: "nearest",
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const count = departments.length;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown": {
        next = (activeIndex + 1) % count;
        break;
      }
      case "ArrowLeft":
      case "ArrowUp": {
        next = (activeIndex - 1 + count) % count;
        break;
      }
      case "Home": {
        next = 0;
        break;
      }
      case "End": {
        next = count - 1;
        break;
      }
      default: {
        return;
      }
    }
    event.preventDefault();
    select(next);
    tabReferences.current[next]?.focus();
  };

  return (
    <section id="dzialy" className="scroll-mt-24">
      <FadeIn>
        {/* Sticky, floating tab bar */}
        <div className="border-border bg-background/80 sticky top-20 z-30 mb-12 w-fit max-w-full rounded-xl border p-1.5 shadow-sm backdrop-blur-md">
          <div
            role="tablist"
            aria-label="Działy"
            className="flex [scrollbar-width:none] gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          >
            {departments.map((section, index) => {
              const isSelected = index === activeIndex;
              const Icon = section.icon;
              const count = members.filter(
                (member) => member.group === section.group,
              ).length;
              return (
                <button
                  key={section.group}
                  ref={(node) => {
                    tabReferences.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${section.group}`}
                  aria-selected={isSelected}
                  aria-controls={`panel-${section.group}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => {
                    select(index);
                  }}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "focus-visible:ring-ring/50 relative flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-2",
                    isSelected
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  {isSelected ? (
                    <motion.span
                      layoutId="team-department-tab"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                      }}
                      className="bg-primary absolute inset-0 rounded-lg"
                    />
                  ) : null}
                  <Icon aria-hidden className="relative size-4" />
                  <span className="relative">{section.title}</span>
                  <span
                    className={cn(
                      "relative text-xs tabular-nums",
                      isSelected ? "opacity-70" : "opacity-50",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </FadeIn>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active.group}
          role="tabpanel"
          id={`panel-${active.group}`}
          aria-labelledby={`tab-${active.group}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <SectionHeading
            title={active.title}
            description={active.description}
            icon={active.icon}
          />
          <MembersGrid members={activeMembers} gridClass={active.gridClass} />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function Hero({ stats }: { stats: { label: string; value: number }[] }) {
  return (
    <section className="relative isolate pt-28 pb-12 md:pt-36 md:pb-16">
      {/* Soft glow that fades out fully inside the section, so it never shows a hard edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_45%,transparent)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_70%_at_30%_35%,var(--color-primary),transparent)] opacity-15" />
      </div>

      <div className="container mx-auto grid grid-cols-1 gap-12 px-4 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <h1 className="text-foreground text-5xl leading-[1.1] font-bold tracking-tighter text-balance sm:text-6xl lg:text-7xl">
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span
                className="block"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                Poznaj nasz
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span
                className="text-primary block"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
              >
                zespół
              </motion.span>
            </span>
          </h1>
          <motion.p
            className="text-muted-foreground mt-6 max-w-lg text-base leading-relaxed sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
          >
            Jesteśmy grupą ponad 50 ambitnych studentów, którzy rozwijają łaziki
            marsjańskie oraz kompetencje techniczne i organizacyjne.
          </motion.p>
        </div>

        {stats.length === 0 ? null : (
          <motion.dl
            className="grid auto-cols-fr grid-flow-col gap-6 lg:col-span-5 lg:col-start-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          >
            {stats.map((stat) => (
              // flex-col-reverse + justify-end keeps every number on the same top line,
              // even when labels wrap to a different number of lines
              <div
                key={stat.label}
                className="border-border flex min-w-0 flex-col-reverse justify-end border-l pl-4 sm:pl-6"
              >
                <dt className="text-muted-foreground mt-2 text-xs sm:text-sm">
                  {stat.label}
                </dt>
                <dd className="text-foreground text-4xl font-bold tracking-tighter tabular-nums sm:text-5xl">
                  <CountUp value={stat.value} />
                </dd>
              </div>
            ))}
          </motion.dl>
        )}
      </div>
    </section>
  );
}

export function TeamPageClient({ members }: { members: TeamMemberData[] }) {
  const departmentCount = DEPARTMENT_SECTIONS.filter((section) =>
    members.some((member) => member.group === section.group),
  ).length;
  const advisorCount = members.filter(
    (member) => member.group === "advisor",
  ).length;

  const stats = [
    { label: "Członków", value: members.length },
    { label: "Działów", value: departmentCount },
    { label: "Opiekunów", value: advisorCount },
  ].filter((stat) => stat.value > 0);

  return (
    <MotionConfig reducedMotion="user">
      <main>
        <Hero stats={stats} />

        <div className="container mx-auto space-y-24 px-4 py-16 md:py-24">
          {STANDALONE_SECTIONS.map((section) => {
            const sectionMembers = members.filter(
              (member) => member.group === section.group,
            );
            if (sectionMembers.length === 0) {
              return null;
            }
            return (
              <section key={section.group} id={section.group}>
                <FadeIn>
                  <SectionHeading
                    title={section.title}
                    description={section.description}
                    icon={section.icon}
                  />
                </FadeIn>
                <MembersGrid
                  members={sectionMembers}
                  gridClass={section.gridClass}
                />
              </section>
            );
          })}

          <DepartmentTabs members={members} />
        </div>
      </main>
    </MotionConfig>
  );
}

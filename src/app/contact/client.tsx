import {
  ArrowDownIcon,
  Building2Icon,
  MailIcon,
  MapPinIcon,
  UserIcon,
} from "lucide-react";

import { ContactForm } from "@/app/contact/contact-form";
import { ManagementTeam } from "@/app/contact/management-team";
import { MapSection } from "@/app/contact/map-section";
import { FadeIn, LineReveal, MotionProvider } from "@/app/contact/motion";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getContactDepartments } from "@/lib/api/contact-departments";

const CARD_HOVER =
  "transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export async function ContactPageClient() {
  const contactDepartments = await getContactDepartments();

  const shortcuts = [
    { href: "#formularz", label: "Napisz do nas" },
    ...(contactDepartments.length > 0
      ? [{ href: "#kontakt", label: "Dedykowany kontakt" }]
      : []),
    { href: "#warsztaty", label: "Odwiedź nas" },
  ];

  return (
    <MotionProvider>
      <main>
        {/* Hero */}
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
                <LineReveal>Skontaktuj się z</LineReveal>
                <LineReveal delay={0.12} className="text-primary block">
                  SCORPIO
                </LineReveal>
              </h1>
              <FadeIn onLoad delay={0.35} y={16}>
                <p className="text-muted-foreground mt-6 max-w-lg text-base leading-relaxed sm:text-lg">
                  Masz pytanie dotyczące naszych łazików, chcesz nawiązać
                  współpracę sponsorską lub dołączyć do zespołu? Napisz do nas!
                </p>
              </FadeIn>
            </div>

            <FadeIn
              onLoad
              delay={0.5}
              y={16}
              className="lg:col-span-4 lg:col-start-9"
            >
              <nav aria-label="Skróty na stronie">
                <ul className="border-border divide-border divide-y border-y">
                  {shortcuts.map((shortcut) => (
                    <li key={shortcut.href}>
                      <a
                        href={shortcut.href}
                        className="text-foreground hover:text-primary focus-visible:text-primary group flex min-h-12 items-center justify-between py-3 text-base font-medium transition-colors outline-none"
                      >
                        {shortcut.label}
                        <ArrowDownIcon
                          aria-hidden
                          className="text-muted-foreground group-hover:text-primary size-4 transition-all group-hover:translate-y-0.5 motion-reduce:transition-none"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </FadeIn>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="space-y-12 lg:col-span-5">
              <FadeIn>
                <Card className={`p-8 ${CARD_HOVER}`}>
                  <CardHeader className="mb-4">
                    <CardTitle>
                      <Building2Icon className="text-primary size-5" />
                      Siedziba Koła
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground font-semibold">
                      Koło Naukowe Off-Road &quot;SCORPIO&quot;
                    </p>
                    <div className="mt-2 flex items-start gap-2.5">
                      <MapPinIcon className="text-primary/80 mt-0.5 size-4 shrink-0" />
                      <p className="text-muted-foreground">
                        Politechnika Wrocławska — Wydział Mechaniczny
                        <br />
                        Wybrzeże Wyspiańskiego 27, budynek B-5
                        <br />
                        50-370 Wrocław
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {contactDepartments.length > 0 ? (
                <section id="kontakt" className="scroll-mt-24 space-y-4">
                  <FadeIn>
                    <h2 className="text-foreground text-2xl font-bold tracking-tighter">
                      Dedykowany kontakt
                    </h2>
                  </FadeIn>
                  {contactDepartments.map((dept, index) => (
                    <FadeIn
                      key={dept.name}
                      delay={Math.min(index, 3) * 0.07}
                      className="h-full"
                    >
                      <Card className={`h-full ${CARD_HOVER}`}>
                        <CardHeader>
                          <span className="text-primary text-xs font-semibold">
                            {dept.role}
                          </span>
                          <CardTitle>{dept.name}</CardTitle>
                          <CardDescription>{dept.description}</CardDescription>
                          <CardAction>
                            <UserIcon className="text-muted-foreground/60 size-4" />
                          </CardAction>
                        </CardHeader>
                        <CardContent>
                          <a
                            href={`mailto:${dept.email}`}
                            className="text-foreground hover:text-primary focus-visible:text-primary mt-3 inline-flex min-h-8 w-fit items-center gap-1.5 text-sm font-medium transition-colors outline-none"
                          >
                            <MailIcon className="text-primary size-4" />
                            {dept.email}
                          </a>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  ))}
                </section>
              ) : null}
            </div>

            {/* Form follows the reader while the left column scrolls */}
            <div
              id="formularz"
              className="scroll-mt-24 lg:sticky lg:top-24 lg:col-span-7"
            >
              <FadeIn delay={0.1}>
                <ContactForm />
              </FadeIn>
            </div>
          </div>

          <ManagementTeam />
          <MapSection />
        </div>
      </main>
    </MotionProvider>
  );
}

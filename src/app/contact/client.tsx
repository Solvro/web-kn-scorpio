"use client";

import {
  Building2Icon,
  MailIcon,
  MapPinIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import type { Metadata } from "next";

import { ContactForm } from "@/app/contact/contact-form";
import { ManagementTeam } from "@/app/contact/management-team";
import { MapSection } from "@/app/contact/map-section";
import { CONTACT_DEPARTMENTS } from "@/app/contact/temporary-data";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Kontakt | KN SCORPIO",
  description:
    "Skontaktuj się z Kołem Naukowym Off-Road SCORPIO na Politechnice Wrocławskiej.",
};

export function ContactPageClient() {
  return (
    <main className="container mx-auto px-4 py-12 md:py-20">
      <section className="relative left-1/2 -mt-12 mb-16 w-screen -translate-x-1/2 overflow-hidden pt-28 pb-16 md:-mt-20">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-primary/10 absolute -top-32 left-1/2 h-88 w-lg -translate-x-1/2 rounded-full blur-[110px]" />
          <div className="via-primary/30 absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent" />
          <div className="from-background via-background/60 absolute inset-x-0 bottom-0 h-36 bg-linear-to-t to-transparent" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <Badge
              variant="outline"
              className="border-primary/30 bg-background/80 text-primary shadow-sm backdrop-blur-md"
            >
              <SparklesIcon className="size-3.5" />
              Dołącz do misji marsjańskiej
            </Badge>

            <h1 className="text-foreground mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Skontaktuj się z <span className="text-primary">SCORPIO</span>
            </h1>

            <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
              Masz pytanie dotyczące naszych łazików, chcesz nawiązać współpracę
              sponsorską lub dołączyć do zespołu? Napisz do nas!
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-5">
          <Card className="p-8">
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
              <div className="flex items-start gap-2.5">
                <MapPinIcon className="text-primary/80 mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground">
                  <span>
                    Politechnika Wrocławska — Wydział Mechaniczny
                    <br />
                    Wybrzeże Wyspiańskiego 27, budynek B-5
                    <br />
                    50-370 Wrocław
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase">
              Dedykowany kontakt
            </h3>
            {CONTACT_DEPARTMENTS.map((dept) => (
              <Card key={dept.name}>
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
                    className="text-foreground hover:text-primary mt-3 inline-flex w-fit items-center gap-1.5 text-xs font-medium transition-colors"
                  >
                    <MailIcon className="text-primary size-3.5" />
                    {dept.email}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>

      <ManagementTeam />
      <MapSection />
    </main>
  );
}

"use client";

import { ClockIcon, MailIcon, SendIcon, SparklesIcon } from "lucide-react";
import Image from "next/image";

import {
  APPLICATION_FORM_URL,
  RECRUITMENT_DEADLINE,
  RECRUITMENT_DEPARTMENTS,
  RECRUITMENT_EMAIL,
} from "@/app/recruitment/temporary-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RecruitmentPageClient() {
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
              <ClockIcon className="size-3.5" />
              Rekrutacja trwa do {RECRUITMENT_DEADLINE}!
            </Badge>

            <h1 className="text-foreground mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Dołącz do <span className="text-primary">SCORPIO</span>
            </h1>

            <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
              Chcesz zostać częścią jednego z najbardziej interdyscyplinarnych
              projektów na Politechnice Wrocławskiej? Studia nie muszą być tylko
              nudną teorią – dołącz do nas i zastosuj swoją wiedzę w praktyce!
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                nativeButton={false}
                render={
                  <a
                    href={APPLICATION_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SendIcon className="size-4" />
                    Dołącz do nas!
                  </a>
                }
              />
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                nativeButton={false}
                render={
                  <a href={`mailto:${RECRUITMENT_EMAIL}`}>
                    <MailIcon className="size-4" />
                    Napisz do nas!
                  </a>
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl text-center">
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="bg-primary/10 border-primary/20 text-primary rounded-lg border p-2">
            <SparklesIcon className="size-6" />
          </div>
          <h2 className="text-foreground text-2xl font-bold tracking-tight">
            Szukamy pasjonatów do pięciu działów
          </h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
          Chcesz rozwijać swoje umiejętności w świetnym zespole? U nas masz taką
          szansę! Sprawdź zadania rekrutacyjne poniżej i dołącz do nas już dziś.
        </p>
      </section>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {RECRUITMENT_DEPARTMENTS.map((dept) => (
          <Card key={dept.slug} className="overflow-hidden p-0">
            <div className="relative h-40 w-full">
              <Image
                src={dept.image.src}
                alt={dept.image.alt}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <div className="bg-primary/90 text-primary-foreground rounded-md p-1.5">
                  <dept.icon className="size-4" />
                </div>
                <span className="text-sm font-bold text-white drop-shadow">
                  {dept.name}
                </span>
              </div>
            </div>

            <CardHeader className="px-6 pt-5">
              <CardTitle className="sr-only">{dept.name}</CardTitle>
            </CardHeader>

            <CardContent className="px-6">
              {dept.description.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-muted-foreground text-sm leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {dept.tools.map((tool) => (
                  <Badge key={tool} variant="outline-sm">
                    {tool}
                  </Badge>
                ))}
              </div>
            </CardContent>

            <CardFooter className="border-t px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                nativeButton={false}
                render={
                  <a
                    href={dept.taskUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Zadanie rekrutacyjne
                  </a>
                }
              />
            </CardFooter>
          </Card>
        ))}

        <Card className="flex flex-col items-center justify-center gap-4 border-dashed p-8 text-center">
          <div className="bg-primary/10 border-primary/20 text-primary rounded-full border p-3">
            <SendIcon className="size-6" />
          </div>
          <CardTitle>Wypełnij formularz i zostań członkiem zespołu!</CardTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Wybrałeś już dział? Wyślij swoją aplikację, a my się z Tobą
            skontaktujemy.
          </p>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            nativeButton={false}
            render={
              <a
                href={APPLICATION_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Dołącz do nas!
              </a>
            }
          />
        </Card>
      </div>
    </main>
  );
}

import { MapPinIcon, WrenchIcon } from "lucide-react";

import { FadeIn } from "@/app/contact/motion";
import { SectionHeading } from "@/app/contact/section-heading";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWorkshops } from "@/lib/api/workshops";

export async function MapSection() {
  const workshops = await getWorkshops();

  return (
    <section id="warsztaty" className="mt-24 scroll-mt-24">
      <SectionHeading
        icon={MapPinIcon}
        title="Odwiedź nas"
        description="Nasze warsztaty i zaplecze techniczne na osiedlu akademickim Wittigowo."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {workshops.map((workshop, index) => (
          <FadeIn
            key={workshop.id}
            delay={(index % 2) * 0.07}
            className="h-full"
          >
            <Card className="hover:border-primary/40 hover:shadow-primary/10 h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <CardHeader>
                <span className="text-primary flex items-center gap-2 text-sm font-semibold">
                  <WrenchIcon className="size-4" />
                  Warsztat #{index + 1}
                </span>
                <CardTitle className="mt-1">{workshop.location}</CardTitle>
              </CardHeader>
              <CardDescription>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {workshop.street}
                  <br />
                  {workshop.city}
                </p>
              </CardDescription>
            </Card>
          </FadeIn>
        ))}
      </div>

      <FadeIn className="mt-6">
        <Card className="h-80 p-2">
          <iframe
            title="Warsztaty KN SCORPIO - Wittigowo"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2505.210515629391!2d17.0853!3d51.1009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470fecc3f44358a9%3A0x6bd6c4592039bf8d!2sZygmunta%20Wr%C3%B3blewskiego%2025%2C%2051-627%20Wroc%C5%82aw!5e0!2m3!1spl!2spl!4v1700000000000!5m2!1spl!2spl"
            width="100%"
            height="100%"
            className="rounded-md"
            style={{ border: 0, filter: "grayscale(0.4) contrast(1.2)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Card>
      </FadeIn>
    </section>
  );
}

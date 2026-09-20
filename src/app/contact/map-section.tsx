import { MapPinIcon, WrenchIcon } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function MapSection() {
  return (
    <section className="mt-20 space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 border-primary/20 text-primary rounded-lg border p-2">
          <MapPinIcon className="size-6" />
        </div>
        <div>
          <h2 className="text-foreground text-2xl font-bold tracking-tight">
            Odwiedź nas
          </h2>
          <p className="text-muted-foreground text-sm">
            Nasze warsztaty i zaplecze techniczne na osiedlu akademickim
            Wittigowo.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <CardHeader>
            <span className="text-primary flex items-center gap-2 text-sm font-semibold uppercase">
              <WrenchIcon className="size-4" />
              Warsztat #1
            </span>
            <CardTitle className="mt-1">Akademik T-22, Wittigowo</CardTitle>
          </CardHeader>
          <CardDescription>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              ul. Zygmunta Wróblewskiego 25
              <br />
              51-627 Wrocław
            </p>
          </CardDescription>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <span className="text-primary flex items-center gap-2 text-sm font-semibold uppercase">
              <WrenchIcon className="size-4" />
              Warsztat #2
            </span>
            <CardTitle className="mt-1">Akademik T-17, Wittigowo</CardTitle>
          </CardHeader>
          <CardDescription>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              ul. Zygmunta Wróblewskiego 27
              <br />
              51-627 Wrocław
            </p>
          </CardDescription>
        </Card>
      </div>

      <Card className="h-80 p-2">
        <iframe
          title="Warsztaty KN SCORPIO - Wittigowo"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2505.210515629391!2d17.0853!3d51.1009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470fecc3f44358a9%3A0x6bd6c4592039bf8d!2sZygmunta%20Wr%C3%B3blewskiego%2025%2C%2051-627%20Wroc%C5%82aw!5e0!2m3!1spl!2spl!4v1700000000000!5m2!1spl!2spl"
          width="100%"
          height="100%"
          style={{ border: 0, filter: "grayscale(0.4) contrast(1.2)" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Card>
    </section>
  );
}

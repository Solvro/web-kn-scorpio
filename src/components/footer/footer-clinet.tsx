"use client";

import {
  FacebookLogoIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";
import {
  ArrowRightIcon,
  MailIcon,
  MapPinIcon,
  UserPlusIcon,
} from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function FooterClient() {
  return (
    <footer className="border-primary bg-background text-foreground relative border-t-2">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-md space-y-4">
            <Logo />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Koło Naukowe SCORPIO to grupa pasjonatów projektujących i
              budujących zaawansowane łaziki marsjańskie. Tworzymy przestrzeń, w
              której studenci rozwijają swoje umiejętności inżynieryjne i
              technologiczne.
            </p>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16 lg:gap-24">
            <div className="max-w-xs space-y-3">
              <div className="text-primary flex items-center gap-2">
                <UserPlusIcon className="h-5 w-5" />
                <h3 className="text-lg font-bold tracking-wide">
                  Chcesz z nami budować łaziki?
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Poszukujemy pasjonatów do działów:{" "}
                <strong className="text-foreground font-semibold">
                  Mechanicznego, Elektroniki, Software
                </strong>{" "}
                oraz{" "}
                <strong className="text-foreground font-semibold">
                  Marketing & PR
                </strong>
                .
              </p>
              <div className="pt-1">
                <Button
                  size="sm"
                  className="group bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  nativeButton={false}
                  render={
                    <Link href="/recruitment">
                      Dołącz do zespołu
                      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-primary text-lg font-bold tracking-wide">
                Kontakt
              </h3>
              <div className="text-muted-foreground space-y-3 text-sm">
                <a
                  href="mailto:marketing@scorpio.pwr.edu.pl"
                  className="group hover:text-primary flex items-center gap-2.5 transition-colors"
                >
                  <MailIcon className="text-primary h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="break-all">
                    marketing@scorpio.pwr.edu.pl
                  </span>
                </a>
                <div className="flex items-start gap-2.5">
                  <MapPinIcon className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Politechnika Wrocławska
                    <br />
                    Wrocław, Polska
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                {[
                  {
                    icon: FacebookLogoIcon,
                    href: "https://www.facebook.com/ProjektScorpio/about/",
                    label: "Facebook",
                  },
                  {
                    icon: InstagramLogoIcon,
                    href: "https://www.instagram.com/projektscorpio/",
                    label: "Instagram",
                  },
                  {
                    icon: LinkedinLogoIcon,
                    href: "https://www.linkedin.com/company/projekt-scorpio/",
                    label: "LinkedIn",
                  },
                  {
                    icon: YoutubeLogoIcon,
                    href: "https://www.youtube.com/@ScorpioOFFROAD",
                    label: "YouTube",
                  },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-border bg-card text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground rounded-full border p-1.5 transition-all duration-300"
                  >
                    <Icon className="size-7" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-border bg-card/50 border-t">
        <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-4 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} Koło Naukowe SCORPIO. Wszelkie prawa
            zastrzeżone.
          </p>
          <p>
            Made with ❤️ by{" "}
            <Link
              href="https://solvro.pwr.edu.pl/"
              className="text-primary font-bold hover:underline"
            >
              SOLVRO
            </Link>{" "}
            © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}

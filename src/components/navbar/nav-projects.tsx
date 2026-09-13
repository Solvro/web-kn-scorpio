import { FolderKanbanIcon, RocketIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import React from "react";

import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const ListItem = React.forwardRef<
  React.ComponentRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon?: React.ReactNode }
>(({ className, title, children, icon, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink
        render={
          <Link
            ref={ref}
            href={href as Route}
            className={cn(
              "hover:bg-muted hover:text-primary focus:bg-card focus:text-primary hover:border-border flex flex-col items-start rounded-md border border-transparent p-3 leading-none no-underline transition-colors outline-none select-none",
              className,
            )}
            {...props}
          >
            <div className="text-foreground flex items-center gap-2 leading-none font-semibold">
              {icon}
              {title}
            </div>
            <p className="text-muted-foreground line-clamp-2 pt-1 text-xs leading-snug">
              {children}
            </p>
          </Link>
        }
      />
    </li>
  );
});
ListItem.displayName = "ListItem";

export function NavProjects() {
  return (
    <ul className="grid w-100 gap-3 p-4 pb-2 md:w-125 md:grid-cols-2 lg:w-150">
      <li className="row-span-3">
        <NavigationMenuLink
          render={
            <Link
              className="from-primary/20 to-card border-border hover:border-primary/50 flex h-full w-full flex-col justify-end rounded-md border bg-linear-to-b p-6 no-underline transition-all outline-none select-none focus:shadow-md"
              href="/projects"
            >
              <FolderKanbanIcon className="text-primary mb-2 size-8" />
              <div className="text-foreground mb-2 text-lg font-bold">
                Wszystkie Projekty
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Zobacz pełną listę naszych konstrukcji, łazików oraz
                rozwiązanych wyzwań inżynieryjnych.
              </p>
            </Link>
          }
        />
      </li>

      <ListItem
        href="/projects/scorpio-infinity"
        title="Scorpio Infinity"
        icon={<RocketIcon className="text-primary size-4" />}
      >
        Scorpio Infinity to łazik powstały z połączenia sprawdzonych rozwiązań i
        innowacyjnych pomysłów.
      </ListItem>

      <ListItem
        href="/projects/scorpio-7"
        title="Scorpio 7"
        icon={<RocketIcon className="text-primary size-4" />}
      >
        Projekt siódmej generacji Łazika Marsjańskiego KN OFF-ROAD. Ta iteracja
        projektu stawiała na rozszerzenie zastosowania robota na działalność
        badawczą.
      </ListItem>

      <ListItem
        href="/projects/scorpio-x"
        title="Scorpio X"
        icon={<RocketIcon className="text-primary size-4" />}
      >
        Łazik posiada modułową budowę, a konstrukcja wykonana jest w większości
        z aluminium lotniczego i poliamidu – lekkich materiałów.
      </ListItem>

      <li className="border-border/80 mt- col-span-1 border-t pt-3 md:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
          <span className="text-muted-foreground font-medium">Pozostałe:</span>
          <div className="flex items-center gap-3">
            <NavigationMenuLink
              render={
                <Link
                  href={"/"}
                  // href={"/projects/archive"}
                  className="text-muted-foreground hover:text-primary transition-colors hover:underline"
                >
                  Archiwum łazików
                </Link>
              }
            />
            <span className="text-border">•</span>
            <NavigationMenuLink
              render={
                <Link
                  href={"/"}
                  // href={"/projects/other"}
                  className="text-muted-foreground hover:text-primary transition-colors hover:underline"
                >
                  Inne projekty koła
                </Link>
              }
            />
          </div>
        </div>
      </li>
    </ul>
  );
}

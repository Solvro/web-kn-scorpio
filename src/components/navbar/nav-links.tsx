"use client";

import { ChevronDownIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { NavProjects } from "@/components/navbar/nav-projects";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  /** Hide the /recruitment link when that page would render nothing. */
  recruitmentAvailable?: boolean;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

const MOBILE_LINKS_BEFORE_PROJECTS = [
  { href: "/", label: "Strona główna" },
  { href: "/news", label: "Aktualności" },
  { href: "/team", label: "Zespół" },
] as const;

const MOBILE_LINKS_AFTER_PROJECTS = [
  { href: "/partners", label: "Partnerzy" },
  { href: "/successes", label: "Sukcesy" },
  { href: "/contact", label: "Kontakt" },
] as const;

const MOBILE_PROJECT_LINKS = [
  { href: "/projects", label: "Wszystkie projekty" },
  { href: "/projects/scorpio-infinity", label: "Scorpio Infinity" },
  { href: "/projects/scorpio-7", label: "Scorpio 7" },
  { href: "/projects/scorpio-x", label: "Scorpio X" },
] as const;

export function NavLinks({
  variant = "desktop",
  onNavigate,
  recruitmentAvailable = true,
}: NavLinksProps) {
  const pathname = usePathname();
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const activeLinkStyles =
    "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:w-3/4 after:bg-primary after:rounded-full";

  // Mobile
  if (variant === "mobile") {
    return (
      <MobileNav
        pathname={pathname}
        isActive={isActive}
        recruitmentAvailable={recruitmentAvailable}
        onNavigate={onNavigate}
      />
    );
  }

  // Wariant Desktop
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              isActive("/") && activeLinkStyles,
            )}
            render={<Link href="/">Strona Główna</Link>}
            active={isActive("/")}
          />
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              isActive("/news") && activeLinkStyles,
            )}
            active={isActive("/news")}
            render={
              <Link href="/news" passHref>
                Aktualności
              </Link>
            }
          />
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              isActive("/team") && activeLinkStyles,
            )}
            active={isActive("/team")}
            render={
              <Link href="/team" passHref>
                Zespół
              </Link>
            }
          />
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              isActive("/projects") && [
                "text-primary font-semibold",
                activeLinkStyles,
              ],
            )}
          >
            Projekty
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavProjects />
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              isActive("/partners") && activeLinkStyles,
            )}
            active={isActive("/partners")}
            render={
              <Link href="/partners" passHref>
                Partnerzy
              </Link>
            }
          />
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              isActive("/successes") && activeLinkStyles,
            )}
            active={isActive("/successes")}
            render={
              <Link href="/successes" passHref>
                Sukcesy
              </Link>
            }
          />
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              isActive("/contact") && activeLinkStyles,
            )}
            active={isActive("/contact")}
            render={
              <Link href="/contact" passHref>
                Kontakt
              </Link>
            }
          />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile                                                                      */
/* -------------------------------------------------------------------------- */

interface MobileNavProps {
  pathname: string;
  isActive: (path: string) => boolean;
  recruitmentAvailable: boolean;
  onNavigate?: () => void;
}

const mobileRowBase =
  "focus-visible:ring-ring/50 flex min-h-12 w-full items-center justify-between rounded-lg px-3 text-base transition-colors outline-none focus-visible:ring-2";

function mobileRowState(active: boolean) {
  return active
    ? "bg-primary/10 text-primary font-semibold"
    : "text-foreground/80 hover:bg-muted hover:text-foreground";
}

function MobileNav({
  pathname,
  isActive,
  recruitmentAvailable,
  onNavigate,
}: MobileNavProps) {
  const projectsActive = isActive("/projects");
  const [projectsOpen, setProjectsOpen] = React.useState(projectsActive);
  const submenuId = React.useId();

  const renderLink = (link: { href: string; label: string }) => {
    const active = isActive(link.href);
    return (
      <li key={link.href}>
        <Link
          href={link.href as Route}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(mobileRowBase, mobileRowState(active))}
        >
          {link.label}
        </Link>
      </li>
    );
  };

  return (
    <nav aria-label="Menu główne" className="flex flex-col gap-6 pt-2 pb-4">
      <ul className="flex flex-col gap-1">
        {MOBILE_LINKS_BEFORE_PROJECTS.map((element) => renderLink(element))}

        {/* Projects accordion */}
        <li>
          <button
            type="button"
            aria-expanded={projectsOpen}
            aria-controls={submenuId}
            onClick={() => {
              setProjectsOpen((open) => !open);
            }}
            className={cn(
              mobileRowBase,
              mobileRowState(projectsActive && !projectsOpen),
              projectsActive && projectsOpen && "text-primary font-semibold",
            )}
          >
            Projekty
            <ChevronDownIcon
              aria-hidden
              className={cn(
                "size-5 transition-transform duration-200 motion-reduce:transition-none",
                projectsOpen && "rotate-180",
              )}
            />
          </button>

          <div
            id={submenuId}
            inert={!projectsOpen}
            className={cn(
              "grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none",
              projectsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <ul className="border-border ml-5 flex min-h-0 flex-col gap-0.5 overflow-hidden border-l pl-2">
              {MOBILE_PROJECT_LINKS.map((link) => {
                // "Wszystkie projekty" must match exactly, otherwise it is always active
                const active =
                  link.href === "/projects"
                    ? pathname === "/projects"
                    : isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href as Route}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "focus-visible:ring-ring/50 flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors outline-none focus-visible:ring-2",
                        active
                          ? "text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </li>

        {MOBILE_LINKS_AFTER_PROJECTS.map((element) => renderLink(element))}
      </ul>

      {recruitmentAvailable ? (
        <Link
          href="/recruitment"
          onClick={onNavigate}
          aria-current={isActive("/recruitment") ? "page" : undefined}
          className="bg-primary text-primary-foreground focus-visible:ring-ring/50 mx-4 flex min-h-12 items-center justify-center rounded-lg px-4 text-base font-semibold transition-opacity outline-none hover:opacity-90 focus-visible:ring-2"
        >
          Dołącz do koła
        </Link>
      ) : null}
    </nav>
  );
}

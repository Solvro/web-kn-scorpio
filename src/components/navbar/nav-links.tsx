"use client";

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
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

export function NavLinks({ variant = "desktop", onNavigate }: NavLinksProps) {
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
      <nav className="flex flex-col gap-4 pt-4">
        {[
          { href: "/", label: "Strona Główna" },
          { href: "/news", label: "Aktualności" },
          { href: "/team", label: "Zespół" },
          { href: "/projects", label: "Projekty (Wszystkie)" },
          { href: "/partners", label: "Partnerzy" },
          { href: "/successes", label: "Sukcesy" },
          { href: "/recruitment", label: "Rekrutacja" },
          { href: "/contact", label: "Kontakt" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href as Route}
            onClick={onNavigate}
            className={cn(
              "hover:text-primary text-base transition-colors",
              isActive(link.href)
                ? "border-primary text-primary border-l-2 pl-2 font-semibold"
                : "text-muted-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
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

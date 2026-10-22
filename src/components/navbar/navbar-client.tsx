"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { NavLinks } from "@/components/navbar/nav-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function NavbarClient() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo className="text-2xl" />

        <div className="hidden lg:flex">
          <NavLinks variant="desktop" />
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            nativeButton={false}
            render={<Link href="/recruitment">Dołącz do nas</Link>}
          />
        </div>

        <div className="lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="border-border">
                  <MenuIcon className="h-5 w-5" />
                  <span className="sr-only">Otwórz menu</span>
                </Button>
              }
            ></SheetTrigger>
            <SheetContent side="right" className="bg-background border-border">
              <SheetHeader className="border-border border-b pb-4 text-left">
                <SheetTitle className="text-foreground">
                  <span className="font-black tracking-widest">
                    SC
                    <span className="bg-primary mx-0.5 inline-block h-2 w-2 rounded-full" />
                    RPIO
                  </span>
                </SheetTitle>
              </SheetHeader>
              <NavLinks
                variant="mobile"
                onNavigate={() => {
                  setIsOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

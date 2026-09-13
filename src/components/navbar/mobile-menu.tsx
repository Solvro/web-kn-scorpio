"use client";

import { NavLinks } from "./nav-links";

interface MobileMenuProps {
  onNavigate?: () => void;
}

export function MobileMenu({ onNavigate }: MobileMenuProps) {
  return (
    <nav className="flex flex-col gap-2 border-t pt-2 md:hidden">
      <NavLinks variant="mobile" onNavigate={onNavigate} />
    </nav>
  );
}

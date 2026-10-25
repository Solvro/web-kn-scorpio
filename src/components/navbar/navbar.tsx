import { NavbarClient } from "./navbar-client";

export function Navbar({
  recruitmentAvailable,
}: {
  recruitmentAvailable: boolean;
}) {
  return <NavbarClient recruitmentAvailable={recruitmentAvailable} />;
}

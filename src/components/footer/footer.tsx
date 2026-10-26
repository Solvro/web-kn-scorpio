import { FooterServer } from "@/components/footer/footer-server";

export function Footer({
  recruitmentAvailable,
}: {
  recruitmentAvailable: boolean;
}) {
  return <FooterServer recruitmentAvailable={recruitmentAvailable} />;
}

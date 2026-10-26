/**
 * One-off import of team members from the old scorpio.pwr.edu.pl site.
 *
 * Run:  DIRECTUS_URL=https://cms.example.com DIRECTUS_TOKEN=xxx node scripts/import-team.mjs
 *
 * - DIRECTUS_TOKEN must be an admin (or at least create-items + files) static token.
 * - The Directus SERVER downloads the photos, so it must be able to reach www.scorpio.pwr.edu.pl.
 * - Run it only once, otherwise you get duplicates.
 */
import {
  createDirectus,
  createItems,
  importFile,
  rest,
  staticToken,
} from "@directus/sdk";

const BASE = "https://www.scorpio.pwr.edu.pl/wp-content/uploads/";

const p = (name, position, group, photo, hover) => ({
  name,
  position,
  group,
  photo,
  hover,
});

// "nieobecny" = the old site's grey placeholder, so we import those without photos.
const NONE = null;

const PEOPLE = [
  // ---------- Zarząd (as shown on the old page; verify, it may be outdated) ----------
  p(
    "Aleksandra Korytkowska",
    "Prezes",
    "management",
    "2026/03/Ola_Korytkowska-1-scaled.jpg",
    "2026/03/Ola_Korytkowska-2-scaled.jpg",
  ),
  p(
    "Krysia Fluder",
    "Wiceprezeska",
    "management",
    "2026/03/Krysia_Fluder-1-scaled.jpg",
    "2023/07/Krysia-1-scaled.jpg",
  ),
  p(
    "Igor Zaworski",
    "Program Director",
    "management",
    "2024/05/Igor-Zaworski_1-scaled-e1716775896143.jpg",
    "2024/05/Igor-Zaworski_2-scaled-e1716775954569.jpg",
  ),
  p(
    "Weronika Malec",
    "Liderka Działu Marketing",
    "management",
    "2026/10/Werka_Malec-1-scaled.jpg",
    "2026/10/Werka_Malec-3-scaled.jpg",
  ),
  p(
    "Jakub Kieruł",
    "Lider Działu Konstrukcja",
    "management",
    "2026/03/Jakub_Kierul-1-scaled.jpg",
    "2026/03/Jakub_Kierul-2-scaled.jpg",
  ),
  p(
    "Jan Serafinowicz",
    "Lider Działu Elektronika",
    "management",
    "2026/03/Jan_Serafinowicz-1-scaled.jpg",
    "2026/03/Jan_Serafinowicz-2-scaled.jpg",
  ),
  p(
    "Hubert Tubis",
    "Lider Działu Software",
    "management",
    "2026/03/Hubert_Tubis-1-scaled.jpg",
    "2026/03/Hubert_Tubis-2-scaled.jpg",
  ),
  p(
    "Dominika Zygarlicka",
    "Liderka Działu Science",
    "management",
    "2026/03/Dominika_Zygarlicka-1-scaled.jpg",
    "2026/03/Dominika_Zygarlicka-2-scaled.jpg",
  ),

  // ---------- Opiekunowie (no photos on the old page; upload them manually) ----------
  p(
    "Dr hab. inż. Maciej Zwierzchowski, prof. PWR",
    "Opiekun Koła Naukowego Scorpio",
    "advisor",
    NONE,
    NONE,
  ),
  p(
    "Dr inż. Adrian Zakrzewski",
    "Opiekun Koła Naukowego Scorpio",
    "advisor",
    NONE,
    NONE,
  ),
  p(
    "Dr inż. Jakub Chołodowski",
    "Opiekun Koła Naukowego Scorpio",
    "advisor",
    NONE,
    NONE,
  ),

  // ---------- Konstrukcja ----------
  p(
    "Jakub Kieruł",
    "Lider działu",
    "construction",
    "2026/03/Jakub_Kierul-1-scaled.jpg",
    "2026/03/Jakub_Kierul-2-scaled.jpg",
  ),
  p(
    "Bartłomiej Łuczeńczyk",
    "Wicelider działu",
    "construction",
    "2026/03/Bartlomiej_Luczenczyk-1-scaled.jpg",
    "2026/03/Bartlomiej_Luczenczyk-2-scaled.jpg",
  ),
  p("Igor Foryński", NONE, "construction", NONE, NONE),
  p(
    "Jeremi Suchecki",
    NONE,
    "construction",
    "2024/01/Suchecki_I_0-scaled.jpg",
    "2024/01/Suchecki_I_1-scaled.jpg",
  ),
  p(
    "Konrad Strzelec",
    NONE,
    "construction",
    "2026/03/Konrad_Strzelec-1-scaled-e1773934735743.jpg",
    "2026/03/Konrad_Strzelec-2-scaled.jpg",
  ),
  p(
    "Maksymilian Wiśniewski",
    NONE,
    "construction",
    "2024/01/Wisnewski_M_0-scaled.jpg",
    "2024/01/Wisniewski_M_1-scaled.jpg",
  ),
  p(
    "Michał Dusza",
    NONE,
    "construction",
    "2023/07/Michal_Dusza-1-scaled-e1784050674255.jpg",
    "2023/07/Michal_Dusza-2-scaled-e1784050715694.jpg",
  ),
  p(
    "Michał Łysek",
    NONE,
    "construction",
    "2026/03/Michal_Lysek-1-scaled.jpg",
    "2026/03/Michal_Lysek-2-scaled.jpg",
  ),
  p(
    "Paweł Plaminiak",
    NONE,
    "construction",
    "2023/07/Pawel_Plaminiak_0-scaled-e1758547382987.jpg",
    "2023/07/Pawel_Plaminiak_1-scaled-e1758547497433.jpg",
  ),
  p(
    "Robert Boral",
    NONE,
    "construction",
    "2023/07/Boral_R_1-scaled.jpg",
    "2023/07/Boral_R_0-scaled.jpg",
  ),
  p(
    "Sebastian Miszkowicz-Adamowicz",
    NONE,
    "construction",
    "2026/03/Sebastian_M-Adamski-1-scaled.jpg",
    "2026/03/Sebastian_M-Adamski-2-scaled.jpg",
  ),
  p(
    "Szymon Lubański",
    NONE,
    "construction",
    "2026/03/Szymon_Lubanski-1-scaled.jpg",
    "2026/03/Szymon_Lubanski-2-scaled.jpg",
  ),
  p(
    "Jan Odrobiński",
    "Członek honorowy",
    "construction",
    "2023/08/Odrobinski_J_1-scaled.jpg",
    "2023/08/Odrobinski_J_0-scaled.jpg",
  ),
  p(
    "Krzysztof Piechota",
    "Członek honorowy",
    "construction",
    "2024/05/Krzysztof-Piechota_1-scaled-e1716777244385.jpg",
    "2024/05/Krzysztof-Piechota_2-scaled-e1716777283762.jpg",
  ),

  // ---------- Elektronika ----------
  p(
    "Jan Serafinowicz",
    "Lider działu",
    "electronics",
    "2026/03/Jan_Serafinowicz-1-scaled.jpg",
    "2026/03/Jan_Serafinowicz-2-scaled.jpg",
  ),
  p(
    "Jakub Górski",
    "Wicelider działu",
    "electronics",
    "2024/01/Gorski_J_0-scaled.jpg",
    "2024/01/Goski_J_1-scaled.jpg",
  ),
  p(
    "Adam Matkowski",
    NONE,
    "electronics",
    "2026/10/Adam_Matkowski-1-scaled.jpg",
    "2026/10/Adam_Matkowski-2-scaled.jpg",
  ),
  p(
    "Filip Kubecki",
    NONE,
    "electronics",
    "2023/07/Filip_Kubecki-1-scaled-e1784050332224.jpg",
    "2023/07/Filip_Kubecki-2-scaled.jpg",
  ),
  p(
    "Klaudia Lenarczyk",
    NONE,
    "electronics",
    "2026/03/Klaudia_Lenarczyk-1-scaled.jpg",
    "2026/03/Klaudia_Lenarczyk-2-scaled.jpg",
  ),
  p(
    "Mateusz Majewski",
    NONE,
    "electronics",
    "2023/07/Mateusz_Majewski_electro-scaled-e1732267223786.jpg",
    "2023/07/Mateusz_Majewski_electro1-scaled-e1732267251779.jpg",
  ),
  p(
    "Mikołaj Zdanowicz",
    NONE,
    "electronics",
    "2023/07/Mikolaj_Zdanowicz_electro-scaled-e1732267279845.jpg",
    "2023/07/Mikolaj_Zdanowicz_electro1-scaled-e1732267312727.jpg",
  ),
  p("Patryk Druszcz", NONE, "electronics", NONE, NONE),
  p(
    "Szymon Widuch",
    NONE,
    "electronics",
    "2026/10/Szymon_Widuch-3-scaled.jpg",
    "2026/10/Szymon_Widuch-2-scaled.jpg",
  ),
  p(
    "Jacek Glapiński",
    "Członek honorowy",
    "electronics",
    "2024/01/Glapinski_J_0-scaled.jpg",
    NONE,
  ),
  p(
    "Tomasz Płóciennik",
    "Członek honorowy",
    "electronics",
    "2023/08/Plociennik_T_1-scaled-e1724260958831-768x768.jpg",
    "2023/08/Plocennik_T_0-768x768.jpg",
  ),

  // ---------- Software ----------
  p(
    "Hubert Tubis",
    "Lider działu",
    "software",
    "2026/03/Hubert_Tubis-1-scaled.jpg",
    "2026/03/Hubert_Tubis-2-scaled.jpg",
  ),
  p(
    "Igor Zaworski",
    "Wicelider działu",
    "software",
    "2024/05/Igor-Zaworski_1-scaled-e1716775896143.jpg",
    "2024/05/Igor-Zaworski_2-scaled-e1716775954569.jpg",
  ),
  p(
    "Bartłomiej Niedbała",
    NONE,
    "software",
    "2023/07/Bartlomiej_Niedbala-2-scaled.jpg",
    "2023/07/Bartlomiej_Niedbala-1-scaled.jpg",
  ),
  p(
    "Daniel Studzienny",
    NONE,
    "software",
    "2026/10/Daniel_Studzienny-1-scaled.jpg",
    "2026/10/Daniel_Studzienny-scaled.jpg",
  ),
  p(
    "Kinga Adamska",
    NONE,
    "software",
    "2026/10/Kinga_Adamska-3-scaled.jpg",
    "2026/10/Kinga_Adamska-1-scaled.jpg",
  ),
  p(
    "Łukasz Kuś",
    NONE,
    "software",
    "2026/10/Lukasz_Kus-1-scaled.jpg",
    "2026/10/Lukasz_Kus-2-scaled.jpg",
  ),
  p(
    "Mariusz Rychlicki",
    NONE,
    "software",
    "2023/07/Mariusz_Rychlicki_soft-scaled-e1732968561522.jpg",
    "2023/07/Mariusz_Rychlicki_soft1-scaled-e1732968586374.jpg",
  ),
  p(
    "Oskar Janecki",
    NONE,
    "software",
    "2026/03/Oskar_Janecki-1-scaled.jpg",
    "2026/03/Oskar_Janecki-2-scaled.jpg",
  ),
  p("Tomasz Marek", NONE, "software", NONE, NONE),
  p(
    "Igor Rak",
    "Członek honorowy",
    "software",
    "2023/09/Rak_I_0-768x768.jpg",
    "2023/09/Rak_I_1-768x768.jpg",
  ),
  p(
    "Jan Hernas",
    "Członek honorowy",
    "software",
    "2023/07/Hernas_J_1-scaled.jpg",
    "2023/07/Hernas_J_0-scaled.jpg",
  ),
  p(
    "Mirosław Rajczyk",
    "Członek honorowy",
    "software",
    "2023/08/Rajczyk_M_1-768x768.jpg",
    "2023/08/Rajczyk_M_0-768x768.jpg",
  ),

  // ---------- Science ----------
  p(
    "Dominika Zygarlicka",
    "Liderka działu",
    "science",
    "2026/03/Dominika_Zygarlicka-1-scaled.jpg",
    "2026/03/Dominika_Zygarlicka-2-scaled.jpg",
  ),
  p(
    "Konrad Teplicki",
    "Wicelider działu",
    "science",
    "2026/03/Konrad_Teplicki-1-scaled.jpg",
    "2026/03/Konrad_Teplicki-2-scaled.jpg",
  ),
  p(
    "Aleksandra Korytkowska",
    NONE,
    "science",
    "2026/03/Ola_Korytkowska-1-scaled.jpg",
    "2026/03/Ola_Korytkowska-2-scaled.jpg",
  ),
  p(
    "Dominik Pawliszewski",
    NONE,
    "science",
    "2026/10/Dominik_Pawliszewski-1-scaled.jpg",
    "2026/10/Dominik_Pawliszewski-2-scaled.jpg",
  ),
  p(
    "Jakub Jaworski",
    NONE,
    "science",
    "2023/07/Jakub_Jaworski_science-scaled-e1732268076856.jpg",
    "2023/07/Jakub_Jaworski_science1-scaled-e1732268095169.jpg",
  ),
  p(
    "Tobiasz Hałka",
    NONE,
    "science",
    "2023/07/Tobiasz_Halka-1-scaled.jpg",
    "2023/07/Tobiasz_Halka-2-scaled.jpg",
  ),
  p(
    "Michał Wnuk",
    "Członek honorowy",
    "science",
    "2023/07/Wnuk_M_1-768x768.jpg",
    "2023/07/Wnuk_M_0-768x768.jpg",
  ),
  p(
    "Michał Grzesiak",
    "Członek honorowy",
    "science",
    "2023/07/Grzesiak_M_1-768x768.jpg",
    "2023/07/Grzesiak_M_0-768x768.jpg",
  ),

  // ---------- Marketing ----------
  p(
    "Weronika Malec",
    "Liderka działu",
    "marketing",
    "2026/10/Werka_Malec-1-scaled.jpg",
    "2026/10/Werka_Malec-3-scaled.jpg",
  ),
  p(
    "Katarzyna Jagiełło",
    "Wicelider działu",
    "marketing",
    "2026/10/Kasia_Jagiello-1-scaled.jpg",
    "2026/10/Kasia_Jagiello-6-scaled.jpg",
  ),
  p(
    "Gabriela Golbiak",
    NONE,
    "marketing",
    "2026/03/Gabi_Golbiak-1-scaled.jpg",
    "2026/03/Gabi_Golbiak-2-scaled.jpg",
  ),
  p(
    "Krysia Fluder",
    NONE,
    "marketing",
    "2026/03/Krysia_Fluder-1-scaled.jpg",
    "2023/07/Krysia-1-scaled.jpg",
  ),
  p(
    "Olaf Wojcieszonek",
    NONE,
    "marketing",
    "2024/05/Olaf_1-scaled-e1716774535415.jpg",
    "2024/05/Olaf_2-scaled-e1716774607352.jpg",
  ),
  p(
    "Weronika Stanisławek",
    NONE,
    "marketing",
    "2024/02/Stanislawek_W_0-scaled.jpg",
    "2024/10/DSC00792-scaled-e1728045574687.jpg",
  ),
  p(
    "Armin Ernst",
    "Członek honorowy",
    "marketing",
    "2023/08/Ernst_A_1-768x768.jpg",
    "2023/08/Ernst_A_0-768x768.jpg",
  ),
];

const url = process.env.DIRECTUS_URL;
const token = process.env.DIRECTUS_TOKEN;
if (!url || !token) {
  throw new Error("Set DIRECTUS_URL and DIRECTUS_TOKEN");
}

const client = createDirectus(url).with(staticToken(token)).with(rest());

// Same photo used twice (leaders appear in management and in their department)
// is uploaded only once.
const uploaded = new Map();

async function upload(path, title) {
  if (path == null) {
    return null;
  }
  if (uploaded.has(path)) {
    return uploaded.get(path) ?? null;
  }
  try {
    const file = await client.request(importFile(BASE + path, { title }));
    uploaded.set(path, file.id);
    console.log("uploaded", path);
    return file.id;
  } catch (error) {
    console.warn("FAILED to import", path, error);
    uploaded.set(path, null);
    return null;
  }
}

async function main() {
  const rows = [];
  for (const [index, person] of PEOPLE.entries()) {
    rows.push({
      name: person.name,
      role: person.position,
      group: person.group,
      photo: await upload(person.photo, person.name),
      photo_hover: await upload(person.hover, `${person.name} (hover)`),
      status: "published",
      sort: index + 1,
    });
  }
  await client.request(createItems("team_members", rows));
  console.log(`Created ${String(rows.length)} team members`);
}

await main();

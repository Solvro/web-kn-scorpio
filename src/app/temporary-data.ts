import {
  Code2Icon,
  CpuIcon,
  FlaskConicalIcon,
  MegaphoneIcon,
  WrenchIcon,
} from "lucide-react";

const STATS = [
  { label: "generacji łazika", value: 8 },
  { label: "lat działania", value: 20 },
  { label: "medali", value: 28 },
];

const ROVER_GENERATIONS = [
  {
    name: "Scorpio 1",
    src: "https://www.scorpio.pwr.edu.pl/wp-content/uploads/2024/09/I-1-1024x1024.png",
  },
  {
    name: "Scorpio 2",
    src: "https://www.scorpio.pwr.edu.pl/wp-content/uploads/2024/09/II-1-1024x1024.png",
  },
  {
    name: "Scorpio 3",
    src: "https://www.scorpio.pwr.edu.pl/wp-content/uploads/2024/09/IMG_4010-1024x1024.png",
  },
  {
    name: "Scorpio 4",
    src: "https://www.scorpio.pwr.edu.pl/wp-content/uploads/2024/09/IV-1-1024x1024.png",
  },
  {
    name: "Scorpio N",
    src: "https://www.scorpio.pwr.edu.pl/wp-content/uploads/2024/09/N-e1727134704444-1024x1024.png",
  },
  {
    name: "Scorpio X",
    src: "https://www.scorpio.pwr.edu.pl/wp-content/uploads/2024/08/scorpioX-e1727133781410-1024x971.png",
  },
  {
    name: "Scorpio 7",
    src: "https://www.scorpio.pwr.edu.pl/wp-content/uploads/2024/08/S7_HQ-e1727133465742-1024x1024.png",
  },
  {
    name: "Scorpio Infinity",
    src: "https://www.scorpio.pwr.edu.pl/wp-content/uploads/2024/08/S8_BROSZURA_3_Ladny-wyglad-e1727133593392-1024x1024.png",
  },
];

const PROJECTS = [
  {
    name: "Scorpio",
    tagline: "Łazik marsjański",
    description:
      "Flagowy projekt koła, biorący udział w zawodach z serii Rover Challenge na całym świecie.",
    image:
      "https://www.scorpio.pwr.edu.pl/wp-content/uploads/2024/09/scorpio7-1024x683.jpg",
  },
  {
    name: "Eagle",
    tagline: "Lądownik marsjański",
    description:
      "Lądownik marsjański zaprojektowany i zbudowany przez członków naszego koła.",
  },
  {
    name: "Twardowsky",
    tagline: "Kolonia marsjańska",
    description: "Projekt kolonii marsjańskiej opracowany przez koło SCORPIO.",
  },
  {
    name: "Data-driven farming",
    tagline: "Inteligentna hodowla roślin",
    description:
      "Pudełka umożliwiające optymalizację hodowli wymagających roślin leczniczych.",
  },
];

const ACHIEVEMENTS = [
  {
    competition: "Anatolian Rover Challenge",
    result: "Zwycięstwo w 2024 roku",
  },
  {
    competition: "Australian Rover Challenge",
    result: "Sukcesy na arenie międzynarodowej",
  },
];

const DEPARTMENTS = [
  {
    name: "Konstrukcja",
    icon: WrenchIcon,
    tagline: "Projektowanie i budowa podzespołów mechanicznych łazika.",
  },
  {
    name: "Elektronika",
    icon: CpuIcon,
    tagline: "Projektowanie, montaż i uruchamianie elektroniki łazika.",
  },
  {
    name: "Software",
    icon: Code2Icon,
    tagline: "Oprogramowanie, autonomia i infrastruktura sieciowa.",
  },
  {
    name: "Science",
    icon: FlaskConicalIcon,
    tagline: "Badania naukowe wsparte geologią, chemią i inżynierią.",
  },
  {
    name: "Marketing",
    icon: MegaphoneIcon,
    tagline: "PR, finanse, grafika i promocja projektu.",
  },
];

const NEWS_HIGHLIGHTS = [
  "Transfer Multisort Elektronik - partner technologiczny Projektu Scorpio",
  "Podsumowanie roku 2025",
  "Gramy razem dla WOŚP 2024",
  "Podsumowanie działalności Scorpio 7",
  "Podsumowanie sezonu 2024",
  "Wygraliśmy Anatolian Rover Challenge 2024!",
];

export {
  ACHIEVEMENTS,
  DEPARTMENTS,
  NEWS_HIGHLIGHTS,
  PROJECTS,
  ROVER_GENERATIONS,
  STATS,
};

import {
  CodeIcon,
  CpuIcon,
  FlaskIcon,
  MegaphoneIcon,
  WrenchIcon,
} from "@phosphor-icons/react";

const STATS = [
  { label: "generacji łazika", value: 8 },
  { label: "lat działania", value: 20 },
  { label: "medali", value: 28 },
];

const HERO_IMAGE = {
  src: "/images/hero-desert-cliff.jpg",
  alt: "Łazik Scorpio z ramieniem manipulatora na skałach u stóp pustynnego klifu",
};

/** Chronological order, oldest first. `glyph` is the oversized mark drawn behind the rover. */
const ROVER_GENERATIONS = [
  {
    name: "Scorpio 1",
    glyph: "I",
    year: "2011",
    highlight: "Debiut i 4. miejsce na University Rover Challenge",
    description:
      "Nasza pierwsza konstrukcja: zdalnie sterowany łazik z manipulatorem, systemem wizyjnym i systemem zdalnych pomiarów.",
    src: "/rovers/cut/scorpio-1.png",
  },
  {
    name: "Scorpio 2",
    glyph: "II",
    year: "2012",
    highlight: "Niezależne zawieszenie sześciokołowe",
    description:
      "Zupełnie nowe podwozie na podwójnych wahaczach i obniżony środek ciężkości, który zwiększył stabilność i udźwig ramienia.",
    src: "/rovers/cut/scorpio-2.png",
  },
  {
    name: "Scorpio 3",
    glyph: "III",
    year: "2013",
    highlight: "Przegubowa rama i napęd na sześć kół",
    description:
      "Lżejszy o ponad 5 kg, z nowym, precyzyjniejszym manipulatorem o sześciu stopniach swobody i elektroniką obsługującą więcej czujników.",
    src: "/rovers/cut/scorpio-3.png",
  },
  {
    name: "Scorpio 4",
    glyph: "IV",
    year: "2014",
    highlight: "Pełna modułowość i zawieszenie rocker-bogie",
    description:
      "Zaprezentowany na European Rover Challenge. Zmodyfikowane zawieszenie znane z łazików NASA, przystosowane do wyższych prędkości.",
    src: "/rovers/cut/scorpio-4.png",
  },
  {
    name: "Scorpio N",
    glyph: "N",
    year: null,
    highlight: "Ramię z szóstym stopniem swobody",
    description:
      "Obrót w podstawie ramienia, własny Power Manager kontrolujący baterie, wzmocnione wahacze i nowe wiertło do zadań badawczych.",
    src: "/rovers/cut/scorpio-n.png",
  },
  {
    name: "Scorpio X",
    glyph: "X",
    year: null,
    highlight: "Cztery silniki BLDC po 250 W",
    description:
      "Konstrukcja z aluminium lotniczego i poliamidu. Autorskie opony z Cordury wypełnione granulatem poprawiły przyczepność i amortyzację.",
    src: "/rovers/cut/scorpio-x.png",
  },
  {
    name: "Scorpio 7",
    glyph: "7",
    year: null,
    highlight: "Nowy mechanizm dyferencyjny",
    description:
      "Generacja nastawiona na badania. Lżejsze i sztywniejsze zawieszenie, felgi z druku 3D, włókno węglowe i aluminium klasy kosmicznej.",
    src: "/rovers/cut/scorpio-7.png",
  },
  {
    name: "Scorpio Infinity",
    glyph: "∞",
    year: "2023",
    highlight: "Własna przekładnia planetarna w kołach",
    description:
      "Nowe silniki BLDC, opony drukowane z elastycznego filamentu i szybszy dostęp do modułów science oraz elektroniki podczas zawodów.",
    src: "/rovers/cut/scorpio-infinity.png",
  },
];

const FIELD_MOMENTS = [
  {
    src: "/images/field-desert.jpg",
    alt: "Łazik Scorpio na pustynnym torze zawodów, w tle płaskowyże",
    caption: "Pustynny tor zawodów",
    width: 2400,
    height: 1600,
  },
  {
    src: "/images/field-arm-repair.jpg",
    alt: "Członek zespołu naprawia ramię manipulatora na stole serwisowym",
    caption: "Serwis ramienia między konkurencjami",
    width: 2400,
    height: 1600,
  },
  {
    src: "/images/field-electronics.jpg",
    alt: "Diagnostyka okablowania w otwartym korpusie łazika",
    caption: "Diagnostyka elektroniki w terenie",
    width: 1600,
    height: 1600,
  },
  {
    src: "/images/field-scorpio-n.jpg",
    alt: "Łazik Scorpio N na jasnym, pustynnym gruncie",
    caption: "Scorpio N podczas testów",
    width: 1024,
    height: 768,
  },
  {
    src: "/images/field-team-test.jpg",
    alt: "Zespół pochylony nad łazikiem podczas przygotowań do testu",
    caption: "Ostatnie poprawki przed startem",
    width: 2000,
    height: 1124,
  },
  {
    src: "/images/software-tent.jpg",
    alt: "Operatorzy software przy laptopach w namiocie zawodów",
    caption: "Stanowisko operatorów",
    width: 2000,
    height: 1339,
  },
  {
    src: "/images/field-wheel.jpg",
    alt: "Członek zespołu z aparatem i zapasowym kołem łazika na pustyni",
    caption: "Zapasowe koło zawsze pod ręką",
    width: 2000,
    height: 1333,
  },
];

const PROJECTS = [
  {
    name: "Twardowsky",
    tagline: "Kolonia marsjańska",
    description:
      "Kolonia dla 1000 osób zaprojektowana ze start-upem Space is More. II miejsce w konkursie Mars Colony Prize.",
    image: "/images/project-twardowsky.jpg",
  },
  {
    name: "Eagle",
    tagline: "Lądownik marsjański",
    description:
      "Koncept lądownika zdolnego dostarczyć na Marsa 10 ton ładunku. II miejsce w konkursie Red Eagle.",
    image: "/images/project-eagle.jpg",
  },
  {
    name: "Data-driven farming",
    tagline: "Bayer Digital Campus Challenge",
    description:
      "Pudełka optymalizujące hodowlę wymagających roślin leczniczych.",
    image: null,
  },
  {
    name: "Space Day",
    tagline: "Edukacja",
    description:
      "Organizujemy Space Day i zajęcia dla dzieci, promując inżynierię kosmiczną w Polsce.",
    image: "/images/outreach-lecture.jpg",
  },
];

const DEPARTMENTS = [
  {
    slug: "konstrukcja",
    name: "Konstrukcja",
    icon: WrenchIcon,
    tagline: "Projektowanie i budowa podzespołów mechanicznych łazika.",
    image: "/images/dept-konstrukcja.jpg",
  },
  {
    slug: "elektronika",
    name: "Elektronika",
    icon: CpuIcon,
    tagline: "Projektowanie, montaż i uruchamianie elektroniki łazika.",
    image: "/images/dept-elektronika.jpg",
  },
  {
    slug: "software",
    name: "Software",
    icon: CodeIcon,
    tagline: "Oprogramowanie, autonomia i infrastruktura sieciowa.",
    image: "/images/dept-software.jpg",
  },
  {
    slug: "science",
    name: "Science",
    icon: FlaskIcon,
    tagline: "Badania naukowe wsparte geologią, chemią i inżynierią.",
    image: "/images/dept-science.jpg",
  },
  {
    slug: "marketing",
    name: "Marketing",
    icon: MegaphoneIcon,
    tagline: "PR, finanse, grafika i promocja projektu.",
    image: "/images/dept-marketing.jpg",
  },
];

const NEWS_HIGHLIGHTS = [
  {
    title: "Wygraliśmy Anatolian Rover Challenge 2024!",
    excerpt:
      "Nasza drużyna po raz drugi obroniła tytuł zwycięzców Anatolian Rover Challenge. Jesteśmy niezwykle dumni z pracy całego zespołu.",
  },
  {
    title:
      "Transfer Multisort Elektronik - partner technologiczny Projektu Scorpio",
    excerpt: null,
  },
  { title: "Podsumowanie roku 2025", excerpt: null },
  { title: "Podsumowanie sezonu 2024", excerpt: null },
];

export {
  DEPARTMENTS,
  FIELD_MOMENTS,
  HERO_IMAGE,
  NEWS_HIGHLIGHTS,
  PROJECTS,
  ROVER_GENERATIONS,
  STATS,
};

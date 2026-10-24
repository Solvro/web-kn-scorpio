import {
  CodeIcon,
  CpuIcon,
  FlaskIcon,
  MegaphoneIcon,
  WrenchIcon,
} from "@phosphor-icons/react";

const RECRUITMENT_DEADLINE = "2\u00A0listopada";

/** End of the last recruitment day, Warsaw time. Drives the countdown. */
const RECRUITMENT_DEADLINE_DATE = "2026-11-02T23:59:59+01:00";

const APPLICATION_FORM_URL = "https://forms.gle/ntFRvVfMgFxx1xX8A";

const RECRUITMENT_EMAIL = "projekt@scorpio.pwr.edu.pl";

const RECRUITMENT_DEPARTMENTS = [
  {
    slug: "konstrukcja",
    name: "Konstrukcja",
    icon: WrenchIcon,
    image: {
      src: "/images/dept-konstrukcja.jpg",
      alt: "Członkowie działu Konstrukcji przy pracy w warsztacie",
    },
    description: [
      "Dział konstrukcji to dział zajmujący się konstrukcją łazików Scorpio. To właśnie tutaj mierzymy się z problemami na pierwszym froncie projektu.",
      "Pomysły mechaników zamieniane są w projekty gotowych elementów w programie SolidWorks, a ich realizacja odbywa się m.in. poprzez druk 3D oraz obróbkę części metalowych i wszystko, na co pozwoli pomysłowość!",
    ],
    pitch:
      "Jeśli lubisz, gdy pomysł zamienia się w gotową część, którą możesz wziąć do ręki, to miejsce dla Ciebie.",
    tools: ["SolidWorks", "Druk 3D", "Obróbka metalu"],
    taskUrl:
      "https://drive.google.com/drive/folders/1hkouQoP4rNRsaUPHA5bNhzv3jJqV1kyb?usp=sharing",
  },
  {
    slug: "elektronika",
    name: "Elektronika",
    icon: CpuIcon,
    image: {
      src: "/images/dept-elektronika.jpg",
      alt: "Członkowie działu Elektroniki przy pracy nad podzespołami łazika",
    },
    description: [
      "Dział Elektroniki odpowiada za projektowanie, montaż oraz uruchamianie kluczowych podzespołów elektronicznych, które pozwalają na prawidłowe funkcjonowanie łazików Scorpio.",
      "Codzienna praca obejmuje wybór i testowanie układów elektronicznych, projektowanie płytek PCB oraz programowanie mikrokontrolerów STM32 w C/C++, a finalnie testy złożonych systemów w gotowych łazikach.",
    ],
    pitch:
      "Zobaczysz, jak stworzone przez Ciebie układy sprawdzają się w prawdziwym łaziku.",
    tools: ["STM32", "C/C++", "Projektowanie PCB"],
    taskUrl: "https://forms.gle/wGu7rrME7ajxFbMt8",
  },
  {
    slug: "software",
    name: "Software",
    icon: CodeIcon,
    image: {
      src: "/images/dept-software.jpg",
      alt: "Członkowie działu Software przy pracy nad oprogramowaniem łazika",
    },
    description: [
      "Dział Software odpowiada za tworzenie i utrzymywanie oprogramowania oraz infrastruktury sieciowej dla projektów realizowanych przez koło, głównie łazików z serii Scorpio.",
      "Zakres prac jest bardzo szeroki: programowanie w C++ i Pythonie z użyciem Robot Operating System, sztuczna inteligencja, autonomiczna praca robota oraz administrowanie sieciami i systemami operacyjnymi.",
    ],
    pitch:
      "Przyjdź do nas, a zobaczysz, jak Twój kod działa na prawdziwym łaziku!",
    tools: ["C++", "Python", "ROS", "AI"],
    taskUrl:
      "https://github.com/ScorpioOrganization/scorpio_zadanie_rekrutacyjne_software",
  },
  {
    slug: "science",
    name: "Science",
    icon: FlaskIcon,
    image: {
      src: "/images/dept-science.jpg",
      alt: "Członkowie działu Science podczas pracy badawczej",
    },
    description: [
      "Codziennością działu Science jest rozwiązywanie złożonych problemów naukowych. Wykorzystujemy wiedzę z zakresu geologii, chemii oraz szeroko pojętej inżynierii, aby tworzyć innowacyjne i praktyczne rozwiązania techniczne.",
      "Aktywnie uczestniczymy w konkursach, konferencjach i innych inicjatywach branżowych, stawiając na samorozwój i ciągłe doskonalenie umiejętności.",
    ],
    pitch: "Połącz pasję do nauki z praktycznymi wyzwaniami.",
    tools: ["Geologia", "Chemia", "Inżynieria"],
    taskUrl:
      "https://drive.google.com/drive/folders/1k9zFSjrEnoPle8lDJIBmPE80HfctCyY4?usp=sharing",
  },
  {
    slug: "marketing",
    name: "Marketing",
    icon: MegaphoneIcon,
    image: {
      src: "/images/dept-marketing.jpg",
      alt: "Członkowie działu Marketingu podczas pracy nad promocją projektu",
    },
    description: [
      "Dział Marketingu łączy ze sobą pododdziały Public Relations i Finanse, uzupełniając się wzajemnie na wydarzeniach oraz podczas pozyskiwania dofinansowania do naszej działalności.",
      "Odpowiadamy za tworzenie grafik, nagrywanie filmów na zawody serii Rover Challenge, pozyskiwanie sponsorów oraz stronę internetową koła.",
    ],
    pitch:
      "Od rozmów ze sponsorami po opowiadanie młodym marzycielom, czemu łazik nie łazi.",
    tools: ["Grafika i video", "Pozyskiwanie sponsorów", "Finanse"],
    taskUrl:
      "https://docs.google.com/document/d/13r-6QNRcHJBg8c8-PEy2-tfrUdu6I40-ZsRfIE289Y4/edit?usp=sharing",
  },
];

export {
  APPLICATION_FORM_URL,
  RECRUITMENT_DEADLINE,
  RECRUITMENT_DEADLINE_DATE,
  RECRUITMENT_DEPARTMENTS,
  RECRUITMENT_EMAIL,
};

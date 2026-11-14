// Creates the Directus collections behind the home and recruitment pages,
// uploads their images and seeds the initial content.
//
// Idempotent: missing collections, fields, relations and permissions are
// created; existing ones are left alone. Content is seeded only into empty
// collections, so re-running never overwrites edits made in the CMS.
//
// Source images live in cms/seed/. Usage (from cms/, with Directus running):
//   pnpm setup:pages   (= node --env-file=.env scripts/setup-pages.mjs)
//
// If cms/data.db conflicts in git, take the other side's data.db and re-run
// this script to restore these collections.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_BASE = process.env.PUBLIC_URL ?? "http://localhost:8055";
// Original images; Directus copies them into cms/uploads on upload.
const ASSETS = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../seed",
);

// ---------------------------------------------------------------- API helpers

let token = "";

async function api(method, endpoint, body) {
  const response = await fetch(`${URL_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
    },
    body:
      body == null
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });
  if (response.status === 204) {
    return null;
  }
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      `${method} ${endpoint} -> ${response.status}: ${JSON.stringify(json?.errors ?? json)}`,
    );
  }
  return json?.data ?? null;
}

async function login() {
  const response = await fetch(`${URL_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Login failed (${response.status}). Is Directus running and is cms/.env present?`,
    );
  }
  const { data } = await response.json();
  token = data.access_token;
}

// ------------------------------------------------------------ field builders

// Balanced *highlight* markers, no nesting, no line breaks inside a highlight.
const HIGHLIGHT = String.raw`[^*]*(\*[^*\n]+\*[^*]*)*`;
const NON_BLANK = String.raw`(?=[\s\S]*\S)`;
const HIGHLIGHT_NOTE =
  "Słowa w *gwiazdkach* zostaną wyróżnione kolorem (gwiazdki wliczają się do limitu).";

// Optional fields accept an empty value and are validated only when filled in.
function regexValidation(field, pattern, message, required) {
  const rule = { [field]: { _regex: pattern } };
  const validation = required
    ? { _and: [rule] }
    : {
        _or: [
          { [field]: { _null: true } },
          { [field]: { _empty: true } },
          rule,
        ],
      };
  return { validation, validation_message: message };
}

function string(
  field,
  {
    max,
    required = false,
    note,
    width = "full",
    highlight = false,
    pattern,
    patternMessage,
  },
) {
  // SQLite ignores varchar length, so the limit is enforced by the validation rule.
  // Required fields must contain more than whitespace (Directus accepts "" as present).
  const length =
    String.raw`(?=[\s\S]{0,${max}}$)` + (required ? NON_BLANK : "");
  let body = String.raw`[\s\S]*`;
  const messages = [`Maks. ${max} znaków.`];
  if (highlight) {
    body = HIGHLIGHT;
    messages.push("Każde *wyróżnienie* potrzebuje dwóch gwiazdek.");
  } else if (pattern != null) {
    body = pattern.replace(/^\^/, "").replace(/\$$/, "");
    messages.push(patternMessage);
  }
  return {
    field,
    type: "string",
    schema: { max_length: max, is_nullable: !required },
    meta: {
      interface: "input",
      required,
      width,
      note: [note, highlight ? HIGHLIGHT_NOTE : null, `Maks. ${max} znaków.`]
        .filter(Boolean)
        .join(" "),
      options: { softLength: max, trim: true },
      ...regexValidation(
        field,
        `^${length}${body}$`,
        messages.join(" "),
        required,
      ),
    },
  };
}

function text(
  field,
  { max, required = false, note, highlight = false, maxPhotoMarkers },
) {
  const lookaheads = [String.raw`(?=[\s\S]{0,${max}}$)`];
  if (required) {
    lookaheads.push(NON_BLANK);
  }
  if (maxPhotoMarkers != null) {
    lookaheads.push(
      String.raw`(?!(?:[\s\S]*\{foto\}){${maxPhotoMarkers + 1}})`,
    );
  }
  const body = highlight ? HIGHLIGHT : String.raw`[\s\S]*`;
  const messages = [`Maks. ${max} znaków.`];
  if (highlight) {
    messages.push("Każde *wyróżnienie* potrzebuje dwóch gwiazdek.");
  }
  if (maxPhotoMarkers != null) {
    messages.push(`Maks. ${maxPhotoMarkers} znaczniki {foto}.`);
  }
  return {
    field,
    type: "text",
    schema: { is_nullable: !required },
    meta: {
      interface: "input-multiline",
      required,
      note: [note, highlight ? HIGHLIGHT_NOTE : null, `Maks. ${max} znaków.`]
        .filter(Boolean)
        .join(" "),
      options: { softLength: max, trim: true },
      ...regexValidation(
        field,
        `^${lookaheads.join("")}${body}$`,
        messages.join(" "),
        required,
      ),
    },
  };
}

function file(field, { required = false, note, width = "full" } = {}) {
  return {
    field,
    type: "uuid",
    // Always nullable: the file relation uses on_delete SET NULL, so a NOT NULL
    // column would make files undeletable. `required` is enforced via meta.
    schema: { is_nullable: true },
    meta: { interface: "file-image", special: ["file"], required, width, note },
    relation: true,
  };
}

// Any file (e.g. a PDF), not only images.
function attachment(field, { note, width = "full" } = {}) {
  return {
    field,
    type: "uuid",
    schema: { is_nullable: true },
    meta: { interface: "file", special: ["file"], width, note },
    relation: true,
  };
}

function boolean(field, { note, width = "half" } = {}) {
  return {
    field,
    type: "boolean",
    schema: { default_value: false, is_nullable: false },
    meta: { interface: "boolean", special: ["cast-boolean"], width, note },
  };
}

function date(field, { required = false, note, width = "half" } = {}) {
  return {
    field,
    type: "date",
    // Nullable column so it can be added to a table that already has rows;
    // `required` is enforced via meta.
    schema: { is_nullable: true },
    meta: { interface: "datetime", required, width, note },
  };
}

function integer(field, { required = false, note, width = "half", min } = {}) {
  return {
    field,
    type: "integer",
    schema: { is_nullable: !required },
    meta: {
      interface: "input",
      required,
      width,
      note,
      ...(min == null
        ? {}
        : {
            validation: {
              _or: [{ [field]: { _null: true } }, { [field]: { _gte: min } }],
            },
            validation_message: `Minimum ${min}.`,
          }),
    },
  };
}

function select(
  field,
  choices,
  { required = true, note, width = "half" } = {},
) {
  return {
    field,
    type: "string",
    // Nullable column so it can be added to a table that already has rows;
    // `required` is enforced via meta.
    schema: { max_length: 32, is_nullable: true },
    meta: {
      interface: "select-dropdown",
      required,
      width,
      note,
      options: {
        choices: choices.map(([value, label]) => ({ value, text: label })),
      },
    },
  };
}

function tags(field, { note } = {}) {
  return {
    field,
    type: "json",
    schema: {},
    meta: {
      interface: "tags",
      special: ["cast-json"],
      note,
      options: { allowCustom: true },
    },
  };
}

function datetime(field, { required = false, note } = {}) {
  return {
    field,
    type: "timestamp",
    schema: { is_nullable: !required },
    meta: { interface: "datetime", required, note },
  };
}

const slug = (
  note = "Fragment adresu URL, np. scorpio-infinity. Małe litery, cyfry i myślniki.",
) =>
  string("slug", {
    max: 80,
    required: true,
    width: "half",
    note,
    pattern: "^[a-z0-9]+(-[a-z0-9]+)*$",
    patternMessage: "Tylko małe litery, cyfry i pojedyncze myślniki.",
  });

const sort = {
  field: "sort",
  type: "integer",
  schema: {},
  meta: { interface: "input", hidden: true },
};

// ----------------------------------------------------------------- schema

const ICONS_DIVISIONS = [
  ["wrench", "Klucz (Konstrukcja)"],
  ["cpu", "Procesor (Elektronika)"],
  ["code", "Kod (Software)"],
  ["flask", "Kolba (Science)"],
  ["megaphone", "Megafon (Marketing)"],
];
const ICONS_STEPS = [
  ["cursor-click", "Kursor"],
  ["clipboard-text", "Notatnik"],
  ["paper-plane-tilt", "Samolot"],
];

const NEWS_CATEGORIES = [
  ["competitions", "Zawody"],
  ["events", "Wydarzenia"],
  ["partners", "Partnerzy"],
  ["summary", "Podsumowania"],
];
const ACHIEVEMENT_SERIES = [
  ["rover_challenge", "Zawody Rover Challenge"],
  ["competition", "Inne konkursy"],
  ["honor", "Tytuły i nagrody"],
];
const ACHIEVEMENT_RESULTS = [
  ["place", "Miejsce"],
  ["distinction", "Wyróżnienie"],
  ["title", "Tytuł lub nagroda"],
];
const PARTNER_TIERS = [
  ["main", "Partner główny"],
  ["partner", "Partner"],
  ["supporter", "Wspierają nas"],
];

const COLLECTIONS = [
  {
    collection: "home_page",
    singleton: true,
    icon: "home",
    note: "Strona główna: teksty sekcji i zdjęcia.",
    fields: [
      string("hero_eyebrow", { max: 32, note: "Mały napis nad nagłówkiem." }),
      string("hero_title", {
        max: 34,
        required: true,
        highlight: true,
        note: "Główny nagłówek (2 linie na komputerze).",
      }),
      string("hero_subtitle", {
        max: 130,
        note: "Jedno lub dwa zdania pod nagłówkiem.",
      }),
      file("hero_image", {
        required: true,
        note: "Duże zdjęcie w tle, poziome, min. 2400 px szerokości.",
      }),
      string("hero_image_alt", {
        max: 160,
        note: "Opis zdjęcia dla czytników ekranu.",
      }),
      text("manifesto", {
        max: 320,
        required: true,
        highlight: true,
        maxPhotoMarkers: 2,
        note: "Duży akapit pod nagłówkiem. W miejscu {foto} pojawi się kolejne zdjęcie poniżej (pierwsze {foto} = Zdjęcie 1).",
      }),
      file("manifesto_photo_1", {
        width: "half",
        note: "Zdjęcie 1 w akapicie (wyświetlane jako mała pigułka).",
      }),
      string("manifesto_photo_1_alt", { max: 160, width: "half" }),
      file("manifesto_photo_2", {
        width: "half",
        note: "Zdjęcie 2 w akapicie.",
      }),
      string("manifesto_photo_2_alt", { max: 160, width: "half" }),
      string("rovers_title", {
        required: true,
        max: 40,
        highlight: true,
        note: "Nagłówek sekcji z łazikami.",
      }),
      string("rovers_intro", { max: 140 }),
      string("field_title", {
        required: true,
        max: 30,
        highlight: true,
        note: "Nagłówek galerii zdjęć z terenu.",
      }),
      string("field_intro", { max: 140 }),
      string("projects_title", {
        required: true,
        max: 30,
        highlight: true,
        note: "Nagłówek sekcji z projektami.",
      }),
      string("projects_intro", { max: 120 }),
      string("divisions_eyebrow", { max: 24, width: "half" }),
      string("divisions_title", {
        required: true,
        max: 36,
        highlight: true,
        width: "half",
        note: "Nagłówek sekcji z działami.",
      }),
      string("news_title", {
        required: true,
        max: 30,
        note: "Nagłówek sekcji z aktualnościami.",
      }),
      string("join_title", {
        max: 36,
        highlight: true,
        note: "Nagłówek końcowego wezwania do dołączenia.",
      }),
      string("join_subtitle", {
        max: 100,
        note: "Gdy rekrutacja trwa, automatycznie dopisujemy zdanie z terminem.",
      }),
      file("join_image", { note: "Zdjęcie w tle końcowej sekcji." }),
      string("join_image_alt", { max: 160 }),
    ],
  },
  {
    collection: "recruitment_page",
    singleton: true,
    icon: "how_to_reg",
    note: "Strona rekrutacji: termin, linki, teksty sekcji.",
    fields: [
      datetime("deadline", {
        required: true,
        note: "Koniec rekrutacji (czas polski). Po tej dacie strona pokazuje „Rekrutacja zakończona” i ukrywa formularz.",
      }),
      string("application_form_url", {
        max: 255,
        required: true,
        pattern: String.raw`^https://\S+$`,
        patternMessage: "Adres musi zaczynać się od https://",
        note: "Link do formularza zgłoszeniowego.",
      }),
      string("contact_email", {
        max: 120,
        required: true,
        pattern: String.raw`^[^@\s]+@[^@\s]+\.[^@\s]+$`,
        patternMessage: "Nieprawidłowy adres e-mail.",
        note: "Adres dla pytań o rekrutację.",
      }),
      string("hero_title", {
        max: 34,
        required: true,
        highlight: true,
        note: "Główny nagłówek strony rekrutacji.",
      }),
      string("hero_subtitle", { max: 130 }),
      file("collage_photo_1", {
        required: true,
        note: "Duże zdjęcie kolażu (poziome).",
      }),
      string("collage_photo_1_alt", { max: 160 }),
      file("collage_photo_2", {
        width: "half",
        note: "Małe zdjęcie w prawym górnym rogu (poziome).",
      }),
      string("collage_photo_2_alt", { max: 160, width: "half" }),
      file("collage_photo_3", {
        width: "half",
        note: "Małe zdjęcie w lewym dolnym rogu (kwadratowe).",
      }),
      string("collage_photo_3_alt", { max: 160, width: "half" }),
      string("steps_title", { required: true, max: 30, highlight: true }),
      string("divisions_title", { required: true, max: 36, highlight: true }),
      string("divisions_intro", { max: 140 }),
      string("benefits_title", { required: true, max: 30, highlight: true }),
    ],
  },
  {
    collection: "divisions",
    icon: "groups",
    note: "Działy koła. Używane na stronie głównej i w rekrutacji.",
    sort: true,
    template: "{{name}}",
    fields: [
      slug("Fragment adresu, np. software (link /recruitment#software)."),
      string("name", { max: 24, required: true, width: "half" }),
      select("icon", ICONS_DIVISIONS, { note: "Ikona przy nazwie działu." }),
      string("tagline", {
        max: 70,
        required: true,
        note: "Krótki opis na stronie głównej.",
      }),
      string("pitch", { max: 130, note: "Wyróżnione zdanie w rekrutacji." }),
      text("description", {
        max: 600,
        required: true,
        note: "Opis w rekrutacji. Akapity oddziel pustą linią.",
      }),
      tags("tools", { note: "Narzędzia i umiejętności (maks. 5, krótkie)." }),
      string("task_url", {
        max: 255,
        pattern: String.raw`^https://\S+$`,
        patternMessage: "Adres musi zaczynać się od https://",
        note: "Link do zadania rekrutacyjnego.",
      }),
      file("image", {
        required: true,
        note: "Zdjęcie zespołu przy pracy (kwadratowe lub pionowe).",
      }),
      string("image_alt", { max: 160 }),
    ],
  },
  {
    collection: "stats",
    icon: "bar_chart",
    note: "Liczby na stronie głównej. Projekt zakłada 3 pozycje.",
    sort: true,
    template: "{{value}} {{label}}",
    fields: [
      integer("value", { required: true }),
      string("label", { max: 24, required: true, width: "half" }),
    ],
  },
  {
    collection: "rovers",
    icon: "rocket_launch",
    note: "Generacje łazika w karuzeli na stronie głównej, od najstarszej.",
    sort: true,
    template: "{{name}}",
    fields: [
      slug(),
      string("name", { max: 24, required: true, width: "half" }),
      string("glyph", {
        max: 3,
        required: true,
        width: "half",
        note: "Duży znak za łazikiem, np. VII lub ∞.",
      }),
      string("year", {
        max: 4,
        width: "half",
        pattern: "^[0-9]{4}$",
        patternMessage: "Rok w formacie RRRR.",
        note: "Zostaw puste, jeśli nieznany.",
      }),
      string("highlight", {
        max: 60,
        required: true,
        note: "Wyróżnione zdanie pod nazwą.",
      }),
      string("description", { max: 160, required: true }),
      file("image", {
        required: true,
        note: "Render lub rysunek na przezroczystym tle (PNG).",
      }),
    ],
  },
  {
    collection: "projects",
    icon: "category",
    note: "Kafelki „Nie tylko łazik” na stronie głównej. Projekt zakłada 4 pozycje.",
    sort: true,
    template: "{{name}}",
    fields: [
      slug(),
      string("name", { max: 32, required: true, width: "half" }),
      string("tagline", { max: 40, required: true }),
      string("description", { max: 140, required: true }),
      file("image", { note: "Bez zdjęcia kafelek dostaje pomarańczowe tło." }),
      string("image_alt", { max: 160 }),
    ],
  },
  {
    collection: "field_photos",
    icon: "photo_library",
    note: "Zdjęcia w galerii „W terenie” na stronie głównej.",
    sort: true,
    template: "{{caption}}",
    fields: [
      file("image", {
        required: true,
        note: "Zdjęcie poziome; na kartach przycinane do 3:2.",
      }),
      string("alt", {
        max: 160,
        required: true,
        note: "Opis zdjęcia dla czytników ekranu.",
      }),
      string("caption", {
        max: 40,
        required: true,
        note: "Podpis pod zdjęciem.",
      }),
    ],
  },
  {
    collection: "news",
    icon: "newspaper",
    note: "Aktualności, od najnowszej (wg daty publikacji). Najnowsza jest wyróżniona na stronie głównej i w aktualnościach.",
    sort: true,
    template: "{{title}}",
    fields: [
      slug("Fragment adresu, np. podsumowanie-roku-2025 (link /news/…)."),
      date("published_at", {
        required: true,
        note: "Data publikacji. Decyduje o kolejności.",
      }),
      string("title", { max: 90, required: true }),
      select("category", NEWS_CATEGORIES, {
        note: "Kategoria do filtrowania na stronie aktualności.",
      }),
      text("excerpt", {
        max: 200,
        note: "Zajawka na kartach aktualności.",
      }),
      file("image", {
        width: "half",
        note: "Zdjęcie główne, poziome. Bez zdjęcia karta dostaje pomarańczowe tło.",
      }),
      string("image_alt", { max: 160, width: "half" }),
      text("body", {
        max: 12_000,
        note: "Treść artykułu. Akapity oddziel pustą linią. Linia zaczynająca się od „## ” to śródtytuł.",
      }),
    ],
  },
  {
    collection: "achievements",
    icon: "emoji_events",
    note: "Sukcesy: miejsca, wyróżnienia i tytuły. Liczby na stronie sukcesów (np. miejsca na podium) liczą się z tej listy.",
    sort: true,
    template: "{{year}} {{title}}",
    fields: [
      string("title", {
        max: 90,
        required: true,
        note: "Nazwa zawodów, konkursu albo tytułu, np. Anatolian Rover Challenge.",
      }),
      integer("year", { note: "Rok (RRRR). Zostaw puste, jeśli nieznany." }),
      select("series", ACHIEVEMENT_SERIES, {
        note: "Grupa na liście sukcesów.",
      }),
      select("result", ACHIEVEMENT_RESULTS),
      integer("place", {
        min: 1,
        note: "Tylko przy wyniku „Miejsce”: 1, 2, 3… Miejsca 1-3 liczą się jako podium.",
      }),
      string("category", {
        max: 60,
        width: "half",
        note: "Kategoria, konkurencja lub projekt, np. Freestyle.",
      }),
      boolean("featured", {
        note: "Pokaż jako dużą kartę z opisem i zdjęciem (projekt zakłada 4).",
      }),
      text("story", {
        max: 280,
        note: "Krótki opis dla wyróżnionych sukcesów.",
      }),
      file("image", {
        width: "half",
        note: "Zdjęcie dla wyróżnionego sukcesu. PNG z przezroczystym tłem pokazuje się bez kadrowania.",
      }),
      string("image_alt", { max: 160, width: "half" }),
    ],
  },
  {
    collection: "successes_page",
    singleton: true,
    icon: "military_tech",
    note: "Strona sukcesów: nagłówki i zdjęcie. Same sukcesy są w kolekcji Achievements.",
    fields: [
      string("hero_title", {
        max: 40,
        required: true,
        highlight: true,
        note: "Główny nagłówek (2 linie na komputerze).",
      }),
      string("hero_subtitle", { max: 160 }),
      file("hero_image", {
        required: true,
        note: "Duże zdjęcie w tle, poziome, min. 2400 px szerokości.",
      }),
      string("hero_image_alt", { max: 160 }),
      string("stories_title", { required: true, max: 36, highlight: true }),
      string("matrix_title", { required: true, max: 36, highlight: true }),
      string("matrix_intro", { max: 140 }),
      string("tally_title", {
        required: true,
        max: 36,
        highlight: true,
        note: "Nagłówek przy liczbach (podium, zwycięstwa, tytuły).",
      }),
      file("tally_image", { note: "Zdjęcie obok liczb (poziome)." }),
      string("tally_image_alt", { max: 160 }),
      string("archive_title", { required: true, max: 30, highlight: true }),
    ],
  },
  {
    collection: "partners",
    icon: "handshake",
    note: "Partnerzy na stronie partnerów, w kolejności wyświetlania.",
    sort: true,
    template: "{{name}}",
    fields: [
      string("name", { max: 60, required: true, width: "half" }),
      select("tier", PARTNER_TIERS, { note: "Sekcja na stronie partnerów." }),
      string("url", {
        max: 255,
        pattern: String.raw`^https://\S+$`,
        patternMessage: "Adres musi zaczynać się od https://",
        note: "Strona partnera.",
      }),
      file("logo", {
        required: true,
        note: "Logo w kolorze, na przezroczystym tle (PNG), przycięte do krawędzi. Wyświetlane na jasnej plakietce.",
      }),
      text("description", {
        max: 450,
        note: "Krótki opis partnera.",
      }),
    ],
  },
  {
    collection: "partners_page",
    singleton: true,
    icon: "storefront",
    note: "Strona partnerów: teksty, zdjęcie i oferta współpracy.",
    fields: [
      string("hero_title", {
        max: 34,
        required: true,
        highlight: true,
        note: "Główny nagłówek.",
      }),
      text("intro", { max: 240, note: "Akapit pod nagłówkiem." }),
      file("hero_image", { note: "Zdjęcie obok nagłówka (poziome)." }),
      string("hero_image_alt", { max: 160 }),
      string("pitch_title", {
        max: 30,
        required: true,
        highlight: true,
        note: "Nagłówek sekcji „Zostań partnerem”.",
      }),
      text("pitch_text", { max: 220 }),
      attachment("offer_file", {
        note: "Oferta współpracy (PDF). Plik jest publiczny.",
      }),
      string("contact_email", {
        max: 120,
        required: true,
        pattern: String.raw`^[^@\s]+@[^@\s]+\.[^@\s]+$`,
        patternMessage: "Nieprawidłowy adres e-mail.",
        note: "Adres dla firm zainteresowanych współpracą.",
      }),
    ],
  },
  {
    collection: "recruitment_steps",
    icon: "format_list_numbered",
    note: "Kroki „Jak dołączyć”. Projekt zakłada 3 pozycje.",
    sort: true,
    template: "{{title}}",
    fields: [
      select("icon", ICONS_STEPS),
      string("title", { max: 30, required: true, width: "half" }),
      string("text", { max: 100, required: true }),
    ],
  },
  {
    collection: "recruitment_benefits",
    icon: "workspace_premium",
    note: "Kafelki „Co zyskujesz”. Pierwsza pozycja zajmuje duży kafel; projekt zakłada 3 pozycje.",
    sort: true,
    template: "{{title}}",
    fields: [
      string("title", { max: 40, required: true }),
      string("text", { max: 120, required: true }),
      file("image", { required: true }),
      string("image_alt", { max: 160 }),
    ],
  },
];

async function ensureCollection({
  collection,
  singleton = false,
  icon,
  note,
  sort: sortable = false,
  template,
  fields,
}) {
  const existing = await api("GET", `/collections/${collection}`).catch(
    () => null,
  );
  if (existing == null) {
    await api("POST", "/collections", {
      collection,
      schema: {},
      meta: {
        singleton,
        icon,
        note,
        sort_field: sortable ? "sort" : null,
        display_template: template ?? null,
      },
      fields: [
        {
          field: "id",
          type: "integer",
          schema: { is_primary_key: true, has_auto_increment: true },
          meta: { hidden: true, interface: "input", readonly: true },
        },
        ...(sortable ? [sort] : []),
      ],
    });
    console.log(`+ collection ${collection}`);
  } else if (existing.meta?.note !== note) {
    await api("PATCH", `/collections/${collection}`, { meta: { note } });
  }
  const existingFields = await api("GET", `/fields/${collection}`);
  const existingByName = new Map(existingFields.map((f) => [f.field, f]));
  for (const definition of fields) {
    const { relation, ...field } = definition;
    const existing = existingByName.get(field.field);
    if (existing != null) {
      // Keep notes, limits and validation in sync with this script.
      await api("PATCH", `/fields/${collection}/${field.field}`, {
        meta: field.meta,
      });
      // Relax NOT NULL where the script now wants a nullable column (file
      // fields from older runs). Only when it differs: altering rebuilds the table.
      if (
        field.schema.is_nullable === true &&
        existing.schema?.is_nullable === false
      ) {
        await api("PATCH", `/fields/${collection}/${field.field}`, {
          schema: { is_nullable: true },
        });
        console.log(`  ~ ${collection}.${field.field} is now nullable`);
      }
      continue;
    }
    await api("POST", `/fields/${collection}`, field);
    if (relation) {
      await api("POST", "/relations", {
        collection,
        field: field.field,
        related_collection: "directus_files",
        schema: { on_delete: "SET NULL" },
      });
    }
    console.log(`  + ${collection}.${field.field}`);
  }
}

async function ensurePublicRead(policyId, collection) {
  const existing = await api(
    "GET",
    `/permissions?filter[policy][_eq]=${policyId}&filter[collection][_eq]=${collection}&filter[action][_eq]=read`,
  );
  if (existing.length > 0) {
    return;
  }
  await api("POST", "/permissions", {
    policy: policyId,
    collection,
    action: "read",
    fields: ["*"],
    permissions: {},
  });
  console.log(`  + public read ${collection}`);
}

// ------------------------------------------------------------------ files

const FILES_NOTE =
  "UWAGA: wszystkie pliki są publiczne (każdy może je pobrać). Wgrywaj tylko materiały na stronę. Nie wgrywaj CV ani dokumentów wewnętrznych.";

// Shown at the top of the file library. Setting meta on a system collection
// replaces its defaults, so icon and display template are re-specified too.
async function ensureFilesNote() {
  const files = await api("GET", "/collections/directus_files");
  if (files.meta?.note === FILES_NOTE) {
    return;
  }
  await api("PATCH", "/collections/directus_files", {
    meta: {
      note: FILES_NOTE,
      icon: "folder",
      display_template: "{{ $thumbnail }} {{ title }}",
    },
  });
  console.log("  ~ file library note");
}

const fileCache = new Map();

async function upload(relativePath, title) {
  if (fileCache.has(relativePath)) {
    return fileCache.get(relativePath);
  }
  const filename = path.basename(relativePath);
  const found = await api(
    "GET",
    `/files?filter[filename_download][_eq]=${encodeURIComponent(filename)}&fields=id&limit=1`,
  );
  let id = found[0]?.id;
  if (id == null) {
    const form = new FormData();
    form.append("title", title);
    const mime =
      {
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".pdf": "application/pdf",
      }[path.extname(filename)] ?? "image/jpeg";
    form.append(
      "file",
      new Blob([await readFile(path.join(ASSETS, relativePath))], {
        type: mime,
      }),
      filename,
    );
    const created = await api("POST", "/files", form);
    id = created.id;
    console.log(`  + file ${filename}`);
  }
  fileCache.set(relativePath, id);
  return id;
}

// ---------------------------------------------------------------- content

async function seedSingleton(collection, build) {
  const current = await api("GET", `/items/${collection}`);
  if (current != null && current.id != null) {
    return;
  }
  await api("PATCH", `/items/${collection}`, await build());
  console.log(`  ~ seeded ${collection}`);
}

async function seedList(collection, build) {
  const current = await api("GET", `/items/${collection}?limit=1&fields=id`);
  if (current.length > 0) {
    return;
  }
  const items = await build();
  await api(
    "POST",
    `/items/${collection}`,
    items.map((item, index) => ({ sort: index + 1, ...item })),
  );
  console.log(`  ~ seeded ${collection} (${items.length})`);
}

const NEWS_IMAGE_ALTS = {
  "podsumowanie-roku-2025":
    "Zespół Scorpio z łazikiem Scorpio Infinity podczas zawodów",
  "gramy-razem-dla-wosp-2024":
    "Sterowanie łazikiem z panelu operatorskiego podczas wydarzenia dla WOŚP",
  "podsumowanie-dzialalnosci-s7":
    "Łazik Scorpio 7 na pustynnym terenie, w tle płaskowyże",
  "podsumowanie-sezonu-2024": "Łazik Scorpio na skalistym terenie zawodów",
  "wygralismy-anatolian-rover-challenge-2024":
    "Zespół Scorpio z łazikiem i polskimi flagami po zwycięstwie w Anatolian Rover Challenge 2024",
  "podsumowanie-roku-2021": "Zespół Scorpio w komplecie z łazikiem na trawniku",
  "transfer-multisort-elektronik-partner-technologiczny":
    "Członkini zespołu Scorpio podłącza okablowanie w otwartym korpusie łazika",
};

// Articles whose cover is a shared field photo instead of news/<slug>.jpg.
const NEWS_IMAGE_FILES = {
  "transfer-multisort-elektronik-partner-technologiczny":
    "images/field-electronics.jpg",
};

// Articles taken from the original site (cms/seed/news/content.json).
async function newsItems() {
  const content = JSON.parse(
    await readFile(path.join(ASSETS, "news/content.json"), "utf8"),
  );
  const items = [];
  for (const item of content) {
    const alt = NEWS_IMAGE_ALTS[item.slug];
    items.push({
      ...item,
      image:
        alt == null
          ? null
          : await upload(
              NEWS_IMAGE_FILES[item.slug] ?? `news/${item.slug}.jpg`,
              item.title,
            ),
      image_alt: alt ?? null,
    });
  }
  return items;
}

// One-time migration for databases seeded before news had dates, images and
// bodies: adds the missing articles and fills only empty fields. Runs only
// while no article has a date yet, so later deletions and edits stay.
async function migrateNews() {
  const current = await api(
    "GET",
    "/items/news?fields=id,slug,published_at,category,excerpt,image,image_alt,body&limit=-1",
  );
  if (
    current.length === 0 ||
    current.some((item) => item.published_at != null)
  ) {
    return;
  }
  const bySlug = new Map(current.map((item) => [item.slug, item]));
  for (const item of await newsItems()) {
    const existing = bySlug.get(item.slug);
    if (existing == null) {
      await api("POST", "/items/news", item);
      console.log(`  + news ${item.slug}`);
      continue;
    }
    const patch = Object.fromEntries(
      Object.entries(item).filter(
        ([key, value]) =>
          key !== "slug" &&
          key !== "title" &&
          value != null &&
          (existing[key] == null || existing[key] === ""),
      ),
    );
    await api("PATCH", `/items/news/${existing.id}`, patch);
    console.log(`  ~ news ${item.slug}`);
  }
}

// Databases seeded earlier used the electronics photo as the partners hero and
// left the TME article without a cover. Swaps only those exact old values, so
// anything an editor chose since stays.
async function migratePartnerImages() {
  const electronics = await upload(
    "images/field-electronics.jpg",
    "Diagnostyka elektroniki",
  );
  const page = await api("GET", "/items/partners_page?fields=hero_image");
  if (page?.hero_image === electronics) {
    await api("PATCH", "/items/partners_page", {
      hero_image: await upload(
        "images/team-competition.jpg",
        "Zespół z łazikiem i logotypami partnerów",
      ),
      hero_image_alt:
        "Zespół Scorpio z łazikiem, przed nimi tablica z logotypami partnerów",
    });
    console.log("  ~ partners_page hero image");
  }
  const slugValue = "transfer-multisort-elektronik-partner-technologiczny";
  const [article] = await api(
    "GET",
    `/items/news?filter[slug][_eq]=${slugValue}&fields=id,image&limit=1`,
  );
  if (article != null && article.image == null) {
    await api("PATCH", `/items/news/${article.id}`, {
      image: electronics,
      image_alt: NEWS_IMAGE_ALTS[slugValue],
    });
    console.log(`  ~ news ${slugValue} cover`);
  }
}

function achievement(series, result, title, year, place, category, extra) {
  return { series, result, title, year, place, category, ...extra };
}

async function partner(tier, name, slugValue, url, description) {
  return {
    tier,
    name,
    url,
    description,
    logo: await upload(`partners/${slugValue}.png`, name),
  };
}

async function rover(slugValue, name, glyph, year, highlight, description) {
  return {
    slug: slugValue,
    name,
    glyph,
    year,
    highlight,
    description,
    image: await upload(`rovers/${slugValue}.png`, name),
  };
}

async function seed() {
  await seedSingleton("home_page", async () => ({
    hero_eyebrow: "Koło Naukowe Scorpio",
    hero_title: "Budujemy łaziki na *Marsa.*",
    hero_subtitle:
      "Studenci Politechniki Wrocławskiej projektują i budują łaziki marsjańskie od 2006 roku. Osiem generacji za nami.",
    hero_image: await upload(
      "images/hero-desert-cliff.jpg",
      "Scorpio na pustynnym klifie",
    ),
    hero_image_alt:
      "Łazik Scorpio z ramieniem manipulatora na skałach u stóp pustynnego klifu",
    manifesto:
      "Od 2006 roku projektujemy i budujemy *łaziki marsjańskie* {foto} Startujemy w zawodach Rover Challenge na całym świecie, {foto} bronimy tytułu w Anatolian Rover Challenge i gościliśmy w *NASA JPL.*",
    manifesto_photo_1: await upload(
      "images/field-river.jpg",
      "Łazik nad rzeką",
    ),
    manifesto_photo_1_alt: "Łazik nad rzeką na tle płaskowyżów",
    manifesto_photo_2: await upload(
      "images/team-competition.jpg",
      "Zespół po zawodach",
    ),
    manifesto_photo_2_alt: "Zespół Scorpio z łazikiem po zawodach",
    rovers_title: "Osiem generacji łazika",
    rovers_intro:
      "Każdy Scorpio uczy się na błędach poprzednika. Przeciągnij łazik albo wybierz generację z osi czasu.",
    field_title: "W terenie",
    field_intro:
      "Łazik sprawdza się dopiero tam, gdzie kończy się asfalt. Kilka kadrów z zawodów i testów.",
    projects_title: "Nie tylko łazik",
    projects_intro:
      "Projektujemy też kolonie, lądowniki i rozwiązania dla rolnictwa.",
    divisions_eyebrow: "Zespół",
    divisions_title: "Pięć działów, jeden łazik",
    news_title: "Aktualności",
    join_title: "Następny łazik zbudujesz z nami.",
    join_subtitle: "Szukamy osób do pięciu działów.",
    join_image: await upload("images/field-river.jpg", "Łazik nad rzeką"),
    join_image_alt:
      "Łazik Scorpio nad rzeką, w tle płaskowyże o zachodzie słońca",
  }));

  await seedSingleton("recruitment_page", async () => ({
    deadline: "2026-11-02T22:59:59.000Z",
    application_form_url: "https://forms.gle/ntFRvVfMgFxx1xX8A",
    contact_email: "projekt@scorpio.pwr.edu.pl",
    hero_title: "Zbuduj z nami *kolejny łazik.*",
    hero_subtitle:
      "Studia nie muszą być tylko teorią. Szukamy pasjonatów do pięciu działów, od konstrukcji po marketing.",
    collage_photo_1: await upload(
      "images/team-competition.jpg",
      "Zespół po zawodach",
    ),
    collage_photo_1_alt: "Zespół Scorpio z łazikiem po zawodach",
    collage_photo_2: await upload(
      "images/field-arm-repair.jpg",
      "Serwis ramienia",
    ),
    collage_photo_2_alt: "Serwis ramienia manipulatora",
    collage_photo_3: await upload(
      "images/dept-marketing.jpg",
      "Dział Marketingu",
    ),
    collage_photo_3_alt: "Prezentacja ramienia łazika podczas wydarzenia",
    steps_title: "Jak dołączyć",
    divisions_title: "Znajdź swój dział",
    divisions_intro:
      "Każdy dział ma własne zadanie rekrutacyjne. Wybierz, sprawdź i wyślij rozwiązanie razem ze zgłoszeniem.",
    benefits_title: "Co zyskujesz",
  }));

  await seedList("divisions", async () => [
    {
      slug: "konstrukcja",
      name: "Konstrukcja",
      icon: "wrench",
      tagline: "Projektowanie i budowa podzespołów mechanicznych łazika.",
      pitch:
        "Jeśli lubisz, gdy pomysł zamienia się w gotową część, którą możesz wziąć do ręki, to miejsce dla Ciebie.",
      description:
        "Dział konstrukcji to dział zajmujący się konstrukcją łazików Scorpio. To właśnie tutaj mierzymy się z problemami na pierwszym froncie projektu.\n\nPomysły mechaników zamieniane są w projekty gotowych elementów w programie SolidWorks, a ich realizacja odbywa się m.in. poprzez druk 3D oraz obróbkę części metalowych i wszystko, na co pozwoli pomysłowość!",
      tools: ["SolidWorks", "Druk 3D", "Obróbka metalu"],
      task_url:
        "https://drive.google.com/drive/folders/1hkouQoP4rNRsaUPHA5bNhzv3jJqV1kyb?usp=sharing",
      image: await upload("images/dept-konstrukcja.jpg", "Dział Konstrukcji"),
      image_alt: "Członkowie działu Konstrukcji przy pracy w warsztacie",
    },
    {
      slug: "elektronika",
      name: "Elektronika",
      icon: "cpu",
      tagline: "Projektowanie, montaż i uruchamianie elektroniki łazika.",
      pitch:
        "Zobaczysz, jak stworzone przez Ciebie układy sprawdzają się w prawdziwym łaziku.",
      description:
        "Dział Elektroniki odpowiada za projektowanie, montaż oraz uruchamianie kluczowych podzespołów elektronicznych, które pozwalają na prawidłowe funkcjonowanie łazików Scorpio.\n\nCodzienna praca obejmuje wybór i testowanie układów elektronicznych, projektowanie płytek PCB oraz programowanie mikrokontrolerów STM32 w C/C++, a finalnie testy złożonych systemów w gotowych łazikach.",
      tools: ["STM32", "C/C++", "Projektowanie PCB"],
      task_url: "https://forms.gle/wGu7rrME7ajxFbMt8",
      image: await upload("images/dept-elektronika.jpg", "Dział Elektroniki"),
      image_alt:
        "Członkowie działu Elektroniki przy pracy nad podzespołami łazika",
    },
    {
      slug: "software",
      name: "Software",
      icon: "code",
      tagline: "Oprogramowanie, autonomia i infrastruktura sieciowa.",
      pitch:
        "Przyjdź do nas, a zobaczysz, jak Twój kod działa na prawdziwym łaziku!",
      description:
        "Dział Software odpowiada za tworzenie i utrzymywanie oprogramowania oraz infrastruktury sieciowej dla projektów realizowanych przez koło, głównie łazików z serii Scorpio.\n\nZakres prac jest bardzo szeroki: programowanie w C++ i Pythonie z użyciem Robot Operating System, sztuczna inteligencja, autonomiczna praca robota oraz administrowanie sieciami i systemami operacyjnymi.",
      tools: ["C++", "Python", "ROS", "AI"],
      task_url:
        "https://github.com/ScorpioOrganization/scorpio_zadanie_rekrutacyjne_software",
      image: await upload("images/dept-software.jpg", "Dział Software"),
      image_alt:
        "Członkowie działu Software przy pracy nad oprogramowaniem łazika",
    },
    {
      slug: "science",
      name: "Science",
      icon: "flask",
      tagline: "Badania naukowe wsparte geologią, chemią i inżynierią.",
      pitch: "Połącz pasję do nauki z praktycznymi wyzwaniami.",
      description:
        "Codziennością działu Science jest rozwiązywanie złożonych problemów naukowych. Wykorzystujemy wiedzę z zakresu geologii, chemii oraz szeroko pojętej inżynierii, aby tworzyć innowacyjne i praktyczne rozwiązania techniczne.\n\nAktywnie uczestniczymy w konkursach, konferencjach i innych inicjatywach branżowych, stawiając na samorozwój i ciągłe doskonalenie umiejętności.",
      tools: ["Geologia", "Chemia", "Inżynieria"],
      task_url:
        "https://drive.google.com/drive/folders/1k9zFSjrEnoPle8lDJIBmPE80HfctCyY4?usp=sharing",
      image: await upload("images/dept-science.jpg", "Dział Science"),
      image_alt: "Członkowie działu Science podczas pracy badawczej",
    },
    {
      slug: "marketing",
      name: "Marketing",
      icon: "megaphone",
      tagline: "PR, finanse, grafika i promocja projektu.",
      pitch:
        "Od rozmów ze sponsorami po opowiadanie młodym marzycielom, czemu łazik nie łazi.",
      description:
        "Dział Marketingu łączy ze sobą pododdziały Public Relations i Finanse, uzupełniając się wzajemnie na wydarzeniach oraz podczas pozyskiwania dofinansowania do naszej działalności.\n\nOdpowiadamy za tworzenie grafik, nagrywanie filmów na zawody serii Rover Challenge, pozyskiwanie sponsorów oraz stronę internetową koła.",
      tools: ["Grafika i video", "Pozyskiwanie sponsorów", "Finanse"],
      task_url:
        "https://docs.google.com/document/d/13r-6QNRcHJBg8c8-PEy2-tfrUdu6I40-ZsRfIE289Y4/edit?usp=sharing",
      image: await upload("images/dept-marketing.jpg", "Dział Marketingu"),
      image_alt:
        "Członkowie działu Marketingu podczas pracy nad promocją projektu",
    },
  ]);

  await seedList("stats", async () => [
    { value: 8, label: "generacji łazika" },
    { value: 20, label: "lat działania" },
    { value: 28, label: "medali" },
  ]);

  await seedList("rovers", async () => {
    return [
      await rover(
        "scorpio-1",
        "Scorpio 1",
        "I",
        "2011",
        "Debiut i 4. miejsce na University Rover Challenge",
        "Nasza pierwsza konstrukcja: zdalnie sterowany łazik z manipulatorem, systemem wizyjnym i systemem zdalnych pomiarów.",
      ),
      await rover(
        "scorpio-2",
        "Scorpio 2",
        "II",
        "2012",
        "Niezależne zawieszenie sześciokołowe",
        "Zupełnie nowe podwozie na podwójnych wahaczach i obniżony środek ciężkości, który zwiększył stabilność i udźwig ramienia.",
      ),
      await rover(
        "scorpio-3",
        "Scorpio 3",
        "III",
        "2013",
        "Przegubowa rama i napęd na sześć kół",
        "Lżejszy o ponad 5 kg, z nowym, precyzyjniejszym manipulatorem o sześciu stopniach swobody i elektroniką obsługującą więcej czujników.",
      ),
      await rover(
        "scorpio-4",
        "Scorpio 4",
        "IV",
        "2014",
        "Pełna modułowość i zawieszenie rocker-bogie",
        "Zaprezentowany na European Rover Challenge. Zmodyfikowane zawieszenie znane z łazików NASA, przystosowane do wyższych prędkości.",
      ),
      await rover(
        "scorpio-n",
        "Scorpio N",
        "N",
        null,
        "Ramię z szóstym stopniem swobody",
        "Obrót w podstawie ramienia, własny Power Manager kontrolujący baterie, wzmocnione wahacze i nowe wiertło do zadań badawczych.",
      ),
      await rover(
        "scorpio-x",
        "Scorpio X",
        "X",
        null,
        "Cztery silniki BLDC po 250 W",
        "Konstrukcja z aluminium lotniczego i poliamidu. Autorskie opony z Cordury wypełnione granulatem poprawiły przyczepność i amortyzację.",
      ),
      await rover(
        "scorpio-7",
        "Scorpio 7",
        "7",
        null,
        "Nowy mechanizm dyferencyjny",
        "Generacja nastawiona na badania. Lżejsze i sztywniejsze zawieszenie, felgi z druku 3D, włókno węglowe i aluminium klasy kosmicznej.",
      ),
      await rover(
        "scorpio-infinity",
        "Scorpio Infinity",
        "∞",
        "2023",
        "Własna przekładnia planetarna w kołach",
        "Nowe silniki BLDC, opony drukowane z elastycznego filamentu i szybszy dostęp do modułów science oraz elektroniki podczas zawodów.",
      ),
    ];
  });

  await seedList("projects", async () => [
    {
      slug: "twardowsky",
      name: "Twardowsky",
      tagline: "Kolonia marsjańska",
      description:
        "Kolonia dla 1000 osób zaprojektowana ze start-upem Space is More. II miejsce w konkursie Mars Colony Prize.",
      image: await upload(
        "images/project-twardowsky.jpg",
        "Kolonia Twardowsky",
      ),
      image_alt: "Wizualizacja kolonii marsjańskiej Twardowsky",
    },
    {
      slug: "eagle",
      name: "Eagle",
      tagline: "Lądownik marsjański",
      description:
        "Koncept lądownika zdolnego dostarczyć na Marsa 10 ton ładunku. II miejsce w konkursie Red Eagle.",
      image: await upload("images/project-eagle.jpg", "Lądownik Eagle"),
      image_alt: "Wizualizacja lądownika Eagle obok Marsa",
    },
    {
      slug: "data-driven-farming",
      name: "Data-driven farming",
      tagline: "Bayer Digital Campus Challenge",
      description:
        "Pudełka optymalizujące hodowlę wymagających roślin leczniczych.",
      image: null,
      image_alt: null,
    },
    {
      slug: "space-day",
      name: "Space Day",
      tagline: "Edukacja",
      description:
        "Organizujemy Space Day i zajęcia dla dzieci, promując inżynierię kosmiczną w Polsce.",
      image: await upload("images/outreach-lecture.jpg", "Zajęcia dla dzieci"),
      image_alt: "Dzieci na wykładzie w sali Politechniki Wrocławskiej",
    },
  ]);

  await seedList("field_photos", async () => [
    {
      image: await upload("images/field-desert.jpg", "Pustynny tor zawodów"),
      alt: "Łazik Scorpio na pustynnym torze zawodów, w tle płaskowyże",
      caption: "Pustynny tor zawodów",
    },
    {
      image: await upload("images/field-arm-repair.jpg", "Serwis ramienia"),
      alt: "Członek zespołu naprawia ramię manipulatora na stole serwisowym",
      caption: "Serwis ramienia między konkurencjami",
    },
    {
      image: await upload(
        "images/field-electronics.jpg",
        "Diagnostyka elektroniki",
      ),
      alt: "Diagnostyka okablowania w otwartym korpusie łazika",
      caption: "Diagnostyka elektroniki w terenie",
    },
    {
      image: await upload("images/field-scorpio-n.jpg", "Scorpio N"),
      alt: "Łazik Scorpio N na jasnym, pustynnym gruncie",
      caption: "Scorpio N podczas testów",
    },
    {
      image: await upload(
        "images/field-team-test.jpg",
        "Przygotowania do testu",
      ),
      alt: "Zespół pochylony nad łazikiem podczas przygotowań do testu",
      caption: "Ostatnie poprawki przed startem",
    },
    {
      image: await upload("images/software-tent.jpg", "Stanowisko operatorów"),
      alt: "Operatorzy software przy laptopach w namiocie zawodów",
      caption: "Stanowisko operatorów",
    },
    {
      image: await upload("images/field-wheel.jpg", "Zapasowe koło"),
      alt: "Członek zespołu z aparatem i zapasowym kołem łazika na pustyni",
      caption: "Zapasowe koło zawsze pod ręką",
    },
  ]);

  await migrateNews();
  await seedList("news", newsItems);
  await migratePartnerImages();

  // Results as listed on the original site (scorpio.pwr.edu.pl/sukcesy).
  const RC = "rover_challenge";
  const OTHER = "competition";
  const HONOR = "honor";
  const ARC = "Anatolian Rover Challenge";
  const AURC = "Australian Rover Challenge";
  const ERC = "European Rover Challenge";
  const URC = "University Rover Challenge";
  const KOKOS = "Konkurs Konstrukcji Studenckich KOKOS";
  const KOKON = "Konkurs Kół Naukowych KOKON";
  const STRATEGIC = "Koło Strategiczne Politechniki Wrocławskiej";
  await seedList("achievements", async () => [
    achievement(RC, "place", ARC, 2025, 2, null),
    achievement(RC, "place", AURC, 2025, 5, null),
    achievement(RC, "distinction", ARC, 2025, null, "Panel Manipulation"),
    achievement(RC, "distinction", ARC, 2025, null, "Electronics"),
    achievement(RC, "place", ERC, 2024, 5, null),
    achievement(RC, "place", ARC, 2024, 1, null, {
      featured: true,
      story:
        "Trzeci raz z rzędu wygraliśmy klasyfikację generalną. Zawody łączą zadania marsjańskie i księżycowe, więc łazik musiał poradzić sobie i z piaskiem, i z kamienistym terenem.",
      image: await upload("successes/arc-collaboration.jpg", ARC),
      image_alt:
        "Łazik Scorpio Infinity z ramieniem manipulatora podczas misji na Anatolian Rover Challenge",
    }),
    achievement(RC, "place", AURC, 2024, 1, null, {
      featured: true,
      story:
        "W Adelajdzie zajęliśmy I miejsce w każdej z czterech misji. Jako pierwsza drużyna w historii zawodów odzyskaliśmy wodę z zamrożonej próbki piasku.",
      image: await upload("successes/aurc-excavation.jpg", AURC),
      image_alt:
        "Łazik Scorpio Infinity podczas zadania Excavation & Construction",
    }),
    achievement(RC, "distinction", ARC, 2024, null, "Science"),
    achievement(RC, "place", ARC, 2023, 1, null),
    achievement(RC, "place", AURC, 2023, 2, null),
    achievement(
      RC,
      "distinction",
      AURC,
      2023,
      null,
      "The Boeing Mapping and Autonomous Task",
    ),
    achievement(RC, "distinction", AURC, 2023, null, "Space Resources Task"),
    achievement(RC, "distinction", ARC, 2023, null, "Science"),
    achievement(RC, "distinction", ARC, 2023, null, "Panel Manipulation"),
    achievement(
      RC,
      "distinction",
      ARC,
      2023,
      null,
      "Driving in Difficult Terrain",
    ),
    achievement(RC, "distinction", ARC, 2023, null, "Science and Excavation"),
    achievement(RC, "distinction", ARC, 2023, null, "Night Mission"),
    achievement(RC, "place", ARC, 2022, 1, null),
    achievement(
      RC,
      "place",
      "Canadian International Rover Challenge",
      2019,
      5,
      null,
    ),
    achievement(RC, "place", URC, 2016, 3, null),
    achievement(RC, "place", URC, 2015, 3, null),
    achievement(RC, "place", ERC, 2014, 1, null, {
      featured: true,
      story:
        "Scorpio 4, w pełni modułowy łazik z zawieszeniem rocker-bogie, zadebiutował na European Rover Challenge i od razu wygrał.",
      image: await upload("rovers/scorpio-4.png", "Scorpio 4"),
      image_alt: "Rysunek łazika Scorpio 4 z ramieniem manipulatora",
    }),
    achievement(RC, "place", URC, 2013, 2, null),
    achievement(RC, "place", URC, 2012, 5, null),
    achievement(RC, "place", URC, 2011, 3, null),

    achievement(OTHER, "place", "Robotic Arena", 2026, 1, "Freestyle"),
    achievement(OTHER, "place", KOKOS, 2026, 1, "Joker"),
    achievement(OTHER, "place", KOKON, 2025, 1, "Cyfryzacja"),
    achievement(OTHER, "place", "Robotic Arena", 2025, 3, "Freestyle"),
    achievement(OTHER, "place", KOKOS, 2024, 1, "Smart Robots"),
    achievement(OTHER, "place", "Robotic Arena", 2024, 1, "Freestyle"),
    achievement(
      OTHER,
      "place",
      "Bayer Campus Digital Challenge",
      2023,
      1,
      "Data-driven farming",
    ),
    achievement(OTHER, "place", "xChallenge", 2022, 1, "Freestyle"),
    achievement(OTHER, "place", KOKOS, 2021, 3, "Smart Robots"),
    achievement(OTHER, "place", "Robotic Arena", 2020, 1, "Freestyle"),
    achievement(
      OTHER,
      "place",
      "Mars Colony Prize",
      2019,
      2,
      "Kolonia Twardowsky",
      {
        featured: true,
        story:
          "Projekt kolonii marsjańskiej dla 1000 osób, przygotowany razem ze start-upem Space is More.",
        image: await upload(
          "images/project-twardowsky.jpg",
          "Kolonia Twardowsky",
        ),
        image_alt: "Wizualizacja kolonii marsjańskiej Twardowsky",
      },
    ),
    achievement(OTHER, "place", KOKOS, 2019, 1, "Smart Robots"),
    achievement(
      OTHER,
      "place",
      "Robotex International",
      2018,
      1,
      "Entrepreneur",
    ),
    achievement(OTHER, "place", "Red Eagle", 2018, 2, "Lądownik Eagle"),
    achievement(OTHER, "place", "Robotic Arena", 2017, 2, null),
    achievement(OTHER, "place", KOKON, 2017, 1, "Projekt konstrukcyjny"),
    achievement(
      OTHER,
      "place",
      "RobotShow, XII Forum Innowacji w Tarnowie",
      null,
      1,
      null,
    ),

    achievement(HONOR, "title", STRATEGIC, 2026, null, null),
    achievement(HONOR, "title", STRATEGIC, 2025, null, null),
    achievement(HONOR, "title", STRATEGIC, 2024, null, null),
    achievement(
      HONOR,
      "title",
      "Finalista Bayer Campus Digital Challenge",
      2023,
      null,
      null,
    ),
    achievement(
      HONOR,
      "title",
      "Laureat Klucza Sukcesu Dolnego Śląska",
      2023,
      null,
      null,
    ),
    achievement(HONOR, "title", STRATEGIC, 2023, null, null),
    achievement(HONOR, "title", STRATEGIC, 2022, null, null),
    achievement(HONOR, "title", STRATEGIC, 2019, null, null),
    achievement(HONOR, "distinction", "StRuNa", 2019, null, "Projekt Roku"),
    achievement(HONOR, "distinction", "StRuNa", 2018, null, "Projekt Roku"),
    achievement(
      HONOR,
      "title",
      "Studencki Projekt Roku Politechniki Wrocławskiej",
      2018,
      null,
      "Aktywność na co dzień",
    ),
    achievement(HONOR, "title", "Finalista konkursu 3Mind", 2018, null, null),
    achievement(
      HONOR,
      "title",
      "ProJuvenes",
      2017,
      null,
      "Studenckie Innowacje",
    ),
    achievement(
      HONOR,
      "title",
      "ProJuvenes",
      2014,
      null,
      "Naukowy projekt roku",
    ),
    achievement(HONOR, "title", STRATEGIC, 2014, null, null),
  ]);

  await seedSingleton("successes_page", async () => ({
    hero_title: "Na podium na *czterech kontynentach.*",
    hero_subtitle:
      "Od 2011 roku startujemy w zawodach Rover Challenge w Ameryce Północnej, Europie, Azji i Australii.",
    hero_image: await upload(
      "successes/team-flag-desert.jpg",
      "Zespół z polską flagą",
    ),
    hero_image_alt:
      "Zespół Scorpio z łazikiem i polską flagą na pustynnym terenie zawodów",
    tally_title: "Medale liczymy *od 2011.*",
    tally_image: await upload("successes/team-trophy.jpg", "Zespół z pucharem"),
    tally_image_alt: "Członkowie zespołu z pucharem i łazikiem po zawodach",
    stories_title: "Wyniki, z których *jesteśmy dumni*",
    matrix_title: "Rover Challenge *rok po roku*",
    matrix_intro:
      "Miejsca w klasyfikacji generalnej i wyróżnienia w konkurencjach na zawodach, w których stanęliśmy na podium lub w czołówce.",
    archive_title: "Wszystkie *sukcesy*",
  }));

  // Partners and copy from the original site (scorpio.pwr.edu.pl/partnerzy).
  await seedList("partners", async () => [
    await partner(
      "main",
      "Politechnika Wrocławska",
      "politechnika-wroclawska",
      "https://pwr.edu.pl/",
      "Politechnika Wrocławska jest autonomiczną uczelnią techniczną, uniwersytecką instytucją badawczą. Jej posłannictwem jest kształtowanie twórczych, krytycznych i tolerancyjnych osobowości studentów i doktorantów oraz wytyczanie kierunków rozwoju nauki i techniki.",
    ),
    await partner(
      "main",
      "Transfer Multisort Elektronik",
      "tme",
      "https://www.tme.eu/pl/",
      "Transfer Multisort Elektronik to firma pokoleniowa, istniejąca od 1989 roku. Przez ponad 30 lat stała się jednym z najbardziej dynamicznych globalnych dystrybutorów komponentów elektronicznych, elektrotechnicznych, wyposażenia warsztatowego oraz automatyki przemysłowej.",
    ),
    await partner(
      "partner",
      "Fundacja Manus",
      "fundacja-manus",
      "https://manus.pl/",
      "Zajmuje się szeroko rozumianym wsparciem społeczności Politechniki Wrocławskiej. Działa zarówno dla ogółu studentów, jak i dla kół naukowych, organizacji studenckich, agend kultury oraz organów Samorządu Studenckiego.",
    ),
    await partner(
      "partner",
      "Scorpion",
      "scorpion",
      "https://scorpion.pl/o-firmie/",
      "Projektuje i wytwarza maszyny używane w przemyśle spożywczym. Dziś to jedna z najsilniejszych marek na rynku, a zakres działania rozszerzyła również na inne dziedziny branży spożywczej.",
    ),
    await partner(
      "partner",
      "Tespol",
      "tespol",
      "https://tespol.com.pl/",
      "Polska firma reprezentująca czołowych producentów aparatury kontrolno-pomiarowej oraz systemów radiokomunikacyjnych. Dostarcza nowoczesne technologie dla branż wymagających precyzyjnych pomiarów.",
    ),
    await partner(
      "partner",
      "Hamamatsu",
      "hamamatsu",
      "https://www.hamamatsu.com/eu/en.html",
      "Specjalizuje się w opracowywaniu zaawansowanych czujników światła i źródeł światła, takich jak lasery, diody LED oraz lampy pomiarowe.",
    ),
    await partner(
      "partner",
      "Technology Applied",
      "technology-applied",
      "https://ta.parts/en/home/",
      null,
    ),
    await partner(
      "partner",
      "NG Engineering Group",
      "ng-engineering",
      "https://www.ng.engineering/pl/start.html",
      "Dostawca kompleksowych usług inżynieryjnych, maszyn i urządzeń specjalnego przeznaczenia oraz rozwiązań softwarowych, wspierających proces rozwoju produktu w różnych gałęziach przemysłu.",
    ),
    await partner(
      "partner",
      "DPS Software",
      "dps-software",
      "https://dps-software.pl/",
      "Dostarcza rozwiązania informatyczne klasy CAD, CAM, CAE i PDM wspierające projektowanie, analizy inżynierskie oraz zarządzanie dokumentacją techniczną.",
    ),
    await partner(
      "partner",
      "Dangum",
      "dangum",
      "https://dangum.pl/",
      "Firma z wieloletnim doświadczeniem w produkcji wyrobów gumowych. Specjalizuje się w wytwarzaniu wysokiej jakości uszczelnień technicznych.",
    ),
    await partner(
      "partner",
      "Lange Łukaszuk",
      "lange-lukaszuk",
      "https://www.langelukaszuk.pl/",
      "Reprezentuje renomowane marki z branży narzędziowej, elektronarzędziowej i oświetleniowej. Oferuje kompleksowe rozwiązania dla profesjonalistów i przemysłu.",
    ),
    await partner(
      "partner",
      "igus",
      "igus",
      "https://www.igus.pl/",
      "Producent motion plastics, czyli tworzyw sztucznych do ruchu, które nie wymagają smarowania. Jego rozwiązania zwiększają trwałość i niezawodność systemów mechanicznych.",
    ),
    await partner(
      "partner",
      "Rampa",
      "rampa",
      "https://www.rampa.com/eu/pl/",
      "Przedsiębiorstwo specjalizujące się w technice połączeń. To oni wymyślili wkładkę gwintowaną, a ich produkty są punktem odniesienia przy tworzeniu norm.",
    ),
    await partner(
      "partner",
      "OFIPro",
      "ofipro",
      "https://ofipro.pl/",
      "Oferuje szeroką gamę produktów związanych z drukiem, z możliwością realizacji projektów metodami specjalistycznymi.",
    ),
    await partner(
      "partner",
      "Fiberlogy",
      "fiberlogy",
      "https://fiberlogy.com/pl/o-firmie/",
      "Polski producent filamentów do drukarek FFF/FDM. W ofercie ma ponad 30 rodzajów materiałów.",
    ),
    await partner(
      "partner",
      "norelem",
      "norelem",
      "https://www.norelem.pl/pl/",
      "Dostarcza standardowe elementy i komponenty wykorzystywane w budowie maszyn oraz instalacji.",
    ),
    await partner(
      "partner",
      "Elesa+Ganter",
      "elesa-ganter",
      "https://www.elesa-ganter.pl/pl/CatalogoCompanyPOL/o-nas--22-aboutus",
      "Międzynarodowa spółka oferująca szeroki asortyment standardowych elementów do maszyn i urządzeń przemysłowych.",
    ),
    await partner(
      "partner",
      "FictionLab",
      "fictionlab",
      "https://fictionlab.pl/home-pl",
      null,
    ),
    await partner(
      "partner",
      "ADMETAL",
      "admetal",
      "https://admetal.pl/o-nas/",
      "Polska, rodzinna firma założona w 2012 roku, dostarczająca surowce metalowe, głównie aluminium, z pierwszym w Polsce konfiguratorem online do szybkiego zakupu.",
    ),
    await partner(
      "supporter",
      "JoinThe.Space",
      "join-the-space",
      "https://jointhe.space/",
      "Portal pracy dla branży kosmicznej w krajach Europy Środkowo-Wschodniej.",
    ),
    await partner(
      "supporter",
      "Radio LUZ",
      "radio-luz",
      "https://radioluz.pl/",
      "Stacja radiowa Politechniki Wrocławskiej nadająca na częstotliwości 91,6 MHz.",
    ),
    await partner(
      "supporter",
      "Mars Society Polska",
      "mars-society-polska",
      "https://marssociety.pl/",
      "Niezależny oddział stowarzyszenia The Mars Society, ogólnoświatowej sieci organizacji działających na rzecz badań, eksploracji i kolonizacji Marsa.",
    ),
  ]);

  await seedSingleton("partners_page", async () => ({
    hero_title: "Poznaj naszych *partnerów.*",
    intro:
      "Nasi partnerzy są nieodzowną częścią projektu. To dzięki nim jesteśmy w stanie budować coraz bardziej ambitne i zaawansowane konstrukcje.",
    hero_image: await upload(
      "images/team-competition.jpg",
      "Zespół z łazikiem i logotypami partnerów",
    ),
    hero_image_alt:
      "Zespół Scorpio z łazikiem, przed nimi tablica z logotypami partnerów",
    pitch_title: "Zostań *partnerem.*",
    pitch_text:
      "Jeśli są Państwo zainteresowani dołączeniem do grona naszych partnerów, zapraszamy do kontaktu i do zapoznania się z ofertą współpracy.",
    offer_file: await upload(
      "files/oferta-wspolpracy-2026.pdf",
      "Oferta współpracy 2026",
    ),
    contact_email: "marketing@scorpio.pwr.edu.pl",
  }));

  await seedList("recruitment_steps", async () => [
    {
      icon: "cursor-click",
      title: "Wybierz dział",
      text: "Przejrzyj pięć działów i znajdź ten, który Cię ciekawi.",
    },
    {
      icon: "clipboard-text",
      title: "Rozwiąż zadanie",
      text: "Każdy dział ma zadanie rekrutacyjne. Pokaż, jak podchodzisz do problemu.",
    },
    {
      icon: "paper-plane-tilt",
      title: "Wyślij zgłoszenie",
      text: "Wypełnij formularz, a my skontaktujemy się z Tobą.",
    },
  ]);

  await seedList("recruitment_benefits", async () => [
    {
      title: "Zawody na całym świecie",
      text: "Startujemy w Rover Challenge w Europie, Azji, Ameryce Północnej i Australii.",
      image: await upload("images/field-desert.jpg", "Pustynny tor zawodów"),
      image_alt: "Łazik Scorpio na pustynnym torze zawodów",
    },
    {
      title: "Praktyka zamiast teorii",
      text: "Projektujesz, budujesz i testujesz części, które naprawdę jeżdżą.",
      image: await upload(
        "images/field-electronics.jpg",
        "Diagnostyka elektroniki",
      ),
      image_alt: "Praca przy elektronice łazika",
    },
    {
      title: "Jeden projekt, wiele kierunków",
      text: "Mechanicy, elektronicy, programiści, naukowcy i marketingowcy przy jednym łaziku.",
      image: await upload("images/software-tent.jpg", "Stanowisko operatorów"),
      image_alt: "Zespół operatorów przy laptopach podczas zawodów",
    },
  ]);
}

// ------------------------------------------------------------------- main

await login();
const policies = await api(
  "GET",
  "/policies?filter[name][_eq]=$t:public_label&fields=id",
);
const publicPolicy = policies[0]?.id;
if (publicPolicy == null) {
  throw new Error("Public policy not found");
}

for (const definition of COLLECTIONS) {
  await ensureCollection(definition);
  await ensurePublicRead(publicPolicy, definition.collection);
}
// Image fields and /assets/<id> need public read on files too. This makes
// EVERY file in the CMS public (listable and downloadable): restricting it per
// file or per folder needs permission rules, which this Directus edition
// doesn't allow. So internal files (CVs, documents) must never be uploaded here;
// the note below says so in the file library.
await ensurePublicRead(publicPolicy, "directus_files");
await ensureFilesNote();
await seed();
console.log("Done.");

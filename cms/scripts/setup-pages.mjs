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

function integer(field, { required = false, note, width = "half" } = {}) {
  return {
    field,
    type: "integer",
    schema: { is_nullable: !required },
    meta: { interface: "input", required, width, note },
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
    schema: { max_length: 32, is_nullable: !required },
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
    note: "Aktualności. Pierwsza pozycja jest wyróżniona na stronie głównej.",
    sort: true,
    template: "{{title}}",
    fields: [
      slug(),
      string("title", { max: 90, required: true }),
      text("excerpt", {
        max: 200,
        note: "Zajawka; wyświetlana przy wyróżnionej aktualności.",
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
    const mime = filename.endsWith(".png") ? "image/png" : "image/jpeg";
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

  await seedList("news", async () => [
    {
      slug: "wygralismy-anatolian-rover-challenge-2024",
      title: "Wygraliśmy Anatolian Rover Challenge 2024!",
      excerpt:
        "Nasza drużyna po raz drugi obroniła tytuł zwycięzców Anatolian Rover Challenge. Jesteśmy niezwykle dumni z pracy całego zespołu.",
    },
    {
      slug: "transfer-multisort-elektronik-partner-technologiczny",
      title:
        "Transfer Multisort Elektronik - partner technologiczny Projektu Scorpio",
      excerpt: null,
    },
    {
      slug: "podsumowanie-roku-2025",
      title: "Podsumowanie roku 2025",
      excerpt: null,
    },
    {
      slug: "podsumowanie-sezonu-2024",
      title: "Podsumowanie sezonu 2024",
      excerpt: null,
    },
  ]);

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

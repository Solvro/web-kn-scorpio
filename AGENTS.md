# AGENTS.md

Guide for anyone (human or coding agent) working in this repository. Tool-specific files such as `CLAUDE.md` only point here, so keep this file as the single source of truth.

## Project

Website of **Koło Naukowe Scorpio** (Wrocław University of Science and Technology), the student team that builds Mars rovers. Built by [Solvro](https://solvro.pwr.edu.pl/). The site is in **Polish**; code, comments and docs are in English.

Content lives in the **Directus CMS** in `cms/`: home page, recruitment, contact page and footer. New content goes into the CMS too. See "Data and CMS" below.

## Commands

Package manager: **pnpm** (see `packageManager` in `package.json`). Do not use npm or yarn. A stray `package-lock.json` exists in the repo; ignore it and don't update it.

| Task             | Command                                            |
| ---------------- | -------------------------------------------------- |
| Install          | `pnpm install`                                     |
| Dev server       | `pnpm dev` (http://localhost:3000)                 |
| Production build | `pnpm build`                                       |
| Lint             | `pnpm lint`                                        |
| Type check       | `pnpm types:check`                                 |
| Format           | `pnpm format` / `pnpm format:check`                |
| CMS (first run)  | `cd cms && cp .env.example .env && pnpm install`   |
| CMS              | `cd cms && pnpm dev` (http://localhost:8055)       |
| CMS schema/seed  | `cd cms && pnpm setup:pages` (CMS must be running) |

The CMS needs **Node 22** (`cms/package.json` engines): its native module `isolated-vm` doesn't build on Node 24+. `cms/` pins pnpm 10.30.1 like the root, and `cms/pnpm-workspace.yaml` allows the native builds Directus needs (`argon2`, `isolated-vm`, `sharp`, `sqlite3`). A newer pnpm or a missing build shows up as `Cannot find module './out/isolated_vm'` on start.

Run the CMS and the site in separate terminals. The site reads the CMS URL from `NEXT_PUBLIC_DIRECTUS_URL` in the root `.env` (copy `.env.example`; defaults to `http://localhost:8055`). The site still builds and runs without the CMS; CMS-backed sections render empty.

CI (`.github/workflows/ci.yml`) runs commitlint (on PRs), `format:check`, `build` and `lint`. Run `pnpm format:check && pnpm lint && pnpm types:check` before pushing.

## Git

- `dev` is the integration branch: branch off `dev` as `type/short-description` (e.g. `feat/news-page`) and open PRs against `dev`. Never push to `main` directly.
- Keep history linear: rebase on `dev` instead of merging it into your branch (`git config pull.rebase true` helps).
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `build:`), enforced by commitlint in a Husky `commit-msg` hook.
- `pre-commit` runs `lint-staged` (Prettier on staged files).

## Stack

- **Next.js 16** (App Router, Turbopack, `typedRoutes: true`) and **React 19**
- **TypeScript**, strict
- **Tailwind CSS v4** (CSS-first config in `src/app/globals.css`, no `tailwind.config`), plus `tw-animate-css`
- **shadcn/ui** on **Base UI** (`@base-ui/react`), style `base-vega`. Components live in `src/components/ui` and are owned code.
- **Directus** headless CMS (`cms/`, SQLite) read through `@directus/sdk`
- **Motion** (`motion/react`) for animation
- **Embla** for carousels (`src/components/ui/carousel.tsx`)
- **Magic UI** `Marquee` (`src/components/ui/marquee.tsx`), installed through the shadcn registry
- Icons: **Phosphor** (`@phosphor-icons/react`) in app code; **lucide-react** only inside shadcn primitives and older pages (see Conventions)
- Lint and format config come from `@solvro/config` (ESLint + Prettier). They are strict; see "Lint rules that bite" below.

## Structure

```
src/
  app/
    layout.tsx               Root layout: Navbar, max-w-7xl wrapper, Footer
    globals.css              Design tokens (Tailwind v4 @theme) and keyframes
    page.tsx                 Home page: fetches CMS data on the server (revalidate 300)
    client.tsx               Composes the *-section.tsx files from that data
    *-section.tsx            Home page sections (hero, manifesto, rover, field gallery, ...)
    recruitment/             Recruitment page (page.tsx fetches; hero, department explorer, ...)
    contact/                 Contact page (CMS-backed, async Server Components)
    news/, team/, projects/, partners/, successes/
  components/
    ui/                      shadcn / Base UI primitives (owned, edit freely)
    navbar/, footer/         Site chrome
    full-bleed-section.tsx   Breaks a section out of the max-w-7xl layout wrapper
    reveal.tsx               Fade-up-on-scroll wrapper; server HTML stays visible
    highlighted-text.tsx     Renders CMS text with *highlight* markers
  hooks/                     use-scroll-reveal, use-count-up, use-prefers-reduced-motion,
                             use-recruitment-status (one open/closed source per page)
  lib/
    directus.ts              Directus client, asset URL helper, error logger
    directus-url.ts          CMS base URL (no SDK import, safe in client code)
    cms-image.ts             CmsImage type, toCmsImage(), next/image loader for CMS images
    highlight.ts             *highlight* parser
    recruitment-deadline.ts  Deadline formatting (pl-PL, Europe/Warsaw) and open/closed check
    api/                     One fetcher per CMS collection (home-page, divisions, rovers, ...)
    utils.ts                 cn() = twMerge(clsx())
public/
  rovers/                    Original rover renders and line art (source material, not used by the site)
cms/                         Directus project: own package.json, data.db (SQLite), uploads/, .env.example
  scripts/setup-pages.mjs    Creates the home/recruitment collections, uploads seed images, seeds content
  seed/                      Original images the setup script uploads (photos, transparent rover cut-outs)
docs/
  design-system.md           Visual language, tokens, motion, components, patterns
.env.example                 NEXT_PUBLIC_DIRECTUS_URL
```

Page pattern: `page.tsx` is an async Server Component that exports `metadata`, fetches CMS data in parallel (`Promise.all`) and passes it as props. Interactive pages compose `"use client"` sections (home, recruitment); the contact page fetches inside async Server Components. Keep content out of components.

## Data and CMS

- **Fetchers:** one file per collection in `src/lib/api/`, using `directus.request(readItems(...))` or `readSingleton(...)` with an explicit `fields` list. They map CMS records to page-ready types (images as `CmsImage`, paragraphs split, ...). On error they call `logDirectusError` and return an empty fallback (`[]` or `null`), so pages never crash when the CMS is down.
- **Call fetchers from Server Components** (`page.tsx` or async components), never from client components. Pass plain data into client sections as props.
- **Missing data hides the section.** Sections return `null` when their CMS data is empty instead of rendering placeholders, and a heading renders only when its title is non-empty. Fetchers pass text through `cleanText` (`src/lib/api/text.ts`), which trims and turns empty or whitespace-only values into `null`. Required CMS text fields also reject whitespace-only input.
- **Freshness:** home and recruitment use `export const revalidate = 300`: they're static but re-rendered at most every 5 minutes, so CMS edits appear without a redeploy, and a build made while the CMS was down (CI) fixes itself. The root layout also sets `revalidate = 300`, because the navbar and footer read the CMS (contact details, recruitment availability), so every static page refreshes them too. The contact page uses `dynamic = "force-dynamic"`.
- **Images from the CMS:** request file fields with `fileFields("image")`, convert with `toCmsImage(file, alt)`, render with `next/image` and `loader={cmsImageLoader}`. Directus resizes and serves AVIF/WebP itself (`/assets/<id>?width=...&format=auto`). Don't route CMS images through the Next optimizer: since Next 16 it refuses private hosts like `localhost`. Resized variants are cached in `cms/uploads/*__*` and git-ignored; only originals are committed.
- **Editable copy with constraints:** text fields carry a character limit enforced by a validation rule (SQLite ignores `varchar` lengths). `*word*` marks a highlight (rendered by `HighlightedText` / `highlightedWords`), and the asterisks count toward the limit. The home manifesto also accepts up to two `{foto}` markers, replaced by its photos in order. Limits were checked in the browser at exactly the maximum length; if you change one, re-check desktop and phone.
- **Schema source of truth:** `cms/scripts/setup-pages.mjs` defines the home and recruitment collections, fields, limits, notes (Polish, for editors) and public read access, including read on `directus_files` (needed for image fields and `/assets/<id>`). File fields are always nullable columns (their relation uses `on_delete: SET NULL`); `required` is enforced through field meta, so images stay deletable. Run `pnpm setup:pages` in `cms/` (not `pnpm setup`, which is a pnpm built-in). It's idempotent: it creates what's missing, re-applies field rules, uploads images from `cms/seed/` only once, and seeds content only into empty collections, so it never overwrites edits. Change those collections by editing the script and re-running it, not only in the admin UI.
- **`cms/data.db` is binary and can't be merged.** If it conflicts, take the other side's file, start the CMS and run `pnpm setup:pages`; this restores the home and recruitment collections and their seed content. Edits made in the CMS since the seed are only in the database file, so coordinate who changes the database when.
- **Adding another collection:** prefer extending the setup script (or a similar one) over clicking it together in the admin, then add a fetcher in `src/lib/api/`. If you do create it in the admin, grant the Public policy `read` and commit `cms/data.db` and new files in `cms/uploads/`.
- **Every file in the CMS is public.** The Public policy can read `directus_files` (image fields and `/assets/<id>` need it), so anyone can list and download every upload. This edition of Directus doesn't allow per-file or per-folder permission rules (`custom_permission_rules_enabled` is a licensed feature), so access can't be narrowed. Upload only material meant for the website; never CVs, applications or internal documents. The setup script puts this warning on the file library (in Polish), and a licensed Directus with folder-scoped rules is the way to lift the restriction.
- `cms/.env.example` holds local development credentials only (`ADMIN_PASSWORD="1234"`); never reuse them for a deployed CMS.

## Conventions

- **Read [`docs/design-system.md`](docs/design-system.md) before any UI work.** It defines tokens, type scale, motion, the component libraries in use and the patterns already on the pages. Reuse them instead of inventing new ones.
- **Content must be real.** Copy and claims come from the team or from the original site (scorpio.pwr.edu.pl). Do not invent achievements, numbers, dates or quotes. If you write new copy, flag it for the team to confirm.
- **Polish UI copy.** No em dashes (`—`) or en dashes (`–`) in visible text; use a comma, a period or a hyphen. Use a non-breaking space (`\u00A0` in strings) to keep tokens together (e.g. `"2\u00A0listopada"`).
- **Icons:** use Phosphor in app code (`import { ArrowRightIcon } from "@phosphor-icons/react"`, `Icon`-suffixed names). Leave lucide inside `components/ui`, which shadcn generates (`components.json` has `iconLibrary: "lucide"`). Migrating old pages to Phosphor is welcome but not required.
- **Client boundaries:** anything using Motion, browser APIs or state needs `"use client"`. Keep it in leaf components where practical.
- **Images:** use `next/image` with a correct `sizes`. Content images come from the CMS through `cmsImageLoader` (see above). Static site assets (logo, icons) stay in `public/`.
- **Full-width sections:** wrap in `FullBleedSection`. It uses `overflow-hidden`, which breaks `position: sticky` inside it; use a plain section if you need sticky.
- **Server HTML is the final content.** Nothing visible may depend on JavaScript to appear:
  - Intro animations above the fold are CSS keyframes (`motion-safe:animate-clip-reveal`, `-zoom-out`, `-rise-in`, `-fade-up`, `-collage-in` in `globals.css`), which run from the server HTML and end visible.
  - Scroll reveals use `useScrollReveal` (via `Reveal`): visible on the server, hidden only if still below the viewport after hydration.
  - Scroll-linked styles (e.g. the manifesto lighting) apply only after hydration; counters render their real value (`useCountUp`).
  - Don't use Motion `initial` states that hide content, except inside `AnimatePresence initial={false}`.
- **Recruitment open/closed:** call `useRecruitmentStatus(deadline, serverIsOpen)` once per page and pass the result down, so every section switches together.
- **Accessibility:** honour `prefers-reduced-motion` with `usePrefersReducedMotion()` (not Motion's `useReducedMotion()`, which reads the media query during hydration and causes mismatches when styles depend on it) or `motion-reduce:` / `motion-safe:` variants. Interactive things are real `<button>`s or `<a>`s with labels. Don't put key handlers or `tabIndex` on non-interactive elements.
- **Easing:** use `EASE_OUT_EXPO` (`src/lib/motion.ts`) in Motion, `ease-out-expo` in Tailwind and `var(--ease-out-expo)` in CSS; don't redefine the curve.
- **Recruitment links:** link to `/recruitment` only when `isRecruitmentAvailable()` is true (the layout passes it to the navbar and footer; the home page derives it from `getRecruitmentDeadline()`), so no link leads to an empty page.
- **Theme:** the site is dark-only. Tokens are defined once in `:root`; there is no light theme.

## Lint rules that bite

`@solvro/config` enables strict `typescript-eslint`, `unicorn` and `jsx-a11y` rules. These are the ones that have fired in this repo:

- `unicorn/prevent-abbreviations`: no `ref`-style names like `tabRefs`, `i`, `src` for variables. Use `tabReferences`, `index`, `source`. (`ref` as a JSX prop is fine.)
- `unicorn/prefer-switch`: three or more `else if` on the same value must be a `switch`.
- `unicorn/new-for-builtins`: `Array.from({ length })` instead of `Array(n)`.
- `@typescript-eslint/no-import-type-side-effects`: `import type { X } from "y"`, not `import { type X }`.
- `react-you-might-not-need-an-effect/no-initialize-state`: don't `setState` from `useEffect` to read browser values; use `useSyncExternalStore` (see `useDaysLeft` in `recruitment/recruitment-hero.tsx`).
- `jsx-a11y/no-noninteractive-element-interactions`, `no-noninteractive-tabindex`, `interactive-supports-focus`: put key handlers on the buttons themselves, not on wrappers or `role="tablist"` containers.
- `import/no-named-as-default`: prefer a library's named export when it has one.
- `unicorn/prefer-query-selector`: `document.querySelector("#id")` (escape user input with `CSS.escape`).
- `unicorn/no-await-expression-member`: assign the awaited value first, then read its property.
- `unicorn/consistent-function-scoping`: helpers that don't use outer variables go at module level.
- `@typescript-eslint/no-unnecessary-condition`: with array destructuring, TypeScript assumes elements exist; use `.at(index)` when an element can be missing.
- `react-you-might-not-need-an-effect/*`: external state such as `location.hash` belongs in `useSyncExternalStore`, not in state set from an effect (see `department-explorer.tsx`).

`eslint .` also lints Node scripts such as `cms/scripts/*.mjs`.

Code pulled from shadcn or Magic UI registries usually needs these fixes after installing.

## Adding UI components

1. Check `src/components/ui` first.
2. Prefer an existing library component (shadcn, Magic UI or another registry compatible with `components.json`) over hand-rolling: `npx shadcn@latest add <name-or-registry-url>`.
3. After installing, review the diff: registries may add unrelated CSS to `globals.css` (e.g. a `@custom-variant dark` line) and code that fails the lint rules above.
4. Don't add a dependency for something an existing one already covers (Motion for animation, Embla for carousels, Base UI `Dialog` for modals).

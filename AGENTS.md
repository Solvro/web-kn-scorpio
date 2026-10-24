# AGENTS.md

Guide for anyone (human or coding agent) working in this repository. Tool-specific files such as `CLAUDE.md` only point here, so keep this file as the single source of truth.

## Project

Website of **Koło Naukowe Scorpio** (Wrocław University of Science and Technology), the student team that builds Mars rovers. Built by [Solvro](https://solvro.pwr.edu.pl/). The site is in **Polish**; code, comments and docs are in English.

The content currently lives in `temporary-data.ts` files next to the pages that use them. There is no CMS or API yet.

## Commands

Package manager: **pnpm** (see `packageManager` in `package.json`). Do not use npm or yarn. A stray `package-lock.json` exists in the repo; ignore it and don't update it.

| Task             | Command                             |
| ---------------- | ----------------------------------- |
| Install          | `pnpm install`                      |
| Dev server       | `pnpm dev` (http://localhost:3000)  |
| Production build | `pnpm build`                        |
| Lint             | `pnpm lint`                         |
| Type check       | `pnpm types:check`                  |
| Format           | `pnpm format` / `pnpm format:check` |

CI (`.github/workflows/ci.yml`) runs commitlint (on PRs), `format:check`, `build` and `lint`. Run `pnpm format:check && pnpm lint && pnpm types:check` before pushing.

## Git

- Branch off `main` as `type/short-description` (e.g. `feat/recruitment-page`). Never push to `main` directly.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `build:`), enforced by commitlint in a Husky `commit-msg` hook.
- `pre-commit` runs `lint-staged` (Prettier on staged files).

## Stack

- **Next.js 16** (App Router, Turbopack, `typedRoutes: true`) and **React 19**
- **TypeScript**, strict
- **Tailwind CSS v4** (CSS-first config in `src/app/globals.css`, no `tailwind.config`), plus `tw-animate-css`
- **shadcn/ui** on **Base UI** (`@base-ui/react`), style `base-vega`. Components live in `src/components/ui` and are owned code.
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
    page.tsx, client.tsx     Home page: client.tsx composes the *-section.tsx files
    *-section.tsx            Home page sections (hero, manifesto, rover, field gallery, ...)
    temporary-data.ts        Home page content (rovers, photos, projects, departments, news)
    recruitment/             Recruitment page (hero, department explorer, data)
    contact/, news/, team/, projects/, partners/, successes/
  components/
    ui/                      shadcn / Base UI primitives (owned, edit freely)
    navbar/, footer/         Site chrome
    full-bleed-section.tsx   Breaks a section out of the max-w-7xl layout wrapper
    reveal.tsx               Fade-up-on-scroll wrapper (IntersectionObserver)
  hooks/                     use-in-view, use-count-up
  lib/utils.ts               cn() = twMerge(clsx())
public/
  images/                    Optimised photos downloaded from the original site
  rovers/                    Rover renders and line art; rovers/cut/ = transparent, trimmed versions used on the site
docs/
  design-system.md           Visual language, tokens, motion, components, patterns
```

Page pattern: `page.tsx` is a Server Component that exports `metadata` and renders a `client.tsx` (`"use client"`) that composes sections. Keep data in the page's `temporary-data.ts`, not inline in components.

## Conventions

- **Read [`docs/design-system.md`](docs/design-system.md) before any UI work.** It defines tokens, type scale, motion, the component libraries in use and the patterns already on the pages. Reuse them instead of inventing new ones.
- **Content must be real.** Copy and claims come from the team or from the original site (scorpio.pwr.edu.pl). Do not invent achievements, numbers, dates or quotes. If you write new copy, flag it for the team to confirm.
- **Polish UI copy.** No em dashes (`—`) or en dashes (`–`) in visible text; use a comma, a period or a hyphen. Use ` ` to keep tokens together (e.g. `"2 listopada"`).
- **Icons:** use Phosphor in app code (`import { ArrowRightIcon } from "@phosphor-icons/react"`, `Icon`-suffixed names). Leave lucide inside `components/ui`, which shadcn generates (`components.json` has `iconLibrary: "lucide"`). Migrating old pages to Phosphor is welcome but not required.
- **Client boundaries:** anything using Motion, browser APIs or state needs `"use client"`. Keep it in leaf components where practical.
- **Images:** use `next/image` with a correct `sizes`. Local files go in `public/images`. Remote images are only allowed from `www.scorpio.pwr.edu.pl` (`next.config.ts`).
- **Full-width sections:** wrap in `FullBleedSection`. It uses `overflow-hidden`, which breaks `position: sticky` inside it; use a plain section if you need sticky.
- **Accessibility:** honour `prefers-reduced-motion` (Motion's `useReducedMotion()`, or `motion-reduce:` / `motion-safe:` variants). Interactive things are real `<button>`s or `<a>`s with labels. Don't put key handlers or `tabIndex` on non-interactive elements.
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

Code pulled from shadcn or Magic UI registries usually needs these fixes after installing.

## Adding UI components

1. Check `src/components/ui` first.
2. Prefer an existing library component (shadcn, Magic UI or another registry compatible with `components.json`) over hand-rolling: `npx shadcn@latest add <name-or-registry-url>`.
3. After installing, review the diff: registries may add unrelated CSS to `globals.css` (e.g. a `@custom-variant dark` line) and code that fails the lint rules above.
4. Don't add a dependency for something an existing one already covers (Motion for animation, Embla for carousels, Base UI `Dialog` for modals).

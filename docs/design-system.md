# Design system

How the Scorpio site looks and moves, and why. It describes what the code does today; if you change a token or pattern, update this file in the same PR.

## Direction

**Expedition / field engineering.** Real photography of rovers in the desert, dark surfaces, one burnt-orange accent taken from the rovers' 3D-printed parts. The site should feel like the team's own documentation of the work, not a generic tech landing page.

- Audience: students deciding whether to join, plus partners and sponsors.
- Photos do the talking. Every major section has a real image or a rover render; avoid text-only sections and decorative illustration.
- Motion explains something (a reveal, a change of state, a sense of depth). If an animation has no reason, leave it out.

Working dials, for reference when adding sections: variance 8/10 (asymmetric, varied layouts), motion 7/10 (scroll-linked, but no scroll hijacking), density 4/10 (airy).

## Tokens

All tokens are CSS variables in `src/app/globals.css` (`:root`), exposed to Tailwind through `@theme inline`. The site is **dark-only**.

### Colour

| Token                  | Value                   | Use                                                       |
| ---------------------- | ----------------------- | --------------------------------------------------------- |
| `--background`         | `oklch(0.18 0.005 285)` | Page background (near-black, slightly cool)               |
| `--foreground`         | `oklch(0.985 0 0)`      | Headlines, primary text                                   |
| `--muted-foreground`   | `oklch(0.7 0.01 285)`   | Body copy, captions                                       |
| `--card`               | `oklch(0.22 0.005 285)` | Raised surfaces (featured news card, active tab)          |
| `--primary`            | `oklch(0.58 0.22 38.5)` | The single accent: CTAs, highlighted words, active states |
| `--primary-foreground` | `oklch(0.985 0 0)`      | Text on primary                                           |
| `--secondary`          | `oklch(0.27 0.01 38.5)` | Warm dark tint (gradient end on the farming tile)         |
| `--accent`             | `oklch(0.28 0.03 38.5)` | Hover tint                                                |
| `--border`             | `oklch(1 0 0 / 12%)`    | Hairlines, outlines                                       |

Rules:

- **One accent.** Orange is the only saturated colour. Don't introduce a second accent (no blue links, no green badges).
- Text over photos uses `text-foreground` or `text-foreground/80`, never `text-primary`: orange disappears over desert photos.
- Photo legibility comes from scrims, not text shadows: `bg-linear-to-t from-background via-background/50 to-transparent` (plus `bg-linear-to-r from-background/70` on desktop when text sits on the left).
- Shadows are tinted with the background hue (`oklch(0.1 0.005 285 / 0.8)`), never pure black.

### Typography

One family: **Space Grotesk** (`next/font/google`, `--font-sans`). Monospace (`font-mono`) appears only for years in the rover carousel.

| Role                 | Classes                                                                      |
| -------------------- | ---------------------------------------------------------------------------- |
| Hero headline        | `text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tighter leading-[1.05]` |
| Section heading (h2) | `text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter`                |
| Card / item heading  | `text-2xl sm:text-3xl font-bold tracking-tight`                              |
| Lead paragraph       | `text-base sm:text-lg leading-relaxed text-muted-foreground max-w-xl`        |
| Caption              | `text-sm text-muted-foreground` (`text-xs` on phones in dense rows)          |
| Eyebrow              | `text-sm font-semibold tracking-[0.2em] uppercase text-primary`              |

- Emphasis inside a headline is a colour change to `text-primary` in the same font ("Budujemy łaziki na **Marsa.**"), never a different font.
- **Eyebrows are rationed:** at most one per three sections. On the home page only the hero and the departments section have one.
- Headlines should fit in two lines on desktop. If they don't, cut the copy or reduce the size.

### Shape

`--radius: 0.5rem`. Scale: `rounded-sm` / `md` / `lg` (= radius) / `xl`.

| Element                                                    | Radius                           |
| ---------------------------------------------------------- | -------------------------------- |
| Photos, image cards, bento tiles, tab highlight            | `rounded-lg`                     |
| Text buttons (shadcn `Button`)                             | `rounded-md` (component default) |
| Icon-only buttons (carousel arrows, row arrows, zoom hint) | `rounded-full`                   |
| Status chip (recruitment countdown), inline pill photos    | `rounded-full`                   |

### Spacing and layout

- Content width: `mx-auto max-w-7xl px-4 sm:px-6`. The root layout already wraps pages in `max-w-7xl`; break out with `FullBleedSection` for full-width backgrounds.
- Section rhythm: `py-24 lg:py-32` (larger, `lg:py-40`, for the manifesto).
- Heading-to-content gap: `mt-10` to `mt-12`.
- Full-height sections use `h-[100dvh]` / `min-h-[85dvh]`, never `h-screen`.
- Every multi-column layout collapses to one column below `md` (768px) and is declared in the same component.

## Motion

Library: **Motion** (`motion/react`). Simple enter-on-scroll uses the CSS-based `Reveal` component.

| Token                                     | Value                                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Signature easing                          | `[0.16, 1, 0.3, 1]` (expo-out), `EASE_OUT` in components; `ease-[cubic-bezier(0.16,1,0.3,1)]` in Tailwind |
| `Reveal`                                  | fade + `translate-y-8` to `0`, 700 ms, `ease-out`, `delay` prop for stagger (typically 70-150 ms steps)   |
| Springs (indicators, tilt, cursor follow) | `stiffness` 120-380, `damping` 18-34                                                                      |
| Modal open / close                        | 600 ms / 300 ms, overlay 500 ms                                                                           |

Patterns in use, with the reason each exists:

| Pattern                                | Where                                  | Why                                                                            |
| -------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| Clip-path reveal + word stagger        | Hero                                   | First impression: the photo opens up and the headline arrives in reading order |
| Scroll-linked zoom/parallax            | Hero, closing CTA, recruitment collage | Depth; pulls the eye into the photo                                            |
| Scroll-linked word lighting            | Manifesto                              | Paces a long sentence so it's read, not skimmed                                |
| Count-up numbers                       | Stats                                  | Draws attention to the three key figures once visible                          |
| Directional slide + blur swap, 3D tilt | Rover carousel                         | Communicates "next/previous generation"; tilt gives the renders physicality    |
| `layoutId` sliding indicator           | Rover timeline, recruitment tabs       | Shows where the selection moved from and to                                    |
| Opposing marquees                      | "W terenie" gallery                    | Breadth of field photos without asking for interaction                         |
| Cursor-following preview               | Departments list                       | Connects each department name to a real photo of that team                     |
| Self-drawing connector                 | "Jak dołączyć"                         | Reads the three steps as one sequence                                          |

Rules:

- Animate only `transform`, `opacity`, `filter` and `clip-path`.
- Continuous values (pointer, scroll) go through `useMotionValue` / `useScroll` / `useTransform`, never `useState`. No `window.addEventListener("scroll")`.
- **Reduced motion is mandatory:** check `useReducedMotion()` and fall back to opacity-only or static. CSS animations use `motion-reduce:` / `motion-safe:`. The marquee pauses under reduced motion.
- At most one marquee section per page.

## Component libraries

What the UI is built from. Reach for these before writing a component from scratch, and don't add a library that duplicates one listed here.

| Library                                                         | Version                               | Role                                                                                                                                          | Where                                                            |
| --------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [shadcn/ui](https://ui.shadcn.com)                              | style `base-vega` (`components.json`) | Source of the UI primitives. Code is copied into the repo and owned, not imported from a package                                              | `src/components/ui/*` (all files except `marquee.tsx`)           |
| [Base UI](https://base-ui.com) (`@base-ui/react`)               | ^1.8                                  | Headless, accessible primitives under the shadcn components (Dialog, Button, Tabs, Select, Menu, ...)                                         | Imported by `src/components/ui/*`                                |
| [Magic UI](https://magicui.design)                              | registry                              | Animated components, installed through the shadcn CLI                                                                                         | `src/components/ui/marquee.tsx` (`Marquee`, used by "W terenie") |
| [Motion](https://motion.dev) (`motion/react`)                   | ^14.1                                 | All JS animation: scroll-linked effects, `AnimatePresence`, `layoutId`, springs, drag                                                         | Home and recruitment sections                                    |
| [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) | ^1.4                                  | CSS enter/exit utilities (`animate-in`, `fade-in-0`, `zoom-in-95`, `blur-in-sm`) used by Base UI overlays                                     | `globals.css`, `dialog.tsx`, `sheet.tsx`, ...                    |
| [Embla Carousel](https://www.embla-carousel.com)                | ^8.6                                  | Carousel engine behind shadcn `Carousel`                                                                                                      | `src/components/ui/carousel.tsx`                                 |
| [Phosphor Icons](https://phosphoricons.com)                     | ^2.1                                  | Icon set for app code (`*Icon` names, `weight="bold"` for UI)                                                                                 | Sections, footer                                                 |
| [Lucide](https://lucide.dev)                                    | ^1.16                                 | Icon set that shadcn generates into primitives (`iconLibrary: "lucide"`); also older pages                                                    | `src/components/ui/*`, navbar, contact, team                     |
| [class-variance-authority](https://cva.style)                   | ^0.7                                  | Variant definitions (`buttonVariants`, `badgeVariants`)                                                                                       | `src/components/ui/*`                                            |
| `cn` / `tailwind-merge` + `clsx`                                | ^0.3 / ^3.6                           | Class merging. Primitives import `cn` from the `cn` package; app code uses `@/lib/utils` (`twMerge(clsx())`). Both resolve Tailwind conflicts | Everywhere                                                       |

Installed but not imported anywhere in `src` (candidates for removal): `radix-ui`, `@radix-ui/react-slot`, `@base-ui-components/react` (the pre-1.0 Base UI package).

Other dependencies (`@tanstack/react-query`, `@tanstack/react-table`) are data utilities, not part of the visual system.

### Adding components

- shadcn primitive: `npx shadcn@latest add <name>`. It uses the `base-vega` style and Base UI automatically.
- Magic UI (or any shadcn-compatible registry): `npx shadcn@latest add "https://magicui.design/r/<name>"`.
- After adding, review the diff: registries can append unrelated CSS to `globals.css` (the Magic UI install added a `@custom-variant dark` line, which was removed because the site has no theme switch), and their code often needs fixes to pass `@solvro/config` lint (see `AGENTS.md`).
- Evaluated and not used: Aceternity UI "Infinite Moving Cards" (testimonial-oriented, JS-cloned DOM; Magic UI `Marquee` covers it), `embla-carousel-auto-scroll` (extra plugin for the same effect), `yet-another-react-lightbox` (gallery navigation was not wanted; the photo modal uses the existing `Dialog`).

## Components

Primitives in `src/components/ui` (shadcn on Base UI, owned code): `Button`, `Badge`, `Card`, `Dialog`, `Sheet`, `Tabs`, `Carousel` (Embla), `Marquee` (Magic UI), and more. Check there before building anything.

Local adjustments to note:

- `DialogContent` accepts `overlayClassName` (added for the photo modal's stronger backdrop).
- `Marquee` pauses under `prefers-reduced-motion` and was edited to pass lint.

Site components: `FullBleedSection`, `Reveal`, `Navbar`, `Footer`, `Logo`, `ScrollToTop`. Hooks: `useInView`, `useCountUp`.

Buttons:

- Primary CTA: `<Button size="lg" className="h-12 px-6 text-base">` with a Phosphor arrow that nudges right on hover (`group-hover/button:translate-x-1`).
- Secondary over photos: `variant="outline"` with `bg-background/40 backdrop-blur-md` so it stays legible.
- One label per intent across a page: "Dołącz do nas" (go to recruitment), "Wyślij zgłoszenie" (open the form), "Napisz do nas" (email).
- Links rendered as buttons use `nativeButton={false}` with `render={<Link ... />}` (Base UI API).

## Page patterns

Each section uses a different layout family; don't repeat one on the same page.

### Home (`src/app/client.tsx`)

1. **Hero** (`hero-section.tsx`): full-bleed desert photo, bottom-left copy, two CTAs.
2. **Manifesto** (`manifesto-section.tsx`): one large paragraph with inline pill photos, then three stats.
3. **Rover generations** (`rover-section.tsx`): single-stage carousel with an outlined generation mark behind the rover and a timeline rail.
4. **W terenie** (`field-gallery-section.tsx`): two marquees in opposite directions, equal 3:2 cards, click opens a single-photo modal.
5. **Nie tylko łazik** (`projects-section.tsx`): 4-2 / 2-4 bento with image tiles and one solid orange tile.
6. **Departments** (`departments-section.tsx`): large-type rows with a cursor-following photo, linking to `/recruitment#<slug>`.
7. **News** (`news-section.tsx`): one featured card plus three compact rows.
8. **Closing CTA** (`join-section.tsx`): full-bleed river photo with parallax.

### Recruitment (`src/app/recruitment/client.tsx`)

1. **Hero** (`recruitment-hero.tsx`): copy with live countdown chip on the left, tilted photo collage on the right. When the deadline passes, the chip reads "Rekrutacja zakończona" and the form CTA is hidden.
2. **Jak dołączyć**: three steps on a self-drawing line.
3. **Department explorer** (`department-explorer.tsx`): accessible tabs (arrow keys, Home/End) and an animated panel. Deep-linkable via the URL hash.
4. **Co zyskujesz**: three-tile photo bento.
5. **Closing band**: full-width orange band with deadline and CTAs.

## Imagery

- Real photos only, from the team or the original site (scorpio.pwr.edu.pl).
- Store optimised copies in `public/images` (about 1600-2880 px wide, JPEG quality 82). `next/image` produces the responsive sizes.
- Rover images: use `public/rovers/cut/*` (transparent, trimmed). The old generations are line art, the newer ones renders; both float on the dark background.
- No text or pills overlaid on photos except headings on purpose-built tiles with a scrim. Captions go below the image.

## Copy

- Polish, plain and specific. Concrete facts beat adjectives.
- No em/en dashes in visible text.
- No invented numbers, dates, awards or quotes. Anything not taken from the team or the original site needs the team's confirmation before it ships.
- No scroll cues ("Przewiń w dół"), section numbers ("01 / O nas"), or decorative status dots.

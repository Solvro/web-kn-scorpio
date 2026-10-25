# 🚀 KN Scorpio

Website of Koło Naukowe Scorpio, the Wrocław University of Science and Technology student team building Mars rovers.

## Docs

- [AGENTS.md](AGENTS.md): commands, structure and conventions (for people and coding agents)
- [docs/design-system.md](docs/design-system.md): visual language, tokens, motion, component libraries

## Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

## Prerequisites

- Node.js 22+
- pnpm (via Corepack)
- Directus CMS dependencies in the `cms/` folder

## Run the project

### 1) Install dependencies

```bash
git clone git@github.com:Solvro/web-kn-scorpio.git
cd web-kn-scorpio
corepack enable
pnpm install
```

### 2) Start Directus CMS

```bash
cd cms
cp .env.example .env
pnpm install
pnpm dev
```

Directus runs at http://localhost:8055.

### 3) Start the website

In a second terminal:

```bash
cd /path/to/web-kn-scorpio
cp .env.example .env
pnpm dev
```

The app runs at http://localhost:3000.

### Environment notes

- The website reads the CMS URL from `NEXT_PUBLIC_DIRECTUS_URL` in the root `.env` file.
- Default value is `http://localhost:8055` when the variable is not set.
- The CMS server config is stored in `cms/.env` and should include:

```env
PUBLIC_URL="http://localhost:8055"
CORS_ENABLED="true"
CORS_ORIGIN="true"
```

## Contributing

1. Fork the repo, branch off `main` as `type/short-description` (e.g. `feat/course-filters`, `fix/login-redirect`)
2. Commit using [Conventional Commits](https://docs.solvro.pl/git-github/solvro#nazewnictwo-commit%C3%B3w) (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `build:`) — commitlint enforces this
3. Push to your fork, open a PR — CI runs checks automatically
4. Never push directly to `main`

Full workflow: [Solvro GitHub Handbook](https://docs.google.com/document/d/1Sb5lYqYLnYuecS1Essn3YwietsbuLPCTsTuW0EMpG5o/edit?usp=sharing)

## Contributors

[![Contributors](https://contrib.rocks/image?repo=Solvro/web-kn-scorpio)](https://github.com/Solvro/web-kn-scorpio/graphs/contributors)

## Contact

📧 [kn.solvro@pwr.edu.pl](mailto:kn.solvro@pwr.edu.pl) · 🌐 [solvro.pwr.edu.pl](https://solvro.pwr.edu.pl/) · 📘 [Facebook](https://www.facebook.com/knsolvro)

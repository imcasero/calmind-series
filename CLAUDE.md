# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

**Calmind Series** — a competitive Pokémon tournament platform (Spanish UI, retro
pixel aesthetic). Dual-league ecosystem (Primera / Segunda División) with a
promotion/relegation play-off ("El Olimpo"). Built on **Next.js 16.1.1 (App
Router) + React 19.2.3 + Supabase**. Package manager **pnpm**, lint/format **Biome**.

> This is a **live, data-backed app**, not a static template. Business logic
> (scoring, ranking, tie-breaks) lives in **Postgres views/functions inside
> Supabase** — see `docs/DATABASE_ARCHITECTURE.md`. The frontend is a "thin
> client" that reads those views.

## Commands

- `pnpm dev` — dev server (Turbopack)
- `pnpm build` — production build
- `pnpm check` — Biome lint + format (auto-fix)
- `pnpm lint` — Biome check (no fix)
- `./init.sh` — **harness guardian: run before any task** (deps, env, typecheck, lint, build)

## Layout (`src/`, import alias `@/*`)

- `app/` — App Router. Public: `[season]/[split]` (+ `cruces`, `final`).
  Admin: `admin/` (login) + `admin/dashboard/*/_components/*Manager.tsx`.
- `lib/queries/` — server-side Supabase reads, wrapped in `react.cache`.
- `lib/types/schemas.ts` — **single source of truth**: Zod schemas + `z.infer` types.
- `lib/supabase/` — `server.ts` (RSC / actions) and `client.ts` (browser).
- `lib/services/`, `lib/utils/`, `lib/constants/`, `lib/config/env.ts`.
- `components/` — by domain: `divisions/`, `cross/`, `home/`, `shared/`, `admin/`.
- `proxy.ts` — auth middleware (Next 16 renamed `middleware.ts` → `proxy.ts`).

## Conventions (full list in `docs/conventions.md`)

- **Server Components by default**; push `'use client'` to the leaves.
- **Types derive from `schemas.ts`** via `z.infer`. Do not redefine a query's
  return shape locally (see `ARCHITECTURE_REVIEW.html` §1.2 for the bug this caused).
- DB columns are **snake_case**; UI shapes are **camelCase** (mapped in queries).
- Queries return `[]` / `null` on error and log `[fnName] Error:` — never throw to the UI.
- Spanish for UI copy; English for code identifiers.

## Active work — Architecture Review (SDD harness)

The current initiative is the refactor in `ARCHITECTURE_REVIEW.html`, tracked via
a spec-driven workflow:

- `features.json` — phased backlog (Fase 0–6) with status.
- `specs/` — `requirements.md` (EARS) · `design.md` · `tasks.md` for the active batch.
- `progress/history.md` — running log.
- `.claude/agents/` — `leader` · `spec-author` · `implementer` · `reviewer`.

**Flow:** spec → user approval → implement → review. The Implementer changes code
only from an approved spec. The Reviewer rejects changes that lack verification
(a green `./init.sh`).

## Docs

`docs/PRODUCT.md` · `docs/ARCHITECTURE.md` · `docs/DATABASE_ARCHITECTURE.md` ·
`docs/TOURNAMENT_FLOW.md` · `docs/DATA_INTEGRATION.md` · `docs/UI_STATES.md` ·
`docs/conventions.md`

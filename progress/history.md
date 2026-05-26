# Progress log

Running log of the SDD harness. Newest entries on top. The Leader appends here on every
status transition; agents record any deferral or sequencing decision here too.

---

## 2026-05-26 — Harness bootstrapped

Generated the engineering harness (skill: `harness-builder`) for the Architecture
Review initiative.

**Created**
- `init.sh` — guardian (tooling · deps · env · typecheck · lint · build; tests skipped, none yet).
- `features.json` — backlog of Fase 0–6 from `ARCHITECTURE_REVIEW.html`. Active batch: F0, F1 (`spec_ready`).
- `specs/requirements.md` (EARS) · `specs/design.md` · `specs/tasks.md` — F0 + F1.
- `.claude/agents/` — `leader`, `spec-author`, `implementer`, `reviewer`.
- `docs/conventions.md` — patterns extracted from the codebase.
- Rewrote `CLAUDE.md` (155 → ~70 lines): corrected stale "static template / `app/`" description to the real `src/` + Supabase + Next 16 architecture.

**Verified against source (not just the review)**
- `LeagueInfo` divergence is real: `schemas.ts:80` infers `tier_name`/`tier_priority`; `queries.types.ts:83` uses `tierName`/`tierPriority`.
- `src/app/admin/page.tsx:31` calls `redirect()` in a client handler — confirmed bug.
- `src/lib/data/fetchData.ts` mixes `unstable_cache` + `react.cache`, tag `['matches']` never revalidated — confirmed.
- Stack confirmed: Next.js **16.1.1**, React **19.2.3**.

**Baseline check (`./init.sh --quick`)**
- Typecheck: ✅ clean (`tsc --noEmit`).
- Lint: ❌ `pnpm lint` (`biome check .`) reports **2 errors + 35 warnings**. The 2 errors
  are **formatting-only** (auto-fixable); the 35 warnings are `noUnusedImports` /
  `noUnusedVariables`, mostly in F2 dead-code targets (`PerformanceMonitor.tsx`,
  `useOptimizedFetch.ts`, `fetchData.ts`, `matchService.ts`).
- Build: not run yet (`--quick`).
- **Implication:** baseline is not green. Quickest path: `pnpm check` (auto-fix format +
  safe lint). Most warnings dissolve naturally when F2 deletes the dead files. Decision
  on whether to green it now vs. during F2 left to the user.

**Open decisions / notes**
- REQ-9 (`noExplicitAny: error`) may need F2 first if existing `any` breaks lint — decide at implementation time.
- REQ-5: confirm whether Next 16.1.1 PPR is `experimental.ppr` or Cache Components (`cacheComponents`) before editing `next.config.ts`.

**Next action:** present `specs/` (F0+F1) to the user for approval, then hand to `implementer`.

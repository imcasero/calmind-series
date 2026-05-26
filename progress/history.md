# Progress log

Running log of the SDD harness. Newest entries on top. The Leader appends here on every
status transition; agents record any deferral or sequencing decision here too.

---

## 2026-05-26 — Editor↔Biome formatting drift fixed + Zed aligned

User reported Zed warnings (e.g. "next/navigation not found"). Investigated:

- **"next/navigation not found"** — NOT a code error. `tsc --noEmit` is clean and the
  module resolves on disk. Cause: stale TS language server. Adding
  `babel-plugin-react-compiler` changed the pnpm virtual-store hash dir for `next`
  (`next@16.1.1_babel-plugin-react-compiler@1.0.0_...`), so an LS started before the
  install had the old path cached. Fix = restart the language server in Zed.

- **Tree had drifted RED**: `pnpm lint` exited 1 with **5 format errors** (double quotes
  vs Biome's single-quote config) in `next.config.ts`, `cruces/page.tsx`,
  `RegulationsManager.tsx`, `PlayoffBracket.tsx`, `TournamentFormat.tsx`.
  `TournamentFormat.tsx` was never content-edited by any agent → confirms an **external
  formatter (Zed format-on-save, Prettier-style double quotes)** reformatted files,
  fighting Biome. (Corrects the earlier "green" sign-off — the tree drifted post-review.)
  Fixed with `biome format --write .` (formatting only; the 35 F2 warnings untouched).

- **Root-cause fix:** added `.zed/settings.json` pointing Zed at Biome as formatter with
  `format_on_save`, and `source.fixAll`/`organizeImports` set to **false** (so save only
  reformats; it does NOT strip unused imports — that stays F2's controlled cleanup).

**Verification:** `tsc --noEmit` 0 errors · `pnpm lint` 0 errors / 35 warnings ·
`./init.sh --quick` green. F0/F1 remain `done`; the 35 warnings remain F2-scheduled.

---

## 2026-05-26 — Batch 1 (F0+F1) reviewed & DONE (reviewer → leader)

**Reviewer verdict: APPROVED.** Ran the full `./init.sh` independently — green
(typecheck clean · lint 35 warnings/0 errors · build OK, 13/13 static pages,
`ƒ Proxy (Middleware)`). Confirmed the 35 warnings are identical to HEAD (no new
ones) by stashing and re-counting (9 `noUnusedImports` + 4 `noUnusedVariables` +
22 `noExplicitAny`).

Each in-scope REQ mapped to evidence and passed:
- REQ-1/2 — `admin/page.tsx` uses `router.push`, no `redirect` import, error branch intact.
- REQ-4 — `next.config.ts:6` `reactCompiler: true` (top-level key, correct for v16);
  `babel-plugin-react-compiler@1.0.0` present; green build = compiler engaged.
- REQ-6 — `images` block has `formats`/`deviceSizes`/`imageSizes` + kept `remotePatterns`.
- REQ-7 — `next.config.optimization.js` absent.
- REQ-8 — `tsconfig.json` target `ES2022`.
- REQ-10 — `proxy.ts` exports `proxyConfig`; Next still pinned `16.1.1` (codemod did not bump).

Deferred items confirmed UNTOUCHED: `biome.json` `noExplicitAny: "warn"` (REQ-9);
no `cacheComponents`/`ppr` (REQ-5); no season-activation RPC (REQ-3). No scope creep,
no convention violations, naming-pass references all resolve.

Only finding: 💡 nitpick — pre-existing unused imports in `cruces/page.tsx` &
`final/page.tsx` (already dead at HEAD; F2 `noUnusedImports` owns them). No action now.

**Leader transition:** `features.json` F0 → `done`, F1 → `done`. `activeBatch` →
`["F2"]` (next ready: F2 and F5 both unblocked by F1; F2 is next by phase order and
already has its naming sub-items done). F2 still `pending` — needs a spec-author run +
user approval before implementation.

---

## 2026-05-26 — Batch 1 (F0+F1) implemented (implementer)

Implemented the approved, narrowed F0+F1 batch. In scope: REQ-1, REQ-2 (F0) ·
REQ-4, REQ-6, REQ-7, REQ-8, REQ-10 (F1). DEFERRED untouched: REQ-3, REQ-5, REQ-9.

**Changes per file**
- `src/app/admin/page.tsx` (REQ-1/REQ-2): replaced `import { redirect }` with
  `import { useRouter }`; added `const router = useRouter()`; `redirect('/admin/dashboard')`
  → `router.push('/admin/dashboard')`. Error branch left untouched (REQ-2 already satisfied).
- `next.config.ts` (REQ-4/REQ-6): added top-level `reactCompiler: true` and
  `poweredByHeader: false`; merged `images.formats: ['image/webp','image/avif']` +
  `deviceSizes` + `imageSizes` into the existing `images` block (kept `remotePatterns`).
  Did NOT add `cacheComponents`/`ppr` (REQ-5 deferred). Did NOT port `swcMinify`,
  `webpack.splitChunks`, the `/api`+`/_next/static` `headers()`, or the Turbopack SVG rule.
- `next.config.optimization.js` (REQ-7): deleted. Confirmed absent.
- `tsconfig.json` (REQ-8): `compilerOptions.target` `"ES2017"` → `"ES2022"`.
  `lib`/`module`/`moduleResolution` unchanged.
- `src/proxy.ts` (REQ-10): manual rename `export const config` → `export const proxyConfig`.
- `package.json` + `pnpm-lock.yaml`: added devDependency `babel-plugin-react-compiler@1.0.0`.

**React Compiler config decision (REQ-4).** Verified against the installed Next 16.1.1
config schema (`node_modules/next/dist/server/config-schema.js`): `reactCompiler` is a
**top-level** key in v16 (stabilized out of `experimental` — the old `optimization.js`
had `experimental.reactCompiler`, the Next 15-era location). Next 16.1.1 hard-throws
`"Failed to load the babel-plugin-react-compiler ... It is required to use the React
Compiler. Please install it."` (`get-babel-loader-config.js`) when `reactCompiler: true`
and the plugin is absent — so the dep is required. Installed `babel-plugin-react-compiler@1.0.0`
(stable `latest`; depends only on `@babel/types ^7.26`; no peer constraints). The clean
build with `reactCompiler: true` is therefore positive proof the compiler is engaged.

**REQ-10 codemod decision.** Used a manual rename rather than `npx @next/codemod@latest
upgrade`: that codemod is interactive AND would bump Next past the pinned 16.1.1. The only
expected effect here is the proxy export rename, which the manual edit achieves. Build
output shows `ƒ Proxy (Middleware)`, confirming the proxy is still picked up.

**SVG rule.** Re-confirmed no `@svgr`/`*.svg`-as-component usage → Turbopack SVG rule not ported.

**Verification — full `./init.sh` (with build) GREEN.** Key lines:
```
✓ typecheck clean
Found 35 warnings.
✓ lint clean              (35 unchanged noUnusedImports/noExplicitAny warns — F2 targets)
▲ Next.js 16.1.1 (Turbopack)
✓ Compiled successfully in 2.4s
✓ Generating static pages using 9 workers (13/13)
ƒ Proxy (Middleware)
✓ build succeeds
✓ Harness ready — baseline is green.
```
`test ! -f next.config.optimization.js` → confirmed absent. `src/proxy.ts` exports `proxyConfig`.

**features.json:** F0/F1 left `in_progress` (NOT set to `done`) — leader transitions to
`done` only after reviewer sign-off. Handing to reviewer.

---

## 2026-05-26 — Naming standardization (F2 slice, pulled forward)

User-driven, done by leader directly (not via the F0+F1 implementer, since it is
outside the approved F0+F1 spec). User first renamed `NormattivaManager` →
`NormativaManager` manually (introduced double-quote formatting that briefly reddened
lint; fixed with `biome format`). User then asked to standardize all component names
to English.

**Decision (user, 2026-05-26):** English for code identifiers; **keep Spanish for
UI copy and route URLs**. Applied now, before the F0+F1 implementer runs.

**Renames (identifiers only — bare Spanish UI text + `/cruces`, `/normativa` URLs untouched)**
- `Cruces*` → `Playoff*`: `CrucesBracket`→`PlayoffBracket` (file `cross/CrucesBracket.tsx`
  → `PlayoffBracket.tsx`), `CrucesDataProvider`→`PlayoffDataProvider`,
  `CrucesPage`→`PlayoffPage`, `CrucesError`→`PlayoffError` (+ `*Props`). Log tag
  `[Cruces Error]`→`[Playoff Error]`.
- `Normativa*` → `Regulations*`: `NormativaManager`→`RegulationsManager` (file renamed),
  `NormativaPage`→`RegulationsPage` (+ `*Props`).
- Typo: dir `components/home/TorunamentFormat/` → `TournamentFormat/` (import in
  `app/page.tsx` fixed). File inside was already `TournamentFormat.tsx`.

**Glossary established:** Cruces ↔ Playoff, Normativa ↔ Regulations. Future code uses
the English identifier; UI strings + URLs stay Spanish.

**Verification:** `./init.sh --quick` green (typecheck clean — all refs resolve; lint
0 errors / 35 warnings, unchanged). `features.json` F2 naming sub-items marked DONE;
rest of F2 still pending (depends on F1).

---

## 2026-05-26 — Batch 1 (F0+F1) approved → in_progress

Leader transition. User approved the F0+F1 spec at the gate, with three scope
decisions captured below. F0 and F1 set `spec_ready` → `in_progress`.

**Approved scope decisions (user, 2026-05-26)**
- **REQ-3 (atomic season RPC) — DEFERRED.** Optional/low-risk; needs Supabase
  migration access. F0 ships only the client-redirect fix. Re-spec later.
- **REQ-5 (PPR / `cacheComponents`) — DEFERRED to F4/F5.** Next 16.1.1 ships PPR as
  Cache Components (`cacheComponents: true`), which is strict — dynamic reads must be
  inside `<Suspense>` (F5) and use the `'use cache'` model (F4). Enabling it in F1
  would break the build. Threaded into F4's items.
- **REQ-9 (`noExplicitAny: error`) — DEFERRED to F2.** Confirmed live `any[]` in
  `SplitDataProvider.tsx:243-244`. Flipping now turns lint red. Threaded into F2's items.
- **Execution mode:** user chose the SDD agent workflow (implementer → reviewer),
  orchestrated by the leader (main thread).

**F1 in-scope after deferrals:** REQ-4 (React Compiler), REQ-6 (WebP/AVIF + image
sizes), REQ-7 (delete `next.config.optimization.js`), REQ-8 (ES2022), REQ-10
(`proxyConfig` rename). REQ-5/REQ-9 removed from this batch.

**Pre-flight findings (leader)**
- `babel-plugin-react-compiler` is **not** installed (not in `package.json` /
  `node_modules`) — implementer installs it if the build requires it for REQ-4.
- No `@svgr` / `*.svg`-as-component usage → the Turbopack SVG rule from
  `optimization.js` is **not** ported.
- `next.config.optimization.js` carries Next 12/13 cruft (`swcMinify`,
  `webpack.splitChunks`, `/api`+`/_next/static` headers) — not ported per `design.md`.

**Baseline greened**
- Was red: `pnpm lint` reported 2 formatting errors (+35 warnings). Ran
  `biome format --write .` → fixed 2 files (`NormattivaManager.tsx`,
  `routes.ts`), cosmetic only. The 35 warnings are non-failing
  (`noUnusedImports`/`noExplicitAny`), all in F2 targets — left for F2.
- `./init.sh --quick` now **green** (typecheck clean · lint 0 errors / 35 warnings ·
  build skipped). Known-good baseline established for the implementer.

**Spec amended** to record the deferrals: `requirements.md` (DEFERRED banners on
REQ-3/5/9), `tasks.md` (scope block + narrowed checklist), `features.json`
(`deferred[]` on F0/F1; inherited items on F2/F4).

**Next action:** invoke `implementer` against the approved, narrowed `specs/`.

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

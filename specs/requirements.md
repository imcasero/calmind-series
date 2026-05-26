# Requirements — Batch 1: Bug fixes + platform activation

> Source: `ARCHITECTURE_REVIEW.html` (Fase 0 + Fase 1). Backlog: `features.json` F0, F1.
> Notation: **EARS** — *When/While/If [condition], the system shall [action].*
> No test runner exists yet, so each requirement names its **verification gate**
> (a check in `./init.sh` or a concrete manual step).

## F0 — Real bugs

### REQ-1 — Client navigation after login
**When** an admin submits valid credentials on the `/admin` login form and Supabase
returns a successful session, **the system shall** navigate to `/admin/dashboard`
using client-side router navigation (`useRouter().push`), **without** throwing an
uncaught redirect exception.
- *Why:* `redirect()` from `next/navigation` works by throwing a special exception
  that only Server Components / Server Actions catch. In a client event handler it
  propagates as a real error. (Review §1.1)
- *Verify:* manual — log in, confirm redirect with no console error; `./init.sh` green.

### REQ-2 — Login error handling preserved
**If** Supabase returns an authentication error on login, **then the system shall**
display the error message and re-enable the form, and **shall not** navigate away.
- *Verify:* manual — submit wrong credentials, error banner shows, form usable.

### REQ-3 — Atomic season activation *(optional, low risk today)*
> **DEFERRED (approved 2026-05-26).** Needs a Supabase Postgres RPC + migration;
> flagged optional/low-risk. F0 ships the redirect fix only. Re-spec when DB
> migration access is in scope.

**While** an admin activates a season, **the system shall** deactivate every other
season and activate the chosen one as a **single atomic operation**, such that a
mid-operation failure never leaves the system with zero active seasons.
- *Why:* two sequential UPDATEs are not atomic. (Review §1.4)
- *Verify:* manual — activate a season, confirm exactly one `is_active = true`.
- *Note:* implement as a Supabase RPC. May be deferred; flagged optional in `features.json`.

## F1 — Activate the platform

### REQ-4 — React Compiler enabled
**The build system shall** enable the React Compiler so eligible components are
memoized automatically at build time.
- *Verify:* `./init.sh` build succeeds; build output reports React Compiler active.

### REQ-5 — Partial Prerendering / Cache Components enabled
> **DEFERRED to F4/F5 (approved 2026-05-26).** In Next 16.1.1 PPR ships as
> Cache Components (`cacheComponents: true`), which is strict: dynamic data access
> must sit inside `<Suspense>`. Those boundaries are F5 (REQ in Fase 5) and the
> `'use cache'` model is F4. Enabling it now breaks the build, so it lands with
> that work — not in this batch.

**The build system shall** enable PPR (or the Next.js 16 Cache Components
equivalent) so static shells are served immediately and dynamic content streams
within `<Suspense>`.
- *Verify:* build succeeds with the feature flag accepted by Next 16.1.1 (exact key
  confirmed in `design.md`); no config-validation error.

### REQ-6 — Modern image formats
**The system shall** serve images in WebP/AVIF using the configured device/image sizes.
- *Verify:* `next.config.ts` declares `images.formats`; build succeeds.

### REQ-7 — Single Next.js config
**When** the project builds, **the system shall** read a single config
(`next.config.ts`); the file `next.config.optimization.js` **shall not** exist.
- *Verify:* `test ! -f next.config.optimization.js`; `./init.sh` green.

### REQ-8 — Modern ES target
**The TypeScript compiler shall** target `ES2022`.
- *Verify:* `tsconfig.json` `compilerOptions.target == "ES2022"`; typecheck clean.

### REQ-9 — `noExplicitAny` is an error
> **DEFERRED to F2 (approved 2026-05-26).** Confirmed live `any` in
> `SplitDataProvider.tsx:243-244` (`j15Matches: any[]`, `j16Matches: any[]`).
> Flipping to `error` now turns lint red. F2 removes the dead code and the `any`,
> so REQ-9 lands at the end of F2.

**If** a source file introduces an explicit `any`, **then** Biome **shall** fail the
check as an **error** (not a warning).
- *Verify:* `biome.json` sets `noExplicitAny: "error"`; `pnpm lint` enforces it.
  *Pre-req:* F2 removes existing `any` usages — if lint goes red here, either fix the
  `any` now or sequence this requirement after F2 (note it in `progress/history.md`).

### REQ-10 — Next.js 16 codemod applied
**The system shall** apply `npx @next/codemod@latest upgrade` so deprecated APIs are
updated and `proxy.ts` uses the canonical `export const proxyConfig` naming.
- *Verify:* `src/proxy.ts` exports `proxyConfig`; `./init.sh` green.

## Out of scope for this batch
Caching unification (F4), admin abstractions (F3), dead-code/type cleanup (F2),
`generateStaticParams` / Suspense (F5). Tracked separately in `features.json`.

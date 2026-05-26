# Design — Batch 1: Bug fixes + platform activation

Maps each requirement in `requirements.md` to concrete files and the pattern to use.
Read alongside `docs/conventions.md`.

## F0.1 — Client redirect (REQ-1, REQ-2)

**File:** `src/app/admin/page.tsx`

- Remove `import { redirect } from 'next/navigation'`.
- Add `import { useRouter } from 'next/navigation'` and `const router = useRouter()`.
- Line 31: `redirect('/admin/dashboard')` → `router.push('/admin/dashboard')`.
- Leave the existing error branch (lines 25–29) untouched — it already satisfies REQ-2.
- `setLoading(false)` is currently never reached on success; that is fine because we
  navigate away. Keep the early-return error path as-is.

**Pattern:** imperative client navigation uses `router.push` / `router.replace`.
`redirect()` is server-only (Server Components / Server Actions).

## F0.3 — Atomic season activation (REQ-3, optional)

**Files:** `src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx:57-81`,
plus a new Supabase RPC.

- Create a Postgres function, e.g. `activate_season(target uuid)`, that runs both
  writes in one transaction (`UPDATE seasons SET is_active = false; UPDATE seasons
  SET is_active = true WHERE id = target;`).
- Replace the two sequential `supabase.from('seasons').update(...)` calls with a
  single `supabase.rpc('activate_season', { target: id })`.
- **Deferral allowed:** low risk today (internal network, single table). If deferred,
  mark REQ-3 as deferred in `progress/history.md` and keep F0 partially done.

## F1 — Platform config (REQ-4..REQ-10)

### The key file: `next.config.ts`

`next.config.optimization.js` is **dead** (never imported). **Do not copy it
verbatim** — it carries Next 12/13-era cruft that is invalid or counter-productive
in Next 16.1.1:

| From optimization.js | Decision in Next 16 |
| --- | --- |
| `experimental.reactCompiler: true` | **Keep** (REQ-4). Verify final key location and whether `babel-plugin-react-compiler` must be installed. |
| `experimental.ppr: true` | **Verify** (REQ-5). In Next 16 PPR ships under **Cache Components** — the flag may be `cacheComponents: true` rather than `experimental.ppr`. Confirm before writing. |
| `images.formats` + `deviceSizes` + `imageSizes` | **Keep / merge** with the existing `images.remotePatterns` block (REQ-6). |
| `experimental.turbo.rules` (SVG loader) | **Move** to top-level `turbopack` (Turbopack is stable in 16). Only keep if SVG-as-component is actually used — grep first; drop if not. |
| `webpack: (config) => { splitChunks … }` | **Drop.** Custom `splitChunks` conflicts with Turbopack and is unnecessary; Next handles chunking. |
| `swcMinify: true` | **Drop.** Removed — minification is on by default. |
| `headers()` for `/api/*` and `/_next/static` | **Drop.** No API routes exist; static immutable caching is automatic. |
| `redirects()` `/home → /` | **Optional.** Keep only if `/home` was ever public. |
| `compress`, `poweredByHeader`, `generateEtags`, `reactStrictMode` | Keep only deliberate non-defaults (`poweredByHeader: false` is reasonable). |

**Authority for exact keys:** confirm React Compiler + PPR/Cache Components syntax
for **16.1.1** against the official config — use the `vercel:nextjs` and
`vercel:next-cache-components` skills rather than memory. Enabling Cache Components
can change rendering semantics (it opts pages into the new caching model), so build
and smoke-test the public routes after the change.

### `tsconfig.json` (REQ-8)
`compilerOptions.target: "ES2017"` → `"ES2022"`. Leave `lib`, `module`,
`moduleResolution: "bundler"` unchanged.

### `biome.json` (REQ-9)
`noExplicitAny: "warn"` → `"error"`. **Sequencing risk:** the codebase still has
`any` (e.g. `SplitDataProvider`, casts). If `pnpm lint` goes red, either resolve the
`any` now or land REQ-9 *after* F2 — record the choice in `progress/history.md`.

### Codemod (REQ-10)
Run `npx @next/codemod@latest upgrade`. Expected effect: `src/proxy.ts`
`export const config` → `export const proxyConfig`. Review the diff before
committing; the codemod may touch more than proxy naming.

## Delete (REQ-7)
After the merge is verified green: `rm next.config.optimization.js`.

## Verification
Run `./init.sh` (full, with build). All of: typecheck clean, lint clean, build
succeeds, `next.config.optimization.js` absent, `proxy.ts` exports `proxyConfig`.

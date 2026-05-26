# Tasks — Batch 1: Bug fixes + platform activation

Atomic checklist for the Implementer. Do **not** start until `./init.sh` is green
and this spec is approved. Check off items as they land; log decisions in
`progress/history.md`.

## Scope for this batch (approved 2026-05-26)
**In:** REQ-1, REQ-2 (F0 redirect fix) · REQ-4, REQ-6, REQ-7, REQ-8, REQ-10 (F1).
**Deferred (do NOT touch this batch):** REQ-3 → future · REQ-5 (`cacheComponents`)
→ F4/F5 · REQ-9 (`noExplicitAny: error`) → F2. See the DEFERRED banners in
`requirements.md`.

## Pre-flight
- [x] Baseline greened by leader (`biome format` fixed 2 files); `./init.sh --quick`
      green (typecheck clean, lint = 0 errors / 35 warnings, build skipped).
- [x] Re-confirm `./init.sh --quick` is still green before editing.

## F0 — Bugs (REQ-1, REQ-2)
- [x] `src/app/admin/page.tsx`: remove `redirect` import; add `import { useRouter } from 'next/navigation'` and `const router = useRouter()`.
- [x] `src/app/admin/page.tsx:31`: `redirect('/admin/dashboard')` → `router.push('/admin/dashboard')`.
- [x] Leave the error branch (lines 25–29) untouched — already satisfies REQ-2.
- [ ] Manually verify: valid login redirects with no console error (REQ-1). *(reviewer/manual smoke — code path is `router.push`)*
- [ ] Manually verify: invalid login shows error, form stays usable (REQ-2). *(reviewer/manual smoke — error branch untouched)*
- [ ] ~~REQ-3 atomic RPC~~ — **DEFERRED** (logged in `progress/history.md`).

## F1 — Platform (REQ-4, REQ-6, REQ-7, REQ-8, REQ-10)
- [x] Confirm exact Next 16.1.1 key for React Compiler (use `vercel:nextjs`). Install the compiler dep if required: `babel-plugin-react-compiler` is **not** in `node_modules` today — `pnpm add -D babel-plugin-react-compiler@latest` if the build needs it. *(Confirmed top-level `reactCompiler` key in Next 16 config schema; installed `babel-plugin-react-compiler@1.0.0` — Next 16.1.1 hard-throws without it.)*
- [x] SVG-as-component: **confirmed not used** (no `@svgr`, no `*.svg` component imports) → do **not** port the Turbopack SVG rule.
- [x] Edit `next.config.ts`: add React Compiler (REQ-4); merge `images.formats` (WebP/AVIF) + `deviceSizes` + `imageSizes` into the existing `images` block (REQ-6). **Do NOT add `cacheComponents`/`ppr` (REQ-5 deferred).**
- [x] Do **not** port `swcMinify`, `webpack.splitChunks`, `/api`+`/_next/static` headers, or the SVG rule. `poweredByHeader: false` is the only optional non-default worth keeping.
- [x] `pnpm build` — confirm config validates and public routes render.
- [x] `rm next.config.optimization.js` (REQ-7).
- [x] `tsconfig.json`: `compilerOptions.target` → `"ES2022"` (REQ-8); leave `lib`/`module`/`moduleResolution` unchanged.
- [ ] ~~`biome.json` `noExplicitAny` → error~~ — **DEFERRED to F2** (`SplitDataProvider.tsx:243-244` has live `any[]`).
- [x] REQ-10: rename `export const config` → `export const proxyConfig` in `src/proxy.ts`. Prefer `npx @next/codemod@latest upgrade`, but it is interactive — a manual rename is acceptable since that is the only expected effect here. Confirm `./init.sh` build still picks up the proxy. *(Manual rename — codemod would bump past pinned 16.1.1. Build shows `ƒ Proxy (Middleware)`.)*

## Done criteria
- [x] Full `./init.sh` green (typecheck + lint + build).
- [x] `next.config.optimization.js` no longer exists.
- [x] `src/proxy.ts` exports `proxyConfig`.
- [ ] `features.json`: F0/F1 left `in_progress` — leader sets `done` after reviewer sign-off (overrides generic instruction).
- [x] Append a dated entry to `progress/history.md`.
- [ ] Reviewer sign-off (see `.claude/agents/reviewer.md`).

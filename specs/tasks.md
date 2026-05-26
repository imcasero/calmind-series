# Tasks — Batch 1: Bug fixes + platform activation

Atomic checklist for the Implementer. Do **not** start until `./init.sh` is green
and this spec is approved. Check off items as they land; log decisions in
`progress/history.md`.

## Pre-flight
- [ ] Run `./init.sh` — confirm green baseline before changing anything.

## F0 — Bugs (REQ-1, REQ-2, REQ-3)
- [ ] `src/app/admin/page.tsx`: swap `redirect` import for `useRouter`; instantiate `router`.
- [ ] `src/app/admin/page.tsx:31`: `redirect(...)` → `router.push('/admin/dashboard')`.
- [ ] Manually verify: valid login redirects with no console error (REQ-1).
- [ ] Manually verify: invalid login shows error, form stays usable (REQ-2).
- [ ] *(optional REQ-3)* Create Supabase RPC `activate_season(target uuid)` (transactional).
- [ ] *(optional REQ-3)* `SeasonsManager.tsx:57-81`: replace two updates with one `supabase.rpc(...)`.
- [ ] If REQ-3 deferred, note it in `progress/history.md` and keep F0 partially done.

## F1 — Platform (REQ-4..REQ-10)
- [ ] Confirm exact Next 16.1.1 keys for React Compiler + PPR/Cache Components (use `vercel:nextjs` / `vercel:next-cache-components`).
- [ ] `grep` for SVG-as-component usage to decide whether to keep the Turbopack SVG rule.
- [ ] Edit `next.config.ts`: add React Compiler (REQ-4), PPR/Cache Components (REQ-5), merge `images.formats`/sizes into existing `images` block (REQ-6).
- [ ] Do **not** port `swcMinify`, `webpack.splitChunks`, or `/api`+`/_next/static` headers.
- [ ] `pnpm build` — confirm config validates and public routes render (REQ-5 smoke test).
- [ ] `rm next.config.optimization.js` (REQ-7).
- [ ] `tsconfig.json`: `target` → `"ES2022"` (REQ-8).
- [ ] `biome.json`: `noExplicitAny` → `"error"` (REQ-9); if lint goes red, decide sequence vs F2 and log it.
- [ ] `npx @next/codemod@latest upgrade`; review diff; confirm `proxy.ts` → `proxyConfig` (REQ-10).

## Done criteria
- [ ] Full `./init.sh` green (typecheck + lint + build).
- [ ] `next.config.optimization.js` no longer exists.
- [ ] `src/proxy.ts` exports `proxyConfig`.
- [ ] `features.json`: set F0 and F1 `status` to `done` (or note partial for deferred REQ-3).
- [ ] Append a dated entry to `progress/history.md`.
- [ ] Reviewer sign-off (see `.claude/agents/reviewer.md`).

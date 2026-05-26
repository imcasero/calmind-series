#!/usr/bin/env bash
#
# init.sh — Harness Guardian for Calmind Series
#
# Run this BEFORE starting any task. It verifies the environment is healthy
# and the codebase is green, so work always starts from a known-good baseline.
#
# Gates (chosen for this repo — no test runner yet):
#   1. Tooling present (node, pnpm)
#   2. Dependencies installed
#   3. Required env vars present (.env.local)
#   4. Harness memory files exist (specs/, progress/, features.json)
#   5. Quality gates: typecheck -> lint -> build
#   6. Tests (skipped automatically if no "test" script exists)
#
# Usage:
#   ./init.sh            # full run (typecheck + lint + build)
#   ./init.sh --quick    # skip the production build (faster inner loop)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

QUICK=0
[[ "${1:-}" == "--quick" || "${1:-}" == "-q" ]] && QUICK=1

ok()   { printf "  \033[32m✓\033[0m %s\n" "$1"; }
warn() { printf "  \033[33m!\033[0m %s\n" "$1"; }
fail() { printf "  \033[31m✗\033[0m %s\n" "$1"; exit 1; }
step() { printf "\n\033[1m▸ %s\033[0m\n" "$1"; }

# 1. Tooling -----------------------------------------------------------------
step "1/6 Tooling"
command -v node >/dev/null 2>&1 || fail "node not found"
command -v pnpm >/dev/null 2>&1 || fail "pnpm not found (this repo uses pnpm)"
ok "node $(node -v) · pnpm $(pnpm -v)"

# 2. Dependencies ------------------------------------------------------------
step "2/6 Dependencies"
if [[ ! -d node_modules ]]; then
  warn "node_modules missing — installing"
  pnpm install
fi
ok "dependencies installed"

# 3. Environment -------------------------------------------------------------
step "3/6 Environment"
if [[ ! -f .env.local ]]; then
  fail ".env.local missing — Supabase URL/anon key are required"
fi
MISSING_ENV=0
for var in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY; do
  if ! grep -q "^${var}=" .env.local; then
    warn "missing env var: ${var}"
    MISSING_ENV=1
  fi
done
[[ $MISSING_ENV -eq 0 ]] && ok "required env vars present" || fail "fix .env.local before continuing"

# 4. Harness memory files ----------------------------------------------------
step "4/6 Harness files"
for path in specs progress; do
  [[ -d "$path" ]] || { mkdir -p "$path"; warn "created missing dir: $path"; }
done
[[ -f progress/history.md ]] || { printf "# Progress log\n" > progress/history.md; warn "created progress/history.md"; }
[[ -f features.json ]] || fail "features.json missing — regenerate the harness backlog"
ok "specs/ · progress/ · features.json present"

# 5. Quality gates -----------------------------------------------------------
step "5/6 Quality gates"
printf "  typecheck…\n"
pnpm exec tsc --noEmit || fail "typecheck failed"
ok "typecheck clean"

printf "  lint (biome)…\n"
pnpm lint || fail "biome check failed"
ok "lint clean"

if [[ $QUICK -eq 1 ]]; then
  warn "build skipped (--quick). Run a full ./init.sh before declaring a task done."
else
  printf "  build (next build — may query Supabase)…\n"
  pnpm build || fail "production build failed"
  ok "build succeeds"
fi

# 6. Tests (optional) --------------------------------------------------------
step "6/6 Tests"
if pnpm run 2>/dev/null | grep -qE "^[[:space:]]*test"; then
  pnpm test || fail "tests failed"
  ok "tests pass"
else
  warn "no test script — skipped (add one when requirements need test coverage)"
fi

printf "\n\033[1;32m✓ Harness ready — baseline is green.\033[0m\n"

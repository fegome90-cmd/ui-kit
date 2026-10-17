#!/usr/bin/env bash
# Pipeline de CI único y local (no hay CI remoto): lo corre el hook pre-push y cualquiera a mano.
#   npm run ci            → todo (lint, tipos, tests + cobertura, build, e2e)
#   SKIP_E2E=1 npm run ci → sin e2e (p. ej. si no hay Chromium instalado)
set -euo pipefail
cd "$(dirname "$0")/.."

step() { printf '\n\033[1;34m▶ %s\033[0m\n' "$1"; }

step "Fuentes del banco"; node scripts/gen-sources.mjs
step "Registry shadcn (generar, validar y construir)"; node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/build-registry.mjs && npx shadcn registry validate && npx shadcn build
step "Biome (lint + formato, sin escribir)"; npx biome ci .
step "TypeScript"; npx tsc --noEmit
step "Tests unitarios y de componentes + cobertura"; NODE_ENV=test npx vitest run --coverage --coverage.reporter=text-summary
step "Build de producción"; npx next build

if [[ "${SKIP_E2E:-0}" == "1" ]]; then
  step "E2E omitido (SKIP_E2E=1)"
else
  step "E2E (Playwright)"; npx playwright test
fi

printf '\n\033[1;32m✔ CI local OK\033[0m\n'

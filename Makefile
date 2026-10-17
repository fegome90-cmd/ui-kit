# Atajos sobre los scripts de package.json (la fuente de verdad sigue siendo npm).
# Los targets se encadenan en orden:  make lint typecheck test
# Compatible con GNU Make 3.81 (el de macOS).

.DEFAULT_GOAL := help
.PHONY: help install dev build start registry lint format typecheck test test-watch coverage e2e \
	check fix ci ci-fast clean

help: ## Lista los targets
	@grep -E '^[a-z0-9-]+:.*## ' $(MAKEFILE_LIST) | awk -F ':.*## ' '{printf "  \033[1;34m%-11s\033[0m %s\n", $$1, $$2}'

# --- básicos -------------------------------------------------------------------

install: ## Instala dependencias exactas del lock (npm ci)
	npm ci

dev: ## Servidor de desarrollo (genera fuentes y registry antes)
	npm run dev

build: ## Build de producción (genera fuentes y registry antes)
	npm run build

start: ## Sirve el build de producción
	npm run start

registry: ## Regenera el registry shadcn
	npm run registry

# --- calidad -------------------------------------------------------------------

lint: ## Biome sin escribir
	npm run lint

format: ## Biome escribiendo los arreglos seguros
	npm run format

typecheck: ## TypeScript (genera fuentes antes)
	npm run typecheck

test: ## Tests unitarios y de componentes
	npm test

test-watch: ## Tests en modo watch
	npm run test:watch

coverage: ## Tests con cobertura
	npm run test:coverage

e2e: ## Tests e2e con Playwright
	npm run test:e2e

# --- cadenas -------------------------------------------------------------------

check: lint typecheck test ## Chequeo rápido: lint + tipos + tests

fix: format check ## Formatea y después corre el chequeo rápido

ci: ## CI local completo (lo mismo que el pre-push)
	npm run ci

ci-fast: ## CI local sin e2e
	SKIP_E2E=1 npm run ci

clean: ## Borra artefactos generados (todos ignorados por git)
	rm -rf .next coverage test-results playwright-report lib/generated public/r registry.json *.tsbuildinfo

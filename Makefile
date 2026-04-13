# ============================================
# VITE GOURMAND — Makefile
# ============================================
# Usage: make <target>
# All services run inside mini-baas-infra Docker Compose.
# Only Docker (with compose plugin) is required on your host.
# ============================================

SHELL := /usr/bin/bash
.SHELLFLAGS := -ec
.DEFAULT_GOAL := help

DOCKER_COMPOSE := $(shell docker compose version >/dev/null 2>&1 && echo 'docker compose' || echo 'docker-compose')
INFRA_DIR := ./mini-baas-infra
DC := cd $(INFRA_DIR) && $(DOCKER_COMPOSE)

# ── Help ──────────────────────────────────────────────
.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Quick Start ───────────────────────────────────────
.PHONY: init start

init: env frontend-install frontend-build ## First-time setup: generate env, install deps, build frontend
	@echo "✔ Ready — run 'make start' to launch all services."

start: env-check frontend-build up ## Build frontend then start all services

# ── Environment ───────────────────────────────────────
.PHONY: env env-check

env: ## Generate fresh .env in mini-baas-infra/ (safe — skips if exists)
	@if [ ! -f $(INFRA_DIR)/.env ]; then \
		cd $(INFRA_DIR) && bash scripts/generate-env.sh .env; \
		echo "✔ Generated $(INFRA_DIR)/.env"; \
	else \
		echo "• $(INFRA_DIR)/.env already exists (use 'make env-reset' to regenerate)"; \
	fi

env-reset: ## Regenerate .env (overwrites existing)
	cd $(INFRA_DIR) && FORCE=1 bash scripts/generate-env.sh .env
	@echo "✔ Regenerated $(INFRA_DIR)/.env"

env-check:
	@test -f $(INFRA_DIR)/.env || (echo "ERROR: $(INFRA_DIR)/.env missing — run 'make env' first" && exit 1)

# ── Infrastructure ────────────────────────────────────
.PHONY: up down restart logs ps build

up: env-check ## Start all services (infra + domain bootstrap + frontend)
	$(DC) up -d --build --remove-orphans

down: ## Stop all services and remove containers
	$(DC) down

restart: down up ## Restart everything

logs: ## Follow logs of all services
	$(DC) logs -f

ps: ## Show running containers
	$(DC) ps

build: ## Rebuild all images without cache
	$(DC) build --no-cache

# ── Database ──────────────────────────────────────────
.PHONY: db-reset db-migrate db-seed db-shell

db-reset: ## Wipe postgres volume and re-bootstrap
	$(DC) down -v
	$(DC) up -d postgres
	sleep 3
	$(DC) up db-bootstrap domain-bootstrap
	@echo "Database reset complete."

db-migrate: ## Re-run domain migrations only
	$(DC) run --rm domain-bootstrap sh -c 'for f in /domain/migrations/*.sql; do echo "  → $$(basename $$f)"; psql -h postgres -U $$POSTGRES_USER -d $$POSTGRES_DB -v ON_ERROR_STOP=1 -f $$f; done'

db-seed: ## Re-run domain seeds only
	$(DC) run --rm domain-bootstrap sh -c 'for f in /domain/seeds/*.sql; do echo "  → $$(basename $$f)"; psql -h postgres -U $$POSTGRES_USER -d $$POSTGRES_DB -v ON_ERROR_STOP=1 -f $$f; done'

db-shell: ## Open psql shell
	$(DC) exec postgres psql -U postgres -d postgres

# ── Frontend ──────────────────────────────────────────
.PHONY: frontend-install frontend-build frontend-dev

frontend-install: ## Install frontend npm dependencies
	cd View && npm install

frontend-build: ## Build the React SPA for production
	cd View && npm run build

frontend-dev: ## Start Vite dev server (hot reload, port 5173)
	cd View && npm run dev

# ── Extras ────────────────────────────────────────────
.PHONY: extras observability

extras: ## Start extra services (studio, minio, pg-meta, trino)
	$(DC) --profile extras up -d

observability: ## Start Prometheus, Grafana, Loki stack
	$(DC) --profile observability up -d

# ── Cleanup ───────────────────────────────────────────
.PHONY: clean prune

clean: down ## Stop everything and remove volumes
	$(DC) down -v --remove-orphans

prune: ## Docker system prune (removes dangling images, build cache)
	docker system prune -f

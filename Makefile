# ============================================
# VITE GOURMAND - MAKEFILE
# ============================================
# Usage: make <target>
# Run 'make help' to see all available targets
# ============================================

# Force bash as the shell (required — default shell may not support & or pipes)
SHELL := /usr/bin/bash
.SHELLFLAGS := -ec

.PHONY: help
.DEFAULT_GOAL := all

# ── Variables ────────────────────────────────────────
# Auto-detect: docker compose (v2 plugin) or docker-compose (v1 standalone)
DOCKER_COMPOSE := $(shell docker compose version >/dev/null 2>&1 && echo 'docker compose' || echo 'docker-compose')
BACKEND_PATH     = ./Back
FRONTEND_PATH    = ./View
SCRIPTS_PATH     = ./scripts
PRISMA_SCHEMA    = $(BACKEND_PATH)/src/Model/prisma/schema.prisma

# Ports
BACKEND_PORT     = 3000
FRONTEND_PORT    = 5173

# PID files (for background dev servers)
BACKEND_PID      = .backend.pid
FRONTEND_PID     = .frontend.pid

# Bitwarden vault item name (override: BW_ITEM_NAME=xxx make secrets)
BW_ITEM_NAME    ?= vite-gourmand-env
export BW_ITEM_NAME

# NOTE: Do NOT include Back/.env here — Make corrupts URLs containing & chars.
# NestJS loads .env automatically via dotenv from the working directory.

# ============================================
#  ⚡ BOOTSTRAP (default target: make)
# ============================================
# Running `make` with no arguments does everything:
#   1. Fetch .env from Bitwarden vault (skipped if exists)
#   2. npm install for Back & View
#   3. Generate Prisma client
#   4. Start backend + frontend dev servers in background
#   5. Open VS Code Simple Browser preview
#   6. Print URLs
#
# Databases are cloud-hosted (Supabase + MongoDB Atlas)
# so no Docker containers are needed for development.
# ============================================

.PHONY: all banner fetch-env secrets secrets-force install-all \
        dev-start dev-backend dev-frontend show-urls

all: banner fetch-env install-all turn-on  ## ⚡ Full bootstrap (default)

banner:
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║     🍽️  VITE GOURMAND — Full Bootstrap                       ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""

fetch-env:  ## 🔐 Fetch .env from Bitwarden (skips if exists)
	@$(SCRIPTS_PATH)/docker/bw-fetch-env.sh

secrets: ## 🔐 Alias: fetch .env from Bitwarden
	@$(SCRIPTS_PATH)/docker/bw-fetch-env.sh

secrets-force:  ## 🔐 Force re-fetch .env from Bitwarden (overwrites)
	@rm -f $(BACKEND_PATH)/.env
	@$(SCRIPTS_PATH)/docker/bw-fetch-env.sh

install-all:  ## 📦 Install npm deps for Back & View + Prisma generate
	@echo "📦 Installing Backend dependencies..."
	@cd $(BACKEND_PATH) && npm install --silent 2>&1 | tail -3
	@echo "📦 Installing Frontend dependencies..."
	@cd $(FRONTEND_PATH) && npm install --silent 2>&1 | tail -3
	@echo "📦 Generating Prisma client..."
	@cd $(BACKEND_PATH) && npx prisma generate 2>/dev/null || true
	@echo "✅ All dependencies installed!"

# ============================================
#  🔌 TURN-ON / TURN-OFF
# ============================================
# turn-on  → start backend + frontend dev servers + open preview
# turn-off → gracefully stop everything
# ============================================

.PHONY: turn-on turn-off

turn-on:  ## 🔌 Start backend + frontend & open VS Code preview
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║     🔌  TURNING ON VITE GOURMAND                             ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🔧 Starting backend (NestJS) on port $(BACKEND_PORT)..."
	@if [ -f $(BACKEND_PID) ] && kill -0 $$(cat $(BACKEND_PID)) 2>/dev/null; then \
		echo "   ↳ Backend already running (PID: $$(cat $(BACKEND_PID)))"; \
	else \
		cd $(BACKEND_PATH) && nohup npm run start:dev > /tmp/vg-backend.log 2>&1 & echo $$! > $(CURDIR)/$(BACKEND_PID); \
		sleep 3; \
		echo "   ✅ Backend started (PID: $$(cat $(CURDIR)/$(BACKEND_PID)))"; \
	fi
	@echo "🖥️  Starting frontend (Vite) on port $(FRONTEND_PORT)..."
	@if [ -f $(FRONTEND_PID) ] && kill -0 $$(cat $(FRONTEND_PID)) 2>/dev/null; then \
		echo "   ↳ Frontend already running (PID: $$(cat $(FRONTEND_PID)))"; \
	else \
		cd $(FRONTEND_PATH) && nohup npm run dev > /tmp/vg-frontend.log 2>&1 & echo $$! > $(CURDIR)/$(FRONTEND_PID); \
		sleep 3; \
		echo "   ✅ Frontend started (PID: $$(cat $(CURDIR)/$(FRONTEND_PID)))"; \
	fi
	@$(MAKE) --no-print-directory show-urls

turn-off:  ## 🔌 Gracefully shut down everything
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║  🔌  SHUTTING DOWN VITE GOURMAND                             ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🛑 Stopping frontend..."
	@if [ -f $(FRONTEND_PID) ]; then \
		kill $$(cat $(FRONTEND_PID)) 2>/dev/null || true; \
		rm -f $(FRONTEND_PID); \
	fi
	@-fuser -k $(FRONTEND_PORT)/tcp 2>/dev/null || true
	@echo "   ✅ Frontend stopped"
	@echo "🛑 Stopping backend..."
	@if [ -f $(BACKEND_PID) ]; then \
		kill $$(cat $(BACKEND_PID)) 2>/dev/null || true; \
		rm -f $(BACKEND_PID); \
	fi
	@-fuser -k $(BACKEND_PORT)/tcp 2>/dev/null || true
	@echo "   ✅ Backend stopped"
	@-rm -f /tmp/vg-backend.log /tmp/vg-frontend.log
	@echo ""
	@echo "✅ Everything shut down cleanly."
	@echo ""

show-urls:
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║  ✅  VITE GOURMAND IS RUNNING                                ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║  🖥️  Frontend  → http://localhost:$(FRONTEND_PORT)                   ║"
	@echo "║  🔧 Backend   → http://localhost:$(BACKEND_PORT)/api                 ║"
	@echo "║  🗄️  Postgres  → Supabase (cloud)                            ║"
	@echo "║  🍃 MongoDB   → Atlas (cloud)                                ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║  Turn off : make turn-off                                    ║"
	@echo "║  Logs back: tail -f /tmp/vg-backend.log                      ║"
	@echo "║  Logs front: tail -f /tmp/vg-frontend.log                    ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""

# ============================================
#  🛑 STOP / KILL INDIVIDUAL PROCESSES
# ============================================

.PHONY: kill-backend kill-frontend kill-all

kill-backend:  ## 🛑 Stop backend dev server
	@echo "🛑 Stopping backend..."
	@if [ -f $(BACKEND_PID) ]; then kill $$(cat $(BACKEND_PID)) 2>/dev/null || true; rm -f $(BACKEND_PID); fi
	@-fuser -k $(BACKEND_PORT)/tcp 2>/dev/null || true
	@echo "✅ Backend stopped (port $(BACKEND_PORT) freed)"

kill-frontend:  ## 🛑 Stop frontend dev server
	@echo "🛑 Stopping frontend..."
	@if [ -f $(FRONTEND_PID) ]; then kill $$(cat $(FRONTEND_PID)) 2>/dev/null || true; rm -f $(FRONTEND_PID); fi
	@-fuser -k $(FRONTEND_PORT)/tcp 2>/dev/null || true
	@echo "✅ Frontend stopped (port $(FRONTEND_PORT) freed)"

kill-all: turn-off  ## 🛑 Alias for turn-off

# ============================================
#  🚀 QUICK START (legacy)
# ============================================

.PHONY: quick-start quick-start-local quick-start-cloud

quick-start: quick-start-local  ## Default quick start (local Docker)

quick-start-local: install up wait db-migrate db-seed  ## Full local setup with Docker
	@echo ""
	@echo "✅ Setup complete! Start the backend:"
	@echo "   cd Back && npm run start:dev"

quick-start-cloud: install supabase-setup db-migrate db-seed  ## Setup with Supabase + MongoDB Atlas
	@echo ""
	@echo "✅ Cloud setup complete!"

# ============================================
#  🐳 DOCKER MANAGEMENT
# ============================================

.PHONY: up down restart ps logs docker-clean psql mongosh

up:  ## Start all Docker containers
	@$(SCRIPTS_PATH)/docker/up.sh

down:  ## Stop all Docker containers
	@$(SCRIPTS_PATH)/docker/down.sh

restart:  ## Restart Docker containers
	@$(SCRIPTS_PATH)/docker/restart.sh

ps:  ## Show container status
	@$(SCRIPTS_PATH)/docker/ps.sh

logs:  ## Stream container logs (SERVICE=name for specific)
	@SERVICE="$(SERVICE)" TAIL="$(TAIL)" $(SCRIPTS_PATH)/docker/logs.sh

docker-clean:  ## Remove containers and images (DEEP=1 for volumes)
	@DEEP="$(DEEP)" $(SCRIPTS_PATH)/docker/clean.sh

docker-check:  ## Run Docker infrastructure check
	@$(SCRIPTS_PATH)/docker/check_docker.sh

psql:  ## Open PostgreSQL shell (local Docker)
	@$(SCRIPTS_PATH)/docker/psql.sh

mongosh:  ## Open MongoDB shell (local Docker)
	@$(SCRIPTS_PATH)/docker/mongosh.sh

wait:  ## Wait for database containers to be ready
	@echo "⏳ Waiting for PostgreSQL..."
	@until docker exec vite-gourmand-db-1 pg_isready -U postgres 2>/dev/null; do sleep 1; done
	@echo "⏳ Waiting for MongoDB..."
	@until docker exec vite-gourmand-mongo-1 mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; do sleep 1; done
	@echo "✅ Databases ready!"

# ============================================
#  💻 BACKEND DEVELOPMENT
# ============================================

.PHONY: dev build lint compile format debug services install

dev:  ## Start backend in development mode (watch)
	@$(SCRIPTS_PATH)/backend/dev.sh

build:  ## Build backend for production
	@$(SCRIPTS_PATH)/backend/build.sh

lint:  ## Run ESLint (FIX=1 for auto-fix)
	@FIX="$(FIX)" $(SCRIPTS_PATH)/backend/lint.sh

compile:  ## TypeScript compile check (no emit)
	@$(SCRIPTS_PATH)/backend/compile.sh

format:  ## Format code with Prettier (CHECK=1 to check only)
	@CHECK="$(CHECK)" $(SCRIPTS_PATH)/backend/format.sh

debug:  ## Start backend with Node inspector
	@$(SCRIPTS_PATH)/backend/debug.sh

services:  ## Show backend services summary
	@$(SCRIPTS_PATH)/backend/services.sh

install:  ## Install all dependencies
	@$(SCRIPTS_PATH)/utils/install.sh

# ============================================
#  🧪 TESTING
# ============================================

.PHONY: test test-unit test-e2e test-all coverage test-postman

test: test-unit  ## Run unit tests (alias)

test-unit:  ## Run unit tests
	@$(SCRIPTS_PATH)/test/unit.sh

test-e2e:  ## Run E2E tests
	@$(SCRIPTS_PATH)/test/e2e.sh

test-all:  ## Run all tests (unit + E2E)
	@$(SCRIPTS_PATH)/test/all.sh

coverage:  ## Run tests with coverage report
	@$(SCRIPTS_PATH)/test/coverage.sh

test-postman:  ## Run Postman collections (ID=collection-id)
	@$(SCRIPTS_PATH)/test/postman-cli.sh run-local $(BACKEND_PATH)/postman/auth.json

test-full:  ## Run complete test suite with report
	@$(SCRIPTS_PATH)/test/run_all_tests.sh

# ============================================
#  🗄️ DATABASE (Prisma)
# ============================================

.PHONY: db-connect db-status db-seed db-migrate db-reset db-reset-full db-query db-generate db-studio db-push db-security

db-connect:  ## Connect to Supabase PostgreSQL
	@$(SCRIPTS_PATH)/db/connect.sh

db-status:  ## Show database status and table counts
	@$(SCRIPTS_PATH)/db/status.sh

db-seed:  ## Run Prisma seed
	@$(SCRIPTS_PATH)/db/seed.sh

db-migrate:  ## Run Prisma migrations (dev mode)
	@$(SCRIPTS_PATH)/db/migrate.sh

db-migrate-deploy:  ## Run Prisma migrations (production)
	@$(SCRIPTS_PATH)/db/migrate.sh deploy

db-reset:  ## Reset database (DESTRUCTIVE!)
	@$(SCRIPTS_PATH)/db/reset.sh

db-reset-full:  ## Full database reset: drop, schemas, seeds, RLS, introspect (DESTRUCTIVE!)
	@$(SCRIPTS_PATH)/database/reset_database.sh

db-security:  ## Apply RLS & security policies only (non-destructive)
	@. $(BACKEND_PATH)/.env && psql "$$DIRECT_URL" -v ON_ERROR_STOP=1 -f $(BACKEND_PATH)/src/Model/sql/schemas/security_rls.sql && echo "✅ RLS & security policies applied!"

db-query:  ## Run SQL query: make db-query SQL="SELECT * FROM users"
	@SQL="$(SQL)" $(SCRIPTS_PATH)/db/query.sh

db-generate:  ## Generate Prisma client
	@$(SCRIPTS_PATH)/db/generate.sh

db-studio:  ## Open Prisma Studio
	@$(SCRIPTS_PATH)/db/studio.sh

db-push:  ## Push schema to database (no migration history)
	cd $(BACKEND_PATH) && npx prisma db push --schema=$(PRISMA_SCHEMA)

# ============================================
#  🐘 SUPABASE
# ============================================

.PHONY: supabase-setup supabase-deploy supabase-validate supabase-introspect supabase-tables supabase-counts

supabase-setup:  ## Interactive Supabase setup
	@$(SCRIPTS_PATH)/supabase/setup-supabase.sh

supabase-deploy:  ## Deploy SQL schemas to Supabase (DESTRUCTIVE!)
	@$(SCRIPTS_PATH)/supabase/deploy-supabase.sh

supabase-validate:  ## Validate SQL schemas before deployment
	@$(SCRIPTS_PATH)/supabase/validate-sql.sh

supabase-introspect:  ## Introspect Supabase and generate Prisma schema
	@$(SCRIPTS_PATH)/supabase/prisma-introspect.sh

supabase-full: supabase-validate supabase-deploy supabase-introspect db-generate  ## Full Supabase pipeline
	@echo "✅ Full Supabase setup complete!"

supabase-tables:  ## List all tables on Supabase
	@. $(BACKEND_PATH)/.env && psql "$$DIRECT_URL" -c \
		"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

supabase-counts:  ## Show row counts for all tables
	@. $(BACKEND_PATH)/.env && psql "$$DIRECT_URL" -c \
		"SELECT relname AS table_name, n_live_tup AS rows FROM pg_stat_user_tables ORDER BY n_live_tup DESC;"

# ============================================
#  🍃 MONGODB ATLAS
# ============================================

.PHONY: mongodb-test mongodb-init mongodb-reset mongodb-cleanup mongodb-stats

mongodb-test:  ## Test MongoDB Atlas connection
	@$(SCRIPTS_PATH)/db/mongodb-analytics.sh test

mongodb-init:  ## Initialize MongoDB collections and indexes
	@$(SCRIPTS_PATH)/db/mongodb-analytics.sh init

mongodb-reset:  ## Reset MongoDB analytics (DESTRUCTIVE!)
	@$(SCRIPTS_PATH)/db/mongodb-analytics.sh reset

mongodb-cleanup:  ## Run storage cleanup based on retention policy
	@$(SCRIPTS_PATH)/db/mongodb-analytics.sh cleanup

mongodb-stats:  ## Show MongoDB storage statistics
	@$(SCRIPTS_PATH)/db/mongodb-analytics.sh stats

# ============================================
#  🔐 SECURITY
# ============================================

.PHONY: security-audit security-secrets security-headers security-deps security-all

security-audit:  ## Run npm audit on all packages
	@$(SCRIPTS_PATH)/security/audit.sh

security-secrets:  ## Scan code for hardcoded secrets
	@$(SCRIPTS_PATH)/security/secrets.sh

security-headers:  ## Check HTTP security headers (URL=http://localhost:3000)
	@URL="$(URL)" $(SCRIPTS_PATH)/security/headers.sh

security-deps:  ## Check for vulnerable dependencies
	@$(SCRIPTS_PATH)/security/deps.sh

security-all: security-audit security-secrets security-deps  ## Run all security checks
	@echo "✅ All security checks completed!"

# ============================================
#  🚀 DEPLOYMENT
# ============================================

.PHONY: deploy deploy-fly deploy-check deploy-status deploy-logs

deploy: deploy-fly  ## Deploy to Fly.io (alias)

deploy-fly:  ## Deploy to Fly.io
	@$(SCRIPTS_PATH)/deploy/fly.sh

deploy-check:  ## Run pre-deployment checks
	@$(SCRIPTS_PATH)/deploy/check.sh

deploy-status:  ## Check Fly.io deployment status
	@$(SCRIPTS_PATH)/deploy/status.sh

deploy-logs:  ## View Fly.io application logs
	@$(SCRIPTS_PATH)/deploy/logs.sh

deploy-safe: deploy-check deploy-fly  ## Pre-check then deploy
	@echo "✅ Safe deployment complete!"

# ============================================
#  🔍 DIAGNOSTICS
# ============================================

.PHONY: diagnostic diagnostic-rgpd diagnostic-rgaa diagnostic-code diagnostic-perf

diagnostic:  ## Run all diagnostics
	@CHECK=all $(SCRIPTS_PATH)/diagnostic/run.sh

diagnostic-rgpd:  ## Check RGPD compliance
	@CHECK=rgpd $(SCRIPTS_PATH)/diagnostic/run.sh

diagnostic-rgaa:  ## Check RGAA accessibility compliance
	@CHECK=rgaa $(SCRIPTS_PATH)/diagnostic/run.sh

diagnostic-code:  ## Check code quality
	@CHECK=code $(SCRIPTS_PATH)/diagnostic/run.sh

diagnostic-perf:  ## Check performance
	@CHECK=perf $(SCRIPTS_PATH)/diagnostic/run.sh

# ============================================
#  🛠️ UTILITIES
# ============================================

.PHONY: status doctor env-show env-check clean

status:  ## Show project status overview
	@$(SCRIPTS_PATH)/utils/status.sh

doctor:  ## Check development environment
	@$(SCRIPTS_PATH)/utils/doctor.sh

env-show:  ## Show environment variables (masked)
	@$(SCRIPTS_PATH)/utils/env.sh show

env-check:  ## Check required environment variables
	@$(SCRIPTS_PATH)/utils/env.sh check

clean:  ## Clean build artifacts (DEEP=1 for node_modules)
	@DEEP="$(DEEP)" $(SCRIPTS_PATH)/utils/clean.sh

# ============================================
#  📋 HELP
# ============================================

help:  ## Show this help message
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║     🍽️  VITE GOURMAND - Available Commands                    ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Usage: make <target> [VARIABLE=value]"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} \
		/^[a-zA-Z_-]+:.*##/ { \
			printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 \
		} \
		/^# ===/ { \
			gsub(/# /, ""); \
			gsub(/=/, ""); \
			printf "\n\033[1;33m%s\033[0m\n", $$0 \
		}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Examples:"
	@echo "  make quick-start         # Full local setup"
	@echo "  make dev                 # Start development server"
	@echo "  make test-all            # Run all tests"
	@echo "  make lint FIX=1          # Fix linting errors"
	@echo "  make db-query SQL=\"...\"  # Run custom SQL"
	@echo "  make logs SERVICE=db     # View specific container logs"
	@echo ""

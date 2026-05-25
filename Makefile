# ============================================
# VITE GOURMAND - MAKEFILE
# ============================================
# Usage: make <target>
# Run 'make help' to see all available targets
#
# 🐳 FULLY CONTAINERIZED: Only Docker required!
#    Running `make` bootstraps everything inside Docker containers.
#    No Node.js, npm, or other dependencies needed on your host.
# ============================================

# Force bash as the shell (required — default shell may not support & or pipes)
SHELL := /usr/bin/bash
.SHELLFLAGS := -eo pipefail -c

.PHONY: help
.DEFAULT_GOAL := all

# ── Variables ────────────────────────────────────────
# Auto-detect: docker compose (v2 plugin) or docker-compose (v1 standalone)
DOCKER_COMPOSE := $(shell docker compose version >/dev/null 2>&1 && echo 'docker compose' || echo 'docker-compose')

# Disable BuildKit to use legacy builder (buildx not installed on this system)
# The deprecation warning is harmless - legacy builder still works fine
export DOCKER_BUILDKIT := 0

BACKEND_PATH     = ./Back
FRONTEND_PATH    = ./View
SCRIPTS_PATH     = ./scripts
PRISMA_SCHEMA    = $(BACKEND_PATH)/src/Model/prisma/schema.prisma

# Ports
BACKEND_PORT     = 3000
FRONTEND_PORT    = 5173

# PID files (for background dev servers - used in local mode)
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
# 🐳 CONTAINERIZED BY DEFAULT
#
# Running `make` with no arguments does everything INSIDE DOCKER:
#   1. Build development Docker container (Node.js 22 Alpine)
#   2. Build Bitwarden CLI container & fetch .env interactively
#   3. npm install for Back & View (inside container)
#   4. Generate Prisma client (inside container)
#   5. Compile TypeScript (inside container)
#   6. Start backend + frontend dev servers (inside container)
#   7. Print summary with URLs
#
# Your host machine only needs DOCKER installed!
# Databases are cloud-hosted (Supabase + MongoDB Atlas).
#
# For local development with host Node.js, use: make local
# ============================================

.PHONY: all bootstrap banner fetch-env secrets secrets-force \
        install-all compile-check turn-on turn-off show-urls summary local local-bootstrap

# Default target: CONTAINERIZED bootstrap (Docker-only)
all: docker-bootstrap

# Alias for clarity
bootstrap: docker-bootstrap

# Local development with host Node.js (if you prefer not using Docker)
local: local-bootstrap  ## 💻 Local bootstrap (requires Node.js on host)

local-bootstrap:  ## 💻 Bootstrap using host Node.js (not Docker)
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║  💻 VITE GOURMAND — Local Development (Host Node.js)         ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "⚠️  This mode requires Node.js and npm installed on your host."
	@echo "   For containerized development, use: make"
	@echo ""
	@$(MAKE) --no-print-directory step-1-secrets
	@$(MAKE) --no-print-directory step-2-install
	@$(MAKE) --no-print-directory step-3-compile
	@$(MAKE) --no-print-directory step-4-start
	@$(MAKE) --no-print-directory summary

# ── Step 1: Fetch secrets ────────────────────────────
step-1-secrets:
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║  STEP 1/4 — 🔐 Fetching Secrets from Bitwarden               ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@$(SCRIPTS_PATH)/docker/bw-fetch-env.sh
	@if [ ! -f $(BACKEND_PATH)/.env ]; then \
		echo ""; \
		echo "❌ Back/.env is required to continue."; \
		echo "   Create it manually or re-run: make secrets-force"; \
		exit 1; \
	fi
	@echo ""
	@echo "✅ Step 1 complete: Back/.env is ready"

# ── Step 2: Install dependencies ─────────────────────
step-2-install:
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║  STEP 2/4 — 📦 Installing Dependencies                       ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "📦 [1/3] Backend dependencies..."
	@cd $(BACKEND_PATH) && npm install
	@echo ""
	@echo "📦 [2/3] Frontend dependencies..."
	@cd $(FRONTEND_PATH) && npm install
	@echo ""
	@echo "📦 [3/3] Generating Prisma client..."
	@cd $(BACKEND_PATH) && npx prisma generate
	@echo ""
	@echo "✅ Step 2 complete: All dependencies installed"

# ── Step 3: Compile & verify ─────────────────────────
step-3-compile:
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║  STEP 3/4 — 🔨 Compiling TypeScript                          ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🔨 Checking Backend compilation..."
	@cd $(BACKEND_PATH) && npx tsc --noEmit || { echo "❌ TypeScript errors in Backend"; exit 1; }
	@echo "✅ Backend compiles cleanly"
	@echo ""
	@echo "🔨 Checking Frontend compilation..."
	@cd $(FRONTEND_PATH) && npx tsc --noEmit || { echo "❌ TypeScript errors in Frontend"; exit 1; }
	@echo "✅ Frontend compiles cleanly"
	@echo ""
	@echo "✅ Step 3 complete: No compilation errors"

# ── Step 4: Start dev servers ────────────────────────
step-4-start:
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║  STEP 4/4 — 🚀 Starting Development Servers                  ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@# Kill any existing processes on our ports
	@-fuser -k $(BACKEND_PORT)/tcp 2>/dev/null || true
	@-fuser -k $(FRONTEND_PORT)/tcp 2>/dev/null || true
	@rm -f $(BACKEND_PID) $(FRONTEND_PID)
	@sleep 1
	@echo "🔧 Starting Backend (NestJS) on port $(BACKEND_PORT)..."
	@cd $(BACKEND_PATH) && nohup npm run start:dev > /tmp/vg-backend.log 2>&1 & echo $$! > $(CURDIR)/$(BACKEND_PID)
	@echo "   PID: $$(cat $(CURDIR)/$(BACKEND_PID))"
	@echo ""
	@echo "🖥️  Starting Frontend (Vite) on port $(FRONTEND_PORT)..."
	@cd $(FRONTEND_PATH) && nohup npm run dev > /tmp/vg-frontend.log 2>&1 & echo $$! > $(CURDIR)/$(FRONTEND_PID)
	@echo "   PID: $$(cat $(CURDIR)/$(FRONTEND_PID))"
	@echo ""
	@echo "⏳ Waiting for servers to start..."
	@sleep 5
	@echo "✅ Step 4 complete: Servers started"

# ── Summary ──────────────────────────────────────────
summary:
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║  🎉  VITE GOURMAND — BOOTSTRAP COMPLETE                      ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║                                                              ║"
	@echo "║  ✅ Secrets fetched from Bitwarden                           ║"
	@echo "║  ✅ Dependencies installed (Back + View)                     ║"
	@echo "║  ✅ TypeScript compiled successfully                         ║"
	@echo "║  ✅ Development servers running                              ║"
	@echo "║                                                              ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║  🌐 URLS                                                     ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║  🖥️  Frontend  → http://localhost:$(FRONTEND_PORT)                   ║"
	@echo "║  🔧 Backend   → http://localhost:$(BACKEND_PORT)/api                 ║"
	@echo "║  📚 API Docs  → http://localhost:$(BACKEND_PORT)/api/docs            ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║  🗄️  PostgreSQL → Supabase (cloud-hosted)                    ║"
	@echo "║  🍃 MongoDB    → Atlas (cloud-hosted)                        ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║  📋 COMMANDS                                                 ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║  make turn-off     Stop all servers                          ║"
	@echo "║  make turn-on      Restart servers                           ║"
	@echo "║  make logs         View server logs                          ║"
	@echo "║  make help         Show all commands                         ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "📝 Logs:"
	@echo "   Backend:  tail -f /tmp/vg-backend.log"
	@echo "   Frontend: tail -f /tmp/vg-frontend.log"
	@echo ""

# ── Aliases for manual steps ─────────────────────────
fetch-env: step-1-secrets  ## 🔐 Fetch .env from Bitwarden (interactive)

secrets: step-1-secrets  ## 🔐 Alias for fetch-env

secrets-force:  ## 🔐 Force re-fetch .env (overwrites existing)
	@rm -f $(BACKEND_PATH)/.env
	@$(MAKE) --no-print-directory step-1-secrets

install-all: step-2-install  ## 📦 Install all dependencies

compile-check: step-3-compile  ## 🔨 Check TypeScript compilation

# ============================================
#  🔌 TURN-ON / TURN-OFF
# ============================================
# Quick start/stop for when dependencies are already installed
# ============================================

.PHONY: turn-on turn-off logs

turn-on:  ## 🔌 Start servers (assumes deps are installed)
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║     🔌  TURNING ON VITE GOURMAND                             ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@# Verify .env exists
	@if [ ! -f $(BACKEND_PATH)/.env ]; then \
		echo "❌ Back/.env not found. Run 'make' first for full bootstrap."; \
		exit 1; \
	fi
	@# Kill existing processes
	@-fuser -k $(BACKEND_PORT)/tcp 2>/dev/null || true
	@-fuser -k $(FRONTEND_PORT)/tcp 2>/dev/null || true
	@rm -f $(BACKEND_PID) $(FRONTEND_PID)
	@sleep 1
	@echo "🔧 Starting Backend (NestJS) on port $(BACKEND_PORT)..."
	@cd $(BACKEND_PATH) && nohup npm run start:dev > /tmp/vg-backend.log 2>&1 & echo $$! > $(CURDIR)/$(BACKEND_PID)
	@echo "   PID: $$(cat $(CURDIR)/$(BACKEND_PID))"
	@echo ""
	@echo "🖥️  Starting Frontend (Vite) on port $(FRONTEND_PORT)..."
	@cd $(FRONTEND_PATH) && nohup npm run dev > /tmp/vg-frontend.log 2>&1 & echo $$! > $(CURDIR)/$(FRONTEND_PID)
	@echo "   PID: $$(cat $(CURDIR)/$(FRONTEND_PID))"
	@echo ""
	@sleep 3
	@echo "✅ Servers started!"
	@echo ""
	@echo "  🖥️  Frontend → http://localhost:$(FRONTEND_PORT)"
	@echo "  🔧 Backend  → http://localhost:$(BACKEND_PORT)/api"
	@echo ""

turn-off:  ## 🔌 Stop all servers
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║     🔌  SHUTTING DOWN VITE GOURMAND                          ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🛑 Stopping frontend..."
	@if [ -f $(FRONTEND_PID) ]; then kill $$(cat $(FRONTEND_PID)) 2>/dev/null || true; rm -f $(FRONTEND_PID); fi
	@-fuser -k $(FRONTEND_PORT)/tcp 2>/dev/null || true
	@echo "   ✅ Frontend stopped"
	@echo ""
	@echo "🛑 Stopping backend..."
	@if [ -f $(BACKEND_PID) ]; then kill $$(cat $(BACKEND_PID)) 2>/dev/null || true; rm -f $(BACKEND_PID); fi
	@-fuser -k $(BACKEND_PORT)/tcp 2>/dev/null || true
	@echo "   ✅ Backend stopped"
	@echo ""
	@rm -f /tmp/vg-backend.log /tmp/vg-frontend.log 2>/dev/null || true
	@echo "✅ Everything shut down."
	@echo ""

local-logs:  ## 📋 View local server logs (WHICH=backend|frontend|both)
	@WHICH="$${WHICH:-both}"; \
	if [ "$$WHICH" = "backend" ] || [ "$$WHICH" = "both" ]; then \
		echo "═══ Backend Log ═══"; \
		tail -50 /tmp/vg-backend.log 2>/dev/null || echo "(no log yet)"; \
	fi; \
	if [ "$$WHICH" = "frontend" ] || [ "$$WHICH" = "both" ]; then \
		echo ""; echo "═══ Frontend Log ═══"; \
		tail -50 /tmp/vg-frontend.log 2>/dev/null || echo "(no log yet)"; \
	fi

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

docker-containers-restart:  ## Restart Docker containers (production/tools)
	@$(SCRIPTS_PATH)/docker/restart.sh

ps:  ## Show container status
	@$(SCRIPTS_PATH)/docker/ps.sh

docker-service-logs:  ## Stream Docker container logs (SERVICE=name for specific)
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
#  🐳 CONTAINERIZED DEVELOPMENT (DEFAULT)
# ============================================
# This is the DEFAULT mode when you run `make`.
# Everything runs inside Docker containers.
# Your host machine only needs Docker installed!
#
# Usage:
#   make              # Full containerized bootstrap (default)
#   make stop         # Stop the dev container
#   make shell        # Interactive shell in dev container
#   make logs         # View container logs
#   make fclean       # Full cleanup
#
# For local development with host Node.js: make local
# ============================================

.PHONY: docker-bootstrap docker-dev docker-shell docker-stop docker-build-dev \
        docker-install docker-compile docker-start docker-fclean stop shell logs restart

# Build the development container image
docker-build-dev:  ## 🐳 Build the development Docker image
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║  🐳 Building Development Container                           ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@if ! docker info >/dev/null 2>&1; then \
		echo "❌ Cannot connect to Docker daemon."; \
		echo ""; \
		echo "   Docker is running but your user lacks permission."; \
		echo "   Fix it (one-time, then open a new terminal):"; \
		echo "     sudo usermod -aG docker $$USER && newgrp docker"; \
		echo ""; \
		echo "   Or if Docker is not running:"; \
		echo "     sudo systemctl start docker"; \
		exit 1; \
	fi
	@tmpfile=$$(mktemp); \
	 $(DOCKER_COMPOSE) --profile dev build dev >"$$tmpfile" 2>&1; BUILD_EXIT=$$?; \
	 grep -v "DEPRECATED\|Install the buildx\|https://docs.docker.com/go/buildx\|attribute .version. is obsolete\|configured to build using Bake" "$$tmpfile" || true; \
	 rm -f "$$tmpfile"; \
	 test $$BUILD_EXIT -eq 0 || { echo "❌ Docker build failed (exit $$BUILD_EXIT). Check output above."; exit 1; }
	@echo ""
	@echo "✅ Development container image built"

# Main containerized bootstrap (DEFAULT when you run `make`)
docker-bootstrap:  ## 🐳 Full containerized bootstrap (DEFAULT)
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║  🐳 VITE GOURMAND — Containerized Development                ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🐳 Everything runs inside Docker containers."
	@echo "   Your host machine only needs Docker installed!"
	@echo ""
	@echo "Steps:"
	@echo "  1. 🏗️  Build dev container (Node.js 22 Alpine)"
	@echo "  2. 🔐 Fetch .env from Bitwarden (interactive)"
	@echo "  3. 📦 Install dependencies inside container"
	@echo "  4. 🔨 Generate Prisma client & compile TypeScript"
	@echo "  5. 🚀 Start dev servers inside container"
	@echo ""
	@# Step 1: Build dev image
	@$(MAKE) --no-print-directory docker-build-dev
	@# Step 2: Fetch secrets (uses existing bw-fetch-env.sh which uses Docker)
	@$(MAKE) --no-print-directory step-1-secrets
	@# Step 3-5: Run install, compile, and start inside the container
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║  🐳 Starting Development Environment                         ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@$(DOCKER_COMPOSE) --profile dev up -d dev
	@echo "⏳ Waiting for container to start..."
	@sleep 3
	@# Install dependencies inside container
	@echo ""
	@echo "📦 [1/3] Installing Backend dependencies (inside container)..."
	@$(DOCKER_COMPOSE) exec dev sh -c "cd /app/Back && npm install --loglevel=error"
	@echo ""
	@echo "📦 [2/3] Installing Frontend dependencies (inside container)..."
	@$(DOCKER_COMPOSE) exec dev sh -c "cd /app/View && npm install --loglevel=error"
	@echo ""
	@echo "📦 [3/3] Generating Prisma client..."
	@# Clean generated directory first to avoid stale files conflict
	@$(DOCKER_COMPOSE) exec dev sh -c "rm -rf /app/Back/generated/prisma 2>/dev/null || true"
	@$(DOCKER_COMPOSE) exec dev sh -c "cd /app/Back && npx prisma generate"
	@echo ""
	@echo "🔨 Checking TypeScript compilation..."
	@$(DOCKER_COMPOSE) exec dev sh -c "cd /app/Back && npx tsc --noEmit"
	@$(DOCKER_COMPOSE) exec dev sh -c "cd /app/View && npx tsc --noEmit"
	@echo "✅ TypeScript compiles cleanly"
	@echo ""
	@echo "🚀 Starting Backend server..."
	@$(DOCKER_COMPOSE) exec -d dev sh -c "cd /app/Back && npm run start:dev > /tmp/backend.log 2>&1"
	@echo "⏳ Waiting for Backend to be ready..."
	@sleep 3
	@for i in 1 2 3 4 5 6 7 8 9 10; do \
		if $(DOCKER_COMPOSE) exec dev sh -c "curl -s http://localhost:3000/api/site-info > /dev/null 2>&1"; then \
			echo "✅ Backend is ready!"; \
			break; \
		fi; \
		echo "   Attempt $$i/10 - waiting..."; \
		sleep 2; \
	done
	@echo ""
	@echo "🚀 Starting Frontend server..."
	@$(DOCKER_COMPOSE) exec -d dev sh -c "cd /app/View && npm run dev -- --host 0.0.0.0 > /tmp/frontend.log 2>&1"
	@sleep 3
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║  🎉 VITE GOURMAND — READY!                                   ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║                                                              ║"
	@echo "║  ✅ Running inside Docker (Node.js 22 Alpine)                ║"
	@echo "║  ✅ Secrets fetched from Bitwarden                           ║"
	@echo "║  ✅ Dependencies installed                                   ║"
	@echo "║  ✅ TypeScript compiled successfully                         ║"
	@echo "║  ✅ Development servers running                              ║"
	@echo "║                                                              ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║  🌐 URLS                                                     ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║  🖥️  Frontend  → http://localhost:$(FRONTEND_PORT)                   ║"
	@echo "║  🔧 Backend   → http://localhost:$(BACKEND_PORT)/api                 ║"
	@echo "║  📚 API Docs  → http://localhost:$(BACKEND_PORT)/api/docs            ║"
	@echo "║                                                              ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║  🗄️  PostgreSQL → Supabase (cloud-hosted)                    ║"
	@echo "║  🍃 MongoDB    → Atlas (cloud-hosted)                        ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║  📋 COMMANDS                                                 ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║  make stop      Stop containers                              ║"
	@echo "║  make shell     Open shell in container                      ║"
	@echo "║  make logs      View server logs                             ║"
	@echo "║  make restart   Restart servers                              ║"
	@echo "║  make fclean    Full cleanup                                 ║"
	@echo "║  make help      Show all commands                            ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""

# Alias for backward compatibility
docker-dev: docker-bootstrap  ## 🐳 Alias for docker-bootstrap

# Convenient short aliases
stop: docker-stop  ## 🛑 Stop the dev container (alias)
shell: docker-shell  ## 🐚 Open shell in container (alias)
restart: docker-restart  ## 🔄 Restart servers (alias)

# Interactive shell inside the dev container
docker-shell:  ## 🐳 Open an interactive shell inside the dev container
	@echo "🐳 Opening shell in development container..."
	@echo "   (Type 'exit' to leave)"
	@echo ""
	@$(DOCKER_COMPOSE) --profile dev exec dev /bin/bash || \
		$(DOCKER_COMPOSE) --profile dev run --rm dev /bin/bash

# View logs from inside the container
docker-logs:  ## 🐳 View dev server logs (inside container)
	@echo "═══ Backend Log (from container) ═══"
	@$(DOCKER_COMPOSE) exec dev tail -100 /tmp/backend.log 2>/dev/null || echo "(no log yet)"
	@echo ""
	@echo "═══ Frontend Log (from container) ═══"
	@$(DOCKER_COMPOSE) exec dev tail -100 /tmp/frontend.log 2>/dev/null || echo "(no log yet)"

# Also make 'logs' work for both Docker and local mode
logs:  ## 📋 View server logs
	@if $(DOCKER_COMPOSE) ps 2>/dev/null | grep -q "dev.*Up"; then \
		$(MAKE) --no-print-directory docker-logs; \
	else \
		echo "═══ Backend Log ═══"; \
		tail -50 /tmp/vg-backend.log 2>/dev/null || echo "(no log yet)"; \
		echo ""; \
		echo "═══ Frontend Log ═══"; \
		tail -50 /tmp/vg-frontend.log 2>/dev/null || echo "(no log yet)"; \
	fi

# Stop the dev container
docker-stop:  ## 🐳 Stop the development container
	@echo "🛑 Stopping development container..."
	@$(DOCKER_COMPOSE) --profile dev down
	@echo "✅ Development container stopped"

# Full Docker cleanup (removes volumes too)
docker-fclean:  ## 🐳 Full Docker clean: stop containers, remove volumes
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║  🧹 FULL DOCKER CLEAN — Removing containers & volumes        ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🛑 Stopping all containers..."
	@-$(DOCKER_COMPOSE) --profile dev --profile tools --profile production down 2>/dev/null || true
	@echo "🗑️  Removing Docker volumes (node_modules, npm-cache)..."
	@-docker volume rm vite-gourmand_back-node-modules 2>/dev/null || true
	@-docker volume rm vite-gourmand_view-node-modules 2>/dev/null || true
	@-docker volume rm vite-gourmand_npm-cache 2>/dev/null || true
	@echo "🗑️  Removing Back/.env..."
	@-rm -f $(BACKEND_PATH)/.env 2>/dev/null || true
	@echo ""
	@echo "✅ Docker cleanup complete. Run 'make' to start fresh."
	@echo ""

# Restart servers inside the container
docker-restart:  ## 🐳 Restart dev servers inside container
	@echo "🔄 Restarting servers inside container..."
	@# Kill existing processes
	@-$(DOCKER_COMPOSE) exec dev pkill -f "nest start" 2>/dev/null || true
	@-$(DOCKER_COMPOSE) exec dev pkill -f "vite" 2>/dev/null || true
	@sleep 2
	@# Start them again
	@$(DOCKER_COMPOSE) exec -d dev sh -c "cd /app/Back && npm run start:dev > /tmp/backend.log 2>&1"
	@$(DOCKER_COMPOSE) exec -d dev sh -c "cd /app/View && npm run dev -- --host 0.0.0.0 > /tmp/frontend.log 2>&1"
	@sleep 3
	@echo "✅ Servers restarted!"
	@echo ""
	@echo "  🖥️  Frontend → http://localhost:$(FRONTEND_PORT)"
	@echo "  🔧 Backend  → http://localhost:$(BACKEND_PORT)/api"

# ============================================
#  �🛠️ UTILITIES
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

fclean:  ## 🧹 NUCLEAR clean: ALL Docker images, containers, volumes + local files
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║  🧹 NUCLEAR CLEAN — Removing EVERYTHING                      ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@# Stop any local servers first
	@-$(MAKE) --no-print-directory turn-off 2>/dev/null || true
	@echo ""
	@echo "🛑 [1/7] Force stopping ALL project containers..."
	@# First attempt: normal docker commands
	@-docker kill $$(docker ps -q --filter "name=vite-gourmand") 2>/dev/null || true
	@-docker kill $$(docker ps -q --filter "name=vite_gourmand") 2>/dev/null || true
	@# Check if containers are still running
	@if docker ps -q --filter "name=vite-gourmand" --filter "name=vite_gourmand" 2>/dev/null | grep -q .; then \
		echo "   ⚠️  Containers still running - trying with elevated privileges..."; \
		sudo docker kill $$(sudo docker ps -q --filter "name=vite-gourmand") 2>/dev/null || true; \
		sudo docker kill $$(sudo docker ps -q --filter "name=vite_gourmand") 2>/dev/null || true; \
	fi
	@# Check again - if still running, AppArmor might be blocking
	@if docker ps -q --filter "name=vite-gourmand" --filter "name=vite_gourmand" 2>/dev/null | grep -q .; then \
		echo "   ⚠️  Containers STILL running - AppArmor may be blocking. Removing docker-default profile..."; \
		sudo aa-remove-unknown 2>/dev/null || true; \
		sudo systemctl restart docker 2>/dev/null || true; \
		sleep 2; \
		docker kill $$(docker ps -q --filter "name=vite-gourmand") 2>/dev/null || true; \
		docker kill $$(docker ps -q --filter "name=vite_gourmand") 2>/dev/null || true; \
	fi
	@echo "   ✅ Containers stopped"
	@echo ""
	@echo "🗑️  [2/7] Removing ALL project containers..."
	@-docker rm -f $$(docker ps -aq --filter "name=vite-gourmand") 2>/dev/null || true
	@-docker rm -f $$(docker ps -aq --filter "name=vite_gourmand") 2>/dev/null || true
	@# Fallback with sudo if needed
	@-sudo docker rm -f $$(sudo docker ps -aq --filter "name=vite-gourmand") 2>/dev/null || true
	@-sudo docker rm -f $$(sudo docker ps -aq --filter "name=vite_gourmand") 2>/dev/null || true
	@echo "   ✅ Containers removed"
	@echo ""
	@echo "🗑️  [3/7] Removing ALL project Docker images..."
	@-docker rmi -f vite-gourmand_dev vite-gourmand-dev 2>/dev/null || true
	@-docker rmi -f $$(docker images -q --filter "reference=vite-gourmand*") 2>/dev/null || true
	@-docker rmi -f $$(docker images -q --filter "reference=*vite-gourmand*") 2>/dev/null || true
	@-docker images --format '{{.Repository}}:{{.Tag}}' | grep -i vite | grep -i gourmand | xargs -r docker rmi -f 2>/dev/null || true
	@echo "   ✅ Images removed"
	@echo ""
	@echo "🗑️  [4/7] Removing ALL project Docker volumes..."
	@-docker volume rm -f $$(docker volume ls -q | grep -i vite | grep -i gourmand) 2>/dev/null || true
	@-docker volume rm -f vite-gourmand_back-node-modules vite-gourmand_view-node-modules vite-gourmand_npm-cache vite-gourmand_postgres-data vite-gourmand_mongo-data 2>/dev/null || true
	@echo "   ✅ Volumes removed"
	@echo ""
	@echo "🗑️  [5/7] Pruning dangling images & build cache..."
	@-docker image prune -f 2>/dev/null || true
	@-docker builder prune -f 2>/dev/null || true
	@echo "   ✅ Cache pruned"
	@echo ""
	@echo "🗑️  [6/7] Removing Back/.env & generated files..."
	@-rm -f $(BACKEND_PATH)/.env 2>/dev/null || true
	@-rm -rf $(BACKEND_PATH)/generated 2>/dev/null || true
	@echo "   ✅ Generated files removed"
	@echo ""
	@echo "🗑️  [7/7] Removing local node_modules, builds, logs..."
	@-rm -rf $(BACKEND_PATH)/node_modules 2>/dev/null || true
	@-rm -rf $(BACKEND_PATH)/dist 2>/dev/null || true
	@-rm -rf $(BACKEND_PATH)/coverage 2>/dev/null || true
	@-rm -f $(BACKEND_PATH)/package-lock.json 2>/dev/null || true
	@-rm -rf $(FRONTEND_PATH)/node_modules 2>/dev/null || true
	@-rm -rf $(FRONTEND_PATH)/dist 2>/dev/null || true
	@-rm -rf $(FRONTEND_PATH)/coverage 2>/dev/null || true
	@-rm -f $(FRONTEND_PATH)/package-lock.json 2>/dev/null || true
	@-rm -f $(BACKEND_PID) $(FRONTEND_PID) 2>/dev/null || true
	@-rm -f /tmp/vg-backend.log /tmp/vg-frontend.log 2>/dev/null || true
	@echo "   ✅ Local files removed"
	@echo ""
	@# Final verification
	@if docker ps -q --filter "name=vite-gourmand" --filter "name=vite_gourmand" 2>/dev/null | grep -q .; then \
		echo "⚠️  WARNING: Some containers may still exist. Manual intervention may be required."; \
		echo "   Try: sudo systemctl restart docker"; \
	else \
		echo "✅ NUCLEAR CLEAN COMPLETE. Run 'make' to bootstrap from scratch."; \
	fi
	@echo ""

re: fclean  ## 🔄 Full rebuild: fclean + make
	@$(MAKE) --no-print-directory all

# ============================================
#  📋 HELP
# ============================================

help:  ## Show this help message
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║     🍽️  VITE GOURMAND - Available Commands                    ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🐳 DEFAULT: Everything runs inside Docker containers."
	@echo "   Your machine only needs Docker installed!"
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
	@echo "Quick Reference:"
	@echo "  make               # Full bootstrap (Docker, default)"
	@echo "  make stop          # Stop containers"
	@echo "  make shell         # Shell in container"
	@echo "  make logs          # View logs"
	@echo "  make restart       # Restart dev servers"
	@echo "  make fclean        # Full cleanup"
	@echo "  make local         # Use host Node.js (not Docker)"
	@echo ""

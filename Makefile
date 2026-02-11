# ============================================
# VITE GOURMAND - MAKEFILE
# ============================================
# Usage: make <target>
# Run 'make help' to see all available targets
# ============================================

.PHONY: help
.DEFAULT_GOAL := help

# ── Variables ────────────────────────────────────────
DOCKER_COMPOSE   = docker compose
BACKEND_PATH     = ./Back
FRONTEND_PATH    = ./Front
SCRIPTS_PATH     = ./scripts
PRISMA_SCHEMA    = $(BACKEND_PATH)/src/Model/prisma/schema.prisma

# Load environment if available
-include $(BACKEND_PATH)/.env
export

# ============================================
#  🚀 QUICK START
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

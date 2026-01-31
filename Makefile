API_DIR := vite-gourmand-api
NPM := npm

.PHONY: install dev build start lint test prisma-generate prisma-migrate prisma-push db-init

install:
	@cd $(API_DIR) && $(NPM) install

dev:
	@cd $(API_DIR) && $(NPM) run start:dev

build:
	@cd $(API_DIR) && $(NPM) run build

start:
	@cd $(API_DIR) && $(NPM) run start:prod

lint:
	@cd $(API_DIR) && $(NPM) run lint

test:
	@cd $(API_DIR) && $(NPM) test

prisma-generate:
	@cd $(API_DIR) && npx prisma generate --schema=prisma/schema.prisma

prisma-migrate:
	@cd $(API_DIR) && npx prisma migrate dev --schema=prisma/schema.prisma

prisma-push:
	@cd $(API_DIR) && npx prisma db push --schema=prisma/schema.prisma

# Run the SQL init script against the DB referenced by the environment variable DATABASE_URL.
# Use double $$ so Make passes a literal $ to the shell.
db-init:
	@echo "Applying prisma/init.sql via psql (requires psql client and DATABASE_URL set)"
	@PSQL_CMD="$$(which psql 2>/dev/null || true)"; \
	if [ -z "$$PSQL_CMD" ]; then echo "psql not found in PATH"; exit 1; fi; \
	PSQL="$$PSQL_CMD"; \
	[ -z "$$DATABASE_URL" ] && echo "set DATABASE_URL environment variable (e.g. export DATABASE_URL='postgres://postgres:postgres@localhost:5432/vite_gourmand')" && exit 1; \
	$$PSQL "$$DATABASE_URL" -f vite-gourmand-api/prisma/init.sql

DOCKER_COMPOSE := docker-compose -f docker-compose.yml
DEFAULT_NPM := npm

.DEFAULT_GOAL := compose-up

.PHONY: compose-up compose-down compose-logs db-init

compose-up:
	$(DOCKER_COMPOSE) up -d --remove-orphans
	@echo "Waiting for postgres to be ready..."
	@until $(DOCKER_COMPOSE) exec -T postgres pg_isready -U postgres -d vite_gourmand >/dev/null 2>&1; do sleep 1; done
	@echo "Postgres is ready."

compose-down:
	$(DOCKER_COMPOSE) down --volumes

compose-logs:
	$(DOCKER_COMPOSE) logs -f

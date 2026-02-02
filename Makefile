
# Variables (defined first, before they're used)
DOCKER_COMPOSE = docker-compose
POSTGRES_SERVICE = vite-gourmand-db-1
POSTGRES_VOLUME = pgdata
PRISMA = npx prisma
BACKEND_PATH = ./backend
MIGRATIONS_PATH = $(BACKEND_PATH)/prisma/migrations

# Load DATABASE_URL from backend/.env
-include $(BACKEND_PATH)/.env
export DATABASE_URL
export MONGODB_URI

all: up wait-for-db wait-for-mongo install-backend generate-prisma init-migration reset

# Targets

up:  ## Start all containers in detached mode
	$(DOCKER_COMPOSE) up -d --build

down:  ## Stop and remove containers, keep persistent db volume
	$(DOCKER_COMPOSE) down

restart:  ## Restart all containers
	$(DOCKER_COMPOSE) restart

logs:  ## Show logs for all containers
	$(DOCKER_COMPOSE) logs -f

psql:  ## Open psql shell to the PostgreSQL container
	docker exec -it $(POSTGRES_SERVICE) psql -U postgres

wait-for-db:  ## Wait for PostgreSQL to accept connections
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec $(POSTGRES_SERVICE) pg_isready -U postgres; do sleep 1; done

wait-for-mongo:  ## Wait for MongoDB to accept connections
	@echo "Waiting for MongoDB to be ready..."
	@until docker exec vite-gourmand-mongo-1 mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do sleep 1; done
	@echo "MongoDB is ready!"

mongo-init: wait-for-mongo  ## Manually run MongoDB init script (runs automatically on first start)
	@echo "Running MongoDB initialization..."
	docker exec vite-gourmand-mongo-1 mongosh -u root -p example --authenticationDatabase admin vite_gourmand /docker-entrypoint-initdb.d/mongo-init.js

mongosh:  ## Open MongoDB shell
	docker exec -it vite-gourmand-mongo-1 mongosh -u root -p example --authenticationDatabase admin vite_gourmand

install-backend:  ## Install backend dependencies if not present
	@if [ ! -d "$(BACKEND_PATH)/node_modules" ]; then \
		echo "Installing backend dependencies..."; \
		cd $(BACKEND_PATH) && npm install; \
	else \
		echo "Backend dependencies already installed."; \
	fi

generate-prisma: install-backend  ## Generate Prisma Client from schema
	@echo "Generating Prisma Client..."
	cd $(BACKEND_PATH) && DATABASE_URL="$(DATABASE_URL)" $(PRISMA) generate --schema=prisma/schema.prisma

init-migration: install-backend generate-prisma  ## Create and apply initial migration if none exist
	@if [ ! -d "$(MIGRATIONS_PATH)" ] || [ -z "`ls -A $(MIGRATIONS_PATH) 2>/dev/null | grep -v '^\.\.'`" ]; then \
		echo "Creating initial migration..."; \
		cd $(BACKEND_PATH) && DATABASE_URL="$(DATABASE_URL)" $(PRISMA) migrate dev --name init --schema=prisma/schema.prisma; \
	else \
		echo "Migration already exists. Skipping initial migration."; \
	fi

migrate: install-backend generate-prisma  ## Run Prisma migrations on the database
	cd $(BACKEND_PATH) && DATABASE_URL="$(DATABASE_URL)" $(PRISMA) migrate deploy --schema=prisma/schema.prisma

reset: install-backend generate-prisma  ## Reset the database and load schema using Prisma (WARNING: destroys data)
	cd $(BACKEND_PATH) && DATABASE_URL="$(DATABASE_URL)" $(PRISMA) migrate reset --force --schema=prisma/schema.prisma

reload:  ## Reload PostgreSQL container and update the database schema (DANGER: destroys all data!)
	$(DOCKER_COMPOSE) restart db
	$(MAKE) wait-for-db
	cd $(BACKEND_PATH) && DATABASE_URL="$(DATABASE_URL)" $(PRISMA) migrate dev --name reload --schema=prisma/schema.prisma --create-only
	cd $(BACKEND_PATH) && DATABASE_URL="$(DATABASE_URL)" $(PRISMA) migrate reset --force --schema=prisma/schema.prisma

seed_db_playground: wait-for-db  ## Seed database with playground data (bcrypt-hashed passwords)
	@echo "🌱 Seeding database with playground data..."
	docker exec -i $(POSTGRES_SERVICE) psql -U postgres -d vite_gourmand < ./data/samples/seed_playground.sql
	@echo "✅ Playground data seeded successfully!"
	@echo "📋 Login credentials:"
	@echo "   Admin:   admin@vitegourmand.fr / Admin123!"
	@echo "   Manager: manager@vitegourmand.fr / Manager123!"
	@echo "   Client:  alice.dupont@email.fr / Client123!"

test_backend: wait-for-db  ## Run all backend tests (unit + e2e)
	@echo "🧪 Running backend tests..."
	cd $(BACKEND_PATH) && npm run test
	@echo "✅ Unit tests completed!"

test_backend_e2e: wait-for-db  ## Run backend E2E tests only
	@echo "🧪 Running backend E2E tests..."
	cd $(BACKEND_PATH) && npm run test:e2e
	@echo "✅ E2E tests completed!"

test_backend_orders: wait-for-db  ## Run order lifecycle tests
	@echo "🧪 Running order lifecycle tests..."
	cd $(BACKEND_PATH) && npm run test:orders
	@echo "✅ Order tests completed!"

test_backend_flows: wait-for-db  ## Run API flow simulation tests
	@echo "🧪 Running API flow tests..."
	cd $(BACKEND_PATH) && npm run test:flows
	@echo "✅ Flow tests completed!"

seed_test_data: wait-for-db  ## Seed database with test data (all order statuses)
	@echo "🌱 Seeding database with test data..."
	cd $(BACKEND_PATH) && npm run seed:test
	@echo "✅ Test data seeded successfully!"

diagnostic:  ## Run the diagnostic script (interactive REPL)
	bash ./scripts/diagnostic.sh

diagnostic-routines:  ## Check backend routines configuration
	bash ./scripts/diagnostic.sh routines

diagnostic-rgpd:  ## Check RGPD compliance
	bash ./scripts/diagnostic.sh rgpd

diagnostic-all:  ## Run all diagnostics
	bash ./scripts/diagnostic.sh all

clean:  ## Remove all containers, networks, and images (keep db volume)
	$(DOCKER_COMPOSE) down --rmi all

fclean:  ## Remove all containers and images for this project, keep volumes
	$(DOCKER_COMPOSE) down --rmi all

prune:  ## Remove all containers, networks, images, and volumes (including db)
	$(DOCKER_COMPOSE) down -v --rmi all
	docker volume rm $(POSTGRES_VOLUME) || true

destroy:  ## Remove all containers, images, and volumes for this project
	$(DOCKER_COMPOSE) down -v --rmi all
	docker volume rm $(POSTGRES_VOLUME) || true

restore:  ## Install dependencies in both frontend and backend
	(cd frontend ; npm install)
	(cd backend ; npm install)

help:  ## Show this help message
	@echo "Available targets:"
	@echo "  all            Build images, start services, install deps, generate Prisma client, and migrate DB (default)"
	@echo "  up             Start all containers (detached)"
	@echo "  down           Stop and remove containers, keep persistent db volume"
	@echo "  restart        Restart all containers"
	@echo "  logs           Show logs for all containers"
	@echo "  psql           Open psql shell to the PostgreSQL container"
	@echo "  mongosh        Open MongoDB shell"
	@echo "  wait-for-db    Wait for PostgreSQL to accept connections"
	@echo "  wait-for-mongo Wait for MongoDB to accept connections"
	@echo "  mongo-init     Manually run MongoDB init script"
	@echo "  install-backend Install backend dependencies if not present"
	@echo "  generate-prisma Generate Prisma Client from schema"
	@echo "  init-migration Create and apply initial migration if none exist"
	@echo "  migrate        Run Prisma migrations on the database"
	@echo "  reset          Reset the database and load schema using Prisma (WARNING: destroys data)"
	@echo "  reload         Reload PostgreSQL container and reset DB schema (DANGER: destroys all data!)"
	@echo "  seed_db_playground  Seed database with playground data (bcrypt-hashed passwords)"
	@echo ""
	@echo "Postman/Newman:"
	@echo "  postman-auth   Run auth collection via Newman"
	@echo "  postman-all    Run all Postman collections"
	@echo "  postman-docker Run all collections via Docker"
	@echo "  postman-report Run collections with HTML report"
	@echo ""
	@echo "Diagnostics:"
	@echo "  diagnostic     Run the diagnostic script (interactive REPL)"
	@echo "  diagnostic-routines  Check backend routines configuration"
	@echo "  diagnostic-rgpd      Check RGPD compliance"
	@echo "  diagnostic-all       Run all diagnostics"
	@echo "  clean          Remove all containers, networks, and images (keep db volume)"
	@echo "  fclean         Remove all containers and images (keep volumes)"
	@echo "  prune          Remove all containers, networks, images, and volumes (including db)"
	@echo "  destroy        Remove all containers, images, and volumes"
	@echo "  restore        Install dependencies in both frontend and backend"
	@echo "  help           Show this help message"

# ==========================================
# POSTMAN CLI TARGETS (Official)
# ==========================================

postman-install:  ## Install official Postman CLI
	./scripts/postman-cli.sh install

postman-login:  ## Login to Postman (opens browser)
	./scripts/postman-cli.sh login

postman-list:  ## List your Postman Cloud collections
	./scripts/postman-cli.sh list

postman-run:  ## Run collection by ID: make postman-run ID=<collection-id>
	@if [ -z "$(ID)" ]; then \
		echo "Usage: make postman-run ID=<collection-id>"; \
		echo "Get collection ID from Postman UI → Info tab"; \
		exit 1; \
	fi
	./scripts/postman-cli.sh run $(ID)

postman-local:  ## Run local auth.json collection file
	./scripts/postman-cli.sh run-local backend/postman/auth.json

postman-local-all:  ## Run all local collection files
	./scripts/postman-cli.sh run-local backend/postman/auth.json
	./scripts/postman-cli.sh run-local backend/postman/orders.json
	./scripts/postman-cli.sh run-local backend/postman/admin.json

.PHONY: help restore destroy prune fclean clean diagnostic-all diagnostic-rgpd diagnostic diagnostic-routines seed-test-data test_backend test_backend_flows all up down restart logs psql wait-for-db wait-for-mongo mongo-init mongosh install-backend generate-prisma init-migration migrate reset reload seed_db_playground seed_playground seed_test_data test_backend test_backend_e2e test_backend_orders test_backend_flows postman-install postman-login postman-list postman-run postman-local postman-local-all
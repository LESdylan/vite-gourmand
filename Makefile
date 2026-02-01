# Cross-platform Makefile for Docker Compose and PostgreSQL with Prisma migration
# Load environment variables from .env file (backend/.env contains DATABASE_URL for Prisma)

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

# Default target
.PHONY: all
all: up wait-for-db wait-for-mongo install-backend generate-prisma init-migration reset

# Targets

.PHONY: up
up:  ## Start all containers in detached mode
	$(DOCKER_COMPOSE) up -d --build

.PHONY: down
down:  ## Stop and remove containers, keep persistent db volume
	$(DOCKER_COMPOSE) down

.PHONY: restart
restart:  ## Restart all containers
	$(DOCKER_COMPOSE) restart

.PHONY: logs
logs:  ## Show logs for all containers
	$(DOCKER_COMPOSE) logs -f

.PHONY: psql
psql:  ## Open psql shell to the PostgreSQL container
	docker exec -it $(POSTGRES_SERVICE) psql -U postgres

.PHONY: wait-for-db
wait-for-db:  ## Wait for PostgreSQL to accept connections
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec $(POSTGRES_SERVICE) pg_isready -U postgres; do sleep 1; done

.PHONY: wait-for-mongo
wait-for-mongo:  ## Wait for MongoDB to accept connections
	@echo "Waiting for MongoDB to be ready..."
	@until docker exec vite-gourmand-mongo-1 mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do sleep 1; done
	@echo "MongoDB is ready!"

.PHONY: mongo-init
mongo-init: wait-for-mongo  ## Manually run MongoDB init script (runs automatically on first start)
	@echo "Running MongoDB initialization..."
	docker exec vite-gourmand-mongo-1 mongosh -u root -p example --authenticationDatabase admin vite_gourmand /docker-entrypoint-initdb.d/mongo-init.js

.PHONY: mongosh
mongosh:  ## Open MongoDB shell
	docker exec -it vite-gourmand-mongo-1 mongosh -u root -p example --authenticationDatabase admin vite_gourmand

.PHONY: install-backend
install-backend:  ## Install backend dependencies if not present
	@if [ ! -d "$(BACKEND_PATH)/node_modules" ]; then \
		echo "Installing backend dependencies..."; \
		cd $(BACKEND_PATH) && npm install; \
	else \
		echo "Backend dependencies already installed."; \
	fi

.PHONY: generate-prisma
generate-prisma: install-backend  ## Generate Prisma Client from schema
	@echo "Generating Prisma Client..."
	cd $(BACKEND_PATH) && DATABASE_URL="$(DATABASE_URL)" $(PRISMA) generate --schema=prisma/schema.prisma

.PHONY: init-migration
init-migration: install-backend generate-prisma  ## Create and apply initial migration if none exist
	@if [ ! -d "$(MIGRATIONS_PATH)" ] || [ -z "`ls -A $(MIGRATIONS_PATH) 2>/dev/null | grep -v '^\.\.'`" ]; then \
		echo "Creating initial migration..."; \
		cd $(BACKEND_PATH) && DATABASE_URL="$(DATABASE_URL)" $(PRISMA) migrate dev --name init --schema=prisma/schema.prisma; \
	else \
		echo "Migration already exists. Skipping initial migration."; \
	fi

.PHONY: migrate
migrate: install-backend generate-prisma  ## Run Prisma migrations on the database
	cd $(BACKEND_PATH) && DATABASE_URL="$(DATABASE_URL)" $(PRISMA) migrate deploy --schema=prisma/schema.prisma

.PHONY: reset
reset: install-backend generate-prisma  ## Reset the database and load schema using Prisma (WARNING: destroys data)
	cd $(BACKEND_PATH) && DATABASE_URL="$(DATABASE_URL)" $(PRISMA) migrate reset --force --schema=prisma/schema.prisma

.PHONY: reload
reload:  ## Reload PostgreSQL container and update the database schema (DANGER: destroys all data!)
	$(DOCKER_COMPOSE) restart db
	$(MAKE) wait-for-db
	cd $(BACKEND_PATH) && DATABASE_URL="$(DATABASE_URL)" $(PRISMA) migrate dev --name reload --schema=prisma/schema.prisma --create-only
	cd $(BACKEND_PATH) && DATABASE_URL="$(DATABASE_URL)" $(PRISMA) migrate reset --force --schema=prisma/schema.prisma

.PHONY: diagnostic
diagnostic:  ## Run the diagnostic script
	bash ./scripts/diagnostic.sh

.PHONY: clean
clean:  ## Remove all containers, networks, and images (keep db volume)
	$(DOCKER_COMPOSE) down --rmi all

.PHONY: fclean
fclean:  ## Remove all containers and images for this project, keep volumes
	$(DOCKER_COMPOSE) down --rmi all

.PHONY: prune
prune:  ## Remove all containers, networks, images, and volumes (including db)
	$(DOCKER_COMPOSE) down -v --rmi all
	docker volume rm $(POSTGRES_VOLUME) || true

.PHONY: destroy
destroy:  ## Remove all containers, images, and volumes for this project
	$(DOCKER_COMPOSE) down -v --rmi all
	docker volume rm $(POSTGRES_VOLUME) || true

.PHONY: restore
restore:  ## Install dependencies in both frontend and backend
	(cd frontend ; npm install)
	(cd backend ; npm install)

.PHONY: help
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
	@echo "  diagnostic     Run the diagnostic script"
	@echo "  clean          Remove all containers, networks, and images (keep db volume)"
	@echo "  fclean         Remove all containers and images (keep volumes)"
	@echo "  prune          Remove all containers, networks, images, and volumes (including db)"
	@echo "  destroy        Remove all containers, images, and volumes"
	@echo "  restore        Install dependencies in both frontend and backend"
	@echo "  help           Show this help message"

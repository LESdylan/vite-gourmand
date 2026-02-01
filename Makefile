MIGRATIONS_PATH = $(BACKEND_PATH)/prisma/migrations

# Default target: build images, start services, wait for db, migrate
.PHONY: all
all: up wait-for-db reset
all: up wait-for-db init-migration reset

.PHONY: init-migration
init-migration:
	@if [ ! -d "$(MIGRATIONS_PATH)" ] || [ -z "`ls -A $(MIGRATIONS_PATH) 2>/dev/null | grep -v '^\.\.'`" ]; then \
		cd $(BACKEND_PATH) && $(PRISMA) migrate dev --name init --schema=prisma/schema.prisma; \
	else \
		echo "Migration already exists. Skipping initial migration."; \
	fi



.PHONY: diagnostic
diagnostic:  ## Run the diagnostic REPL script
	bash ./scripts/diagnostic.sh



.PHONY: fclean
fclean:  ## Remove all containers and images for this project, keep volumes
	$(DOCKER_COMPOSE) down --rmi all

.PHONY: destroy
destroy:  ## Remove all containers, images, and volumes for this project
	$(DOCKER_COMPOSE) down -v --rmi all
	docker volume rm $(POSTGRES_VOLUME) || true
# Cross-platform Makefile for Docker Compose and PostgreSQL

# Variables
DOCKER_COMPOSE = docker-compose
POSTGRES_SERVICE = vite-gourmand-db-1
POSTGRES_VOLUME = pgdata
PRISMA = npx prisma
BACKEND_PATH = ./backend




# Make 'all' the first target so 'make' runs the full setup

.PHONY: help
help:
	@echo "Available targets:"
	@echo "  all        Build images, start services, migrate DB (default)"
	@echo "  up         Start all containers (detached)"
	@echo "  down       Stop and remove all containers, networks, and volumes (except persistent db)"
	@echo "  restart    Restart all containers"
	@echo "  logs       Show logs for all containers"
	@echo "  psql       Open psql shell to the PostgreSQL container"
	@echo "  migrate    Run Prisma migrations on the database"
	@echo "  clean      Remove all containers, networks, and images (keeps persistent db volume)"
	@echo "  prune      Remove all containers, networks, images, and volumes (including db)"
	@echo "  fclean     Remove all containers and images (keep volumes)"
	@echo "  destroy    Remove all containers, images, and volumes (everything)"
	@echo "  diagnostic Run the diagnostic REPL script"
	@echo "  init-migration Create and apply initial migration if none exist"

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



.PHONY: migrate
migrate:  ## Run Prisma migrations on the database
	cd $(BACKEND_PATH) && $(PRISMA) migrate deploy --schema=prisma/schema.prisma

.PHONY: reset
reset:  ## Reset the database and load schema using Prisma
	cd $(BACKEND_PATH) && $(PRISMA) migrate reset --force --schema=prisma/schema.prisma

.PHONY: wait-for-db
wait-for-db:
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec $(POSTGRES_SERVICE) pg_isready -U postgres; do sleep 1; done

.PHONY: clean
clean:  ## Remove all containers, networks, and images (keep db volume)
	$(DOCKER_COMPOSE) down --rmi all

.PHONY: prune
prune:  ## Remove all containers, networks, images, and volumes (including db)
	$(DOCKER_COMPOSE) down -v --rmi all
	docker volume rm $(POSTGRES_VOLUME) || true

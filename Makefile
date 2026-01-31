# =====================================================
# Makefile – Cross-platform (Windows + Linux/macOS)
# =====================================================

# Paths & URLs
VENDOR_DIR := ./vendor
REMOTE_SCRIPT := https://github.com/Univers42/scripts.git
COMPOSE_FILE := docker-compose.yml
RM_NODE := node -e "const fs = require('fs'); fs.rmSync(process.argv[1], { recursive: true, force: true });"

# =====================================================
# Default target
# =====================================================
all: check-env vendor up

# =====================================================
# Environment check
# Works on Linux/macOS and Windows (PowerShell)
# =====================================================
check-env:
	@echo "Checking environment..."
	@node -e "try { require('child_process').execSync('node -v', { stdio: 'inherit' }) } catch(e){ console.error('Node.js not found'); process.exit(1) }"
	@node -e "try { require('child_process').execSync('docker -v', { stdio: 'inherit' }) } catch(e){ console.error('Docker not found'); process.exit(1) }"
	@node -e "const fs = require('fs'); if (fs.existsSync('.env')) { console.log('.env found ✅') } else { console.error('.env missing ❌'); process.exit(1) }"

# =====================================================
# Vendor scripts
# =====================================================
vendor: set_scripts

VENDOR_DIR := ./vendor
REMOTE_SCRIPT := https://github.com/Univers42/scripts.git

set_scripts:
	@echo "Setting up vendor scripts..."
	@node -e "\
		const fs = require('fs'); \
		const { execSync } = require('child_process'); \
		if (!fs.existsSync('$(VENDOR_DIR)/scripts')) { \
			console.log('Cloning vendor scripts...'); \
			fs.mkdirSync('$(VENDOR_DIR)', { recursive: true }); \
			execSync('git clone $(REMOTE_SCRIPT) $(VENDOR_DIR)/scripts', { stdio: 'inherit' }); \
		} else { \
			console.log('Vendor scripts already exist, pulling latest...'); \
			execSync('git -C $(VENDOR_DIR)/scripts pull', { stdio: 'inherit' }); \
		} \
	"


# =====================================================
# Docker targets
# =====================================================
build:
	@echo "Building Docker containers..."
	docker-compose -f $(COMPOSE_FILE) build

up:
	@echo "Starting Docker containers..."
	docker-compose -f $(COMPOSE_FILE) up -d

down:
	@echo "Stopping Docker containers..."
	docker-compose -f $(COMPOSE_FILE) down

restart: down up

logs:
	@echo "Tailing Docker logs..."
	docker-compose -f $(COMPOSE_FILE) logs -f

ps:
	@echo "Showing running containers..."
	docker-compose -f $(COMPOSE_FILE) ps

# =====================================================
# Clean targets
# =====================================================
clean: fclean

fclean:
	@echo "Cleaning vendor scripts..."
	$(RM_NODE) $(VENDOR_DIR)
	@echo "Stopping and removing Docker containers and volumes..."
	docker-compose -f $(COMPOSE_FILE) down -v --rmi all

re: fclean all

# =====================================================
# Diagnostics
# =====================================================
diagnostic:
	@echo "Docker version:"; docker --version
	@echo "Docker Compose version:"; docker-compose --version
	@echo "Running containers:"; docker ps
	@if [ -d "$(VENDOR_DIR)/scripts" ]; then echo "Vendor scripts present ✅"; else echo "Vendor scripts missing ❌"; fi

# =====================================================
# Prisma targets (optional)
# =====================================================
prisma-migrate:
	@echo "Running Prisma migrate..."
	@node -r dotenv/config -e "require('child_process').execSync('npx prisma migrate dev --name init', { stdio: 'inherit' })"

prisma-generate:
	@echo "Generating Prisma client..."
	@node -r dotenv/config -e "require('child_process').execSync('npx prisma generate', { stdio: 'inherit' })"

.PHONY: all check-env vendor set_scripts build up down restart logs ps clean fclean re diagnostic prisma-migrate prisma-generate

# Developer shortcuts. Run `make help` for the list.
COMPOSE := docker compose
APP     := $(COMPOSE) exec app

.DEFAULT_GOAL := help
.PHONY: help setup env ports build install key migrate up down restart ps logs shell test check types build-assets mysql redis

help: ## Show available commands
	@grep -hE '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-13s %s\n", $$1, $$2}'

setup: env ports build ## First-time setup: .env, image, dependencies, key, database, start
	$(COMPOSE) up -d mysql redis
	$(COMPOSE) run --rm --no-deps app composer install
	$(COMPOSE) run --rm --no-deps app pnpm install --frozen-lockfile
	$(COMPOSE) run --rm --no-deps app php artisan key:generate
	$(COMPOSE) run --rm app php artisan migrate
	$(COMPOSE) up -d
	@echo "Ready: http://localhost:$$(grep -E '^APP_PORT=' .env | cut -d= -f2)"

env: ## Create .env from .env.example with your UID/GID and random passwords (keeps an existing .env)
	@if [ -f .env ]; then echo ".env exists, keeping it"; else \
		cp .env.example .env; \
		sed -i "s/^UID=.*/UID=$$(id -u)/; s/^GID=.*/GID=$$(id -g)/" .env; \
		for k in DB_PASSWORD DB_ROOT_PASSWORD REDIS_PASSWORD; do \
			sed -i "s/^$$k=.*/$$k=$$(openssl rand -hex 16)/" .env; \
		done; \
		echo ".env created"; \
	fi

ports: ## Check that the host ports in .env are free
	@for k in APP_PORT VITE_PORT MYSQL_FORWARD_PORT REDIS_FORWARD_PORT; do \
		p=$$(grep -E "^$$k=" .env | cut -d= -f2); \
		if ss -ltnH "sport = :$$p" | grep -q . && ! docker ps --format '{{.Names}} {{.Ports}}' | grep '^bi-ygk-' | grep -q ":$$p->"; then \
			echo "  $$k=$$p is in use: change it in .env"; exit 1; \
		else echo "  $$k=$$p ok"; fi; \
	done

build: ## Build the app image
	$(COMPOSE) build

up: ## Start the stack
	$(COMPOSE) up -d

down: ## Stop the stack (data is kept)
	$(COMPOSE) stop

restart: ## Restart the app container (needed after editing vite.config.ts or .env)
	$(COMPOSE) restart app

ps: ## Show container status
	$(COMPOSE) ps

logs: ## Follow app logs (server, queue, Pail, Vite)
	$(COMPOSE) logs -f app

shell: ## Open a shell in the app container
	$(APP) bash

test: ## Run the PHP test suite
	$(APP) php artisan test --compact

check: ## Lint + format check (frontend)
	$(APP) pnpm run check

types: ## TypeScript type check
	$(APP) pnpm run types:check

build-assets: ## Production frontend build
	$(APP) pnpm run build

migrate: ## Run database migrations
	$(APP) php artisan migrate

mysql: ## Open a MySQL shell
	$(COMPOSE) exec mysql sh -c 'mysql -u"$$MYSQL_USER" -p"$$MYSQL_PASSWORD" "$$MYSQL_DATABASE"'

redis: ## Open a Redis shell
	$(COMPOSE) exec redis sh -c 'redis-cli --no-auth-warning -a "$$REDIS_PASSWORD"'

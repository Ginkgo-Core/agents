SHELL := /bin/bash

.PHONY: secrets validate build up down logs ps channels media clean

secrets:
	@echo "N8N_ENCRYPTION_KEY=$$(openssl rand -hex 32)"
	@echo "INTERNAL_SERVICE_TOKEN=$$(openssl rand -hex 32)"
	@echo "LITELLM_MASTER_KEY=sk-$$(openssl rand -hex 32)"
	@echo "HERMES_API_KEY=$$(openssl rand -hex 32)"
	@echo "POSTGRES_PASSWORD=$$(openssl rand -hex 24)"
	@echo "REDIS_PASSWORD=$$(openssl rand -hex 24)"

validate:
	./scripts/validate.sh

build:
	docker compose build

up:
	docker compose up -d --build

channels:
	docker compose --profile channels up -d

media:
	docker compose --profile media up -d

down:
	docker compose down

logs:
	docker compose logs -f --tail=200

ps:
	docker compose ps

clean:
	docker compose down -v
	rm -rf data

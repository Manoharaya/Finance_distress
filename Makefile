.PHONY: build up down logs ps shell-backend shell-frontend

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

ps:
	docker-compose ps

dev:
	docker-compose up --build

# Backend commands
backend-migrate:
	docker-compose exec backend alembic upgrade head

backend-makemigrations:
	docker-compose exec backend alembic revision --autogenerate -m "$(msg)"

# Seed data
seed:
	docker-compose exec backend python app/seed.py

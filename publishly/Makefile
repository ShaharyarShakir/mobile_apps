.PHONY: setup up down lint format test migrate-create migrate-apply status

# Environment configuration
export PYTHON_VERSION := 3.13

# Setup development environments for both backend and mobile
setup:
	@echo "Setting up backend development environment using uv..."
	cd backend && uv sync
	@echo "Setting up mobile development environment using bun..."
	cd mobile && bun install

# Spin up Docker Compose services
up:
	docker-compose up --build -d

# Tear down Docker Compose services
down:
	docker-compose down

# Run linting and type checking for both backend and mobile
lint:
	@echo "Linting and type checking backend..."
	cd backend && uv run ruff check . && uv run mypy app
	@echo "Linting and type checking mobile..."
	cd mobile && bun run lint

# Automatically format code for both backend and mobile
format:
	@echo "Formatting backend code..."
	cd backend && uv run ruff format .
	@echo "Formatting mobile code..."
	cd mobile && bun run format

# Create database migrations using Alembic (use make migrate-create msg="migration name")
migrate-create:
	@echo "Generating database migrations..."
	@if [ -z "$(msg)" ]; then \
		echo "Error: Must specify migration message. Usage: make migrate-create msg='migration description'"; \
		exit 1; \
	fi
	cd backend && uv run alembic revision --autogenerate -m "$(msg)"

# Apply database migrations
migrate-apply:
	@echo "Applying database migrations..."
	cd backend && uv run alembic upgrade head

# Run backend unit and integration tests
test:
	@echo "Running backend test suite..."
	cd backend && uv run pytest -v

# View container status
status:
	docker-compose ps

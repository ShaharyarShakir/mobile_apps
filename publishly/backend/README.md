# PostPilot AI - Backend Service

This is the FastAPI backend service for **PostPilot AI**, built with Python 3.13, SQLAlchemy 2.0, PostgreSQL, Alembic, and Redis.

## Architecture

The backend follows a decoupled, modular Repository-Service-API architecture:

```text
[HTTP Client] 
     │
     ▼
[API Endpoints] (app/api/) ──► Handles request validation & routing
     │
     ▼
[Service Layer] (app/services/) ──► Orchestrates business logic
     │
     ▼
[Repositories] (app/repositories/) ──► Abstracts SQLAlchemy queries
     │
     ▼
[Database Model] (app/models/) ──► Maps tables to Python classes
```

- **Models**: Defines database schemas using SQLAlchemy Declarative Mapping.
- **Schemas**: Defines API request/response validation contracts using Pydantic.
- **Repositories**: Standardizes database interactions (CRUD). Helps isolate SQL-specific implementations from services.
- **Services**: Contains the core business logic (e.g. password hashing on create, calculating stats).
- **API**: Controllers registering endpoint routes, mapping exceptions, and parsing inputs.

---

## Local Setup

Ensure you have created and configured a virtual environment using `uv` (handled automatically by `make setup` in root):

```bash
# Verify packages are in sync
uv sync
```

### Environment Settings
Copy the `.env.example` to `.env` and configure credentials:
```bash
cp .env.example .env
```
Key configurations include:
- `DATABASE_URL`: PostgreSQL connection URI. Use `postgresql+asyncpg://` schema for SQLAlchemy 2.0 async connections.
- `REDIS_URL`: Redis caching instance URI.

---

## Running Database Migrations

This project uses Alembic to manage schemas asynchronously:

1. **Auto-generate a new migration revision**:
   If you add or modify model tables under `app/models/`, run:
   ```bash
   # From root directory:
   make migrate-create msg="describe_your_changes"
   ```
2. **Apply migrations to PostgreSQL**:
   ```bash
   # From root directory:
   make migrate-apply
   ```
3. **Downgrade migrations**:
   If you need to roll back, run:
   ```bash
   uv run alembic downgrade -1
   ```

---

## Running Tests

Unit and integration tests are powered by `pytest` and `pytest-asyncio`. Run them via:

```bash
# From root directory:
make test

# Or directly within backend:
uv run pytest -v
```

Tests use the configuration defined in `pyproject.toml` and are placed inside `tests/` directory.

---

## Tooling & Quality Standards

- **Formatting & Linting**: Ruff handles both import sorting and formatting. Check lint issues by running `uv run ruff check .` and formatting with `uv run ruff format .`.
- **Typing Checks**: Mypy verifies type annotations statically. Run `uv run mypy app`.

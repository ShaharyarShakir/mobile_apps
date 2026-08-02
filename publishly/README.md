# PostPilot AI - Monorepo Foundation

This is the production-ready foundation for **PostPilot AI**, a modern SaaS application structured as a monorepo featuring a FastAPI backend and a React Native Expo mobile application.

## Monorepo Structure

```text
postpilot-ai/
├── .github/workflows/    # CI pipelines (GitHub Actions)
├── backend/              # FastAPI Python Web Service
│   ├── app/              # Core application code (modular architecture)
│   │   ├── api/          # Endpoints and routers
│   │   ├── core/         # Core config & utilities
│   │   ├── models/       # SQLAlchemy 2.0 models
│   │   ├── repositories/ # Repository pattern CRUD layers
│   │   ├── schemas/      # Pydantic schemas (data validate)
│   │   └── services/     # Business logic layers
│   ├── migrations/       # Alembic migrations history
│   └── tests/            # Test suite
├── mobile/               # React Native Expo Mobile App
│   ├── src/              # Source code
│   │   ├── api/          # Axios client and React Query hooks
│   │   ├── app/          # Expo Router pages (file-based routing)
│   │   ├── store/        # Zustand state store
│   │   └── components/   # Shared UI components
│   └── assets/           # Dynamic image assets
├── Makefile              # Local task automation runner
└── docker-compose.yml    # Database & Cache container environments
```

---

## Technical Stack

### Backend
- **Core Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.13)
- **Database ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (Asynchronous operations)
- **Database Migrations**: [Alembic](https://alembic.sqlalchemy.org/) (Async-migration enabled)
- **Caching & KV store**: [Redis](https://redis.io/)
- **Linter & Formatter**: [Ruff](https://github.com/astral-sh/ruff)
- **Static Type Checker**: [mypy](http://mypy-lang.org/)
- **Package Manager**: [uv](https://github.com/astral-sh/uv)

### Mobile App (React Native Expo)
- **Core Framework**: [Expo SDK 57](https://expo.dev/) (React Native 0.86)
- **Routing Engine**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based router)
- **Styling Engine**: [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Global reactive store)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest) (Server state caching)
- **Network Client**: [Axios](https://axios-http.com/) (Request & response interceptors)
- **Linting & Format**: [ESLint](https://eslint.org/) (Expo config) & [Prettier](https://prettier.io/)
- **Package Manager**: [Bun](https://bun.sh/)

---

## Quick Start

### 1. Prerequisites
Ensure you have the following installed on your local development machine:
- Docker and Docker Compose
- [Bun](https://bun.sh/)
- [uv](https://github.com/astral-sh/uv)
- Node.js (v18+)
- Python (3.13)

### 2. Initial Setup
Run the setup command to configure backend virtual environments and download mobile `node_modules`:
```bash
make setup
```

### 3. Setup Environment Variables
Configure local environment files by duplicating the provided examples:
```bash
cp backend/.env.example backend/.env
cp mobile/.env.example mobile/.env
```

### 4. Running Backend Services
Spin up PostgreSQL, Redis, and the FastAPI backend server using Docker Compose:
```bash
make up
```
Check status of the containers:
```bash
make status
```
Access the backend OpenAPI documentation directly at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 5. Running Database Migrations
Apply Alembic migrations to setup database tables:
```bash
make migrate-apply
```

### 6. Running Mobile Application
Start the Expo development server:
```bash
cd mobile
bun run start
```
You can press `w` to open it in the web browser, or use iOS/Android emulators.

---

## Development Automation Reference

Use the provided `Makefile` shortcuts to coordinate local validation:

- **Lint and type check everything**:
  ```bash
  make lint
  ```
- **Format all source code**:
  ```bash
  make format
  ```
- **Create database migration revision**:
  ```bash
  make migrate-create msg="add_user_profile_table"
  ```
- **Apply migrations**:
  ```bash
  make migrate-apply
  ```
- **Run python test suite**:
  ```bash
  make test
  ```
- **Shut down local docker containers**:
  ```bash
  make down
  ```

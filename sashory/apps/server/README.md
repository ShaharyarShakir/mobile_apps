# Cashory Server API 🚀

> High-performance, type-safe REST API built with **Hono v4**, **Bun runtime**, **Drizzle ORM**, **PostgreSQL**, and **Better-Auth**.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Architecture & Design](#architecture--design)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [API Endpoints Reference](#api-endpoints-reference)
- [Error Handling & Observability](#error-handling--observability)
- [Available Scripts](#available-scripts)
- [Testing](#testing)

---

## 🌟 Overview

The Cashory Server API powers the Cashory mobile experience. It provides secure user authentication, multi-currency financial account operations, hierarchical income/expense category management, and project-based financial goal tracking.

### Key Capabilities:
- ⚡ **Ultra-Fast Performance**: Built on top of Hono and Bun for minimal latency and memory footprint.
- 🔒 **Session Authentication**: Better-Auth integration with secure session cookies and Bearer token fallback.
- 🗄️ **Type-Safe ORM**: Drizzle ORM ensures compile-time query correctness and relationship integrity with PostgreSQL.
- 🛡️ **Scoped Multi-Tenancy**: All resources are strictly scoped to the authenticated user ID at the service layer.
- 🆔 **Request Tracing**: End-to-end `x-request-id` propagation across all endpoints, logs, and error responses.

---

## 🏗️ Architecture & Design

The server adopts a clean, layered architecture:

```
Request ──▶ Middleware (Auth, CORS, Request ID) ──▶ Route Handlers (Validation) ──▶ Services (Business Logic) ──▶ Drizzle ORM (Database)
```

1. **Routing Layer (`src/routes/`)**: Defines HTTP verbs, applies input validation schemas (Zod), and formats responses.
2. **Service Layer (`src/services/`)**: Contains core business rules, database queries, and authorization checks.
3. **Middleware Layer (`src/middleware/`)**: Enforces authentication (`authMiddleware`), content negotiation, and tracing.
4. **Error Handling (`src/lib/api-error.ts`)**: Uniform error structure returned across all endpoints.

---

## ⚡ Tech Stack

| Technology | Purpose |
|---|---|
| **Hono v4** | Lightweight, expressive web framework |
| **Bun Runtime** | Fast JavaScript/TypeScript runtime and test runner |
| **Better-Auth** | Complete authentication framework |
| **Drizzle ORM** | TypeScript ORM for PostgreSQL queries and schema typing |
| **Zod** | Request payload, query parameter, and environment validation |
| **tsdown** | High-performance bundling tool for production builds |

---

## 📂 Directory Structure

```
apps/server/
├── src/
│   ├── index.ts                     # Server entry point & Bun.serve listener
│   ├── app.ts                       # Hono application setup, global middleware & error handling
│   ├── routes/                      # Route definitions
│   │   ├── me.ts                    # Current user profile & metadata
│   │   ├── financial-accounts.ts    # Financial accounts CRUD
│   │   ├── categories.ts            # Income/Expense categories CRUD & defaults
│   │   ├── projects.ts              # Projects & goals CRUD
│   │   └── *.test.ts                # Route-level integration tests
│   ├── services/                    # Business logic & database operations
│   │   ├── financial-account.service.ts
│   │   ├── category.service.ts
│   │   └── project.service.ts
│   ├── middleware/                  # Custom Hono middlewares
│   │   ├── auth.ts                  # Session & user context injection
│   │   ├── content-type.ts          # JSON Content-Type validation
│   │   └── request-id.ts            # UUID request tracking
│   └── lib/                         # Utilities & shared helpers
│       ├── api-error.ts             # Custom ApiError class & HTTP status helpers
│       ├── validation.ts            # Zod validation wrapper for Hono
│       ├── default-categories.ts    # Seed definitions for new user categories
│       ├── parse.ts                 # Type coercion & parsing utilities
│       └── request.ts               # Request metadata helpers
├── .env.example                     # Example environment variables
└── package.json                     # Scripts & dependencies
```

---

## 🚀 Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:

```ini
BETTER_AUTH_SECRET=your-secure-random-secret-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
NODE_ENV=development
```

### 2. Start PostgreSQL Database

From the monorepo root:

```bash
bun run db:up
bun run db:push
```

### 3. Run Development Server

```bash
# Start server with hot reloading on port 3000
bun run dev
```

---

## 📡 API Endpoints Reference

### System & Health

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Healthcheck endpoint (`{ status: "ok" }`) | No |
| `GET` | `/api/version` | API metadata and version number | No |

### Authentication (`/api/auth/*`)

Managed by Better-Auth:
- `POST /api/auth/sign-up/email`: Register new account with email/password.
- `POST /api/auth/sign-in/email`: Sign in with email/password (returns session cookie).
- `POST /api/auth/sign-out`: Invalidate active session.
- `GET /api/auth/get-session`: Retrieve active session and user object.

### User Profile (`/api/me`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/me` | Fetch authenticated user details and profile |

### Financial Accounts (`/api/accounts`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/accounts` | List all accounts for user (filter by `?type=ASSET\|LIABILITY` & `?active=true`) |
| `POST` | `/api/accounts` | Create a new financial account (name, type, currency, description) |
| `GET` | `/api/accounts/:id` | Get account details by ID |
| `PUT` | `/api/accounts/:id` | Update account details |
| `PATCH` | `/api/accounts/:id/archive` | Toggle account active/archived state |
| `DELETE` | `/api/accounts/:id` | Delete account |

### Categories (`/api/categories`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | List all categories (filter by `?type=INCOME\|EXPENSE` & `?active=true`) |
| `POST` | `/api/categories` | Create a new category (name, type, color, icon, parentId) |
| `POST` | `/api/categories/defaults` | Seed default income and expense categories for the user |
| `GET` | `/api/categories/:id` | Get category details by ID |
| `PUT` | `/api/categories/:id` | Update category details |
| `PATCH` | `/api/categories/:id/archive` | Toggle category active/archived state |
| `DELETE` | `/api/categories/:id` | Delete category |

### Projects & Goals (`/api/projects`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all user projects (filter by `?status=PLANNING\|IN_PROGRESS\|COMPLETED\|ON_HOLD\|CANCELLED`) |
| `POST` | `/api/projects` | Create a new project (name, description, targetBudget, currency, status) |
| `GET` | `/api/projects/:id` | Get project details by ID |
| `PUT` | `/api/projects/:id` | Update project details |
| `PATCH` | `/api/projects/:id/archive` | Toggle project active/archived state |
| `DELETE` | `/api/projects/:id` | Delete project |

---

## 🛡️ Error Handling & Observability

All API errors return a consistent JSON payload:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Financial account not found",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

- In production (`NODE_ENV=production`), response times and request statuses are logged with their corresponding `requestId`.
- Unhandled 500 errors mask internal server details in production to prevent data leakage.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start development server with hot-reloading (`bun --hot src/index.ts`) |
| `bun run build` | Bundle server using `tsdown` to `dist/` |
| `bun run start` | Run production build from `dist/index.mjs` |
| `bun run compile` | Compile a standalone single-file binary with Bun |
| `bun run test` | Run test suite with Bun test runner |
| `bun run test:watch` | Run test suite in watch mode |
| `bun run check-types` | Run TypeScript compiler type-check (`tsc -b`) |

---

## 🧪 Testing

The API uses Bun's built-in fast test runner:

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch
```

# Sashory / Cashory 💸

> A modern, full-stack personal finance and wealth management mobile monorepo built with **React Native (Expo)**, **Hono**, **PostgreSQL**, **Drizzle ORM**, and **Better-Auth**.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Monorepo Architecture](#monorepo-architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Database Management](#database-management)
- [Available Scripts](#available-scripts)
- [Key Features](#key-features)
- [Testing & Quality](#testing--quality)

---

## 🌟 Overview

**Sashory** (branded as **Cashory**) provides a comprehensive finance tracking solution:
- 💳 **Financial Accounts Management**: Track asset accounts (checking, cash wallets, investments) and liabilities (loans, credit cards) across multiple currencies (PKR, USD, EUR, etc.).
- 🏷️ **Categorization Engine**: Structured income and expense hierarchies for fine-grained budget tracking.
- 📁 **Projects & Goals**: Group financial transactions by custom initiatives and projects with target budgets.
- 🔐 **Secure Authentication**: Session-based auth with secure cookie handling and native token persistence powered by Better-Auth.
- 🎨 **Cashory Design System**: Custom tailored light/dark theme using Tailwind CSS v4, Uniwind, and HeroUI Native.

---

## 🏗️ Monorepo Architecture

The repository is organized as a high-performance Turborepo workspace managed with **Bun**:

```
sashory/
├── apps/
│   ├── native/          # Cross-platform mobile app (React Native, Expo 56, Expo Router)
│   └── server/          # Backend REST API (Hono v4, Bun, tsdown)
├── packages/
│   ├── auth/            # Better-Auth server configuration & adapter
│   ├── db/              # PostgreSQL schema, Drizzle ORM client, & migrations
│   ├── env/             # Type-safe environment schemas (Zod + @t3-oss/env-core)
│   └── config/          # Shared TypeScript configurations
└── docker-compose.yml   # PostgreSQL container configuration
```

---

## ⚡ Tech Stack

| Layer | Technologies |
|---|---|
| **Mobile App** | [React Native 0.85](https://reactnative.dev/), [Expo 56](https://expo.dev/), [Expo Router v56](https://docs.expo.dev/router/introduction/), [HeroUI Native](https://v3.heroui.com/docs/native), [Tailwind CSS v4](https://tailwindcss.com/) + [Uniwind](https://uniwind.dev/), [TanStack Query v5](https://tanstack.com/query), [TanStack Form](https://tanstack.com/form), [React Native Keyboard Controller](https://kirillzyusko.github.io/react-native-keyboard-controller/) |
| **Backend API** | [Hono v4](https://hono.dev/), [Bun runtime](https://bun.sh/), [Better-Auth](https://www.better-auth.com/), [tsdown](https://github.com/sxzz/tsdown) |
| **Database & ORM** | [PostgreSQL 17](https://www.postgresql.org/), [Drizzle ORM](https://orm.drizzle.team/), [Docker](https://www.docker.com/) |
| **Monorepo & Tooling** | [Turborepo](https://turbo.build/repo), [Bun Workspaces](https://bun.sh/docs/install/workspaces), [TypeScript 6](https://www.typescriptlang.org/), [Zod](https://zod.dev/) |

---

## 📋 Prerequisites

Before setting up the repository, ensure you have installed:
- [Bun](https://bun.sh/) (`v1.2.0` or later)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (`v20.x` or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) or the **Expo Go** mobile app (iOS / Android)
- (Optional for Native builds): Android Studio / Xcode

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd sashory
bun install
```

### 2. Configure Environment Variables

Create the required `.env` files for the backend and native mobile apps:

```bash
# Server configuration
cp apps/server/.env.example apps/server/.env
```

Ensure `apps/native/.env` contains the API server URL:
```ini
EXPO_PUBLIC_SERVER_URL=http://localhost:3000
```
> **Note for Physical Devices / Emulators**: If testing on a physical mobile device or Android Emulator, change `http://localhost:3000` to your local machine IP (e.g. `http://192.168.1.100:3000`) or Android emulator host (`http://10.0.2.2:3000`).

### 3. Start Database Container & Apply Migrations

```bash
# 1. Start PostgreSQL 17 in Docker
bun run db:up

# 2. Push schema to database
bun run db:push
```

### 4. Run Development Servers

Start both the backend API and mobile application concurrently:

```bash
bun run dev
```

Or run them individually in separate terminals:

```bash
# Start backend API (http://localhost:3000)
bun run dev:server

# Start Expo development server for mobile
bun run dev:native
```

---

## 🗄️ Database Management

Database scripts interact directly with `@sashory/db`:

```bash
# Start PostgreSQL container in background
bun run db:up

# Stop PostgreSQL container
bun run db:down

# View database container logs
bun run db:logs

# Push schema changes directly to the database
bun run db:push

# Generate Drizzle migration files from schema
bun run db:generate

# Execute pending database migrations
bun run db:migrate

# Open Drizzle Studio visual database browser
bun run db:studio
```

---

## 📜 Available Scripts

Run from the monorepo root:

| Command | Description |
|---|---|
| `bun run dev` | Start all apps in watch/development mode |
| `bun run build` | Build all packages and applications for production |
| `bun run check-types` | Run type checking (`tsc --noEmit`) across all workspaces |
| `bun run dev:native` | Start the Expo mobile development bundler |
| `bun run dev:server` | Start the Hono backend server in hot-reload mode |
| `bun run db:up` | Launch local PostgreSQL Docker container |
| `bun run db:down` | Stop local PostgreSQL Docker container |
| `bun run db:push` | Synchronize Drizzle schema with database |
| `bun run db:studio` | Launch Drizzle Studio UI |

---

## 📦 Monorepo Packages & Apps

- **[`apps/native`](./apps/native/README.md)**: React Native / Expo 56 mobile app with HeroUI Native components, dark mode, and state management.
- **[`apps/server`](./apps/server/README.md)**: Hono backend API exposing accounts, categories, projects, user profile, and authentication.
- **`packages/auth`**: Better-Auth configuration, authentication schemas, and handlers.
- **`packages/db`**: Drizzle ORM schema declarations (accounts, categories, projects, users, sessions) and migration tooling.
- **`packages/env`**: Strict runtime environment variable parsing and validation using `@t3-oss/env-core`.
- **`packages/config`**: Base TypeScript and tooling configurations.

---

## 🧪 Testing & Quality

Run TypeScript compilation check across all packages:

```bash
bun run check-types
```

Run server unit & integration tests:

```bash
cd apps/server
bun run test
```

---

## 📄 License

Private repository. All rights reserved.

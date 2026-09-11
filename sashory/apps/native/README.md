# Cashory Mobile App 📱

> Cross-platform personal finance mobile client built with **React Native**, **Expo SDK 56**, **Expo Router**, **HeroUI Native**, and **Tailwind CSS v4**.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [State Management & Data Flow](#state-management--data-flow)
- [Theming & Design System](#theming--design-system)
- [Development Guidelines](#development-guidelines)
- [Available Scripts](#available-scripts)

---

## 🌟 Overview

The Cashory mobile application offers an intuitive interface to manage personal wealth, monitor bank/wallet balances, organize categorized expenses, and plan budgets for specific projects.

### Key Highlights:
- **File-based Routing**: Powered by Expo Router v56 with nested route groups (`(auth)`, `(app)`).
- **Responsive & Safe UI**: Native edge-to-edge layout management using `react-native-safe-area-context` and `react-native-keyboard-controller`.
- **Custom Brand Theming**: Integrated OKLCH palette with light/dark theme switching via HeroUI Native and Uniwind.
- **Server State Caching**: Fast optimistic updates and intelligent cache invalidation with TanStack Query v5.
- **Strict Form Validation**: Type-safe client validation using TanStack Form and Zod schemas.

---

## ⚡ Tech Stack

| Library | Purpose |
|---|---|
| **Expo SDK ~56.0** | Core mobile development framework & native module ecosystem |
| **Expo Router ~56.2** | Type-safe file-based navigation and nested layouts |
| **React Native 0.85** | Mobile UI rendering runtime |
| **HeroUI Native ^1.0** | Prebuilt accessible components (`Button`, `Surface`, `TextField`, `Input`, `Label`, `Spinner`) |
| **Tailwind CSS v4 + Uniwind** | Utility-first styling engine with native style compilation |
| **TanStack Query v5** | Server-state management, caching, refetching, and network status handling |
| **TanStack Form** | Headless form state and validation management |
| **Better-Auth Expo Client** | Native authentication client with `expo-secure-store` session persistence |
| **React Native Keyboard Controller** | Smooth keyboard animation tracking and `KeyboardAwareScrollView` |

---

## 📂 Directory Structure

```
apps/native/
├── app/                             # Expo Router file-based screens
│   ├── _layout.tsx                  # Root layout (Providers: Theme, Auth, Query, Safe Area)
│   ├── index.tsx                    # Splash gate & auth redirection
│   ├── modal.tsx                    # Modal presentation screen
│   ├── +not-found.tsx               # 404 fallback screen
│   ├── (auth)/                      # Authentication group
│   │   ├── _layout.tsx              # Auth stack layout
│   │   ├── sign-in.tsx              # Sign In screen
│   │   └── sign-up.tsx              # Sign Up screen
│   └── (app)/                       # Authenticated application group
│       ├── _layout.tsx              # App stack layout with themed headers
│       ├── home.tsx                 # Main dashboard with financial overview
│       ├── profile.tsx              # User profile & logout settings
│       ├── accounts.tsx             # Financial accounts listing
│       ├── account/
│       │   ├── create.tsx           # Create account screen
│       │   ├── [id].tsx             # Account detail view
│       │   └── [id]/edit.tsx        # Edit account view
│       ├── categories.tsx           # Categories listing & breakdown
│       ├── category/
│       │   ├── create.tsx           # Create category screen
│       │   ├── [id].tsx             # Category detail view
│       │   └── [id]/edit.tsx        # Edit category view
│       └── projects.tsx             # Projects & goals listing
│           ├── project/create.tsx   # Create project screen
│           ├── project/[id].tsx     # Project detail view
│           └── project/[id]/edit.tsx# Edit project view
├── components/                      # Reusable UI components
│   ├── ui/                          # Primitive brand components (Logo, etc.)
│   ├── containers/                  # Screen-level container wrappers
│   ├── sign-in.tsx / sign-up.tsx    # Auth forms
│   ├── account-form.tsx             # Account creation/editing form
│   ├── category-form.tsx            # Category creation/editing form
│   ├── project-form.tsx             # Project creation/editing form
│   └── theme-toggle.tsx             # Light/dark mode toggle button
├── contexts/                        # React context providers
│   └── app-theme-context.tsx        # Light/dark theme state & persistence
├── hooks/                           # Custom React Query & mutation hooks
│   ├── use-auth-session.ts          # Session retrieval hook
│   ├── use-me.ts                    # Current user data hook
│   ├── use-financial-accounts.ts    # Financial accounts list & queries
│   ├── use-financial-account-mutations.ts # Create, update, archive account
│   ├── use-categories.ts            # Categories list & queries
│   ├── use-category-mutations.ts    # Create, update, archive category
│   ├── use-projects.ts              # Projects list & queries
│   └── use-project-mutations.ts     # Create, update, archive project
├── lib/                             # Core utilities and client libraries
│   ├── api-client.ts                # Base HTTP fetch client with cookie support
│   ├── api-error.ts                 # API error parser utility
│   ├── auth-actions.ts              # Sign-out & session invalidate actions
│   ├── auth-client.ts               # Better-Auth client instance
│   ├── mutation-error.ts            # Mutation error toast helper
│   ├── query-client.ts              # TanStack Query client & online manager
│   ├── query-keys.ts                # Structured React Query cache keys
│   └── *-form-schema.ts             # Zod validation schemas for forms
└── global.css                       # Cashory design tokens & Tailwind theme
```

---

## 🚀 Getting Started

### 1. Configure Environment Variables

Create `.env` inside `apps/native/`:

```ini
# Backend API base URL
EXPO_PUBLIC_SERVER_URL=http://localhost:3000
```

> **Targeting Real Devices / Emulators**:
> - **Android Emulator**: Use `http://10.0.2.2:3000`
> - **iOS Simulator**: Use `http://localhost:3000`
> - **Physical Mobile Device**: Use your machine's LAN IP (e.g., `http://192.168.1.50:3000`)

### 2. Start the Development Server

From the monorepo root or `apps/native`:

```bash
# Start Expo Metro bundler
bun run start

# Launch on Android device / emulator
bun run android

# Launch on iOS simulator
bun run ios

# Launch on Web browser
bun run web
```

---

## 🔄 State Management & Data Flow

### 1. Server State (TanStack Query)
All network interactions are encapsulated in specialized custom hooks:
- Cache keys are centralized in `lib/query-keys.ts` for safe invalidation.
- Mutations trigger automatic optimistic updates or invalidations across related queries.
- Network status is synced via `@react-native-community/netinfo` inside `lib/query-client.ts`.

### 2. Forms & Validation (TanStack Form + Zod)
Forms use `@tanstack/react-form` combined with shared Zod schemas (`lib/*-form-schema.ts`). Errors are mapped automatically to HeroUI `<FieldError>` components.

### 3. Authentication
The `authClient` (`lib/auth-client.ts`) uses `@better-auth/expo` configured with `expo-secure-store` to maintain sessions securely across app restarts.

---

## 🎨 Theming & Design System

The app utilizes a custom **Cashory Brand System** based on OKLCH color spaces in `global.css`:
- **Primary Accent**: Cashory Green (`oklch(0.286 0.072 171.2)`)
- **Backgrounds**: Flash White (`#F0F0F0`) in Light Mode, Dark Green (`#0C1A18`) in Dark Mode.
- **Typography**: Plus Jakarta Sans (`PlusJakartaSans_400Regular`, `500Medium`, `600SemiBold`, `700Bold`).
- **Mode Toggle**: Accessible via `<ThemeToggle />` which updates the theme through `AppThemeProvider` and `HeroUINativeProvider`.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `bun run start` | Start the Expo Metro bundler |
| `bun run android` | Build and run on connected Android emulator/device |
| `bun run ios` | Build and run on iOS Simulator |
| `bun run web` | Run the app in a web browser |
| `bun run check-types` | Verify TypeScript compilation (`tsc --noEmit`) |
| `bun run prebuild` | Generate native Android and iOS folders |

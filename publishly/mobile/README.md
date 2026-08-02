# PostPilot AI - Mobile Application

This is the React Native application for **PostPilot AI**, built using Expo SDK 57, Expo Router, NativeWind (Tailwind CSS), Zustand, and TanStack Query.

## Structure

```text
mobile/
├── src/
│   ├── api/          # Network integration (Axios and React Query hooks)
│   │   ├── client.ts # Axios client with interceptors
│   │   └── hooks/    # Custom Query and Mutation hooks
│   ├── app/          # Expo Router file-based pages
│   ├── store/        # Zustand stores for global state
│   ├── components/   # Modular, reusable UI components
│   └── global.css    # Global stylesheet loading Tailwind layers
├── tailwind.config.js# Tailwind theme customisations
├── metro.config.js   # Metro config enabling NativeWind CSS processing
├── .eslintrc.js      # ESLint configurations
└── .prettierrc       # Prettier configurations
```

---

## Core Libraries

### 1. Styling (NativeWind v4)

Styles are declared directly inline using Tailwind utility classes via the `className` prop:

```tsx
<View className="bg-slate-900 p-4 rounded-xl">
  <Text className="text-white text-lg font-bold">Hello World</Text>
</View>
```

Configuration is managed in `tailwind.config.js` and CSS builds are handled by `metro.config.js`.

### 2. Global State (Zustand)

Used for client-side state like authorization details, local configurations, and active dark/light mode themes. Define states in `src/store/useAppStore.ts`.

### 3. Server State Sync (TanStack Query & Axios)

- Requests are handled by an Axios instance configured in `src/api/client.ts`. Response interceptors handle common network failures and request interceptors automatically append tokens.
- Server state fetching, polling, and mutations are wrapped in React Query hooks (e.g. `src/api/hooks/useHealth.ts`).

---

## Local Development

Ensure you have run `bun install` (handled by `make setup` in root).

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `EXPO_PUBLIC_API_URL` to point to your backend:

- iOS Simulator / Web: `http://localhost:8000/api/v1`
- Android Emulator: `http://10.0.2.2:8000/api/v1`
- Physical Device: Update to match your workstation's local network IP.

### Run Development server

```bash
# Start expo CLI
bun run start
```

- Press `w` to run on web.
- Press `a` or `i` to open in Android/iOS simulators.

---

## Code Quality Standards

Before committing, run local check scripts:

- **Lint Verification**: `bun run lint`
- **Auto format**: `bun run format`
- **TypeScript verification**: `bun tsc --noEmit`

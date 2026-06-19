# 📱 Mobile Apps Showcase

Welcome to the **Mobile Apps Portfolio**! This repository is a monorepo containing a diverse collection of mobile applications built primarily with **React Native (Expo)**, showcasing integrations with Machine Learning, real-time communication (WebSockets), databases, and device hardware APIs.

---

## 🚀 Projects Overview

| Project Name | Key Features | Tech Stack | Platform(s) | Status |
| :--- | :--- | :--- | :--- | :--- |
| [**💬 Gossip**](#-1-gossip-real-time-chat) | Real-time chat, authentication, database persistence | Bun, Express, MongoDB, Socket.io, Clerk, React (Vite), Expo Router, NativeWind | iOS, Android, Web | Complete |
| [**🧠 Emotion Detection**](#-2-emotion-detection-app) | Text emotion classifier, confidence scoring | FastAPI, scikit-learn, joblib, Python (`uv`), Expo, TailwindCSS | iOS, Android | Complete |
| [**🔍 QR Code Scanner**](#-3-qr-code-scanner--generator) | Camera scanner with Skia overlays, QR generation, history | Expo Camera, `@shopify/react-native-skia`, `react-native-qrcode-svg` | iOS, Android | Complete |
| [**🐙 Pokedex**](#-4-pokedex-pokemon-encyclopedia) | Pokemon listing, search, stats, rich UI animations | Expo Router, React Native Reanimated, Expo Image | iOS, Android | Complete |
| [**📺 Saniverse**](#-5-saniverse-anime-streaming-platform) | HLS live streaming, real-time reactions & comments, Google Auth | Bun, Express, MongoDB, Socket.io, Expo Video, React Native Reanimated, Zustand | iOS, Android | Complete |
| [**💰 Sashory**](#-6-sashory-full-stack-finance-app) | Full-stack monorepo, PostgreSQL & Drizzle, modular auth | Bun, Hono, Drizzle ORM, PostgreSQL, Better-Auth, React Native, Expo, TailwindCSS, Turborepo | iOS, Android | In Progress |
| [**🤖 Offline Chatbot**](#-7-offline-chatbot-tether-bot) | On-device private LLM chat, real-time streaming, reasoning tags | React Native, `@qvac/sdk`, `react-native-bare-kit`, `@qvac/llm-llamacpp`, NativeWind | iOS, Android | Complete |
| [**📥 Pocket App**](#-8-pocket-app-read-later--rss-reader) | Article parsing & bookmarks, RSS feed reader, local SQLite db | Expo, React Native, `expo-sqlite`, Drizzle ORM, Clerk, Reanimated | iOS, Android | Complete |
| [**✅ Todo App**](#-9-todo-app) | Real-time todo syncing, serverless backend integration | Expo, React Native, Convex, NativeWind | iOS, Android | Complete |


---

## 🛠️ Individual Project Details

### 💬 1. Gossip (Real-time Chat)

A multi-platform real-time messaging application. Gossip leverages a robust Node/Bun backend and provides both a Native mobile application and a web interface.

* **Features**:
  * Real-time WebSocket communication for instant messaging.
  * Secure user authentication powered by Clerk.
  * MongoDB database storage with Mongoose schemas.
  * Modern, responsive design using TailwindCSS/NativeWind.
* **Architecture**:
  * `gossip/backend/` — Express server running on Bun, handling Socket.io connections & Mongoose models.
  * `gossip/mobile/` — React Native mobile app using Expo Router and NativeWind.
  * `gossip/web/` — Single Page Application (SPA) built with Vite and React 19.

#### Run & Setup
Ensure you have [Bun](https://bun.sh/) installed.

**Backend Setup:**
```bash
cd gossip/backend
bun install
# Copy environment variables (.env.example -> .env) and configure Mongoose/Clerk keys
bun run dev
```

**Mobile Setup:**
```bash
cd gossip/mobile
bun install
bun start
```

**Web Setup:**
```bash
cd gossip/web
bun install
bun run dev
```

---

### 🧠 2. Emotion Detection App

A full-stack mobile application that analyzes text inputs and predicts the underlying emotion. It integrates a lightweight Python Machine Learning classifier with a responsive mobile frontend.

* **Features**:
  * Text emotion classification (e.g., joy, anger, sadness, fear).
  * Prediction confidence percentage display.
  * Fast and light backend server API.
* **Tech Stack**:
  * **Backend**: FastAPI, scikit-learn, joblib, managed with [uv](https://docs.astral.sh/uv/).
  * **Frontend**: React Native Expo with TailwindCSS (uniwind).

#### Run & Setup
Ensure you have the Python packaging tool `uv` installed.

**Backend Setup:**
```bash
cd emotions_detections_app/backend
uv run fastapi dev main.py
# Server runs on http://localhost:8000
```

**Mobile Setup:**
```bash
cd emotions_detections_app/mobile
npm install
npm start
```

#### 📦 CI/CD & Release Builds
The project includes a GitHub Actions workflow configuration (located at [release.yaml](file:///home/shaharyar/01__git_repos/mobile_apps/emotions_detections_app/.github/workflows/release.yaml)) that automates Android APK generation and release creation:
- **Trigger**: Runs automatically when a version tag matching `v*` (e.g., `v1.0.0`) is pushed.
- **Process**:
  1. Sets up the environment with Bun.
  2. Restores and installs mobile dependencies.
  3. Configures EAS CLI with an Expo token (`EXPO_TOKEN` repository secret).
  4. Builds the Android APK locally using:
     ```bash
     eas build --platform android --profile preview --non-interactive --local
     ```
  5. Renames the output APK to `emotions-${VERSION}.apk`.
  6. Creates a new GitHub Release with auto-generated release notes and uploads the APK.

---

### 🔍 3. QR Code Scanner & Generator

A high-performance utility application designed for scanning and generating QR codes. It features visual overlay animations using Skia graphics.

* **Features**:
  * Real-time camera QR scanning with a custom scanner viewfinder overlay.
  * Custom QR code generator supporting personalized content inputs.
  * Saved history of scans.
* **Tech Stack**:
  * Expo Camera & Expo Router.
  * Graphics powered by `@shopify/react-native-skia`.
  * QR Code rendering via `react-native-qrcode-svg`.

#### Run & Setup
```bash
cd qr_code_scanner
npm install
npx expo start
```

---

### 🐙 4. Pokedex (Pokemon Encyclopedia)

A visually interactive encyclopedia for Pokemon, pulling details, stats, and custom colors based on Pokemon types.

* **Features**:
  * Searchable list of Pokemon.
  * Comprehensive stats sheet, type badges, and detailed profiles.
  * Seamless screen transitions and responsive image loading.
* **Tech Stack**:
  * Expo Router (file-based routing).
  * React Native Reanimated.
  * Expo Image for cached, high-performance image loading.

#### Run & Setup
```bash
cd pokedex
npm install
npx expo start
```

---

### 📺 5. Saniverse (Anime Streaming Platform)

A premium anime streaming platform featuring HTTP Live Streaming (HLS) support, real-time interactivity via WebSockets, and rich client-side animations.

* **Features**:
  * Live streaming and HLS playback with custom video controls.
  * Real-time social interaction (likes, ratings, comments, and reaction emojis) synchronized via Socket.io.
  * Google Sign-In and secure token-based user authentication.
  * Sleek UI with modern glassmorphism aesthetic and smooth transitions.
* **Architecture**:
  * `saniverse/backend/` — Express API server running on Bun, managing WebSockets, JWT auth, and MongoDB.
  * `saniverse/mobile/` — Expo React Native mobile application leveraging Zustand, Reanimated, and native UI components.

#### Run & Setup
Ensure you have [Bun](https://bun.sh/) installed.

**Backend Setup:**
```bash
cd saniverse/backend
bun install
# Copy environment variables (env_template -> .env) and configure MongoDB & JWT secret keys
bun run start
```

**Mobile Setup:**
```bash
cd saniverse/mobile
bun install
bun start
```

---

### 💰 6. Sashory (Full-Stack Finance App)

A premium full-stack personal finance and wealth management application built in a monorepo structure.

* **Features**:
  * Full-stack monorepo managed with Turborepo.
  * Type-safe database operations with PostgreSQL and Drizzle ORM.
  * Secure, modular authentication using Better-Auth.
  * High-performance, lightweight API endpoints using Hono.
  * Responsive, modern mobile frontend with TailwindCSS utility styling.
* **Architecture**:
  * `sashory/apps/native/` — Mobile application built with React Native and Expo.
  * `sashory/apps/server/` — Backend API built with Hono.
  * `sashory/packages/auth/` — Shared authentication configuration and logic.
  * `sashory/packages/db/` — Shared database schema, migrations, and queries.

#### Run & Setup
Ensure you have [Bun](https://bun.sh/) installed.

**Database & Server Setup:**
```bash
cd sashory
bun install
# Configure apps/server/.env with BETTER_AUTH_SECRET, BETTER_AUTH_URL, CORS_ORIGIN, and DATABASE_URL
bun run db:push
bun run dev
```

**Run Mobile Client Only:**
```bash
bun run dev:native
```

---

### 🤖 7. Offline Chatbot (Tether Bot)

An offline-first, private, and high-performance AI Chatbot for mobile devices. The application runs LLMs entirely on-device, offering secure and 100% private conversations without requiring internet access or external API calls after the initial setup.

* **Features**:
  * **100% Offline Inference**: Chat completions run directly on your device CPU/GPU. No data leaves your phone.
  * **One-Time Model Initialization**: Downloads and compiles the quantized AI model parameters (e.g., Qwen 3 600M Instruction Q4) locally.
  * **Real-time Streaming**: Token-by-token response generation with interactive visual updates.
  * **Reasoning Mode Support**: Automatically handles `<think>` tags for reasoning-based models, displaying a thinking status indicator while the model performs intermediate processing.
* **Tech Stack**:
  * **Frontend**: React Native, Expo, NativeWind (Tailwind CSS).
  * **Engine & SDKs**: `@qvac/sdk`, `react-native-bare-kit` (Worker Thread), and `@qvac/llm-llamacpp`.

#### Run & Setup
Ensure you have Node.js and a package manager installed.

```bash
cd offline-chatbot
npm install
```

> [!NOTE]
> Since this project uses native C++ runtimes (`react-native-bare-kit` and QVAC native modules), it **cannot** be run in a standard Expo Go client. You must run it as a **Development Build** inside an Android Emulator, iOS Simulator, or physical device.

```bash
npx expo run:android
# or
npx expo run:ios
```

---

### 📥 8. Pocket App (Read-Later & RSS Reader)

A premium read-later and bookmarking utility featuring article extraction, reading time estimation, and a built-in RSS news feed reader.

* **Features**:
  * **Saved Bookmarks**: Parse, extract, and store articles locally for offline reading.
  * **RSS Feed Reader**: Pull articles dynamically from configured RSS feeds (e.g., React Native/Expo blogs) with custom bounce loading animations.
  * **Offline Persistence**: Local SQLite database with migration management.
  * **Secure Authentication**: Clerk Auth integration for Apple, Google, and email logins.
* **Tech Stack**:
  * **Database**: `expo-sqlite` and `drizzle-orm` (with `drizzle-kit` for schema migrations).
  * **Auth**: Clerk Authentication (`@clerk/expo`).
  * **Parsing**: `linkedom` and `fast-xml-parser` for handling HTML and RSS feeds.
  * **Animations**: React Native Reanimated.

#### Run & Setup
Ensure you have [Bun](https://bun.sh/) installed.

```bash
cd pocket-app
bun install
# Generate schema migrations
bun run db:generate
# Start client
bun start
```

---

### ✅ 9. Todo App

A real-time Todo application built with Convex as a serverless backend. It demonstrates file-based routing, real-time subscription queries, and serverless mutations.

* **Features**:
  * **Real-time Synchronization**: Instant updates across clients via Convex subscription queries.
  * **Serverless Backend**: Hosted queries, mutations, and database schema definition.
  * **Modern Styling**: Styled with NativeWind (Tailwind CSS).
* **Tech Stack**:
  * **Frontend**: Expo (React Native), Expo Router, TailwindCSS.
  * **Backend**: Convex.

#### Run & Setup
Ensure you have the Convex CLI installed globally or run it via npx:

```bash
cd todo-app
npm install
# Start Convex dev environment (binds to Convex cloud project)
npx convex dev
# Run the Expo app
npx expo start
```

---

## 🧰 Prerequisites & General Tips

1. **Node.js Environment**: Make sure Node.js (v18+) is installed. Running `bun` is recommended for Gossip's, Sashory's, and Pocket App's workspaces.
2. **Python Environment**: Install [uv](https://docs.astral.sh/uv/) for running the ML backend inside `emotions_detections_app`.
3. **Convex Cloud Backend**: The Todo App requires a Convex account and setup (`npx convex dev`) to connect to your database instance.
4. **Expo Go / Simulator / Development Build**: To run the frontend applications on mobile, download the **Expo Go** app on your physical device, run them on Xcode iOS Simulator / Android Studio Emulator, or build development clients where native binaries are required (e.g., Offline Chatbot).
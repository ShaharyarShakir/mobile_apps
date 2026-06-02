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

## 🧰 Prerequisites & General Tips

1. **Node.js Environment**: Make sure Node.js (v18+) is installed. Running `bun` is recommended for Gossip's workspaces.
2. **Python Environment**: Install [uv](https://docs.astral.sh/uv/) for running the ML backend inside `emotions_detections_app`.
3. **Expo Go / Simulator**: To run the frontend applications on mobile, download the **Expo Go** app on your physical device, or run them on Xcode iOS Simulator / Android Studio Emulator.
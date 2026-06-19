# 📱 Offline Chatbot (Tether Bot)

An offline-first, private, and high-performance AI Chatbot for mobile devices built with **Expo (v56.0.0)**, **React Native**, and the **QVAC SDK**. The application runs LLMs entirely on-device, offering secure and 100% private conversations without requiring internet access or external API calls after the initial setup.

---

## 🚀 Key Features

*   **100% Offline Inference:** Chat completions run directly on your device CPU/GPU. No data leaves your phone.
*   **One-Time Model Initialization:** Downloads and compiles the quantized AI model parameters (e.g., Qwen 3 600M Instruction Q4) locally.
*   **Real-time Streaming:** Token-by-token response generation with interactive visual updates.
*   **Reasoning Mode Support:** Automatically handles `<think>` tags for reasoning-based models, displaying a thinking status indicator while the model performs intermediate processing.
*   **Beautiful UI & Dark Mode:** Built with NativeWind (Tailwind CSS for React Native) matching high-fidelity, clean dark aesthetics.
*   **Markdown Support:** Code blocks, bold texts, list items, and links are formatted elegantly with specialized theme accents.
*   **Native Gestures & Integrations:** Keyboard avoiding behaviors, scroll-to-end, copy-to-clipboard, and native vector symbols (Expo Symbols).

---

## 🛠️ Tech Stack & Architecture

### Underlying Architecture

```mermaid
graph TD
    UI[React Native / Expo UI Thread] -- User Input / Actions --> SDK[@qvac/sdk]
    SDK -- Commands --> BK[react-native-bare-kit Worker Thread]
    BK -- Runs Worker JS --> W[worker.bundle.js]
    W -- Calls Native Addon --> L[llama.cpp / @qvac/llm-llamacpp]
    L -- Executes Offline Inference --> Model[Local Model File (.gguf)]
    Model -- Generates Stream --> L
    L -- Stream Events --> W
    W -- Event Bus --> SDK
    SDK -- State Updates / Streaming Tokens --> UI
```

1.  **React Native & Expo (v56):** Provides the cross-platform application UI shell, utilizing React 19 and navigation layout routers.
2.  **react-native-bare-kit (Bare Runtime):** A lightweight background JavaScript worker engine that runs alongside React Native. It provides low-level Node.js-style capabilities (like file systems, sockets, crypto, and threading) natively on mobile.
3.  **QVAC SDK & Runtimes:** Builds on the Bare environment to run optimized C++ packages directly on-device. For chatbot execution, it loads the `@qvac/llm-llamacpp` native addon, compiled specifically for iOS and Android architectures.
4.  **Local Quantized Models:** Loads model parameters (such as `QWEN3_600M_INST_Q4`) and runs on-device inference using GGUF format.

---

## 📂 Project Structure

```text
├── assets/                     # App assets (icons, splash screens)
├── qvac/                       # Background worker configuration and binaries
│   ├── addons.manifest.json    # Declares compiled C++ addons (llama.cpp, ONNX, Whisper, etc.)
│   ├── worker.bundle.js        # The bundled worker thread script
│   └── worker.entry.mjs        # Entry point for the Bare background environment
├── src/
│   ├── app/                    # Expo router page-based routing
│   │   ├── _layout.tsx         # App entry theme wrapper & navigation stack
│   │   └── index.tsx           # Main Chat view, loader logic, & state management
│   ├── components/             # Reusable UI Components
│   │   ├── chat-input.tsx      # Multi-line chat keyboard bar with action buttons
│   │   ├── chat-message.tsx    # Renders user/assistant message bubbles with copy features
│   │   ├── model-loader.tsx    # Controls one-time on-device model downloads
│   │   └── ui/                 # Atomic design components (Button, Card, Text, Markdown)
│   ├── lib/
│   │   ├── theme.ts            # HSL based color tokens matching Tailwind
│   │   └── utils.ts            # Helper function (clsx/tailwind-merge wrapper, thinking tag parser)
│   └── global.css              # Global styles & Tailwind CSS base
└── package.json                # Project configurations & dependency declarations
```

---

## ⚙️ How it Works under the Hood

### 1. Model Download & Storage
When the user clicks **Download Model**, the `ModelLoader` triggers the `loadModel` method from `@qvac/sdk`. The SDK initiates a secure download of the model parameters (`Qwen 3 600M` quantized GGUF format, ~450MB) straight into the app's local document directory.

### 2. Loading the Model into Memory
Once the download is completed, the background thread uses the `@qvac/llm-llamacpp` native plugin to load the model weights, initialize the inference context (`ctx_size: 4096`), and lock it in memory.

### 3. Inference & Streaming Lifecycle
*   When a prompt is submitted, the conversation history is formatted into chat template payloads and sent to `completion()`.
*   The worker processes the model generation token-by-token.
*   Token deltas are categorized into `thinkingDelta` (reasoning steps wrapped inside `<think>...</think>`) and `contentDelta` (actual responses).
*   The UI streams these tokens on the fly, rendering markdown dynamically.

---

## 📥 Getting Started

### Prerequisites

Ensure you have the mobile development environment set up for Android and iOS builds, including Node.js and a package manager (pnpm is recommended).

### 1. Install Dependencies

Using `pnpm`:
```bash
pnpm install
```
*(Or `npm install` / `bun install` as per your local package manager setup)*

### 2. Build and Run the App

For **iOS Development Build**:
```bash
npm run android
# or
npx expo run:android
```

For **Android Development Build**:
```bash
npm run ios
# or
npx expo run:ios
```

> [!NOTE]
> Since this project uses native C++ runtimes (`react-native-bare-kit` and QVAC native modules), it **cannot** be run in a standard Expo Go client. You must run it as a **Development Build** inside an Android Emulator, iOS Simulator, or physical device.

---

## 📄 License

This project is licensed under the MIT License
# Emotion Detection App

A full-stack mobile application that detects the emotion of a given text input. The project consists of a FastAPI backend using a scikit-learn machine learning model and a React Native frontend built with Expo.

## Project Structure

The project is divided into two main parts:
- `backend/`: A FastAPI Python server that serves the machine learning model.
- `mobile/`: A React Native Expo application for the frontend.

## Features

- **Text Emotion Prediction**: Input any text and receive the predicted emotion (e.g., joy, sadness, anger, fear, etc.).
- **Confidence Score**: Displays the confidence percentage of the prediction.
- **FastAPI Backend**: Fast and efficient backend using FastAPI to serve the model.
- **Mobile Friendly UI**: Clean, responsive, and easy-to-use mobile interface.

## Tech Stack

**Backend:**
- Python 3.11+
- FastAPI
- scikit-learn (Machine Learning pipeline)
- joblib
- uv (Python package manager)

**Frontend:**
- React Native
- Expo
- React Navigation
- TailwindCSS (via `uniwind` and `tailwindcss`)

## Getting Started

### Prerequisites
- [uv](https://docs.astral.sh/uv/) for Python dependency management.
- Node.js and npm/yarn/bun.
- [Expo CLI](https://docs.expo.dev/get-started/installation/).

### 1. Backend Setup

Navigate to the `backend` directory and run the server:

```bash
cd backend
# Install dependencies and start the server using uv
uv run fastapi dev main.py
```

The backend server will start at `http://localhost:8000`. 
You can test the endpoint using curl:

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "I am so happy today!"}'
```

### 2. Frontend Setup

Navigate to the `mobile` directory, install dependencies, and start the Expo app:

```bash
cd mobile
npm install
npm start
```

You can run the app on an Android emulator, iOS simulator, or on your physical device using the Expo Go app.

## Notes
- If you wish to use the local backend, update the fetch URL in `mobile/app/index.tsx` to `http://<YOUR_LOCAL_IP>:8000/predict` (or use a tunneling service like ngrok).

## 📦 CI/CD & Release Builds

This project contains a GitHub Actions workflow configuration ([release.yaml](file:///home/shaharyar/01__git_repos/mobile_apps/emotions_detections_app/.github/workflows/release.yaml)) to automate Android APK generation and release creation.

### Workflow Configuration
When pushed to its own repository, the workflow triggers on version tags:
- **Trigger**: `v*` tags (e.g., `v1.0.0`)
- **Required Repository Secrets**:
  - `EXPO_TOKEN`: Your Expo access token for EAS authentication.
  - `GITHUB_TOKEN`: The built-in token (requires `contents: write` permissions enabled in repo settings to upload assets and create releases).

### Build Details
The workflow performs the following steps:
1. **Environment Setup**: Checks out code and installs Bun.
2. **Dependency Resolution**: Installs packages inside the `mobile/` directory using Bun.
3. **EAS Authentication**: Integrates EAS CLI using `expo/expo-github-action`.
4. **Android Compilation**: Compiles the APK locally with:
   ```bash
   eas build --platform android --profile preview --non-interactive --local
   ```
5. **Asset Packaging**: Renames the compiled APK to `emotions-${VERSION}.apk`.
6. **Publishing**: Creates a GitHub Release and uploads the generated APK binary.
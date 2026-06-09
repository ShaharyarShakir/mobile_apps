# Welcome to your Expo Todo app 

A simple Todo app built with **Expo**, **React Native**, and **Convex**. It demonstrates file‑based routing, cross‑platform development, and real‑time backend integration using Convex for data storage and serverless functions.

## Tech Stack

- **Frontend**: Expo (React Native), TypeScript, React Navigation, Expo Router (file‑based routing)
- **Backend**: Convex – serverless backend with real‑time queries, authentication, and Edge Functions
- **Styling**: Tailwind CSS (via nativewind) 

## Get Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Convex**
   - Install Convex CLI if you haven't already:
     ```bash
     npm i -g convex
     ```
   - Authenticate and link the project:
     ```bash
     convex login
     convex init
     ```
   - Deploy the Convex schema and functions:
     ```bash
     convex deploy
     ```

3. **Start the Expo app**
   ```bash
   npx expo start
   ```
   The Expo dev tools will open. You can run the app on:
   - **Development build** – Follow the link in the terminal to open on a device or simulator.
   - **Android emulator** – Choose the Android option.
   - **iOS simulator** – Choose the iOS option.
   - **Expo Go** – Scan the QR code with the Expo Go app.

## Backend Details

The app uses Convex to store todos and handle real‑time updates. The relevant files are located in the `convex/` directory:
- `schema.ts` – Defines the `Todo` table schema.
- `mutations.ts` – Functions for creating, updating, and deleting todos.
- `queries.ts` – Real‑time query to fetch the todo list.

Make sure to keep the Convex dev server running when working on backend features:
```bash
convex dev
```

## Learn More

- **Expo Documentation** – https://docs.expo.dev/
- **Convex Documentation** – https://docs.convex.dev/
- **React Native Docs** – https://reactnative.dev/

## Join the Community

- **Expo on GitHub** – https://github.com/expo/expo
- **Convex on GitHub** – https://github.com/convex-dev/convex
- **Discord** – https://chat.expo.dev/ and https://discord.gg/convex

Happy coding! 🎉
A simple Todo app built with Expo, React Native, and Convex, demonstrating file‑based routing, cross‑platform development, and real‑time backend integration. This starter project provides a clean foundation to build and customize your own mobile todo list application.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo



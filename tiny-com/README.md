# Tiny Compressor

Minimal, fast, on-device image and PDF compression utility for Android and iOS. Part of the **My Tiny Apps** collection.

---

## EAS Update (Over-The-Air Updates) & Native Builds

### OTA Updates (JavaScript & Assets)
OTA updates are delivered seamlessly over-the-air to installed apps matching the runtime version (`policy: "appVersion"`).

**Suitable for:**
- UI and styling updates
- React components and screens
- JavaScript and TypeScript logic
- Navigation and routing adjustments
- Bundled static assets
- Client-side business logic and utilities

**Publishing a Preview OTA Update:**
```bash
npx eas update --channel preview --message "Your update message" --environment preview
```

---

### When a New Native Build is Required
EAS Update modifies the JavaScript bundle and assets. It cannot alter the compiled native binary. A new native build must be created when changing:
- Native modules and libraries (e.g. adding new Expo native packages)
- Android permissions (`READ_MEDIA_IMAGES`, `WRITE_EXTERNAL_STORAGE`, etc.)
- Native Android/iOS project files (`android/`, `ios/`)
- Expo SDK version or runtime version
- Native app icons, splash screens, or deep link schemes

**Building the Preview APK:**
```bash
npx eas build --platform android --profile preview
```

---

## EAS Observe (Performance & Analytics)

Tiny Compressor integrates `expo-observe` to monitor application startup performance (`tti`, `cold_ttr`, `warm_ttr`) and key compression metrics with strict privacy:
- `compression_started` (file type, preset, count, input size bucket)
- `compression_completed` (file type, preset, count, input/output size buckets, duration in ms)
- `compression_failed` (file type, preset, count)
- `file_saved` (file type, count)
- `file_shared` (file type)

*No user document names, file contents, images, or personal information are ever transmitted.*

---

## CI/CD Workflow (GitLab CI)

```bash
# Non-interactive APK build for GitLab release
eas build --platform android --profile preview --non-interactive
```
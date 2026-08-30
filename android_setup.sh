#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
#  Android SDK (Command-line Tools) Installer
#  cmdline-tools: 12700392 | API level: 36
# ─────────────────────────────────────────────

ANDROID_HOME="$HOME/Android"
CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-12700392_latest.zip"
API_LEVEL="36"
BUILD_TOOLS_VERSION="36.0.0"
SHELL_RC="$HOME/.zshrc"

SDKMANAGER="$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Android SDK Installer"
echo "  API $API_LEVEL | build-tools $BUILD_TOOLS_VERSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Already installed check ──────────────────
if [ -f "$SDKMANAGER" ] && \
   [ -d "$ANDROID_HOME/platforms/android-$API_LEVEL" ] && \
   [ -d "$ANDROID_HOME/build-tools/$BUILD_TOOLS_VERSION" ] && \
   [ -f "$ANDROID_HOME/platform-tools/adb" ]; then
  echo ""
  echo "  ✓ Android SDK (API $API_LEVEL) is already installed at:"
  echo "    $ANDROID_HOME"
  echo ""
  echo "  To force a reinstall, delete the folder and re-run:"
  echo "    rm -rf $ANDROID_HOME && ./install-android-sdk.sh"
  echo ""
  exit 0
fi

# ── 1. Create SDK directory ──────────────────
echo ""
echo "[1/4] Creating SDK directory at $ANDROID_HOME..."
mkdir -p "$ANDROID_HOME/cmdline-tools"
cd "$ANDROID_HOME"

# ── 2. Download & extract command-line tools ─
if [ -f "$SDKMANAGER" ]; then
  echo "[2/4] sdkmanager already present — skipping download."
else
  echo "[2/4] Downloading command-line tools (build 12700392)..."
  wget -q --show-progress "$CMDLINE_TOOLS_URL" -O cmdline-tools.zip

  echo "      Extracting..."
  unzip -q cmdline-tools.zip -d cmdline-tools-tmp

  mkdir -p cmdline-tools/latest
  # The zip extracts to a 'cmdline-tools' subfolder
  if [ -d "cmdline-tools-tmp/cmdline-tools" ]; then
    mv cmdline-tools-tmp/cmdline-tools/* cmdline-tools/latest/
  else
    mv cmdline-tools-tmp/* cmdline-tools/latest/
  fi
  rm -rf cmdline-tools-tmp cmdline-tools.zip
  echo "      Extracted to $ANDROID_HOME/cmdline-tools/latest"
fi

# ── 3. Configure environment variables ───────
echo "[3/4] Configuring environment variables in $SHELL_RC..."

ENV_BLOCK='
# ANDROID SDK
export ANDROID_HOME="$HOME/Android"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"'

if grep -q "ANDROID_HOME" "$SHELL_RC" 2>/dev/null; then
  echo "      Android SDK env vars already present — skipping."
else
  echo "$ENV_BLOCK" >> "$SHELL_RC"
  echo "      Added env vars to $SHELL_RC."
fi

# Apply for current session
export ANDROID_HOME="$HOME/Android"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# ── 4. Install SDK packages ───────────────────
echo "[4/4] Installing SDK packages..."

PACKAGES=()
[ ! -f "$ANDROID_HOME/platform-tools/adb" ]          && PACKAGES+=("platform-tools")
[ ! -d "$ANDROID_HOME/build-tools/$BUILD_TOOLS_VERSION" ] && PACKAGES+=("build-tools;$BUILD_TOOLS_VERSION")
[ ! -d "$ANDROID_HOME/platforms/android-$API_LEVEL" ] && PACKAGES+=("platforms;android-$API_LEVEL")

if [ ${#PACKAGES[@]} -eq 0 ]; then
  echo "      All packages already installed — skipping."
else
  echo "      Installing: ${PACKAGES[*]}"
  yes | sdkmanager --licenses > /dev/null 2>&1 || true
  sdkmanager "${PACKAGES[@]}"
fi

# ── Done ──────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✓ Android SDK (API $API_LEVEL) installed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Reload your shell to apply env vars:"
echo "    source $SHELL_RC"
echo ""
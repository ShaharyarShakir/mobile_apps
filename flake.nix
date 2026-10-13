{
  description = "React Native Expo + Bun + Android Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs {
        inherit system;
        config = {
          allowUnfree = true;
          android_sdk.accept_license = true;
        };
      };

      androidSdk = pkgs.androidenv.composeAndroidPackages {
        platformVersions = [ "35" ];
        buildToolsVersions = [ "35.0.0" ];
        abiVersions = [ "x86_64" ];
        includeEmulator = false;
        includeSystemImages = false;
        includeSources = false;
      };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          # JavaScript / TypeScript
          bun
          scrcpy
          nodejs_22

          # Android toolchain
          androidSdk.androidsdk
          android-tools
          jdk17

          # React Native tooling
          watchman

          # Native build tools
          git
          git-lfs
          curl
          unzip
          zip
          cacert
          pkg-config
          cmake
          ninja
          gnumake
          gcc
          python3
        ];

        ANDROID_HOME = "${androidSdk.androidsdk}/libexec/android-sdk";
        ANDROID_SDK_ROOT = "${androidSdk.androidsdk}/libexec/android-sdk";
        JAVA_HOME = "${pkgs.jdk17}";

        # Keep Android SDK tools available in the shell.
        PATH = "$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/build-tools/35.0.0:$PATH";

        shellHook = ''
          export JAVA_HOME="${pkgs.jdk17}"
          export ANDROID_HOME="${androidSdk.androidsdk}/libexec/android-sdk"
          export ANDROID_SDK_ROOT="$ANDROID_HOME"

          echo "React Native + Expo + Bun development environment"
          echo "Bun: $(bun --version)"
          echo "Node: $(node --version)"
          echo "Java: $(java -version 2>&1 | head -n 1)"
        '';
      };
    };
}

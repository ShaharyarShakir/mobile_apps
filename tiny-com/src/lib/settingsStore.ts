import * as FileSystem from "expo-file-system/legacy";

export type ThemeMode = "system" | "dark" | "light";

export type UserSettings = {
  themeMode: ThemeMode;
  totalBytesSaved: number;
  hapticsEnabled: boolean;
};

class SettingsStore {
  private data: UserSettings = {
    themeMode: "system",
    totalBytesSaved: 0,
    hapticsEnabled: true,
  };
  private isLoaded = false;
  private listeners: Array<() => void> = [];

  private get filePath(): string {
    return `${FileSystem.documentDirectory || ""}app_settings.json`;
  }

  private async load(): Promise<void> {
    if (this.isLoaded) return;
    try {
      const exists = await FileSystem.getInfoAsync(this.filePath);
      if (exists.exists) {
        const raw = await FileSystem.readAsStringAsync(this.filePath);
        const parsed = JSON.parse(raw);
        this.data = {
          themeMode: parsed.themeMode || "system",
          totalBytesSaved: Number(parsed.totalBytesSaved) || 0,
          hapticsEnabled: parsed.hapticsEnabled !== undefined ? Boolean(parsed.hapticsEnabled) : true,
        };
      }
    } catch {
      // Fallback to default in-memory state
    }
    this.isLoaded = true;
  }

  private async save(): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(
        this.filePath,
        JSON.stringify(this.data)
      );
    } catch {
      // Ignore write errors
    }
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  async getThemeMode(): Promise<ThemeMode> {
    await this.load();
    return this.data.themeMode;
  }

  async setThemeMode(mode: ThemeMode): Promise<void> {
    await this.load();
    this.data.themeMode = mode;
    await this.save();
  }

  async getHapticsEnabled(): Promise<boolean> {
    await this.load();
    return this.data.hapticsEnabled;
  }

  async setHapticsEnabled(enabled: boolean): Promise<void> {
    await this.load();
    this.data.hapticsEnabled = enabled;
    await this.save();
  }

  async getTotalBytesSaved(): Promise<number> {
    await this.load();
    return this.data.totalBytesSaved;
  }

  async addBytesSaved(bytes: number): Promise<void> {
    if (bytes <= 0) return;
    await this.load();
    this.data.totalBytesSaved += bytes;
    await this.save();
  }

  async getCacheSize(): Promise<number> {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) return 0;
      const info = await FileSystem.getInfoAsync(cacheDir);
      return (info as { size?: number }).size || 0;
    } catch {
      return 0;
    }
  }

  async clearCache(): Promise<void> {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) return;
      const files = await FileSystem.readDirectoryAsync(cacheDir);
      for (const file of files) {
        try {
          await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
        } catch {
          // ignore individual delete failure
        }
      }
      this.notify();
    } catch {
      // ignore
    }
  }
}

export const settingsStore = new SettingsStore();


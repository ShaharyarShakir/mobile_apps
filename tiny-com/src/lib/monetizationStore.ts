import * as FileSystem from "expo-file-system/legacy";

export const FREE_COMPRESSION_LIMIT = 5;

type EntitlementData = {
  isPro: boolean;
  totalCompressed: number;
};

class MonetizationStore {
  private data: EntitlementData = {
    isPro: false,
    totalCompressed: 0,
  };
  private isLoaded = false;
  private listeners: Array<() => void> = [];

  private get filePath(): string {
    return `${FileSystem.documentDirectory || ""}entitlements.json`;
  }

  private async load(): Promise<void> {
    if (this.isLoaded) return;
    try {
      const exists = await FileSystem.getInfoAsync(this.filePath);
      if (exists.exists) {
        const raw = await FileSystem.readAsStringAsync(this.filePath);
        const parsed = JSON.parse(raw);
        this.data = {
          isPro: Boolean(parsed.isPro),
          totalCompressed: Number(parsed.totalCompressed) || 0,
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

  async isPro(): Promise<boolean> {
    await this.load();
    return this.data.isPro;
  }

  async getRemainingFreeCompressions(): Promise<number> {
    await this.load();
    if (this.data.isPro) return Infinity;
    return Math.max(0, FREE_COMPRESSION_LIMIT - this.data.totalCompressed);
  }

  async canCompress(requestedCount: number = 1): Promise<boolean> {
    await this.load();
    if (this.data.isPro) return true;
    const remaining = Math.max(
      0,
      FREE_COMPRESSION_LIMIT - this.data.totalCompressed
    );
    return remaining >= requestedCount || remaining > 0;
  }

  async recordCompressions(count: number): Promise<void> {
    await this.load();
    if (!this.data.isPro) {
      this.data.totalCompressed += count;
      await this.save();
    }
  }

  async unlockPro(): Promise<void> {
    await this.load();
    this.data.isPro = true;
    await this.save();
  }

  async restorePurchases(): Promise<boolean> {
    await this.load();
    return this.data.isPro;
  }
}

export const monetizationStore = new MonetizationStore();


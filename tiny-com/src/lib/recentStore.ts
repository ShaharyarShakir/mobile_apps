import * as FileSystem from "expo-file-system/legacy";

export type RecentItem = {
  id: string;
  name: string;
  type: "image" | "pdf";
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
  uri?: string;
  timestamp: number;
  itemCount?: number;
};

const MAX_RECENT_ITEMS = 30;

class RecentStore {
  private items: RecentItem[] = [];
  private isLoaded = false;
  private listeners: Array<() => void> = [];

  private get filePath(): string {
    return `${FileSystem.documentDirectory || ""}recent_compressed.json`;
  }

  private async load(): Promise<void> {
    if (this.isLoaded) return;
    try {
      const exists = await FileSystem.getInfoAsync(this.filePath);
      if (exists.exists) {
        const raw = await FileSystem.readAsStringAsync(this.filePath);
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.items = parsed;
        }
      }
    } catch {
      this.items = [];
    }
    this.isLoaded = true;
  }

  private async save(): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(
        this.filePath,
        JSON.stringify(this.items)
      );
    } catch {
      // ignore
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

  async getRecentItems(): Promise<RecentItem[]> {
    await this.load();
    return [...this.items].sort((a, b) => b.timestamp - a.timestamp);
  }

  async addRecentItem(item: Omit<RecentItem, "id" | "timestamp"> & { id?: string; timestamp?: number }): Promise<void> {
    await this.load();
    const newItem: RecentItem = {
      id: item.id || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: item.timestamp || Date.now(),
      name: item.name,
      type: item.type,
      originalSize: item.originalSize,
      compressedSize: item.compressedSize,
      savingsPercentage: item.savingsPercentage,
      uri: item.uri,
      itemCount: item.itemCount,
    };

    // Filter out duplicates if same id or name+timestamp
    this.items = [newItem, ...this.items.filter((i) => i.id !== newItem.id)].slice(0, MAX_RECENT_ITEMS);
    await this.save();
  }

  async removeRecentItem(id: string): Promise<void> {
    await this.load();
    this.items = this.items.filter((i) => i.id !== id);
    await this.save();
  }

  async clearRecent(): Promise<void> {
    await this.load();
    this.items = [];
    await this.save();
  }
}

export const recentStore = new RecentStore();

import { createMMKV, type MMKV } from 'react-native-mmkv';

class MMKVFallback {
    private id: string;
    private storage: Map<string, string>;

    constructor(config?: { id?: string; encryptionKey?: string }) {
        this.id = config?.id || 'default';
        this.storage = new Map();
        
        // Try loading from localStorage if on web
        if (typeof window !== 'undefined' && window.localStorage) {
            const prefix = `mmkv:${this.id}:`;
            for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const value = window.localStorage.getItem(key);
                    if (value !== null) {
                        const originalKey = key.slice(prefix.length);
                        this.storage.set(originalKey, value);
                    }
                }
            }
        }
    }

    set(key: string, value: string | boolean | number) {
        const valStr = String(value);
        this.storage.set(key, valStr);
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(`mmkv:${this.id}:${key}`, valStr);
        }
    }

    getString(key: string): string | undefined {
        return this.storage.get(key);
    }

    getBoolean(key: string): boolean | undefined {
        const val = this.storage.get(key);
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
    }

    getNumber(key: string): number | undefined {
        const val = this.storage.get(key);
        if (val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
    }

    remove(key: string): boolean {
        const existed = this.storage.has(key);
        this.storage.delete(key);
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(`mmkv:${this.id}:${key}`);
        }
        return existed;
    }

    delete(key: string) {
        this.remove(key);
    }

    clearAll() {
        this.storage.clear();
        if (typeof window !== 'undefined' && window.localStorage) {
            const prefix = `mmkv:${this.id}:`;
            const keysToRemove: string[] = [];
            for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => window.localStorage.removeItem(key));
        }
    }
}

// Safely instantiate MMKV
const createMMKVInstance = (config: { id: string; encryptionKey?: string }) => {
    if (typeof createMMKV !== 'undefined') {
        try {
            return createMMKV(config as any);
        } catch (e) {
            console.warn(`[MMKV] Failed to initialize native MMKV instance:`, e);
        }
    }
    return new MMKVFallback(config);
};

export const tokenStorage = createMMKVInstance({
    id: 'token-storage',
    encryptionKey: 'some-secret-key',
}) as unknown as MMKV;

export const storage = createMMKVInstance({
    id: 'my-app-storage',
    encryptionKey: 'some-secret-key',
}) as unknown as MMKV;

export const mmkvStorage = {
    setItem: (key: string, value: string) => {
        storage.set(key, value);
    },
    getItem: (key: string) => {
        const value = storage.getString(key);
        return value ?? null;
    },
    removeItem: (key: string) => {
        storage.remove(key);
    },
};



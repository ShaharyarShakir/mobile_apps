import { useSyncExternalStore } from "react";
import type { SelectedImage } from "../types/image";

let images: SelectedImage[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const imageStore = {
  getImages(): SelectedImage[] {
    return images;
  },

  setImages(newImages: SelectedImage[]) {
    images = newImages;
    notify();
  },

  appendImages(newImages: SelectedImage[], limit = 20) {
    const existingIds = new Set(images.map((img) => img.id));
    const uniqueNew = newImages.filter((img) => !existingIds.has(img.id));
    const combined = [...images, ...uniqueNew].slice(0, limit);
    images = combined;
    notify();
  },

  removeImage(id: string) {
    images = images.filter((img) => img.id !== id);
    notify();
  },

  clearImages() {
    images = [];
    notify();
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useSelectedImages(): SelectedImage[] {
  return useSyncExternalStore(
    imageStore.subscribe,
    imageStore.getImages,
    imageStore.getImages
  );
}


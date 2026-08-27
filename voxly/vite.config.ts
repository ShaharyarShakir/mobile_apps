import { defineConfig, mergeConfig } from 'vite';
import { typescriptConfig } from '@nativescript/vite/typescript';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import nsTailwind from '@nativescript/tailwind/nativescript.vite.mjs';

export default defineConfig(({ mode }) => {
  return mergeConfig(typescriptConfig({ mode }), {
    plugins: [
      svelte({
        onwarn(warning, handler) {
          if (warning.code.startsWith('a11y_')) return;
          handler(warning);
        },
      }),
      nsTailwind(),
    ],
  });
});


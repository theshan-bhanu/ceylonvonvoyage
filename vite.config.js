import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/srilanka_tourism/',
  plugins: [
    tailwindcss(),
  ],
});

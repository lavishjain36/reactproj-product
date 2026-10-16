import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Starts the dev server and builds the production bundle.
export default defineConfig({
  plugins: [react()],
});

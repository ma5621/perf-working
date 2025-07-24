import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
  },
  build: {
    sourcemap: false, // Ensure source maps are off
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs from production
      },
    },
  },
}));

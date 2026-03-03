import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  server: {
    // Use env PORT if provided, otherwise default to 5173 for Vite dev server
    port: Number(process.env.PORT) || 5173,
    // Proxy API requests to backend during development to avoid CORS and 404 from Vite
    proxy: {
      "/api": {
        target: process.env.BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

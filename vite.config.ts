import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// VITE_BASE_PATH lets you configure the deployment sub-path.
// GitHub Pages repos: set VITE_BASE_PATH=/repo-name/ in your CI environment.
// Root domain deployments (e.g. username.github.io): leave unset (defaults to "/").
const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  appType: "mpa",
  plugins: [
    react(),
    {
      name: "static-directory-indexes",
      configureServer(server) {
        const root = server.config.base;
        server.middlewares.use((req, _res, next) => {
          const url = req.url ?? "";
          const pathname = url.split("?", 1)[0];
          if (pathname === root || pathname === `${root}v2/`) {
            req.url = `${pathname}index.html${url.slice(pathname.length)}`;
          }
          next();
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      input: path.resolve(import.meta.dirname, "legacy/v1/index.html"),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // Proxy for development against a local AI service.
    // API key authentication should be added here (server-side), never in client code.
    proxy: {
      "/api/ai": {
        target: process.env.VITE_AI_SERVICE_URL || "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});

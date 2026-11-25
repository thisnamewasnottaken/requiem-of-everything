import { defineConfig } from "@playwright/test";

const basePath = "/requiem-of-everything/";
const origin = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: `${origin}${basePath}`,
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      args: ["--enable-unsafe-swiftshader"],
    },
  },
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    env: { VITE_BASE_PATH: basePath },
    url: `${origin}${basePath}`,
    stdout: "pipe",
  },
});

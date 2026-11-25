import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  // Locale bundles are generated from public/v2/locales-src/.
  globalIgnores([
    "dist/",
    "coverage/",
    "playwright-report/",
    "test-results/",
    "test-artifacts/",
    "scratchpad/",
    "public/v2/common/locales/",
  ]),
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    extends: [js.configs.recommended],
    rules: { "no-unused-vars": "warn" },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  {
    files: ["src/**/*.{test,spec}.{ts,tsx}"],
    rules: { "@typescript-eslint/no-require-imports": "warn" },
  },
  {
    files: ["public/v2/common/**/*.js"],
    languageOptions: {
      // Do not rely on the deprecated implicit window.event global.
      globals: { ...globals.browser, event: "off" },
      sourceType: "script",
    },
    rules: { "no-empty": ["error", { allowEmptyCatch: true }] },
  },
  {
    files: ["public/v2/common/sound.js"],
    languageOptions: { sourceType: "module" },
  },
  {
    files: ["*.config.{js,ts}", "**/*.mjs"],
    languageOptions: { globals: globals.nodeBuiltin },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: { globals: globals.node },
  },
);

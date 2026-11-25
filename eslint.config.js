import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  // Locale bundles are generated from public/locales-src/.
  globalIgnores([
    "dist/",
    "coverage/",
    "playwright-report/",
    "test-results/",
    "test-artifacts/",
    "scratchpad/",
    "public/common/locales/",
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
    files: ["public/common/**/*.js", "public/v2/redirect.js"],
    languageOptions: {
      // Do not rely on the deprecated implicit window.event global.
      globals: { ...globals.browser, event: "off" },
      sourceType: "script",
    },
    rules: { "no-empty": ["error", { allowEmptyCatch: true }] },
  },
  {
    files: ["public/common/sound.js"],
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

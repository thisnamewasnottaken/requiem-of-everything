import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AIService } from "@/services/AIService";

// The AIService module reads VITE_* env vars at module load time.
// We test the stub (disabled) behaviour by default.

describe("AIService — stub mode (AI disabled)", () => {
  it("isEnabled() returns false when VITE_AI_ENABLED is not set", () => {
    expect(AIService.isEnabled()).toBe(false);
  });

  it("query() returns a narrative about AI being disabled", async () => {
    const response = await AIService.query({
      query: "test",
      context: { viewStartYear: 1600, viewEndYear: 1900, selectedComposerIds: [], selectedCompositionId: null },
      operation: "query",
    });
    expect(response.narrative).toMatch(/not.*enabled/i);
  });

  it("summarize() returns an empty narrative when disabled", async () => {
    const response = await AIService.summarize({
      query: "summarize bach",
      context: { viewStartYear: 1600, viewEndYear: 1900, selectedComposerIds: [], selectedCompositionId: null },
      operation: "summarize",
    });
    expect(response.narrative).toBeUndefined();
  });

  it("compare() returns an empty narrative when disabled", async () => {
    const response = await AIService.compare({
      query: "compare",
      context: { viewStartYear: 1600, viewEndYear: 1900, selectedComposerIds: [], selectedCompositionId: null },
      operation: "compare",
    });
    expect(response.narrative).toBeUndefined();
  });

  it("suggest() returns an empty suggestions array when disabled", async () => {
    const response = await AIService.suggest({
      query: "suggest",
      context: { viewStartYear: 1600, viewEndYear: 1900, selectedComposerIds: [], selectedCompositionId: null },
      operation: "suggest",
    });
    expect(response.suggestions).toEqual([]);
  });

  it("enrich() returns an empty response when disabled", async () => {
    const response = await AIService.enrich({
      query: "enrich",
      context: { viewStartYear: 1600, viewEndYear: 1900, selectedComposerIds: [], selectedCompositionId: null },
      operation: "enrich",
    });
    expect(response.narrative).toBeUndefined();
  });
});

// --- Security: API key must never be in client code ---

describe("AIService — security: no API key in client", () => {
  it("should not read VITE_AI_API_KEY from import.meta.env", () => {
    const source = readFileSync(join(process.cwd(), "src/services/AIService.ts"), "utf-8");
    // Check for actual env access, not comments that mention the key name
    expect(source).not.toMatch(/import\.meta\.env\.VITE_AI_API_KEY/);
  });

  it("should not send an Authorization header in _post()", () => {
    const source = readFileSync(join(process.cwd(), "src/services/AIService.ts"), "utf-8");
    expect(source).not.toMatch(/Authorization/);
  });

  it("should not use eval() or Function() constructor", () => {
    const source = readFileSync(join(process.cwd(), "src/services/AIService.ts"), "utf-8");
    expect(source).not.toMatch(/\beval\s*\(/);
    expect(source).not.toMatch(/new Function\s*\(/);
  });
});

// --- Security: fetch is only called when AI is enabled ---

describe("AIService — _post not called when disabled", () => {
  it("should not call fetch when AI is disabled", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await AIService.query({
      query: "test",
      context: { viewStartYear: 1600, viewEndYear: 1900, selectedComposerIds: [], selectedCompositionId: null },
      operation: "query",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

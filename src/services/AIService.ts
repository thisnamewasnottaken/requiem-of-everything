import type { AIQueryRequest, AIQueryResponse } from "@/types";

const AI_ENABLED = import.meta.env.VITE_AI_ENABLED === "true";
const AI_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL || "/api/ai";
// NOTE: Authentication must never be handled client-side.
// If your AI backend requires a key, configure it only in the Vite dev-server
// proxy headers (vite.config.ts) or a server-side reverse proxy.
// Never use VITE_AI_API_KEY — that prefix exposes the value in the client bundle.

/**
 * AI Service — Future integration point.
 *
 * This service is currently a stub. When VITE_AI_ENABLED is true,
 * it will make real API calls to the configured AI backend.
 * When disabled, all methods return graceful no-op responses.
 */
export const AIService = {
  /** Whether AI features are available */
  isEnabled(): boolean {
    return AI_ENABLED;
  },

  /** Send a natural language query */
  async query(request: AIQueryRequest): Promise<AIQueryResponse> {
    if (!AI_ENABLED) {
      return {
        narrative:
          "AI features are not currently enabled. Set VITE_AI_ENABLED=true to activate.",
        suggestions: [],
      };
    }

    return this._post("/query", request);
  },

  /** Generate a summary */
  async summarize(request: AIQueryRequest): Promise<AIQueryResponse> {
    if (!AI_ENABLED) return { narrative: undefined };
    return this._post("/summarize", { ...request, operation: "summarize" });
  },

  /** Compare composers */
  async compare(request: AIQueryRequest): Promise<AIQueryResponse> {
    if (!AI_ENABLED) return { narrative: undefined };
    return this._post("/compare", { ...request, operation: "compare" });
  },

  /** Enrich data with AI */
  async enrich(request: AIQueryRequest): Promise<AIQueryResponse> {
    if (!AI_ENABLED) return { narrative: undefined };
    return this._post("/enrich", { ...request, operation: "enrich" });
  },

  /** Get exploration suggestions */
  async suggest(request: AIQueryRequest): Promise<AIQueryResponse> {
    if (!AI_ENABLED) return { suggestions: [] };
    return this._post("/suggest", { ...request, operation: "suggest" });
  },

  /** Internal POST helper */
  async _post(
    endpoint: string,
    body: AIQueryRequest,
  ): Promise<AIQueryResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    // Auth is handled server-side (proxy or backend). No keys in the client.

    const response = await fetch(`${AI_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || `AI service error: ${response.status}`);
    }

    return response.json();
  },
};

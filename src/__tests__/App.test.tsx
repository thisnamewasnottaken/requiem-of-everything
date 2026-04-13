import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import i18n from "i18next";

// Mock heavy sub-components so App.tsx can be rendered in isolation
vi.mock("@/components/Timeline/Timeline", () => ({
  default: () => <div data-testid="timeline" />,
}));
vi.mock("@/components/FilterPanel/FilterPanel", () => ({
  default: () => null,
}));
vi.mock("@/components/HelpPanel/HelpPanel", () => ({
  default: () => null,
}));
vi.mock("@/components/ComparisonBar/ComparisonBar", () => ({
  default: () => null,
}));
vi.mock("@/components/ComposerCard/ComposerCard", () => ({
  default: () => null,
}));
vi.mock("@/components/CompositionDetail/CompositionDetail", () => ({
  default: () => null,
}));
vi.mock("@/components/SearchFilterBar/SearchFilterBar", () => ({
  default: () => null,
}));
vi.mock("@/components/TermExplorer/TermExplorer", () => ({
  default: () => null,
}));
vi.mock("@/components/OrchestraExplorer/OrchestraExplorer", () => ({
  default: () => null,
}));
vi.mock("@/components/WalkthroughOverlay/WalkthroughOverlay", () => ({
  default: () => null,
}));
vi.mock("@/hooks/useWalkthrough", () => ({
  useWalkthrough: () => ({
    startFullTour: vi.fn(),
    startWhatsNewTour: vi.fn(),
    shouldShowWelcome: false,
    shouldShowWhatsNew: false,
    shouldShowSubtlePrompt: false,
    dismissTour: vi.fn(),
    deferTour: vi.fn(),
    dismissWhatsNew: vi.fn(),
  }),
}));

import App from "@/App";

describe("App — document title and html lang i18n updates", () => {
  beforeEach(async () => {
    // Reset to English before each test
    await act(async () => {
      await i18n.changeLanguage("en-GB");
    });
  });

  afterEach(async () => {
    // Restore English after each test
    await act(async () => {
      await i18n.changeLanguage("en-GB");
    });
  });

  it("sets document.title from app.title and app.subtitle on mount (en-GB)", () => {
    render(<App />);
    expect(document.title).toBe(
      "Requiem of Everything — An interactive timeline of classical music",
    );
  });

  it("sets document.documentElement.lang to en-GB on mount", () => {
    render(<App />);
    expect(document.documentElement.lang).toBe("en-GB");
  });

  it("updates document.title when language changes to fr-FR", async () => {
    render(<App />);
    await act(async () => {
      await i18n.changeLanguage("fr-FR");
    });
    expect(document.title).toBe(
      "Requiem de Tout — Une chronologie interactive de la musique classique",
    );
  });

  it("updates document.title when language changes to af-ZA", async () => {
    render(<App />);
    await act(async () => {
      await i18n.changeLanguage("af-ZA");
    });
    expect(document.title).toBe(
      "Requiem van Alles — 'n Interaktiewe tydlyn van klassieke musiek",
    );
  });

  it("updates document.documentElement.lang when language changes to fr-FR", async () => {
    render(<App />);
    await act(async () => {
      await i18n.changeLanguage("fr-FR");
    });
    expect(document.documentElement.lang).toBe("fr-FR");
  });

  it("updates document.documentElement.lang when language changes to af-ZA", async () => {
    render(<App />);
    await act(async () => {
      await i18n.changeLanguage("af-ZA");
    });
    expect(document.documentElement.lang).toBe("af-ZA");
  });

  it("renders an aria-live region for screen reader language announcements", () => {
    const { container } = render(<App />);
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.getAttribute("aria-atomic")).toBe("true");
  });
});

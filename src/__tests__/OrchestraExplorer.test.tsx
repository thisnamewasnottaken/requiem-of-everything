import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Instrument } from "@/types";

const instruments: Instrument[] = [
  {
    id: "violin",
    name: "Violin",
    family: "strings",
    range: "G3–A7",
    role: "The orchestral melody voice.",
    description: "A bowed string instrument.",
    eraProminence: [{ era: "baroque", prominence: "primary" }],
    wikipediaSlug: "Violin",
  },
  {
    id: "cello",
    name: "Cello",
    family: "strings",
    range: "C2–A5",
    role: "The warm middle voice.",
    description: "A bowed string instrument.",
    eraProminence: [{ era: "classical", prominence: "primary" }],
    wikipediaSlug: "Cello",
  },
  {
    id: "flute",
    name: "Flute",
    family: "woodwinds",
    range: "C4–D7",
    role: "A clear, agile voice.",
    description: "A woodwind instrument.",
    eraProminence: [{ era: "classical", prominence: "primary" }],
    wikipediaSlug: "Flute",
  },
];

vi.mock("@/hooks/useData", () => ({
  useInstruments: () => instruments,
  useCompositions: () => [],
  useComposers: () => [],
}));

import OrchestraExplorer from "@/components/OrchestraExplorer/OrchestraExplorer";

describe("OrchestraExplorer", () => {
  beforeEach(() => {
    render(<OrchestraExplorer />);
  });

  it("shows a translated, count-bearing control for every family", () => {
    const index = screen.getByRole("navigation", { name: "Choose a family" });
    expect(index.querySelectorAll("button")).toHaveLength(6);
    expect(
      screen.getByRole("button", { name: "Strings, 2 instruments" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: "Woodwinds, 1 instrument" }),
    ).toBeInTheDocument();
  });

  it("opens a family from the family index and exposes keyboard-operable instruments", () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Strings, 2 instruments" }),
    );

    expect(
      screen.getByRole("button", { name: "Strings, 2 instruments" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/warm, rich core/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Violin" })).toHaveAttribute(
      "tabindex",
      "0",
    );
  });

  it("opens instrument details from the keyboard and backs out with Escape", () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Strings, 2 instruments" }),
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Violin" }), {
      key: "Enter",
    });

    expect(screen.getByRole("heading", { name: "Violin" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("heading", { name: "Violin" })).toBeNull();
    expect(screen.getByText(/warm, rich core/)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText(/warm, rich core/)).toBeNull();
  });
});

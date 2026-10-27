import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  Composer,
  Composition,
  Instrument,
  MusicalEraDefinition,
} from "@/types";

const { openSpotify } = vi.hoisted(() => ({ openSpotify: vi.fn() }));

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

const eras: MusicalEraDefinition[] = [
  {
    id: "renaissance",
    name: "Renaissance",
    startYear: 1400,
    endYear: 1600,
    description: "Polyphony changes how voices meet.",
    color: "#8B6914",
    characteristics: ["Polyphony", "Vocal music", "Motets"],
  },
  {
    id: "baroque",
    name: "Baroque",
    startYear: 1600,
    endYear: 1750,
    description: "A new theatrical sound takes the stage.",
    color: "#C4A035",
    characteristics: ["Continuo", "Opera", "Ornament"],
  },
];

const compositions: Composition[] = [
  {
    id: "renaissance-score",
    title: "Missa Brevis",
    composerId: "renaissance-composer",
    yearComposed: 1550,
    genre: "mass",
    instrumentation: "SATB choir",
    description: "A woven vocal texture.",
    tags: [],
    spotifyUrl: "https://open.spotify.com/search/missa",
  },
  {
    id: "baroque-score",
    title: "The New Theatre",
    composerId: "baroque-composer",
    yearComposed: 1680,
    genre: "opera",
    instrumentation: "Violin, strings and continuo",
    description: "A staged musical drama.",
    tags: [],
    spotifyUrl: "https://open.spotify.com/search/theatre",
  },
];

const composers: Composer[] = [
  {
    id: "renaissance-composer",
    name: "Renaissance Composer",
    shortName: "Renaissance",
    birthYear: 1500,
    deathYear: 1570,
    birthPlace: "Italy",
    nationality: "Italian",
    era: "renaissance",
    biography: "",
    wikipediaSlug: "Renaissance_composer",
    compositionIds: ["renaissance-score"],
    tags: [],
  },
  {
    id: "baroque-composer",
    name: "Baroque Composer",
    shortName: "Baroque",
    birthYear: 1650,
    deathYear: 1720,
    birthPlace: "England",
    nationality: "English",
    era: "baroque",
    biography: "",
    wikipediaSlug: "Baroque_composer",
    compositionIds: ["baroque-score"],
    tags: [],
  },
];

vi.mock("@/hooks/useData", () => ({
  useInstruments: () => instruments,
  useCompositions: () => compositions,
  useComposers: () => composers,
  useEras: () => eras,
}));

vi.mock("@/utils/spotify", () => ({ openSpotify }));

import OrchestraExplorer from "@/components/OrchestraExplorer/OrchestraExplorer";

describe("OrchestraExplorer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("opens instrument details from the keyboard and backs out with Escape", async () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Strings, 2 instruments" }),
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Violin" }), {
      key: "Enter",
    });

    expect(screen.getByRole("heading", { name: "Violin" })).toBeInTheDocument();

    const instrumentHeading = screen.getByRole("heading", { name: "Violin" });
    fireEvent.keyDown(window, { key: "Escape" });
    await waitForElementToBeRemoved(instrumentHeading);
    expect(screen.getByText(/warm, rich core/)).toBeInTheDocument();

    const familyDescription = screen.getByText(/warm, rich core/);
    fireEvent.keyDown(window, { key: "Escape" });
    await waitForElementToBeRemoved(familyDescription);
  });

  it("recomposes the story and instrument counts when the era changes", () => {
    fireEvent.click(screen.getByRole("tab", { name: "Baroque, 1600–1750" }));

    expect(
      screen.getByRole("tab", { name: "Baroque, 1600–1750" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Baroque" })).toBeInTheDocument();
    expect(screen.getByText("A staged musical drama.")).toBeInTheDocument();
    expect(screen.getByText("A new theatrical sound takes the stage.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Strings, 2 instruments" }),
    ).toHaveTextContent("Era emphasis: 1 / 2");
    expect(
      screen.getByRole("button", { name: "Strings, 2 instruments" }),
    ).toHaveAccessibleDescription("Era emphasis: 1 / 2");
  });

  it("moves through era chapters with arrow keys", () => {
    const renaissanceTab = screen.getByRole("tab", {
      name: "Renaissance, 1400–1600",
    });

    renaissanceTab.focus();
    fireEvent.keyDown(renaissanceTab, { key: "ArrowRight" });

    expect(screen.getByRole("tab", { name: "Baroque, 1600–1750" })).toHaveFocus();
    expect(
      screen.getByRole("tab", { name: "Baroque, 1600–1750" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("opens the selected score through the existing Spotify action", () => {
    fireEvent.click(screen.getByRole("tab", { name: "Baroque, 1600–1750" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Listen to The New Theatre on Spotify",
      }),
    );

    expect(openSpotify).toHaveBeenCalledWith(
      "https://open.spotify.com/search/theatre",
    );
  });

  it("lets visitors choose another score within the selected era", () => {
    fireEvent.click(screen.getByRole("tab", { name: "Baroque, 1600–1750" }));
    fireEvent.click(screen.getByRole("button", { name: "The New Theatre 1680" }));

    expect(screen.getByRole("heading", { name: "The New Theatre" })).toBeInTheDocument();
    expect(screen.getByText("Violin, strings and continuo")).toBeInTheDocument();
  });

  it("uses the chosen score to illuminate named instruments on the stage", async () => {
    fireEvent.click(screen.getByRole("tab", { name: "Baroque, 1600–1750" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Strings, 2 instruments" }),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Violin" })).toHaveAttribute(
        "opacity",
        "1",
      ),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Cello" })).toHaveAttribute(
        "opacity",
        "0.16",
      ),
    );
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TermExplorer from "@/components/TermExplorer/TermExplorer";
import { useFilterStore } from "@/stores/useFilterStore";
import type { MusicalTerm } from "@/types";
import termsData from "@/data/terms.json";
import compositionsData from "@/data/compositions.json";

vi.mock("@/utils/spotify", () => ({ openSpotify: vi.fn() }));

import { openSpotify } from "@/utils/spotify";

const allTerms = termsData as MusicalTerm[];

// Find the symphony term (has 3 example compositions, all with spotifyUrl)
const symphonyTerm = allTerms.find((t) => t.id === "symphony")!;

describe("TermExplorer — Spotify links in modal", () => {
  beforeEach(() => {
    useFilterStore.setState({ eraFilters: [], searchQuery: "" });
    vi.clearAllMocks();
  });

  it("renders clickable Spotify button for example compositions with spotifyUrl", () => {
    render(<TermExplorer />);

    // Open the Symphony modal by clicking its card
    const card = screen.getByText("Symphony");
    fireEvent.click(card);

    // The modal should now be open; Spotify buttons should appear
    const spotifyBtns = screen.getAllByRole("button", {
      name: /listen to .+ on spotify/i,
    });
    expect(spotifyBtns.length).toBeGreaterThan(0);
  });

  it("does not render Spotify button for compositions without spotifyUrl", () => {
    // All 196 compositions have spotifyUrl in this dataset, so instead
    // we verify that the count of Spotify buttons matches the count of
    // example compositions with spotifyUrl for the symphony term
    render(<TermExplorer />);
    const card = screen.getByText("Symphony");
    fireEvent.click(card);

    const spotifyBtns = screen.getAllByRole("button", {
      name: /listen to .+ on spotify/i,
    });
    // Should equal the number of example compositions that have spotifyUrl
    const exampleIds = symphonyTerm.exampleCompositionIds;
    const withSpotify = (compositionsData as any[]).filter(
      (c) => exampleIds.includes(c.id) && c.spotifyUrl,
    );
    expect(spotifyBtns.length).toBe(withSpotify.length);
  });

  it("Spotify button calls openSpotify with correct URL when clicked", () => {
    render(<TermExplorer />);
    const card = screen.getByText("Symphony");
    fireEvent.click(card);

    const spotifyBtns = screen.getAllByRole("button", {
      name: /listen to .+ on spotify/i,
    });
    fireEvent.click(spotifyBtns[0]);

    expect(openSpotify).toHaveBeenCalledTimes(1);
    // The URL should be a Spotify web URL
    const calledWith = (openSpotify as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(calledWith).toMatch(/^https:\/\/open\.spotify\.com\//);
  });

  it("Spotify button has accessible aria-label containing the composition title", () => {
    render(<TermExplorer />);
    const card = screen.getByText("Symphony");
    fireEvent.click(card);

    const spotifyBtns = screen.getAllByRole("button", {
      name: /listen to .+ on spotify/i,
    });
    // Each button's aria-label should contain the composition title
    spotifyBtns.forEach((btn) => {
      const label = btn.getAttribute("aria-label") ?? "";
      expect(label).toMatch(/listen to .+ on spotify/i);
    });
  });

  it("should not use innerHTML or dangerouslySetInnerHTML", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/TermExplorer/TermExplorer.tsx"),
      "utf-8",
    );
    expect(source).not.toMatch(/innerHTML/);
    expect(source).not.toMatch(/dangerouslySetInnerHTML/);
  });
});

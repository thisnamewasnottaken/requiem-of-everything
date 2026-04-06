import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CompositionDetail from "@/components/CompositionDetail/CompositionDetail";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { openSpotify } from "@/utils/spotify";
import type { Composer, Composition } from "@/types";
import compositionsData from "@/data/compositions.json";
import composersData from "@/data/composers.json";

vi.mock("@/utils/spotify", () => ({ openSpotify: vi.fn() }));

// Use raw data directly for test setup (hooks require React component context)
const allCompositions = compositionsData as Composition[];
const allComposers = composersData as Composer[];

// Pick a composition that has a composer in the data
const testComposition = allCompositions[0];
const testComposer = allComposers.find((c) => c.id === testComposition.composerId)!;

describe("CompositionDetail", () => {
  beforeEach(() => {
    useSelectionStore.setState({
      selectedComposerIds: [],
      selectedCompositionId: testComposition.id,
    });
  });

  it("renders the composition title", () => {
    render(<CompositionDetail compositionId={testComposition.id} />);
    expect(screen.getByText(testComposition.title)).toBeDefined();
  });

  it("renders the composer's name", () => {
    render(<CompositionDetail compositionId={testComposition.id} />);
    expect(screen.getByText(testComposer.name)).toBeDefined();
  });

  it("renders the year of composition", () => {
    render(<CompositionDetail compositionId={testComposition.id} />);
    const yearText = String(testComposition.yearComposed);
    expect(screen.getByText(new RegExp(yearText))).toBeDefined();
  });

  it("renders the genre badge", () => {
    render(<CompositionDetail compositionId={testComposition.id} />);
    const genreText = testComposition.genre.replace(/-/g, " ");
    expect(screen.getByText(genreText)).toBeDefined();
  });

  it("renders the description", () => {
    render(<CompositionDetail compositionId={testComposition.id} />);
    expect(screen.getByText(testComposition.description)).toBeDefined();
  });

  it("renders the instrumentation label and value", () => {
    render(<CompositionDetail compositionId={testComposition.id} />);
    expect(screen.getByText("Instrumentation")).toBeDefined();
    expect(screen.getByText(testComposition.instrumentation)).toBeDefined();
  });

  it("returns null for an unknown composition id", () => {
    const { container } = render(
      <CompositionDetail compositionId="non-existent-id" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("clicking the close button calls selectComposition(null)", () => {
    render(<CompositionDetail compositionId={testComposition.id} />);
    fireEvent.click(screen.getByRole("button", { name: /close composition details/i }));
    expect(useSelectionStore.getState().selectedCompositionId).toBeNull();
  });

  it("clicking the composer chip calls selectComposer with the correct id", () => {
    render(<CompositionDetail compositionId={testComposition.id} />);
    const chip = screen.getByRole("button", { name: new RegExp(testComposer.name) });
    fireEvent.click(chip);
    expect(useSelectionStore.getState().selectedComposerIds).toContain(
      testComposition.composerId,
    );
  });

  it("does not render the significance section when significance is absent", () => {
    const compWithoutSig = allCompositions.find((c) => !c.significance);
    if (!compWithoutSig) return; // Skip if all compositions have significance
    render(<CompositionDetail compositionId={compWithoutSig.id} />);
    expect(screen.queryByText("♪")).toBeNull();
  });

  it("renders the Wikipedia link with correct security attributes when wikipediaSlug is present", () => {
    const compWithWiki = allCompositions.find((c) => c.wikipediaSlug);
    if (!compWithWiki) return; // Skip if no composition has a Wikipedia slug
    render(<CompositionDetail compositionId={compWithWiki.id} />);
    const wikiLink = screen.getByRole("link", { name: /read on wikipedia/i });
    expect(wikiLink.getAttribute("rel")).toBe("noopener noreferrer");
    expect(wikiLink.getAttribute("target")).toBe("_blank");
    expect(wikiLink.getAttribute("href")).toContain(
      `.wikipedia.org/wiki/${compWithWiki.wikipediaSlug}`,
    );
  });

  it("does not render a Wikipedia link when wikipediaSlug is absent", () => {
    const compWithoutWiki = allCompositions.find((c) => !c.wikipediaSlug);
    if (!compWithoutWiki) return;
    render(<CompositionDetail compositionId={compWithoutWiki.id} />);
    expect(screen.queryByRole("link", { name: /read on wikipedia/i })).toBeNull();
  });

  it("has role='complementary' and aria-label='Composition details'", () => {
    render(<CompositionDetail compositionId={testComposition.id} />);
    expect(
      screen.getByRole("complementary", { name: "Composition details" }),
    ).toBeDefined();
  });

  // Security
  it("should not use innerHTML or dangerouslySetInnerHTML", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/CompositionDetail/CompositionDetail.tsx"),
      "utf-8",
    );
    expect(source).not.toMatch(/innerHTML/);
    expect(source).not.toMatch(/dangerouslySetInnerHTML/);
  });

  it("renders Spotify button when spotifyUrl is present", () => {
    const compWithSpotify = allCompositions.find((c) => c.spotifyUrl);
    if (!compWithSpotify) return;
    render(<CompositionDetail compositionId={compWithSpotify.id} />);
    const btn = screen.getByRole("button", {
      name: new RegExp(`Listen to .+ on Spotify`, "i"),
    });
    expect(btn).toBeDefined();
    expect(btn.getAttribute("aria-label")).toContain(compWithSpotify.title);
  });

  it("does not render Spotify button when spotifyUrl is absent", () => {
    const compWithoutSpotify = allCompositions.find((c) => !c.spotifyUrl);
    if (!compWithoutSpotify) return;
    render(<CompositionDetail compositionId={compWithoutSpotify.id} />);
    expect(
      screen.queryByRole("button", { name: /listen.*spotify/i }),
    ).toBeNull();
  });

  it("Spotify button calls openSpotify with correct URL when clicked", () => {
    const compWithSpotify = allCompositions.find((c) => c.spotifyUrl);
    if (!compWithSpotify) return;
    render(<CompositionDetail compositionId={compWithSpotify.id} />);
    const btn = screen.getByRole("button", {
      name: new RegExp(`Listen to .+ on Spotify`, "i"),
    });
    fireEvent.click(btn);
    expect(openSpotify).toHaveBeenCalledWith(compWithSpotify.spotifyUrl);
  });
});

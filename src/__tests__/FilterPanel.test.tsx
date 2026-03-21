import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FilterPanel from "@/components/FilterPanel/FilterPanel";
import { useFilterStore } from "@/stores/useFilterStore";

// CSS Modules are mocked globally by vitest (returns empty objects),
// so className assertions are skipped — we rely on aria attributes instead.

describe("FilterPanel", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    useFilterStore.setState({
      eraFilters: [],
      nationalityFilters: [],
      genreFilters: [],
      showHistoricalEvents: true,
      eventCategoryFilters: [],
      searchQuery: "",
    });
    onClose.mockClear();
  });

  it("renders without crashing", () => {
    render(<FilterPanel onClose={onClose} />);
    expect(screen.getByRole("navigation", { name: "Timeline filters" })).toBeDefined();
  });

  it("renders the search input with correct aria-label", () => {
    render(<FilterPanel onClose={onClose} />);
    expect(
      screen.getByRole("textbox", { name: /search composers/i }),
    ).toBeDefined();
  });

  it("calls onClose when the close button is clicked", () => {
    render(<FilterPanel onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close filters/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders era filter buttons", () => {
    render(<FilterPanel onClose={onClose} />);
    expect(screen.getByRole("group", { name: /filter by era/i })).toBeDefined();
    // At least one era chip should be present
    const eraGroup = screen.getByRole("group", { name: /filter by era/i });
    expect(eraGroup.querySelectorAll("button").length).toBeGreaterThan(0);
  });

  it("renders nationality filter buttons", () => {
    render(<FilterPanel onClose={onClose} />);
    expect(screen.getByRole("group", { name: /filter by nationality/i })).toBeDefined();
    const natGroup = screen.getByRole("group", { name: /filter by nationality/i });
    expect(natGroup.querySelectorAll("button").length).toBeGreaterThan(0);
  });

  it("renders genre filter buttons", () => {
    render(<FilterPanel onClose={onClose} />);
    expect(screen.getByRole("group", { name: /filter by genre/i })).toBeDefined();
    const genreGroup = screen.getByRole("group", { name: /filter by genre/i });
    expect(genreGroup.querySelectorAll("button").length).toBeGreaterThan(0);
  });

  it("toggling an era updates the store", () => {
    render(<FilterPanel onClose={onClose} />);
    const eraGroup = screen.getByRole("group", { name: /filter by era/i });
    const firstChip = eraGroup.querySelectorAll("button")[0] as HTMLElement;
    fireEvent.click(firstChip);
    expect(useFilterStore.getState().eraFilters.length).toBe(1);
  });

  it("toggling a nationality updates the store", () => {
    render(<FilterPanel onClose={onClose} />);
    const natGroup = screen.getByRole("group", { name: /filter by nationality/i });
    const firstChip = natGroup.querySelectorAll("button")[0] as HTMLElement;
    fireEvent.click(firstChip);
    expect(useFilterStore.getState().nationalityFilters.length).toBe(1);
  });

  it("toggling a genre updates the store", () => {
    render(<FilterPanel onClose={onClose} />);
    const genreGroup = screen.getByRole("group", { name: /filter by genre/i });
    const firstChip = genreGroup.querySelectorAll("button")[0] as HTMLElement;
    fireEvent.click(firstChip);
    expect(useFilterStore.getState().genreFilters.length).toBe(1);
  });

  it("typing in the search input updates the store", () => {
    render(<FilterPanel onClose={onClose} />);
    const input = screen.getByRole("textbox", { name: /search composers/i });
    fireEvent.change(input, { target: { value: "Bach" } });
    expect(useFilterStore.getState().searchQuery).toBe("Bach");
  });

  it("clicking Clear All Filters resets the store", () => {
    useFilterStore.setState({
      eraFilters: ["baroque"],
      nationalityFilters: ["German"],
      genreFilters: ["symphony"],
      searchQuery: "bach",
    });
    render(<FilterPanel onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /clear all filters/i }));
    const state = useFilterStore.getState();
    expect(state.eraFilters).toEqual([]);
    expect(state.nationalityFilters).toEqual([]);
    expect(state.genreFilters).toEqual([]);
    expect(state.searchQuery).toBe("");
  });

  it("shows the active filter count badge when filters are active", () => {
    useFilterStore.setState({ eraFilters: ["baroque", "classical"] });
    render(<FilterPanel onClose={onClose} />);
    expect(screen.getByText("2")).toBeDefined();
  });

  it("the historical events toggle acts as a switch", () => {
    render(<FilterPanel onClose={onClose} />);
    const toggle = screen.getByRole("switch", { name: /toggle historical events/i });
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(toggle);
    expect(useFilterStore.getState().showHistoricalEvents).toBe(false);
  });

  // Security
  it("should not use innerHTML or dangerouslySetInnerHTML", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/FilterPanel/FilterPanel.tsx"),
      "utf-8",
    );
    expect(source).not.toMatch(/innerHTML/);
    expect(source).not.toMatch(/dangerouslySetInnerHTML/);
  });
});

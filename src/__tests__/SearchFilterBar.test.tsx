import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import SearchFilterBar from "@/components/SearchFilterBar/SearchFilterBar";
import { useFilterStore } from "@/stores/useFilterStore";
import { useComparisonStore } from "@/stores/useComparisonStore";

describe("SearchFilterBar", () => {
  const onToggleFilters = vi.fn();

  beforeEach(() => {
    useFilterStore.setState({
      searchQuery: "",
      eraFilters: [],
      nationalityFilters: [],
      genreFilters: [],
      showHistoricalEvents: true,
      eventCategoryFilters: [],
    });
    useComparisonStore.setState({
      comparisonComposerIds: [],
      isComparisonMode: false,
    });
    onToggleFilters.mockClear();
  });

  it("renders the search input when no comparison composers are selected", () => {
    render(
      <SearchFilterBar filterOpen={false} onToggleFilters={onToggleFilters} />,
    );
    expect(
      screen.getByRole("textbox", { name: /search composers/i }),
    ).toBeDefined();
  });

  it("removes the search input from the DOM when one composer is selected for comparison", () => {
    useComparisonStore.setState({
      comparisonComposerIds: ["bach"],
      isComparisonMode: false,
    });
    render(
      <SearchFilterBar filterOpen={false} onToggleFilters={onToggleFilters} />,
    );
    expect(
      screen.queryByRole("textbox", { name: /search composers/i }),
    ).toBeNull();
  });

  it("removes the search input from the DOM when comparison mode is fully active (2+ composers)", () => {
    useComparisonStore.setState({
      comparisonComposerIds: ["bach", "mozart"],
      isComparisonMode: true,
    });
    render(
      <SearchFilterBar filterOpen={false} onToggleFilters={onToggleFilters} />,
    );
    expect(
      screen.queryByRole("textbox", { name: /search composers/i }),
    ).toBeNull();
  });

  it("restores the search input with the previous searchQuery when comparison is cleared", () => {
    useFilterStore.setState({ searchQuery: "Beethoven" });
    useComparisonStore.setState({
      comparisonComposerIds: ["bach", "mozart"],
      isComparisonMode: true,
    });
    const { rerender } = render(
      <SearchFilterBar filterOpen={false} onToggleFilters={onToggleFilters} />,
    );

    // Input absent during comparison
    expect(
      screen.queryByRole("textbox", { name: /search composers/i }),
    ).toBeNull();

    // Clear comparison
    act(() => {
      useComparisonStore.setState({
        comparisonComposerIds: [],
        isComparisonMode: false,
      });
    });
    rerender(
      <SearchFilterBar filterOpen={false} onToggleFilters={onToggleFilters} />,
    );

    // Input reappears with previous query intact
    const input = screen.getByRole("textbox", {
      name: /search composers/i,
    }) as HTMLInputElement;
    expect(input.value).toBe("Beethoven");
  });

  it("keeps the filter toggle button accessible when comparison is active", () => {
    useComparisonStore.setState({
      comparisonComposerIds: ["bach"],
      isComparisonMode: false,
    });
    render(
      <SearchFilterBar filterOpen={false} onToggleFilters={onToggleFilters} />,
    );
    expect(screen.getByRole("button", { name: /filters/i })).toBeDefined();
  });

  it("shows the clear button only when searchQuery is non-empty", () => {
    render(
      <SearchFilterBar filterOpen={false} onToggleFilters={onToggleFilters} />,
    );
    expect(
      screen.queryByRole("button", { name: /clear search/i }),
    ).toBeNull();

    fireEvent.change(
      screen.getByRole("textbox", { name: /search composers/i }),
      { target: { value: "Bach" } },
    );
    expect(
      screen.getByRole("button", { name: /clear search/i }),
    ).toBeDefined();
  });

  it("clicking the clear button resets the search query", () => {
    useFilterStore.setState({ searchQuery: "Bach" });
    render(
      <SearchFilterBar filterOpen={false} onToggleFilters={onToggleFilters} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /clear search/i }));
    expect(useFilterStore.getState().searchQuery).toBe("");
  });

  // Security
  it("should not use innerHTML or dangerouslySetInnerHTML", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "src/components/SearchFilterBar/SearchFilterBar.tsx",
      ),
      "utf-8",
    );
    expect(source).not.toMatch(/innerHTML/);
    expect(source).not.toMatch(/dangerouslySetInnerHTML/);
  });
});

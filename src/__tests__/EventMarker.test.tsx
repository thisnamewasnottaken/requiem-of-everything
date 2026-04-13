import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EventMarker from "@/components/EventMarker/EventMarker";
import type { HistoricalEvent } from "@/types";

const rangeEvent: HistoricalEvent = {
  id: "thirty-years-war",
  title: "Thirty Years' War",
  year: 1618,
  endYear: 1648,
  category: "war",
  description: "A major conflict in Central Europe.",
  wikipediaSlug: "Thirty_Years%27_War",
};

describe("EventMarker", () => {
  it("renders the historical event marker for range events", () => {
    render(
      <EventMarker
        event={rangeEvent}
        startYear={1600}
        endYear={1700}
        width={1000}
        timelineHeight={320}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Historical event: Thirty Years' War, 1618",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("1618 – 1648")).toBeInTheDocument();
  });

  it("does not render a full-height vertical backdrop band for historical events", () => {
    const { container } = render(
      <EventMarker
        event={rangeEvent}
        startYear={1600}
        endYear={1700}
        width={1000}
        timelineHeight={320}
      />,
    );

    const eventRangeBand = Array.from(container.querySelectorAll("div")).find(
      (element) => {
        const style = element.getAttribute("style") ?? "";
        return (
          style.includes("left: 180px") &&
          style.includes("width: 300px") &&
          style.includes("background-color")
        );
      },
    );

    expect(eventRangeBand).toBeUndefined();
  });
});

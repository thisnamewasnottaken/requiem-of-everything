import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WalkthroughOverlay from "@/components/WalkthroughOverlay/WalkthroughOverlay";
import i18n from "i18next";

const mockProps = {
  mode: "welcome" as const,
  onStartFullTour: vi.fn(),
  onStartWhatsNew: vi.fn(),
  onDefer: vi.fn(),
  onDismiss: vi.fn(),
};

describe("WalkthroughOverlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("welcome mode", () => {
    it("renders welcome title and description", () => {
      render(<WalkthroughOverlay {...mockProps} mode="welcome" />);
      expect(
        screen.getByText("Welcome to Requiem of Everything"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Discover 500 years of classical music/),
      ).toBeInTheDocument();
    });

    it("renders Start Tour, Maybe Later, and Don't ask again buttons", () => {
      render(<WalkthroughOverlay {...mockProps} mode="welcome" />);
      expect(screen.getByText("Start Tour")).toBeInTheDocument();
      expect(screen.getByText("Maybe Later")).toBeInTheDocument();
      expect(screen.getByText("Don't ask again")).toBeInTheDocument();
    });

    it("calls onStartFullTour when Start Tour clicked", () => {
      render(<WalkthroughOverlay {...mockProps} mode="welcome" />);
      fireEvent.click(screen.getByText("Start Tour"));
      expect(mockProps.onStartFullTour).toHaveBeenCalledTimes(1);
    });

    it("calls onDefer when Maybe Later clicked", () => {
      render(<WalkthroughOverlay {...mockProps} mode="welcome" />);
      fireEvent.click(screen.getByText("Maybe Later"));
      expect(mockProps.onDefer).toHaveBeenCalledTimes(1);
    });

    it("calls onDismiss when Don't ask again clicked", () => {
      render(<WalkthroughOverlay {...mockProps} mode="welcome" />);
      fireEvent.click(screen.getByText("Don't ask again"));
      expect(mockProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    it("calls onDefer when Escape key pressed", () => {
      render(<WalkthroughOverlay {...mockProps} mode="welcome" />);
      fireEvent.keyDown(window, { key: "Escape" });
      expect(mockProps.onDefer).toHaveBeenCalledTimes(1);
    });

    it("calls onDefer when backdrop clicked", () => {
      const { container } = render(
        <WalkthroughOverlay {...mockProps} mode="welcome" />,
      );
      const backdrop = container.firstChild as HTMLElement;
      fireEvent.click(backdrop);
      expect(mockProps.onDefer).toHaveBeenCalledTimes(1);
    });

    it("has proper dialog role and aria-modal", () => {
      render(<WalkthroughOverlay {...mockProps} mode="welcome" />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "walkthrough-title");
    });
  });

  describe("whats-new mode", () => {
    it("renders what's new title and description", () => {
      render(<WalkthroughOverlay {...mockProps} mode="whats-new" />);
      expect(screen.getByText("What's New")).toBeInTheDocument();
      expect(
        screen.getByText(/New features have been added/),
      ).toBeInTheDocument();
    });

    it("renders See What's New, Full Tour, Maybe Later, Don't ask again buttons", () => {
      render(<WalkthroughOverlay {...mockProps} mode="whats-new" />);
      expect(screen.getByText("See What's New")).toBeInTheDocument();
      expect(screen.getByText("Full Tour")).toBeInTheDocument();
      expect(screen.getByText("Maybe Later")).toBeInTheDocument();
      expect(screen.getByText("Don't ask again")).toBeInTheDocument();
    });

    it("calls onStartWhatsNew when See What's New clicked", () => {
      render(<WalkthroughOverlay {...mockProps} mode="whats-new" />);
      fireEvent.click(screen.getByText("See What's New"));
      expect(mockProps.onStartWhatsNew).toHaveBeenCalledTimes(1);
    });

    it("calls onStartFullTour when Full Tour clicked", () => {
      render(<WalkthroughOverlay {...mockProps} mode="whats-new" />);
      fireEvent.click(screen.getByText("Full Tour"));
      expect(mockProps.onStartFullTour).toHaveBeenCalledTimes(1);
    });
  });

  it("should not use dangerouslySetInnerHTML", () => {
    const source = require("fs").readFileSync(
      require("path").resolve(
        __dirname,
        "../components/WalkthroughOverlay/WalkthroughOverlay.tsx",
      ),
      "utf-8",
    );
    expect(source).not.toContain("dangerouslySetInnerHTML");
  });

  it("should not inject any external scripts", () => {
    const source = require("fs").readFileSync(
      require("path").resolve(
        __dirname,
        "../components/WalkthroughOverlay/WalkthroughOverlay.tsx",
      ),
      "utf-8",
    );
    expect(source).not.toMatch(/createElement\s*\(\s*['"]script['"]/);
    expect(source).not.toMatch(/document\.write/);
  });

  describe("language switcher", () => {
    it("renders a language selector with en-GB, fr-FR, and af-ZA options", () => {
      render(<WalkthroughOverlay {...mockProps} mode="welcome" />);
      const select = screen.getByRole("combobox", { name: /select language/i });
      expect(select).toBeInTheDocument();
      const options = Array.from(select.querySelectorAll("option")).map(
        (o) => (o as HTMLOptionElement).value,
      );
      expect(options).toContain("en-GB");
      expect(options).toContain("fr-FR");
      expect(options).toContain("af-ZA");
    });

    it("renders language selector in whats-new mode too", () => {
      render(<WalkthroughOverlay {...mockProps} mode="whats-new" />);
      expect(screen.getByRole("combobox", { name: /select language/i })).toBeInTheDocument();
    });

    it("calls i18n.changeLanguage when language is changed", () => {
      const spy = vi.spyOn(i18n, "changeLanguage").mockResolvedValue(undefined as any);
      render(<WalkthroughOverlay {...mockProps} mode="welcome" />);
      const select = screen.getByRole("combobox", { name: /select language/i });
      fireEvent.change(select, { target: { value: "fr-FR" } });
      expect(spy).toHaveBeenCalledWith("fr-FR");
      spy.mockRestore();
    });
  });
});

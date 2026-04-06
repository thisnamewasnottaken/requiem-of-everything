import { describe, it, expect, beforeEach } from "vitest";
import {
  TOUR_VERSION,
  isFirstVisit,
  isTourCompleted,
  isTourDismissed,
  isTourDeferred,
  getVersionSeen,
  isWhatsNewAvailable,
  isWhatsNewDismissed,
  markTourCompleted,
  markTourDismissed,
  markTourDeferred,
  markWhatsNewDismissed,
  updateVersionSeen,
  resetAllTourState,
} from "@/services/WalkthroughService";

const KEYS = {
  completed: "reqe_tour_completed",
  dismissed: "reqe_tour_dismissed",
  deferred: "reqe_tour_deferred",
  versionSeen: "reqe_tour_version_seen",
  whatsNewDismissed: "reqe_tour_whats_new_dismissed",
};

describe("WalkthroughService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("isFirstVisit", () => {
    it("returns true when no tour keys exist in localStorage", () => {
      expect(isFirstVisit()).toBe(true);
    });

    it("returns false when tour has been completed", () => {
      localStorage.setItem(KEYS.completed, "true");
      expect(isFirstVisit()).toBe(false);
    });

    it("returns false when tour has been dismissed", () => {
      localStorage.setItem(KEYS.dismissed, "true");
      expect(isFirstVisit()).toBe(false);
    });

    it("returns false when tour has been deferred", () => {
      localStorage.setItem(KEYS.deferred, "true");
      expect(isFirstVisit()).toBe(false);
    });

    it("returns false when version has been seen", () => {
      localStorage.setItem(KEYS.versionSeen, "1");
      expect(isFirstVisit()).toBe(false);
    });
  });

  describe("isTourCompleted", () => {
    it("returns false by default", () => {
      expect(isTourCompleted()).toBe(false);
    });

    it("returns true after markTourCompleted()", () => {
      markTourCompleted();
      expect(isTourCompleted()).toBe(true);
    });
  });

  describe("isTourDismissed", () => {
    it("returns false by default", () => {
      expect(isTourDismissed()).toBe(false);
    });

    it("returns true after markTourDismissed()", () => {
      markTourDismissed();
      expect(isTourDismissed()).toBe(true);
    });
  });

  describe("isTourDeferred", () => {
    it("returns false by default", () => {
      expect(isTourDeferred()).toBe(false);
    });

    it("returns true after markTourDeferred()", () => {
      markTourDeferred();
      expect(isTourDeferred()).toBe(true);
    });
  });

  describe("markTourCompleted", () => {
    it("sets completed flag and version seen", () => {
      markTourCompleted();
      expect(localStorage.getItem(KEYS.completed)).toBe("true");
      expect(localStorage.getItem(KEYS.versionSeen)).toBe(TOUR_VERSION);
    });

    it("removes deferred flag", () => {
      localStorage.setItem(KEYS.deferred, "true");
      markTourCompleted();
      expect(localStorage.getItem(KEYS.deferred)).toBeNull();
    });
  });

  describe("markTourDismissed", () => {
    it("sets dismissed flag and version seen", () => {
      markTourDismissed();
      expect(localStorage.getItem(KEYS.dismissed)).toBe("true");
      expect(localStorage.getItem(KEYS.versionSeen)).toBe(TOUR_VERSION);
    });

    it("removes deferred flag", () => {
      localStorage.setItem(KEYS.deferred, "true");
      markTourDismissed();
      expect(localStorage.getItem(KEYS.deferred)).toBeNull();
    });
  });

  describe("markTourDeferred", () => {
    it("sets deferred flag without affecting other keys", () => {
      markTourDeferred();
      expect(localStorage.getItem(KEYS.deferred)).toBe("true");
      expect(localStorage.getItem(KEYS.completed)).toBeNull();
      expect(localStorage.getItem(KEYS.dismissed)).toBeNull();
    });
  });

  describe("isWhatsNewAvailable", () => {
    it("returns false on first visit (no version seen)", () => {
      expect(isWhatsNewAvailable()).toBe(false);
    });

    it("returns false when version matches current", () => {
      localStorage.setItem(KEYS.versionSeen, TOUR_VERSION);
      expect(isWhatsNewAvailable()).toBe(false);
    });

    it("returns true when version is older than current", () => {
      localStorage.setItem(KEYS.versionSeen, "0");
      expect(isWhatsNewAvailable()).toBe(true);
    });
  });

  describe("isWhatsNewDismissed", () => {
    it("returns false by default", () => {
      expect(isWhatsNewDismissed()).toBe(false);
    });

    it("returns true after markWhatsNewDismissed()", () => {
      markWhatsNewDismissed();
      expect(isWhatsNewDismissed()).toBe(true);
    });
  });

  describe("markWhatsNewDismissed", () => {
    it("sets whatsNewDismissed flag and updates version seen", () => {
      markWhatsNewDismissed();
      expect(localStorage.getItem(KEYS.whatsNewDismissed)).toBe("true");
      expect(localStorage.getItem(KEYS.versionSeen)).toBe(TOUR_VERSION);
    });
  });

  describe("updateVersionSeen", () => {
    it("sets version seen to TOUR_VERSION", () => {
      updateVersionSeen();
      expect(getVersionSeen()).toBe(TOUR_VERSION);
    });
  });

  describe("resetAllTourState", () => {
    it("removes all tour keys from localStorage", () => {
      Object.values(KEYS).forEach((key) => localStorage.setItem(key, "true"));
      resetAllTourState();
      Object.values(KEYS).forEach((key) => {
        expect(localStorage.getItem(key)).toBeNull();
      });
    });
  });

  it("should not store any sensitive data in localStorage", () => {
    markTourCompleted();
    markTourDeferred();
    markWhatsNewDismissed();
    const allKeys = Object.keys(localStorage);
    allKeys.forEach((key) => {
      const value = localStorage.getItem(key) ?? "";
      expect(value).not.toMatch(/password|token|secret|key|auth/i);
    });
  });
});

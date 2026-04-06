export const TOUR_VERSION = "1";

const KEYS = {
  completed: "reqe_tour_completed",
  dismissed: "reqe_tour_dismissed",
  deferred: "reqe_tour_deferred",
  versionSeen: "reqe_tour_version_seen",
  whatsNewDismissed: "reqe_tour_whats_new_dismissed",
} as const;

export function isFirstVisit(): boolean {
  return (
    !localStorage.getItem(KEYS.completed) &&
    !localStorage.getItem(KEYS.dismissed) &&
    !localStorage.getItem(KEYS.deferred) &&
    !localStorage.getItem(KEYS.versionSeen)
  );
}

export function isTourCompleted(): boolean {
  return localStorage.getItem(KEYS.completed) === "true";
}

export function isTourDismissed(): boolean {
  return localStorage.getItem(KEYS.dismissed) === "true";
}

export function isTourDeferred(): boolean {
  return localStorage.getItem(KEYS.deferred) === "true";
}

export function getVersionSeen(): string | null {
  return localStorage.getItem(KEYS.versionSeen);
}

export function isWhatsNewAvailable(): boolean {
  const seen = getVersionSeen();
  return seen !== null && seen !== TOUR_VERSION;
}

export function isWhatsNewDismissed(): boolean {
  return localStorage.getItem(KEYS.whatsNewDismissed) === "true";
}

export function markTourCompleted(): void {
  localStorage.setItem(KEYS.completed, "true");
  localStorage.setItem(KEYS.versionSeen, TOUR_VERSION);
  localStorage.removeItem(KEYS.deferred);
}

export function markTourDismissed(): void {
  localStorage.setItem(KEYS.dismissed, "true");
  localStorage.setItem(KEYS.versionSeen, TOUR_VERSION);
  localStorage.removeItem(KEYS.deferred);
}

export function markTourDeferred(): void {
  localStorage.setItem(KEYS.deferred, "true");
}

export function markWhatsNewDismissed(): void {
  localStorage.setItem(KEYS.whatsNewDismissed, "true");
  localStorage.setItem(KEYS.versionSeen, TOUR_VERSION);
}

export function updateVersionSeen(): void {
  localStorage.setItem(KEYS.versionSeen, TOUR_VERSION);
}

export function resetAllTourState(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

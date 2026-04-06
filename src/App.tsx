import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { useTimelineStore } from "@/stores/useTimelineStore";
import Timeline from "@/components/Timeline/Timeline";
import ComposerCard from "@/components/ComposerCard/ComposerCard";
import FilterPanel from "@/components/FilterPanel/FilterPanel";
import HelpPanel from "@/components/HelpPanel/HelpPanel";
import ComparisonBar from "@/components/ComparisonBar/ComparisonBar";
import CompositionDetail from "@/components/CompositionDetail/CompositionDetail";
import SearchFilterBar from "@/components/SearchFilterBar/SearchFilterBar";
import TermExplorer from "@/components/TermExplorer/TermExplorer";
import OrchestraExplorer from "@/components/OrchestraExplorer/OrchestraExplorer";
import WalkthroughOverlay from "@/components/WalkthroughOverlay/WalkthroughOverlay";
import { useWalkthrough } from "@/hooks/useWalkthrough";

type AppView = "timeline" | "terms" | "orchestra";

export default function App() {
  const { t, i18n } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [activeView, setActiveView] = useState<AppView>("timeline");
  const [overlayDismissed, setOverlayDismissed] = useState(false);
  const {
    selectedComposerIds,
    selectedCompositionId,
    selectComposer,
    selectComposition,
    selectEvent,
    clearComposerSelection,
  } = useSelectionStore();
  const { resetView } = useTimelineStore();

  const {
    startFullTour,
    startWhatsNewTour,
    shouldShowWelcome,
    shouldShowWhatsNew,
    shouldShowSubtlePrompt,
    dismissTour,
    deferTour,
    dismissWhatsNew,
  } = useWalkthrough({
    setActiveView,
    closeHelpPanel: () => setHelpOpen(false),
    selectComposer: (id) =>
      id === null ? clearComposerSelection() : selectComposer(id),
    selectComposition: (id) => selectComposition(id),
  });

  const showOverlay =
    !overlayDismissed && (shouldShowWelcome || shouldShowWhatsNew);

  const selectedComposerId = selectedComposerIds[0] || null;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Escape closes panels
      if (e.key === "Escape") {
        setFilterOpen(false);
        setHelpOpen(false);
        selectComposition(null);
        selectEvent(null);
      }
      // F key toggles filter
      if (e.key === "f" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT"
        )
          return;
        setFilterOpen((p) => !p);
      }
      // ? key toggles help
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT"
        )
          return;
        setHelpOpen((p) => !p);
      }
      // R resets view
      if (e.key === "r" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT"
        )
          return;
        resetView();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [resetView, selectComposition, selectEvent]);

  return (
    <div className="app">
      <header className="app-header" data-tour="header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div>
            <h1>{t("app.title")}</h1>
            <p>{t("app.subtitle")}</p>
          </div>
          {activeView === "terms" && (
            <div
              style={{
                borderLeft: "1px solid var(--border-subtle)",
                paddingLeft: "16px",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-lg)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase" as const,
                  margin: 0,
                }}
              >
                {t("termExplorer.title")}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  color: "var(--text-secondary)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  marginTop: "2px",
                }}
              >
                {t("termExplorer.subtitle")}
              </p>
            </div>
          )}
          {activeView === "orchestra" && (
            <div
              style={{
                borderLeft: "1px solid var(--border-subtle)",
                paddingLeft: "16px",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-lg)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase" as const,
                  margin: 0,
                }}
              >
                {t("orchestraExplorer.title")}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  color: "var(--text-secondary)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  marginTop: "2px",
                }}
              >
                {t("orchestraExplorer.subtitle", {
                  defaultValue: "Interactive Orchestral Topography",
                })}
              </p>
            </div>
          )}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            {activeView === "timeline" && <ComparisonBar />}
            {activeView !== "orchestra" && (
              <div data-tour="search-filter">
                <SearchFilterBar
                  filterOpen={filterOpen}
                  onToggleFilters={() => setFilterOpen((p) => !p)}
                />
              </div>
            )}
            <nav
              data-tour="view-tabs"
              style={{
                display: "flex",
                gap: "2px",
                background: "var(--bg-surface)",
                borderRadius: "6px",
                padding: "2px",
                border: "1px solid var(--border-default)",
              }}
            >
              {(["timeline", "terms", "orchestra"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  style={{
                    padding: "4px 12px",
                    border: "none",
                    borderRadius: "4px",
                    background:
                      activeView === view
                        ? "var(--text-accent)"
                        : "transparent",
                    color:
                      activeView === view
                        ? "var(--bg-primary)"
                        : "var(--text-secondary)",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-sm)",
                    fontWeight: activeView === view ? 600 : 400,
                    transition: "all 0.15s ease",
                  }}
                >
                  {view === "timeline"
                    ? t("app.viewTimeline", "Timeline")
                    : view === "terms"
                      ? t("app.viewTerms", "Terms")
                      : t("app.viewOrchestra", "Orchestra")}
                </button>
              ))}
            </nav>
            <select
              data-tour="language-switcher"
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              aria-label={t("app.languageSelect")}
              style={{
                padding: "4px 8px",
                border: "1px solid var(--border-default)",
                borderRadius: "6px",
                background: "var(--bg-surface)",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                cursor: "pointer",
              }}
            >
              <option value="en-GB">English</option>
              <option value="fr-FR">Français</option>
              <option value="af-ZA">Afrikaans</option>
            </select>
            <button
              data-tour="help-button"
              onClick={() => setHelpOpen((p) => !p)}
              style={{
                width: "32px",
                height: "32px",
                border: "1px solid var(--border-default)",
                borderRadius: "6px",
                background: helpOpen
                  ? "var(--bg-elevated)"
                  : "var(--bg-surface)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              aria-label={t("app.helpAriaLabel")}
              title={t("app.helpTitle")}
            >
              ?
            </button>
          </div>
        </div>
      </header>
      <main className="app-main">
        {activeView === "timeline" && <Timeline />}
        {activeView === "terms" && (
          <TermExplorer
            onNavigateToTimeline={() => setActiveView("timeline")}
          />
        )}
        {activeView === "orchestra" && (
          <OrchestraExplorer
            onNavigateToTimeline={() => setActiveView("timeline")}
          />
        )}
      </main>

      {/* Filter panel (slide-in left) — visible on timeline and terms only */}
      {filterOpen && activeView !== "orchestra" && (
        <FilterPanel onClose={() => setFilterOpen(false)} />
      )}

      {/* Composer detail panel (slide-in right) — timeline only */}
      {selectedComposerId && activeView === "timeline" && (
        <ComposerCard composerId={selectedComposerId} />
      )}

      {/* Composition detail panel (bottom-center floating card) — timeline only */}
      {selectedCompositionId && activeView === "timeline" && (
        <CompositionDetail compositionId={selectedCompositionId} />
      )}

      {/* Help panel (slide-in right) */}
      {helpOpen && (
        <HelpPanel
          onClose={() => setHelpOpen(false)}
          onStartTour={() => {
            setHelpOpen(false);
            startFullTour();
          }}
        />
      )}

      {/* Walkthrough welcome / what's-new overlay */}
      {showOverlay && (
        <WalkthroughOverlay
          mode={shouldShowWelcome ? "welcome" : "whats-new"}
          onStartFullTour={() => {
            setOverlayDismissed(true);
            startFullTour();
          }}
          onStartWhatsNew={() => {
            setOverlayDismissed(true);
            startWhatsNewTour();
          }}
          onDefer={() => {
            setOverlayDismissed(true);
            if (shouldShowWelcome) deferTour();
            else dismissWhatsNew();
          }}
          onDismiss={() => {
            setOverlayDismissed(true);
            if (shouldShowWelcome) dismissTour();
            else dismissWhatsNew();
          }}
        />
      )}

      {/* Subtle "Take a tour" prompt when tour was deferred */}
      {shouldShowSubtlePrompt && !showOverlay && (
        <button
          data-tour="tour-prompt"
          onClick={() => startFullTour()}
          aria-label={t("walkthrough.subtlePrompt")}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "8px 16px",
            border: "1px solid var(--accent-gold-dim)",
            borderRadius: "8px",
            background: "var(--bg-elevated)",
            color: "var(--text-accent)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            cursor: "pointer",
            zIndex: "var(--z-panel)",
            transition: "all var(--transition-fast)",
          }}
        >
          {t("walkthrough.subtlePrompt")}
        </button>
      )}
    </div>
  );
}

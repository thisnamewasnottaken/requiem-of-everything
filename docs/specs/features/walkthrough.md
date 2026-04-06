# Feature: Guided Walkthrough / Onboarding Tour

## Purpose

Guide new and returning users through the app's features with an interactive walkthrough tour.

## Flows

### First Visit

```
User lands on site
  │
  ├── localStorage has `reqe_tour_completed` = "true"? → Do nothing
  ├── localStorage has `reqe_tour_dismissed` = "true"? → Do nothing
  ├── localStorage has `reqe_tour_deferred` = "true"?
  │     └── Show subtle "Take the tour" button in header → User clicks → Full tour starts
  └── None of the above (true first visit)?
        └── Show Welcome Modal:
              "Welcome to Requiem of Everything!
               Would you like a quick tour of the app?"
              [Start Tour]  [Maybe Later]  [Don't ask again]
```

### What's New (returning users)

```
Returning user lands on site
  │
  ├── `reqe_tour_version_seen` matches `TOUR_VERSION`? → Do nothing
  ├── `reqe_tour_whats_new_dismissed` = "true"? → Do nothing
  └── Version mismatch detected (new features available)?
        └── Show What's New Modal:
              "✨ New features have been added!"
              [See What's New]  [Full Tour]  [Maybe Later]  [Don't ask again]
```

### Manual Access

- "Take a Tour" button in HelpPanel always launches the full tour, regardless of localStorage state.

## localStorage Schema

All keys prefixed with `reqe_tour_` to avoid collisions.

| Key                             | Type                  | Description                                     |
| ------------------------------- | --------------------- | ----------------------------------------------- |
| `reqe_tour_completed`           | `"true"` / absent     | Full tour completed at least once               |
| `reqe_tour_dismissed`           | `"true"` / absent     | User clicked "Don't ask again" on welcome modal |
| `reqe_tour_deferred`            | `"true"` / absent     | User clicked "Maybe Later" — show subtle prompt |
| `reqe_tour_version_seen`        | `string` (e.g. `"2"`) | Tour content version the user has seen          |
| `reqe_tour_whats_new_dismissed` | `"true"` / absent     | User opted out of What's New prompts            |

## Version Management

- `TOUR_VERSION` constant in `src/services/WalkthroughService.ts` — currently `"1"`.
- Bump when adding new tour steps for a feature release.
- What's New flow triggers when `reqe_tour_version_seen` doesn't match `TOUR_VERSION`.

## Dependencies

- driver.js v1.x (MIT, 0 dependencies, ~5kb gzipped)

## Tour Behaviour

- Closing the tour early (× button or Escape key) **defers** it rather than completing it — `reqe_tour_deferred` is set and the user will be re-prompted on their next visit via the subtle "Take a tour" prompt.
- Only clicking the final **Done** button on the last step marks the tour as completed (`reqe_tour_completed`).
- The same logic applies to the What's New tour: early close does not advance `reqe_tour_version_seen`, so the user will be prompted again on their next visit.

## Tour Steps (v2 — 15 steps)

| #  | Element selector                      | Title                | Description summary                                                                             |
|----|---------------------------------------|----------------------|-------------------------------------------------------------------------------------------------|
| 1  | _(none — centred)_                    | Welcome              | Brief intro: "Explore 500+ years of classical music..."                                         |
| 2  | `[data-tour="timeline-viewport"]`     | The Timeline         | Scroll to zoom, drag to pan. Composer lifespans appear as bars.                                 |
| 3  | `[data-tour="time-ruler"]`            | Time Ruler           | Year markings and era labels along the top.                                                     |
| 4  | `[data-tour="era-backdrop"]`          | Musical Eras         | Colour bands represent eras: Renaissance to Modern.                                             |
| 5  | `[data-tour="composer-bar-first"]`    | Composer Bars        | Click a bar for details. Ctrl+click to compare. `onNextClick` selects Bach (350ms delay).       |
| 6  | `[data-tour="composer-panel"]`        | Composer Profile     | The composer detail panel with biography, portrait, and compositions.                           |
| 7  | `[data-tour="composer-wiki-link"]`    | External Links       | Wikipedia and Spotify links inside the panel. `onNextClick` selects Goldberg Variations (350ms).|
| 8  | `[data-tour="composition-detail"]`   | Composition Detail   | Floating card with composition info. `onNextClick` deselects all, waits 200ms.                  |
| 9  | `[data-tour="search-filter"]`         | Search & Filter      | Search composers, toggle filters by era/nationality/genre.                                      |
| 10 | `[data-tour="view-tabs"]`             | Multiple Views       | Switch between Timeline, Terms glossary, and Orchestra Explorer. `onNextClick` → terms (400ms). |
| 11 | `[data-tour="terms-view"]`            | Musical Terms        | Browse the glossary of musical terms. `onNextClick` → orchestra (400ms).                        |
| 12 | `[data-tour="orchestra-view"]`        | Orchestra Explorer   | Explore instruments and sections interactively. `onNextClick` → timeline (300ms).               |
| 13 | `[data-tour="language-switcher"]`     | Language             | The app is available in English, French, and Afrikaans.                                         |
| 14 | `[data-tour="help-button"]`           | Help & Shortcuts     | Press ? any time for keyboard shortcuts and tips.                                               |
| 15 | _(none — centred)_                    | You're Ready!        | Closing message, mention Help panel for reference.                                              |

## Multi-view Tour

Steps 5–8 programmatically select Johann Sebastian Bach and the Goldberg Variations to demonstrate the composer profile panel and composition detail card live during the tour. The `onNextClick` handlers use `selectComposer("johann-sebastian-bach")` and `selectComposition("bach-goldberg-variations")` with short setTimeout delays (350ms, 200ms) so React has time to render the panels before driver.js advances.

Steps 10–12 switch the active view to `"terms"` and then `"orchestra"` mid-tour, then restore `"timeline"` before the language and help steps. This lets users see each view in context without having to navigate manually.

## Accessibility

- Welcome/What's New modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus management, Escape closes.
- Tour: keyboard navigation (Left/Right arrows, Escape), screen reader support via driver.js.
- All text is translatable via i18n.

## i18n

- All strings in `public/locales/{lng}/translation.json` under `walkthrough.*`.
- 3 languages: en-GB, fr-FR, af-ZA.

## Implementation

- Service: `src/services/WalkthroughService.ts` — localStorage operations, state machine.
- Hook: `src/hooks/useWalkthrough.ts` — React hook bridging driver.js to the app.
- Component: `src/components/WalkthroughOverlay/` — Welcome / What's New modal.
- CSS theme: `src/styles/walkthrough.css` — driver.js dark theme overrides.

## Test Scenarios

- First visit (no localStorage) → welcome modal appears.
- "Start Tour" → multi-step guided tour runs through all 15 steps.
- "Maybe Later" → modal disappears, subtle "Take a tour" prompt visible.
- "Don't ask again" → modal never appears on future loads.
- After tour: `reqe_tour_completed` and `reqe_tour_version_seen` set in localStorage.
- Version bump → "What's New" modal appears on next visit.
- HelpPanel "Take a Tour" button always starts full tour.
- Tour works in all 3 supported languages.

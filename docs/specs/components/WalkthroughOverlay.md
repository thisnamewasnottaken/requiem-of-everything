# Component: WalkthroughOverlay

## Purpose

Modal dialog presented to users on first visit (welcome mode) or when new features are available (what's-new mode). Offers quick entry into the guided walkthrough tour or options to defer/dismiss.

## Location

`src/components/WalkthroughOverlay/WalkthroughOverlay.tsx`

## Props

```typescript
interface WalkthroughOverlayProps {
  mode: 'welcome' | 'whats-new';
  onStartFullTour: () => void;
  onStartWhatsNew?: () => void;  // Only used in whats-new mode
  onDefer: () => void;           // "Maybe Later" — stores deferred state
  onDismiss: () => void;         // "Don't ask again" — permanently dismisses
}
```

## Modes

### Welcome Mode (`mode="welcome"`)

Shown to first-time visitors.

- Title: `walkthrough.welcome.title`
- Description: `walkthrough.welcome.description`
- Buttons (top to bottom):
  1. **Start Tour** (primary) — calls `onStartFullTour`
  2. **Maybe Later** (secondary) — calls `onDefer`
  3. **Don't ask again** (text link) — calls `onDismiss`

### What's New Mode (`mode="whats-new"`)

Shown to returning visitors when `TOUR_VERSION` has been bumped.

- Title: `walkthrough.whatsNew.title`
- Description: `walkthrough.whatsNew.description`
- Buttons (top to bottom):
  1. **See What's New** (primary) — calls `onStartWhatsNew` (when provided)
  2. **Full Tour** (secondary) — calls `onStartFullTour`
  3. **Maybe Later** (secondary) — calls `onDefer`
  4. **Don't ask again** (text link) — calls `onDismiss`

## Accessibility

- `role="dialog"` on the dialog container.
- `aria-modal="true"` on the dialog container.
- `aria-labelledby="walkthrough-title"` pointing at the `<h2>`.
- `tabIndex={-1}` on dialog; receives focus on mount via `useEffect`.
- Pressing Escape calls `onDefer` (backdrop click also calls `onDefer`).
- Clicking the backdrop (outside the dialog) calls `onDefer`.

## Styling

- Dark glassmorphism panel: `--bg-elevated` background, `--border-default` border, 16px border radius.
- Gold accent on title text (`--text-accent`).
- Animated entry: `fadeIn` on backdrop, `scaleIn` on dialog.
- `z-index: var(--z-modal)` on backdrop.
- CSS Modules: `WalkthroughOverlay.module.css`.
- All buttons (`.primaryBtn`, `.secondaryBtn`, `.textBtn`) explicitly set `text-shadow: none` to prevent light-theme bleed-through.

## Behaviour

- Rendered by `App.tsx` when `!overlayDismissed && (shouldShowWelcome || shouldShowWhatsNew)`.
- `overlayDismissed` is local React state reset on each page load; prevents re-render after any button action.
- The component is purely presentational — all state decisions are made by the parent via the hook.

## Security

- No `dangerouslySetInnerHTML` usage.
- All content via `t()` (i18n, sanitised string interpolation).

## Language Switcher

A `<select>` element is rendered above the `.actions` buttons in both modal modes (welcome and whats-new). It allows users to change the app language before starting the guided tour.

- Positioned flush-right via `justify-content: flex-end`.
- Options: English (`en-GB`), Français (`fr-FR`), Afrikaans (`af-ZA`), Español (`es-ES`).
- `value` is bound to `i18n.language`; `onChange` calls `i18n.changeLanguage(value)`.
- `aria-label` uses the existing `app.languageSelect` translation key.
- Because tour steps in `useWalkthrough.ts` are built from `useMemo([t])`, changing language here means the subsequent tour renders in the chosen language.

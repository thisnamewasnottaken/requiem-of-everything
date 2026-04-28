# CreditsPage Component Spec

## Purpose

A dedicated view that credits all contributors who have made commits to the repository. Accessible from the main navigation as a "Credits" tab.

## Props

None (stateless view). Uses `onNavigateToTimeline?: () => void` prop for any internal "back" navigation link if needed in future.

## Layout

Full-page view (replaces main content area, like TermExplorer / OrchestraExplorer).

```
┌──────────────────────────────────┐
│  Title: "Credits"                │
│  Subtitle: "The people behind…"  │
├──────────────────────────────────┤
│  Creator cards (one per         │
│  unique commit author):          │
│  ┌──────────────────────────┐   │
│  │  Avatar / Icon           │   │
│  │  Name                    │   │
│  │  Role label              │   │
│  └──────────────────────────┘   │
├──────────────────────────────────┤
│  Footer / attribution note       │
└──────────────────────────────────┘
```

## Content

### Contributors

The contributor list is a static, curated array defined directly in the component. Because this is a no-backend SPA with no server-side access to git history, contributors are maintained manually whenever a new person makes their first commit. New contributors should be added to the `CONTRIBUTORS` array in `CreditsPage.tsx` along with an appropriate role key.

Current contributors (as of initial implementation):

| Name                     | Role            |
| ------------------------ | --------------- |
| thisnamewasnottaken      | Creator         |
| copilot-swe-agent[bot]   | AI Contributor  |

### Sections

- **Header**: Page title (`credits.title`) and subtitle (`credits.subtitle`).
- **Contributors grid**: One card per contributor. Each card shows the contributor's name and a descriptive role label.
- **Footer**: A brief note acknowledging open-source tools and libraries used (`credits.footer`).

## Styling

- Matches the app's dark theme using existing CSS custom properties.
- Contributor cards are displayed in a responsive flex-wrap grid.
- Uses `--font-display` for names, `--font-body` for role labels.
- Cards use `--bg-surface` / `--bg-elevated` with `--border-subtle` borders.
- Consistent with the visual language of TermExplorer and OrchestraExplorer.

## i18n Keys (in `translation` namespace)

```
credits.title           – Page title ("Credits")
credits.subtitle        – Short descriptor
credits.roleCreator     – Role label for the project creator
credits.roleAI          – Role label for AI contributor
credits.footer          – Footer attribution line
app.viewCredits         – Nav tab label ("Credits")
```

## Accessibility

- Landmark: `<main>` wrapper with `role="region"` and `aria-label`.
- Each contributor card has a meaningful text label.
- Focus order is top-to-bottom, left-to-right through cards.

## Test Scenarios

- Renders without crashing.
- Displays at least one contributor card.
- All text goes through `t()` (no hardcoded English strings).
- Cards do not render `innerHTML` unsanitised (no XSS risk).

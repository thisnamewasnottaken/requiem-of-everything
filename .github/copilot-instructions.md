# Copilot Instructions — Requiem of Everything

## Project Overview

Interactive timeline of Western classical music (1400–1970). React 18 + TypeScript + Vite. Dark-themed, data-rich SPA — no backend. Composers, compositions, and historical events displayed on a zoomable/pannable horizontal timeline.

The default terminal is a bash terminal.

## Architecture (Critical)

- **D3 is math-only** (ADR-002): D3 computes scales/positions via `src/utils/scales.ts`. React owns all DOM rendering. Never use D3 to manipulate the DOM directly.
- **Zustand stores** (not Context/Redux): 4 stores in `src/stores/` — `useTimelineStore` (viewport), `useSelectionStore`, `useFilterStore`, `useComparisonStore`. Access via hooks directly; no Providers needed.
- **Static JSON data layer** (ADR-004): Data lives in `src/data/*.json`. Access through hooks in `src/hooks/useData.ts` which cast JSON to typed interfaces. These hooks are synchronous today but designed with the same interface shape for future async API swap.
- **AI features are additive stubs**: `src/services/AIService.ts` is a no-op stub gated by `VITE_AI_ENABLED`. Core app must always function without AI. Contract defined in `docs/api/ai-contract.md`.

## Spec-Driven Development

**The spec is always written or updated before any code is written.** This applies to every category of change — new features, bug fixes, refactors, and UI tweaks. No exceptions.

### Mandatory sequence for every change

1. **Read** the relevant spec(s) in `docs/specs/components/` or `docs/specs/features/`.
2. **Update the spec** to describe the correct intended behaviour. This is the design step — do it before touching code.
3. **Write or update the code** to match the spec.
4. **Update `CHANGELOG.md`** under `[Unreleased]`.
5. **Run the build and tests** to confirm nothing is broken.

Do not skip to step 3. If there is no spec yet for the component or feature being changed, create one before writing any code (ADR-007).

### Which spec files to touch

| Change type             | Files to update                                                           |
| ----------------------- | ------------------------------------------------------------------------- |
| New component           | Create `docs/specs/components/ComponentName.md` first                     |
| Modifying a component   | Update its spec in `docs/specs/components/`                               |
| New feature / behaviour | Update `docs/specs/features/` and `PROJECT_SPEC.md` milestones            |
| API / store change      | Update `docs/specs/features/` and `ARCHITECTURE.md` if an ADR is affected |
| Any user-visible change | Update `CHANGELOG.md`                                                     |

### Source of truth hierarchy

`PROJECT_SPEC.md` → `docs/specs/components/*.md` → `docs/specs/features/*.md` → code

If code and spec disagree, the spec wins — fix the code, not the spec (unless the spec itself is being deliberately changed, in which case update the spec first, then the code).

## Key Patterns

### Component structure

Each component lives in `src/components/ComponentName/` with:

- `ComponentName.tsx` — default export, typed props interface at top
- `ComponentName.module.css` — CSS Modules scoped styles

### Styling conventions

- Global design tokens in `src/styles/global.css` as CSS custom properties (`--bg-primary`, `--text-accent`, `--era-baroque`, etc.)
- Era colors map: `renaissance=#8B6914`, `baroque=#C4A035`, `classical=#4A90A4`, `early-romantic=#A45B8B`, `late-romantic=#7B3F8D`, `modern=#3D6B5E`
- Fonts: Playfair Display (display), Source Sans 3 (body), JetBrains Mono (code/years)
- Dark theme only. Use existing CSS variables, never hardcode colors.

### Timeline rendering layers (bottom→top)

TimeRuler → EraBackdrop → ComposerBar → CompositionMarker → EventMarker → UI Overlays. Each layer is a separate component receiving the D3 scale and viewport bounds.

### Year positioning

All x-positioning derives from `createTimeScale(startYear, endYear, width)` in `src/utils/scales.ts`. Composer rows are packed via a greedy bin-packing algorithm in `Timeline.tsx` (`layoutComposers`).

### Data entity IDs

Composer IDs are kebab-case full names (`johann-sebastian-bach`). Composition IDs are prefixed with composer shortname (`bach-mass-in-b-minor`). Event IDs are kebab-case descriptive (`french-revolution`).

## GitHub Workflow & Changelog

- **Changelog is mandatory**: every user-visible change gets an entry in `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). Update the `[Unreleased]` section in the same PR as the code change.
- **Commit messages**: imperative mood, prefixed with area — `timeline: add zoom-to-era shortcut`, `data: add Dvořák compositions`, `fix: prevent XSS in wiki summary render`.
- **Branch naming**: `feat/<short-desc>`, `fix/<short-desc>`, `docs/<short-desc>`.
- **PRs**: reference the spec file when touching a component. Keep PRs focused — one component or feature per PR.

## Commands

| Task                 | Command                                           |
| -------------------- | ------------------------------------------------- |
| Dev server           | `npm run dev` (port 5173)                         |
| Production build     | `npm run build` (runs `tsc -b` then `vite build`) |
| Type check only      | `npm run type-check`                              |
| Unit/component tests | `npm test` (Vitest, jsdom env)                    |
| E2E tests            | `npm run test:e2e` (Playwright)                   |

## Path Aliases

All imports use `@/` prefix resolved to `src/` (configured in both `tsconfig.json` and `vite.config.ts`). Example: `import { useComposers } from '@/hooks/useData'`.

## Adding Data

When adding composers/compositions/events to `src/data/*.json`, match the existing TypeScript interfaces in `src/types/index.ts` exactly. Composition `composerId` must reference an existing composer's `id`, and the composer's `compositionIds` array must include the new composition's `id`.

## Testing

### Artifact discipline

All test outputs go to ignored directories — **never commit test artifacts**:

- Vitest coverage → `coverage/`
- Playwright reports → `playwright-report/`, `test-results/`
- Ad-hoc screenshots/scripts → `test-artifacts/`

All of these are listed in `.gitignore`. If you create a test helper script (e.g. a Playwright screenshot tool), place it in `test-artifacts/`, not the project root.

### Security anti-patterns to test against

Unit tests should include negative cases that verify these are NOT happening:

- **No `innerHTML` / `dangerouslySetInnerHTML`** on user-facing or Wikipedia-sourced content without sanitization. The `WikipediaService` returns raw API data — always treat it as untrusted.
- **No `eval()`, `Function()`, or dynamic script injection** anywhere.
- **No secrets in client bundle** — `VITE_AI_API_KEY` must only be used server-side or in proxy config, never shipped to the browser.
- **External links must use `rel="noopener noreferrer"`** and `target="_blank"` together.

When writing tests, include at least one `it('should not ...')` per component that handles external data (Wikipedia summaries, AI responses).

## User Manual

The app should include an in-app help/guide accessible from the UI (e.g. a `?` button or Help panel). Spec this at `docs/specs/components/HelpPanel.md` before implementing. Content should cover keyboard shortcuts, navigation, filter usage, and comparison mode. This is discoverable documentation — not a separate site.

## External Services

- **Wikipedia**: `src/services/WikipediaService.ts` — REST API with localStorage caching (24h TTL) and in-flight request deduplication. Uses `wikipediaSlug` field from entities.
- **AI**: Stub service. When enabled, proxied via Vite to `VITE_AI_SERVICE_URL` (see `vite.config.ts` proxy config).

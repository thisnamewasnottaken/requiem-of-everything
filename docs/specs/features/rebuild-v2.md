# Feature: Rebuild v2 (static site in `public/v2/`)

## Purpose
This is the next-generation Requiem of Everything experience, built as a static, self-contained site. It is served at `/<base>/v2/` beside the current React app until it replaces it.

## Pages
- `index.html`: Home. An eye-level infinite dark floor with light columns and incense, plus three halo destinations. The sound toggle (`roe-sound` in localStorage) is shared by every page.
- `river.html`: River of Time. Composer threads, world events and countries, life cards with arcs, and composer search. Deep link: `#focus=<composerId>`.
- `hall.html`: Concert Hall. A 3D stage from the conductor's view, 5 eras plus six composers' signature pieces (via the Composer menu), composer and instrument cards, and recorded samples. Deep links: `#era=`, `#piece=`, `#composer=`, `#instrument=`.
- `terms.html`: Lexicon. A 3D term constellation with Hear-it demos. Deep link: `#term=<id>`.

## Constraints
- All paths are relative, with no runtime requests outside `v2/` except Spotify embeds.
- No secrets. Spotify is used only through public embeds, with search links as a fallback.
- Landscape is required on phones; portrait shows a rotate prompt.
- Languages: en-GB (default), af-ZA, es-ES, fr-FR, pl-PL. The language comes from `?lang=`, then the shared `i18nextLng` localStorage key, then the browser.

## Validation
`public/v2/tools/check-*.mjs` (Node) checks the Hall layout and fit, life-arc data, Spotify IDs, instrument era notes and i18n coverage.

## Comparison
See `docs/rebuild/README.md`.

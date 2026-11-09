# Feature: Rebuild v2 (static site in `public/v2/`)

## Purpose
This is the next-generation Requiem of Everything experience, built as a static, self-contained site. It is served at `/<base>/v2/` beside the current React app until it replaces it.

## Pages
- `index.html`: Home. An eye-level infinite dark floor with light columns and incense, plus three halo destinations. The sound toggle (`roe-sound` in localStorage) is shared by every page.
- `river.html`: River of Time. Composer threads, world events and countries, life cards with arcs, and composer search. Deep link: `#focus=<composerId>`.
- `hall.html`: Concert Hall. A 3D stage from the conductor's view, 5 eras plus six composers' signature pieces (via the Composer menu), composer and instrument cards, and recorded samples. Deep links: `#era=`, `#piece=`, `#composer=`, `#instrument=`.
- `terms.html`: Lexicon. A 3D term constellation with Hear-it demos. Deep link: `#term=<id>`.

## Navigation
- The top-left `.sigil` nav holds the Home mark plus links to the other pages. The current page is left out, because its title is already shown in the hero.
- At 1180px and narrower, the links collapse behind a `.sigil-burger` button (label `nav.menu`). It toggles on click and closes on Escape (which does not reach page handlers), on focus leaving the nav, or on a click outside it.
- Nav labels are translated by link `href`, not by position.
- River of Time between 641 and 1499px wide (when taller than 500px): the search field is a magnifier button that expands while focused (click or `/`), and the hero title fades out during that time. At 1180px and narrower the hero subtitle is hidden.

## Constraints
- All paths are relative, with no runtime requests outside `v2/` except Spotify embeds.
- No secrets. Spotify is used only through public embeds, with search links as a fallback.
- Landscape is required on phones; portrait shows a rotate prompt.
- Languages: en-GB (default), af-ZA, es-ES, fr-FR, pl-PL. The language comes from `?lang=`, then the shared `i18nextLng` localStorage key, then the browser. A valid `?lang=` is saved to `i18nextLng`, so it carries over to pages linked without the query.

## Sound
- `common/sound.js` (`sound`) is the single Web Audio engine. River composer data keeps the English `nationalityKey` for geography; localized `nationality` is display-only.
- Silence (Home, River, Hall; `roe-sound=off`) calls `sound.stopAll()`. Every tracked voice fades out over 80 ms and stops, including notes scheduled for later. Notes still loading are dropped, and the reverb's convolver is replaced so its tail is cut too. The audio context is not suspended, so nothing queued plays again on unmute. The Hall also cancels its pending sync and motif-light timers.

## Validation
`public/v2/tools/check-*.mjs` (Node) checks the Hall layout and fit, life-arc data, Spotify IDs, instrument era notes and i18n coverage.

## Comparison
See `docs/rebuild/README.md`.

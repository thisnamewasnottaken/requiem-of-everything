# Feature: Rebuild v2 (static site in `public/`)

## Purpose
V2 is a static HTML/CSS/JavaScript experience served at the application root (on GitHub Pages, `/requiem-of-everything/`). Vite copies `public/` into `dist/` without bundling the static files and builds the original React app at `/legacy/v1/` relative to that root. The old `/v2/` home and feature-page links redirect to the corresponding new URLs and retain their query strings and fragments.

## Pages
- `index.html`: Home. A WebGL2 scene with a dark floor, light columns, incense and three halo destinations. `#credits` opens the credits.
- `river.html`: River of Time. A Canvas 2D timeline with composer threads, world events, countries, life cards and composer search. Hash parameters: `focus`, `zoom` (e.g. `1780-1830`), `event` and `country`.
- `hall.html`: Concert Hall. A 3D stage from the conductor's view, five era layouts and six signature-piece layouts (via the Composer menu), composer and instrument cards, and recorded samples. Hash parameters: `era`, `piece`, `composer` and `instrument`.
- `terms.html`: Lexicon. A 3D term constellation with on-demand Hear-it demos. Hash parameters: `term` and `group`.

## Navigation
- On River, Hall and Lexicon, the top-left `.sigil` nav holds the Home mark plus links to the other two pages. The current page is left out, because its title is already shown in the hero. Home uses the three halos instead.
- At 1180px and narrower, the links collapse behind a `.sigil-burger` button (label `nav.menu`). It toggles on click and closes on Escape (which does not reach page handlers), on focus leaving the nav, or on a click outside it.
- Nav labels are translated by link `href`, not by position.
- River of Time between 641 and 1499px wide (when taller than 500px): the search field is a magnifier button that expands while focused (click or `/`), and the hero title fades out during that time. At 1180px and narrower the hero subtitle is hidden.

## Constraints
- Site assets and page links use relative paths. External dependencies include Google Fonts, MusyngKite soundfonts and on-demand Spotify embeds.
- No secrets. Spotify is used only through public embeds, with search links as a fallback.
- A rotate overlay covers the pages when the viewport is portrait and 820px wide or narrower.

## Data and translations
- `common/data.js` exposes `ROE_DATA`; `common/lives.js`, `instrument-extra.js`, `instrument-eras.js`, `hall-layout.js`, `terms-base.js` and `terms.js` add v2-specific content. River keeps the English `nationalityKey` for geography; localized `nationality` is display-only.
- `common/i18n.js` resolves `?lang=`, then the shared `i18nextLng` localStorage key, then browser languages, falling back to en-GB. A recognized query language is saved so it carries over to pages linked without the query.
- For af-ZA, es-ES, fr-FR and pl-PL, edit `locales-src/<lang>/*.json`, then run `node public/tools/build-locales.mjs` from the repo root to regenerate `common/locales/<lang>.js`. The build script does not generate an en-GB bundle; English runtime defaults come from the pages and shared scripts.

## Sound
- `common/sound.js` (`sound`) is the shared Web Audio engine. The Hall uses local samples when available and falls back to MusyngKite for other patches.
- Home, River and Hall share the `roe-sound` localStorage setting. Lexicon demos are started explicitly with Hear it and do not use that setting.
- Silence (Home, River, Hall; `roe-sound=off`) calls `sound.stopAll()`. Every tracked voice fades out over 80 ms and stops, including notes scheduled for later. Notes still loading are dropped, and the reverb's convolver is replaced so its tail is cut too. The audio context is not suspended, so nothing queued plays again on unmute. The Hall also cancels its pending sync and motif-light timers.

## Validation
From the repo root, use `npm ci` and `npm run dev`, then open `http://localhost:5173/` for V2 or `http://localhost:5173/legacy/v1/` for V1.

Run the offline v2 checks with Node:

```sh
for check in i18n river-nationality hall instrument-eras lives; do
  node "public/tools/check-$check.mjs" || exit 1
done
```

`node public/tools/check-spotify.mjs` additionally checks the Spotify IDs via the public oEmbed endpoint and requires network access. The v2 validators are not part of the current Pages workflow.

## Comparison
See `docs/rebuild/README.md`.

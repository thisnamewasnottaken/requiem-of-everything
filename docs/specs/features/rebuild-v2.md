# Feature: Rebuild v2 (static site in `public/`)

## Purpose
V2 is a static HTML/CSS/JavaScript experience served at the application root (on GitHub Pages, `/requiem-of-everything/`). Vite copies `public/` into `dist/` without bundling the static files and builds the original React app at `/legacy/v1/` relative to that root. The old `/v2/` home and feature-page links redirect to the corresponding new URLs and retain their query strings and fragments.

## Pages
- `index.html`: Home. A hall of light with a dark floor, light columns, incense and three halo destinations. The scene tries WebGL 2 first, then WebGL 1 if initialization fails. If neither starts, or if the active WebGL context is lost, CSS draws the light shafts, pools of light and drifting motes, without animation under `prefers-reduced-motion: reduce`. The shader resumes if the WebGL context is successfully restored. On the 10th draw, the page samples four rows of pixels and switches to CSS if every sampled pixel is near black, regardless of opacity. This includes an untouched, transparent framebuffer. It also switches if no draw has completed when the 8-second timer fires and the page is visible at that point. If neither WebGL renderer initializes at page load, or either startup check switches to CSS, a notice suggests turning on hardware acceleration or allowing WebGL in privacy add-ons. Context loss alone does not show the notice. Dismissing the notice saves that choice in `localStorage` under `roe-gl-notice`. `#credits` opens the credits.
- `river.html`: Variations Through Time. A Canvas 2D timeline with composer threads, world events, countries, life cards and composer search. The home destination, page/browser title, cross-page navigation and Hall life links use this name (translated in all five locales). The existing URL and `river.*` translation keys remain stable. Hash parameters: `focus`, `zoom` (e.g. `1780-1830`), `event` and `country`.
- `hall.html`: Concert Hall. A 3D stage from the conductor's view, five era layouts and six signature-piece layouts (via the Composer menu), composer and instrument cards, and recorded samples. Hash parameters: `era`, `piece`, `composer` and `instrument`.
- `terms.html`: Lexicon. A 3D term constellation with on-demand Hear-it demos. Hash parameters: `term` and `group`.

## Navigation
- Home text is not selectable before or after entering the hall, including in the credits. Links and controls remain interactive. Text selection on other pages is unchanged.
- On River, Hall and Lexicon, the top-left `.sigil` nav holds the Home mark plus links to the other two pages. The current page is left out, because its title is already shown in the hero. Home uses the three halos instead.
- At 1180px and narrower, the links collapse behind a `.sigil-burger` button (label `nav.menu`). It toggles on click and closes on Escape (which does not reach page handlers), on focus leaving the nav, or on a click outside it.
- Nav labels are translated by link `href`, not by position.
- Variations Through Time between 641 and 1499px wide (when taller than 500px): the search field is a magnifier button that expands while focused (click or `/`), and the hero title fades out during that time. At 1180px and narrower the hero subtitle is hidden. The longer translated title fits without overlapping the page controls.

## Composer names
- In the unfiltered timeline, composer names use 14px medium-weight Cormorant Garamond with brighter era-tinted lettering and a local dark text halo. Hovered or focused names use 16px semibold. Keep the glowing threads, particles and warm light-led palette; do not add label boxes or opaque panels.
- Overview labels must not overlap. Prioritize the hovered/focused composer, search matches and documented lives, then place other names where measured text fits. In dense areas, omit colliding names rather than shrink them: all threads remain visible and selectable, and zooming, hovering a thread or searching reveals its name. Keep names inside the canvas and clear of country captions.
- Composer name hit areas follow the measured text width and include padding, so the larger names remain directly clickable/tappable. Name hits take priority over nearby threads, and the hovered/focused name paints last so it remains legible among neighbours. Search, touch panning, life cards and the `/`, arrow, Enter and Escape keyboard paths remain available.
- A tap hit-tests its own release position without requiring a preceding hover. Dismissing a searched life with Escape also removes its `focus` hash parameter, so reloading does not reopen a closed card.
- At 500px high and shorter, an open life card sits above the search/sound controls so they cannot obscure the composer's name. Move the language switcher to the top edge while the card is open, clear of its close hint. The card remains scrollable.
- Hall cards reserve the measured height of the wrapping bottom dock, including at 568×320, so translated follow-life links remain tappable above it. Long action labels wrap inside the card.

## Home votives
- Clicking or tapping the hall background lights a votive, both before and after entering. Only primary-button presses count, and presses on buttons, halos, cards or the credits do not.
- Before entering, a **Light a votive** button (`home.votive.light`) below the Enter buttons lights one at the horizontal centre, a quarter of the way down. It is keyboard-reachable after Enter in silence, has a visible focus ring and a 44px minimum height.
- Home keeps the 16 most recent votives. With sound on, each one plays a choir and bell note from the current chord, higher when placed higher and panned by its horizontal position. The CSS fallback hall draws no votives, and no votive is lit while the portrait rotate overlay is showing.

## Lexicon connections
- The selected term's direct connections can be hovered, clicked, long-pressed, or keyboard-focused to reveal a translated **Follow** button. Following opens the connected term; a double-click on the line skips the button. **Back** returns to the term from which the link was followed.
- Direct neighbors draw closer to the focused term without losing their perspective scale or depth order. Deselecting restores the layout. Reduced motion disables the camera and pull-in transitions.

## River bottom band
- Event diamonds sit below the country lanes, with era captions beneath them. Captions stay near each visible era's midpoint, with at least 14 CSS px between measured text widths. Eras containing the centre of the view are larger and brighter. If space runs out, captions shrink first, then the narrowest non-current eras are omitted as needed.
- The zoom range sits alongside the minimap; the wrapping event key and interaction hint each have a separate row below it. At 500px high and shorter, the minimap is shallower and the hint is hidden to leave more room for the lanes. The canvas and open life panel reserve space based on the measured footer height.
- On short screens, country captions fit inside their lanes so the hover and pin target covers the full caption without overlapping its neighbours.
- On short landscape screens, the life panel lets its chart scroll instead of squeezing the plot between its annotations and event strip.

## Constraints
- Site assets and page links use relative paths. External dependencies include Google Fonts, MusyngKite soundfonts and on-demand Spotify embeds.
- No secrets. Spotify is used only through public embeds, with search links as a fallback.
- A rotate overlay covers the pages when the viewport is portrait and 820px wide or narrower.
- In Firefox (detected by `'mozInnerScreenX' in window`), `common/canvas.js` (`ROE_CANVAS`) makes Home, River, Hall and Lexicon request `powerPreference: 'low-power'` for WebGL and `willReadFrequently: true` for 2D canvases. On hybrid-GPU laptops, Firefox can otherwise draw a canvas on one GPU and composite it on the other, which shows black. 2D drawing in Firefox therefore runs on the CPU. Other browsers get empty options.

## Data and translations
- `common/data.js` exposes `ROE_DATA`; `common/lives.js`, `instrument-extra.js`, `instrument-eras.js`, `hall-layout.js`, `terms-base.js` and `terms.js` add v2-specific content. River keeps the English `nationalityKey` for geography; localized `nationality` is display-only.
- `common/i18n.js` resolves `?lang=`, then the shared `i18nextLng` localStorage key, then browser languages, falling back to en-GB. A recognized query language is saved so it carries over to pages linked without the query.
- For af-ZA, es-ES, fr-FR and pl-PL, edit `locales-src/<lang>/*.json`, then run `node public/tools/build-locales.mjs` from the repo root to regenerate `common/locales/<lang>.js`. The build script does not generate an en-GB bundle; English runtime defaults come from the pages and shared scripts.

## Sound
- `common/sound.js` (`sound`) is the shared Web Audio engine. The Hall uses local samples when available and falls back to MusyngKite for other patches.
- Home, River and Hall share the `roe-sound` localStorage setting. Lexicon demos are started explicitly with Hear it and do not use that setting. Switching terms or closing the term card stops active demo playback via `sound.stopAll()` and clears pending pulse timers.
- Silence (Home, River, Hall; `roe-sound=off`) calls `sound.stopAll()`. Every tracked voice fades out over 80 ms and stops, including notes scheduled for later. Notes still loading are dropped, and the reverb's convolver is replaced so its tail is cut too. The audio context is not suspended, so nothing queued plays again on unmute. The Hall also cancels its pending sync and motif-light timers.

## Validation
From the repo root, use `npm ci` and `npm run dev`, then open `http://localhost:5173/` for V2 or `http://localhost:5173/legacy/v1/` for V1. For V2 UI changes, also complete the [UI acceptance checklist](../../../CONTRIBUTING.md#ui-acceptance-checklist) and record the results in the PR.

Run the offline v2 checks with Node:

```sh
for check in i18n river-nationality hall instrument-eras lives; do
  node "public/tools/check-$check.mjs" || exit 1
done
```

`node public/tools/check-spotify.mjs` additionally checks the Spotify IDs via the public oEmbed endpoint and requires network access. The v2 validators are not part of the current Pages workflow.

## Comparison
See `docs/rebuild/README.md`.

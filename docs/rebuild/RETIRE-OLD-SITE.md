# Guide: retire the old site and make v2 the only site

> Proposal only. PR #50 added v2 beside the React app; it did not move v2 to the root. The steps below would change public URLs and deployment and should not be treated as current setup instructions. See [Architecture](../../ARCHITECTURE.md) for what ships today.

## Current state (verify first)
- **Old site:** a React 19 + TypeScript + Vite app. Its code is `index.html`, `src/` (components, hooks, stores, i18n, `src/data/*.json`), `src/__tests__/` and `public/locales/<lang>/*.json` (i18next). It also uses `public/favicon.svg`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `.githooks/pre-commit` and `.github/skills/i18n-completeness`. Its docs are `ARCHITECTURE.md`, `PROJECT_SPEC.md`, `DATA_SCHEMA.md`, `docs/specs/components/*`, the old feature specs in `docs/specs/features/*` and `.github/copilot-instructions.md`.
- **New site (v2):** static HTML/JS in `public/v2/`, with relative internal links and assets. See the [v2 spec](../specs/features/rebuild-v2.md) for pages, locale generation and validators. V2 does not read `src/` or `public/locales/`; it shares the `i18nextLng` localStorage preference with the React site.
- **Deploy:** [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) runs on push to `main` or by manual dispatch: `npm ci`, `npm run type-check`, `npm test -- --run`, then `npm run build` with the configured `VITE_BASE_PATH` (default `/`). It publishes `dist/` to GitHub Pages. Vite copies `public/v2/` into `dist/v2/`.
- **Data drift:** The sites load separate datasets. Compare `public/v2/common/data.js` with `src/data/*.json` before a migration so neither set's corrections are lost. The v2 [fact-check log](../../public/v2/tools/factcheck-log.md) records its life-arc research.

## Decisions to confirm with the owner before coding
1. **URL layout:** recommended is to move v2 to the site root (`/requiem-of-everything/`), so `index.html` is the v2 Home and `/v2/*` redirects to the root.
2. **Old deep links:** decide whether to map old app URLs to v2 equivalents (composer, era, terms) or just redirect them to Home.
3. **Old code:** delete it outright (recommended; git history keeps it) or archive it on a tag such as `old-site-final`. Create that tag on the current `main` before you delete anything.
4. **Build tooling:** keep Vite as a static copier, or drop the Node build entirely and deploy the folder as is (recommended: simpler and no dependencies).

## Steps (recommended path)
1. **Tag:** `git tag old-site-final origin/main && git push origin old-site-final`.
2. **Move v2 to the root:** Move the contents of `public/v2/` into a static deployment folder such as `site/`. The runtime locale loader resolves `locales/` relative to `common/i18n.js`. Update repo-root paths in validators and docs where needed.
3. **Redirects:** add `site/v2/index.html`, `river.html`, `hall.html` and `terms.html` as tiny redirect pages. Each uses `<meta http-equiv="refresh">` plus `location.replace('../' + page + location.search + location.hash)`, so shared links with `#composer=…`, `#era=…`, `#piece=…` and `?lang=` keep working. Add a `404.html` that redirects to Home, for old app routes.
4. **Delete the old app:** remove `src/`, the root `index.html`, `public/locales/`, `public/favicon.svg` (v2 uses `icon.svg`), `vite.config.ts`, `vitest.config.ts`, `tsconfig*.json`, `tsconfig.tsbuildinfo`, `.env.example` (check it has nothing v2 needs), `.githooks/pre-commit` and `.github/skills/i18n-completeness` (it checks only `public/locales`). Also remove `ARCHITECTURE.md`, `PROJECT_SPEC.md`, `DATA_SCHEMA.md`, `docs/specs/components/` and the old-only feature specs (`timeline-navigation.md`, `walkthrough.md`, `wikipedia-integration.md`, and `i18n.md` once it's rewritten for v2). Keep `docs/rebuild/` and `docs/pr/`.
5. **package.json:** remove the React, D3, i18next, zustand, motion and driver.js dependencies and the type and test packages. Replace the scripts with the v2 checks: `check` runs `node site/tools/check-i18n.mjs && node site/tools/check-river-nationality.mjs && node site/tools/check-hall.mjs && node site/tools/check-instrument-eras.mjs && node site/tools/check-lives.mjs`, and `build:locales` runs `node site/tools/build-locales.mjs`. Keep `package.json` only if those tools need it; they use only Node built-ins. Regenerate `package-lock.json` and delete `.github/dependabot.yml`'s npm entry if nothing remains. Commit `.npmrc` changes with the rest.
6. **Deploy workflow:** in `deploy.yml`, keep the triggers and Pages permissions, set up Node 20, run `npm run check` (or the `node` commands directly), then `actions/upload-pages-artifact` with `path: site`. Drop `VITE_BASE_PATH`, because v2 uses relative paths.
7. **Shared language key:** keep `i18nextLng`, so returning visitors keep their language.
8. **Docs:** write a short new `README` or architecture doc for the static site covering pages, `common/`, locales workflow, checks and samples credits. Rewrite `.github/copilot-instructions.md` for v2 rules: five locales, `ROE_HTML.esc` plus `Object.hasOwn`, no secrets, relative paths. Add a CHANGELOG entry.
9. **Verify:**
   - Run all checks.
   - Serve the site root locally (for example, `python3 -m http.server --directory site`).
   - Check every page in all 5 locales with zero console errors, plus every redirect from `/v2/*.html` with its hash and query.
   - Check `404.html`, the mobile portrait rotate prompt, Spotify embeds and Hall audio.
   - After the CI deploy (or a deploy from a test branch, via `workflow_dispatch` on the branch), load https://thisnamewasnottaken.github.io/requiem-of-everything/ and `/v2/hall.html#composer=gustav-mahler`.
10. **Size:** Check the Pages artifact size in the workflow log; the Hall audio samples are under `samples/`.

## Rollback
Revert the merge commit on `main`, or redeploy the `old-site-final` tag via `workflow_dispatch`.

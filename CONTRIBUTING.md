# Contributing to Requiem of Everything

Follow the [README](README.md#run-locally) to get both experiences running. In your pull request, say whether the change affects the React app at `/`, the static rebuild at `/v2/`, or both.

## Workflow

1. Start from `main` on a focused branch: `feat/<short-desc>`, `fix/<short-desc>`, or `docs/<short-desc>`. These are the conventions in the [repository's contributor instructions](.github/copilot-instructions.md#github-workflow--changelog).
2. Before changing code, read and update the relevant [component](docs/specs/components/) or [feature](docs/specs/features/) spec. For new features, consult the [project spec](PROJECT_SPEC.md); for changes to architectural decisions, consult the [architecture notes](ARCHITECTURE.md). The [v2 spec](docs/specs/features/rebuild-v2.md) covers the static rebuild.
3. Add or update tests for behavior changes. For user-visible changes, add a [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) entry under `[Unreleased]` in [CHANGELOG.md](CHANGELOG.md).
4. Use imperative, area-prefixed commit messages, for example `timeline: add zoom-to-era shortcut`. Open a focused PR against `main`, link the relevant spec and any issue, and summarize what changed and how you tested it.

## Verify before opening a PR

From the repository root, run:

```sh
npm run type-check
npm run test:run
npm run build
bash .githooks/pre-commit
```

The [GitHub Pages workflow](.github/workflows/deploy.yml) runs type checking, the Vitest suite, and the build on pushes to `main`. Keep unit and component tests under `src/` as `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx`. For UI changes, also try the affected route in the local dev server.

The pre-commit script runs `npm run i18n:strict` first. By default it runs related Vitest tests when staged source or test-relevant config files match its filters. With `CI=true` or `PRECOMMIT_TEST_SCOPE=full`, it runs the full unit suite. The `hooks:install` npm script sets Git's hook path but does not make files executable. Since the checked-in hook is not executable, run it explicitly with Bash as shown above; do not assume Git ran it automatically.

## Adding data or translations

### React app (`/`)

- Add or update records in [`src/data/`](src/data/) using the [data schema](DATA_SCHEMA.md) and [TypeScript types](src/types/index.ts). Follow existing ID conventions. For a new composition, set its `composerId` and add its ID to that composer's `compositionIds`.
- Use i18next keys for UI text (the `translation.json` namespace). Put translated data fields in the corresponding namespace JSON in [`public/locales/`](public/locales/), using the entity ID as the top-level key.
- Provide translations for new user-facing content in `en-GB`, `af-ZA`, `es-ES`, `fr-FR`, and `pl-PL`. The strict hook compares Afrikaans and French keys against British English and rejects placeholder markers in those target files; review Spanish and Polish separately.
- When introducing a locale, register it in [the i18next configuration](src/i18n/index.ts), update the language pickers in [the app header](src/App.tsx) and [walkthrough](src/components/WalkthroughOverlay/WalkthroughOverlay.tsx), and update [the test i18n setup](src/__tests__/setup.ts).

### Static rebuild (`/v2/`)

The rebuild has separate shared data in [`public/v2/common/`](public/v2/common/) and locale source JSON in [`public/v2/locales-src/`](public/v2/locales-src/). Edit the source JSON rather than generated locale bundles. Run these after translation changes and include any updated bundles from `public/v2/common/locales/` in the PR:

```sh
node public/v2/tools/build-locales.mjs
node public/v2/tools/check-i18n.mjs
```

For a new v2 locale, update the locale lists in the [runtime](public/v2/common/i18n.js), [bundle builder](public/v2/tools/build-locales.mjs), and [i18n validator](public/v2/tools/check-i18n.mjs). See the [rebuild spec](docs/specs/features/rebuild-v2.md) for how the pages, data, and locale bundles fit together.

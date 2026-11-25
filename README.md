# Requiem of Everything

Requiem of Everything is an interactive guide to Western classical music. Explore composers and their works in historical context, see where instruments sit in an orchestra, and look up musical terms.

The repository contains two experiences, served side by side:

| Local route | What to explore |
| --- | --- |
| [`/`](http://localhost:5173/) | V2: follow composers' lives in the River of Time, listen to instrument samples in the Concert Hall, and hear examples of musical terms in the Lexicon. |
| [`/legacy/v1/`](http://localhost:5173/legacy/v1/) | The original React app: pan and zoom the Timeline, search or compare composers, browse the Terms glossary, and explore orchestral instruments. |

Both offer English (UK), Afrikaans, Spanish, French, and Polish. The React app uses TypeScript, React, Vite, Zustand for state, D3 for scales and positioning, and i18next for translations. The rebuild uses plain HTML, CSS, and JavaScript with Web Audio for sound. The core site does not require a backend or API keys.

## Run locally

Use Git, npm, and a Node.js version supported by Vite: **20.19+ on the 20.x line, or 22.12+**. From the root of your local clone:

```sh
npm ci
npm run dev
```

Open [localhost:5173](http://localhost:5173/) for V2 or [localhost:5173/legacy/v1/](http://localhost:5173/legacy/v1/) for the original React app. If port 5173 is occupied, use the port Vite prints. Stop the server with **Ctrl+C**.

## Build and check

| Command | What it does |
| --- | --- |
| `npm run build` | Compiles TypeScript and builds the site into `dist/`, including the static rebuild. |
| `npm run type-check` | Checks TypeScript without producing build output. |
| `npm run test:run` | Runs the Vitest unit and component tests once. |
| `npm run test:e2e` | Builds the site and checks both routes in Chromium. Install the browser first with `npx playwright install chromium`. |

`npm run lint` currently fails because there is no ESLint flat config.

## Repository map

| Path | Contents |
| --- | --- |
| [`src/`](src/) | React app, including components, hooks, stores, and tests. |
| [`src/data/`](src/data/) and [`public/locales/`](public/locales/) | React app data and translation namespaces. |
| [`public/`](public/) | Static V2 pages, shared code, audio samples, locale sources, and build and validation helpers. |
| [`docs/`](docs/) | Feature and component specs, the rebuild comparison, and past PR notes. |

Start with the [contribution guide](CONTRIBUTING.md), [project spec](PROJECT_SPEC.md), [architecture notes](ARCHITECTURE.md), [data schema](DATA_SCHEMA.md), or the [rebuild comparison](docs/rebuild/README.md). See [CHANGELOG.md](CHANGELOG.md) for changes and [LICENSE](LICENSE) for the repository license. The v2 home page credits separately licensed samples and other assets.

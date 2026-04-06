---
name: i18n-completeness
description: "Audit and repair i18n completeness for af-ZA and fr-FR. Use when checking missing translation keys, filling missing locale entries from en-GB fallback text, or validating translation namespace parity."
argument-hint: "Optional: check-only or apply updates; optional language/namespace filters"
user-invocable: true
---

# i18n Completeness

Ensures translation coverage is complete for this repo's supported non-default locales:

- `af-ZA`
- `fr-FR`

It checks the namespaces used by the app:

- `translation`
- `composers`
- `compositions`
- `events`
- `eras`
- `terms`
- `instruments`

## When to Use

- New keys were added to `en-GB` and you need to confirm `af-ZA` and `fr-FR` are still complete.
- A feature PR touched data or UI strings and you want a quick translation parity check.
- You want to auto-add missing keys in `af-ZA` and `fr-FR` so the app remains complete.

## Workflow

1. Run a check pass:
   - `node ./.github/skills/i18n-completeness/scripts/check-and-fill.mjs --check`

- For commit-grade validation, run strict mode:
  - `node ./.github/skills/i18n-completeness/scripts/check-and-fill.mjs --check --strict`

2. Review missing paths in command output.
3. If you want automatic fixes, run apply mode:
   - `node ./.github/skills/i18n-completeness/scripts/check-and-fill.mjs --apply`
4. Re-run check mode to confirm zero missing keys.

## Optional Filters

- Limit by language:
  - `--lang af-ZA`
  - `--lang fr-FR`
- Limit by namespace:
  - `--ns composers`
  - `--ns events`

Examples:

- `node ./.github/skills/i18n-completeness/scripts/check-and-fill.mjs --check --lang af-ZA --ns composers`
- `node ./.github/skills/i18n-completeness/scripts/check-and-fill.mjs --apply --ns translation`

## What Apply Mode Does

- Reads baseline keys from `public/locales/en-GB/<namespace>.json`.
- Adds only missing keys into target locale files.
- Uses placeholder fallback text for inserted string values, prefixed with `__MISSING_TRANSLATION__:`.
- Preserves existing translated keys and existing values.

## Strict Mode

- `--strict` fails when placeholder values prefixed with `__MISSING_TRANSLATION__:` exist.
- This is intended for pre-commit quality gates, ensuring placeholder text is replaced before merge.

## Completion Criteria

- Check mode reports no missing keys for selected language(s)/namespace(s).
- Strict mode reports no placeholder translation values.
- Locale JSON files parse successfully after update.
- The app can still resolve all configured namespaces for `af-ZA` and `fr-FR`.

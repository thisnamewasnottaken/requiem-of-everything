#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const localesRoot = path.join(repoRoot, "public", "locales");
const baseLang = "en-GB";
const supportedTargets = ["af-ZA", "fr-FR"];
const fallbackMarker = "__MISSING_TRANSLATION__:";
const defaultNamespaces = [
  "translation",
  "composers",
  "compositions",
  "events",
  "eras",
  "terms",
  "instruments",
];

function parseArgs(argv) {
  const parsed = {
    mode: "check",
    lang: undefined,
    ns: undefined,
    strict: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--apply") {
      parsed.mode = "apply";
      continue;
    }
    if (arg === "--check") {
      parsed.mode = "check";
      continue;
    }
    if (arg === "--lang") {
      parsed.lang = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--ns") {
      parsed.ns = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--strict") {
      parsed.strict = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return parsed;
}

function printHelp() {
  console.log(
    "Usage: node check-and-fill.mjs [--check|--apply] [--strict] [--lang <af-ZA|fr-FR>] [--ns <namespace>]",
  );
  console.log(
    "Defaults: --check across all target languages and all namespaces",
  );
  console.log(
    `Strict mode fails when placeholder values beginning with '${fallbackMarker}' exist.`,
  );
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  const output = `${JSON.stringify(data, null, 2)}\n`;
  fs.writeFileSync(filePath, output, "utf-8");
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (Array.isArray(value)) {
    return value.map((item) => clone(item));
  }
  if (isObject(value)) {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = clone(value[key]);
    }
    return out;
  }
  return value;
}

function markFallbackString(value, options) {
  if (!options.markFallbackStrings || typeof value !== "string") {
    return value;
  }
  return `${fallbackMarker} ${value}`;
}

function cloneForLocale(value, options) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneForLocale(item, options));
  }
  if (isObject(value)) {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = cloneForLocale(value[key], options);
    }
    return out;
  }
  return markFallbackString(value, options);
}

function fillMissing(baseNode, targetNode, currentPath, missingPaths, options) {
  if (Array.isArray(baseNode)) {
    if (!Array.isArray(targetNode)) {
      missingPaths.push(currentPath || "(root)");
      return cloneForLocale(baseNode, options);
    }

    const maxLength = baseNode.length;
    const output = targetNode.slice();
    for (let i = 0; i < maxLength; i += 1) {
      const childPath = `${currentPath}[${i}]`;
      if (!(i in output)) {
        missingPaths.push(childPath);
        output[i] = cloneForLocale(baseNode[i], options);
      } else {
        output[i] = fillMissing(
          baseNode[i],
          output[i],
          childPath,
          missingPaths,
          options,
        );
      }
    }
    return output;
  }

  if (isObject(baseNode)) {
    const output = isObject(targetNode) ? { ...targetNode } : {};

    if (!isObject(targetNode) && currentPath) {
      missingPaths.push(currentPath);
    }

    for (const key of Object.keys(baseNode)) {
      const childPath = currentPath ? `${currentPath}.${key}` : key;

      if (!(key in output)) {
        missingPaths.push(childPath);
        output[key] = cloneForLocale(baseNode[key], options);
      } else {
        output[key] = fillMissing(
          baseNode[key],
          output[key],
          childPath,
          missingPaths,
          options,
        );
      }
    }

    return output;
  }

  if (typeof targetNode === "undefined") {
    missingPaths.push(currentPath || "(root)");
    return cloneForLocale(baseNode, options);
  }

  return targetNode;
}

function collectFallbackMarkers(node, currentPath, output) {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i += 1) {
      const childPath = `${currentPath}[${i}]`;
      collectFallbackMarkers(node[i], childPath, output);
    }
    return;
  }

  if (isObject(node)) {
    for (const key of Object.keys(node)) {
      const childPath = currentPath ? `${currentPath}.${key}` : key;
      collectFallbackMarkers(node[key], childPath, output);
    }
    return;
  }

  if (typeof node === "string" && node.startsWith(fallbackMarker)) {
    output.push(currentPath || "(root)");
  }
}

function resolveTargets(langArg) {
  if (!langArg) {
    return supportedTargets;
  }
  if (!supportedTargets.includes(langArg)) {
    throw new Error(`Unsupported --lang value: ${langArg}`);
  }
  return [langArg];
}

function resolveNamespaces(nsArg) {
  if (!nsArg) {
    return defaultNamespaces;
  }
  if (!defaultNamespaces.includes(nsArg)) {
    throw new Error(`Unsupported --ns value: ${nsArg}`);
  }
  return [nsArg];
}

function localePath(lang, ns) {
  return path.join(localesRoot, lang, `${ns}.json`);
}

function fileMustExist(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Missing locale file: ${path.relative(repoRoot, filePath)}`,
    );
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const targets = resolveTargets(args.lang);
  const namespaces = resolveNamespaces(args.ns);

  let totalMissing = 0;
  let totalFallbackMarkers = 0;

  for (const ns of namespaces) {
    const basePath = localePath(baseLang, ns);
    fileMustExist(basePath);
    const baseJson = readJson(basePath);

    for (const lang of targets) {
      const targetPath = localePath(lang, ns);
      fileMustExist(targetPath);

      const targetJson = readJson(targetPath);
      const missingPaths = [];
      const fillOptions = {
        markFallbackStrings: args.mode === "apply",
      };
      const merged = fillMissing(
        baseJson,
        targetJson,
        "",
        missingPaths,
        fillOptions,
      );
      totalMissing += missingPaths.length;

      if (missingPaths.length > 0) {
        console.log(
          `[MISSING] ${lang}/${ns}.json -> ${missingPaths.length} key(s)`,
        );
        for (const p of missingPaths) {
          console.log(`  - ${p}`);
        }

        if (args.mode === "apply") {
          writeJson(targetPath, merged);
          console.log(
            `  Applied updates to ${path.relative(repoRoot, targetPath)}`,
          );
        }
      } else {
        console.log(`[OK] ${lang}/${ns}.json`);
      }

      if (args.strict) {
        const markerPaths = [];
        const strictInput = args.mode === "apply" ? merged : targetJson;
        collectFallbackMarkers(strictInput, "", markerPaths);

        if (markerPaths.length > 0) {
          totalFallbackMarkers += markerPaths.length;
          console.log(
            `[STRICT] ${lang}/${ns}.json -> ${markerPaths.length} placeholder key(s)`,
          );
          for (const markerPath of markerPaths) {
            console.log(`  - ${markerPath}`);
          }
        }
      }
    }
  }

  if (totalMissing === 0 && totalFallbackMarkers === 0) {
    console.log("All checked locale files are complete.");
    process.exit(0);
  }

  if (args.strict && totalFallbackMarkers > 0) {
    console.error(
      `Found ${totalFallbackMarkers} placeholder translation value(s). Replace '${fallbackMarker} ...' with real translations before commit.`,
    );
    process.exit(1);
  }

  if (args.mode === "check") {
    console.error(
      `Found ${totalMissing} missing key(s). Run with --apply to fill from en-GB.`,
    );
    process.exit(1);
  }

  console.log(`Filled ${totalMissing} missing key(s) from en-GB.`);
  process.exit(0);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}

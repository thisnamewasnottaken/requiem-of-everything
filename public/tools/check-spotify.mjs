import fs from "node:fs";
import vm from "node:vm";

function loadWindowScript(path) {
  const context = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path, "utf8"), context, { filename: path });
  return context.window;
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchingTitle(title, target) {
  const normalizedTitle = normalize(title);
  const surname = normalize(target.composer).split(/\s+/).at(-1);
  if (surname && normalizedTitle.includes(surname)) return true;

  const ignored = new Set([
    "a", "an", "and", "in", "of", "the", "to", "for", "from", "with",
    "no", "op", "opus", "k", "rv", "bwv", "twv", "l", "m", "major",
    "minor", "flat", "sharp", "act", "part", "movement",
  ]);
  const words = normalize(target.title).split(/\s+/).filter(word =>
    word.length > 2 && !ignored.has(word)
  );
  const matched = words.filter(word => normalizedTitle.includes(word));
  return words.length > 0 && matched.length >= Math.min(2, words.length);
}

const data = loadWindowScript("common/data.js").ROE_DATA;
const extra = loadWindowScript("common/instrument-extra.js").ROE_INSTR_EXTRA;
const mappings = loadWindowScript("common/spotify-ids.js").ROE_SPOTIFY;
const composers = new Map(data.composers.map(composer => [composer.id, composer]));
const targets = new Map();

for (const work of data.compositions) {
  targets.set(work.id, {
    title: work.title,
    composer: composers.get(work.composerId)?.shortName ?? "",
  });
}

for (const [instrumentId, item] of Object.entries(extra)) {
  targets.set(`instr:${instrumentId}`, {
    title: item.showcase.title,
    composer: item.showcase.composerName,
  });
}

const failures = [];
const entries = Object.entries(mappings);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

if (entries.length !== targets.size) {
  failures.push(`Expected ${targets.size} mappings, found ${entries.length}`);
}

async function checkEntry(key, entry) {
  const target = targets.get(key);
  if (!target) {
    failures.push(`${key}: not a known composition or instrument showcase`);
    return;
  }
  if (!["album", "track"].includes(entry.type) || !/^[A-Za-z0-9]+$/.test(entry.id)) {
    failures.push(`${key}: invalid Spotify type or ID`);
    return;
  }
  if (!matchingTitle(entry.title, target)) {
    failures.push(`${key}: stored oEmbed title does not match target (${entry.title})`);
    return;
  }

  const url = `https://open.spotify.com/${entry.type}/${entry.id}`;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const response = await fetch(
        `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(15_000) },
      );
      if (response.status === 429) {
        if (attempt < 5) {
          const retryAfter = Number(response.headers.get("retry-after"));
          const delay = Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : Math.min(120_000, 15_000 * 2 ** attempt);
          console.warn(`${key}: HTTP 429; retrying in ${Math.ceil(delay / 1000)}s`);
          await pause(delay);
          continue;
        }
        failures.push(`${key}: oEmbed returned HTTP ${response.status}`);
        return;
      }
      if (response.status >= 500) {
        if (attempt < 5) {
          await pause(Math.min(30_000, 2_000 * (attempt + 1)));
          continue;
        }
        failures.push(`${key}: oEmbed returned HTTP ${response.status}`);
        return;
      }
      if (!response.ok) {
        failures.push(`${key}: oEmbed returned HTTP ${response.status}`);
        return;
      }
      const result = await response.json();
      if (normalize(result.title) !== normalize(entry.title)) {
        failures.push(`${key}: oEmbed title changed from "${entry.title}" to "${result.title}"`);
      } else if (!matchingTitle(result.title, target)) {
        failures.push(`${key}: oEmbed title does not match target (${result.title})`);
      }
      return;
    } catch (error) {
      if (attempt === 5) {
        failures.push(`${key}: oEmbed request failed (${error.message})`);
        return;
      }
      await pause(Math.min(30_000, 2_000 * (attempt + 1)));
    }
  }
}

let nextIndex = 0;
const workers = Array.from({ length: 1 }, async () => {
  while (nextIndex < entries.length) {
    const [key, entry] = entries[nextIndex++];
    await checkEntry(key, entry);
    if (nextIndex % 25 === 0 || nextIndex === entries.length) {
      console.log(`Checked ${nextIndex}/${entries.length}`);
    }
    await pause(750);
  }
});
await Promise.all(workers);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`PASS: ${entries.length} Spotify IDs returned matching oEmbed titles.`);
}

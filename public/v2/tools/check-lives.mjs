import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({window: {}});

for (const file of ['common/data.js', 'common/lives.js', 'common/instrument-extra.js']) {
  const source = readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(source, context, {filename: file});
}

const {composers, events, instruments} = context.window.ROE_DATA;
const lives = context.window.ROE_LIVES;
const instrumentExtras = context.window.ROE_INSTR_EXTRA;
const composerById = new Map(composers.map(composer => [composer.id, composer]));
const eventById = new Map(events.map(event => [event.id, event]));
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function inRange(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

check(Object.keys(lives).length === composers.length, 'life entries must match composer count');
for (const composer of composers) {
  const life = lives[composer.id];
  check(Boolean(life), `${composer.id}: missing life`);
  if (!life) continue;

  check(Array.isArray(life.pts) && life.pts.length >= 7 && life.pts.length <= 14,
    `${composer.id}: expected 7–14 keyframes`);
  if (!Array.isArray(life.pts) || life.pts.length === 0) continue;

  const firstAge = life.pts[0][0] - composer.birthYear;
  check(firstAge >= 12 && firstAge <= 18,
    `${composer.id}: first keyframe should be around age 12–18`);
  for (let index = 0; index < life.pts.length; index += 1) {
    const point = life.pts[index];
    const [year, output, standing, moment] = point;
    check(year >= composer.birthYear + 8 && year <= composer.deathYear,
      `${composer.id}: point ${index} year outside birth+8..death`);
    check(index === 0 || year > life.pts[index - 1][0],
      `${composer.id}: point years must ascend`);
    check(inRange(output) && inRange(standing),
      `${composer.id}: point ${index} values must be in [0,1]`);
    if (moment !== undefined) check(typeof moment === 'string' && moment.length <= 55,
      `${composer.id}: point ${index} moment exceeds 55 characters`);
  }
  check(life.pts.at(-1)[0] === composer.deathYear,
    `${composer.id}: final point must be the death year`);

  if (life.after !== undefined) {
    check(Array.isArray(life.after) && life.after.length > 0,
      `${composer.id}: after must be a non-empty array`);
    if (Array.isArray(life.after)) {
      for (let index = 0; index < life.after.length; index += 1) {
        const [year, standing, moment] = life.after[index];
        check(year > composer.deathYear && year <= 2000,
          `${composer.id}: after point ${index} must follow death and be ≤2000`);
        check(index === 0 || year > life.after[index - 1][0],
          `${composer.id}: after years must ascend`);
        check(inRange(standing), `${composer.id}: after standing must be in [0,1]`);
        if (moment !== undefined) check(typeof moment === 'string' && moment.length <= 55,
          `${composer.id}: after moment exceeds 55 characters`);
      }
    }
  }

  check(Array.isArray(life.links) && life.links.length <= 8,
    `${composer.id}: expected an array of at most 8 verified links`);
  for (const [index, link] of (life.links ?? []).entries()) {
    check(typeof link.text === 'string' && link.text.length <= 80,
      `${composer.id}: link ${index} text exceeds 80 characters`);
    if (link.kind === 'event') {
      const event = eventById.get(link.ref);
      check(Boolean(event), `${composer.id}: link ${index} has unresolved event ${link.ref}`);
      if (event) {
        const endYear = typeof event.endYear === 'number' ? event.endYear : event.year;
        check(link.year >= event.year - 5 && link.year <= endYear + 5,
          `${composer.id}: link ${index} year is outside event ${link.ref} range ±5`);
      }
    } else if (link.kind === 'contemporary') {
      const peer = composerById.get(link.ref);
      check(Boolean(peer), `${composer.id}: link ${index} has unresolved composer ${link.ref}`);
      if (peer) check(link.year >= peer.birthYear && link.year <= peer.deathYear,
        `${composer.id}: link ${index} year is outside ${link.ref}'s lifetime`);
    } else {
      check(false, `${composer.id}: link ${index} has invalid kind ${link.kind}`);
    }
  }

  check(Array.isArray(life.sources) && life.sources.some(source =>
    typeof source === 'string' && source.startsWith('https://en.wikipedia.org/wiki/')),
  `${composer.id}: missing English Wikipedia source`);
  check(life.note === undefined || (typeof life.note === 'string' && life.note.length <= 50),
    `${composer.id}: note exceeds 50 characters`);
}

check(Object.keys(instrumentExtras).length === instruments.length,
  'instrument-extra entries must match instrument count');
const surnameOverrides = {
  'Manuel de Falla': 'de Falla',
  'Nikolai Rimsky-Korsakov': 'Rimsky-Korsakov',
  'Ralph Vaughan Williams': 'Vaughan Williams'
};
for (const instrument of instruments) {
  const extra = instrumentExtras[instrument.id];
  check(Boolean(extra), `${instrument.id}: missing instrument extra`);
  if (!extra) continue;

  const showcase = extra.showcase;
  check(Boolean(showcase), `${instrument.id}: missing showcase`);
  if (showcase) {
    check(typeof showcase.title === 'string' && showcase.title.length > 0,
      `${instrument.id}: showcase title is required`);
    check(typeof showcase.composerName === 'string' && showcase.composerName.length > 0,
      `${instrument.id}: showcase composer name is required`);
    check(showcase.composerId === null || composerById.has(showcase.composerId),
      `${instrument.id}: unresolved showcase composer ${showcase.composerId}`);
    check(typeof showcase.why === 'string' && showcase.why.length <= 120,
      `${instrument.id}: showcase explanation exceeds 120 characters`);
    check(typeof showcase.year === 'number' && Number.isFinite(showcase.year),
      `${instrument.id}: showcase year must be numeric`);

    const surname = surnameOverrides[showcase.composerName]
      ?? showcase.composerName.trim().split(/\s+/).at(-1);
    const expectedUrl = `https://open.spotify.com/search/${encodeURIComponent(`${showcase.title} ${surname}`)}`;
    check(showcase.spotifyUrl === expectedUrl,
      `${instrument.id}: Spotify URL must search title and composer surname`);
    check(!String(showcase.spotifyUrl).includes('open.spotify.com/track'),
      `${instrument.id}: Spotify URL must not use a track ID`);
  }

  check(Array.isArray(extra.greats) && extra.greats.length >= 2 && extra.greats.length <= 3,
    `${instrument.id}: expected 2–3 greats`);
  for (const [index, great] of (extra.greats ?? []).entries()) {
    check(typeof great.name === 'string' && great.name.length > 0,
      `${instrument.id}: great ${index} needs a name`);
    check(typeof great.note === 'string' && great.note.length <= 60,
      `${instrument.id}: great ${index} note exceeds 60 characters`);
  }
  if (instrument.id === 'cello') {
    check(extra.goat?.name === 'Yo-Yo Ma'
      && typeof extra.goat.note === 'string'
      && extra.goat.note.length <= 60,
    'cello: goat must name Yo-Yo Ma with a note of at most 60 characters');
  } else {
    check(extra.goat === null, `${instrument.id}: goat must be null`);
  }
}

if (failures.length > 0) {
  console.error(`FAIL: ${failures.length} validation error(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`PASS: ${composers.length} composer lives, ${instruments.length} instruments, and all data assertions.`);
}

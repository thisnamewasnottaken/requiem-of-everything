import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const locales = ['af-ZA', 'es-ES', 'fr-FR', 'pl-PL'];
const dataContext = { window: {} };
vm.createContext(dataContext);
for (const file of ['common/data.js', 'common/lives.js', 'common/instrument-extra.js', 'common/instrument-eras.js', 'common/hall-layout.js', 'common/terms-base.js', 'common/terms.js']) {
  vm.runInContext(await readFile(path.join(root, file), 'utf8'), dataContext, { filename: file });
}
const base = dataContext.window;
const terms = [...base.ROE_TERMS_BASE, ...base.ROE_TERMS_NEW];
const englishUi = JSON.parse(await readFile(path.join(root, 'locales-src/en-GB/ui.json'), 'utf8'));
const required = {
  composers: { ids: base.ROE_DATA.composers.map(item => item.id), fields: ['name', 'shortName', 'birthPlace', 'nationality', 'biography'] },
  compositions: { ids: base.ROE_DATA.compositions.map(item => item.id), fields: ['title', 'instrumentation', 'description', 'significance'] },
  eras: { ids: base.ROE_DATA.eras.map(item => item.id), fields: ['name', 'description', 'characteristics'] },
  events: { ids: base.ROE_DATA.events.map(item => item.id), fields: ['title', 'description', 'musicalSignificance', 'region'] },
  instruments: { ids: base.ROE_DATA.instruments.map(item => item.id), fields: ['name', 'role', 'description'] },
  terms: { ids: terms.map(item => item.id) },
  instrumentEras: { ids: base.ROE_DATA.instruments.map(item => item.id), fields: ['renaissance', 'baroque', 'classical', 'early-romantic', 'late-romantic', 'modern'] }
};
const source = async (lang, namespace) => JSON.parse(await readFile(path.join(root, `locales-src/${lang}/${namespace}.json`), 'utf8'));
const englishFields = {
  composers: Object.fromEntries(base.ROE_DATA.composers.map(item => [item.id, item])),
  compositions: Object.fromEntries(base.ROE_DATA.compositions.map(item => [item.id, item])),
  eras: Object.fromEntries(base.ROE_DATA.eras.map(item => [item.id, item])),
  events: Object.fromEntries(base.ROE_DATA.events.map(item => [item.id, item])),
  instruments: Object.fromEntries(base.ROE_DATA.instruments.map(item => [item.id, item])),
  terms: Object.fromEntries(terms.map(item => [item.id, item])),
  instrumentExtra: base.ROE_INSTR_EXTRA,
  instrumentEras: base.ROE_INSTR_ERAS
};
const errors = [];
const identical = [];
const report = [];
const identicalAllowlist = new Set([
  'af-ZA/composers/giovanni-pierluigi-da-palestrina/name',
  'af-ZA/compositions/berlioz-requiem/title',
  'af-ZA/compositions/debussy-prelude-apres-midi/title',
  'es-ES/composers/giovanni-pierluigi-da-palestrina/name',
  'fr-FR/composers/giovanni-pierluigi-da-palestrina/name',
  'fr-FR/compositions/debussy-prelude-apres-midi/title',
  'pl-PL/composers/giovanni-pierluigi-da-palestrina/name'
]);

for (const lang of locales) {
  const ui = await source(lang, 'ui');
  const missingUi = Object.keys(englishUi).filter(key => typeof ui[key] !== 'string' || !ui[key].trim());
  for (const key of missingUi) errors.push(`${lang}/ui/${key}`);
  const pluralSuffixes = lang === 'pl-PL' ? ['one', 'few', 'many', 'other'] : ['one', 'other'];
  const pluralStems = [...new Set(Object.keys(englishUi).filter(key => key.endsWith('_one')).map(key => key.slice(0, -4)))];
  for (const stem of pluralStems) {
    for (const suffix of pluralSuffixes) {
      if (typeof ui[`${stem}_${suffix}`] !== 'string' || !ui[`${stem}_${suffix}`].trim()) errors.push(`${lang}/ui/${stem}_${suffix}`);
    }
  }
  for (const [key, value] of Object.entries(ui)) {
    if (typeof value === 'string' && value.length > 30 && value === englishUi[key]) identical.push(`${lang}/ui/${key}`);
  }
  const uiCoverage = `${Object.keys(englishUi).length - missingUi.length}/${Object.keys(englishUi).length}`;

  const coverages = [];
  for (const [namespace, schema] of Object.entries(required)) {
    const translations = await source(lang, namespace);
    const fields = schema.fields || [];
    let covered = 0;
    let total = 0;
    for (const id of schema.ids) {
      const record = translations[id];
      if (!record) {
        if (namespace === 'terms') {
          const english = englishFields.terms[id];
          const expected = [['term', 'term']];
          if (english.short !== undefined || english.shortDefinition !== undefined) {
            const field = english.short !== undefined ? 'short' : 'shortDefinition';
            expected.push([field, field]);
          }
          if (english.long !== undefined || english.longDefinition !== undefined) {
            const field = english.long !== undefined ? 'long' : 'longDefinition';
            expected.push([field, field]);
          }
          if (english.lit !== undefined) expected.push(['lit', 'lit']);
          for (const [field] of expected) { errors.push(`${lang}/terms/${id}/${field}`); total++; }
        } else {
          const englishRecord = englishFields[namespace]?.[id];
          for (const field of fields.length ? fields : ['label']) {
            const english = englishRecord?.[field];
            if (english === undefined || english === null || english === '') continue;
            if (Array.isArray(english)) {
              for (let i = 0; i < english.length; i++) { errors.push(`${lang}/${namespace}/${id}/${field}/${i}`); total++; }
            } else { errors.push(`${lang}/${namespace}/${id}/${field}`); total++; }
          }
        }
        continue;
      }
      if (namespace === 'terms') {
        const english = englishFields.terms[id];
        const termFields = [['term', 'term']];
        if (english.short !== undefined || english.shortDefinition !== undefined) {
          const field = english.short !== undefined ? 'short' : 'shortDefinition';
          termFields.push([field, field]);
        }
        if (english.long !== undefined || english.longDefinition !== undefined) {
          const field = english.long !== undefined ? 'long' : 'longDefinition';
          termFields.push([field, field]);
        }
        if (english.lit !== undefined) termFields.push(['lit', 'lit']);
        for (const [targetField, sourceField] of termFields) {
          const value = record[targetField];
          total++;
          if (typeof value === 'string' && value.trim()) covered++;
          else errors.push(`${lang}/terms/${id}/${targetField}`);
          const englishValue = english[sourceField];
          if (typeof value === 'string' && value.length > 30 && value === englishValue) identical.push(`${lang}/terms/${id}/${targetField}`);
        }
        continue;
      }
      if (namespace === 'instrumentExtra') {
        const english = englishFields.instrumentExtra[id];
        const fieldsToCheck = [];
        if (english.showcase?.why) fieldsToCheck.push(['showcase.why', record.showcase?.why, english.showcase.why]);
        (english.greats || []).forEach((item, i) => {
          if (item.note) fieldsToCheck.push([`greats.${i}.note`, record.greats?.[i]?.note, item.note]);
        });
        if (english.goat?.note) fieldsToCheck.push(['goat.note', record.goat?.note, english.goat.note]);
        for (const [field, value, englishValue] of fieldsToCheck) {
          total++;
          if (typeof value === 'string' && value.trim()) covered++;
          else errors.push(`${lang}/instrumentExtra/${id}/${field}`);
          if (typeof value === 'string' && value.length > 30 && value === englishValue) identical.push(`${lang}/instrumentExtra/${id}/${field}`);
        }
        continue;
      }
      for (const field of fields) {
        const english = englishFields[namespace]?.[id]?.[field];
        if (english === undefined || english === null || english === '') continue;
        const value = record[field];
        if (Array.isArray(english)) {
          total += english.length;
          if (Array.isArray(value)) {
            for (let i = 0; i < english.length; i++) {
              if (typeof value[i] === 'string' && value[i].trim()) covered++;
              else errors.push(`${lang}/${namespace}/${id}/${field}/${i}`);
              if (typeof value[i] === 'string' && value[i].length > 30 && value[i] === english[i]) identical.push(`${lang}/${namespace}/${id}/${field}/${i}`);
            }
          } else {
            for (let i = 0; i < english.length; i++) errors.push(`${lang}/${namespace}/${id}/${field}/${i}`);
          }
        } else {
          total++;
          if (typeof value === 'string' && value.trim()) covered++;
          else errors.push(`${lang}/${namespace}/${id}/${field}`);
          if (typeof value === 'string' && value.length > 30 && value === english) identical.push(`${lang}/${namespace}/${id}/${field}`);
        }
      }
    }
    coverages.push(`${namespace} ${covered}/${total}`);
  }

  const hall = await source(lang, 'hall');
  let hallCovered = 0, hallTotal = 0;
  for (const [id, era] of Object.entries(base.ROE_HALL.L)) {
    for (const field of ['name', 'lead', 'text', 'year']) {
      const value = hall.eras?.[id]?.[field];
      hallTotal++;
      if (typeof value === 'string' && value.trim()) hallCovered++;
      else errors.push(`${lang}/hall/eras/${id}/${field}`);
      if (typeof value === 'string' && value.length > 30 && value === era[field]) identical.push(`${lang}/hall/eras/${id}/${field}`);
    }
  }
  for (const piece of base.ROE_HALL.PIECES) {
    for (const field of ['label', 'year']) {
      const value = hall.pieces?.[piece.id]?.[field];
      hallTotal++;
      if (typeof value === 'string' && value.trim()) hallCovered++;
      else errors.push(`${lang}/hall/pieces/${piece.id}/${field}`);
      if (typeof value === 'string' && value.length > 30 && value === piece[field]) identical.push(`${lang}/hall/pieces/${piece.id}/${field}`);
    }
  }
  for (const [id, section] of Object.entries(base.ROE_HALL.S)) {
    const value = hall.sections?.[id];
    hallTotal++;
    if (typeof value === 'string' && value.trim()) hallCovered++;
    else errors.push(`${lang}/hall/sections/${id}`);
    if (typeof value === 'string' && value.length > 30 && value === section[0]) identical.push(`${lang}/hall/sections/${id}`);
    if (section[7]) {
      const shortValue = hall.shortSections?.[id];
      hallTotal++;
      if (typeof shortValue === 'string' && shortValue.trim()) hallCovered++;
      else errors.push(`${lang}/hall/shortSections/${id}`);
      if (typeof shortValue === 'string' && shortValue.length > 30 && shortValue === section[7]) identical.push(`${lang}/hall/shortSections/${id}`);
    }
  }
  coverages.push(`hall ${hallCovered}/${hallTotal}`);

  const lives = await source(lang, 'lives');
  let lifeCovered = 0, lifeTotal = 0;
  for (const [id, life] of Object.entries(base.ROE_LIVES)) {
    const translated = lives[id] || {};
    for (const [field, length] of [['pts', life.pts.length], ['links', life.links.length], ['after', (life.after || []).length]]) {
      lifeTotal += length;
      const values = translated[field] || [];
      for (let i = 0; i < length; i++) {
        if (typeof values[i] === 'string' && values[i].trim()) lifeCovered++;
        else if ((field !== 'pts' || !life.pts[i][3]) && (field !== 'links' || !life.links[i].text) && (field !== 'after' || !life.after?.[i]?.[2])) lifeCovered++;
        else errors.push(`${lang}/lives/${id}/${field}/${i}`);
        const english = field === 'pts' ? life.pts[i][3] : field === 'links' ? life.links[i].text : life.after?.[i]?.[2];
        if (typeof values[i] === 'string' && values[i].length > 30 && values[i] === english) identical.push(`${lang}/lives/${id}/${field}/${i}`);
      }
    }
    if (life.note) {
      lifeTotal++;
      if (typeof translated.note === 'string' && translated.note.trim()) lifeCovered++;
      else errors.push(`${lang}/lives/${id}/note`);
      if (typeof translated.note === 'string' && translated.note.length > 30 && translated.note === life.note) identical.push(`${lang}/lives/${id}/note`);
    }
  }
  coverages.push(`lives ${lifeCovered}/${lifeTotal}`);

  const extras = await source(lang, 'instrumentExtra');
  let extraCovered = 0, extraTotal = 0;
  for (const [id, extra] of Object.entries(base.ROE_INSTR_EXTRA)) {
    const translated = extras[id] || {};
    if (extra.showcase) {
      extraTotal += 1;
      if (typeof translated.showcase?.why === 'string' && translated.showcase.why.trim()) extraCovered++; else errors.push(`${lang}/instrumentExtra/${id}/showcase/why`);
      if (translated.showcase?.why?.length > 30 && translated.showcase.why === extra.showcase.why) identical.push(`${lang}/instrumentExtra/${id}/showcase/why`);
      if (!extra.showcase.compositionId) {
        extraTotal += 1;
        if (typeof translated.showcase?.title === 'string' && translated.showcase.title.trim()) extraCovered++; else errors.push(`${lang}/instrumentExtra/${id}/showcase/title`);
        if (translated.showcase?.title?.length > 30 && translated.showcase.title === extra.showcase.title) identical.push(`${lang}/instrumentExtra/${id}/showcase/title`);
      }
    }
    for (let i = 0; i < (extra.greats || []).length; i++) {
      extraTotal++;
      if (typeof translated.greats?.[i]?.note === 'string' && translated.greats[i].note.trim()) extraCovered++; else errors.push(`${lang}/instrumentExtra/${id}/greats/${i}/note`);
      if (translated.greats?.[i]?.note?.length > 30 && translated.greats[i].note === extra.greats[i].note) identical.push(`${lang}/instrumentExtra/${id}/greats/${i}/note`);
    }
    if (extra.goat?.note) {
      extraTotal++;
      if (typeof translated.goat?.note === 'string' && translated.goat.note.trim()) extraCovered++; else errors.push(`${lang}/instrumentExtra/${id}/goat/note`);
      if (translated.goat?.note?.length > 30 && translated.goat.note === extra.goat.note) identical.push(`${lang}/instrumentExtra/${id}/goat/note`);
    }
  }
  coverages.push(`instrumentExtra ${extraCovered}/${extraTotal}`);
  report.push(`${lang}: ui ${uiCoverage}; ${coverages.join('; ')}`);
}

console.log(report.join('\n'));
const deliberate = identical.filter(value => identicalAllowlist.has(value));
const unexpectedIdentical = identical.filter(value => !identicalAllowlist.has(value));
if (deliberate.length) console.log(`Allowlisted identical translations over 30 characters (${deliberate.length}):\n${deliberate.join('\n')}`);
assert.deepEqual(unexpectedIdentical, [], `Unexpected identical translations:\n${unexpectedIdentical.join('\n')}`);
assert.deepEqual(errors, [], `Missing locale fields:\n${errors.join('\n')}`);

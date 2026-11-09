import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const locales = ['en-GB', 'af-ZA', 'es-ES', 'fr-FR', 'pl-PL'];
const dataContext = { window: {} };
vm.runInNewContext(await readFile(path.join(root, 'common/data.js'), 'utf8'), dataContext, { filename: 'common/data.js' });
const baseComposers = dataContext.window.ROE_DATA.composers;
assert.equal(baseComposers.length, 51, 'expected all 51 River composers');
const englishNationality = new Map(baseComposers.map(composer => [composer.id, composer.nationality]));

const i18nSource = await readFile(path.join(root, 'common/i18n.js'), 'utf8');
const mergeFunction = i18nSource.match(/function mergeRecords\(records, translations\) \{[\s\S]*?\n  \}/)?.[0];
assert.ok(mergeFunction, 'could not find mergeRecords in common/i18n.js');
const mergeContext = {};
vm.runInNewContext(`${mergeFunction}\nglobalThis.mergeRecords = mergeRecords;`, mergeContext, { filename: 'common/i18n.js#mergeRecords' });

const riverSource = await readFile(path.join(root, 'river.html'), 'utf8');
const natLiteral = riverSource.match(/const NAT=(\{[^;]+\});/)?.[1];
assert.ok(natLiteral, 'could not extract NAT from river.html');
const natContext = {};
vm.runInNewContext(`globalThis.NAT=${natLiteral};`, natContext, { filename: 'river.html#NAT' });
const nationalities = natContext.NAT;

for (const lang of locales) {
  let translations;
  if (lang !== 'en-GB') {
    const localeContext = { window: {} };
    vm.runInNewContext(await readFile(path.join(root, `common/locales/${lang}.js`), 'utf8'), localeContext, { filename: `common/locales/${lang}.js` });
    translations = localeContext.window.ROE_LOCALE.composers;
  }
  const composers = baseComposers.map(composer => ({ ...composer }));
  mergeContext.mergeRecords(composers, translations);

  for (const composer of composers) {
    assert.equal(composer.nationalityKey, englishNationality.get(composer.id), `${lang}/${composer.id}: nationalityKey must remain English`);
    assert.ok(Object.hasOwn(nationalities, composer.nationalityKey), `${lang}/${composer.id}: nationalityKey missing from River NAT`);
    const translated = translations?.[composer.id]?.nationality;
    if (translated) assert.equal(composer.nationality, translated, `${lang}/${composer.id}: display nationality should remain localized`);
  }
  console.log(`${lang}: ${composers.length}/${baseComposers.length} nationality keys preserved and mapped`);
}

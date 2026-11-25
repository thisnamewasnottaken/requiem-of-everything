import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const locales = ['af-ZA', 'es-ES', 'fr-FR', 'pl-PL'];
const namespaces = [
  'ui',
  'composers',
  'compositions',
  'eras',
  'events',
  'instruments',
  'terms',
  'lives',
  'instrumentExtra',
  'instrumentEras',
  'hall'
];

for (const lang of locales) {
  const locale = { lang };
  for (const namespace of namespaces) {
    const file = path.join(root, 'locales-src', lang, `${namespace}.json`);
    locale[namespace] = JSON.parse(await readFile(file, 'utf8'));
  }
  const output = path.join(root, 'common', 'locales', `${lang}.js`);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `window.ROE_LOCALE = ${JSON.stringify(locale)};\n`);
  console.log(`Built ${path.relative(root, output)}`);
}

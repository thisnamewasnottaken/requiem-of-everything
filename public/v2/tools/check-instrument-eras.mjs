import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const context={window:{}};
for(const file of ['common/data.js','common/instrument-eras.js']){
  const path=fileURLToPath(new URL(file,root));
  vm.runInNewContext(readFileSync(path,'utf8'),context,{filename:path});
}

const instruments=context.window.ROE_DATA.instruments;
const eras=context.window.ROE_DATA.eras.map(era=>era.id);
const notes=context.window.ROE_INSTR_ERAS;
const issues=[];

for(const instrument of instruments){
  const entries=notes[instrument.id];
  if(!entries){issues.push(`${instrument.id}: missing notes`);continue;}
  for(const era of eras){
    const note=entries[era];
    if(typeof note!=='string'||!note.trim())issues.push(`${instrument.id}/${era}: missing note`);
    else if(note.length>140)issues.push(`${instrument.id}/${era}: ${note.length} characters`);
  }
  for(const era of Object.keys(entries))if(!eras.includes(era))issues.push(`${instrument.id}: unexpected era ${era}`);
  if(Object.keys(entries).length!==eras.length)issues.push(`${instrument.id}: expected ${eras.length} notes, got ${Object.keys(entries).length}`);
}
for(const id of Object.keys(notes))if(!instruments.some(instrument=>instrument.id===id))issues.push(`unexpected instrument ${id}`);

assert.deepEqual(issues,[]);
console.log(`Validated ${instruments.length} instruments × ${eras.length} eras = ${instruments.length*eras.length} notes (all ≤140 characters).`);

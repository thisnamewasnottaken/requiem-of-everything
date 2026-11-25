import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const layoutPath=fileURLToPath(new URL('../common/hall-layout.js',import.meta.url));
const context={window:{}};
vm.runInNewContext(readFileSync(layoutPath,'utf8'),context,{filename:layoutPath});
const {L,PIECES,layoutSeats,pieceDefs}=context.window.ROE_HALL;
const layouts=[
  ...Object.entries(L).map(([id,layout])=>[`era:${id}`,layout.s]),
  ...PIECES.map(piece=>[`piece:${piece.id}`,pieceDefs(piece)]),
];
let failed=false;

for(const [name,defs] of layouts){
  const {out,carp}=layoutSeats(defs);
  const sections=Object.entries(carp);
  const issues=[];
  for(let i=0;i<sections.length;i++){
    const [sid,a]=sections[i];
    for(let j=i+1;j<sections.length;j++){
      const [other,b]=sections[j];
      const angleOverlap=Math.min(a.a1,b.a1)-Math.max(a.a0,b.a0);
      const radialOverlap=a.R0<=b.R1&&b.R0<=a.R1;
      if(angleOverlap>.5&&radialOverlap)issues.push(`carpets ${sid}/${other} overlap`);
    }
  }
  for(let i=0;i<out.length;i++){
    for(let j=i+1;j<out.length;j++){
      const dx=out[i].x-out[j].x, dz=out[i].z-out[j].z;
      if(dx*dx+dz*dz<.16-1e-9)issues.push(`seats ${out[i].key}/${out[j].key} are closer than 0.4`);
    }
  }
  const maxOuter=out.reduce((max,seat)=>Math.max(max,Math.hypot(seat.x,seat.z)),0);
  const maxCarpetEdge=sections.reduce((max,[,carpet])=>Math.max(max,carpet.R1),0);
  try{
    assert.deepEqual(issues,[]);
    console.log(`${name}: ${sections.length} sections, max outer radius ${maxOuter.toFixed(2)} (carpet edge ${maxCarpetEdge.toFixed(2)}) — PASS`);
  }catch{
    failed=true;
    console.log(`${name}: ${sections.length} sections, max outer radius ${maxOuter.toFixed(2)} (carpet edge ${maxCarpetEdge.toFixed(2)}) — FAIL`);
    for(const issue of issues.slice(0,8))console.log(`  ${issue}`);
    if(issues.length>8)console.log(`  …and ${issues.length-8} more`);
  }
}

if(failed)process.exitCode=1;

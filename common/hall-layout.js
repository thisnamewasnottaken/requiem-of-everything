const S={
 v1:['First violins','strings','violin','violin',[76,79,83,81],'#ffc27a','fiddle'], v2:['Second violins','strings','violin','violin',[72,76,79,76],'#ff8f57','fiddle'],
 va:['Violas','strings','viola','viola',[67,69,72,71],'#f2a3b4','fiddle'], vc:['Cellos','strings','cello','cello',[48,55,60,59],'#e0703f','cello'], cb:['Double basses','strings','double-bass','bass',[36,43,36,31],'#b8573a','bass'],
 viol:['Viols','strings','viola-da-gamba','cello',[50,57,62,60],'#e9b48a','cello'], lute:['Lute & theorbo','strings',null,'lute',[62,66,69,74],'#f7d39a','lute','Lutes'], hp:['Harps','strings','harp','harp',[60,64,67,72,76],'#ffd9b0','harp'],
 fl:['Flutes','winds','flute','flute',[84,86,88,91],'#c4f5d8','flute'], pic:['Piccolo','winds','flute','piccolo',[93,95,96],'#e6fff3','flute'], rec:['Recorders','winds','recorder','recorder',[74,76,79,78],'#a8e8c0','reed'],
 ob:['Oboes','winds','oboe','oboe',[76,74,72,74],'#79d6a6','reed'], cl:['Clarinets','winds','clarinet','clarinet',[67,72,76,79],'#62c7cf','reed'], bn:['Bassoons','winds','bassoon','bassoon',[48,50,52,55],'#3fae8a','bassoon'],
 hn:['Horns','brass','french-horn','horn',[60,65,69,72],'#ffe07f','horn'], tp:['Trumpets','brass','trumpet','trumpet',[72,72,79,76],'#fff3b8','trumpet'], tb:['Trombones','brass','trombone','trombone',[53,58,62,65],'#efbd52','trombone'],
 sack:['Sackbuts','brass','trombone','trombone',[53,57,60,57],'#f0c870','trombone'], cor:['Cornetts','brass',null,'oboe',[74,76,79,81],'#ffe6a0','reed'], tu:['Tuba','brass','tuba','tuba',[34,41,29],'#d29b36','tuba'],
 ti:['Timpani','perc','timpani','timpani',[43,36,43,36],'#ff7a55','timp'], pc:['Percussion','perc','cymbals-and-percussion','glock',[84,88,91],'#ffa486','drum'],
 hc:['Harpsichord (continuo)','keys','harpsichord','harpsichord',[62,66,69,74,78],'#f3ead8','keys','Harpsichord'], fp:['Fortepiano','keys','piano','piano',[67,71,74,79],'#faf2e6','keys'], org:['Organ','keys','organ','organ',[48,55,60,64],'#e8dcc4','keys'],
 cel:['Celesta & piano','keys','celesta','celesta',[84,88,91,96],'#fff8ee','keys','Celesta'],
 sop:['Sopranos','voices','soprano','choir',[72,74,76,79],'#d4e3ff','voice'], alt:['Altos','voices','alto-mezzo','choir',[64,65,67,69],'#a9c4ff','voice'],
 ten:['Tenors','voices','tenor','choir',[57,60,62,64],'#8ea6ff','voice'], bas:['Basses','voices','bass-baritone','choir',[45,48,50,43],'#7887f0','voice'],
};
const L={
 renaissance:{year:'c. 1600',name:'The Venetian Chapel',lead:'Led by the maestro di cappella, beating the tactus',eras:['renaissance'],
  text:'No orchestra yet: voices are the heart. Choirs face each other across a basilica, joined by viols, sackbuts and cornetts that double the singers, and a lute or organ binding the harmony.',
  s:[['sop',3,0,25,57],['alt',3,0,58,90],['ten',3,0,90,122],['bas',3,0,123,155],['viol',4,1,55,95],['lute',2,1,95,125],['sack',3,2,130,170],['cor',2,2,10,50],['rec',2,1,20,50],['org',1,2,85,95]]},
 baroque:{year:'c. 1720',name:'The Court Band',lead:'Directed from the harpsichord or the first violin',eras:['baroque'],
  text:'Everything grows from the continuo: harpsichord, cello and bass at the centre. Violins split left and right, oboes double them, and trumpets with timpani are kept for festive days.',
  s:[['hc',1,0,88,92],['vc',2,0,100,125],['cb',1,0,128,142],['bn',1,1,100,115],['v1',4,0,0,55],['v2',4,0,145,180],['va',2,1,55,85],['ob',2,1,120,150],['tp',3,2,60,100],['ti',1,2,110,120]]},
 classical:{year:'1795 · Haydn in London',name:'The Classical Orchestra',lead:'The leader and the composer at the keyboard share the helm',eras:['classical'],
  text:'Winds arrive in pairs, each with its own voice. Violins sit antiphonally, firsts left and seconds right, so the melodies answer one another across the stage.',
  s:[['v1',10,0,0,55],['v2',8,0,125,180],['va',6,0,55,90],['vc',5,0,90,125],['cb',4,1,150,180],['fp',1,0,88,92],['fl',2,2,70,90],['ob',2,2,90,110],['cl',2,3,70,90],['bn',2,3,90,110],['hn',2,3,30,62],['tp',2,4,110,130],['ti',1,4,140,150]]},
 romantic:{year:'c. 1890 · Vienna',name:'The Romantic Orchestra',lead:'The conductor becomes a star: Mahler on the podium',eras:['early-romantic','late-romantic'],
  text:'Ninety players. Winds in threes, horns in fours to eights, trombones and tuba, harps and a whole battery of percussion. German seating keeps the violins apart and the basses behind the firsts.',
  s:[['v1',16,0,0,60],['v2',14,0,120,180],['vc',10,0,60,90],['va',12,0,90,120],['cb',8,2,0,25],['fl',3,2,70,90],['ob',3,2,90,110],['cl',3,3,70,90],['bn',3,3,90,110],['hn',6,3,25,65],['tp',4,4,85,108],['tb',3,4,108,132],['tu',1,4,132,140],['ti',2,4,55,80],['hp',2,2,155,178],['pc',3,5,120,160]]},
 modern:{year:'since the 1920s',name:'The Modern Symphony',lead:'Stokowski\u2019s American seating, now standard worldwide',eras:['modern'],
  text:'Firsts and seconds sit together on the left so the violins sound as one; cellos move outward, basses on the right. Piano, celesta and a vast percussion section join the back rows.',
  s:[['v1',16,0,0,50],['v2',14,1,0,55],['va',12,0,50,95],['vc',10,0,95,150],['cb',8,1,150,180],['hp',2,2,0,18],['fl',3,2,62,88],['ob',3,2,92,118],['cl',3,3,62,88],['bn',3,3,92,118],['hn',6,3,22,60],['tp',4,4,82,110],['tb',3,4,110,135],['tu',1,4,135,143],['ti',4,5,80,100],['pc',4,5,105,150],['cel',2,3,160,178]]},
};
const PIECES=[
 {id:'orfeo',who:'Monteverdi',label:'Monteverdi · L\u2019Orfeo',era:'renaissance',year:'1607 · Mantua',lead:'Monteverdi names his instruments: the first written orchestration',
  text:'Some forty players: harpsichords, a regal, chitarroni, viols, recorders, cornetts and five trombones that announce the underworld.',mod:{sack:5,rec:2,lute:3,viol:6,hc:2},add:[['hc',2,0,93,100]]},
 {id:'seasons',who:'Vivaldi',label:'Vivaldi · The Four Seasons',era:'baroque',year:'1725 · Venice',lead:'A solo violin against strings and continuo',text:'No winds at all. Birdsong, storms and shivering frost are painted by strings alone over the harpsichord\u2019s pulse.',mod:{ob:0,tp:0,ti:0,bn:0,v1:5,v2:5,va:3}},
 {id:'m40',who:'Mozart',label:'Mozart · Symphony No. 40',era:'classical',year:'1788 · Vienna',lead:'No trumpets, no timpani: darkness by subtraction',text:'One flute, pairs of oboes, clarinets (added in revision), bassoons and horns. The missing brass makes G minor feel intimate and restless.',mod:{tp:0,ti:0,fl:1,fp:0}},
 {id:'b5',who:'Beethoven',label:'Beethoven · Symphony No. 5',era:'classical',year:'1808 · Vienna',lead:'The finale bursts open with new instruments',text:'For the triumphant C major finale Beethoven adds piccolo, contrabassoon and three trombones: their first appearance in a symphony.',mod:{fp:0},add:[['pic',1,2,60,68],['tb',3,4,130,148]]},
 {id:'m8',who:'Mahler',label:'Mahler · Symphony No. 8',era:'romantic',year:'1910 · Munich',lead:'\u201cSymphony of a Thousand\u201d',text:'A vast orchestra, two mixed choirs, a children\u2019s choir, eight soloists and an organ: over a thousand performers at the premiere.',mod:{hn:8,tp:4,hp:4},
  add:[['sop',15,6,15,52],['alt',15,6,53,90],['ten',15,6,90,127],['bas',15,6,128,165],['org',1,7,86,94]]},
 {id:'rite',who:'Stravinsky',label:'Stravinsky · The Rite of Spring',era:'modern',year:'1913 · Paris',lead:'An orchestra built for earthquakes',text:'Winds in fives, eight horns, two tubas and pounding timpani. The orchestra becomes one enormous percussion instrument.',mod:{fl:5,ob:5,cl:5,bn:5,hn:8,tu:2,ti:5,cel:0}},
];
const ringR=r=>1.55+r*1.05;
function layoutSeats(defs){
  const merged=new Map();
  for(const [sid,n,ring,a0,a1] of defs){
    const d=merged.get(sid);
    if(d){ d.n+=n; d.ring=Math.min(d.ring,ring); d.a0=Math.min(d.a0,a0); d.a1=Math.max(d.a1,a1); }
    else merged.set(sid,{sid,n,ring,a0,a1,order:merged.size});
  }
  const ordered=[...merged.values()].sort((a,b)=>a.ring-b.ring||a.order-b.order);
  const out=[],carp={},placed=[];
  for(const d of ordered){
    if(!d.n)continue;
    const rowCount=Rin=>{
      let total=0,rows=0;
      while(total<d.n){
        const R=Rin+rows*.5, arc=(d.a1-d.a0)*Math.PI/180*R;
        total+=Math.max(1,Math.min(d.n-total,Math.floor(arc/.46)));
        rows++;
      }
      return rows;
    };
    let Rin=ringR(d.ring),rows,R0,R1;
    while(true){
      rows=rowCount(Rin); R0=Rin-.26; R1=Rin+(rows-1)*.5+.26;
      const conflicts=placed.filter(c=>Math.min(c.a1,d.a1)-Math.max(c.a0,d.a0)>.5&&R0<=c.R1&&c.R0<=R1);
      if(!conflicts.length)break;
      Rin=Math.max(...conflicts.map(c=>c.R1))+.32;
    }
    let total=0,row=0,index=0;
    while(total<d.n){
      const R=Rin+row*.5, arc=(d.a1-d.a0)*Math.PI/180*R, per=Math.max(1,Math.min(d.n-total,Math.floor(arc/.46)));
      for(let k=0;k<per;k++){
        const th=(d.a0+(d.a1-d.a0)*(per===1?.5:(k+.5)/per))*Math.PI/180;
        out.push({key:d.sid+':'+index++,sid:d.sid,x:-Math.cos(th)*R,z:Math.sin(th)*R});
      }
      total+=per; row++;
    }
    const sector={a0:d.a0,a1:d.a1,R0,R1};
    carp[d.sid]=sector; placed.push(sector);
  }
  return {out,carp};
}
function pieceDefs(p){ const base=L[p.era].s.map(d=>{const c=[...d]; if(p.mod&&p.mod[c[0]]!==undefined)c[1]=p.mod[c[0]]; return c;}); return [...base,...(p.add||[])]; }
window.ROE_HALL={S,L,PIECES,ringR,layoutSeats,pieceDefs};

// Requiem prototype sound engine — sampled instruments + synthetic concert-hall reverb.
// Samples: MusyngKite soundfont (CC BY-SA 3.0) via gleitz/midi-js-soundfonts. Prototype only;
// production plan swaps in self-hosted multi-velocity VSCO 2 CE (CC0) recordings.
const SF_BASE = 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/';
const NOTE_NAMES = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
export const noteName = m => NOTE_NAMES[m % 12] + (Math.floor(m / 12) - 1);

// friendly id -> GM patch + articulation defaults
export const PATCHES = {
  violin:      { gm: 'violin',             attack: .09, release: .9 },
  viola:       { gm: 'viola',              attack: .1,  release: .9 },
  cello:       { gm: 'cello',              attack: .1,  release: 1.0 },
  bass:        { gm: 'contrabass',         attack: .12, release: 1.0 },
  strings:     { gm: 'string_ensemble_1',  attack: .35, release: 1.6 },
  pizz:        { gm: 'pizzicato_strings',  attack: .005,release: .6 },
  harp:        { gm: 'orchestral_harp',    attack: .005,release: 2.2 },
  flute:       { gm: 'flute',              attack: .06, release: .6 },
  piccolo:     { gm: 'piccolo',            attack: .05, release: .5 },
  recorder:    { gm: 'recorder',           attack: .05, release: .5 },
  oboe:        { gm: 'oboe',               attack: .05, release: .5 },
  englishhorn: { gm: 'english_horn',       attack: .06, release: .6 },
  clarinet:    { gm: 'clarinet',           attack: .05, release: .6 },
  bassoon:     { gm: 'bassoon',            attack: .05, release: .6 },
  horn:        { gm: 'french_horn',        attack: .12, release: 1.0 },
  trumpet:     { gm: 'trumpet',            attack: .03, release: .6 },
  trombone:    { gm: 'trombone',           attack: .06, release: .8 },
  tuba:        { gm: 'tuba',               attack: .08, release: .9 },
  timpani:     { gm: 'timpani',            attack: .002,release: 2.5 },
  harpsichord: { gm: 'harpsichord',        attack: .002,release: .9 },
  organ:       { gm: 'church_organ',       attack: .15, release: 1.8 },
  piano:       { gm: 'acoustic_grand_piano', attack: .002, release: 1.6 },
  celesta:     { gm: 'celesta',            attack: .002,release: 2.0 },
  glock:       { gm: 'glockenspiel',       attack: .002,release: 2.0 },
  lute:        { gm: 'acoustic_guitar_nylon', attack: .003, release: 1.6 },
  choir:       { gm: 'choir_aahs',         attack: .4,  release: 1.8 },
  oohs:        { gm: 'voice_oohs',         attack: .35, release: 1.6 },
  bells:       { gm: 'tubular_bells',      attack: .002,release: 3.0 },
};

class Engine {
  constructor() { this.ctx = null; this.banks = {}; this.decoded = {}; this.loopBuffers = {}; this.listeners = new Set(); this.level = 0; }
  get started() { return !!this.ctx && this.ctx.state === 'running'; }
  async unlock() {
    if (!this.ctx) this._build();
    if (this.ctx.state !== 'running') await this.ctx.resume();
  }
  _build() {
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    this.master = ctx.createGain(); this.master.gain.value = .85;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 18; comp.ratio.value = 3.5; comp.attack.value = .01; comp.release.value = .3;
    this.analyser = ctx.createAnalyser(); this.analyser.fftSize = 1024; this.analyser.smoothingTimeConstant = .82;
    this.master.connect(comp).connect(this.analyser).connect(ctx.destination);
    this.dry = ctx.createGain(); this.dry.gain.value = .78; this.dry.connect(this.master);
    this.verb = ctx.createConvolver(); this.verb.buffer = this._hallIR(3.6);
    this.wet = ctx.createGain(); this.wet.gain.value = .62;
    this.verb.connect(this.wet).connect(this.master);
    this._abuf = new Uint8Array(this.analyser.fftSize);
  }
  // Synthetic hall impulse: early reflections + frequency-dependent exponential tail.
  _hallIR(seconds) {
    const ctx = this.ctx, rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    const ir = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch); let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / rate;
        const env = Math.pow(1 - i / len, 2.2) * Math.exp(-t * 1.25);
        const k = .55 - .45 * Math.min(1, t / seconds * 1.4);   // darker as it decays
        lp += k * ((Math.random() * 2 - 1) - lp);
        d[i] = lp * env * (t < .018 ? 0 : 1);
      }
      [.021, .034, .047, .063, .081, .097].forEach((t, j) => {
        const i = Math.floor((t + ch * .0031 * (j % 3)) * rate); d[i] += (.5 - j * .06) * (Math.random() < .5 ? -1 : 1);
      });
    }
    return ir;
  }
  load(id) {
    const gm = (PATCHES[id] || { gm: id }).gm;
    if (!this.banks[gm]) {
      this.banks[gm] = fetch(SF_BASE + gm + '-mp3.js').then(r => r.text()).then(txt => {
        const map = {}; const re = /"([A-G]b?\d)":\s*"data:audio\/mp3;base64,([^"]+)"/g; let m;
        while ((m = re.exec(txt))) map[m[1]] = m[2];
        return map;
      });
    }
    return this.banks[gm];
  }
  async _buffer(gm, name) {
    const key = gm + ':' + name;
    if (!this.decoded[key]) {
      this.decoded[key] = this.banks[gm].then(map => {
        const b64 = map[name]; if (!b64) throw new Error('missing ' + key);
        const bin = atob(b64), u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        return this.ctx.decodeAudioData(u8.buffer);
      });
    }
    return this.decoded[key];
  }
  _loopBuffer(gm, name, buffer, startFraction = .35, endFraction = .85) {
    const key = `${gm}:${name}:${startFraction}:${endFraction}`;
    if (this.loopBuffers[key]) return this.loopBuffers[key];
    const ctx = this.ctx, start = Math.floor(buffer.length * startFraction);
    const end = Math.floor(buffer.length * endFraction);
    const fadeFrames = Math.min(Math.floor(ctx.sampleRate * .05), Math.floor((end - start) / 4));
    const bodyStart = start + fadeFrames, bodyEnd = end - fadeFrames;
    const bodyFrames = bodyEnd - bodyStart, loopBuffer = ctx.createBuffer(buffer.numberOfChannels, bodyFrames + fadeFrames, buffer.sampleRate);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const source = buffer.getChannelData(ch), target = loopBuffer.getChannelData(ch);
      target.set(source.subarray(bodyStart, bodyEnd));
      for (let i = 0; i < fadeFrames; i++) {
        const t = i / (fadeFrames - 1), angle = t * Math.PI / 2, j = bodyFrames + i;
        target[j] = source[end - fadeFrames + i] * Math.cos(angle) + source[start + i] * Math.sin(angle);
      }
    }
    return this.loopBuffers[key] = { buffer: loopBuffer, start: 0, end: loopBuffer.duration };
  }
  async preload(id, notes) {
    await this.unlock(); await this.load(id);
    const gm = (PATCHES[id] || { gm: id }).gm;
    await Promise.all(notes.map(n => this._buffer(gm, noteName(n)).catch(() => null)));
  }
  // Play a note. voices>1 = section ensemble (slight detune + timing spread).
  async play(id, midi, o = {}) {
    if (!this.ctx) return;
    const p = PATCHES[id] || { gm: id, attack: .05, release: 1 };
    this.load(id);
    const name = noteName(Math.round(midi));
    let buf; try { buf = await this._buffer(p.gm, name); } catch { return; }
    const loop = o.loop ? this._loopBuffer(p.gm, name, buf, o.loopStart ?? .35, o.loopEnd ?? .85) : null;
    const ctx = this.ctx, voices = Math.max(1, Math.min(o.voices || 1, 4));
    const t0 = Math.max(ctx.currentTime + .01, o.when || 0), dur = o.dur ?? 1.2, vel = o.vel ?? .7;
    const attack = o.attack ?? p.attack, release = o.release ?? p.release;
    for (let v = 0; v < voices; v++) {
      const src = ctx.createBufferSource(); src.buffer = loop ? loop.buffer : buf;
      if (loop) { src.loop = true; src.loopStart = loop.start; src.loopEnd = loop.end; }
      src.detune.value = (o.detune || 0) + (voices > 1 ? (v - (voices - 1) / 2) * 7 + (Math.random() - .5) * 5 : 0);
      const g = ctx.createGain(), pan = ctx.createStereoPanner();
      pan.pan.value = Math.max(-1, Math.min(1, (o.pan || 0) + (voices > 1 ? (v / (voices - 1) - .5) * .25 : 0)));
      const ts = t0 + (v ? Math.random() * .03 : 0), peak = vel * vel / Math.sqrt(voices);
      g.gain.setValueAtTime(0, ts);
      g.gain.linearRampToValueAtTime(peak, ts + attack);
      g.gain.setValueAtTime(peak, ts + Math.max(attack, dur));
      g.gain.exponentialRampToValueAtTime(.0001, ts + Math.max(attack, dur) + release);
      src.connect(g).connect(pan); pan.connect(this.dry);
      const send = ctx.createGain(); send.gain.value = o.wet ?? 1; pan.connect(send).connect(this.verb);
      if (loop) src.start(ts, loop.start); else src.start(ts);
      src.stop(ts + Math.max(attack, dur) + release + .05);
    }
    this.listeners.forEach(fn => fn({ id, midi, when: t0, dur, vel, tag: o.tag }));
  }
  onNote(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  rms() {
    if (!this.analyser) return 0;
    this.analyser.getByteTimeDomainData(this._abuf); let s = 0;
    for (let i = 0; i < this._abuf.length; i++) { const v = (this._abuf[i] - 128) / 128; s += v * v; }
    return this.level = this.level * .85 + Math.sqrt(s / this._abuf.length) * .15;
  }
  now() { return this.ctx ? this.ctx.currentTime : 0; }
}
export const sound = new Engine();

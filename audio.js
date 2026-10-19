/* 모아루: 잠든 길의 노래 — sound: small WebAudio synth for effects, cries and original chiptune loops */
'use strict';
(function () {
  const G = window.G;
  const Au = G.audio = { on: true, ctx: null };
  let ctx = null, master = null, musGain = null, sfxGain = null, noiseBuf = null;
  let current = null, timer = null;

  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = Au.ctx = new AC();
    master = ctx.createGain(); master.gain.value = Au.on ? 0.5 : 0; master.connect(ctx.destination);
    musGain = ctx.createGain(); musGain.gain.value = 0.32; musGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.55; sfxGain.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  Au.unlock = () => {
    init();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    if (ctx && Au.pending) { const p = Au.pending; Au.pending = null; Au.music(p); }
  };
  Au.setOn = v => { Au.on = v; if (master) master.gain.value = v ? 0.5 : 0; };

  function tone(f, dur, type, vol, slide, delay, dest) {
    if (!ctx || !Au.on) return;
    const t = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfxGain);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, delay, hp, dest) {
    if (!ctx || !Au.on) return;
    const t = ctx.currentTime + (delay || 0);
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol || 0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || sfxGain);
    s.start(t); s.stop(t + dur + 0.02);
  }

  const SFX = {
    blip: () => tone(1320, 0.04, 'square', 0.12),
    move: () => tone(980, 0.03, 'square', 0.1),
    select: () => { tone(880, 0.05, 'square', 0.16); tone(1320, 0.07, 'square', 0.14, 0, 0.05); },
    cancel: () => { tone(660, 0.05, 'square', 0.14); tone(440, 0.07, 'square', 0.12, 0, 0.05); },
    menu: () => { tone(740, 0.05, 'square', 0.14); tone(988, 0.08, 'square', 0.14, 0, 0.05); },
    bump: () => tone(120, 0.08, 'triangle', 0.35, 80),
    door: () => { noise(0.12, 0.15, 0, 400); tone(220, 0.1, 'triangle', 0.2, 160, 0.05); },
    jump: () => tone(300, 0.18, 'square', 0.14, 700),
    item: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.12, 'square', 0.14, 0, i * 0.08)),
    alert: () => { tone(1568, 0.07, 'square', 0.18); tone(1568, 0.1, 'square', 0.18, 0, 0.1); },
    save: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.1, 'triangle', 0.25, 0, i * 0.07)),
    heal: () => [523, 659, 784].forEach((f, i) => tone(f, 0.16, 'triangle', 0.22, 0, i * 0.09)),
    buy: () => { tone(1047, 0.08, 'square', 0.14); tone(1568, 0.14, 'square', 0.14, 0, 0.08); },
    throw: () => { noise(0.18, 0.12, 0, 2000); tone(500, 0.2, 'triangle', 0.15, 900); },
    pop: () => { tone(220, 0.08, 'square', 0.2, 880); noise(0.08, 0.15, 0.02, 1500); },
    wobble: () => { tone(330, 0.06, 'square', 0.16); tone(262, 0.06, 'square', 0.16, 0, 0.07); },
    caught: () => [659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.08, 'square', 0.16, 0, i * 0.06)),
    run: () => [880, 660, 440].forEach((f, i) => tone(f, 0.06, 'square', 0.12, 0, i * 0.05)),
    hit: () => { noise(0.12, 0.35, 0, 600); tone(160, 0.1, 'square', 0.2, 70); },
    hit2: () => { noise(0.18, 0.45, 0, 400); tone(200, 0.16, 'square', 0.26, 60); tone(120, 0.12, 'sawtooth', 0.18, 50, 0.06); },
    hit0: () => { noise(0.08, 0.2, 0, 1200); tone(240, 0.06, 'square', 0.12, 160); },
    exp: () => tone(600, 0.35, 'square', 0.06, 1400),
    faint: () => tone(440, 0.5, 'square', 0.16, 70),
    buff: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.06, 'triangle', 0.18, 0, i * 0.05)),
    debuff: () => [784, 659, 523, 392].forEach((f, i) => tone(f, 0.06, 'triangle', 0.18, 0, i * 0.05)),
    status: () => { tone(600, 0.25, 'sine', 0.2, 300); tone(900, 0.25, 'sine', 0.12, 450, 0.06); },
    fire: () => { noise(0.4, 0.25, 0, 300); tone(180, 0.3, 'sawtooth', 0.1, 90); },
    water: () => [0, 0.06, 0.12].forEach(d => tone(900 + d * 2000, 0.06, 'sine', 0.22, 400, d)),
    leaf: () => { noise(0.25, 0.2, 0, 3000); tone(1200, 0.08, 'triangle', 0.1, 1800, 0.1); },
    zap: () => { for (let i = 0; i < 5; i++) tone(1800 - i * 200, 0.04, 'sawtooth', 0.12, 300, i * 0.04); noise(0.2, 0.2, 0, 2500); },
    rock: () => { noise(0.3, 0.4, 0, 200); tone(90, 0.25, 'triangle', 0.3, 50); },
    wind: () => noise(0.35, 0.22, 0, 1800),
    bug: () => { for (let i = 0; i < 6; i++) tone(1400, 0.025, 'square', 0.08, 1000, i * 0.035); },
    recall: () => tone(880, 0.15, 'square', 0.14, 220),
    knock: () => { noise(0.05, 0.5, 0, 600); tone(140, 0.12, 'triangle', 0.4, 60); tone(820, 0.04, 'square', 0.12, 500); },
    knock2: () => { noise(0.06, 0.55, 0, 700); tone(190, 0.14, 'triangle', 0.42, 80); tone(1040, 0.05, 'square', 0.14, 620); },
    sparkle: () => [1568, 2093, 2637, 3136].forEach((f, i) => tone(f, 0.07, 'triangle', 0.1, 0, i * 0.04)),
    psy: () => { tone(500, 0.3, 'sine', 0.18, 1200); tone(760, 0.3, 'sine', 0.12, 380, 0.08); },
    dragon: () => { noise(0.3, 0.3, 0, 250); tone(110, 0.35, 'sawtooth', 0.2, 70); tone(165, 0.3, 'square', 0.1, 90, 0.05); }
  };
  Au.sfx = n => { try { SFX[n] && SFX[n](); } catch (e) {} };

  // monster cries: a seeded little chirp per species
  Au.cry = (id, faint) => {
    if (!ctx || !Au.on) return;
    let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const base = 260 + (h % 500), up = 1.2 + ((h >> 4) % 6) / 10, len = 0.22 + ((h >> 8) % 4) * 0.05;
    const k = faint ? 0.6 : 1;
    const type = ['square', 'sawtooth', 'triangle'][(h >> 12) % 3];
    tone(base * k, len * (faint ? 1.6 : 1), type, 0.16, base * up * k);
    tone(base * up * k, len * 0.8 * (faint ? 1.6 : 1), 'square', 0.1, base * 0.7 * k, len * 0.6);
  };

  // ------------------------------------------------------------ jingles
  const NOTE = n => { const m = /^([A-G])(#?)(\d)$/.exec(n); if (!m) return 0; const s = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0); return 440 * Math.pow(2, (s - 9) / 12 + (+m[3] - 4)); };
  const JING = {
    heal: [['C5', .15], ['E5', .15], ['G5', .15], ['C6', .3], ['G5', .15], ['C6', .4]],
    level: [['G5', .1], ['G5', .1], ['G5', .1], ['C6', .35]],
    learn: [['E5', .1], ['G5', .1], ['C6', .3]],
    catch: [['C5', .12], ['G4', .12], ['C5', .12], ['E5', .12], ['G5', .3], ['E5', .12], ['G5', .45]],
    evolve: [['C5', .15], ['E5', .15], ['G5', .15], ['C6', .15], ['E6', .15], ['G6', .5]],
    badge: [['G4', .15], ['C5', .15], ['E5', .15], ['G5', .3], ['E5', .15], ['G5', .3], ['C6', .6]],
    secret: [['A4', .12], ['C5', .12], ['E5', .12], ['D#5', .24], ['B4', .12], ['G#4', .36]]
  };
  Au.jingle = n => {
    if (!ctx || !Au.on || !JING[n]) return;
    duck(true);
    let t = 0;
    for (const [nt, d] of JING[n]) { tone(NOTE(nt), d * 0.95, 'square', 0.16, 0, t); tone(NOTE(nt) / 2, d * 0.95, 'triangle', 0.18, 0, t); t += d; }
    setTimeout(() => duck(false), t * 1000 + 200);
  };
  function duck(on) { if (musGain && ctx) musGain.gain.setTargetAtTime(on ? 0.0001 : 0.32, ctx.currentTime, 0.05); }

  // ------------------------------------------------------------ music: tiny step sequencer (original tunes)
  // each song: bpm, tracks [{type, vol, notes: 'C5:1 E5:1 -:2 ...'}]
  const SONGS = {
    town: { bpm: 104, tracks: [
      { type: 'square', vol: 0.09, notes: 'E5:1 G5:1 A5:1 G5:1 E5:1 D5:1 C5:2 D5:1 E5:1 G5:1 E5:1 D5:4 E5:1 G5:1 A5:1 C6:1 B5:1 A5:1 G5:1 E5:1 D5:1 E5:1 D5:1 B4:1 C5:4' },
      { type: 'triangle', vol: 0.2, notes: 'C3:2 G2:2 A2:2 E2:2 F2:2 C3:2 G2:4 C3:2 E3:2 F3:2 E3:2 F2:2 G2:2 C3:4' }
    ] },
    route: { bpm: 138, tracks: [
      { type: 'square', vol: 0.08, notes: 'G4:.5 C5:.5 E5:.5 G5:.5 F5:1 E5:.5 D5:.5 C5:1 A4:.5 D5:.5 F5:.5 A5:.5 G5:2 E5:.5 G5:.5 C6:.5 B5:.5 A5:1 G5:.5 F5:.5 E5:1 D5:.5 E5:.5 F5:.5 D5:.5 C5:2' },
      { type: 'triangle', vol: 0.2, notes: 'C3:1 G3:1 C3:1 G3:1 D3:1 A3:1 G2:1 D3:1 C3:1 G3:1 A2:1 E3:1 F2:1 G2:1 C3:2' }
    ] },
    battle: { bpm: 160, tracks: [
      { type: 'square', vol: 0.08, notes: 'A4:.5 A4:.5 C5:.5 A4:.5 E5:1 D5:.5 C5:.5 B4:.5 A4:.5 B4:.5 C5:.5 D5:2 F5:.5 F5:.5 E5:.5 D5:.5 C5:1 B4:.5 A4:.5 G4:.5 A4:.5 C5:.5 E5:.5 A5:2' },
      { type: 'triangle', vol: 0.22, notes: 'A2:.5 A3:.5 A2:.5 A3:.5 A2:.5 A3:.5 A2:.5 A3:.5 G2:.5 G3:.5 G2:.5 G3:.5 G2:.5 G3:.5 G2:.5 G3:.5 F2:.5 F3:.5 F2:.5 F3:.5 F2:.5 F3:.5 F2:.5 F3:.5 E2:.5 E3:.5 E2:.5 E3:.5 E2:.5 E3:.5 E2:.5 E3:.5' },
      { type: 'noise', vol: 0.05, notes: 'x:.5 -:.5 x:.5 -:.5 x:.5 -:.5 x:.5 x:.5' }
    ] },
    victory: { bpm: 132, once: true, tracks: [
      { type: 'square', vol: 0.1, notes: 'C5:.5 E5:.5 G5:.5 C6:1.5 A5:.5 B5:.5 C6:2' },
      { type: 'triangle', vol: 0.22, notes: 'C3:1 G2:1 C3:1.5 F3:.5 G3:.5 C3:2' }
    ] },
    shrine: { bpm: 72, tracks: [
      { type: 'triangle', vol: 0.22, notes: 'A4:1 C5:1 D5:1 E5:2 D5:1 C5:1 A4:1 G4:2 A4:2 -:2 E5:1 G5:1 A5:2 G5:1 E5:1 D5:2 C5:1 D5:1 A4:4' },
      { type: 'sine', vol: 0.18, notes: 'A2:4 F2:4 G2:4 A2:4 C3:4 G2:4 F2:4 A2:4' }
    ] },
    evolve: { bpm: 120, tracks: [
      { type: 'square', vol: 0.07, notes: 'C5:.5 E5:.5 G5:.5 E5:.5 D5:.5 F5:.5 A5:.5 F5:.5 E5:.5 G5:.5 B5:.5 G5:.5 F5:.5 A5:.5 C6:.5 A5:.5' },
      { type: 'triangle', vol: 0.2, notes: 'C3:2 D3:2 E3:2 F3:2' }
    ] },
    title: { bpm: 96, tracks: [
      { type: 'square', vol: 0.08, notes: 'E5:1 A5:1 B5:1 C6:2 B5:1 A5:1 E5:1 G5:2 E5:1 D5:1 C5:1 D5:1 E5:4 A5:1 C6:1 D6:1 E6:2 D6:1 C6:1 B5:1 A5:2 G5:1 E5:1 G5:1 B5:1 A5:4' },
      { type: 'triangle', vol: 0.2, notes: 'A2:2 E3:2 F2:2 C3:2 C3:2 G2:2 A2:2 E3:2 F2:2 C3:2 G2:2 D3:2 E2:2 B2:2 A2:4' }
    ] },
    cave: { bpm: 84, tracks: [
      { type: 'triangle', vol: 0.2, notes: 'E4:1 -:1 G4:1 B4:1 -:1 A4:1 E4:2 -:1 D4:1 F4:1 A4:1 -:1 G4:1 D4:2 -:1 C4:1 E4:1 G4:1 -:1 F4:1 B3:2 -:1 E4:1 G4:1 B4:1 A4:2 E4:2' },
      { type: 'sine', vol: 0.2, notes: 'E2:4 C2:4 D2:4 B1:4 A1:4 C2:4 B1:4 E2:4' }
    ] },
    water: { bpm: 112, tracks: [
      { type: 'square', vol: 0.075, notes: 'G5:1 E5:1 D5:1 E5:1 G5:2 A5:1 G5:1 E5:1 D5:1 C5:2 D5:1 E5:1 G5:1 A5:1 C6:1 A5:1 G5:2 E5:1 D5:1 E5:1 C5:3' },
      { type: 'triangle', vol: 0.2, notes: 'C3:2 G2:2 A2:2 E2:2 F2:2 C3:2 G2:2 G2:2 C3:2 G2:2 A2:2 E2:2 F2:2 G2:2 C3:4' }
    ] },
    gym: { bpm: 150, tracks: [
      { type: 'square', vol: 0.08, notes: 'C5:.5 C5:.5 G5:.5 C5:.5 F5:1 E5:.5 D5:.5 C5:.5 D5:.5 E5:.5 G5:.5 A5:1 G5:1 A5:.5 A5:.5 C6:.5 A5:.5 G5:1 F5:.5 E5:.5 D5:.5 E5:.5 F5:.5 D5:.5 C5:2' },
      { type: 'triangle', vol: 0.22, notes: 'C3:1 C3:1 G2:1 G2:1 F2:1 F2:1 G2:1 G2:1 A2:1 A2:1 F2:1 F2:1 G2:1 G2:1 C3:2' },
      { type: 'noise', vol: 0.045, notes: 'x:.5 -:.5 x:.5 x:.5' }
    ] },
    ending: { bpm: 90, tracks: [
      { type: 'square', vol: 0.08, notes: 'C5:1 E5:1 G5:1 C6:2 B5:1 A5:1 G5:1 F5:2 A5:1 G5:1 F5:1 E5:1 D5:4 E5:1 G5:1 C6:1 E6:2 D6:1 C6:1 B5:1 A5:2 F5:1 G5:1 B5:1 D6:1 C6:4' },
      { type: 'triangle', vol: 0.2, notes: 'C3:2 G2:2 F2:2 C3:2 D3:2 A2:2 G2:4 C3:2 E3:2 F2:2 A2:2 G2:2 D3:2 C3:4' }
    ] }
  };
  function parse(str) { return str.trim().split(/\s+/).map(tok => { const [n, d] = tok.split(':'); return [n, parseFloat(d)]; }); }
  Object.values(SONGS).forEach(s => s.tracks.forEach(t => { t.seq = parse(t.notes); t.len = t.seq.reduce((a, b) => a + b[1], 0); }));

  Au.music = name => {
    if (!ctx) { Au.pending = name; return; }
    if (current && current.name === name) return;
    stopMusic();
    const song = SONGS[name];
    if (!song) return;
    const spb = 60 / song.bpm;
    const st = { name, song, start: ctx.currentTime + 0.1, pos: song.tracks.map(() => ({ i: 0, t: 0 })) };
    current = st;
    const gain = ctx.createGain(); gain.gain.value = 1; gain.connect(musGain); st.gain = gain;
    const tick = () => {
      if (current !== st) return;
      const ahead = ctx.currentTime + 0.25;
      song.tracks.forEach((tr, k) => {
        const p = st.pos[k];
        for (;;) {
          const at = st.start + p.t * spb;
          if (at > ahead) break;
          if (song.once && p.t >= tr.len) break;
          const [n, d] = tr.seq[p.i];
          if (n !== '-' && Au.on) {
            const dur = d * spb * 0.92;
            const delay = Math.max(0, at - ctx.currentTime);
            if (tr.type === 'noise') noise(0.05, tr.vol * 2, delay, 5000, gain);
            else tone(NOTE(n), dur, tr.type, tr.vol, 0, delay, gain);
          }
          p.t += d; p.i = (p.i + 1) % tr.seq.length;
        }
      });
    };
    tick();
    timer = setInterval(tick, 60);
  };
  function stopMusic() {
    if (timer) clearInterval(timer);
    timer = null;
    if (current && current.gain) { try { current.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.03); const g = current.gain; setTimeout(() => g.disconnect(), 300); } catch (e) {} }
    current = null;
  }
  Au.stop = stopMusic;
})();

// Chapter-1 play-through bot: drives the real scripts (NPC talks, vines, stones, ferry, gyms) with automatic answers.
// Injected by play.py; exposes window.BOT. Test-only hooks used: G.autoBattle, G.autoLearn.
window.BOT = (() => {
  const B = { log: [], answers: [], errors: [], stats: {} };
  const D = G.data, W = G.world;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  B.sleep = sleep;
  const idle = () => !G.lock && !G.layers.length && G.scene === W.scene && !W.player.mv;
  B.idle = idle;
  B.waitIdle = async (ms = 120000) => {
    const t0 = Date.now();
    await sleep(60);
    while (!idle()) { if (Date.now() - t0 > ms) throw new Error('stuck: ' + JSON.stringify(B.snapshot())); await sleep(40); }
    await sleep(40);
  };
  B.snapshot = () => {
    const L = G.topLayer();
    return { map: W.map && W.map.id, pos: [W.player.x, W.player.y, W.player.dir], lock: G.lock, layers: G.layers.length,
      top: L ? Object.keys(L).slice(0, 8).join(',') : null, text: L && L.pages ? L.pages.flat().join(' ') : null, scene: G.scene === W.scene ? 'world' : 'other' };
  };
  // log every line the game says
  const say0 = G.say;
  G.say = (t, o) => { B.log.push(t); if (B.log.length > 4000) B.log.shift(); return say0(t, o); };
  // the auto presser
  B.tick = setInterval(() => {
    const L = G.topLayer();
    if (!L) { if (G.scene !== W.scene && !G.lock) G.pressed.a = 1; else if (G.scene !== W.scene && B.skipScenes) G.pressed.a = 1; return; }
    if (L.pages) { if (!(L.keep && L.ready && L.page === L.pages.length - 1)) G.pressed.a = 1; return; }
    if (L.swap !== undefined) { const i = B.pickSwap(); L.sel = i < 0 ? 0 : i; G.pressed.a = 1; return; }
    if (typeof L.top === 'number' && L.sel !== undefined) { L.sel = 0; G.pressed.a = 1; return; }
    if (L.sel !== undefined && L.drawBot && !L.drawTop) { L.sel = B.answers.length ? B.answers.shift() : 0; G.pressed.a = 1; return; }
    G.pressed.a = 1;
  }, 35);
  B.skipScenes = true;

  // battle policy: best expected damage; leave when drowsy if someone else can fight
  const val = (p, e, id) => {
    const m = D.MOVES[id];
    if (!m.p) return m.heal && p.hp < D.stats(p).hp * 0.35 ? 70 : 2;
    if (m.dream && e.status !== 'slp') return 0;
    const eff = D.eff(m.t, D.MONS[e.id].t), stab = D.MONS[p.id].t.includes(m.t) ? 1.5 : 1, sp = D.SPECIAL.has(m.t);
    const A = sp ? D.stats(p).spa : D.stats(p).atk, Df = sp ? D.stats(e).spd : D.stats(e).def;
    return m.p * (m.hits || 1) * eff * stab * (m.a ? m.a / 100 : 1) * A / Df;
  };
  // how well a teammate fits the current foe: its best attack, how hard the foe's own types hit it, level and health
  B.matchup = (m, e) => {
    const et = D.MONS[e.id].t, mt = D.MONS[m.id].t;
    const off = Math.max(1, ...m.moves.filter(x => D.MOVES[x.id].p && x.pp > 0).map(x => D.eff(D.MOVES[x.id].t, et) * (mt.includes(D.MOVES[x.id].t) ? 1.5 : 1)));
    const def = Math.max(...et.map(t => D.eff(t, mt)));
    return off / Math.max(0.25, def) + m.lv / 100 + (m.hp / D.stats(m).hp) * 0.3;
  };
  // who to send in after a knockout: the best fit for the foe on the field (the first one standing when unknown)
  B.pickSwap = () => {
    const alive = G.S.party.map((m, i) => [m, i]).filter(([m]) => m.hp > 0);
    if (!alive.length) return 0;
    if (!B.lastFoe) return alive[0][1];
    return alive.sort((a, b) => B.matchup(b[0], B.lastFoe) - B.matchup(a[0], B.lastFoe))[0][1];
  };
  G.autoBattle = (p, e, BT) => {
    B.lastFoe = e;
    const v = BT.pV || {};
    if (v.drowsy) {
      const i = G.S.party.findIndex((m, k) => k !== BT.pi && m.hp > 0);
      if (i >= 0) { B.stats.switches = (B.stats.switches || 0) + 1; return { k: 'switch', i }; }
    }
    let best = -1, bs = -1;
    p.moves.forEach((mv, i) => { if (mv.pp <= 0) return; const s = val(p, e, mv.id); if (s > bs) { bs = s; best = i; } });
    return { k: 'move', i: best };
  };
  G.autoLearn = async (m, mv) => {
    const score = id => { const x = D.MOVES[id]; return x.p ? x.p * (x.hits || 1) * (x.a ? x.a / 100 : 1) * (D.MONS[m.id].t.includes(x.t) ? 1.5 : 1) : (x.heal || x.yawn ? 30 : 12); };
    let wi = 0; m.moves.forEach((x, i) => { if (score(x.id) < score(m.moves[wi].id)) wi = i; });
    if (score(mv) > score(m.moves[wi].id)) m.moves[wi] = { id: mv, pp: D.MOVES[mv].pp };
  };

  // movement and interaction
  B.go = async (map, x, y, dir) => { await B.waitIdle(); W.enter(map, x, y, dir); await B.waitIdle(); };
  B.face = dir => { W.player.dir = dir; };
  B.act = async () => { await B.waitIdle(); G.pressed.a = 1; await sleep(120); await B.waitIdle(); };
  B.talk = async (map, x, y, dir, answers) => { await B.go(map, x, y, dir); if (answers) B.answers = answers.slice(); await B.act(); };
  B.walk = async (dir, n) => {
    for (let i = 0; i < (n || 1); i++) {
      await B.waitIdle();
      W.tryMove(W.player, dir);
      await sleep(30);
      await B.waitIdle();
    }
  };
  B.push = async (dir, n) => B.walk(dir, n);
  B.flag = k => !!G.S.flags[k];
  B.need = (k, why) => { if (!B.flag(k)) { B.errors.push('missing flag ' + k + ' after ' + why); throw new Error('missing flag ' + k + ' after ' + why + ' :: ' + B.log.slice(-6).join(' | ')); } };
  B.starterMon = () => G.S.party.find(m => ['daram', 'bulguri', 'muldal'].includes(D.baseOf(m.id))) || G.S.party[0];
  // grind on a route: always the lowest-level teammate leads, heal when the party gets low (a free center visit)
  B.grind = async (map, zone, target, maxN) => {
    const here = W.map.id, hx = W.player.x, hy = W.player.y;
    await B.go(map, ...B.safeSpot[map]);
    let n = 0;
    while (B.starterMon().lv < target && n < (maxN || 200)) {
      const alive = G.S.party.filter(m => m.hp > 0);
      if (!alive.length || alive.some(m => m.hp < D.stats(m).hp * 0.45)) D.healParty();
      const low = G.S.party.slice().sort((a, b) => a.lv - b.lv)[0];
      const i = G.S.party.indexOf(low); if (i > 0) { G.S.party.splice(i, 1); G.S.party.unshift(low); }
      const enc = D.rollEncounter(map, zone);
      await G.run(() => G.battle.wild(enc));
      await B.waitIdle();
      n++;
    }
    D.healParty();
    B.stats.grind = (B.stats.grind || 0) + n;
    return n;
  };
  B.safeSpot = { route1: [6, 9, 'up'], westpath: [3, 6, 'up'], forest: [11, 22, 'up'], songfield: [8, 8, 'up'], cave1: [8, 12, 'up'], cave2: [8, 9, 'up'], sandwind: [10, 7, 'up'], mistwalk: [12, 20, 'up'], leafshade: [7, 14, 'up'] };
  // a gym leader: retry after more training, up to four tries
  B.gym = async (talk, flagK, grindArgs) => {
    for (let t = 1; t <= 4; t++) {
      D.healParty();
      await talk();
      if (B.flag(flagK)) { B.stats[flagK + '_tries'] = t; B.stats[flagK + '_lv'] = G.S.party.map(m => m.id + ':' + m.lv).join(','); return true; }
      await B.grind(grindArgs[0], grindArgs[1], B.starterMon().lv + 2);
    }
    return false;
  };
  return B;
})();
'bot ready'

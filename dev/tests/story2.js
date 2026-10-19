// The whole of chapter 2 through the real scripts, starting from a finished chapter 1. BOT.run2(starter) -> report
BOT.safeSpot = Object.assign(BOT.safeSpot, { reedford: [2, 12, 'up'], backfield: [10, 9, 'up'], ridge: [8, 29, 'up'], gardenroad: [5, 4, 'up'], greenhouse: [5, 11, 'up'], tn1: [6, 12, 'up'], echohall: [5, 11, 'up'], oldmine: [21, 6, 'up'] });
// breadth-first walk on the current map: avoids people, warps (unless it is the goal) and solid tiles
BOT.path = (tx, ty, opts) => {
  const W = G.world, m = W.map, p = W.player, surf = !!W.surfing;
  const warpAt = (x, y) => (m.def.warps || []).some(w => w.x === x && w.y === y);
  const ok = (x, y) => {
    if (x === tx && y === ty) return m.at(x, y) !== null && (!W.solidAt(x, y) || (surf && m.tile(x, y).water));
    if (m.at(x, y) === null || W.entAt(x, y, p) || warpAt(x, y)) return false;
    const t = m.tile(x, y);
    if (surf) return t.water && !G.field.boulderAt(x, y);
    return !W.solidAt(x, y);
  };
  const key = (x, y) => x + ',' + y, prev = { [key(p.x, p.y)]: null }, q = [[p.x, p.y]];
  const D4 = [['up', 0, -1], ['down', 0, 1], ['left', -1, 0], ['right', 1, 0]];
  while (q.length) {
    const [x, y] = q.shift();
    if (x === tx && y === ty) {
      const out = []; let k = key(x, y);
      while (prev[k]) { out.unshift(prev[k][2]); k = key(prev[k][0], prev[k][1]); }
      return out;
    }
    for (const [d, dx, dy] of D4) { const nx = x + dx, ny = y + dy, k = key(nx, ny); if (k in prev || !ok(nx, ny)) continue; prev[k] = [x, y, d]; q.push([nx, ny]); }
  }
  return null;
};
BOT.walkTo = async (tx, ty, dir) => {
  const B = BOT, W = G.world;
  // a player tops up with potions and berries between fights: heal when someone is below half
  if (G.S.party.some(m => m.hp < G.data.stats(m).hp * 0.5)) { G.data.healParty(); B.stats.topups = (B.stats.topups || 0) + 1; }
  for (let tries = 0; tries < 4; tries++) {
    await B.waitIdle();
    const map0 = W.map.id;
    if (W.player.x === tx && W.player.y === ty) break;
    const path = B.path(tx, ty);
    if (!path) throw new Error(`no path to ${tx},${ty} on ${W.map.id} from ${W.player.x},${W.player.y}`);
    let broke = false;
    for (const d of path) {
      await B.waitIdle();
      if (W.map.id !== map0) { broke = true; break; }
      const x0 = W.player.x, y0 = W.player.y;
      const nb = B.stats.battles || 0;
      W.tryMove(W.player, d);
      await B.sleep(20);
      await B.waitIdle();
      if ((B.stats.battles || 0) !== nb && G.S.party.some(m => m.hp > 0 && m.hp < G.data.stats(m).hp * 0.5)) { G.data.healParty(); B.stats.topups = (B.stats.topups || 0) + 1; }
      if (W.map.id !== map0) { broke = true; break; }
      if (W.player.x === x0 && W.player.y === y0) { broke = true; break; }   // blocked (someone stepped in): plan again
    }
    if (broke && W.map.id !== map0) return;
  }
  await B.waitIdle();
  if (W.player.x !== tx || W.player.y !== ty) throw new Error(`could not reach ${tx},${ty} on ${W.map.id} (at ${W.player.x},${W.player.y})`);
  if (dir) W.player.dir = dir;
};
// talk / interact facing a tile from a walked-to spot
BOT.through = async (x, y, dir) => { const [dx, dy] = G.world.DIRS[dir]; await BOT.walkTo(x - dx, y - dy); G.world.tryMove(G.world.player, dir); await BOT.sleep(20); await BOT.waitIdle(); };
BOT.use = async (x, y, dir, answers) => { await BOT.walkTo(x, y, dir); if (answers) BOT.answers = answers.slice(); await BOT.act(); };
// board the water in front, then steer along a list of directions until the ride ends on land
BOT.ride = async (dirs) => {
  const B = BOT, W = G.world;
  B.answers = [0];
  await B.act();
  if (!W.surfing) throw new Error('could not board at ' + W.map.id + ' ' + W.player.x + ',' + W.player.y + ' :: ' + B.log.slice(-3).join(' | '));
  for (const d of dirs) { await B.waitIdle(); W.tryMove(W.player, d); await B.sleep(20); await B.waitIdle(); }
  await B.waitIdle();
};
// like a player at the center: make sure the lead knows a move of one of the given types (free move review), dropping its weakest move
BOT.coverage = (types) => {
  const D = G.data, m = BOT.starterMon();
  if (m.moves.some(x => D.MOVES[x.id].p && types.includes(D.MOVES[x.id].t))) return;
  const cand = G.field.relearnable(m).filter(id => D.MOVES[id].p && types.includes(D.MOVES[id].t)).sort((a, b) => D.MOVES[b].p - D.MOVES[a].p)[0];
  if (!cand) return;
  const sc = id => { const x = D.MOVES[id]; return x.p ? x.p * (D.MONS[m.id].t.includes(x.t) ? 1.5 : 1) : 10; };
  let wi = 0; m.moves.forEach((x, i) => { if (sc(x.id) < sc(m.moves[wi].id)) wi = i; });
  BOT.stats.relearn = (BOT.stats.relearn || []).concat([D.MOVES[m.moves[wi].id].n + '→' + D.MOVES[cand].n]);
  m.moves[wi] = { id: cand, pp: D.MOVES[cand].pp };
};
// run a stretch again after a blackout (the player wakes at the center): heal, train a little, try again
BOT.retry = async (name, fn, grindArgs, tries) => {
  for (let t = 1; t <= (tries || 4); t++) {
    try { await fn(); return; } catch (e) {
      const map = G.world.map.id;
      if (!/center|home|camptent|shelter|inn/.test(map) || t === (tries || 4)) throw e;
      BOT.stats.retries = (BOT.stats.retries || 0) + 1;
      console.warn('RETRY ' + name + ' after blackout: ' + String(e.message).slice(0, 120));
      G.data.healParty();
      if (grindArgs) await BOT.grind(grindArgs[0], grindArgs[1], BOT.starterMon().lv + 1);
    }
  }
};
// chapter-2 habits shared by the story run and the boss trials: shopping, healing, curing, catching
BOT.policy2 = () => {
  const B = BOT, D = G.data;
  // the chapter-2 shops (STOCK2) sell strong potions and status cures; cubes only when a catch is planned
  B.shop = (ch1) => {
    const want = (B.catchIds ? [['cube', 12, 200]] : []).concat(ch1 ? [] : [['hyperpotion', 3, 1200]], [['superpotion', 5, 700], ['awake', 3, 250], ['antidote', 3, 100], ['parlyz', 2, 200]]);
    // money set aside for planned catches is spent only on cubes
    for (const [id, n, price] of want) while (G.S.money - (id === 'cube' ? 0 : (B.reserve || 0)) >= price && (G.S.bag[id] || 0) < n) { G.S.money -= price; D.addItem(id, 1); B.stats.bought = (B.stats.bought || 0) + 1; }
  };
  if (!B.baseAuto) B.baseAuto = G.autoBattle;
  const baseAuto = B.baseAuto;
  // the most a move can do (top roll, no crit): used to weaken a wild monster without knocking it out
  const maxDmg = (p, e, id) => {
    const m = D.MOVES[id]; if (!m.p) return 0;
    const eff = D.eff(m.t, D.MONS[e.id].t); if (!eff) return 0;
    const sp = D.SPECIAL.has(m.t), A = sp ? D.stats(p).spa : D.stats(p).atk, Df = sp ? D.stats(e).spd : D.stats(e).def;
    return Math.floor((Math.floor(Math.floor(2 * p.lv / 5 + 2) * m.p * A / Df / 50) + 2) * (D.MONS[p.id].t.includes(m.t) ? 1.5 : 1) * eff) * (m.hits || 1);
  };
  G.autoBattle = (p, e, BT) => {
    const st = D.stats(p);
    B.lastFoe = e;
    // training with a team: the lead opens the fight and hands over to a better fit when the foe is too much for it
    // (a newcomer while switch-training, or a type disadvantage) -- both share the experience
    if (BT.wild && B.grinding && !BT.stSwitched && G.S.party.length > 1 && G.S.party[BT.pi] === p) {
      const threat = D.MONS[e.id].t.some(t => D.eff(t, D.MONS[p.id].t) > 1);
      const newcomer = B.switchTrain && p.lv < B.switchTrain;
      if (threat || newcomer) {
        let bi = -1, bs = B.matchup(p, e);
        G.S.party.forEach((m, i) => { if (m !== p && m.hp > 0 && (!newcomer || m.lv >= p.lv + 3)) { const sc = B.matchup(m, e) + (newcomer ? 10 : 0); if (sc > bs) { bs = sc; bi = i; } } });
        if (bi >= 0) { BT.stSwitched = 1; B.stats.trainSwitch = (B.stats.trainSwitch || 0) + 1; return { k: 'switch', i: bi }; }
      }
    }
    // a monster that is wanted on the team: weaken it a little, then throw cubes
    if (BT.wild && B.catchIds && B.catchIds.includes(e.id)) {
      const ball = ['goldcube', 'cube'].find(k => G.S.bag[k] > 0);
      if (ball) {
        const est = D.stats(e);
        let wi = -1, ws = -1;
        if (e.hp > est.hp * 0.6) p.moves.forEach((mv, i) => { const d = maxDmg(p, e, mv.id); if (mv.pp > 0 && d > 0 && d < e.hp - 1 && d > ws) { ws = d; wi = i; } });
        if (wi >= 0) return { k: 'move', i: wi };
        B.stats.throws = (B.stats.throws || 0) + 1;
        return { k: 'ball', id: ball };
      }
    }
    // status cures, as the gym-4 trainers advise (해독제·잠깨는약)
    const cure = { slp: 'awake', psn: 'antidote', par: 'parlyz' }[p.status];
    if (cure && G.S.bag[cure] > 0 && (p.status === 'slp' || p.hp < st.hp * 0.7) && !BT.wild) {
      D.useItem(cure); p.status = null; p.slp = 0; B.stats.cures = (B.stats.cures || 0) + 1; return { k: 'used' };
    }
    // heal when low, or when the foe has just announced its big move and we would not survive it comfortably
    const warned = BT.tgNext && BT.tgNext[e.uid] !== undefined;
    if (p.hp < st.hp * 0.3 || (warned && p.hp < st.hp * 0.7)) {
      const order = st.hp - p.hp > 70 ? ['hyperpotion', 'superpotion', 'berry', 'potion'] : ['superpotion', 'hyperpotion', 'berry', 'potion'];
      const it = order.find(k => G.S.bag[k] > 0);
      if (it) { D.useItem(it); p.hp = Math.min(st.hp, p.hp + D.ITEMS[it].heal); B.stats.potions = (B.stats.potions || 0) + 1; return { k: 'used' }; }
    }
    // on the way (not while training) a player slips away from a wild fight that goes against them
    if (BT.wild && !B.grinding && !BT.noRun) {
      const threat = D.MONS[e.id].t.some(t => D.eff(t, D.MONS[p.id].t) > 1);
      if (threat || p.hp < st.hp * 0.5) { B.stats.ran = (B.stats.ran || 0) + 1; return { k: 'run' }; }
    }
    return baseAuto(p, e, BT);
  };
};
// meet wild monsters on a map until one of the wanted kinds joins the team
BOT.catchMon = async (map, zone, ids, maxN) => {
  const B = BOT, D = G.data;
  const before = G.S.party.length + G.S.box.length;
  B.catchIds = ids; B.shop();
  await B.go(map, ...B.safeSpot[map]);
  let n = 0;
  try {
    while (G.S.party.length + G.S.box.length === before && n < (maxN || 80)) {
      if (G.S.party.some(m => m.hp < D.stats(m).hp * 0.5)) D.healParty();
      const enc = D.rollEncounter(map, zone);
      if (!ids.includes(enc.id)) { n++; continue; }   // walking on through the grass
      if (!G.S.bag.cube && !G.S.bag.goldcube) B.shop();
      if (!G.S.bag.cube && !G.S.bag.goldcube) throw new Error('no cubes and no money for them (' + G.S.money + ')');
      B.grinding = true;
      await G.run(() => G.battle.wild(enc));
      B.grinding = false;
      await B.waitIdle();
      n++;
    }
  } finally { B.catchIds = null; B.grinding = false; }
  const got = G.S.party.length + G.S.box.length > before ? (G.S.party[G.S.party.length - 1] || {}).id : null;
  B.stats.caught = (B.stats.caught || []).concat(got ? [got] : []);
  if (!got) throw new Error('could not catch ' + ids.join('/') + ' on ' + map);
  D.healParty();
  return G.S.party[G.S.party.length - 1];
};
// train until every teammate reaches a level: the lowest one opens each fight and is switched out (교체 육성)
BOT.grindAll = async (map, zone, target, maxN) => {
  const B = BOT, D = G.data;
  B.grinding = true; B.switchTrain = target;
  try {
    await B.go(map, ...B.safeSpot[map]);
    let n = 0;
    while (G.S.party.some(m => m.lv < target) && n < (maxN || 250)) {
      const alive = G.S.party.filter(m => m.hp > 0);
      if (!alive.length || alive.some(m => m.hp < D.stats(m).hp * 0.45)) D.healParty();
      const low = G.S.party.slice().sort((a, b) => a.lv - b.lv)[0];
      const i = G.S.party.indexOf(low); if (i > 0) { G.S.party.splice(i, 1); G.S.party.unshift(low); }
      await G.run(() => G.battle.wild(D.rollEncounter(map, zone)));
      await B.waitIdle();
      n++;
    }
    B.stats.grind = (B.stats.grind || 0) + n;
  } finally { B.grinding = false; B.switchTrain = 0; }
  D.healParty();
};
// put a teammate in front (the order the next battle starts with)
BOT.lead = id => { const i = G.S.party.findIndex(m => m.id === id || G.data.baseOf(m.id) === id); if (i > 0) G.S.party.unshift(G.S.party.splice(i, 1)[0]); };
BOT.run2 = async (starter, opts) => {
  opts = opts || {};
  const B = BOT, D = G.data, W = G.world, F = G.field, R = { starter, steps: [] };
  B.R = R;
  const step = async (name, fn) => { const t0 = Date.now(); console.warn('STEP ' + starter + ' ' + name); await fn(); R.steps.push([name, Math.round((Date.now() - t0) / 100) / 10, G.S.party.map(m => m.id + ':' + m.lv).join(' ')]); };
  const need = (k, why) => B.need(k, why);
  B.policy2();
  if (!B.battle0) { B.battle0 = { w: G.battle.wild, t: G.battle.trainer }; G.battle.wild = async (...a) => { B.stats.battles = (B.stats.battles || 0) + 1; return B.battle0.w(...a); }; G.battle.trainer = async (...a) => { B.stats.battles = (B.stats.battles || 0) + 1; return B.battle0.t(...a); }; }
  if (!B.grind0) { B.grind0 = B.grind; B.grind = async (...a) => { B.grinding = true; try { return await B.grind0(...a); } finally { B.grinding = false; } }; }
  // a finished chapter 1: the evolved starter around Lv.24, the field skills of chapter 1, maps 1-3
  G.titlePick = () => {};                                 // the title screen underneath must not start a new game
  G.layers.length = 0; G.lock = 0;
  G.S = G.newState('한결', 'boy'); G.S.flags.started = 1; G.S.settings.text = 2; G.S.settings.sound = false;
  const mid = { daram: 'daramsup', bulguri: 'hwaguri', muldal: 'padodal' }[starter];
  ['prof_talk', 'rival0', 'q00', 'q01', 'q02', 'q03', 'q04_note', 'badge1', 'q05', 'q06', 'q07', 'q08_workers', 'q08', 'q09_met', 'q09_lab', 'tr_boss', 'q09', 'badge2', 'q10', 'ch1_end',
    'f_vine', 'f_push', 'f_ripple', 'fx_vine', 'fx_push', 'fx_ripple', 'cp_supply'].forEach(k => { G.S.flags[k] = 1; });
  G.S.flags.starter = starter;
  const mon = D.makeMon(mid, opts.lv || 24, { ivMin: 10 });
  mon.field = ['vine', 'push'].concat(F.canLearn(mon, 'ripple') ? ['ripple'] : []);
  G.S.party = [mon];
  if (!F.canLearn(mon, 'ripple')) G.S.loans = { ripple: 'muljjori' };
  ['map01', 'map02', 'map03', 'lamp', 'board', 'rod'].forEach(k => D.addItem(k, 1));
  D.addItem('potion', 3); G.S.money = 6000;
  G.S.visited = { iseul: 1, baram: 1, mulullim: 1, camp: 1 };
  G.startWorld(false);
  await B.waitIdle();
  B.reserve = starter === 'muldal' && !opts.solo ? 2400 : 0;   // the water starter plans two catches (cube money)
  B.shop(true);                                           // stocking up at the 물울림 shop before leaving (chapter-1 stock)
  await B.go('mulullim', 28, 14, 'right');

  await step('Q11 gate+reedford', async () => {
    await B.walkTo(30, 15); await B.through(30, 14, 'up');      // the gate: 소리 hands over the request
    need('q11_start', 'kickoff'); if (!G.S.bag.request) throw new Error('no request letter');
    await B.through(31, 14, 'right'); W.tryMove(W.player, 'right'); await B.waitIdle();
    if (W.map.id !== 'reedford') throw new Error('east gate failed: ' + W.map.id);
    await B.walkTo(7, 8, 'right');
    await B.ride(Array(7).fill('right'));
    if (W.map.id !== 'reedford' || W.player.x !== 15 || W.surfing) throw new Error('channel 1 landing failed at ' + W.player.x + ',' + W.player.y);
    await B.walkTo(22, 10, 'right');
    await B.ride(Array(12).fill('right'));
    if (W.player.x < 34 || W.surfing) throw new Error('channel 2 landing failed at ' + W.player.x + ',' + W.player.y);
    await B.walkTo(43, 10); W.tryMove(W.player, 'right'); await B.waitIdle();
    if (W.map.id !== 'harbor') throw new Error('harbor entry failed: ' + W.map.id);
  });
  await step('Q12 office', async () => {
    B.shop();
    await B.through(20, 12, 'up');
    if (W.map.id !== 'hb_office') throw new Error('office door failed');
    await B.use(3, 4, 'up');
    need('q12', '항만소장'); if (!G.S.bag.map04) throw new Error('no map04');
    await B.through(5, 7, 'down');
  });
  await step('Q13 lighthouse', async () => {
    await B.go('center_h', 6, 4, 'up'); D.healParty();     // a player rests at the center first (and it becomes the return point)
    await B.go('harbor', 40, 8, 'up');
    await B.act();                                         // 세나
    need('q13_start', '세나');
    await B.through(39, 4, 'up');
    if (W.map.id !== 'lh1') throw new Error('lighthouse door failed: ' + W.map.id);
    await B.use(12, 6, 'up');                              // 세나: rest
    for (const x of [15, 5, 10]) await B.use(x, 3, 'up');
    need('lh_power', 'levers');
    await B.walkTo(17, 6); W.tryMove(W.player, 'right'); await B.waitIdle();
    if (W.map.id !== 'lh2') throw new Error('lh2 stairs failed: ' + W.map.id);
    await B.use(14, 3, 'up');                              // 세나: rest
    await B.walkTo(5, 10, 'right'); await B.act();          // the fallen stone: look, then push
    await B.push('right', 5);
    await B.walkTo(11, 11, 'up'); await B.push('up', 7);
    need('lh_slot', 'stone in the seat');
    await B.walkTo(17, 3); W.tryMove(W.player, 'right'); await B.waitIdle();
    if (W.map.id !== 'lh3') throw new Error('lh3 ladder failed: ' + W.map.id);
    await B.use(12, 10, 'up');                             // 세나: rest
    for (let t = 1; t <= 4 && !B.flag('q13'); t++) {
      D.healParty();
      if (W.map.id !== 'lh3') await B.go('lh3', 12, 9, 'up');
      if (!B.flag('lh_axis')) { await B.use(12, 8, 'up', [0]); }
      else { const b = W.npc('lhboss'); if (b) { await B.walkTo(16, 4, 'up'); await B.act(); } }
      if (!B.flag('q13')) { B.stats.lhLoss = (B.stats.lhLoss || 0) + 1; await B.grind('reedford', 1, B.starterMon().lv + 2); }
    }
    need('q13', 'lighthouse');
    if (!G.S.bag.chargestone) throw new Error('no charge stone');
  });
  await step('Q23 rod + Q21 ready', async () => {
    await B.go('harbor', 22, 24, 'down'); await B.walkTo(21, 25, 'right'); await B.act();
    need('q23', 'fishing lesson');
  });
  await step('GYM3', async () => {
    B.shop();
    if (starter === 'muldal' && !opts.solo) {
      // the planned answer to the electric gym for the water starter: a ground partner from the old transport mine
      // (the back-field thicket opens the way), trained until it grows into 터널굽
      await B.go('backfield', 4, 6, 'left'); B.answers = [0]; await B.act();
      await B.catchMon('oldmine', 1, ['heukkori']);
      await B.grindAll('reedford', 1, 26);
    }
    await B.grind('reedford', 1, opts.gym3Lv || 27);
    B.coverage(['땅', '바위', '격투']);
    B.lead('heukkori');
    for (const [x, y, d] of [[9, 14, 'right'], [11, 6, 'right']]) { D.healParty(); await B.talk('gym3', x, y, d); }   // the two gym trainers, rested in between
    D.healParty();
    await B.retry('gym3 switches', async () => {
      await B.go('gym3', 7, 15, 'up');
      await B.use(3, 13, 'up');                            // S1 once (S2 turns along)
      await B.use(11, 9, 'up');                            // S2 once (S3 turns along)
      await B.use(3, 5, 'up'); await B.act();              // S3 twice
      const g = G.world.getMap('gym3'); if (g.at(7, 4) !== 'y' || g.at(7, 8) !== 'y' || g.at(7, 12) !== 'y') throw new Error('gym3 gates still closed');
    }, ['reedford', 1]);
    const ok = await B.gym(async () => { await B.go('gym3', 7, 3, 'up'); await B.use(7, 2, 'up'); }, 'badge3', ['reedford', 1]);
    if (!ok) throw new Error('gym3 not cleared');
    if (!G.S.bag.ticket2) throw new Error('no smash ticket');
  });
  await step('Q15 smash', async () => {
    await B.go('workshop', 6, 4, 'up'); await B.use(6, 3, 'up');
    need('q15_start', 'smash lesson'); need('f_smash', 'smash unlocked');
    await B.through(5, 7, 'down');
    await B.use(26, 13, 'up', [0]); await B.use(29, 13, 'up', [0]);
    need('q15', 'yard rocks'); if (!G.S.bag.map05) throw new Error('no map05');
  });
  await step('Q21 optional (tide + workshop brazier)', async () => {
    await B.go('tidelab', 3, 4, 'up'); await B.act();      // 유라
    need('q21w_start', 'yura');
    await B.go('tidedeck', 3, 7, 'right');
    await B.use(10, 6, 'up'); await B.use(20, 2, 'up'); await B.use(22, 13, 'down');
    if (!G.S.bag.tidelog) throw new Error('no tide log');
    await B.go('tidelab', 3, 4, 'up'); await B.act();
    need('q21w', 'wave stone');
    await B.go('workshop', 6, 4, 'up'); await B.use(6, 3, 'up');   // brazier request
    need('q21f_start', 'brazier request');
  });
  await step('R10 ridge', async () => {
    await B.retry('ridge', async () => {
      await B.go('harbor', 21, 4, 'up');
      if (W.getMap('harbor').at(21, 2) === 'J') await B.use(21, 3, 'up', [0]);   // the fallen rock on the ridge road
      await B.walkTo(21, 0); W.tryMove(W.player, 'up'); await B.waitIdle();
      if (W.map.id !== 'ridge') throw new Error('ridge entry failed: ' + W.map.id);
      if (!B.flag('sh_part')) {
        await B.through(6, 21, 'up');                      // the shelter: heal + brazier part
        if (W.map.id !== 'shelter') throw new Error('shelter failed: ' + W.map.id);
        await B.use(4, 2, 'left');
        if (!G.S.bag.brazierpart) throw new Error('no brazier part');
        await B.through(4, 5, 'down');
      }
      if (W.getMap('ridge').at(18, 9) === 'J') await B.use(18, 10, 'up', [0]);   // the cracked rock in the windy stretch
      await B.through(18, 1, 'up');
      if (W.map.id !== 'tn1') throw new Error('tunnel mouth failed: ' + W.map.id);
    }, ['ridge', 1]);
  });
  if (starter === 'muldal' && !opts.solo) await step('muldal: fire partner', async () => {
    await B.catchMon('ridge', 1, ['bulbari', 'yeoubul']);   // the grass gym's counters, met on the ridge
    B.reserve = 0;
  });
  await step('Q21-F workshop', async () => {
    await B.go('workshop', 4, 2, 'up');
    B.answers = [0, 1, 0]; await B.act();                 // the brazier: three thermometers (open, close, open)
    need('q21f_a', 'workshop brazier');
    const fm = G.S.party.find(x => ['bulbari', 'yeoubul'].includes(x.id));
    if (fm && G.S.bag.firestone && await G.run(() => G.battle.stoneEvolve(fm, 'firestone'))) { D.useItem('firestone'); B.stats.stoneEvo = fm.id; }
  });
  await step('D06 tunnel', async () => {
    B.shop();
    await B.retry('tunnel', async () => {
      if (!B.flag('tn_drain')) {
        await B.go('tn1', 22, 5, 'up'); await B.through(22, 3, 'up');
        if (W.map.id !== 'tn2') throw new Error('tn2 ladder failed: ' + W.map.id);
        if (!G.S.bag.drainpart && !B.flag('tn_part')) { D.healParty(); await B.talk('tn2', 16, 5, 'left'); }   // 두식 -> drain part
        if (!G.S.bag.drainpart && !B.flag('tn_part')) throw new Error('no drain part');
        if (W.getMap('tn2').at(10, 5) === 'J') await B.use(11, 5, 'left', [0]);   // smash the rocks in front of the drain room
        if (!B.flag('tn_part')) { await B.use(7, 3, 'up', [0]); need('tn_part', 'drain part'); }
        await B.use(4, 3, 'up'); need('tn_drain', 'drain');
      }
      if (!B.flag('q16')) {
        await B.go('tn2', 4, 15, 'down'); W.tryMove(W.player, 'down'); await B.waitIdle();
        if (W.map.id !== 'tn3') throw new Error('tn3 ladder failed: ' + W.map.id);
        D.healParty();
        await B.use(10, 8, 'up', [0]); await B.use(16, 13, 'up', [0]); await B.use(20, 8, 'up', [0]);
        need('q16', 'markers'); if (!G.S.bag.oldcopy) throw new Error('no old copy');
      }
      await B.go('tn3', 26, 9, 'right'); await B.through(27, 9, 'right');
      if (W.map.id !== 'memory') throw new Error('tunnel exit failed: ' + W.map.id);
      await B.waitIdle();
      need('q17_start', '해솔'); if (!G.S.bag.compass) throw new Error('no compass');
    }, ['tn1', 1]);
  });
  await step('Q17 echo hall', async () => {
    await B.retry('echo hall', async () => {
      if (!B.flag('q17_marks')) {
        await B.go('memory', 25, 14, 'up'); await B.through(25, 13, 'up');
        if (W.map.id !== 'echohall') throw new Error('echo hall door failed: ' + W.map.id);
        if (!B.flag('eh_m1')) await B.use(5, 4, 'up');
        if (!B.flag('eh_m2')) await B.use(13, 3, 'up');
        if (!B.flag('eh_m3')) await B.use(22, 4, 'up');
        need('q17_marks', 'markers');
        await B.through(13, 17, 'down');
      }
      if (!B.flag('q17')) { await B.go('memory', 24, 16, 'up'); await B.use(24, 15, 'up'); }
      need('q17', '해솔 restores the map'); if (!G.S.bag.map06) throw new Error('no map06');
      await B.go('memory', 16, 2, 'up'); await B.walkTo(16, 0); W.tryMove(W.player, 'up'); await B.waitIdle();
      if (W.map.id !== 'gardenroad') throw new Error('north walk failed: ' + W.map.id);
    }, ['echohall', 1]);
  });
  await step('R11 garden road + brazier', async () => {
    await B.retry('garden road', async () => {
      if (W.map.id !== 'gardenroad') await B.go('gardenroad', 19, 14, 'up');
      if (!B.flag('gr_part')) { await B.walkTo(6, 9, 'up'); await B.act(); }   // the dropped brazier part on the road
      if (!B.flag('q21f_b')) await B.use(24, 12, 'up');                      // the public brazier: second fire stone
      need('q21f_b', 'garden brazier');
      await B.walkTo(39, 8); W.tryMove(W.player, 'right'); await B.waitIdle();
      if (W.map.id !== 'leafhyang') throw new Error('leafhyang entry failed: ' + W.map.id);
    }, ['gardenroad', 1]);
  });
  await step('Q22 resonance class', async () => {
    await B.go('leafhyang', 5, 26, 'up'); await B.through(5, 25, 'up');
    if (W.map.id !== 'reslab') throw new Error('reslab door failed: ' + W.map.id);
    await B.use(6, 5, 'up');                               // 온결: the class
    await B.use(2, 2, 'up', [0]); await B.use(6, 2, 'up', [0]); await B.use(10, 2, 'up', [0]);
    await B.use(6, 5, 'up');
    need('q22', 'resonance license');
    await B.through(5, 7, 'down');
  });
  await step('Q18 greenhouse', async () => {
    B.shop();
    await B.retry('greenhouse', async () => {
      if (!B.flag('q18_brief')) { await B.go('leafhyang', 10, 9, 'right'); await B.act(); }   // 미루
      need('q18_brief', 'brief'); if (!G.S.bag.map07) throw new Error('no map07');
      if (!B.flag('q18_valves')) {
        await B.go('leafhyang', 8, 9, 'up'); await B.through(8, 8, 'up');
        if (W.map.id !== 'greenhouse') throw new Error('greenhouse door failed: ' + W.map.id);
        await B.use(15, 19, 'right');                      // rest point
        await B.walkTo(14, 15, 'up'); await B.ride(['up', 'up']);
        if (W.player.y !== 12 || W.surfing) throw new Error('channel crossing failed at ' + W.player.x + ',' + W.player.y);
        if (W.getMap('greenhouse').at(8, 9) === 'V') await B.use(9, 9, 'left', [0]);
        if (W.getMap('greenhouse').at(18, 9) === 'V') await B.use(17, 9, 'right', [0]);
        for (const [x, y] of [[13, 8], [22, 8], [4, 8]].slice(G.S.flags.gh_seq | 0)) await B.use(x, y, 'up', [0]);
        need('q18_valves', 'valves');
      }
      if (!B.flag('tr_ghboss')) { D.healParty(); await B.talk('greenhouse', 24, 5, 'right'); }
      need('tr_ghboss', 'greenhouse supervisor');
      if (!B.flag('q18')) await B.talk('greenhouse', 27, 4, 'up', [0]);
      need('q18', 'tank'); if (!G.S.bag.leafstone) throw new Error('no leaf stone');
      if (!B.flag('q21w2')) await B.talk('greenhouse', 24, 15, 'up');   // the second wave stone (after Q21-W)
      need('q21w2', 'greenhouse gauge');
    }, ['greenhouse', 1]);
  });
  await step('GYM4', async () => {
    B.shop();
    await B.grind('greenhouse', 1, opts.gym4Lv || 34);
    B.coverage(['불', '비행', '에스퍼', '얼음']);
    for (const id of ['bulbari', 'yeoubul']) B.lead(id);
    for (const [x, y, d] of [[7, 10, 'left'], [7, 5, 'right']]) { D.healParty(); await B.talk('gym4', x, y, d); }
    D.healParty();
    const ok = await B.gym(async () => { await B.go('gym4', 7, 13, 'up'); await B.use(7, 2, 'up'); }, 'badge4', ['greenhouse', 1]);
    if (!ok) throw new Error('gym4 not cleared');
    if (!G.S.bag.recommend2) throw new Error('no recommendation');
  });
  await step('Q20 surf', async () => {
    await B.go('leafhyang', 18, 13, 'up'); B.answers = [0]; await B.act();   // union coach -> 돛바람항
    if (W.map.id !== 'harbor') throw new Error('coach failed: ' + W.map.id);
    await B.through(25, 19, 'up');
    if (W.map.id !== 'school') throw new Error('school door failed: ' + W.map.id);
    await B.use(8, 3, 'up');
    need('q20_ready', 'surf lesson'); need('f_surf', 'surf');
    await B.through(5, 7, 'down');
    await B.walkTo(31, 26, 'down');
    await B.ride(['right', 'right', 'down', 'right', 'right', 'right', 'up', 'right', 'right', 'down', 'down', 'right', 'up', 'right']);
    need('q20', 'pool course'); if (!G.S.bag.map08) throw new Error('no map08');
  });
  await step('R12 sea route', async () => {
    B.shop();
    await B.retry('sea route', async () => {
      await B.go('harbor', 22, 25, 'down');
      await B.ride(['down', 'down', 'down', 'down', 'down', 'down', 'down']);
      if (W.map.id !== 'searoute') throw new Error('sea route failed: ' + W.map.id + ' ' + W.player.x + ',' + W.player.y);
      await B.walkTo(23, 9);
      W.tryMove(W.player, 'right'); await B.waitIdle();       // land on the far dock
      await B.walkTo(25, 9);
      await B.waitIdle(600000);
      need('ch2_end', 'far shore');
    }, null);
  });
  await step('optional: old mine + slips', async () => {
    await B.go('backfield', 4, 6, 'left'); B.answers = [0]; await B.act();   // the thicket
    for (const [x, y] of [[7, 12], [19, 4], [29, 12]]) { await B.go('backfield', x, y + 1, 'up'); await B.act(); }
    if ((G.S.bag.slip || 0) < 3) throw new Error('slips missing: ' + G.S.bag.slip);
    await B.go('backfield', 3, 6, 'left'); W.tryMove(W.player, 'left'); await B.waitIdle();
    if (W.map.id !== 'oldmine') throw new Error('mine entry failed: ' + W.map.id);
    await B.use(19, 7, 'down');                            // J1 lever -> north
    await B.use(18, 4, 'right');                           // J2 lever -> west (store)
    await B.use(26, 7, 'up', [0]);                         // start the cart
    if (G.S.flags.om_cart !== 'store') throw new Error('cart did not reach the store: ' + JSON.stringify([G.S.flags.om_j1, G.S.flags.om_j2]));
    await B.use(3, 3, 'up'); await B.use(4, 3, 'down');    // the store room: material pack and the rock textbook
    if (!G.S.bag.tm_slide || !G.S.bag.matpack) throw new Error('store items missing');
    await B.use(4, 11, 'up');                              // the gate lever (powered since Q13)
    need('mine_short', 'gate');
    await B.through(0, 11, 'left');
    if (W.map.id !== 'camp') throw new Error('shortcut failed: ' + W.map.id);
    await B.go('hb_office', 3, 4, 'up'); await B.act();
    need('q_slips', 'slips returned');
    await B.go('workshop', 6, 3, 'up'); await B.act();     // material pack thanks
    if (G.S.bag.matpack) throw new Error('material pack not taken');
  });
  R.flags = Object.keys(G.S.flags).length;
  R.maps = Object.keys(G.S.bag).filter(k => D.ITEMS[k] && D.ITEMS[k].map);
  R.stones = ['moonstone', 'chargestone', 'leafstone', 'firestone', 'wavestone'].map(k => k + ':' + (G.S.bag[k] || 0)).join(' ');
  R.party = G.S.party.map(m => `${m.id}:${m.lv}:${m.moves.map(x => x.id).join('/')}`);
  R.loans = G.S.loans;
  R.stats = B.stats;
  R.explored = Object.fromEntries(['harbor', 'reedford', 'tn2', 'memory', 'leafhyang', 'greenhouse'].map(id => [id, Math.round(G.field.exploredShare(id) * 100)]));
  R.errors = B.errors;
  console.warn('REPORT ' + JSON.stringify(R));
  return R;
};
'story2 ready'

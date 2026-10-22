// Chapter-3 checks that the story run does not reach on its own: evolutions and the dex, riding state (board / current / sea /
// falls) through menus, the save code, rescue and blackout, puzzle state through save / reset / blackout, loans in the dex.
// Needs bot.js + story2.js + story3.js. window.U3(saveJSON) -> { pass: [...], fail: [...] }
window.U3 = async (save, only) => {
  const B = BOT, D = G.data, W = G.world, F = G.field, H = G.mapHelpers;
  const R = { pass: [], fail: [] };
  const ok = (c, name, info) => { (c ? R.pass : R.fail).push(name + (info !== undefined ? ' :: ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); return c; };
  const settle = async () => { await B.waitIdle(); await B.sleep(60); await B.waitIdle(); };
  const T = async (name, fn) => {
    if (only && !only.includes(name)) return;
    console.warn('U3 ' + name);
    try { await fn(); } catch (e) { R.fail.push(name + ' :: EXC ' + String(e && e.message || e).slice(0, 240)); }
    try { await B.waitIdle(30000); } catch (e) { R.fail.push(name + ' :: stuck after the test'); }
    G.layers.length = 0; G.lock = 0;
  };
  const load = async (tweak) => {
    G.titlePick = () => {}; G.layers.length = 0; G.lock = 0;
    G.S = G.normalize(JSON.parse(save)); G.S.settings.text = 2; G.S.settings.sound = false;
    if (tweak) tweak(G.S, G.S.flags);
    G.startWorld(true); await settle();
  };
  const at = () => [W.map.id, W.player.x, W.player.y];
  const step = async dir => { W.tryMove(W.player, dir); await B.sleep(30); await settle(); };
  const lastSaid = () => B.log.slice(-3).join(' | ');
  B.policy2();
  B.shop = () => {};
  // a key queue in front of the bot's auto presser: real menu navigation (A to pick, B to back out) without it wandering off
  B.keys = [];
  if (!B.tick0) {
    B.tick0 = B.tick; clearInterval(B.tick);
    const auto = () => {
      const L = G.topLayer();
      if (!L) { if (G.scene !== W.scene && (!G.lock || B.skipScenes)) G.pressed.a = 1; return; }
      if (L.pages) { if (!(L.keep && L.ready && L.page === L.pages.length - 1)) G.pressed.a = 1; return; }
      if (L.swap !== undefined) { const i = B.pickSwap(); L.sel = i < 0 ? 0 : i; G.pressed.a = 1; return; }
      if (typeof L.top === 'number' && L.sel !== undefined) { L.sel = 0; G.pressed.a = 1; return; }
      if (L.sel !== undefined && L.drawBot && !L.drawTop) { L.sel = B.answers.length ? B.answers.shift() : 0; G.pressed.a = 1; return; }
      G.pressed.a = 1;
    };
    B.tick = setInterval(() => {
      if (B.keys.length) { if (G.topLayer()) G.pressed[B.keys.shift()] = 1; return; }
      auto();
    }, 35);
  }
  // open the pause menu on one entry, then back out with B
  const menuVisit = async (key, backs) => {
    const cave = F.inCave(), keys = ['dex', 'party', 'bag', 'note', 'map', 'save', 'set'].concat(cave ? ['rescue'] : []).concat(['close']);
    G.menus._startSel = keys.indexOf(key);
    B.keys = ['a'].concat(Array(backs === undefined ? 4 : backs).fill('b'));
    const t0 = Date.now(); let fin = false;
    G.run(() => G.menus.start()).then(() => { fin = true; });
    while (!(fin && !G.topLayer()) && Date.now() - t0 < 8000) await B.sleep(40);
    if (!fin) R.fail.push('menu > ' + key + ' did not close');
    B.keys = []; G.layers.length = 0; G.lock = 0;
    await settle();
  };
  const CH3 = f => { ['q24_start', 'q24', 'q25_start', 'q25', 'q26_start', 'q26', 'q27', 'badge5', 'q28', 'q29_start'].forEach(k => { f[k] = 1; }); };

  // ---------------------------------------------------------------- evolutions of the new families + dex registration
  await T('evolutions', async () => {
    await load();
    const cases = [['pomal', 33, 'haepum'], ['chalkakge', 31, 'jebangjipge'], ['silhaema', 39, 'haeryonggyeol'], ['jindeugi', 37, 'hoesureong'], ['huugi', 34, 'hwangidung']];
    for (const [id, lv, to] of cases) {
      const m = D.makeMon(id, lv); G.S.party.push(m); D.caught(id);
      ok(!G.S.dex.caught[to], 'before: ' + to + ' not in the dex');
      await G.run(() => G.battle.feedLevel(m)); await settle();
      ok(m.id === to && m.lv === lv + 1, `level evolution ${id} Lv.${lv + 1} -> ${to}`, [m.id, m.lv]);
      ok(!!G.S.dex.caught[to], 'after: ' + to + ' registered as caught');
      G.S.party.pop();
    }
    const k = D.makeMon('moraekkom', 30); G.S.party.push(k); D.caught('moraekkom');
    const r = await G.battle.stoneEvolve(k, 'wavestone'); await settle();
    ok(r && k.id === 'borupae', 'wavestone evolution moraekkom -> borupae', k.id);
    ok(!!G.S.dex.caught.borupae, 'borupae registered');
    G.S.party.pop();
  });

  // ---------------------------------------------------------------- loans never count as caught
  await T('loans and the dex', async () => {
    await load(S => { delete S.dex.caught.haepum; delete S.dex.seen.haepum; delete S.dex.caught.sanbatgom; });
    const before = D.dexCount();
    const lead = await G.run(() => H.teachOrLend('current', 'haepum', '교관 여민')); await settle();
    ok(G.S.loans.current === 'haepum', 'grass starter gets 지원 해품범 for 급류타기', G.S.loans);
    ok(!G.S.dex.caught.haepum && !G.S.dex.seen.haepum && D.dexCount() === before, 'the loan is not registered in the dex', [G.S.dex.caught.haepum, G.S.dex.seen.haepum]);
    await G.run(() => H.teachOrLend('haul', 'sanbatgom', '적재원 도담')); await settle();
    ok(G.S.party[0].field.includes('haul') && !(G.S.loans || {}).haul, 'sumaek learns 괴력운반 itself (no loan)', [G.S.party[0].field, G.S.loans]);
  });

  // ---------------------------------------------------------------- riding: board, current bands, menus, save code, falls, sea
  await T('riding state', async () => {
    await load(S => { CH3(S.flags); S.flags.f_current = 1; S.bag.bridle = 1; S.loans.current = 'haepum'; S.visited = Object.assign(S.visited || {}, { m07: 1 }); });
    await B.go('m07', 26, 7, 'up');
    await B.board();
    ok(W.surfing && W.surfing.current && W.surfing.id === 'haepum', 'boards the pool with the current helper', W.surfing);
    await step('up');
    ok(W.player.y === 5 && W.surfing, 'crosses into the marked current band', at());
    // menus and the map while riding
    const pos = at().join();
    for (const k of ['map', 'note', 'party', 'bag', 'dex']) {
      await menuVisit(k, 5);
      ok(W.surfing && W.surfing.current && at().join() === pos, `menu > ${k} while riding keeps the ride and the spot`, [W.surfing, at()]);
    }
    await B.reload();
    ok(W.surfing && W.surfing.current && at().join() === pos, 'save code round trip keeps the ride (current) and the spot', [W.surfing, at()]);
    // a support call from the box: a boxed companion who knows 급류타기 carries the board, the party lead stays behind
    await load(S => { CH3(S.flags); S.flags.f_current = 1; S.bag.bridle = 1; delete S.loans.current; S.visited = Object.assign(S.visited || {}, { m07: 1 });
      const bx = D.makeMon('haepum', 40); bx.field = ['current']; S.box = (S.box || []).concat([bx]); });
    await B.go('m07', 26, 7, 'up'); await B.board();
    ok(W.surfing && W.surfing.current && W.surfing.id === 'haepum' && F.actor('current').where === 'box', 'support call: the boxed 해품범 carries the current board', [W.surfing, F.actor('current') && F.actor('current').where]);
    await step('up'); await step('up'); await step('up'); await step('up'); await step('up');
    await menuVisit('map', 5); await B.reload();
    ok(W.surfing && W.surfing.id === 'haepum' && W.player.y === 1, 'support-call ride survives the map and the save code', [W.surfing, at()]);
    await step('right'); await step('right'); await step('right'); await step('right'); await step('right'); await step('right');
    ok(!W.surfing && W.player.x === 32 && !W.follower.hidden, 'landing on the far plank ends the ride, the party lead follows again', [at(), W.follower.hidden]);
    // without 급류타기 the band stops a plain board
    await load(S => { CH3(S.flags); S.visited = Object.assign(S.visited || {}, { m07: 1 }); });
    await B.go('m07', 26, 7, 'up'); await B.board();
    ok(W.surfing && !W.surfing.current, 'plain board before Q29', W.surfing);
    await step('up');
    ok(W.player.y === 6 && /급류|물살/.test(lastSaid()), 'a plain board stops at the current band with the lesson hint', [at(), lastSaid()]);
    // falls on the river: never passable
    await load(S => { CH3(S.flags); S.flags.f_current = 1; S.bag.bridle = 1; S.loans.current = 'haepum'; S.flags.q29 = 1; S.flags.q30_start = 1; });
    await B.go('r15', 13, 7, 'left'); await B.board();
    await B.walkTo(9, 4);
    await step('up');
    ok(W.player.y === 4 && W.surfing && /폭포/.test(lastSaid()), 'the falls stop the board (폭포 is not a current)', [at(), lastSaid()]);
    // sea tiles need the sea board, not the river board
    const t = W.map.tile(9, 4);
    ok(!t.sea, 'river water is not sea');
  });

  // ---------------------------------------------------------------- rescue and blackout while riding
  await T('rescue and blackout on the water', async () => {
    await load(S => { CH3(S.flags); S.visited = Object.assign(S.visited || {}, { m07: 1 }); });
    await B.go('r13', 17, 18, 'left'); await B.board();
    await step('left'); await step('left');
    ok(W.surfing && W.surfing.sea, 'riding the sea lane on r13', [W.surfing, at()]);
    if (F.rescue) { G.run(() => F.rescue(false)); await settle(); }
    ok(!W.surfing && !W.map.tile(W.player.x, W.player.y).water, 'water rescue lands the player and ends the ride', [W.surfing, at()]);
    ok(!W.follower.hidden || !G.S.party.some(m => m.hp > 0), 'the follower is back on land after the rescue', W.follower.hidden);
    // blackout while riding: wake at the heal point, no ride, follower placed
    await B.go('r13', 17, 18, 'left'); await B.board(); await step('left');
    G.S.party.forEach(m => { m.hp = 1; });
    B.grinding = false;
    G.autoBattle0 = G.autoBattle; G.autoBattle = (p, e, BT) => ({ k: 'move', i: 0 });
    await G.run(() => G.battle.wild({ id: 'chalkakge', lv: 60 })); await settle();
    G.autoBattle = G.autoBattle0;
    ok(!W.surfing && W.map.id !== 'r13', 'blackout on the sea wakes at the heal point without a ride', [W.surfing, at()]);
    ok(G.S.party.every(m => m.hp > 0), 'party healed after the blackout');
    ok(!W.follower.hidden, 'follower placed after the blackout');
  });

  // ---------------------------------------------------------------- puzzle state: save code, reset tablet, blackout
  await T('nw2 seat stones', async () => {
    await load(S => { CH3(S.flags); delete S.flags.q25; delete S.flags.q26_start; delete S.flags.q26; delete S.flags.q27; delete S.flags.badge5; delete S.flags.q28; delete S.flags.q29_start; S.boulders = S.boulders || {}; delete S.boulders.nw2; });
    await B.go('nw2', 11, 6, 'right'); B.answers = [0]; await B.act(); await B.push('right', 1);
    ok(!!F.sunkAt('nw2', 'nb1'), 'nb1 pushed into its seat');
    await B.walkTo(8, 11, 'up'); B.answers = [0]; await B.act(); await B.push('up', 2);
    const mid = JSON.stringify(G.S.boulders.nw2);
    await B.reload();
    ok(JSON.stringify(G.S.boulders.nw2) === mid && !!F.sunkAt('nw2', 'nb1'), 'half-pushed nb2 and seated nb1 survive the save code', G.S.boulders.nw2);
    await B.walkTo(10, 15, 'right'); B.answers = [0]; await B.act();
    ok(!!F.sunkAt('nw2', 'nb1') && F.boulderAt(8, 10), 'reset tablet: the seated stone stays, the loose one returns', G.S.boulders.nw2);
    await B.walkTo(8, 11, 'up'); if (!W.pushActive) { B.answers = [0]; await B.act(); }
    await B.push('up', 4); await B.walkTo(7, 6, 'right'); await B.push('right', 6);
    ok(!!F.sunkAt('nw2', 'nb2'), 'nb2 seated after the reset');
    await B.walkTo(22, 3, 'up'); B.answers = [0]; await B.act();
    ok(B.flag('q25'), 'lever pulled (Q25)');
    const tiles = JSON.stringify(G.S.tiles.nw3 || {});
    await B.walkTo(22, 3, 'up'); B.answers = [0]; await B.act();
    ok(JSON.stringify(G.S.tiles.nw3 || {}) === tiles, 'pulling the lever again changes nothing');
    await B.reload();
    ok(W.getMap('nw3').at(11, 7) === 'd', 'the pier planks stay down after reload', W.getMap('nw3').at(11, 7));
  });

  await T('d11b rail supports + blackout mid-puzzle', async () => {
    await load(S => { CH3(S.flags); ['q29', 'q30_start', 'q30', 'q31_start', 'f_current'].forEach(k => { S.flags[k] = 1; }); S.bag.permit11 = 1; S.boulders = S.boulders || {}; delete S.boulders.d11b; S.healPoint = { map: 'center_db', x: 5, y: 5, dir: 'up' }; });
    await B.go('d11b', 4, 9, 'up'); B.answers = [0]; await B.act(); await B.push('up', 2);
    const mid = JSON.stringify(G.S.boulders.d11b);
    // a lost battle in the middle: the stones stay where they are, the player wakes at the center
    G.S.party.forEach(m => { m.hp = 1; });
    G.autoBattle0 = G.autoBattle; G.autoBattle = () => ({ k: 'move', i: 0 });
    await G.run(() => G.battle.wild({ id: 'gwibami', lv: 70 })); await settle();   // a flyer: the lead's 대지흔들기 cannot knock it out first
    G.autoBattle = G.autoBattle0;
    ok(W.map.id === 'center_db', 'blackout wakes at 돌바퀴 center', at());
    ok(JSON.stringify(G.S.boulders.d11b) === mid, 'the half-pushed support stone kept its place', G.S.boulders.d11b);
    ok(!W.follower.hidden, 'the follower walks again after the blackout');
    await B.go('d11b', 4, 7, 'up'); if (!W.pushActive) { B.answers = [0]; await B.act(); }
    await B.push('up', 1);
    await B.walkTo(3, 5, 'right'); await B.push('right', 4);
    ok(!!F.sunkAt('d11b', 'ra'), 'ra seated after the blackout');
    await B.walkTo(27, 8, 'up'); B.answers = [0]; await B.act();
    ok(!!F.sunkAt('d11b', 'ra') && !B.flag('q31_track'), 'reset keeps the seated stone, the track still needs rb');
  });

  await T('haul yard: undo, save code, lock', async () => {
    await load(S => { CH3(S.flags); ['q29', 'q30_start', 'q30', 'q31_start', 'q31', 'badge6', 'q32', 'f_current', 'q33_start', 'f_haul'].forEach(k => { S.flags[k] = 1; }); S.bag.harness = 1; S.party[0].field = (S.party[0].field || []).concat(['haul']); delete S.hauls; });
    await B.go('m09', 13, 25, 'left'); B.answers = [0]; await B.act();
    ok(F.hauled('m09', 'yard') && B.flag('q33_lesson1'), 'practice stone carried to its seat');
    await B.reload();
    ok(F.hauled('m09', 'yard') && W.getMap('m09').at(16, 25) === '%', 'the carried stone stays after the save code', W.getMap('m09').at(16, 25));
    await B.walkTo(15, 25, 'right'); B.answers = [0]; await B.act();
    ok(!F.hauled('m09', 'yard') && B.flag('q33_lesson') && W.getMap('m09').at(12, 25) === 'Q', 'undo at the seat puts it back and finishes the lesson', [W.getMap('m09').at(12, 25), B.flag('q33_lesson')]);
    await B.walkTo(31, 3, 'up'); B.answers = [0]; await B.act();
    ok(B.flag('q33') && F.hauled('m09', 'north'), 'north stone carried (Q33)');
    await B.walkTo(28, 4, 'up'); B.answers = [0]; await B.act();
    ok(F.hauled('m09', 'north'), 'the north stone is locked in place after Q33 (no undo)');
  });

  await T('rescue from the pause menu while riding', async () => {
    await load(S => { CH3(S.flags); S.visited = Object.assign(S.visited || {}, { m07: 1 }); });
    await B.go('r13', 17, 18, 'left'); await B.board(); await step('left');
    ok(W.surfing && W.surfing.sea, 'on the sea lane');
    B.answers = [0];
    await menuVisit('rescue', 0);
    await settle();
    ok(!W.surfing && W.map.tile(W.player.x, W.player.y) && !W.map.tile(W.player.x, W.player.y).water, 'menu > 구조 요청 on the water brings the player ashore', [W.surfing, at(), F.inCave(), B.log.slice(-4)]);
  });

  await T('gym6 scale reset', async () => {
    await load(S => { CH3(S.flags); ['q29', 'q30_start', 'q30', 'q31_start', 'q31', 'f_current'].forEach(k => { S.flags[k] = 1; }); S.boulders = S.boulders || {}; delete S.boulders.gym6; delete S.flags.g6_open; });
    G.S.flags.tr_g6a = 1; G.S.flags.tr_g6b = 1;
    await B.go('gym6', 9, 11, 'up'); B.answers = [0]; await B.act(); await B.push('up', 3);
    const s1 = JSON.stringify(G.S.boulders.gym6);
    await B.walkTo(14, 14, 'up'); B.answers = [0]; await B.act();
    ok(JSON.stringify(G.S.boulders.gym6 || {}) !== s1 && !B.flag('g6_open'), 'scale reset returns a placed weight', G.S.boulders.gym6);
    await B.walkTo(9, 11, 'up'); B.answers = [0]; await B.act(); await B.push('up', 3);
    await B.walkTo(13, 10, 'left'); await B.push('left', 1); await B.walkTo(11, 11, 'up'); await B.push('up', 3);
    ok(B.flag('g6_open'), 'scale balanced (3 + 2)');
    await B.walkTo(14, 14, 'up'); B.answers = [0]; await B.act();
    ok(B.flag('g6_open') && !W.solidAt(7, 4), 'a reset after balancing keeps the leader door open');
  });

  // ---------------------------------------------------------------- free transport and the rescue islet
  await T('islet rescuer, ferry and shuttle', async () => {
    await load(S => { CH3(S.flags); S.visited = Object.assign(S.visited || {}, { m07: 1, m08: 1, m09: 1, harbor: 1 }); });
    G.S.party.forEach(m => { m.hp = 1; });
    await B.go('r13', 6, 9, 'left'); B.answers = [0]; await B.act(); await settle();
    ok(G.S.party.every(m => m.hp === D.stats(m).hp) && W.map.id === 'm07', 'R13 islet rescuer heals and boats the player to 해무나루', at());
    await B.go('m07', 37, 22, 'right'); B.answers = [0]; await B.act(); await settle();
    ok(W.map.id === 'm08', 'ferry 해무나루 → 푸른숨시 (first stop on the list)', at());
    G.S.flags.q31 = 1;
    await B.go('m08', 40, 19, 'right'); B.answers = [0]; await B.act(); await settle();
    ok(W.map.id === 'm09', 'shuttle 푸른숨시 → 돌바퀴시', at());
    await B.go('m09', 41, 16, 'right'); B.answers = [0]; await B.act(); await settle();
    ok(W.map.id === 'm08', 'shuttle 돌바퀴시 → 푸른숨시', at());
  });

  // ---------------------------------------------------------------- optional haul stones (R16 store / bank, R17 ridge) and their pockets
  await T('optional haul stones', async () => {
    await load(S => { CH3(S.flags); ['q29', 'q30_start', 'q30', 'q31_start', 'q31', 'badge6', 'q32', 'f_current', 'q33_start', 'q33_lesson', 'q33', 'f_haul'].forEach(k => { S.flags[k] = 1; }); S.bag.harness = 1; S.party[0].field = (S.party[0].field || []).concat(['haul']); delete S.hauls; ['tr_r16t1', 'tr_r16t2', 'tr_r16t3', 'tr_r17t1', 'tr_r17t2', 'tr_r17t3'].forEach(k => { S.flags[k] = 1; }); });
    const haulOne = async (map, h) => {
      await B.go(map, h.x, h.y + 1, 'up'); await settle();
      const W0 = W.map;
      const sides = [[0, 1, 'up'], [-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down']].map(([dx, dy, d]) => [h.x + dx, h.y + dy, d])
        .filter(([x, y]) => W0.at(x, y) !== null && !W.solidAt(x, y) && B.path(x, y));
      if (!sides.length) throw new Error('no free side next to ' + map + ' ' + h.id);
      const [x, y, d] = sides[0];
      await B.walkTo(x, y, d); B.answers = [0]; await B.act(); await settle();
      return F.hauled(map, h.id);
    };
    for (const [map, ids] of [['r16', ['store', 'bank']], ['r17', ['ridge']]]) {
      for (const id of ids) {
        const h = G.MAPS[map].hauls.find(z => z.id === id);
        ok(await haulOne(map, h), `${map} ${id}: carried to its rail seat`, at());
      }
    }
    const before = Object.assign({}, G.S.bag);
    await B.go('r17', 27, 2, 'up'); await settle();
    ok(B.flag('r17_pocket') || G.S.bag.moonstone > (before.moonstone || 0) || W.player.y === 2, 'the ridge pocket is reachable after the haul', at());
  });

  // ---------------------------------------------------------------- fishing tables and the quayside basin
  await T('fishing and basins', async () => {
    await load(S => { CH3(S.flags); });
    const roll = (id, n) => { const s = {}; for (let i = 0; i < n; i++) { const e = D.rollFishing(id); if (e) s[e.id + ':' + e.lv] = 1; } return Object.keys(s); };
    const sea = roll('m07', 300), river = roll('r16', 300);
    const SEA = ['moraekkom', 'chalkakge', 'silhaema', 'pomal'], RIV = ['silhaema', 'meongburi', 'chalkakge'];
    ok(sea.length && sea.every(k => SEA.includes(k.split(':')[0]) && +k.split(':')[1] >= 32 && +k.split(':')[1] <= 36), '해무나루 fishing: 실해마·모래꼼·찰칵게·포말이 Lv32~36', sea.join(' '));
    ok(river.length && river.every(k => RIV.includes(k.split(':')[0]) && +k.split(':')[1] >= 37 && +k.split(':')[1] <= 40), '제방들길 river fishing Lv37~40', river.join(' '));
    const pool = {}; for (let i = 0; i < 200; i++) { const e = D.rollEncounter('m08', 'pool'); if (e) pool[e.id] = 1; }
    ok(Object.keys(pool).every(k => ['pomal', 'silhaema', 'deungbulhaepa', 'chalkakge'].includes(k)), '푸른숨 quayside basin table (C307)', Object.keys(pool));
    const nb = D.rollEncounter('m08', 1);
    ok(!nb, 'no random encounters walking in 푸른숨시', nb);
  });

  // ---------------------------------------------------------------- a chapter-2 save made on the sea before rides were stored
  await T('old save on the water', async () => {
    let spot = null;
    await load(S => { delete S.ride; });
    const m = W.getMap('searoute');
    for (let y = 0; y < m.h && !spot; y++) for (let x = 0; x < m.w && !spot; x++) { const t = m.at(x, y) !== null && m.tile(x, y); if (t && t.sea && !(m.def.npcs || []).some(n => n.x === x && n.y === y)) spot = [x, y]; }
    ok(!!spot, 'found a sea tile on the sea route', spot);
    await load(S => { delete S.ride; S.pos = { map: 'searoute', x: spot[0], y: spot[1], dir: 'down' }; });
    ok(W.map.id === 'searoute' && W.surfing && W.surfing.sea, 'an old save on the sea comes back riding (fallback rider)', [at(), W.surfing]);
    await B.reload();
    ok(W.surfing && W.surfing.sea && G.S.ride, 'and from then on the ride is stored in the save', G.S.ride);
  });

  // ---------------------------------------------------------------- the chapter-3 kickoff on an old chapter-2 save (no q24_start)
  await T('old save kickoff', async () => {
    await load(S => { delete S.flags.q24_start; });
    await B.go('searoute', 25, 9, 'left'); await settle();
    if (!B.flag('q24_start')) { W.enter('searoute', 25, 10, 'left'); await settle(); }
    ok(B.flag('q24_start') && B.flag('ch2_end'), 'entering the sea route starts chapter 3 without replaying the ending');
  });
  B.keys = [];
  console.warn('U3 DONE ' + R.pass.length + ' pass / ' + R.fail.length + ' fail');
  return R;
};
'units3 ready'

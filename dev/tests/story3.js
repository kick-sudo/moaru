// The whole of chapter 3 through the real scripts, starting from a real finished chapter-2 save. BOT.run3(save, opts) -> report
BOT.safeSpot = Object.assign(BOT.safeSpot, { r13: [24, 18, 'up'], r14: [10, 7, 'up'], d10a: [3, 13, 'up'], r16: [5, 7, 'up'], d11b: [15, 17, 'up'], r17: [16, 12, 'up'], nw1: [14, 13, 'up'] });
// the chapter-3 path finder also crosses marked current bands while riding with 급류타기
BOT.path = (tx, ty) => {
  const W = G.world, m = W.map, p = W.player, surf = !!W.surfing, cur = surf && G.field.canRideCurrent(m);
  const warpAt = (x, y) => (m.def.warps || []).some(w => w.x === x && w.y === y);
  const wet = t => t.water || (cur && t.rapids);
  const ok = (x, y) => {
    if (x === tx && y === ty) return m.at(x, y) !== null && (!W.solidAt(x, y) || (surf && wet(m.tile(x, y))));
    if (m.at(x, y) === null || W.entAt(x, y, p) || warpAt(x, y)) return false;
    const t = m.tile(x, y);
    if (surf) return wet(t) && !(t.sea && !W.surfing.sea) && !G.field.boulderAt(x, y);
    return !W.solidAt(x, y);
  };
  const key = (x, y) => x + ',' + y, prev = { [key(p.x, p.y)]: null }, q = [[p.x, p.y]];
  const D4 = [['up', 0, -1], ['down', 0, 1], ['left', -1, 0], ['right', 1, 0]];
  while (q.length) {
    const [x, y] = q.shift();
    if (x === tx && y === ty) { const out = []; let k = key(x, y); while (prev[k]) { out.unshift(prev[k][2]); k = key(prev[k][0], prev[k][1]); } return out; }
    for (const [d, dx, dy] of D4) { const nx = x + dx, ny = y + dy, k = key(nx, ny); if (k in prev || !ok(nx, ny)) continue; prev[k] = [x, y, d]; q.push([nx, ny]); }
  }
  return null;
};
// step off the map edge in a direction (and check where we arrived)
BOT.edge = async (dir, expect) => { const W = G.world; W.tryMove(W.player, dir); await BOT.sleep(30); await BOT.waitIdle(); if (expect && W.map.id !== expect) throw new Error(`edge ${dir} expected ${expect} but on ${W.map.id} at ${W.player.x},${W.player.y}`); };
BOT.board = async () => { BOT.answers = [0]; await BOT.act(); if (!G.world.surfing) throw new Error('could not board at ' + G.world.map.id + ' ' + G.world.player.x + ',' + G.world.player.y + ' :: ' + BOT.log.slice(-2).join(' | ')); };
BOT.at = (map, why) => { if (G.world.map.id !== map) throw new Error(`${why}: expected ${map}, on ${G.world.map.id} at ${G.world.player.x},${G.world.player.y} :: ${BOT.log.slice(-3).join(' | ')}`); };
// a real save → load round trip through the save code (설정 > 저장 코드), back at the same spot
BOT.reload = async () => {
  const W = G.world;
  await BOT.waitIdle();
  const code = G.menus.encode();
  G.layers.length = 0; G.lock = 0;
  G.S = G.normalize(G.menus.decode(code)); G.S.settings.text = 2; G.S.settings.sound = false;
  W.enter(G.S.pos.map, G.S.pos.x, G.S.pos.y, G.S.pos.dir, { noEvents: true });
  await BOT.waitIdle();
  BOT.stats.reloads = (BOT.stats.reloads || 0) + 1;
};
BOT.run3 = async (save, opts) => {
  opts = opts || {};
  const B = BOT, D = G.data, W = G.world, F = G.field, R = { steps: [] };
  B.R = R;
  const need = (k, why) => B.need(k, why);
  const step = async (name, fn) => { const t0 = Date.now(); console.warn('STEP ' + (R.starter || '') + ' ' + name); await fn(); R.steps.push([name, Math.round((Date.now() - t0) / 100) / 10, G.S.party.map(m => m.id + ':' + m.lv).join(' ')]); };
  B.policy2();
  if (!B.battle0) { B.battle0 = { w: G.battle.wild, t: G.battle.trainer }; G.battle.wild = async (...a) => { B.stats.battles = (B.stats.battles || 0) + 1; return B.battle0.w(...a); }; G.battle.trainer = async (...a) => { B.stats.battles = (B.stats.battles || 0) + 1; const r = await B.battle0.t(...a); if (!r) B.stats.losses = (B.stats.losses || 0) + 1; return r; }; }
  if (!B.grind0) { B.grind0 = B.grind; B.grind = async (...a) => { B.grinding = true; try { return await B.grind0(...a); } finally { B.grinding = false; } }; }
  // load the real chapter-2 save the same way the title screen does
  G.titlePick = () => {};
  G.layers.length = 0; G.lock = 0;
  G.S = G.normalize(JSON.parse(save));
  G.S.settings.text = 2; G.S.settings.sound = false;
  R.starter = G.S.flags.starter;
  R.before = { badges: ['badge1', 'badge2', 'badge3', 'badge4'].filter(k => G.S.flags[k]).length, dex: D.dexCount(), maps: Object.keys(G.S.bag).filter(k => D.ITEMS[k] && D.ITEMS[k].map).length, party: G.S.party.map(m => m.id + ':' + m.lv), money: G.S.money, ch2_end: !!G.S.flags.ch2_end, q24_start: !!G.S.flags.q24_start };
  if (opts.oldSave) delete G.S.flags.q24_start;            // a save from before chapter 3 existed: the kickoff runs on entering the sea route
  if (opts.zero) { G.S.money = 0; B.shop = () => { B.stats.noShop = (B.stats.noShop || 0) + 1; }; }   // 소지금 0, never buys anything
  if (opts.dropTMs) { delete G.S.bag.tm_refresh; delete G.S.bag.tm_slide; }
  G.startWorld(true);
  await B.waitIdle();
  B.reserve = 0;
  B.shop();

  await step('kickoff (R12 searoute)', async () => {
    await B.go('searoute', 25, 9, 'left');
    await B.waitIdle();
    if (!B.flag('q24_start')) { W.enter('searoute', 25, 10, 'left'); await B.waitIdle(); }   // onEnter kickoff
    need('q24_start', 'kickoff3 at the sea route');
  });
  await step('R13 white buoys', async () => {
    await B.walkTo(24, 9, 'left'); await B.board();
    await B.walkTo(13, 17); await B.edge('down', 'r13');
    await B.walkTo(17, 18); if (W.surfing) throw new Error('did not land on the r13 planks');
    if (opts.partner3) await opts.partner3();
    await B.retry('r13', async () => {
      if (W.map.id !== 'r13') await B.go('r13', 17, 18, 'right');
      await B.walkTo(33, 18); await B.edge('right', 'm07');
    }, ['r13', 2]);
  });
  await step('Q24 gaon + Q25 accept', async () => {
    await B.walkTo(24, 15, 'up'); B.answers = [0]; await B.act();
    need('q24', 'gaon'); need('q25_start', 'accept Q25'); if (!G.S.bag.map09 || !G.S.bag.map10) throw new Error('no map09/map10');
    await B.walkTo(4, 14, 'up'); await B.edge('up'); B.at('center_hm', 'center door'); D.healParty(); await B.walkTo(5, 6); await B.edge('down', 'm07');
    B.shop();
  });
  await step('D09 cave (Q25)', async () => {
    await B.retry('nw', async () => {
      if (W.map.id === 'center_hm') await B.go('m07', 3, 24, 'up');
      if (!B.flag('q25')) {
        if (W.map.id === 'm07') { await B.walkTo(3, 24, 'up'); await B.edge('up', 'nw1'); }
        if (W.map.id === 'nw1') {
          if (W.getMap('nw1').at(14, 2) === 'J') { await B.walkTo(14, 3, 'up'); B.answers = [0]; await B.act(); }
          await B.walkTo(14, 1); await B.edge('up', 'nw2');
        }
        B.at('nw2', 'nw1 -> nw2');
        if (!F.sunkAt('nw2', 'nb1')) { await B.walkTo(11, 6, 'right'); B.answers = [0]; await B.act(); await B.push('right', 1); }
        if (!F.sunkAt('nw2', 'nb2')) {
          if (!W.pushActive) { await B.walkTo(8, 11, 'up'); B.answers = [0]; await B.act(); }
          await B.walkTo(8, 11, 'up'); await B.push('up', 4); await B.walkTo(7, 6, 'right'); await B.push('right', 6);
        }
        if (!F.sunkAt('nw2', 'nb1') || !F.sunkAt('nw2', 'nb2')) throw new Error('seat stones not in: ' + JSON.stringify(G.S.boulders.nw2));
        await B.walkTo(22, 3, 'up'); B.answers = [0]; await B.act();
        need('q25', 'pier lever');
      }
      if (W.map.id !== 'nw2') await B.go('nw2', 28, 9, 'right');
      await B.walkTo(30, 9); await B.edge('right', 'nw3');
      await B.walkTo(29, 8); await B.edge('right', 'r14');
    }, ['nw1', 1]);
  });
  await step('R14 -> M08', async () => {
    await B.walkTo(41, 8); await B.edge('right', 'm08');
  });
  await step('Q26 resting companions', async () => {
    await B.walkTo(28, 10, 'left'); await B.act(); need('q26_start', '은서');
    await B.walkTo(28, 7, 'up'); await B.act(); need('q26_i1', '미르');
    await B.walkTo(21, 11, 'right'); await B.act(); need('q26_i2', '아라');
    await B.walkTo(28, 10, 'left'); await B.act(); need('q26', '은서 kit');
    if (!G.S.bag.map11 || !G.S.bag.protkit || !G.S.bag.permit10) throw new Error('no kit/map/permit');
    await B.walkTo(4, 6, 'up'); await B.edge('up'); B.at('center_ps', 'center'); D.healParty(); await B.walkTo(5, 6); await B.edge('down', 'm08');
    B.shop();
  });
  await step('D10 works (Q27)', async () => {
    await B.retry('d10', async () => {
      if (W.map.id !== 'd10a' && W.map.id !== 'd10b') { await B.go('m08', 26, 6, 'up'); await B.edge('up', 'd10a'); }
      if (W.map.id === 'd10a') {
        if (!B.flag('q27_log')) { await B.walkTo(5, 3, 'up'); await B.act(); need('q27_log', 'intake log'); }
        if (!B.flag('q27_filter')) {
          if (W.player.x < 25) { await B.walkTo(10, 7, 'right'); await B.board(); await B.walkTo(25, 7); if (W.surfing) throw new Error('basin landing failed'); }
          await B.walkTo(28, 12, 'up'); B.answers = [0]; await B.act(); await B.push('up', 3);
          need('q27_filter', 'filter seat');
        }
        if (W.player.x < 25) { await B.walkTo(10, 7, 'right'); await B.board(); await B.walkTo(25, 7); }
        await B.walkTo(29, 4); B.at('d10b', 'hatch');
      }
      if (!B.flag('q27_v1')) { await B.walkTo(4, 2, 'up'); B.answers = [0]; await B.act(); need('q27_v1', 'bypass valve'); }
      if (!B.flag('q27_v2')) {
        await B.walkTo(14, 8, 'up'); await B.board(); await B.walkTo(14, 4);
        await B.walkTo(14, 2, 'up'); B.answers = [0]; await B.act(); need('q27_v2', 'filter valve');
        await B.walkTo(14, 4, 'down'); await B.board(); await B.walkTo(14, 8);
      }
      if (!B.flag('q27_v3')) {
        if (G.field.boulderAt(25, 7)) { await B.walkTo(25, 8, 'up'); B.answers = [0]; await B.act(); await B.push('up', 2); }
        D.healParty();
        await B.walkTo(27, 2, 'up'); B.answers = [0]; await B.act();
      }
      if (!B.flag('q27')) { D.healParty(); const b = W.npc('d10boss'); if (b) { await B.walkTo(22, 14, 'right'); await B.act(); } }
      need('q27', 'works restored');
    }, ['d10a', 1]);
    if (!G.S.bag.maint) throw new Error('no maintenance sheet');
  });
  await step('GYM5', async () => {
    B.shop();
    if (opts.partner5) await opts.partner5();
    await B.grind('d10a', 1, opts.gym5Lv || 43);
    B.coverage(['전기', '바위', '에스퍼', '물', '땅']);
    await B.go('m08', 6, 22, 'up'); await B.edge('up', 'gym5');
    D.healParty();
    const ok = await B.gym(async () => { if (opts.lead5) B.lead(opts.lead5); await B.go('gym5', 7, 3, 'up'); await B.walkTo(7, 2, 'up'); await B.act(); }, 'badge5', ['d10a', 1]);
    if (!ok) throw new Error('gym5 not cleared');
    need('q28', 'gym5 badge'); if (!G.S.bag.tm_sludge) throw new Error('no tm_sludge');
  });
  await step('Q29 rapids lesson', async () => {
    await B.go('m08', 8, 27, 'down'); B.answers = [0]; await B.act(); B.at('m07', 'ferry to 해무나루');
    await B.walkTo(27, 8, 'right'); await B.act(); need('q29_start', '여민'); need('f_current', 'current skill'); if (!G.S.bag.bridle) throw new Error('no bridle');
    await B.walkTo(26, 7, 'up'); await B.board();
    for (const d of ['up', 'up', 'up', 'up', 'up', 'right', 'right', 'right', 'right', 'right', 'right']) { W.tryMove(W.player, d); await B.sleep(20); await B.waitIdle(); }
    need('q29_land', 'far plank'); B.face('left'); await B.board();
    for (const d of ['down', 'down', 'down', 'down', 'down', 'left', 'left', 'left', 'left', 'down']) { W.tryMove(W.player, d); await B.sleep(20); await B.waitIdle(); }
    need('q29', 'rapids course');
  });
  await step('Q30_start freight slip', async () => {
    await B.walkTo(37, 22, 'right'); B.answers = [0]; await B.act(); B.at('m08', 'ferry to 푸른숨시');
    await B.walkTo(15, 21, 'up'); await B.edge('up', 'freight_ps');
    await B.walkTo(3, 3, 'up'); await B.act(); need('q30_start', '담소'); if (!G.S.bag.map12) throw new Error('no map12');
    await B.walkTo(4, 4); await B.edge('down', 'm08');
    await B.walkTo(8, 27, 'down'); B.answers = [0]; await B.act(); B.at('m07', 'ferry back');
  });
  await step('R15 river (current bands)', async () => {
    await B.retry('r15', async () => {
      if (W.map.id !== 'm07' && W.map.id !== 'r15') await B.go('m07', 17, 8, 'up');
      if (W.map.id === 'm07') { await B.walkTo(17, 7, 'up'); await B.board(); await B.walkTo(17, 0); await B.edge('up', 'r15'); }
      await B.walkTo(13, 22); if (W.surfing) throw new Error('did not land at the camp landing');
      await B.walkTo(25, 22); await B.edge('right', 'h02');
    }, null);
  });
  await step('H02 sluice (Q30)', async () => {
    await B.walkTo(8, 7, 'up'); await B.act(); need('q30_brief', '쉼터지기');
    await B.walkTo(13, 8, 'down'); B.answers = [0]; await B.act(); await B.push('down', 1); need('q30_seat', 'counterweight');
    if (W.getMap('h02').at(14, 5) === 'J') { await B.walkTo(14, 6, 'up'); B.answers = [0]; await B.act(); }
    await B.walkTo(18, 3, 'right'); B.answers = [0]; await B.act(); need('q30', 'winch');
    await B.walkTo(27, 7); await B.edge('right', 'r16');
  });
  await step('R16 -> M09', async () => {
    if (W.getMap('r16').at(14, 7) === 'J') { await B.walkTo(13, 7, 'right'); B.answers = [0]; await B.act(); }
    await B.walkTo(43, 7); await B.edge('right', 'm09');
  });
  await step('Q31_start union', async () => {
    await B.walkTo(13, 7, 'up'); await B.edge('up', 'union_db');
    await B.walkTo(7, 3, 'up'); await B.act(); need('q31_start', '시온'); if (!G.S.bag.permit11) throw new Error('no permit11');
    await B.walkTo(5, 5); await B.edge('down', 'm09');
    await B.walkTo(4, 16, 'up'); await B.edge('up'); B.at('center_db', 'center'); D.healParty(); await B.walkTo(5, 6); await B.edge('down', 'm09');
    B.shop();
  });
  await step('D11 records (Q31)', async () => {
    await B.retry('d11', async () => {
      if (W.map.id !== 'd11b' && W.map.id !== 'office_d11') { await B.go('m09', 28, 21, 'down'); await B.edge('down', 'd11b'); }
      if (W.map.id === 'd11b' && W.getMap('d11b').at(15, 15) === 'J') { await B.walkTo(15, 16, 'up'); B.answers = [0]; await B.act(); }
      if (!(B.flag('q31_ledger') && B.flag('q31_stamp') && B.flag('q31_w'))) {
        if (W.map.id === 'd11b') { await B.walkTo(15, 13, 'up'); await B.edge('up', 'office_d11'); }
        await B.walkTo(1, 2, 'up'); await B.act();
        await B.walkTo(10, 2, 'up'); await B.act();
        await B.walkTo(8, 3, 'up'); await B.act();
        await B.walkTo(5, 4); await B.edge('down', 'd11b');
      }
      if (!F.sunkAt('d11b', 'ra')) { await B.walkTo(4, 9, 'up'); B.answers = [0]; await B.act(); await B.push('up', 3); await B.walkTo(3, 5, 'right'); await B.push('right', 4); }
      if (!F.sunkAt('d11b', 'rb')) {
        if (!W.pushActive) { await B.walkTo(13, 7, 'left'); B.answers = [0]; await B.act(); }
        await B.walkTo(13, 7, 'left'); await B.push('left', 2); await B.walkTo(10, 8, 'up'); await B.push('up', 1); await B.walkTo(11, 6, 'left'); await B.push('left', 2);
      }
      need('q31_track', 'rail supports');
      if (!B.flag('q31_hist')) { await B.walkTo(26, 6, 'up'); await B.act(); }
      need('q31_confront', 'all records');
      D.healParty();
      if (!B.flag('q31')) { await B.walkTo(15, 13); const b = W.npc('d11boss'); if (b && !B.flag('tr_d11boss')) { await B.walkTo(16, 14, 'right'); await B.act(); } }
      need('q31', 'supervisor');
    }, ['d11b', 1]);
    if (!G.S.bag.evid3) throw new Error('no evidence copy');
  });
  await step('GYM6', async () => {
    B.shop();
    if (opts.partner6) await opts.partner6();
    await B.grind('d11b', 1, opts.gym6Lv || 48);
    B.coverage(['물', '풀', '땅', '격투']);
    await B.go('m09', 37, 8, 'up'); await B.edge('up', 'gym6');
    await B.retry('scale', async () => {
      if (!B.flag('g6_open')) {
        if (W.map.id !== 'gym6') await B.go('gym6', 7, 13, 'up');
        await B.walkTo(9, 11, 'up'); await B.act(); await B.push('up', 3);
        await B.walkTo(13, 10, 'left'); await B.push('left', 1); await B.walkTo(11, 11, 'up'); await B.push('up', 3);
      }
      need('g6_open', 'scale balanced');
    }, null);
    D.healParty();
    const ok = await B.gym(async () => { if (opts.lead6) B.lead(opts.lead6); await B.go('gym6', 7, 3, 'up'); await B.walkTo(7, 2, 'up'); await B.act(); }, 'badge6', ['d11b', 1]);
    if (!ok) throw new Error('gym6 not cleared');
    need('q32', 'gym6 badge'); if (!G.S.bag.tm_quake) throw new Error('no tm_quake');
  });
  await step('Q33 haul + R18 viewpoint', async () => {
    await B.go('m09', 14, 24, 'up'); await B.act(); need('q33_start', '도담'); need('f_haul', 'haul skill'); if (!G.S.bag.harness) throw new Error('no harness');
    await B.walkTo(13, 25, 'left'); B.answers = [0]; await B.act(); need('q33_lesson1', 'practice haul');
    await B.walkTo(15, 25, 'right'); B.answers = [0]; await B.act(); need('q33_lesson', 'undo');
    await B.walkTo(31, 3, 'up'); B.answers = [0]; await B.act(); need('q33', 'north haul stone');
    await B.walkTo(31, 0); await B.edge('up', 'r18');
    await B.walkTo(8, 11); await B.waitIdle(600000);
    need('ch3_end', 'viewpoint');
  });
  if (!opts.noSide) await step('side quests SQ3-01..08', async () => {
    const S = R.side = {};
    const snap = () => JSON.stringify([G.S.bag, G.S.money, Object.keys(G.S.flags).sort()]);
    const tryQ = async (k, fn, giver) => {
      try {
        await fn();
        // talking to the giver again after the reward: nothing more is paid, no flag changes
        const before = snap();
        await B.go(...giver); B.answers = [0, 0]; await B.act(); await B.waitIdle();
        if (snap() !== before) throw new Error('re-talk changed the bag/flags');
        S[k] = 'ok';
      } catch (e) { S[k] = 'FAIL ' + String(e.message).slice(0, 160); console.warn('SIDE FAIL ' + k + ' ' + e.message); }
    };
    await tryQ('SQ3-01', async () => {
      await B.go('m07', 24, 15, 'up'); B.answers = [0]; await B.act(); if ((G.S.flags.sq301 | 0) < 1) throw new Error('not accepted');
      await B.reload();
      await B.go('rescue_hm', 2, 2, 'down'); await B.act(); need('sq301_rope', 'rope');
      await B.go('r13', 17, 19, 'left'); await B.board(); await B.walkTo(17, 24, 'left'); await B.act();
      if ((G.S.flags.sq301 | 0) < 2) throw new Error('buoy not found');
      await B.walkTo(18, 22); await B.walkTo(20, 22, 'down'); await B.act(); await B.walkTo(23, 22, 'down'); await B.act();
      if ((G.S.flags.sq301 | 0) < 3) throw new Error('rings');
      await B.go('m07', 24, 15, 'up'); await B.act(); if ((G.S.flags.sq301 | 0) < 4) throw new Error('report');
    }, ['m07', 24, 15, 'up']);
    await tryQ('SQ3-02', async () => {
      await B.go('shell_hm', 5, 4, 'up'); B.answers = [0]; await B.act(); if ((G.S.flags.sq302 | 0) < 1) throw new Error('not accepted');
      await B.go('r13', 22, 16, 'up'); await B.act(); await B.reload(); await B.walkTo(27, 22, 'down'); await B.act(); await B.walkTo(31, 13, 'up'); await B.act();
      await B.go('shell_hm', 5, 4, 'up'); B.answers = [1, 0]; await B.act(); if ((G.S.flags.sq302 | 0) < 2) throw new Error('quiz');
    }, ['shell_hm', 5, 4, 'up']);
    await tryQ('SQ3-08', async () => {
      await B.go('m07', 21, 23, 'down'); B.answers = [0]; await B.act(); if ((G.S.flags.sq308 | 0) < 1) throw new Error('not accepted');
      await B.go('r13', 17, 18, 'left'); await B.board(); await B.walkTo(13, 18, 'left'); await B.act();
      await B.reload(); if (!G.world.surfing) throw new Error('the ride was lost in the save code');
      await B.walkTo(17, 19); await B.walkTo(20, 18, 'up'); await B.act();
      await B.go('shell_hm', 1, 1, 'right'); await B.act();
      await B.go('m07', 21, 23, 'down'); await B.act(); if ((G.S.flags.sq308 | 0) < 2) throw new Error('report');
    }, ['m07', 21, 23, 'down']);
    await tryQ('SQ3-06', async () => {
      await B.go('post_hm', 3, 3, 'up'); B.answers = [0]; await B.act(); if (!G.S.bag.letter3) throw new Error('no letter');
      await B.reload(); if (!G.S.bag.letter3) throw new Error('letter lost in the save code');
      await B.go('m09', 18, 26, 'down'); await B.act(); if (!G.S.bag.reply3) throw new Error('no reply');
      await B.go('post_hm', 3, 3, 'up'); B.answers = [0]; await B.act(); if ((G.S.flags.sq306 | 0) < 3) throw new Error('return');
    }, ['post_hm', 3, 3, 'up']);
    await tryQ('SQ3-03', async () => {
      await B.go('m08', 28, 10, 'left'); B.answers = [0]; await B.act(); if ((G.S.flags.sq303 | 0) < 1) throw new Error('not accepted');
      await B.walkTo(25, 9, 'down'); await B.act(); await B.reload(); await B.walkTo(28, 7, 'up'); await B.act();
      await B.walkTo(24, 12, 'up'); B.answers = [0]; await B.act(); await B.walkTo(28, 7, 'up'); await B.act();
      if ((G.S.flags.sq303 | 0) < 2) throw new Error('canopy');
      await B.walkTo(28, 10, 'left'); await B.act();
    }, ['m08', 28, 10, 'left']);
    await tryQ('SQ3-04', async () => {
      await B.go('m08', 35, 11, 'left'); B.answers = [0]; await B.act(); if ((G.S.flags.sq304 | 0) < 1) throw new Error('not accepted');
      await B.walkTo(33, 11, 'up'); await B.act(); need('sq304_vane', 'weak vane');
      await B.walkTo(40, 6, 'up'); await B.edge('up', 'ventroof');
      await B.walkTo(5, 2, 'up'); await B.act(); await B.walkTo(3, 4, 'up'); B.answers = [1]; await B.act(); await B.reload(); await B.walkTo(8, 4, 'up'); B.answers = [1]; await B.act();
      need('sq304_fixed', 'handles');
      await B.walkTo(6, 5); await B.edge('down', 'm08');
      await B.walkTo(35, 11, 'left'); await B.act(); if ((G.S.flags.sq304 | 0) < 2) throw new Error('report');
    }, ['m08', 35, 11, 'left']);
    await tryQ('SQ3-05', async () => {
      await B.go('archive', 6, 3, 'up'); B.answers = [0]; await B.act(); if ((G.S.flags.sq305 | 0) < 1) throw new Error('not accepted');
      await B.go('memory', 27, 6, 'up'); await B.board(); await B.walkTo(27, 4); if (W.surfing) throw new Error('did not land on the sandbar');
      await B.walkTo(28, 3, 'up'); await B.act(); need('sq305_mark', 'marker');
      await B.reload();
      await B.walkTo(29, 4, 'right'); B.answers = [0]; await B.act();
      await B.go('archive', 6, 3, 'up'); await B.act(); if ((G.S.flags.sq305 | 0) < 2) throw new Error('report');
    }, ['archive', 6, 3, 'up']);
    await tryQ('SQ3-07', async () => {
      await B.go('warehouse', 4, 4, 'right'); B.answers = [0]; await B.act(); if ((G.S.flags.sq307 | 0) < 1) throw new Error('not accepted');
      await B.go('westpath', 2, 8, 'left'); B.answers = [0]; await B.act(); if (!F.hauled('westpath', 'oldpath')) throw new Error('haul');
      await B.reload(); if (!F.hauled('westpath', 'oldpath')) throw new Error('haul lost in the save code');
      await B.walkTo(0, 8); await B.edge('left', 'oldtrail'); await B.walkTo(2, 2, 'up'); await B.act(); need('sq307_box', 'record box');
      await B.go('warehouse', 4, 4, 'right'); await B.act(); if ((G.S.flags.sq307 | 0) < 2) throw new Error('report');
    }, ['warehouse', 4, 4, 'right']);
  });
  R.flags = Object.keys(G.S.flags).length;
  R.maps = Object.keys(G.S.bag).filter(k => D.ITEMS[k] && D.ITEMS[k].map);
  R.badges = G.menus.BADGES.filter(b => G.S.flags[b[0]]).map(b => b[1]);
  R.dex = D.dexCount();
  R.party = G.S.party.map(m => `${m.id}:${m.lv}:${m.moves.map(x => x.id).join('/')}`);
  R.loans = G.S.loans;
  R.tokens = G.S.bag.token || 0;
  R.dexLoan = Object.fromEntries(['haepum', 'sanbatgom', 'muljjori', 'yeoulgwon'].map(id => [id, G.S.dex.caught[id] ? 'caught' : G.S.dex.seen[id] ? 'seen' : '-']));
  R.tms = ['tm_refresh', 'tm_slide', 'tm_sludge', 'tm_quake'].filter(k => G.S.bag[k]);
  R.money = G.S.money;
  R.records3 = Object.keys(G.S.records3 || {});
  R.stats = B.stats;
  R.explored = Object.fromEntries(['r13', 'm07', 'm08', 'r15', 'm09', 'd11b'].map(id => [id, Math.round(G.field.exploredShare(id) * 100)]));
  R.errors = B.errors;
  console.warn('REPORT ' + JSON.stringify(R));
  return R;
};
'story3 ready'

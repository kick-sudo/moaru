// The whole of chapter 1 through the real scripts. BOT.run(starter) -> report
BOT.run = async (starter, opts) => {
  opts = opts || {};
  const B = BOT, D = G.data, W = G.world, R = { starter, steps: [] };
  const step = async (name, fn) => { const t0 = Date.now(); console.warn('STEP ' + starter + ' ' + name); await fn(); R.steps.push([name, Math.round((Date.now() - t0) / 100) / 10, G.S.party.map(m => m.id + ':' + m.lv).join(' ')]); };
  G.layers.length = 0;
  G.S = G.newState('한결', 'boy'); G.S.flags.started = 1; G.S.settings.text = 2; G.S.settings.sound = false;
  G.startWorld(false);
  await B.waitIdle();
  const POS = { daram: ['town1', 9, 9, 'up'], bulguri: ['town1', 17, 8, 'up'], muldal: ['town1', 5, 14, 'down'] };
  await step('Q00 starter', async () => {
    await B.talk('lab', 8, 4, 'up');                  // 연우 박사 first talk
    B.need('prof_talk', 'prof');
    await B.talk(...POS[starter], [0]);               // pick + rival practice
    B.need('rival0', 'rival practice');
    await B.talk('lab', 8, 4, 'up');                  // kit
    B.need('q00', 'kit');
    if (G.S.bag.map01) throw new Error('map before Q01');
  });
  await step('R01 demo+trainers', async () => {
    await B.talk('route1', 3, 26, 'left');            // capture demo
    B.need('r1_demo', 'demo');
    await B.talk('route1', 8, 5, 'right');            // 민호
    await B.talk('route1', 3, 15, 'left');            // 지우
    if (opts.grind) await B.grind('route1', 1, 7);
  });
  await step('Q01 post', async () => {
    await B.talk('post', 5, 3, 'up');
    B.need('q01', '하람'); B.need('q02_start', '하람');
    if (!G.S.bag.map01) throw new Error('no map01');
  });
  await step('R02 rival1', async () => {
    await B.talk('westpath', 10, 10, 'up', [0]);
    B.need('rival1', 'rival1');
    await B.talk('westpath', 10, 5, 'up');            // 준수
    await B.talk('westpath', 15, 10, 'right');        // 은비
  });
  await step('Q02 vines', async () => {
    await B.talk('leafshade', 8, 11, 'up');           // 하람 teaches
    B.need('f_vine', 'teach vine');
    await B.talk('leafshade', 10, 10, 'up', [0]);
    await B.talk('leafshade', 12, 10, 'up', [0]);
    B.need('q02_v2', 'training vines');
    await B.talk('leafshade', 11, 15, 'right', [0]);  // the trapped 볼도리
    B.need('q02', 'rescue');
    await B.talk('leafshade', 10, 2, 'up', [0]);      // forest entrance vine
    if (G.world.getMap('leafshade').at(10, 1) === 'V') throw new Error('forest vine still there');
  });
  await step('D01 forest', async () => {
    await B.talk('forest', 5, 22, 'left');            // 다솜
    await B.talk('forest', 14, 17, 'right');          // 태오
    await B.talk('forest', 17, 16, 'up', [0]);        // detour vine
    await B.talk('forest', 13, 9, 'right');           // 예린
    await B.talk('forest', 11, 11, 'down', [0]);      // lower the bridge rope
    B.need('q03', 'bridge');
  });
  await step('M02 branch+gym1', async () => {
    await B.go('dolmaru', 14, 8, 'up');
    await B.talk('branch', 8, 4, 'up');
    B.need('q04_note', 'branch');
    await B.grind('forest', 1, opts.gym1Lv || 13);
    await B.talk('gym1', 8, 12, 'right');             // 바위
    await B.talk('gym1', 3, 6, 'left');               // 모래
    const ok = await B.gym(() => B.talk('gym1', 6, 2, 'up'), 'badge1', ['forest', 1]);
    if (!ok) throw new Error('gym1 not cleared');
    if (!G.S.bag.recommend) throw new Error('no recommendation');
  });
  await step('R04 songfield', async () => {
    await B.talk('songfield', 14, 7, 'up');           // 하나
    await B.talk('songfield', 21, 9, 'right');        // 준
  });
  await step('Q06 camp push', async () => {
    await B.go('camp', 12, 12, 'up');                 // first visit supplies
    await B.talk('camp', 15, 10, 'up');               // 석호 teaches push
    B.need('f_push', 'teach push');
    await B.talk('camp', 16, 11, 'up', [0]);          // look at the training stone
    await B.push('up', 2);
    B.need('q06', 'push training');
    if (!G.S.bag.lamp || !G.S.bag.map02) throw new Error('no lamp/map02');
    // Q07 (optional): bag + rod, decline the adoption so the run stays zero-capture
    await B.talk('camp', 8, 12, 'left');
    await B.talk('camp', 19, 13, 'right');
    await B.talk('camp', 8, 12, 'left', [1]);
    if (!G.S.bag.rod) throw new Error('no rod');
  });
  await step('D02 cave', async () => {
    await B.go('camp', 11, 2, 'up');
    await B.walk('up', 1);                            // through the cave mouth
    if (W.map.id !== 'cave1') throw new Error('cave entry failed: ' + W.map.id);
    await B.talk('cave1', 15, 12, 'right');           // 산하
    await B.go('cave2', 14, 9, 'right');
    await B.act();                                    // look at stone A
    await B.push('right', 3);
    await B.go('cave2', 12, 5, 'down');
    await B.push('down', 3);
    await B.go('cave2', 11, 9, 'right');
    await B.push('right', 7);
    B.need('q08_puzzle', 'echo-layer stones');
    await B.go('cave2', 5, 4, 'up');                  // stone C up, then the moonroom ladder
    await B.push('up', 1);
    await B.walk('left', 3);
    if (W.map.id !== 'moonroom') throw new Error('moonroom ladder failed: ' + W.map.id);
    await B.talk('moonroom', 6, 3, 'up');             // the moonstone box
    if (!G.S.flags.rv_moon) throw new Error('no moonstone');
    await B.go('cave3', 1, 8, 'right');
    await B.talk('cave3', 6, 8, 'up');                // 석호 rest
    await B.talk('cave3', 12, 8, 'right');            // worker 1
    await B.talk('cave3', 21, 8, 'right');            // foreman: records + part
    B.need('q08_workers', 'workers');
    await B.talk('cave4', 10, 8, 'up');               // the pedestal
    B.need('q08', 'pedestal');
    if (G.world.getMap('cave4').at(21, 7) !== '.') throw new Error('east door closed');
  });
  await step('R05 sandwind', async () => {
    await B.go('cave4', 20, 7, 'right');
    await B.walk('right', 2);
    if (W.map.id !== 'sandwind') throw new Error('east exit failed: ' + W.map.id);
    await B.talk('sandwind', 18, 7, 'up');
    await B.talk('sandwind', 26, 8, 'down');
  });
  await step('Q09 mulullim', async () => {
    await B.go('sandwind', 34, 7, 'right');
    await B.walk('right', 2);
    if (W.map.id !== 'mulullim') throw new Error('city entry failed: ' + W.map.id);
    await B.walk('right', 1);                         // 소리 meets you at the gate
    await B.waitIdle();
    B.need('q09_met', '소리 at the gate');
    if (!G.S.bag.map03) throw new Error('no map03');
    await B.talk('mulullim', 8, 14, 'left', [0]);     // ferry to the north walk
    if (W.player.x !== 8 || W.player.y !== 10) throw new Error('ferry north failed ' + W.player.x + ',' + W.player.y);
    await B.walk('up', 1);
    await B.go('mulullim', 9, 1, 'up');
    await B.walk('up', 2);
    if (W.map.id !== 'mistwalk') throw new Error('north exit failed: ' + W.map.id);
    await B.talk('mistwalk', 8, 22, 'right');         // 새봄
    await B.talk('mistwalk', 14, 12, 'up');           // 이슬
    await B.talk('sluicelab', 8, 4, 'up');
    B.need('q09_lab', 'lab');
    await B.talk('mulullim', 8, 10, 'left', [0]);     // ferry back south
    if (W.player.y !== 14) throw new Error('ferry south failed');
    await B.go('sluicehouse', 1, 2, 'up');
    await B.walk('up', 1);
    await B.walk('left', 1);
    if (W.map.id !== 'reservoir') throw new Error('reservoir stairs failed: ' + W.map.id);
    await B.talk('reservoir', 7, 8, 'left', [0]);     // vine
    await B.talk('reservoir', 3, 7, 'left');          // valve part
    if (!G.S.bag.valvepart) throw new Error('no valve part');
    await B.talk('reservoir', 11, 9, 'right', [0]);
    await B.push('right', 2);
    await B.go('reservoir', 9, 11, 'up');
    await B.push('up', 1);
    await B.go('reservoir', 8, 9, 'right');
    await B.push('right', 6);
    if (G.world.getMap('reservoir').at(15, 9) !== 'U') throw new Error('reservoir stones not set');
    await B.talk('reservoir', 17, 8, 'right');        // worker
    await B.go('reservoir', 15, 9, 'right');          // walk the filled channel
    await B.walk('right', 1);
    await B.talk('reservoir', 7, 15, 'left');         // rest at the landing first, like a player would
    for (let t = 1; t <= 4 && !B.flag('tr_boss'); t++) {   // site supervisor (retry after training)
      D.healParty();
      await B.talk('reservoir', 21, 4, 'up');
      if (!B.flag('tr_boss')) { B.stats.bossLoss = (B.stats.bossLoss || 0) + 1; await B.grind('mistwalk', 1, B.starterMon().lv + 2); }
    }
    B.need('tr_boss', 'supervisor');
    await B.talk('reservoir', 22, 3, 'up', [0]);      // the main valve
    B.need('q09', 'valve');
  });
  await step('GYM2', async () => {
    await B.talk('mulullim', 8, 14, 'left', [1]);     // ferry to the gym dock
    if (W.player.x !== 24) throw new Error('ferry gym failed');
    await B.grind('mistwalk', 1, opts.gym2Lv || 21);
    await B.talk('gym2', 4, 12, 'left');              // 물결
    await B.talk('gym2', 9, 6, 'right');              // 여울
    const ok = await B.gym(() => B.talk('gym2', 7, 2, 'up'), 'badge2', ['mistwalk', 2]);
    if (!ok) throw new Error('gym2 not cleared');
  });
  await step('Q10 ripple', async () => {
    await B.talk('mulullim', 23, 8, 'left');          // 리안: ripple lesson
    B.need('f_ripple', 'ripple');
    await B.go('mulullim', 23, 8, 'right');
    B.answers = [0];
    await B.act();                                    // open the board
    for (let i = 0; i < 6 && !B.flag('q10'); i++) await B.walk('right', 1);
    B.need('q10', 'pool');
  });
  await step('end gate', async () => {
    await B.go('mulullim', 30, 15, 'up');
    await B.walk('up', 1);
    await B.waitIdle(600000);
    B.need('ch1_end', 'gate');
  });
  R.flags = Object.keys(G.S.flags).length;
  R.maps = Object.keys(G.S.bag).filter(k => D.ITEMS[k] && D.ITEMS[k].map);
  R.party = G.S.party.map(m => `${m.id}:${m.lv}:${m.moves.map(x => x.id).join('/')}`);
  R.stats = B.stats;
  R.explored = Object.fromEntries(['town1', 'route1', 'city', 'forest', 'cave2', 'mulullim'].map(id => [id, Math.round(G.field.exploredShare(id) * 100)]));
  R.errors = B.errors;
  console.warn('REPORT ' + JSON.stringify(R));
  return R;
};
'story ready'

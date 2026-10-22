// 금오·월백 checks on real chapter-3-end saves: the eight scenes (watched and skipped), the two requests in both orders,
// the sanctuaries (haul stone, puzzle, observation), retreat without cubes, flee / KO / blackout / retry / capture /
// release / box move (no second capture), the save code, an older save that already owns 금오, the dex and the notebook.
// Needs bot.js + story2.js. window.ULG(saveJSON, only) -> { pass: [...], fail: [...], log: {...} }
window.ULG = async (save, only) => {
  const B = BOT, D = G.data, W = G.world, F = G.field, L = G.legend;
  const R = { pass: [], fail: [], log: {}, shots: [] };
  const ok = (c, name, info) => { (c ? R.pass : R.fail).push(name + (info !== undefined ? ' :: ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); return c; };
  const settle = async () => { await B.waitIdle(); await B.sleep(60); await B.waitIdle(); };
  const T = async (name, fn) => {
    if (only && !only.includes(name)) return;
    console.warn('ULG ' + name);
    try { await fn(); } catch (e) { R.fail.push(name + ' :: EXC ' + String(e && e.message || e).slice(0, 300)); }
    try { await B.waitIdle(30000); } catch (e) { R.fail.push(name + ' :: stuck after the test'); }
    B.skipping = false; B.answers = []; B.catchIds = null; B.grinding = false;
    G.layers.length = 0; G.lock = 0;
  };
  const load = async (tweak, src) => {
    G.titlePick = () => {}; G.layers.length = 0; G.lock = 0;
    G.S = G.normalize(JSON.parse(src || save)); G.S.settings.text = 2; G.S.settings.sound = false;
    if (tweak) tweak(G.S, G.S.flags);
    G.startWorld(true); await settle();
  };
  const said = n => B.log.slice(-(n || 4)).join(' | ');
  const S = () => G.S.legends;
  B.policy2();
  B.shop = () => {};
  // the scene hint layer is the one place B matters: skip on request
  if (!B.tick0) {
    B.tick0 = B.tick; clearInterval(B.tick);
    B.tick = setInterval(() => {
      const Ly = G.topLayer();
      // skipping: B while a legend scene is on (its hint layer on top during an animation, or under one of its lines)
      if (B.skipping && Ly && (Ly.sceneHint || (Ly.pages && G.layers.some(l => l.sceneHint)))) { G.pressed.b = 1; return; }
      if (!Ly) { if (G.scene !== W.scene && (!G.lock || B.skipScenes)) G.pressed.a = 1; return; }
      if (Ly.pages) { if (!(Ly.keep && Ly.ready && Ly.page === Ly.pages.length - 1)) G.pressed.a = 1; return; }
      if (Ly.swap !== undefined) { const i = B.pickSwap(); Ly.sel = i < 0 ? 0 : i; G.pressed.a = 1; return; }
      if (typeof Ly.top === 'number' && Ly.sel !== undefined) { Ly.sel = 0; G.pressed.a = 1; return; }
      if (Ly.sel !== undefined && Ly.drawBot && !Ly.drawTop) { Ly.sel = B.answers.length ? B.answers.shift() : 0; G.pressed.a = 1; return; }
      G.pressed.a = 1;
    }, 35);
  }
  const run = async fn => { await G.run(fn); await settle(); };
  const party = () => G.S.party.map(m => m.id + ':' + m.lv).join(',');
  const owns = id => G.S.party.concat(G.S.box).filter(m => m.id === id).length;
  const flagsMain = () => Object.keys(G.S.flags).filter(k => /^(q\d\d|badge\d|ch\d_end)$/.test(k)).sort().join(',');
  const shot = async name => { R.shots.push(name); window.__SHOT = name; await B.sleep(400); };

  // ---------------------------------------------------------------- a save from before the legends: everything undiscovered
  await T('defaults', async () => {
    await load();
    const s = S();
    ok(s && s.geumo && s.wolbaek, 'legend record created on load');
    ok(['heard', 'trace', 'sighted', 'named', 'observed', 'trialReady', 'captured'].every(f => s.geumo[f] === 0 && s.wolbaek[f] === 0), 'all fields start undiscovered', s.geumo);
    ok(!G.legend.dexIds().length, 'no legend page in the dex before any record');
    ok(D.DEX.length === 102 && !D.DEX.includes('geumo') && !D.DEX.includes('wolbaek'), 'numbered dex unchanged (102, no legends)', D.DEX.length);
    ok(['banjjak', 'jjireung', 'dudeo', 'dudeowang', 'gaegul', 'wanggaegul', 'songsong', 'buong'].every(k => D.MONS[k].hidden), 'hidden #901-908 stay hidden');
    ok(D.MONS.geumo.no === 909 && D.MONS.wolbaek.no === 910, 'numbers 909 / 910');
  });

  // ---------------------------------------------------------------- a brand-new game: quiet until the first request, then LG_S01
  await T('new_game', async () => {
    G.titlePick = () => {}; G.layers.length = 0; G.lock = 0;
    G.S = G.newState('한결', 'boy'); G.S.flags.started = 1; G.S.settings.text = 2; G.S.settings.sound = false;
    G.S.party = [D.makeMon('bulguri', 6)]; G.S.flags.starter = 'bulguri';
    G.startWorld(false); await settle();
    const s = L.st();
    ok(['heard', 'trace', 'sighted', 'named', 'observed', 'trialReady', 'captured'].every(f => s.geumo[f] === 0 && s.wolbaek[f] === 0) && !s.log.length, 'new game: both legends undiscovered');
    await B.go('route1', 6, 14, 'up'); await B.walk('up', 1); await settle();
    ok(!L.has('LG_S01'), 'before the first request (q00) the field stays quiet');
    G.S.flags.q00 = 1;
    await B.go('route1', 6, 14, 'up'); await B.walk('up', 1); await settle();
    ok(L.has('LG_S01') && S().scenes.LG_S01 === 'seen' && S().geumo.trace && !S().geumo.named, 'after q00: 세 갈래의 그림자 plays, a trace only', S().geumo);
    ok(G.legend.dexIds().join() === 'geumo' && !G.S.dex.seen.geumo && !G.S.dex.caught.geumo, 'legend page: 금오 as a trace, not seen / caught');
    ok(!L.objectives().length, 'no request in the notebook yet');
  });

  // ---------------------------------------------------------------- all eight scenes, watched
  const SCENES = [
    ['LG_S01', async () => { await B.go('route1', 6, 14, 'up'); await B.walk('up', 1); }],
    ['LG_S02', async () => { await B.go('moonroom', 10, 7, 'up'); await B.act(); }],
    ['LG_S03', async () => { await B.go('harbor', 38, 9, 'up'); B.answers = [1]; await B.act(); }],
    ['LG_S04', async () => { await B.go('archive', 5, 4, 'up'); await B.act(); }],
    ['LG_S05', async () => { await B.go('ridge', 5, 22, 'left'); await B.act(); }],
    ['LG_S06', async () => { await B.go('nw3', 25, 8, 'right'); await B.walk('right', 1); }],
    ['LG_S07', async () => { await B.go('memory', 27, 4, 'left'); await B.act(); }],
    ['LG_S08', async () => { await B.go('r18', 5, 10, 'up'); await B.act(); }]];
  await T('scenes_watch', async () => {
    await load();
    const main0 = flagsMain();
    for (const [id, go] of SCENES) {
      await go(); await settle();
      ok(L.has(id) && S().scenes[id] === 'seen', 'scene ' + id + ' watched and recorded', said(2));
    }
    ok(flagsMain() === main0, 'no main-story flag written by the scenes');
    const g = S().geumo, w = S().wolbaek;
    ok(g.trace && g.heard && g.sighted && g.named && !g.observed, '금오: trace/heard/sighted/named after the scenes', g);
    ok(w.trace && w.heard && w.sighted && w.named && !w.observed, '월백: trace/heard/sighted/named after the scenes', w);
    ok(!G.S.dex.seen.geumo && !G.S.dex.caught.geumo && !G.S.dex.caught.wolbaek, 'scenes never mark the dex as seen/caught');
    ok(G.legend.dexIds().length === 2, 'both legends listed on the legend page');
    // a scene plays once: the second look is a short line
    const n0 = B.log.length; await B.go('ridge', 5, 22, 'left'); await B.act();
    ok(B.log.length - n0 <= 2, 'second look at a scene place is short', said(2));
    R.log.watch = { geumo: g, wolbaek: w, log: S().log };
  });

  // ---------------------------------------------------------------- all eight scenes, skipped with B: the record stays
  await T('scenes_skip', async () => {
    await load();
    B.skipping = true;
    for (const [id, go] of SCENES) {
      await go(); await settle();
      ok(L.has(id), 'skipped ' + id + ' keeps the record', S().scenes[id]);
    }
    B.skipping = false;
    ok(SCENES.every(([id]) => S().scenes[id] === 'skip'), 'all eight scenes marked skip (animations and lines)', SCENES.map(([id]) => id + ':' + S().scenes[id]));
    ok(S().log.length === 8, 'eight records', S().log);
    const g = S().geumo, w = S().wolbaek;
    ok(g.trace && g.heard && g.sighted && g.named && w.trace && w.heard && w.sighted && w.named, 'skipping keeps the same marks as watching', [g, w]);
    ok(G.legend.journal().every(j => j.d.includes('(장면은 건너뛰었다)')), 'the journal notes the skipped scenes');
    // a skipped scene does not come back: the place gives its short line
    const n0 = B.log.length; await B.go('moonroom', 10, 7, 'up'); await B.act();
    ok(B.log.length - n0 <= 2 && !said(1).includes('장면'), 'a skipped scene is not replayed', said(1));
  });

  // ---------------------------------------------------------------- the fallbacks: second-hand records only
  await T('fallbacks', async () => {
    await load();
    await B.go('city', 10, 18, 'left'); await B.act();
    ok(L.has('LG_S01') && !S().scenes.LG_S01 && S().geumo.heard && !S().geumo.trace, '바람나루 rumour records LG_S01 as heard');
    await B.go('m07', 24, 15, 'up'); B.answers = [0, 0, 0, 0, 0]; await B.act();
    ok(L.has('LG_S06') && S().wolbaek.named && !S().wolbaek.sighted, '가온 recap: 월백 named, not sighted', S().wolbaek);
    // the real scene can still be seen afterwards
    await B.go('nw3', 25, 8, 'right'); await B.walk('right', 1); await settle();
    ok(S().scenes.LG_S06 === 'seen' && S().wolbaek.sighted, 'the dock scene still plays after the recap');
  });

  // ---------------------------------------------------------------- LQ01 then LQ02 / LQ02 then LQ01
  const lq01 = async () => {
    await B.go('harbor', 38, 9, 'up'); B.answers = [0]; await B.act();
    ok(S().quests.LQ01.started && S().quests.LQ01.listen, 'LQ01 started at 세나', S().quests.LQ01);
    await B.go('ridge', 5, 22, 'left'); await B.act();
    ok(S().quests.LQ01.survey && S().geumo.sighted, 'LQ01 survey at the viewpoint');
  };
  const lq02 = async () => {
    await B.go('archive', 6, 3, 'up'); B.answers = [1, 0]; await B.act();
    ok(S().quests.LQ02.started && S().wolbaek.named, 'LQ02 started at 해솔', S().quests.LQ02);
  };
  const sunSite = async () => {
    // the ring-marked stone beside the viewpoint, then the windbreaks
    await B.go('ridge', 5, 24, 'left'); B.answers = [0]; await B.act();
    ok(F.hauled('ridge', 'lg_sun'), 'ridge haul stone moved', said(3));
    await B.walkTo(3, 24); await B.walk('left', 1); await settle();
    ok(W.map.id === 'lg_suncliff', 'entered 햇귀절벽', W.map.id);
    await B.walkTo(7, 9, 'left'); B.answers = [0]; await B.act(); B.answers = [0]; await B.act();         // A twice
    await B.walkTo(14, 9, 'right'); for (let i = 0; i < 3; i++) { B.answers = [0]; await B.act(); }        // B three times
    ok(L.sunCalm(), 'windbreaks: three shadows on the ring stone', L.sunShadows());
    await B.walkTo(11, 5); await B.walk('up', 1); await B.walk('up', 1);
    B.answers = [1]; await B.walk('up', 1); await settle();      // onto the ledge: observation, then "조용히 물러난다"
    ok(S().geumo.observed && S().quests.LQ01.observe, '금오 observed (story complete)', S().geumo);
  };
  const moonSite = async () => {
    await B.go('moonroom', 11, 4, 'right'); B.answers = [0]; await B.act();
    ok(F.hauled('moonroom', 'lg_moon'), 'moonroom haul stone moved', said(3));
    await B.walkTo(12, 4); await B.walk('right', 1); await settle();
    ok(W.map.id === 'lg_moonpool', 'entered 월은못', W.map.id);
    await B.walkTo(18, 3, 'right'); B.answers = [0]; await B.act();
    ok(L.moonLit(), 'basin lights the way back');
    await B.walkTo(17, 4); for (const d of ['down', 'down', 'down', 'left', 'left', 'down', 'left', 'left', 'left', 'left', 'left', 'left', 'left', 'left', 'left', 'left']) await B.walk(d, 1);
    B.answers = [1]; await B.walk('left', 1); await settle();
    ok(S().wolbaek.observed && S().quests.LQ02.observe, '월백 observed (story complete)', [W.player.x, W.player.y, S().wolbaek]);
  };
  await T('quests_order_a', async () => {
    await load();
    const tok0 = G.S.bag.token || 0;
    await lq01(); await lq02(); await sunSite(); await moonSite();
    ok((G.S.bag.token || 0) === tok0 + 4, 'rewards: 2 tokens per request, once each', [tok0, G.S.bag.token]);
    ok(!S().geumo.captured && !S().wolbaek.captured && S().geumo.trialReady && S().wolbaek.trialReady, 'observation only: nothing captured, both wait for a challenge');
    ok(owns('geumo') === 0 && owns('wolbaek') === 0, 'no legend joined the party');
    R.log.orderA = { quests: S().quests, tokens: G.S.bag.token };
  });
  await T('quests_order_b', async () => {
    await load();
    await moonSite(); await sunSite();           // straight to the sanctuaries: the site logs fill in the missed stories
    ok(S().quests.LQ02.started && S().quests.LQ01.started, 'requests start at the sanctuaries without the givers', S().quests);
    ok(S().geumo.observed && S().wolbaek.observed, 'both observed');
    await lq02(); await lq01();
    const tok = G.S.bag.token;
    await B.go('lg_suncliff', 11, 2, 'up'); B.answers = [1]; await B.act();
    ok(G.S.bag.token === tok && S().geumo.observed, 'talking to 금오 again: no second reward, no long scene', [tok, said(2)]);
  });

  // ---------------------------------------------------------------- the legend battle: no cubes, flee, KO, blackout, retry, capture
  const toSun = async (tweak) => {
    await load(s => { s.legends = { geumo: { heard: 1, sighted: 1, named: 1, observed: 1, trialReady: 1 }, scenes: {}, log: ['LG_S05', 'LQ01'], quests: { LQ01: { started: 1, listen: 1, survey: 1, approach: 1, observe: 1, reward: 1 } }, sites: { LGZ01: { a: 2, b: 3, calm: 1, entered: 1, found: 1 } } }; if (tweak) tweak(s); });
    await B.go('lg_suncliff', 11, 2, 'up');
  };
  await T('no_cubes', async () => {
    await toSun(s => { delete s.bag.cube; delete s.bag.goldcube; delete s.bag.mastercube; });
    const t0 = S().geumo.tries;
    B.answers = [0, 1]; await B.act();                        // 더 다가간다 → (no cubes) 그만둔다
    ok(S().geumo.tries === t0 && G.scene === W.scene, 'no cubes: a warning, and stepping back starts no battle', said(2));
    ok(L.present('geumo'), '금오 still there');
  });
  await T('flee', async () => {
    await toSun();
    G.autoBattle = (p, e, BT) => ({ k: 'run' });
    for (let i = 0; i < 6 && !S().geumo.fled; i++) { B.answers = [0]; await B.act(); }
    B.policy2();
    ok(S().geumo.fled >= 1 && !S().geumo.captured && S().geumo.trialReady, 'fled: still waiting', S().geumo);
    ok(L.present('geumo') && W.npcs.some(n => n.id === 'lg_geumo'), '금오 still on the ledge after fleeing');
  });
  await T('ko_retry', async () => {
    await toSun(s => { s.party.forEach(m => { m.lv = 70; m.exp = D.expFor(70); }); D.healParty(); });
    D.healParty();
    B.grinding = true;      // the bot stays in the fight (otherwise it slips away from a type threat)
    B.answers = [0]; await B.act();
    ok(S().geumo.ko >= 1 && !S().geumo.captured, 'KO: not removed', S().geumo);
    ok(L.present('geumo'), '금오 back on the ledge for a retry');
    D.healParty(); B.answers = [0]; await B.act();
    ok(S().geumo.tries >= 2, 'retry fight started', S().geumo.tries);
  });
  await T('blackout_retry', async () => {
    await toSun(s => { s.party.forEach(m => { m.lv = 8; m.exp = D.expFor(8); m.hp = 1; }); });
    G.S.party.forEach(m => { m.hp = 1; });
    B.grinding = true;
    B.answers = [0]; await B.act(); await settle();
    ok(S().geumo.lost >= 1 && !S().geumo.captured, 'blackout: recorded, not removed', [W.map.id, S().geumo]);
    ok(!/lg_suncliff/.test(W.map.id), 'woke at the heal point', W.map.id);
    await B.go('lg_suncliff', 11, 2, 'up');
    ok(W.npcs.some(n => n.id === 'lg_geumo'), '금오 waits at the ledge again');
  });
  await T('capture', async () => {
    await toSun(s => { s.bag.cube = 40; s.bag.goldcube = 10; });
    D.healParty();
    B.catchIds = ['geumo'];
    const n0 = G.S.party.length + G.S.box.length;
    for (let i = 0; i < 8 && !S().geumo.captured; i++) { D.healParty(); B.answers = [0]; await B.act(); await settle(); if (W.map.id !== 'lg_suncliff') await B.go('lg_suncliff', 11, 2, 'up'); }
    const g = S().geumo;
    ok(g.captured && owns('geumo') === 1 && G.S.dex.caught.geumo, 'captured: party/box + dex + record together', g);
    ok(G.S.party.length + G.S.box.length === n0 + 1, 'exactly one new companion');
    R.log.capture = { tries: g.tries, ko: g.ko, fled: g.fled, lost: g.lost, cubesLeft: G.S.bag.cube, gold: G.S.bag.goldcube, party: party() };
    // the autosave holds the same state
    const saved = JSON.parse(localStorage.getItem('geumo_save_v1') || '{}');
    ok(saved.legends && saved.legends.geumo.captured && saved.party.concat(saved.box).some(m => m.id === 'geumo'), 'autosave holds the capture');
    // gone from the ledge, also after leaving and coming back
    await B.go('ridge', 6, 22, 'down'); await B.go('lg_suncliff', 11, 3, 'up');
    ok(!W.npcs.some(n => n.id === 'lg_geumo'), 'no second 금오 on the ledge');
    // move to the box, release: still no second one
    const m = G.S.party.find(x => x.id === 'geumo') || G.S.box.find(x => x.id === 'geumo');
    G.S.party = G.S.party.filter(x => x !== m); G.S.box = G.S.box.filter(x => x !== m); G.S.box.push(m);
    await B.go('ridge', 6, 22, 'down'); await B.go('lg_suncliff', 11, 3, 'up');
    ok(!W.npcs.some(n => n.id === 'lg_geumo'), 'box move: no second 금오');
    G.S.box = G.S.box.filter(x => x !== m);
    await B.go('ridge', 6, 22, 'down'); await B.go('lg_suncliff', 11, 3, 'up');
    ok(!W.npcs.some(n => n.id === 'lg_geumo') && S().geumo.captured, 'released: still no second 금오 (one capture per save)');
    // the save code round trip
    const code = G.menus.encode ? G.menus.encode(G.S) : null;
    if (code) { const back = G.normalize(G.menus.decode(code)); ok(back.legends && back.legends.geumo.captured === 1 && back.party.concat(back.box).filter(m => m.id === 'geumo').length === 0, 'save code keeps the legend record (released 금오 stays released)'); }
  });
  await T('capture_wolbaek', async () => {
    await load(s => { s.bag.cube = 40; s.bag.goldcube = 10; s.legends = { wolbaek: { heard: 1, named: 1, sighted: 1, observed: 1, trialReady: 1, present: 1 }, scenes: {}, log: ['LQ02'], quests: { LQ02: { started: 1, observe: 1, reward: 1 } }, sites: { LGZ02: { lit: 1, entered: 1, found: 1, back: 1 } } }; s.hauls = Object.assign(s.hauls || {}, { moonroom: { lg_moon: 1 } }); });
    await B.go('lg_moonpool', 5, 7, 'up');
    B.catchIds = ['wolbaek'];
    for (let i = 0; i < 8 && !S().wolbaek.captured; i++) { D.healParty(); B.answers = [0]; await B.act(); await settle(); if (W.map.id !== 'lg_moonpool') await B.go('lg_moonpool', 5, 7, 'up'); }
    const w = S().wolbaek;
    ok(w.captured && owns('wolbaek') === 1 && G.S.dex.caught.wolbaek, '월백 captured: party/box + dex + record', w);
    R.log.captureW = { tries: w.tries, ko: w.ko, fled: w.fled, lost: w.lost, cubesLeft: G.S.bag.cube, gold: G.S.bag.goldcube, party: party() };
  });

  // ---------------------------------------------------------------- an older save that already owns a 금오
  await T('legacy_owner', async () => {
    const o = JSON.parse(save);
    o.box = (o.box || []).concat([{ id: 'geumo', lv: 15, exp: D.expFor(15), iv: [8, 8, 8, 8, 8, 8], status: null, moves: [{ id: 'ember', pp: 25 }, { id: 'gust', pp: 35 }, { id: 'wingcut', pp: 25 }, { id: 'sunfire', pp: 5 }], uid: 42, hp: 40 }]);
    delete o.legends;
    await load(null, JSON.stringify(o));
    const g = S().geumo;
    ok(g.captured === 1 && g.legacy === 1 && G.S.dex.caught.geumo, 'owned 금오 counts as this save\'s capture', g);
    ok(owns('geumo') === 1 && G.S.box.find(m => m.id === 'geumo').lv === 15, 'the old 금오 keeps its level and moves');
    await B.go('lg_suncliff', 11, 3, 'up');
    ok(!W.npcs.some(n => n.id === 'lg_geumo'), 'no second 금오 at the sanctuary');
    // a designer preview of the dex is not ownership
    const o2 = JSON.parse(save); o2.settings = Object.assign({}, o2.settings, { dexPreview: true }); delete o2.legends;
    await load(null, JSON.stringify(o2));
    ok(!S().geumo.captured, 'preview setting alone does not mark a capture');
  });

  // ---------------------------------------------------------------- the dex page, notebook and map marks
  await T('dex_notebook_map', async () => {
    await load();
    await B.go('city', 10, 18, 'left'); await B.act();          // a rumour only
    ok(G.legend.dexIds().join() === 'geumo', 'rumour lists 금오 on the legend page', G.legend.dexIds());
    const row = G.legend.dexRow('geumo');
    ok(row.label.includes('???') && row.right === '흔적', 'name hidden while only a rumour', row);
    await B.go('ridge', 5, 22, 'left'); await B.act();
    ok(G.legend.dexRow('geumo').label.includes('금오'), 'name shown after the sighting');
    ok(G.legend.journal().length >= 2, 'journal tab has entries', G.legend.journal().map(j => j.t));
    // the entrance stone: nothing on the map before it is examined
    ok(!G.legend.revisits().length, 'no revisit entry before examining the stone');
    await B.go('ridge', 5, 24, 'left'); B.answers = [1]; await B.act();
    ok(G.legend.revisits().some(r => r.t.includes('전망 바위')) && (G.S.seenBarrier || {})['ridge:4,24'] === 'bigrock', 'examined stone: revisit + map mark');
    ok(G.legend.objectives().some(o => o.t.includes('해를 등에 진 새')), 'notebook goal for LQ01');
    // 월은못: nothing on the map pages until its stone is examined, then only the entrance and the safe footholds
    ok(!G.MAPS.lg_moonpool.outline() && !G.MAPS.lg_suncliff.outline, 'no sanctuary outline before examining');
    await B.go('moonroom', 11, 4, 'right'); B.answers = [1]; await B.act();
    const ol = G.MAPS.lg_moonpool.outline();
    ok(ol && ol.length === 19 && !(G.S.explored && G.S.explored.lg_moonpool), '월은못 entrance + way-out footholds outlined after the stone is examined', ol && ol.length);
    ok(!F.hauled('moonroom', 'lg_moon'), 'examining (declined) did not move the stone');
  });

  // ---------------------------------------------------------------- 월은못: no boards on the still pool, free rescues; 햇귀절벽 tablet
  await T('moon_board_rescue', async () => {
    await load(s => { s.hauls = Object.assign(s.hauls || {}, { moonroom: { lg_moon: 1 } }); });
    ok(G.S.bag.board || G.S.bag.seaboard, 'the save carries a water board');
    await B.go('lg_moonpool', 4, 10, 'right'); await B.act();
    ok(said(1).includes('물에 비친 발판의 그림자'), 'a reflection refuses the board', said(1));
    await B.go('lg_moonpool', 4, 8, 'right'); await B.act();
    ok(said(1).includes('물이 너무 고요'), 'the still pool refuses the board', said(1));
    ok(!W.surfing, 'never on the water');
    B.answers = [0]; await run(() => G.field.rescue(false));
    ok(W.map.id === 'camp' && W.player.x === 11 && W.player.y === 2, 'menu rescue from 월은못 lands at 산등 야영지', [W.map.id, W.player.x, W.player.y]);
    await B.go('lg_moonpool', 2, 4, 'up'); B.answers = [2]; await B.act();
    ok(W.map.id === 'moonroom', 'tablet: free rescue to the entrance', W.map.id);
  });
  await T('sun_tablet', async () => {
    await load(s => { s.legends = { sites: { LGZ01: { a: 2, b: 3, calm: 1, entered: 1, found: 1 } } }; s.hauls = Object.assign(s.hauls || {}, { ridge: { lg_sun: 1 } }); });
    await B.go('lg_suncliff', 18, 13, 'right'); B.answers = [0]; await B.act();
    ok(!L.sunCalm() && S().sites.LGZ01.a === 0 && S().sites.LGZ01.b === 0, 'tablet resets the windbreaks', S().sites.LGZ01);
    B.answers = [2]; await B.act();
    ok(W.map.id === 'ridge', 'tablet returns to the 바람등성이 shelter', W.map.id);
  });

  // ---------------------------------------------------------------- sanctuary progress through a save code (mid-puzzle)
  await T('save_code_sites', async () => {
    await load(s => { s.hauls = Object.assign(s.hauls || {}, { moonroom: { lg_moon: 1 }, ridge: { lg_sun: 1 } }); });
    await B.go('lg_moonpool', 18, 3, 'right'); B.answers = [0]; await B.act();          // the basin: the way back rises
    await B.go('lg_suncliff', 7, 9, 'left'); B.answers = [0]; await B.act();            // windbreak A one notch
    ok(L.moonLit() && S().sites.LGZ01.a === 1 && !L.sunCalm(), 'mid-puzzle state before the code', S().sites);
    const code = G.menus.encode();
    const back = G.normalize(G.menus.decode(code));
    G.S = back; G.S.settings.text = 2; G.S.settings.sound = false; G.startWorld(true); await settle();
    ok(L.moonLit() && S().sites.LGZ01.a === 1 && S().sites.LGZ01.b === 0, 'puzzle state survives the save code', S().sites);
    ok(F.hauled('ridge', 'lg_sun') && F.hauled('moonroom', 'lg_moon'), 'moved entrance stones survive the save code');
    await B.go('lg_moonpool', 17, 4, 'down');
    ok(W.map.at(17, 5) === '_' && W.map.at(5, 8) === '_', 'the risen way back is still walkable after loading', [W.map.at(17, 5), W.map.at(5, 8)]);
  });

  // ---------------------------------------------------------------- F09 with the free support companion (no haul user on the team)
  await T('support_haul', async () => {
    await load(s => { s.party.concat(s.box).forEach(m => { if (m.field) m.field = m.field.filter(k => k !== 'haul'); }); s.loans = Object.assign({}, s.loans, { haul: 'sanbatgom' }); });
    ok(G.field.actor('haul') && G.field.actor('haul').where === 'loan', 'only the support 산받곰 can haul', G.field.actor('haul'));
    await B.go('ridge', 5, 24, 'left'); B.answers = [0]; await B.act();
    ok(F.hauled('ridge', 'lg_sun') && B.log.slice(-6).join(' ').includes('지원 산받곰'), 'support 산받곰 moves the 햇귀절벽 stone', said(3));
    await B.go('moonroom', 11, 4, 'right'); B.answers = [0]; await B.act();
    ok(F.hauled('moonroom', 'lg_moon'), 'support 산받곰 moves the 월은못 stone', said(2));
    ok(!G.S.party.concat(G.S.box).some(m => m.id === 'sanbatgom') && !G.S.dex.caught.sanbatgom, 'the support companion never joins the team or the dex');
  });
  return R;
};
'legend tests ready'

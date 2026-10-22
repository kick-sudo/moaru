/* 모아루: 잠든 길의 노래 — exploration: companion field skills, stones, water travel, fishing,
   cave light, the notebook (수첩) and the map (지도) */
'use strict';
(function () {
  const G = window.G, D = G.data, A = G.art;
  const Fd = G.field = {};
  const W = () => G.world;
  const flag = k => !!(G.S && G.S.flags[k]);
  const set = (k, v) => { G.S.flags[k] = v === undefined ? 1 : v; };
  const sfx = n => G.audio && G.audio.sfx(n);
  const P = () => G.S.name;

  // ------------------------------------------------------------ companion field skills (kept apart from the 4 battle moves)
  Fd.SKILLS = {
    vine: { n: '덩굴 정리', short: '덩굴', desc: '얇은 덩굴을 다치지 않게 걷어 내 길을 연다.', where: '잎그늘길 · 하람의 훈련' },
    push: { n: '바위 밀기', short: '밀기', desc: '둥근 돌을 동료와 함께 한 칸씩 민다.', where: '산등 야영지 · 석호의 훈련' },
    echo: { n: '메아리 탐색', short: '메아리', desc: '벽 너머의 빈 공간을 소리로 찾아낸다.', where: '달숨동굴 복구 뒤 · 석호' },
    ripple: { n: '잔물타기', short: '물길', desc: '물판을 펼쳐 잔잔한 강과 연못을 건넌다.', where: '물울림 체육관 · 리안의 강습' },
    magnet: { n: '자력 맞춤', short: '자력', desc: '자성 자물쇠의 방향을 맞춰 연다. 선택 상자와 난간에만 쓴다.', where: '돛바람항 등대 복구 뒤 · 세나' },
    smash: { n: '바위깨기', short: '깨기', desc: '금이 간 작은 바위를 조심스럽게 깨서 길을 연다.', where: '돛바람항 공방 · 세 번째 배지 뒤 강습' },
    surf: { n: '파도타기', short: '파도', desc: '해상 안정판을 펼쳐 허용된 바다 항로를 건넌다. 급류와 폭포는 아직 무리다.', where: '돛바람항 해양학교 · 네 번째 배지 뒤 강습' },
    current: { n: '급류타기', short: '급류', desc: '물판에 고정끈을 걸고, 표식이 있는 굵은 물결 띠(급류)를 가로질러 건넌다. 폭포와 바다 자동 통과는 안 된다.', where: '해무나루 급류 강습장 · 다섯 번째 배지 뒤 여민의 강습' },
    haul: { n: '괴력운반', short: '운반', desc: '고리와 레일 문양이 있는 큰 운반석을 동료와 함께 들어 정해진 레일 받침에 옮긴다. 받침 앞에서 되돌릴 수도 있다.', where: '돌바퀴시 적재장 · 여섯 번째 배지 뒤 도담의 수업' }
  };
  Fd.ORDER = ['vine', 'push', 'echo', 'ripple', 'magnet', 'smash', 'surf', 'current', 'haul'];
  const lines = (...ids) => ids;
  // who can learn what (whole evolution lines)
  Fd.APT = {
    vine: lines('daram', 'daramsup', 'sumaek', 'bulguri', 'hwaguri', 'hwasan', 'muldal', 'padodal', 'neoul', 'kongju', 'dudeumong', 'jjoreu', 'gasibuli', 'jwi', 'dotoreu'),
    push: lines('daram', 'daramsup', 'sumaek', 'bulguri', 'hwaguri', 'hwasan', 'muldal', 'padodal', 'neoul', 'kongju', 'dudeumong', 'gasito', 'deombulto', 'gasiboru',
      'ppultori', 'ppuldajim', 'sanppul', 'moraekong', 'sagureu', 'jagalkong', 'doldureum', 'sandeung'),
    echo: lines('gwibami', 'mearung'),
    ripple: lines('muldal', 'padodal', 'neoul', 'muljjori', 'yongsot', 'ullimpong'),
    magnet: lines('nachimdol', 'jabukhwan'),
    smash: lines('daram', 'daramsup', 'sumaek', 'bulguri', 'hwaguri', 'hwasan', 'muldal', 'padodal', 'neoul', 'kongju', 'dudeumong', 'deuldori', 'beotimgom', 'sanbatgom',
      'jagalkong', 'doldureum', 'sandeung', 'moraekong', 'sagureu', 'ppultori', 'ppuldajim', 'sanppul', 'gasito', 'deombulto', 'gasiboru', 'heukkori', 'teoneolgup', 'yeoulgwon', 'dolgubi'),
    surf: lines('muldal', 'padodal', 'neoul', 'muljjori', 'yongsot', 'muldolgae', 'yeoulgwon', 'joryubyeol', 'haeryudeung', 'neugeutduk', 'mulgyeolburi',
      'pomal', 'haepum', 'moraekkom', 'borupae', 'silhaema', 'haeryonggyeol'),
    // chapter 3 (world-data eligibleSpecies: #7-9, 58, 61, 81, 83, 85, 87, 91, 92, 97, 98)
    current: lines('muldal', 'padodal', 'neoul', 'yongsot', 'joryubyeol', 'yeoulgwon', 'haeryudeung', 'neugeutduk', 'mulgyeolburi', 'pomal', 'haepum', 'silhaema', 'haeryonggyeol'),
    // (#1-9, 16, 29, 32, 36, 40, 41, 59, 68, 69, 70, 96)
    haul: lines('daram', 'daramsup', 'sumaek', 'bulguri', 'hwaguri', 'hwasan', 'muldal', 'padodal', 'neoul', 'dudeumong', 'gasiboru', 'sanppul', 'sagureu', 'doldureum', 'sandeung', 'dolgubi',
      'deuldori', 'beotimgom', 'sanbatgom', 'jebangjipge')
  };
  // a few chapter 3 companions also take the older skills (by their design sheets)
  Fd.APT.push = Fd.APT.push.concat(['chalkakge', 'jebangjipge']);
  Fd.APT.smash = Fd.APT.smash.concat(['chalkakge', 'jebangjipge']);
  Fd.canLearn = (mon, sk) => Fd.APT[sk].includes(mon.id);
  Fd.knows = (mon, sk) => !!(mon && mon.field && mon.field.includes(sk));
  Fd.teach = (mon, sk) => { mon.field = mon.field || []; if (!mon.field.includes(sk)) mon.field.push(sk); };
  Fd.unlocked = sk => flag('f_' + sk);
  // a companion who can do it: party first, then a support call from the box, then a loaned helper
  Fd.actor = sk => {
    const p = G.S.party.find(m => Fd.knows(m, sk));
    if (p) return { mon: p, where: 'party', name: D.nameOf(p), id: p.id };
    const b = G.S.box.find(m => Fd.knows(m, sk));
    if (b) return { mon: b, where: 'box', name: D.nameOf(b), id: b.id };
    const loan = G.S.loans && G.S.loans[sk];
    if (loan) return { mon: null, where: 'loan', name: '지원 ' + D.MONS[loan].n, id: loan };
    return null;
  };
  // why nobody can do it right now, in one line the player can act on
  function noActorLine(sk) {
    const S = Fd.SKILLS[sk];
    if (!Fd.unlocked(sk)) return `${S.n}${G.josa(S.n, '을', '를')} 배우면 지나갈 수 있을 것 같다.\n(배우는 곳: ${S.where})`;
    const apt = G.S.party.concat(G.S.box).find(m => Fd.canLearn(m, sk));
    if (apt) return `${S.n}${G.josa(S.n, '을', '를')} 익힌 동료가 없다.\n몬스터센터에서 ${G.eul(D.nameOf(apt))} 가르칠 수 있다.`;
    return `${S.n}${G.josa(S.n, '을', '를')} 해 줄 동료가 없다.\n(${S.where}에서 지원 동료를 빌릴 수 있다)`;
  }
  Fd.noActorLine = noActorLine;
  // discovered barriers and hints: 'map:x,y' -> kind, or a named note
  const seeB = (x, y, kind) => { (G.S.seenBarrier = G.S.seenBarrier || {})[W().map.id + ':' + x + ',' + y] = kind; };
  Fd.note = key => { (G.S.seenBarrier = G.S.seenBarrier || {})[key] = 'note'; };
  Fd.seenAt = (map, kind) => Object.keys(G.S.seenBarrier || {}).some(k => k.startsWith(map + ':') && (!kind || G.S.seenBarrier[k] === kind));
  Fd.seenKey = k => !!(G.S.seenBarrier && G.S.seenBarrier[k]);

  // ------------------------------------------------------------ small overlay effects on the field
  const fx = [];
  Fd.play = (n, draw) => new Promise(res => { fx.push({ t: 0, n, draw, res }); });
  function tickFx(T, cx, cy) {
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i];
      f.draw(T, cx, cy, f.t / f.n);
      if (++f.t > f.n) { fx.splice(i, 1); f.res(); }
    }
  }
  // the helper's little appearance: the lead hops out, anyone else is called in with a sparkle
  async function showActor(act, tx, ty, first) {
    const p = W().player, F = W().follower;
    const mini = G.mons.mini(act.id);
    const lead = act.where === 'party' && !F.hidden && F.id === act.id;
    const sx = lead ? F.x : p.x, sy = lead ? F.y : p.y;
    if (!lead) {
      sfx('sparkle');
      await G.say(act.where === 'box' ? `보관함의 ${G.eul(act.name)} 잠시 불렀다!` : act.where === 'loan' ? `${G.iga(act.name)} 도와주러 왔다!` : `${G.iga(act.name)} 앞으로 나섰다!`);
    }
    G.audio && G.audio.cry(act.id);
    const hop = first ? 46 : 24;
    if (lead) F.hidden = true;
    await Fd.play(hop, (T, cx, cy, k) => {
      const x0 = sx * 16 + 8, y0 = sy * 16 + 8, x1 = tx * 16 + 8, y1 = ty * 16 + 8;
      const kk = Math.min(1, k * 1.4), x = x0 + (x1 - x0) * kk * 0.55, y = y0 + (y1 - y0) * kk * 0.55 - Math.sin(kk * Math.PI) * 8;
      const img = mini[Math.abs(x1 - x0) >= Math.abs(y1 - y0) ? (x1 > x0 ? 'right' : 'left') : (y1 > y0 ? 'down' : 'up')] || mini.down;
      if (!lead && k < 0.25) { T.globalAlpha = k * 4; }
      T.drawImage(img, Math.round(x - cx - img.width / 2), Math.round(y - cy + 8 - img.height));
      T.globalAlpha = 1;
    });
    if (lead) { F.hidden = false; }
  }

  // ------------------------------------------------------------ tiles changed by play
  Fd.setTile = (mapId, x, y, ch) => {
    G.S.tiles = G.S.tiles || {};
    const t = G.S.tiles[mapId] = G.S.tiles[mapId] || {};
    t[x + ',' + y] = ch;
    W().rebuild(mapId);
  };
  const floorChar = m => m.def.vineFloor || (m.kind === 'cave' ? '_' : '.');

  // ------------------------------------------------------------ 덩굴 정리
  async function vineAt(x, y) {
    const m = W().map;
    seeB(x, y, 'vine');
    const act = Fd.unlocked('vine') && Fd.actor('vine');
    if (!act) { await G.say('얇은 덩굴이 얽혀 길을 막고 있다.\n' + noActorLine('vine')); return; }
    const first = !flag('fx_vine');
    const ok = await G.ask(`얇은 덩굴이 길을 막고 있다.\n${G.wa(act.name)} 덩굴 정리로 걷어 낼까?`);
    if (!ok) return;
    await showActor(act, x, y, first);
    sfx('leaf');
    const leaves = Array.from({ length: 14 }, (_, i) => [Math.cos(i * 1.7) * (6 + i % 5 * 3), -4 - (i * 7) % 12, i % 3]);
    await Fd.play(first ? 40 : 22, (T, cx, cy, k) => {
      leaves.forEach(([dx, dy, c]) => {
        T.fillStyle = ['#9ad060', '#7a8a3a', '#c4ec7a'][c];
        T.fillRect(Math.round(x * 16 + 8 + dx * (0.4 + k) - cx), Math.round(y * 16 + 10 + dy * k + k * k * 16 - cy), 3, 2);
      });
    });
    Fd.setTile(m.id, x, y, floorChar(m));
    set('fx_vine');
    if (first) await G.say(`${G.iga(act.name)} 덩굴을 살살 풀어 길을 열었다!\n(덩굴은 다시 자라지 않는다)`);
    if (m.def.onVine) await m.def.onVine(x, y);
  }

  // ------------------------------------------------------------ 바위깨기 (chapter 2)
  async function smashAt(x, y) {
    const m = W().map;
    seeB(x, y, 'smash');
    const act = Fd.unlocked('smash') && Fd.actor('smash');
    if (!act) { await G.say('금이 간 작은 바위가 길을 막고 있다.\n' + noActorLine('smash')); return; }
    const ok = await G.ask(`금이 간 작은 바위다.\n${G.wa(act.name)} 바위깨기로 치울까?`);
    if (!ok) return;
    await showActor(act, x, y, !flag('fx_smash'));
    sfx('rock'); W().shake = 6;
    const bits = Array.from({ length: 12 }, (_, i) => [Math.cos(i * 2.1) * (4 + i % 4 * 3), -6 - (i * 5) % 9, i % 3]);
    await Fd.play(28, (T, cx, cy, k) => bits.forEach(([dx, dy, c]) => { T.fillStyle = ['#9a8670', '#c2b296', '#5a4a3c'][c]; T.fillRect(Math.round(x * 16 + 8 + dx * (0.5 + k) - cx), Math.round(y * 16 + 10 + dy * k + k * k * 18 - cy), 3, 3); }));
    Fd.setTile(m.id, x, y, m.kind === 'cave' ? '_' : (m.def.smashFloor || '.'));
    set('fx_smash');
    if (m.def.onSmash) await m.def.onSmash(x, y);
  }
  // ------------------------------------------------------------ 자력 맞춤 (optional, chapter 2)
  async function magnetAt(x, y) {
    const m = W().map;
    seeB(x, y, 'magnet');
    const act = Fd.unlocked('magnet') && Fd.actor('magnet');
    if (!act) { await G.say('자성 광물로 잠긴 작은 자물쇠다. 방향이 어긋나 열리지 않는다.\n' + noActorLine('magnet')); return; }
    const ok = await G.ask(`자성 자물쇠다.\n${G.wa(act.name)} 자력 맞춤으로 방향을 맞춰 볼까?`);
    if (!ok) return;
    await showActor(act, x, y, !flag('fx_magnet'));
    sfx('zap');
    await Fd.play(30, (T, cx, cy, k) => { T.strokeStyle = `rgba(200,120,58,${1 - k})`; T.lineWidth = 2; T.beginPath(); T.arc(x * 16 + 8 - cx, y * 16 + 8 - cy, 4 + k * 14, 0, 7); T.stroke(); });
    Fd.setTile(m.id, x, y, m.kind === 'cave' ? '_' : '=');
    set('fx_magnet');
    await G.say('딸깍! 자물쇠의 방향이 맞춰지며 열렸다.');
    if (m.def.onMagnet) await m.def.onMagnet(x, y);
  }

  // ------------------------------------------------------------ 메아리 탐색
  async function echoAt(x, y) {
    const m = W().map;
    seeB(x, y, 'echo');
    const grp = (m.def.echoWalls || []).find(g => g.tiles.some(([X, Y]) => X === x && Y === y));
    if (!grp) { await G.say('물결 같은 무늬가 새겨진 벽이다.'); return; }
    const act = Fd.unlocked('echo') && Fd.actor('echo');
    if (!act) { await G.say('물결 같은 무늬가 새겨진 벽이다. 벽 너머에서 바람 소리가 들린다.\n' + noActorLine('echo')); return; }
    const ok = await G.ask(`벽 너머에서 희미한 바람 소리가 들린다.\n${G.wa(act.name)} 메아리 탐색을 해 볼까?`);
    if (!ok) return;
    await showActor(act, x, y, !flag('fx_echo'));
    sfx('psy');
    await Fd.play(50, (T, cx, cy, k) => {
      for (let i = 0; i < 4; i++) {
        const kk = k * 1.4 - i * 0.18; if (kk <= 0 || kk >= 1) continue;
        T.strokeStyle = `rgba(184,200,240,${1 - kk})`; T.lineWidth = 2;
        T.beginPath(); T.arc(x * 16 + 8 - cx, y * 16 + 8 - cy, 6 + kk * 40, 0, 7); T.stroke();
      }
    });
    grp.tiles.forEach(([X, Y]) => Fd.setTile(m.id, X, Y, grp.open || '_'));
    set('fx_echo');
    sfx('rock');
    await G.say('메아리가 벽의 얇은 곳을 찾아냈다!\n무늬 벽이 무너지며 숨은 통로가 드러났다.');
    if (grp.flag) set(grp.flag);
  }

  // ------------------------------------------------------------ 바위 밀기: round stones, holes, undo and reset
  const BKEY = () => W().map.id;
  function stoneState(mapId) { G.S.boulders = G.S.boulders || {}; return (G.S.boulders[mapId] = G.S.boulders[mapId] || {}); }
  Fd.boulders = () => {
    const m = W().map;
    if (!m || !m.def.boulders) return [];
    const st = stoneState(m.id);
    return m.def.boulders.map(b => { const s = st[b.id]; return s === 'sunk' ? null : { id: b.id, x: s ? s[0] : b.x, y: s ? s[1] : b.y, model: b.model, w: b.w, look: b.look }; }).filter(Boolean);
  };
  Fd.boulderAt = (x, y) => Fd.boulders().find(b => b.x === x && b.y === y) || null;
  let undo = [], slide = null, hinted = {};
  Fd.onEnter = (id) => { undo = []; slide = null; };
  function pushTarget(b, dir) {
    const [dx, dy] = W().DIRS[dir], m = W().map;
    const nx = b.x + dx, ny = b.y + dy;
    const t = m.tile(nx, ny);
    if (!t) return { nx, ny, ok: false };
    if (t.slot) return { nx, ny, ok: !W().entAt(nx, ny, null), slot: true };
    const blocked = t.solid || t.ledge || t.water || t.door || t.exit || W().entAt(nx, ny, null) || Fd.boulderAt(nx, ny) ||
      W().items.some(it => it.x === nx && it.y === ny) || (m.def.warps || []).some(w => w.x === nx && w.y === ny);
    return { nx, ny, ok: !blocked };
  }
  async function pushPrompt(b) {
    const m = W().map;
    if (!b.model) { seeB(b.x, b.y, 'push'); Fd.note(m.id + ':b:' + b.id); }
    if (W().pushActive) { await G.say('돌 쪽으로 걸어가면 한 칸씩 밀 수 있다.\n잘못 밀었다면 아래 화면의 [되돌리기]를 누르자.'); return; }
    if (b.model || m.def.gymStones) {
      W().pushActive = { name: '체육관 훈련 동료', id: 'jagalkong', where: 'gym' };
      await G.say('작은 모형 돌이다. 체육관의 훈련 동료 자갈콩이 시범으로 함께 밀어 준다고 한다!\n(돌 쪽으로 걸으면 밀린다)');
      return;
    }
    const act = Fd.unlocked('push') && Fd.actor('push');
    if (!act) { await G.say('둥글고 묵직한 돌이다.\n' + noActorLine('push')); return; }
    const ok = await G.ask(`둥글고 묵직한 돌이다.\n${G.wa(act.name)} 함께 밀어 볼까?`);
    if (!ok) return;
    await showActor(act, b.x, b.y, !flag('fx_push'));
    W().pushActive = act;
    if (!flag('fx_push')) {
      set('fx_push');
      await G.say(`${G.iga(act.name)} 돌 옆에 자리를 잡았다!\n돌 쪽으로 걸으면 함께 민다. 돌이 갈 칸은 미리 표시된다.`);
      await G.say('잘못 밀었다면 아래 화면의 [되돌리기]로 한 번 되돌릴 수 있다.\n방 입구의 돌판에서는 퍼즐을 처음 상태로 돌릴 수 있다.');
    }
  }
  Fd.tryPush = dir => {
    const p = W().player;
    const [dx, dy] = W().DIRS[dir];
    const b = Fd.boulderAt(p.x + dx, p.y + dy);
    if (!b || slide) return;
    if (!W().pushActive) {
      const k = W().map.id + b.id;
      if (!hinted[k]) { hinted[k] = 1; G.run(() => G.say('둥근 돌이 길을 막고 있다. A 버튼으로 살펴보자.')); }
      return;
    }
    const tg = pushTarget(b, dir);
    if (!tg.ok) { sfx('bump'); return; }
    const m = W().map, st = stoneState(m.id);
    undo.push({ map: m.id, id: b.id, from: [b.x, b.y], to: [tg.nx, tg.ny], slot: !!tg.slot, player: [p.x, p.y, p.dir] });
    if (undo.length > 1) undo.shift();   // one step back, as the training promised
    slide = { id: b.id, x0: b.x, y0: b.y, x1: tg.nx, y1: tg.ny, t: 0, n: 14 };
    st[b.id] = [tg.nx, tg.ny];
    sfx('rock');
    G.run(async () => {
      while (slide && slide.t < slide.n) await G.wait(1);
      slide = null;
      if (tg.slot) {
        st[b.id] = 'sunk'; st['@' + b.id] = [tg.nx, tg.ny];
        Fd.setTile(m.id, tg.nx, tg.ny, 'U');
        sfx('knock2');
        W().shake = 8;
        if (!m.def.quietSlots) await G.say('돌이 홈에 쿵 하고 맞물렸다! 통로가 이어졌다.');
        if (m.def.onSlot) await m.def.onSlot(tg.nx, tg.ny, b);
      }
    });
    W().tryMove(p, dir);   // the stone moved out of the way: step after it
  };
  Fd.undoPush = () => {
    const u = undo.pop();
    if (!u || u.map !== W().map.id || slide) return false;
    const st = stoneState(u.map), p = W().player;
    if (u.slot) { const tiles = G.S.tiles[u.map]; if (tiles) delete tiles[u.to[0] + ',' + u.to[1]]; delete st['@' + u.id]; W().rebuild(u.map); }
    st[u.id] = u.from.slice();
    if (u.slot && W().map.def.onUnslot) G.run(() => W().map.def.onUnslot(u));
    p.x = u.player[0]; p.y = u.player[1]; p.dir = u.player[2]; p.mv = null;
    W().placeFollower();
    sfx('recall');
    return true;
  };
  Fd.resetPuzzle = async () => {
    const m = W().map, st = stoneState(m.id);
    for (const b of m.def.boulders || []) {
      if (st[b.id] !== 'sunk') { delete st[b.id]; continue; }
      if (!m.def.resetAll) continue;   // seated stones normally stay; a scale (resetAll) gives them back too
      const at = st['@' + b.id];
      if (at && G.S.tiles && G.S.tiles[m.id]) delete G.S.tiles[m.id][at[0] + ',' + at[1]];
      delete st[b.id]; delete st['@' + b.id];
    }
    if (m.def.resetAll) W().rebuild(m.id);
    undo = [];
    sfx('rock');
    if (m.def.onReset) await m.def.onReset();
    await G.say('돌들이 처음 자리로 돌아왔다.');
  };
  Fd.sunkAt = (mapId, id) => { const st = stoneState(mapId); return st[id] === 'sunk' ? st['@' + id] || null : null; };

  // ------------------------------------------------------------ 파도타기 (sea, chapter 2)
  const refuseBoard = async (x, y) => {
    const m = W().map, nb = m.def.noBoard;
    const msg = typeof nb === 'function' ? nb(x, y) : nb;
    if (!msg) return false;
    await G.say(msg); return true;
  };
  async function seaAt(x, y, t) {
    const m = W().map;
    if (await refuseBoard(x, y)) return;
    seeB(x, y, 'sea');
    if (!Fd.unlocked('surf') || !G.S.bag.seaboard) {
      await G.say(m.def.seaLine || '파도가 높은 바다다. 경고 부표가 떠 있다.\n바다 항로는 해양학교의 파도타기 강습과 외해 항로도가 있어야 나갈 수 있다.');
      return;
    }
    const act = Fd.actor('surf');
    if (!act) { await G.say('파도가 높은 바다다.\n' + noActorLine('surf')); return; }
    const ok = await G.ask(`허용된 바다 항로다. 해상 안정판을 펼치고\n${G.wa(act.name)} 파도를 건널까?`);
    if (!ok) return;
    const first = !flag('fx_surf');
    await showActor(act, x, y, first);
    W().surfing = { id: act.id, name: act.name, sea: true };
    W().follower.hidden = true;
    sfx('water');
    const p = W().player, [dx, dy] = W().DIRS[p.dir];
    p.mv = { dx, dy, t: 0, n: 18, jump: true };
    set('fx_surf');
    if (first) { while (p.mv) await G.wait(1); await G.say(`${G.iga(act.name)} 앞에서 파도를 가른다.\n뭍이나 선착장에 닿으면 저절로 내린다.`); }
  }
  // ------------------------------------------------------------ 잔물타기 (water board)
  async function boardAt(x, y, t) {
    const m = W().map;
    if (t.sea) { await seaAt(x, y, t); return; }
    if (await refuseBoard(x, y)) return;
    if (!t.cavewater) seeB(x, y, 'water');
    if (t.cavewater) { await G.say('검고 차가운 지하수가 고여 있다.\n잔물타기로 건너기엔 위험해 보인다.'); return; }
    if (!Fd.unlocked('ripple') || !G.S.bag.board) {
      await G.say(m.def.waterLine || '잔잔한 물이다. 물길을 건너는 법을 배우면 저편에 갈 수 있을 것 같다.\n(배우는 곳: 물울림 체육관 · 리안의 강습)');
      return;
    }
    // on a river with marked currents, a 급류타기 companion takes the board once the skill is learned
    const cur = m.def.currents && Fd.canRideCurrent(m) ? Fd.actor('current') : null;
    const act = cur || Fd.actor('ripple');
    if (!act) { await G.say('잔잔한 물이다.\n' + noActorLine('ripple')); return; }
    const ok = await G.ask(cur ? `고정끈을 건 물판으로 ${G.wa(act.name)}\n물길을 건널까? (급류 띠도 건넌다)` : `잔잔한 물이다. 물판을 펼치고\n${G.wa(act.name)} 물길을 건널까?`);
    if (!ok) return;
    const first = !flag('fx_ripple');
    await showActor(act, x, y, first);
    W().surfing = { id: act.id, name: act.name, current: !!cur };
    W().follower.hidden = true;
    sfx('water');
    const p = W().player, [dx, dy] = W().DIRS[p.dir];
    p.mv = { dx, dy, t: 0, n: 18, jump: true };
    set('fx_ripple');
    if (first) { while (p.mv) await G.wait(1); await G.say(`${G.iga(act.name)} 앞에서 물판을 이끈다.\n뭍에 닿으면 저절로 내린다.`); }
  }
  // ------------------------------------------------------------ 급류타기 (chapter 3): marked current bands on a few rivers
  Fd.canRideCurrent = m => !!(m && m.def.currents && Fd.unlocked('current') && G.S.bag.bridle && Fd.actor('current'));
  Fd.currentLine = m => {
    if (!m.def.currents) return '물살이 하얗게 부서지는 급류다.\n표식이 없는 급류라 급류타기로도 건너지 않는 게 좋겠다.';
    if (!Fd.unlocked('current') || !G.S.bag.bridle) return `굵은 물결 띠가 하얗게 부서지는 급류다.\n잔물타기로는 건널 수 없다. (배우는 곳: ${Fd.SKILLS.current.where})`;
    return '굵은 물결 띠의 급류다.\n' + noActorLine('current');
  };
  Fd.rodeCurrent = (m, x, y) => { if (m.def.onCurrent) G.run(() => m.def.onCurrent(x, y)); };
  async function currentAt(x, y) {
    const m = W().map;
    seeB(x, y, 'rapids');
    if (!Fd.canRideCurrent(m)) { await G.say(Fd.currentLine(m)); return; }
    if (await refuseBoard(x, y)) return;
    const act = Fd.actor('current');
    const ok = await G.ask(`표식이 있는 급류다. 고정끈을 걸고\n${G.wa(act.name)} 건널까?`);
    if (!ok) return;
    const first = !flag('fx_current');
    await showActor(act, x, y, first);
    W().surfing = { id: act.id, name: act.name, current: true };
    W().follower.hidden = true;
    sfx('water');
    const p = W().player, [dx, dy] = W().DIRS[p.dir];
    p.mv = { dx, dy, t: 0, n: 18, jump: true };
    set('fx_current');
    if (first) { while (p.mv) await G.wait(1); await G.say(`${G.iga(act.name)} 고정끈을 팽팽히 당기며 물살을 가로지른다.\n뭍이나 선착장에 닿으면 저절로 내린다.`); }
  }
  Fd.seeFalls = (x, y) => seeB(x, y, 'falls');
  // a save made on the water before rides were kept: whoever can carry the board takes it
  Fd.fallbackRide = t => {
    const a = Fd.actor(t.sea ? 'surf' : t.rapids ? 'current' : 'ripple') || Fd.actor('ripple') || Fd.actor('surf');
    const lead = G.S.party[0];
    const who = a ? { id: a.id, name: a.name } : lead ? { id: lead.id, name: D.nameOf(lead) } : null;
    return who ? Object.assign(who, { sea: !!t.sea, current: !!t.rapids }) : null;
  };
  Fd.drawSurfer = (T, p, cx, cy, pp) => {
    const [px, py] = pp, bob = Math.floor(G.frame / 20) % 2;
    const sx = Math.round(px - cx), sy = Math.round(py - cy);
    const s = W().surfing, mini = G.mons.mini(s.id), [dx, dy] = W().DIRS[p.dir];
    const ahead = mini[p.dir] || mini.down;
    const front = () => T.drawImage(ahead, sx + 8 + dx * 11 - ahead.width / 2, sy + 15 + dy * 8 - ahead.height + bob);
    if (p.dir === 'up') front();
    // the folding board
    T.fillStyle = '#1c3c6a'; T.fillRect(sx - 1, sy + 9 + bob, 18, 7);
    T.fillStyle = '#f4f8fc'; T.fillRect(sx, sy + 10 + bob, 16, 5);
    T.fillStyle = '#4a90e2'; T.fillRect(sx + 2, sy + 11 + bob, 12, 1); T.fillRect(sx + 2, sy + 13 + bob, 12, 1);
    const fr = A.charFrames(p.char), img = fr[p.dir][0];
    T.drawImage(img, sx, sy + 12 - fr.h + bob);
    if (p.dir !== 'up') front();
    if (G.frame % 16 < 8) { T.fillStyle = 'rgba(230,246,255,0.8)'; T.fillRect(sx - 2 - dx * 4, sy + 15 + bob, 3, 1); T.fillRect(sx + 15 - dx * 4, sy + 15 + bob, 3, 1); }
  };

  // ------------------------------------------------------------ 괴력운반 (chapter 3): carry a ring-marked haul stone to its rail support
  // def.hauls: [{ id, x, y, to: [tx, ty], floor, seatFloor, flag, cond, condLine, lock, lockLine, look, onDone, onUndo }]
  const haulFrom = (m, x, y) => (m.def.hauls || []).find(h => h.x === x && h.y === y);
  const haulOnto = (m, x, y) => (m.def.hauls || []).find(h => h.to[0] === x && h.to[1] === y);
  Fd.hauled = (mapId, id) => !!(G.S.hauls && G.S.hauls[mapId] && G.S.hauls[mapId][id]);
  const clearTile = (mapId, x, y) => { if (G.S.tiles && G.S.tiles[mapId]) delete G.S.tiles[mapId][x + ',' + y]; };
  async function carry(m, h, back, act) {
    const from = back ? h.to : [h.x, h.y], to = back ? [h.x, h.y] : h.to;
    if (back) { Fd.setTile(m.id, from[0], from[1], '^'); } else Fd.setTile(m.id, from[0], from[1], h.floor || floorChar(m));
    sfx('rock'); W().shake = 6;
    const mini = G.mons.mini(act.id), img = mini.down;
    await Fd.play(44, (T, cx, cy, k) => {
      const kk = Math.min(1, k * 1.15), X = (from[0] + (to[0] - from[0]) * kk) * 16 - cx, Y = (from[1] + (to[1] - from[1]) * kk) * 16 - cy - Math.sin(kk * Math.PI) * 14;
      T.drawImage(A.shadow, Math.round((from[0] + (to[0] - from[0]) * kk) * 16 - cx + 1), Math.round((from[1] + (to[1] - from[1]) * kk) * 16 - cy + 12));
      T.drawImage(img, Math.round(X + 8 - img.width / 2), Math.round(Y + 22 - img.height));
      T.drawImage(A.haulStone, Math.round(X), Math.round(Y - 4));
    });
    if (back) { clearTile(m.id, to[0], to[1]); clearTile(m.id, from[0], from[1]); W().rebuild(m.id); }
    else Fd.setTile(m.id, to[0], to[1], '%');
    sfx('knock2'); W().shake = 8;
    W().placeFollower();
  }
  async function haulAt(x, y) {
    const m = W().map, h = haulFrom(m, x, y);
    seeB(x, y, 'bigrock');
    if (h && h.look) await h.look(h);   // a stone that guards a place (the legend sanctuaries note their entrance here)
    if (!Fd.unlocked('haul') || !G.S.bag.harness) {
      await G.say('고리와 레일 문양이 새겨진 커다란 운반석이다.\n둥근 돌과 달리 밀어서는 꿈쩍도 하지 않는다.');
      await G.say(`(괴력운반을 배우면 옆의 레일 받침으로 옮길 수 있을 것 같다. 배우는 곳: ${Fd.SKILLS.haul.where})`);
      return;
    }
    if (!h) { await G.say('고리 문양 운반석이다. 근처에 옮겨 놓을 레일 받침이 보이지 않는다.'); return; }
    if (h.cond && !h.cond()) { await G.say(h.condLine || '지금은 옮기지 않는 게 좋겠다.'); return; }
    const act = Fd.actor('haul');
    if (!act) { await G.say('고리 문양 운반석이다.\n' + noActorLine('haul')); return; }
    const ok = await G.ask(`고리 문양 운반석이다. 레일 받침으로\n${G.wa(act.name)} 함께 옮길까?`);
    if (!ok) return;
    const first = !flag('fx_haul');
    await showActor(act, x, y, first);
    await carry(m, h, false, act);
    G.S.hauls = G.S.hauls || {}; (G.S.hauls[m.id] = G.S.hauls[m.id] || {})[h.id] = 1;
    set('fx_haul');
    if (first) await G.say(`${G.wa(act.name)} 함께 운반석을 들어 레일 받침에 내려놓았다!\n(받침 앞에서 A 버튼을 누르면 처음 자리로 되돌릴 수 있다)`);
    if (h.flag) set(h.flag);
    if (h.onDone) await h.onDone(h);
  }
  async function seatAt(x, y, t) {
    const m = W().map;
    if (t.haulseat === 1) { await G.say('노란 레일 표시가 칠해진 돌 받침이다.\n고리 문양 운반석이 꼭 맞게 들어갈 것 같다.'); return; }
    const h = haulOnto(m, x, y);
    if (!h || !Fd.hauled(m.id, h.id)) { await G.say('운반석이 받침에 단단히 놓여 있다.'); return; }
    if (h.lock && h.lock()) { await G.say(h.lockLine || '운반석이 받침에 단단히 놓여 있다. 이제 이 자리가 제자리다.'); return; }
    const act = Fd.unlocked('haul') && Fd.actor('haul');
    if (!act) { await G.say('운반석이 받침에 놓여 있다.\n' + noActorLine('haul')); return; }
    const ok = await G.ask('받침에 놓인 운반석이다. 처음 자리로 되돌릴까?');
    if (!ok) return;
    await showActor(act, x, y, false);
    await carry(m, h, true, act);
    delete G.S.hauls[m.id][h.id];
    if (h.flag && !h.keepFlag) delete G.S.flags[h.flag];
    if (h.onUndo) await h.onUndo(h);
  }
  // the yard's reset board: every unlocked haul stone on this map back to where it started
  Fd.resetHauls = async () => {
    const m = W().map; let n = 0;
    for (const h of m.def.hauls || []) {
      if (!Fd.hauled(m.id, h.id) || (h.lock && h.lock())) continue;
      clearTile(m.id, h.x, h.y); clearTile(m.id, h.to[0], h.to[1]);
      delete G.S.hauls[m.id][h.id];
      if (h.flag && !h.keepFlag) delete G.S.flags[h.flag];
      n++;
    }
    W().rebuild(m.id); W().placeFollower();
    sfx('rock');
    await G.say(n ? '운반석이 모두 처음 자리로 돌아왔다.' : '되돌릴 운반석이 없다. 모두 처음 자리에 있다.');
  };

  // ------------------------------------------------------------ fishing from the marked mounds
  function biteLayer() {
    return new Promise(res => {
      const L = { modal: true, t: 0, bite: G.ri(70, 170), state: 'wait' };
      L.update = () => {
        L.t++;
        const press = G.hit('a') || G.hit('b');
        if (L.state === 'wait') {
          if (press) { G.popLayer(L); res('early'); return; }
          if (L.t >= L.bite) { L.state = 'bite'; L.t = 0; W().player.emote = 36; sfx('alert'); }
        } else if (L.state === 'bite') {
          if (press) { G.popLayer(L); res('hook'); return; }
          if (L.t > 34) { G.popLayer(L); res('miss'); }
        }
      };
      L.drawBot = B => {
        G.menus.header(B, '낚시', '');
        G.textC(B, L.state === 'bite' ? '지금이야! A 버튼!' : '찌를 지켜보는 중...', 128, 70, L.state === 'bite' ? '#c83a2a' : '#5a5648', null);
        G.addHot({ x: 0, y: 22, w: 256, h: 170, onTap: () => { G.pressed.a = 1; } });
      };
      L.drawTop = T => {
        const p = W().player, cx = W().cam.x, cy = W().cam.y, [dx, dy] = W().DIRS[p.dir];
        const bx = (p.x + dx) * 16 + 8 - cx, by = (p.y + dy) * 16 + 8 - cy + (L.state === 'bite' ? (L.t % 6 < 3 ? 2 : 0) : Math.floor(L.t / 30) % 2);
        T.strokeStyle = '#e8f0f8'; T.lineWidth = 1; T.beginPath(); T.moveTo(p.x * 16 + 8 + dx * 6 - cx, p.y * 16 - 4 - cy); T.lineTo(bx, by - 2); T.stroke();
        T.fillStyle = '#e04848'; T.fillRect(bx - 1, by - 3, 3, 3); T.fillStyle = '#ffffff'; T.fillRect(bx - 1, by - 3, 3, 1);
      };
      G.pushLayer(L);
    });
  }
  Fd.fish = async () => {
    const m = W().map, p = W().player;
    if (!G.S.bag.rod) { await G.say('물고기가 모여드는 둔덕이다. 낚싯대가 있으면 낚시를 할 수 있을 것 같다.'); return; }
    await G.say(`${P()}${G.josa(P(), '은', '는')} 낚싯대를 드리웠다...`, { auto: 30 });
    const r = await biteLayer();
    if (r === 'early') { await G.say('너무 일찍 당겼다! 찌만 출렁인다.'); return; }
    if (r === 'miss') { await G.say('앗, 놓치고 말았다...'); return; }
    const enc = D.rollFishing(m.id);
    if (!enc) { await G.say('아무것도 걸리지 않았다.'); return; }
    await G.say('걸렸다!', { auto: 24 });
    await G.battle.wild(enc);
  };

  // ------------------------------------------------------------ berry trees: one handful a day
  const today = () => { const d = new Date(); return d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate(); };
  async function berryAt(x, y) {
    const k = W().map.id + ':' + x + ',' + y;
    G.S.berries = G.S.berries || {};
    if (G.S.berries[k] === today()) { await G.say('회복열매가 아직 덜 익었다. 내일 다시 와 보자.'); return; }
    G.S.berries[k] = today();
    const n = G.ri(1, 2);
    D.addItem('berry', n); sfx('item');
    await G.say(`나무에서 회복열매를 ${n}개 땄다!`);
  }

  // ------------------------------------------------------------ interaction entry (called by the world after scripted objects)
  Fd.interact = async (x, y, t) => {
    const m = W().map, p = W().player;
    const b = Fd.boulderAt(x, y);
    if (b) { await pushPrompt(b); return true; }
    if (!t) return false;
    if (t.vine) { await vineAt(x, y); return true; }
    if (t.bigrock) { await haulAt(x, y); return true; }
    if (t.haulseat) { await seatAt(x, y, t); return true; }
    if (t.falls) { seeB(x, y, 'falls'); await G.say('물이 하얗게 쏟아져 내리는 폭포다.\n지금 배운 기술로는 거슬러 오를 수 없다. (수첩에 기록해 두었다)'); return true; }
    if (t.shellbed) { await G.say('줄무늬 조개들이 젖은 모래에 반쯤 묻혀 있다.'); return true; }
    if (t.echo) { await echoAt(x, y); return true; }
    if (t.rapids) {
      if (m.def.currents) { await currentAt(x, y); return true; }
      seeB(x, y, 'rapids'); await G.say('물살이 하얗게 부서지며 거세게 흐른다.\n잔물타기로는 건널 수 없는 급류다.'); return true;
    }
    if (t.marker) { await Fd.checkPost(x, y); return true; }
    if (t.crack) { await smashAt(x, y); return true; }
    if (t.magnet) { await magnetAt(x, y); return true; }
    if (t.pool) {   // 조수 웅덩이 (or a map's own basin): look in, and something may be there
      const [empty, look] = m.def.poolLine || ['맑은 조수 웅덩이다.', '조수 웅덩이를 가만히 들여다보았다...'];
      const enc = D.rollEncounter(m.id, 'pool');
      if (!enc) { await G.say(empty); return true; }
      await G.say(look, { auto: 30 });
      await G.battle.wild(enc);
      return true;
    }
    if (t.lever) { if (m.def.onLever) await m.def.onLever(x, y); else await G.say('녹슨 레버다.'); return true; }
    if (t.turn) { if (m.def.onTurn) await m.def.onTurn(x, y); else await G.say('돌아가는 발판 스위치다.'); return true; }
    if (t.gate) { await G.say(m.def.gateLine || '전기가 흐르는 차단막이다. 회로를 이으면 꺼질 것 같다.'); return true; }
    if (t.valve) { if (m.def.onValve) await m.def.onValve(x, y); else await G.say('수로 밸브다.'); return true; }
    if (t.brazier) { if (m.def.onBrazier) await m.def.onBrazier(x, y); else await G.say('공용 화로다. 따뜻한 불이 일렁인다.'); return true; }
    if (t.oldmark) { if (m.def.onMark) await m.def.onMark(x, y); else await G.say('오래된 길 표지석이다. 이끼 아래로 희미한 글자가 보인다.'); return true; }
    if (t.water) {
      const st = m.tile(p.x, p.y);
      if (st && st.fish) { await Fd.fish(); return true; }
      await boardAt(x, y, t);
      return true;
    }
    if (t.berry) { await berryAt(x, y); return true; }
    if (t.slot) { await G.say('둥근 홈이 파여 있다. 돌을 밀어 넣으면 딱 맞을 것 같다.'); return true; }
    if (t.crystal) { await G.say('보랏빛 돌이 은은하게 빛나며 낮게 울리고 있다.\n공명석이라고 불리는 광물이다.'); return true; }
    return false;
  };

  // ------------------------------------------------------------ drawing hooks
  Fd.drawUnder = (T, m, cx, cy) => {
    for (const b of Fd.boulders()) {
      let x = b.x * 16, y = b.y * 16;
      if (slide && slide.id === b.id) { const k = slide.t / slide.n; x = (slide.x0 + (slide.x1 - slide.x0) * k) * 16; y = (slide.y0 + (slide.y1 - slide.y0) * k) * 16; }
      if (b.model) {
        T.drawImage(A.boulder, 0, 0, 16, 16, Math.round(x - cx + 3), Math.round(y - cy + 5), 11, 11);
        if (b.w) G.textC(T, String(b.w), Math.round(x - cx + 8), Math.round(y - cy + 2), '#ffffff', 'rgba(0,0,0,0.7)');
        continue;
      }
      if (b.look === 'filter') {   // the replacement filter cartridge (교체 거름틀): a boxed mesh on runners
        const X = Math.round(x - cx), Y = Math.round(y - cy);
        T.drawImage(A.shadow, X + 1, Y + 12);
        T.fillStyle = '#2a4a50'; T.fillRect(X + 1, Y + 2, 14, 13); T.fillStyle = '#5ab0b8'; T.fillRect(X + 2, Y + 3, 12, 10);
        T.fillStyle = '#c8eef0'; for (let i = 3; i < 14; i += 3) T.fillRect(X + i, Y + 3, 1, 10); T.fillRect(X + 2, Y + 3, 12, 1);
        T.fillStyle = '#e3b23c'; T.fillRect(X + 2, Y + 13, 12, 2);
        continue;
      }
      T.drawImage(A.shadow, Math.round(x - cx + 1), Math.round(y - cy + 12));
      T.drawImage(A.boulder, Math.round(x - cx), Math.round(y - cy));
    }
    if (slide) slide.t++;
    // where the stone would go, shown before the push
    const p = W().player;
    if (W().pushActive && !p.mv && !slide) {
      const [dx, dy] = W().DIRS[p.dir];
      const b = Fd.boulderAt(p.x + dx, p.y + dy);
      if (b) {
        const tg = pushTarget(b, p.dir), X = tg.nx * 16 - cx, Y = tg.ny * 16 - cy;
        const on = Math.floor(G.frame / 16) % 2;
        T.strokeStyle = tg.ok ? (on ? '#7cf08a' : '#bfffc8') : '#f05a4a'; T.lineWidth = 2;
        T.strokeRect(X + 1, Y + 1, 14, 14);
        if (!tg.ok) { T.beginPath(); T.moveTo(X + 4, Y + 4); T.lineTo(X + 12, Y + 12); T.moveTo(X + 12, Y + 4); T.lineTo(X + 4, Y + 12); T.stroke(); }
      }
    }
  };
  // darkness for caves: the cave lamp (동굴등) widens the light around the player
  const [maskC, maskX] = A.cv(256, 192);
  Fd.lightRadius = m => { const d = m.def.dark; if (!d) return 0; return G.S.bag.lamp ? (d.lamp || 64) : (d.none || 20); };
  Fd.drawOver = (T, m, cx, cy) => {
    tickFx(T, cx, cy);
    if (W().shake > 0) W().shake--;
    const d = m.def.dark;
    if (!d) return;
    maskX.globalCompositeOperation = 'source-over';
    maskX.fillStyle = d.col || 'rgba(8,6,12,0.94)';
    maskX.clearRect(0, 0, 256, 192); maskX.fillRect(0, 0, 256, 192);
    maskX.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a) => {
      if (x < -r || y < -r || x > 256 + r || y > 192 + r) return;
      const g = maskX.createRadialGradient(x, y, r * 0.35, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      maskX.fillStyle = g; maskX.fillRect(x - r, y - r, r * 2, r * 2);
    };
    const p = W().player, [px, py] = W().pixelPos(p);
    const flick = Math.sin(G.frame / 7) * 1.5;
    hole(px + 8 - cx, py + 6 - cy, Fd.lightRadius(m) + flick, 1);
    // crystals and moonlit floor glow on their own
    const x0 = Math.max(0, Math.floor(cx / 16) - 3), y0 = Math.max(0, Math.floor(cy / 16) - 3);
    for (let ty = y0; ty < Math.min(m.h, y0 + 19); ty++) for (let tx = x0; tx < Math.min(m.w, x0 + 23); tx++) {
      const c = m.at(tx, ty);
      if (c === 'k') hole(tx * 16 + 8 - cx, ty * 16 + 8 - cy, 22, 0.8);
      else if (c === 'l') hole(tx * 16 + 8 - cx, ty * 16 + 8 - cy, 16, 0.55);
    }
    (d.spots || []).forEach(s => { if (!s.cond || s.cond()) hole(s.x * 16 + 8 - cx, s.y * 16 + 8 - cy, s.r || 30, s.a || 0.85); });
    T.drawImage(maskC, 0, 0);
  };
  // bottom screen: one-step undo while pushing stones
  Fd.drawPadExtra = B => {
    if (!W().pushActive || !Fd.boulders().length && !undo.length) return;
    const can = undo.length && undo[undo.length - 1].map === W().map.id;
    G.button(B, 162, 64, 88, 16, '되돌리기', { color: can ? '#f4f1e6' : '#ddd6c4', dark: '#a89f86', onTap: () => { if (!G.lock && Fd.undoPush()) {} } });
  };

  // ------------------------------------------------------------ getting out of a cave (구조 요청 / 탈출줄)
  Fd.inCave = () => { const m = W().map; return !!(m && m.def.rescue); };
  Fd.ropeOK = () => { const m = W().map; return Fd.inCave() && m.def.rescueKind !== 'water'; };
  Fd.rescue = async (viaRope) => {
    const m = W().map, r = typeof m.def.rescue === 'function' ? m.def.rescue() : m.def.rescue;
    if (!r) { await G.say('여기서는 쓸 수 없다.'); return false; }
    const water = m.def.rescueKind === 'water';
    const ok = await G.ask(viaRope ? '탈출줄을 써서 동굴 입구로 돌아갈까?' : water ? `해무나루 구조대를 부를까?\n(${r.n || '가까운 안전 부두'}까지 무료로 데려다 준다)` : '탐굴 구조 요청을 보낼까?\n(마지막으로 지나온 동굴 입구까지 무료로 돌아간다)');
    if (!ok) return false;
    if (viaRope) D.useItem('rope');
    W().surfing = null; W().pushActive = null;
    sfx('run');
    await G.fadeTo(1, 16);
    W().enter(r.map, r.x, r.y, r.dir || 'down');
    await G.fadeTo(0, 16);
    await G.say(viaRope ? '탈출줄을 따라 동굴 입구로 나왔다.' : water ? `구조대 보트가 와서 ${r.n || '안전한 부두'}까지 데려다 주었다.\n복구한 길과 의뢰 기록은 그대로 남아 있다.` : '탐굴 구조대의 안내로 동굴 입구까지 무사히 나왔다.\n열어 둔 지름길과 복구 기록은 그대로 남아 있다.');
    return true;
  };

  // ------------------------------------------------------------ center counter: free move review and field-skill teaching
  Fd.relearnable = mon => {
    const known = new Set(mon.moves.map(x => x.id)), out = [];
    const chain = [mon.id]; let o = D.origin(mon.id);
    while (o) { chain.push(o.from); o = D.origin(o.from); }
    for (const id of chain) for (const [lv, mv] of D.MONS[id].learn) if (lv <= mon.lv && !known.has(mv) && !out.includes(mv)) out.push(mv);
    return out;
  };
  Fd.centerService = async (who) => {
    for (;;) {
      const c = await G.choose(['기술 복습', '탐험 기술 가르치기', '그만두기'], { title: who || '길지기 상담', cancel: 2 });
      if (c === 2 || c < 0) return;
      if (c === 0) {
        const i = await G.menus.party({ title: '누구의 기술을 복습할까?', topMode: 'moves', mark: m => Fd.relearnable(m).length ? '복습 가능' : '' });
        if (i < 0) continue;
        const mon = G.S.party[i], list = Fd.relearnable(mon);
        if (!list.length) { await G.say(`${G.eun(D.nameOf(mon))} 지금 복습할 기술이 없다.`); continue; }
        const j = await G.list(list.map(id => ({ label: D.MOVES[id].n, right: `${D.MOVES[id].t} ${D.MOVES[id].p ? '위력 ' + D.MOVES[id].p : '변화'}` })), { title: '복습할 기술', sub: D.nameOf(mon) });
        if (j < 0) continue;
        await G.battle.learnMove(mon, list[j]);
      } else {
        const sks = Fd.ORDER.filter(Fd.unlocked);
        if (!sks.length) { await G.say('아직 배운 탐험 기술이 없구나. 훈련을 마치면 여기서 다른 동료에게도 가르쳐 줄 수 있단다.', { name: who }); continue; }
        const k = await G.choose(sks.map(s => Fd.SKILLS[s].n).concat(['돌아가기']), { title: '어떤 탐험 기술?', cancel: sks.length });
        if (k < 0 || k >= sks.length) continue;
        const sk = sks[k];
        const i = await G.menus.party({ title: Fd.SKILLS[sk].n + ' 누구에게?', topMode: 'stats', mark: m => Fd.knows(m, sk) ? '이미 익힘' : Fd.canLearn(m, sk) ? '배울 수 있음' : '' });
        if (i < 0) continue;
        const mon = G.S.party[i];
        if (Fd.knows(mon, sk)) { await G.say(`${G.eun(D.nameOf(mon))} 이미 ${G.eul(Fd.SKILLS[sk].n)} 익혔다.`); continue; }
        if (!Fd.canLearn(mon, sk)) { await G.say(`${G.eun(D.nameOf(mon))} ${G.eul(Fd.SKILLS[sk].n)} 배우기 어려워 보인다.`); continue; }
        Fd.teach(mon, sk); G.audio && G.audio.jingle('learn');
        await G.say(`${G.eun(D.nameOf(mon))} 탐험 기술 ${G.eul(Fd.SKILLS[sk].n)} 익혔다!\n(전투 기술 4칸과는 따로 기억한다)`);
      }
    }
  };

  // ------------------------------------------------------------ the notebook (수첩): goals, field skills, places to revisit
  const CHAPTER = () => G.CH;
  const CHS = () => [G.CH1, G.CH2, G.CH3].filter(Boolean);   // every chapter's map page (the world map can flip between them)
  Fd.CHS = CHS;
  Fd.notebook = async (start) => {
    const CH = CHAPTER();
    let tab = start || 0;
    for (;;) {
      // the legend journal (전설 기록) appears once anything about 금오 or 월백 has been noted
      const tabs = ['할 일', '탐험 기술', '다시 가 볼 곳'].concat(G.legend && G.legend.journal().length ? ['전설 기록'] : []);
      if (tab >= tabs.length) tab = 0;
      let items = [], detail = [];
      if (tab === 3) {
        const jn = G.legend.journal();
        items = jn.map(j => ({ label: j.t, right: j.who, color: j.done ? '#2c7a3a' : '#2c2f45' }));
        detail = jn.map(j => j.d);
      } else if (tab === 0) {
        const goals = CH.objectives().concat(G.legend ? G.legend.objectives() : []);
        items = goals.map(g => ({ label: (g.done ? '✓ ' : '● ') + g.t, color: g.done ? '#8a8270' : g.opt ? '#2c5ea8' : '#2c2f45' }));
        detail = goals.map(g => g.d || '');
      } else if (tab === 1) {
        Fd.ORDER.forEach(sk => {
          const S = Fd.SKILLS[sk], on = Fd.unlocked(sk), act = on && Fd.actor(sk);
          items.push({ label: (on ? '◆ ' : '◇ ') + S.n, right: on ? (act ? act.name : '익힌 동료 없음') : '아직', color: on ? '#2c2f45' : '#9a968c' });
          const apt = [...new Set(Fd.APT[sk].map(id => D.MONS[D.baseOf(id)].n))].join('·');
          detail.push(`${S.desc}\n배우는 곳: ${S.where}\n적성 계열: ${apt}`);
        });
      } else {
        const rv = CHS().flatMap(c => c.revisits ? c.revisits() : []).concat(G.legend ? G.legend.revisits() : []);
        items = rv.map(r => ({ label: (r.done ? '✓ ' : r.open ? '◆ ' : '◇ ') + r.t, right: r.done ? '완료' : r.open ? '갈 수 있음' : r.need, color: r.done ? '#8a8270' : r.open ? '#2c7a3a' : '#5a5648' }));
        detail = rv.map(r => r.d);
        if (!rv.length) { items = [{ label: '아직 기록이 없어요', color: '#9a968c' }]; detail = ['길을 막는 덩굴·바위·물가를 조사하면 필요한 기술과 함께 여기에 기록돼요.']; }
      }
      items.push({ label: '▶ ' + tabs[(tab + 1) % tabs.length], color: '#2c5ea8' });
      const i = await G.list(items, {
        title: '탐험 수첩', sub: tabs[tab],
        top: (T, s) => {
          G.menus.topCard(T, '탐험 수첩 · ' + tabs[tab]);
          G.box(T, 6, 24, 244, 160, G.STYLE.white, 5);
          if (s >= 0 && s < detail.length) G.wrap(detail[s], 226).slice(0, 9).forEach((ln, k) => G.text(T, ln, 14, 32 + k * 16, '#36363f', null));
          else G.wrap('아래 화면에서 항목을 고르면 자세한 내용이 보여요.', 226).forEach((ln, k) => G.text(T, ln, 14, 32 + k * 16, '#8a8270', null));
        }
      });
      if (i < 0) return;
      if (i === items.length - 1) { tab = (tab + 1) % tabs.length; continue; }
    }
  };

  // ------------------------------------------------------------ exploration record (지도 획득·탐험 공개 규칙)
  // Every tile you have actually seen is kept per map (and per floor), even before you own a map;
  // walls, closed doors and other floors are never revealed by sight.
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const exMem = {};
  function exArr(id) {
    if (exMem.__s !== G.S) { for (const k in exMem) delete exMem[k]; exMem.__s = G.S; }
    if (exMem[id]) return exMem[id];
    const def = G.MAPS[id]; if (!def) return null;
    const a = new Uint8Array(def.rows[0].length * def.rows.length);
    const s = G.S.explored && G.S.explored[id];
    if (s) for (let i = 0; i < a.length; i++) { const v = B64.indexOf(s[(i / 6) | 0]); if (v > 0 && (v >> (i % 6)) & 1) a[i] = 1; }
    return (exMem[id] = a);
  }
  function exSave(id) {
    const a = exMem[id]; let s = '';
    for (let i = 0; i < a.length; i += 6) { let v = 0; for (let k = 0; k < 6; k++) if (a[i + k]) v |= 1 << k; s += B64[v]; }
    (G.S.explored = G.S.explored || {})[id] = s;
  }
  const OPAQUE = { out: new Set('TY#cCq'), in: new Set('#W'), cave: new Set('#e') };
  function los(x0, y0, x1, y1, blocks) {
    let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), err = dx + dy, x = x0, y = y0;
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    while (!(x === x1 && y === y1)) {
      if ((x !== x0 || y !== y0) && blocks(x, y)) return false;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x += sx; }
      if (e2 <= dx) { err += dx; y += sy; }
    }
    return true;
  }
  Fd.explore = () => {
    const m = W().map;
    if (!m || !G.S || !G.S.flags.started) return;
    const a = exArr(m.id); if (!a) return;
    const p = W().player, op = OPAQUE[m.kind] || OPAQUE.out;
    let rx = 8, ry = 6;
    if (m.kind === 'cave') { rx = ry = m.def.dark ? Math.max(1, Math.round(Fd.lightRadius(m) / 18)) : 7; }
    else if (m.kind === 'in') { rx = 12; ry = 9; }
    const blocks = (x, y) => op.has(m.at(x, y));
    let changed = false;
    for (let y = Math.max(0, p.y - ry); y <= Math.min(m.h - 1, p.y + ry); y++)
      for (let x = Math.max(0, p.x - rx); x <= Math.min(m.w - 1, p.x + rx); x++) {
        const i = y * m.w + x; if (a[i]) continue;
        const dx = (x - p.x) / (rx + 0.5), dy = (y - p.y) / (ry + 0.5);
        if (dx * dx + dy * dy > 1 || !los(p.x, p.y, x, y, blocks)) continue;
        a[i] = 1; changed = true;
      }
    if (changed) exSave(m.id);
  };
  Fd.exploredShare = id => { const a = exArr(id); if (!a) return 0; let n = 0; for (const v of a) n += v; return n / a.length; };

  // maps you own (key items with a .map id) and the regions they cover
  Fd.ownedMaps = () => Object.keys(G.S.bag).filter(k => G.S.bag[k] > 0 && D.ITEMS[k] && D.ITEMS[k].map).map(k => D.ITEMS[k].map);
  Fd.hasMap = () => Fd.ownedMaps().length > 0;
  const inScope = nodeId => { const sc = Object.assign({}, ...CHS().map(c => c.scopes || {})); return Fd.ownedMaps().some(mp => (sc[mp] || []).includes(nodeId)); };
  const visitedNode = n => (G.S.visited || {})[n.id] || n.maps.some(id => G.S.explored && G.S.explored[id]);
  // a region is drawn when a map you own covers it, or (once you own any map) when you have walked it yourself
  const knownNode = n => inScope(n.id) || (Fd.hasMap() && visitedNode(n));

  // ------------------------------------------------------------ the map screens
  const MC = {
    out: { '.': '#a6d482', F: '#b2da88', M: '#86ba6c', a: '#d2bc92', ',': '#64b05e', ';': '#64b05e', z: '#bcb466', Z: '#dcc690', g: '#529c5e', j: '#7eb27e',
      '=': '#ead6a2', p: '#ead6a2', D: '#ead6a2', t: '#dcc494', G: '#cfc3a8', n: '#c2bbab', d: '#c48e56', s: '#eedcaa', h: '#ccac7c',
      w: '#6eaae2', o: '#7ab4e2', R: '#d4ecfa', T: '#40793f', Y: '#3a6a40', b: '#52903f', k: '#5e7e3c', '#': '#c98262', c: '#8e7e6a', C: '#9e8e78',
      q: '#aca494', r: '#9e9688', f: '#b48e5e', L: '#92c274', V: '#7ea442', Q: '#76767e', y: '#5e9e4c', l: '#a6d482', S: '#b48e5e', P: '#f08a4a',
      u: '#7e6e5e', U: '#bfad8e', m: '#2a2420', X: '#a6d482', K: '#4a90e2' },
    cave: { '.': '#9e8a72', _: '#ac9a80', ',': '#a49078', m: '#8e7e66', l: '#ccc4ec', '#': '#3a3028', e: '#5e4e6e', r: '#72624f', w: '#3e5e7e',
      u: '#4e4034', U: '#ac9a80', k: '#bcacff', H: '#2a2420', c: '#8e7e66', S: '#ccb494', L: '#7e6e5a', V: '#7ea442', v: '#e3b23c', g: '#5e6a74', t: '#ccc4b4', X: '#ac9a80', x: '#f2e2c2' }
  };
  const SOLIDISH = { out: new Set('TYbk#cCqrfQywoR'), cave: new Set('#erkw') };
  function rowsOf(id) {
    const def = G.MAPS[id], ov = (G.S.tiles && G.S.tiles[id]) || {};
    return def.rows.map((r, y) => { let row = r; for (const k in ov) { const [X, Y] = k.split(',').map(Number); if (Y === y) row = row.slice(0, X) + ov[k] + row.slice(X + 1); } return row; });
  }
  const BAR = { vine: ['덩굴', '#5c9a2c'], push: ['밀기', '#8a7a66'], water: ['물길', '#2c7ac8'], echo: ['메아리', '#7a5ab8'], bigrock: ['괴력', '#4a4a52'], rapids: ['급류', '#5a8ab0'],
    smash: ['깨기', '#b8834e'], sea: ['파도', '#1c4a88'], magnet: ['자력', '#c8783a'], falls: ['폭포', '#3a6aa8'] };
  // barriers you investigated that still stand on this map
  function barriersOn(id) {
    const rows = rowsOf(id), out = [], sb = G.S.seenBarrier || {};
    for (const k in sb) {
      if (!k.startsWith(id + ':')) continue;
      const m = k.slice(id.length + 1).match(/^(\d+),(\d+)$/); if (!m) continue;
      const x = +m[1], y = +m[2], kind = sb[k], c = (rows[y] || '')[x];
      const stands = kind === 'vine' ? c === 'V' : kind === 'echo' ? c === 'e' : kind === 'bigrock' ? c === 'Q' : kind === 'rapids' ? c === 'R' && !(G.MAPS[id].currents && Fd.unlocked('current')) : kind === 'water' ? !Fd.unlocked('ripple') : kind === 'push' ? !Fd.unlocked('push')
        : kind === 'smash' ? c === 'J' : kind === 'magnet' ? c === 'A' : kind === 'sea' ? !Fd.unlocked('surf') : kind === 'falls' ? c === 'W' : false;
      if (stands) out.push({ x, y, kind });
    }
    // one mark per kind per neighbourhood
    return out.filter((b, i) => !out.slice(0, i).some(o => o.kind === b.kind && Math.abs(o.x - b.x) + Math.abs(o.y - b.y) < 4));
  }
  function drawArea(T, id, bx, by, bw, bh, coarseOK) {
    const def = G.MAPS[id], kind = def.kind || 'out', rows = rowsOf(id);
    const w = rows[0].length, h = rows.length, a = exArr(id);
    const sc = Math.max(2, Math.min(9, Math.floor(Math.min(bw / w, bh / h))));
    const ox = Math.round(bx + (bw - w * sc) / 2), oy = Math.round(by + (bh - h * sc) / 2);
    const pal = MC[kind === 'cave' ? 'cave' : 'out'], solid = SOLIDISH[kind === 'cave' ? 'cave' : 'out'];
    T.fillStyle = '#e9dcbc'; T.fillRect(ox - 2, oy - 2, w * sc + 4, h * sc + 4);
    // the coarse layer a map giver knows: big shapes in 3x3 blocks, faded
    if (coarseOK && !def.secret) {
      for (let Y = 0; Y < h; Y += 3) for (let X = 0; X < w; X += 3) {
        let wa = 0, so = 0, op = 0;
        for (let y = Y; y < Math.min(h, Y + 3); y++) for (let x = X; x < Math.min(w, X + 3); x++) { const c = rows[y][x]; if ('woR'.includes(c) && kind !== 'cave') wa++; else if (solid.has(c)) so++; else op++; }
        const col = wa >= so && wa >= op ? '#a8cce8' : so > op ? (kind === 'cave' ? '#7e7064' : '#a8b894') : (kind === 'cave' ? '#c6b8a2' : '#e4dab8');
        T.fillStyle = col; T.fillRect(ox + X * sc, oy + Y * sc, Math.min(3, w - X) * sc, Math.min(3, h - Y) * sc);
      }
    }
    // tiles you have seen yourself, crisp
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!a || !a[y * w + x]) continue;
      T.fillStyle = pal[rows[y][x]] || (kind === 'cave' ? '#ac9a80' : '#a6d482');
      T.fillRect(ox + x * sc, oy + y * sc, sc, sc);
    }
    // a secret place known only from its examined entrance: the entrance and the safe footholds, in outline
    const ol = def.outline && def.outline();
    if (ol) ol.forEach(([x, y]) => {
      if (a && a[y * w + x]) return;
      T.fillStyle = 'rgba(96,84,150,0.5)'; T.fillRect(ox + x * sc + 1, oy + y * sc + 1, Math.max(1, sc - 2), Math.max(1, sc - 2));
    });
    // public buildings: known from the map giver, or once seen
    (def.buildings || []).forEach(b => {
      const seen = a && a[b.y * w + b.x];
      if (!(seen || (coarseOK && (b.k !== 'house' || b.label)))) return;
      const col = b.k === 'center' ? '#e05a4a' : b.k === 'shop' ? '#4a7ad8' : b.k === 'gym' ? '#e3b23c' : b.k === 'lab' ? '#2c7a8a' : b.label ? '#8a6ab8' : '#c98262';
      T.fillStyle = '#3a2e26'; T.fillRect(ox + b.x * sc - 1, oy + b.y * sc - 1, b.w * sc + 2, b.h * sc + 2);
      T.fillStyle = col; T.fillRect(ox + b.x * sc, oy + b.y * sc, b.w * sc, b.h * sc);
    });
    // investigated barriers with the skill they need
    barriersOn(id).forEach(b => {
      const [s, col] = BAR[b.kind], X = ox + b.x * sc + sc / 2, Y = oy + b.y * sc + sc / 2;
      G.disc(T, X, Y, Math.max(3, sc * 0.7), '#ffffff'); G.disc(T, X, Y, Math.max(2, sc * 0.55), col);
    });
    return { ox, oy, sc, w, h };
  }
  Fd.worldMap = async () => {
    const PAGES = CHS();
    if (!Fd.hasMap()) { await G.say('아직 지도가 없다.\n큰 나무와 표지판, 사람들의 길 안내를 따라 걸어 보자.'); return; }
    const nodeOf = (ch, id) => ch.nodes.find(n => n.maps.includes(id));
    const hereIn = ch => { const n = nodeOf(ch, W().map.id); return n ? n.id : null; };
    const shownIn = ch => ch.nodes.filter(knownNode);
    // start on the page of the chapter being played if it holds this place, else any page that does
    let page = PAGES.indexOf(G.CH);
    if (page < 0 || !hereIn(PAGES[page])) { const k = PAGES.findIndex(c => hereIn(c) && shownIn(c).length); if (k >= 0) page = k; }
    if (page < 0) page = 0;
    const pagesWith = () => PAGES.map((c, i) => shownIn(c).length ? i : -1).filter(i => i >= 0);
    await new Promise(res => {
      const L = { modal: true, view: 'world', floor: 0, page };
      const CH = () => PAGES[L.page];
      const here = () => hereIn(CH());
      const shown = () => shownIn(CH());
      const pickNode = () => { L.node = here() && shown().some(n => n.id === here()) ? here() : (shown()[0] || {}).id; };
      pickNode();
      const close = () => { G.popLayer(L); res(); };
      const move = d => { const list = shown(); if (!list.length) return; let i = list.findIndex(n => n.id === L.node); i = (i + d + list.length) % list.length; L.node = list[i].id; L.floor = 0; G.audio && G.audio.sfx('move'); };
      const flip = () => { const ps = pagesWith(); if (ps.length < 2) return; L.page = ps[(ps.indexOf(L.page) + 1) % ps.length]; L.view = 'world'; pickNode(); G.audio && G.audio.sfx('select'); };
      const nodeObj = () => CH().nodes.find(n => n.id === L.node);
      const outlineOnly = id => !!(G.MAPS[id].secret && !(G.S.explored && G.S.explored[id]) && G.MAPS[id].outline && G.MAPS[id].outline());
      const floors = () => { const n = nodeObj(); return n ? (n.show || n.maps.slice(0, 1)).filter(id => G.MAPS[id] && (!G.MAPS[id].secret || (G.S.explored && G.S.explored[id]) || outlineOnly(id))) : []; };
      L.update = () => {
        if (G.rep('left')) { if (L.view === 'world') move(-1); else { const f = floors(); L.floor = (L.floor + f.length - 1) % f.length; } }
        if (G.rep('right')) { if (L.view === 'world') move(1); else { const f = floors(); L.floor = (L.floor + 1) % f.length; } }
        if (G.hit('a')) { if (L.view === 'world' && L.node) { L.view = 'area'; L.floor = Math.max(0, floors().indexOf(W().map.id)); } else close(); }
        if (G.hit('b')) { if (L.view === 'area') L.view = 'world'; else close(); }
        if (G.hit('start') && L.view === 'world') flip();
      };
      L.drawTop = T => {
        T.fillStyle = '#e8dcbc'; T.fillRect(0, 0, 256, 192);
        T.fillStyle = 'rgba(160,130,90,0.18)'; for (let i = 0; i < 256; i += 8) T.fillRect(i, 0, 1, 192);
        T.fillStyle = '#2c2f45'; T.fillRect(0, 0, 256, 18);
        const target0 = G.S.settings.guide !== false && G.CH.target ? G.CH.target() : null;
        const target = target0 && CH().nodes.some(n => n.id === target0.node) ? target0 : null;
        if (L.view === 'world') {
          G.text(T, '아루 대륙 · ' + (CH().title || '지도'), 8, 3, '#fbf3dc', null);
          const list = shown(), ids = new Set(list.map(n => n.id)), h = here();
          T.fillStyle = '#a8cce8'; (CH().waters || []).forEach(w => { if (w.nodes.some(id => ids.has(id))) T.fillRect(w.r[0], w.r[1], w.r[2], w.r[3]); });
          CH().edges.forEach(([a, b]) => {
            if (!ids.has(a) || !ids.has(b)) return;
            const A1 = CH().nodes.find(n => n.id === a), B1 = CH().nodes.find(n => n.id === b), walked = visitedNode(A1) && visitedNode(B1);
            T.strokeStyle = walked ? '#b0894e' : 'rgba(140,120,90,0.5)'; T.lineWidth = 3; T.setLineDash(walked ? [] : [3, 3]);
            T.beginPath(); T.moveTo(A1.x, A1.y); T.lineTo(B1.x, B1.y); T.stroke(); T.setLineDash([]);
          });
          list.forEach(n => {
            const v = visitedNode(n), col = n.town ? (v ? '#e05a4a' : '#d8c4a4') : (v ? '#5aa848' : '#d8c4a4');
            if (n.town) { T.fillStyle = '#3a2e26'; T.fillRect(n.x - 6, n.y - 6, 12, 12); T.fillStyle = col; T.fillRect(n.x - 5, n.y - 5, 10, 10); }
            else { G.disc(T, n.x, n.y, 5, '#3a2e26'); G.disc(T, n.x, n.y, 4, col); }
            G.text(T, n.n, n.lx !== undefined ? n.lx : n.x + 8, n.ly !== undefined ? n.ly : n.y - 7, '#3a2e26', 'rgba(255,255,255,0.6)');
            // investigated barriers in this region
            const kinds = [...new Set(n.maps.flatMap(id => G.MAPS[id] ? barriersOn(id).map(b => b.kind) : []))];
            kinds.forEach((k, j) => { const [s, c] = BAR[k]; G.disc(T, n.x + 7 + j * 7, n.y + 7, 3, '#ffffff'); G.disc(T, n.x + 7 + j * 7, n.y + 7, 2, c); });
            if (target && target.node === n.id) { T.fillStyle = '#e04838'; T.fillRect(n.x - 1, n.y - 16, 2, 9); T.beginPath(); T.moveTo(n.x + 1, n.y - 16); T.lineTo(n.x + 8, n.y - 13); T.lineTo(n.x + 1, n.y - 10); T.fill(); }
            if (n.id === L.node) { T.strokeStyle = Math.floor(G.frame / 15) % 2 ? '#2c2f45' : '#e3b23c'; T.lineWidth = 2; T.strokeRect(n.x - 9, n.y - 9, 18, 18); }
            if (n.id === h) { G.disc(T, n.x, n.y, 2, Math.floor(G.frame / 10) % 2 ? '#ffffff' : '#e04838'); }
          });
        } else {
          const n = nodeObj(), f = floors(), id = f[L.floor] || f[0];
          G.text(T, n.n + (f.length > 1 ? ' · ' + (G.MAPS[id].floorName || G.MAPS[id].name) : ''), 8, 3, '#fbf3dc', null);
          if (!id) return;
          const g = drawArea(T, id, 6, 24, 244, 162, inScope(n.id));
          if (W().map.id === id && Math.floor(G.frame / 12) % 2) {
            const p = W().player; T.fillStyle = '#ffffff'; T.fillRect(g.ox + p.x * g.sc - 1, g.oy + p.y * g.sc - 1, g.sc + 2, g.sc + 2);
            T.fillStyle = '#e04838'; T.fillRect(g.ox + p.x * g.sc, g.oy + p.y * g.sc, g.sc, g.sc);
          }
          if (target && target.map === id && target.x !== undefined && exArr(id)[target.y * g.w + target.x]) {   // exact spot only once you have seen it
            const X = g.ox + target.x * g.sc + g.sc / 2, Y = g.oy + target.y * g.sc;
            T.fillStyle = '#e04838'; T.fillRect(X - 1, Y - 10, 2, 9); T.beginPath(); T.moveTo(X + 1, Y - 10); T.lineTo(X + 7, Y - 7); T.lineTo(X + 1, Y - 4); T.fill();
          }
        }
      };
      L.drawBot = B => {
        G.menus.header(B, '지도', Fd.ownedMaps().length + '장');
        const n = nodeObj();
        if (L.view === 'world') {
          const hn = CH().nodes.find(k => k.id === here()), cur = PAGES.map(c => nodeOf(c, W().map.id)).find(Boolean);
          G.text(B, '지금 있는 곳: ' + (hn ? hn.n : cur ? cur.n + ' (' + (PAGES.find(c => nodeOf(c, W().map.id)) || {}).title + ')' : W().map.def.name || ''), 12, 28, '#2c2f45', null);
          G.text(B, '고른 곳: ' + (n ? n.n : '-'), 12, 46, '#5a5648', null);
          const target = G.S.settings.guide !== false && G.CH.target ? G.CH.target() : null;
          if (target) G.wrap('목표: ' + target.t, 232).slice(0, 2).forEach((ln, k) => G.text(B, ln, 12, 64 + k * 15, '#b0403a', null));
          G.button(B, 12, 98, 44, 28, '◀', { onTap: () => move(-1) });
          G.button(B, 62, 98, 132, 28, '자세히 보기', { color: '#cfe6f6', dark: '#4a88b8', onTap: () => { if (L.node) { L.view = 'area'; L.floor = Math.max(0, floors().indexOf(W().map.id)); } } });
          G.button(B, 200, 98, 44, 28, '▶', { onTap: () => move(1) });
          G.textC(B, '점선: 아직 걷지 않은 길 · 색 점: 조사한 장벽', 128, 132, '#8a8270', null);
          const ps = pagesWith();
          if (ps.length > 1) {
            const nx = PAGES[ps[(ps.indexOf(L.page) + 1) % ps.length]];
            G.button(B, 12, 154, 112, 30, (nx.title || '다른 지도') + ' 보기', { color: '#f6e7b8', dark: '#b08a3a', onTap: flip });
          }
        } else {
          const f = floors();
          if (f.length > 1) {
            G.button(B, 12, 30, 40, 26, '◀', { onTap: () => { L.floor = (L.floor + f.length - 1) % f.length; } });
            G.textC(B, (L.floor + 1) + ' / ' + f.length + '  ' + (G.MAPS[f[L.floor]].floorName || G.MAPS[f[L.floor]].name), 128, 35, '#2c2f45', null);
            G.button(B, 204, 30, 40, 26, '▶', { onTap: () => { L.floor = (L.floor + 1) % f.length; } });
          } else G.textC(B, n ? n.n : '', 128, 35, '#2c2f45', null);
          Object.keys(BAR).forEach((k, j) => { const [s, c] = BAR[k]; const X = 10 + (j % 4) * 60, Y = 66 + Math.floor(j / 4) * 18; G.disc(B, X + 4, Y + 7, 4, c); G.text(B, s, X + 12, Y, '#36363f', null); });
          const fid = f[L.floor] || f[0];
          G.textC(B, fid && outlineOnly(fid) ? '보라 점: 입구에서 알아낸 입구·발판 개략' : inScope(n.id) ? '흐린 부분: 받은 지도의 큰 윤곽' : '받은 지도에 없는 곳: 걸은 길만 기록', 128, 128, '#8a8270', null);
          G.button(B, 12, 154, 112, 30, '전체 지도', { onTap: () => { L.view = 'world'; } });
        }
        const two = L.view === 'area' || pagesWith().length > 1;
        G.button(B, two ? 132 : 72, 154, 112, 30, '닫기', { onTap: close });
      };
      G.pushLayer(L);
    });
  };

  // ------------------------------------------------------------ 현장점검 의뢰: check three marked posts in regions you have opened, earn a 조사증표
  Fd.posts = () => CHS().flatMap(c => c.posts || []).filter(p => G.MAPS[p.map]);
  const postNode = p => CHS().flatMap(c => c.nodes).find(n => n.maps.includes(p.map));
  Fd.surveyBoard = async (who) => {
    const N = who || '게시판';
    if (!flag('badge2')) { await G.say('길지기 현장점검 게시판이다.\n"현장점검 의뢰는 두 번째 배지를 받은 길지기부터 맡을 수 있습니다."'); return; }
    const sv = G.S.survey;
    if (sv) {
      const left = sv.list.filter(id => !sv.done[id]);
      if (!left.length) {
        G.S.survey = null;
        D.addItem('token', 1); sfx('item');
        await G.say('현장점검 보고서를 게시판에 붙였다.\n조사증표 1개를 받았다! (증표 3개 = 진화석 1개)');
        return;
      }
      const names = left.map(id => { const p = Fd.posts().find(q => q.id === id); return p ? `${postNode(p).n} · ${p.n}` : id; });
      const L2 = await G.say('아직 확인하지 않은 표식:\n' + names.join('\n'), { keep: true });
      const c = await G.choose(['계속하기', '의뢰 그만두기'], { title: '현장점검 ' + (3 - left.length) + '/3', cancel: 0 });
      G.closeText(L2);
      if (c === 1) { G.S.survey = null; await G.say('의뢰를 내려놓았다. 언제든 다시 받을 수 있다.'); }
      return;
    }
    const open = Fd.posts().filter(p => { const n = postNode(p); return n && visitedNode(n); });
    if (open.length < 3) { await G.say('길지기 현장점검 게시판이다.\n아직 다녀온 지역이 적어서 맡을 수 있는 의뢰가 없다.'); return; }
    const ok = await G.ask('현장점검 의뢰: 이미 다녀온 길의 표식 세 곳을 확인하고 보고하기.\n포획도 전투도 필요 없다. 의뢰를 받을까?');
    if (!ok) return;
    const pick = open.slice().sort(() => G.rand() - 0.5).slice(0, 3);
    G.S.survey = { list: pick.map(p => p.id), done: {} };
    sfx('item');
    await G.say('확인할 표식:\n' + pick.map(p => `${postNode(p).n} · ${p.n}`).join('\n'));
    await G.say('파란 띠를 두른 돌 표식을 바라보고 A 버튼으로 확인하자.\n세 곳을 모두 확인하면 아무 게시판에서나 보고할 수 있다.');
  };
  Fd.checkPost = async (x, y) => {
    const m = W().map, p = Fd.posts().find(q => q.map === m.id && q.x === x && q.y === y);
    const sv = G.S.survey;
    if (!p) { await G.say('파란 띠를 두른 길지기 표식이다.'); return; }
    if (!sv || !sv.list.includes(p.id)) { await G.say(`길지기 현장점검 표식 · ${p.n}\n"길 상태 양호" 라고 새겨져 있다.`); return; }
    if (sv.done[p.id]) { await G.say('이미 확인한 표식이다.'); return; }
    sv.done[p.id] = 1; sfx('select');
    const n = sv.list.filter(id => sv.done[id]).length;
    await G.say(`표식의 상태를 확인하고 수첩에 적었다. (${n}/3)` + (n >= 3 ? '\n게시판에 가서 보고하자!' : ''));
  };

  // ------------------------------------------------------------ 진화석 교환소: buy unlocked stones, or trade three tokens for one
  Fd.stonesOpen = () => ['moonstone', 'chargestone', 'leafstone'].filter(() => flag('badge2')).concat(flag('badge3') ? ['firestone', 'wavestone'] : []);
  Fd.exchange = async (who) => {
    const N = who || '교환소';
    for (;;) {
      const st = Fd.stonesOpen(), tk = G.S.bag.token || 0;
      const opts = ['진화석 사기 (2,000원)', `증표로 바꾸기 (증표 ${tk}개)`].concat(G.S.bag.quartz ? ['울림 석영 → 증표'] : []).concat(['그만두기']);
      const c = await G.choose(opts, { title: N, cancel: opts.length - 1 });
      if (c < 0 || c === opts.length - 1) return;
      if (c === 0) { await G.menus.shop(st); continue; }
      if (c === 1) {
        if (tk < 3) { await G.say('조사증표 3개가 있으면 진화석 1개로 바꿔 드려요.\n연구소 게시판의 현장점검 의뢰로 증표를 받을 수 있어요.', { name: N }); continue; }
        const j = await G.choose(st.map(id => D.ITEMS[id].n).concat(['돌아가기']), { title: '어떤 진화석으로?', cancel: st.length });
        if (j < 0 || j >= st.length) continue;
        G.S.bag.token -= 3; if (!G.S.bag.token) delete G.S.bag.token;
        D.addItem(st[j], 1); sfx('item');
        await G.say(`조사증표 3개를 ${D.ITEMS[st[j]].n} 1개로 바꿨다!`);
        continue;
      }
      if (opts[c].startsWith('울림')) {
        D.useItem('quartz'); D.addItem('token', 1); sfx('item');
        await G.say('맑은 석영이네요! 연구 자료로 받을게요. 조사증표 1개를 드릴게요.', { name: N });
      }
    }
  };
})();

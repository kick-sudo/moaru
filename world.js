/* 모아루: 잠든 길의 노래 — overworld: maps, movement, NPCs, warps, encounters, touch pad */
'use strict';
(function () {
  const G = window.G, A = G.art;
  const Wd = G.world = {};
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  Wd.DIRS = DIRS; Wd.OPP = OPP;

  // ------------------------------------------------------------ time of day
  G.timePhase = () => {
    const mode = (G.S && G.S.settings.time) || 'real';
    if (mode === 'day') return 'day';
    if (mode === 'night') return 'night';
    const h = new Date().getHours();
    if (h >= 20 || h < 5) return 'night';
    if (h < 7) return 'dawn';
    if (h >= 18) return 'dusk';
    return 'day';
  };
  G.isNight = () => { const p = G.timePhase(); return p === 'night'; };

  // ------------------------------------------------------------ map building
  function buildMap(id) {
    const def = G.MAPS[id];
    // tiles changed by play (cleared vines, filled slots, opened walls) live in the save and patch the rows
    const ov = (G.S && G.S.tiles && G.S.tiles[id]) || {};
    const rows = def.rows.map((r, y) => {
      let row = r;
      for (const k in ov) { const [X, Y] = k.split(',').map(Number); if (Y === y && X >= 0 && X < row.length) row = row.slice(0, X) + ov[k] + row.slice(X + 1); }
      return row;
    });
    const m = { id, def, w: def.rows[0].length, h: def.rows.length, rows, kind: def.kind || 'out', floor: def.floor || '.' };
    m.legend = m.kind === 'out' ? A.OUT : m.kind === 'cave' ? A.CAVE : A.IN;
    m.at = (x, y) => (x < 0 || y < 0 || x >= m.w || y >= m.h) ? null : m.rows[y][x];
    m.tile = (x, y) => { const c = m.at(x, y); return c === null ? null : (m.legend[c] || m.legend['.']); };
    // ground canvas
    const [c, x] = A.cv(m.w * 16, m.h * 16);
    m.animTiles = [];
    for (let ty = 0; ty < m.h; ty++) for (let tx = 0; tx < m.w; tx++) {
      const t = m.tile(tx, ty);
      t.draw(x, m, tx, ty, tx * 16, ty * 16, 0);
      if (t.anim) m.animTiles.push([tx, ty]);
    }
    (def.buildings || []).forEach(b => A.drawBuilding(x, b, m, false));
    (def.props || []).forEach(p => A.drawProp(x, p));
    m.ground = c;
    // lit version of building windows for the night
    m.lights = [];
    (def.buildings || []).forEach(b => A.buildingLights(b, m).forEach(p => m.lights.push(p)));
    for (let ty = 0; ty < m.h; ty++) for (let tx = 0; tx < m.w; tx++) if (m.at(tx, ty) === 'l') m.lights.push({ x: tx * 16 + 8, y: ty * 16 + 3, lamp: 1 });
    // front blades of tall grass
    const [fc, fx] = A.cv(m.w * 16, m.h * 16);
    for (let ty = 0; ty < m.h; ty++) for (let tx = 0; tx < m.w; tx++) { const t = m.tile(tx, ty); if (t.tall) A.TALLFRONT(fx, tx * 16, ty * 16, A.hash(tx, ty), t.tall); }
    m.front = fc;
    // animation frames cache for animated tiles: draw on demand into small canvases
    m.animCache = {};
    // shrine stamps
    if (def.stamps) {
      const [sc, sx] = A.cv(m.w * 16, m.h * 16 + 32);
      def.stamps.forEach(s => A.drawShrine(sx, Object.assign({}, s, { y: s.y + 2 })));
      m.stamps = sc;
    }
    return m;
  }
  Wd.buildMap = buildMap;
  const mapCache = {};
  function getMap(id) { return mapCache[id] || (mapCache[id] = buildMap(id)); }
  Wd.getMap = getMap;
  // after a tile override: redraw that map (the current one is swapped in place, entities stay)
  Wd.rebuild = id => { delete mapCache[id]; if (Wd.map && Wd.map.id === id) Wd.map = getMap(id); };
  Wd.clearCache = () => { for (const k in mapCache) delete mapCache[k]; };

  // ------------------------------------------------------------ entities
  function makeEnt(o) {
    return Object.assign({ x: 0, y: 0, dir: 'down', mv: null, foot: 0, anim: 0, hidden: false, emote: 0, bob: 0 }, o);
  }
  Wd.player = makeEnt({ kind: 'player', char: 'boy' });
  // the water ride lives in the save: a game saved on the board loads back on the board
  Object.defineProperty(Wd, 'surfing', { configurable: true, enumerable: true,
    get: () => (G.S && G.S.ride) || null,
    set: v => { if (!G.S) return; if (v) G.S.ride = v; else delete G.S.ride; } });
  Wd.npcs = [];
  Wd.items = [];
  Wd.map = null;
  Wd.cam = { x: 0, y: 0 };
  Wd.banner = null;

  Wd.flag = k => !!(G.S && G.S.flags[k]);
  Wd.setFlag = (k, v) => { G.S.flags[k] = v === undefined ? 1 : v; };

  function spawnNPCs() {
    const def = Wd.map.def;
    Wd.npcs = (def.npcs || []).filter(n => !n.cond || n.cond()).map(n => makeEnt(Object.assign({ kind: 'npc', home: [n.x, n.y], timer: G.ri(60, 200) }, n)));
    Wd.items = (def.items || []).filter(it => !Wd.flag(it.flag)).map(it => Object.assign({}, it));
  }
  Wd.respawn = spawnNPCs;

  Wd.enter = (id, x, y, dir, opts) => {
    opts = opts || {};
    const prev = Wd.map && Wd.map.id;
    Wd.map = getMap(id);
    const p = Wd.player;
    p.x = x; p.y = y; p.dir = dir || p.dir; p.mv = null;
    Wd.menuQueued = false;
    if (prev !== id) { Wd.pushActive = null; G.field && G.field.onEnter(id, prev); }
    const here = Wd.map.tile(x, y) || {};
    if (Wd.surfing && !here.water && !here.rapids) Wd.surfing = null;
    // a save from before rides were kept, made on the water: put the player back on a board instead of leaving them stuck
    if (!Wd.surfing && (here.water || here.rapids) && G.field) Wd.surfing = G.field.fallbackRide(here);
    G.S.pos = { map: id, x, y, dir: p.dir };
    spawnNPCs();
    placeFollower();
    snapCam();
    G.field && G.field.explore();
    const def = Wd.map.def;
    if (def.name && prev !== id && !opts.quiet && (!G.MAPS[prev] || G.MAPS[prev].name !== def.name)) Wd.showBanner(def.name);
    if (def.heal) G.S.healPoint = { map: id, x: def.heal[0], y: def.heal[1], dir: 'up' };
    G.audio && G.audio.music(def.bgm || (Wd.map.kind === 'out' ? 'route' : 'town'));
    if (def.onEnter && !opts.noEvents) G.run(() => def.onEnter());
  };
  Wd.showBanner = name => { Wd.banner = { name, t: 0 }; };

  // ------------------------------------------------------------ collision
  function entAt(x, y, except) {
    if (Wd.player !== except && !Wd.player.hidden && occ(Wd.player, x, y)) return Wd.player;
    for (const n of Wd.npcs) if (n !== except && !n.hidden && occ(n, x, y)) return n;
    return null;
  }
  function occ(e, x, y) {
    if (e.x === x && e.y === y) return true;
    if (e.mv && e.x + e.mv.dx === x && e.y + e.mv.dy === y) return true;
    return false;
  }
  Wd.entAt = entAt;
  function solidAt(x, y, forNpc) {
    const m = Wd.map;
    const c = m.at(x, y);
    if (c === null) return true;
    const t = m.tile(x, y);
    if (t.solid) return true;
    if (t.ledge) return true;
    if (forNpc && (t.door || t.exit)) return true;
    if (m.def.blocks && m.def.blocks.some(b => b.x === x && b.y === y && (!b.cond || b.cond()))) return true;
    if (Wd.items.some(it => it.x === x && it.y === y)) return true;
    if (G.field && G.field.boulderAt(x, y)) return true;
    return false;
  }
  Wd.solidAt = solidAt;

  // try to move an entity one tile; returns true if a move started
  function tryMove(e, dir, run) {
    e.dir = dir;
    const [dx, dy] = DIRS[dir];
    const nx = e.x + dx, ny = e.y + dy;
    const m = Wd.map;
    const isP = e === Wd.player;
    // leaving the map edge -> linked map
    if (isP && m.at(nx, ny) === null) {
      const side = dy < 0 ? 'n' : dy > 0 ? 's' : dx < 0 ? 'w' : 'e';
      // a side may hold several exits: [{ to, dx|dy, from, until }] where from..until is the x (n/s) or y (e/w) range
      let ln = m.def.links && m.def.links[side];
      if (Array.isArray(ln)) { const c = side === 'n' || side === 's' ? nx : ny; ln = ln.find(l => c >= (l.from ?? -1e9) && c <= (l.until ?? 1e9)); }
      if (ln && (!ln.cond || ln.cond()) && edgeOpen(ln, nx, ny)) { G.run(() => edgeTravel(ln, nx, ny, dir)); return false; }
      bump(); return false;
    }
    const t = m.tile(nx, ny);
    if (isP && G.field) {
      // on the water board: water is open, land ends the ride
      if (Wd.surfing) {
        const warn = msg => { if (!Wd.seaWarned) { Wd.seaWarned = true; G.run(async () => { await G.say(msg); Wd.seaWarned = false; }); } };
        if (t && t.falls) { bump(); G.field.seeFalls(nx, ny); warn('물이 하얗게 쏟아져 내리는 폭포다.\n지금 배운 기술로는 거슬러 오를 수 없다.'); return false; }
        if (t && t.rapids) {   // marked current bands: only with 급류타기 and the bridle, and only where the current is marked as a route
          if (G.field.canRideCurrent(m) && !entAt(nx, ny, e)) { e.mv = { dx, dy, t: 0, n: run ? 10 : 14 }; G.field.rodeCurrent(m, nx, ny); return true; }
          bump(); warn(G.field.currentLine(m, nx, ny)); return false;
        }
        if (t && t.water && t.sea && !Wd.surfing.sea) {   // the river board is no match for the open sea
          bump();
          warn('파도가 높아 물판으로는 바다에 나갈 수 없다.');
          return false;
        }
        if (t && t.water && !entAt(nx, ny, e) && !(G.field.boulderAt(nx, ny))) {
          e.mv = { dx, dy, t: 0, n: run ? 10 : 14 };
          return true;
        }
        if (t && !t.water && !solidAt(nx, ny) && !entAt(nx, ny, e) && !t.ledge) {
          e.mv = { dx, dy, t: 0, n: 16, land: true };
          return true;
        }
        bump(); return false;
      }
      if (G.field.boulderAt(nx, ny)) { G.field.tryPush(dir); return false; }
    }
    // ledge: jump down over it
    if (t && t.ledge) {
      if (dir === 'down' && !solidAt(nx, ny + 1) && !entAt(nx, ny + 1, e)) {
        e.mv = { dx: 0, dy: 2, t: 0, n: 26, jump: true };
        G.audio && G.audio.sfx('jump');
        if (isP) followStep(e.x, e.y, e.mv);
        return true;
      }
      if (isP) bump();
      return false;
    }
    if (solidAt(nx, ny, !isP) || entAt(nx, ny, e)) { if (isP) bump(); return false; }
    if (!isP && !F.hidden && occ(F, nx, ny)) return false;
    if (!isP && e.home) {   // wanderers stay near home
      if (Math.abs(nx - e.home[0]) > (e.range || 2) || Math.abs(ny - e.home[1]) > (e.range || 2)) return false;
    }
    e.mv = { dx, dy, t: 0, n: run ? 8 : 16 };
    e.foot ^= 1;
    if (isP) followStep(e.x, e.y, e.mv);
    return true;
  }
  Wd.tryMove = tryMove;
  let bumpT = 0;
  function bump() { if (G.frame - bumpT > 18) { bumpT = G.frame; G.audio && G.audio.sfx('bump'); } }

  // scripted walk: returns a promise resolved when the step ends
  Wd.walk = (e, dir, n, run) => new Promise(async res => {
    for (let i = 0; i < (n || 1); i++) {
      while (e.mv) await G.wait(1);
      e.dir = dir;
      const [dx, dy] = DIRS[dir];
      if (Wd.map.at(e.x + dx, e.y + dy) === null) break;
      e.mv = { dx, dy, t: 0, n: run ? 8 : 16, forced: true };
      e.foot ^= 1;
      if (e === Wd.player) followStep(e.x, e.y, e.mv);
      while (e.mv) await G.wait(1);
    }
    res();
  });
  Wd.face = (e, dir) => { e.dir = dir; };
  Wd.facePlayer = e => {
    const p = Wd.player;
    const dx = p.x - e.x, dy = p.y - e.y;
    e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  };
  Wd.npc = id => Wd.npcs.find(n => n.id === id);

  function advance(e) {
    const mv = e.mv;
    mv.t++;
    if (mv.t >= mv.n) {
      e.x += mv.dx; e.y += mv.dy;
      e.mv = null;
      if (e === Wd.player && mv.land) { Wd.surfing = null; placeFollower(); G.audio && G.audio.sfx('jump'); }
      if (e === Wd.player && !mv.forced) arrived(mv);
    }
  }
  function pixelPos(e) {
    let px = e.x * 16, py = e.y * 16, jy = 0;
    if (e.mv) {
      const k = e.mv.t / e.mv.n;
      px += e.mv.dx * 16 * k; py += e.mv.dy * 16 * k;
      if (e.mv.jump) jy = -Math.sin(Math.PI * k) * 10;
    }
    return [px, py, jy];
  }
  Wd.pixelPos = pixelPos;

  // ------------------------------------------------------------ the lead monster walks one tile behind the player
  const F = Wd.follower = makeEnt({ kind: 'follower', hidden: true });
  Wd.followerMon = () => ((G.S && G.S.party) || []).find(m => m.hp > 0) || null;
  const dirOf = (dx, dy) => Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  function placeFollower() {
    const p = Wd.player, mon = Wd.followerMon();
    F.mv = null; F.stacked = false;
    if (!mon || Wd.surfing || !Wd.map) { F.hidden = true; return; }
    F.hidden = false; F.id = mon.id; F.dir = p.dir;
    const [dx, dy] = DIRS[OPP[p.dir]];
    const bx = p.x + dx, by = p.y + dy;
    if (Wd.map.at(bx, by) !== null && !solidAt(bx, by, true) && !entAt(bx, by, null)) { F.x = bx; F.y = by; }
    else { F.x = p.x; F.y = p.y; F.stacked = true; }   // tucked under the player until the first step
  }
  Wd.placeFollower = placeFollower;
  // the player is leaving (fx, fy): the follower takes that tile
  function followStep(fx, fy, pmv) {
    if (F.hidden) return;
    const dx = fx - F.x, dy = fy - F.y, d = Math.abs(dx) + Math.abs(dy);
    F.stacked = false;
    if (d === 0) return;
    F.dir = dirOf(dx, dy);
    if (d === 1) F.mv = { dx, dy, t: 0, n: pmv.jump ? 16 : pmv.n };
    else if (d === 2 && (dx === 0 || dy === 0)) F.mv = { dx, dy, t: 0, n: 26, jump: true };
    else { F.x = fx; F.y = fy; F.mv = null; }
  }
  const FOLLOW_TALK = [
    n => `${G.eun(n)} 기분 좋게 몸을 흔든다!`,
    n => `${G.eun(n)} 한 발짝 다가와 얼굴을 비빈다.`,
    n => `${G.eun(n)} 주위를 두리번거리며 냄새를 맡고 있다.`,
    n => `${G.eun(n)} 신이 나서 제자리에서 깡충 뛰었다!`,
    n => `${G.eun(n)} ${G.S.name}${G.josa(G.S.name, '을', '를')} 가만히 올려다본다.`
  ];
  async function followerTalk() {
    const mon = Wd.followerMon(); if (!mon) return;
    const n = G.data.nameOf(mon), st = G.data.stats(mon);
    F.dir = OPP[Wd.player.dir];
    F.emote = 48; F.heart = true;
    G.audio && G.audio.cry(mon.id);
    let line;
    if (mon.hp / st.hp < 0.4) line = `${G.eun(n)} 많이 지쳐 보인다... 쉬게 해 주자.`;
    else if (mon.status) line = `${G.eun(n)} 몸이 좋지 않아 보인다. 얼른 치료해 주자.`;
    else if (G.isNight() && G.chance(0.5)) line = `${G.eun(n)} 하품을 하며 졸린 눈을 비빈다.`;
    else line = G.pick(FOLLOW_TALK)(n);
    await G.wait(20);
    await G.say(line);
    F.heart = false;
  }

  // ------------------------------------------------------------ arriving on a tile
  // where a map-edge step lands, and whether you can stand there (water only while on the board)
  function edgeDest(ln, nx, ny) {
    const m = Wd.map, tgt = G.MAPS[ln.to];
    if (ny < 0) return { x: nx + (ln.dx || 0), y: tgt.rows.length - 1 };
    if (ny >= m.h) return { x: nx + (ln.dx || 0), y: 0 };
    if (nx < 0) return { x: tgt.rows[0].length - 1, y: ny + (ln.dy || 0) };
    return { x: 0, y: ny + (ln.dy || 0) };
  }
  function edgeOpen(ln, nx, ny) {
    if (!G.MAPS[ln.to]) return false;
    const d = edgeDest(ln, nx, ny), tm = getMap(ln.to), t = tm.tile(d.x, d.y);
    if (!t) return false;
    return !t.solid || (!!Wd.surfing && !!t.water) || (!!Wd.surfing && !!t.rapids && !!G.field && G.field.canRideCurrent(tm));
  }
  async function edgeTravel(ln, nx, ny, dir) {
    await G.fadeTo(1, 8);
    const m = Wd.map, tgt = G.MAPS[ln.to];
    let x = nx, y = ny;
    if (ln.side === undefined) {
      if (ny < 0) { y = tgt.rows.length - 1; x = nx + (ln.dx || 0); }
      else if (ny >= m.h) { y = 0; x = nx + (ln.dx || 0); }
      else if (nx < 0) { x = tgt.rows[0].length - 1; y = ny + (ln.dy || 0); }
      else { x = 0; y = ny + (ln.dy || 0); }
    }
    Wd.enter(ln.to, x, y, dir);
    await G.fadeTo(0, 8);
  }

  function arrived(mv) {
    const p = Wd.player, m = Wd.map;
    G.S.pos = { map: m.id, x: p.x, y: p.y, dir: p.dir };
    G.field && G.field.explore();
    G.S.steps = (G.S.steps || 0) + 1;
    const t = m.tile(p.x, p.y);
    // warps
    const w = (m.def.warps || []).find(w => w.x === p.x && w.y === p.y);
    if (w && (!w.dir || w.dir === p.dir)) { G.run(() => Wd.warp(w)); return; }
    // step triggers
    for (const tr of (m.def.triggers || [])) {
      if (p.x >= tr.x && p.x < tr.x + (tr.w || 1) && p.y >= tr.y && p.y < tr.y + (tr.h || 1) && (!tr.cond || tr.cond())) {
        G.run(() => tr.run());
        return;
      }
    }
    // trainers
    if (checkTrainers()) return;
    // wild encounters
    if (t && t.grass && !mv.jump && !Wd.surfing) {
      G.S.graceSteps = Math.max(0, (G.S.graceSteps || 0) - 1);
      if (G.S.graceSteps === 0 && G.chance(m.kind === 'cave' ? G.data.ENC_RATE_CAVE : G.data.ENC_RATE) && G.data.partyAlive()) {
        const enc = G.data.rollEncounter(m.id, t.grass);
        if (enc) G.run(() => G.battle.wild(enc));
      }
    } else if (t && (t.water || t.rapids) && Wd.surfing && !mv.jump && G.data.ENC[m.id] && G.data.ENC[m.id][t.sea ? 'sea' : 'current']) {   // sea routes and river currents have their own tables
      G.S.graceSteps = Math.max(0, (G.S.graceSteps || 0) - 1);
      if (G.S.graceSteps === 0 && G.chance(G.data.ENC_RATE * 0.8) && G.data.partyAlive()) {
        const enc = G.data.rollEncounter(m.id, t.sea ? 'sea' : 'current');
        if (enc) G.run(() => G.battle.wild(enc));
      }
    }
  }

  Wd.warp = async w => {
    G.audio && G.audio.sfx('door');
    await G.fadeTo(1, 10);
    const tm = G.MAPS[w.to];
    Wd.enter(w.to, w.tx, w.ty, w.tdir || (tm.kind === 'in' ? 'up' : 'down'));
    await G.fadeTo(0, 10);
  };

  // ------------------------------------------------------------ trainers
  function inSight(n) {
    if (!n.trainer || Wd.flag(n.trainer.flag)) return 0;
    const [dx, dy] = DIRS[n.dir];
    const p = Wd.player;
    for (let i = 1; i <= (n.sight || 3); i++) {
      const x = n.x + dx * i, y = n.y + dy * i;
      if (p.x === x && p.y === y) return i;
      if (solidAt(x, y, true) || entAt(x, y, n)) return 0;
    }
    return 0;
  }
  function checkTrainers() {
    for (const n of Wd.npcs) {
      const d = inSight(n);
      if (d) { G.run(() => trainerApproach(n, d)); return true; }
    }
    return false;
  }
  async function trainerApproach(n, d) {
    G.audio && G.audio.sfx('alert');
    n.emote = 40;
    await G.wait(40);
    for (let i = 1; i < d; i++) await Wd.walk(n, n.dir, 1);
    Wd.player.dir = OPP[n.dir];
    await Wd.trainerBattle(n);
  }
  Wd.trainerBattle = async n => {
    const tr = n.trainer;
    if (tr.before) await G.say(tr.before, { name: tr.title + ' ' + tr.name });
    const won = await G.battle.trainer(tr);
    if (won) {
      Wd.setFlag(tr.flag);
      if (tr.afterWin) await tr.afterWin(n);
    }
  };

  // ------------------------------------------------------------ interaction
  async function interact() {
    const p = Wd.player, m = Wd.map;
    const [dx, dy] = DIRS[p.dir];
    let x = p.x + dx, y = p.y + dy;
    // talk across a counter
    let t = m.tile(x, y);
    let n = entAt(x, y, p);
    if (!n && t && t.counter) { n = entAt(x + dx, y + dy, p); }
    if (!n && !F.hidden && !F.mv && F.x === x && F.y === y && !F.stacked) { await followerTalk(); return; }
    if (n && n.kind === 'npc') {
      if (!n.noTurn) Wd.facePlayer(n);
      if (n.trainer && !Wd.flag(n.trainer.flag)) { await Wd.trainerBattle(n); return; }
      if (n.trainer && n.trainer.after) { await G.say(n.trainer.after, { name: n.trainer.title + ' ' + n.trainer.name }); return; }
      if (n.talk) { await n.talk(n); return; }
      if (n.text) { await G.say(typeof n.text === 'function' ? n.text() : n.text, { name: n.name }); return; }
      return;
    }
    const it = Wd.items.find(i => i.x === x && i.y === y);
    if (it) {
      Wd.setFlag(it.flag);
      Wd.items = Wd.items.filter(i => i !== it);
      G.data.addItem(it.id, it.n || 1);
      G.audio && G.audio.sfx('item');
      await G.say(`${G.S.name}${G.josa(G.S.name, '은', '는')} ${G.data.ITEMS[it.id].n}${it.n > 1 ? ' ' + it.n + '개' : ''}${G.josa(G.data.ITEMS[it.id].n, '을', '를')} 주웠다!`);
      return;
    }
    const key = x + ',' + y;
    if (m.def.signs && m.def.signs[key]) { if (m.def.signNotes && m.def.signNotes[key]) G.field.note(m.def.signNotes[key]); await G.say(m.def.signs[key]); return; }
    if (m.def.objects && m.def.objects[key]) { await m.def.objects[key](); return; }
    if (G.field && await G.field.interact(x, y, t)) return;
    if (t && t.pc) { await G.menus.box(); return; }
    if (t && t.shelf) { await G.say('몬스터 이야기책이 빼곡히 꽂혀 있다.'); return; }
    if (t && t.tv) { await G.say('TV에서 아루 대륙 소식이 나온다.\n"오래된 길 곳곳에서 몬스터들의 이동이 늘고 있습니다."'); return; }
  }

  // ------------------------------------------------------------ update
  Wd.scene = {
    update(paused) {
      const p = Wd.player;
      // NPC idle wandering
      for (const n of Wd.npcs) {
        if (n.mv) advance(n);
        else if (!paused && !G.lock && n.move === 'wander' && --n.timer <= 0) {
          n.timer = G.ri(80, 220);
          tryMove(n, G.pick(['up', 'down', 'left', 'right']));
        } else if (!paused && !G.lock && n.move === 'turn' && --n.timer <= 0) {
          n.timer = G.ri(90, 200);
          n.dir = G.pick(['up', 'down', 'left', 'right']);
          if (n.trainer && checkTrainers()) {}
        }
        if (n.emote > 0) n.emote--;
      }
      if (F.mv) advance(F);
      if (F.emote > 0) F.emote--;
      { const mon = Wd.followerMon();
        if (!mon && !F.hidden) F.hidden = true;
        else if (mon && F.hidden && !Wd.surfing && !p.mv) placeFollower();
        else if (mon && !F.hidden) F.id = mon.id; }
      if (p.mv) {
        if (G.hit('start') && !paused && !G.lock) Wd.menuQueued = true;   // menu tapped mid-step: open it once the step lands
        advance(p);
        if (p.mv) return;
      }
      if (paused || G.lock) { Wd.menuQueued = false; return; }
      // input
      if (G.hit('start') || Wd.menuQueued) { Wd.menuQueued = false; G.run(() => G.menus.start()); return; }
      if (G.hit('a')) { G.run(() => interact()); return; }
      const run = G.btn('b') || !!G.S.settings.run;
      const d = ['up', 'down', 'left', 'right'].find(k => G.btn(k));
      if (d) {
        // a short tap on a new direction only turns; holding (or turning mid-walk) moves
        const pressStart = G.frame - G.holdT[d];
        if (p.dir !== d && !p.wasMoving && G.holdT[d] <= 6) { p.dir = d; p.turnPress = pressStart; }
        else if (!p.wasMoving && p.turnPress === pressStart && G.holdT[d] <= 6) { /* still inside the turning tap */ }
        else tryMove(p, d, run);
      }
      p.wasMoving = !!p.mv;
    },
    drawTop(T) { drawWorld(T); },
    drawBot(B) { drawPad(B); }
  };

  // ------------------------------------------------------------ camera
  function snapCam() {
    const m = Wd.map, p = Wd.player;
    const [px, py] = pixelPos(p);
    const W = m.w * 16, H = m.h * 16;
    Wd.cam.x = W <= G.W ? Math.round((W - G.W) / 2) : G.clamp(Math.round(px + 8 - G.W / 2), 0, W - G.W);
    Wd.cam.y = H <= G.H ? Math.round((H - G.H) / 2) : G.clamp(Math.round(py + 8 - G.H / 2), 0, H - G.H);
  }
  Wd.snapCam = snapCam;

  // ------------------------------------------------------------ drawing
  function drawEnt(T, e, cx, cy) {
    if (e.hidden) return;
    const fr = A.charFrames(e.char);
    const [px, py, jy] = pixelPos(e);
    let idx = 0;
    if (e.mv) {
      const k = e.mv.t / e.mv.n;
      idx = k < 0.5 ? (e.foot ? 1 : 3) : 0;
      if (e.mv.jump) idx = 1;
    }
    const img = fr[e.dir][idx];
    const sx = Math.round(px - cx), sy = Math.round(py - cy);
    if (e.swim) {   // a swimmer in the water: head and shoulders above a ring of ripples
      const bob = Math.floor(G.frame / 22) % 2, cut = fr.h - 8;
      T.drawImage(img, 0, 0, 16, cut, sx, Math.round(sy + 16 - fr.h + 6 + bob), 16, cut);
      T.fillStyle = 'rgba(230,246,255,0.85)'; T.fillRect(sx + 1, sy + 13 + bob, 14, 1); T.fillRect(sx + 3, sy + 14 + bob, 10, 1);
      if (e.emote > 0) T.drawImage(A.bubble, sx + 2, sy + 16 - fr.h - 9 + Math.min(0, e.emote - 36));
      return;
    }
    T.drawImage(A.shadow, sx + 1, sy + 12);
    T.drawImage(img, sx, Math.round(sy + 16 - fr.h + jy - (idx === 1 || idx === 3 ? 1 : 0)));
    if (e.emote > 0) T.drawImage(A.bubble, sx + 2, sy + 16 - fr.h - 15 + Math.min(0, e.emote - 36));
  }
  function drawFollower(T, e, cx, cy) {
    const mini = G.mons.mini(e.id);
    const img = mini[e.dir] || mini.down;
    const [px, py, jy] = pixelPos(e);
    const hop = e.mv && !e.mv.jump ? Math.round(Math.sin(Math.PI * e.mv.t / e.mv.n) * 2) : (Math.floor(G.frame / 40) % 2);
    const sx = Math.round(px - cx + 8 - img.width / 2), sy = Math.round(py - cy + 16 - img.height + jy - hop);
    T.drawImage(A.shadow, Math.round(px - cx + 1), Math.round(py - cy + 12));
    T.drawImage(img, sx, sy);
    if (e.emote > 0) T.drawImage(e.heart ? A.heart : A.bubble, Math.round(px - cx + 2), sy - 14 + Math.min(0, e.emote - 44));
  }
  // monsters living in the world (the starters at play, a rescued 볼도리...): drawn from their follower minis
  function drawMonNpc(T, e, cx, cy) {
    if (e.hidden) return;
    const mini = G.mons.mini(e.mon);
    const [px, py, jy] = pixelPos(e);
    let img = mini[e.dir] || mini.down, bob = 0, dx = 0;
    const f = G.frame + (e.home ? e.home[0] * 7 : 0);
    if (e.act === 'hop') bob = Math.max(0, Math.round(Math.sin(f / 8) * 4));
    else if (e.act === 'sniff') { img = Math.floor(f / 70) % 2 ? mini.left : mini.right; bob = Math.floor(f / 18) % 2; }
    else if (e.act === 'splash') bob = Math.floor(f / 12) % 2 * 2;
    else if (e.act === 'struggle') dx = Math.floor(f / 5) % 2 ? 1 : -1;
    else bob = Math.floor(f / 40) % 2;
    if (e.mv) bob = Math.round(Math.sin(Math.PI * e.mv.t / e.mv.n) * 2);
    const sx = Math.round(px - cx + 8 - img.width / 2 + dx), sy = Math.round(py - cy + 16 - img.height + jy - bob);
    T.drawImage(A.shadow, Math.round(px - cx + 1), Math.round(py - cy + 12));
    T.drawImage(img, sx, sy);
    if (e.act === 'splash' && f % 40 < 20) { T.fillStyle = '#c8ecff'; T.fillRect(sx - 2, sy + img.height - 6 - (f % 40) / 4, 2, 2); T.fillRect(sx + img.width, sy + img.height - 8 - (f % 40) / 5, 2, 2); }
    if (e.emote > 0) T.drawImage(e.heart ? A.heart : A.bubble, Math.round(px - cx + 2), sy - 14 + Math.min(0, e.emote - 36));
  }
  function grassOver(T, e, cx, cy) {
    const m = Wd.map;
    const tiles = [[e.x, e.y]];
    if (e.mv && !e.mv.jump) tiles.push([e.x + e.mv.dx, e.y + e.mv.dy]);
    for (const [tx, ty] of tiles) {
      const t = m.tile(tx, ty);
      if (t && t.grass) T.drawImage(m.front, tx * 16, ty * 16 + 7, 16, 9, tx * 16 - cx, ty * 16 + 7 - cy, 16, 9);
    }
  }
  function animFrame(m, tx, ty, f) {
    const key = tx + ',' + ty + ',' + f;
    let c = m.animCache[key];
    if (!c) {
      const [cc, x] = A.cv(16, 16);
      m.tile(tx, ty).draw(x, m, tx, ty, 0, 0, f);
      c = m.animCache[key] = cc;
    }
    return c;
  }
  function drawWorld(T) {
    const m = Wd.map;
    if (!m) return;
    const p = Wd.player;
    // follow camera
    const [ppx, ppy] = pixelPos(p);
    const W = m.w * 16, H = m.h * 16;
    Wd.cam.x = W <= G.W ? Math.round((W - G.W) / 2) : G.clamp(Math.round(ppx + 8 - G.W / 2), 0, W - G.W);
    Wd.cam.y = H <= G.H ? Math.round((H - G.H) / 2) : G.clamp(Math.round(ppy + 8 - G.H / 2), 0, H - G.H);
    const cx = Wd.cam.x, cy = Wd.cam.y;
    T.fillStyle = m.kind === 'in' ? '#141018' : m.kind === 'cave' ? '#100c0a' : '#1c4623';
    T.fillRect(0, 0, G.W, G.H);
    T.drawImage(m.ground, -cx, -cy);
    // animated tiles in view
    const f = Math.floor(G.frame / 24) % 4, ff = Math.floor(G.frame / 30) % 2;
    for (const [tx, ty] of m.animTiles) {
      const sx = tx * 16 - cx, sy = ty * 16 - cy;
      if (sx < -16 || sy < -16 || sx > G.W || sy > G.H) continue;
      const isW = m.at(tx, ty) === 'w' || m.at(tx, ty) === 'W';
      T.drawImage(animFrame(m, tx, ty, isW ? f : ff), sx, sy);
    }
    if (m.stamps) T.drawImage(m.stamps, -cx, -cy - 32);
    // items
    for (const it of Wd.items) T.drawImage(A.cube, it.x * 16 - cx, it.y * 16 - cy);
    if (G.field) G.field.drawUnder(T, m, cx, cy);
    // entities sorted by y
    const ents = Wd.npcs.concat(F.hidden || F.stacked ? [p] : [F, p]).sort((a, b) => (pixelPos(a)[1] - pixelPos(b)[1]) || (a === F ? -1 : b === F ? 1 : 0));
    for (const e of ents) {
      if (e === p && Wd.surfing && G.field) { G.field.drawSurfer(T, p, cx, cy, pixelPos(p)); continue; }
      e === F ? drawFollower(T, e, cx, cy) : e.mon ? drawMonNpc(T, e, cx, cy) : drawEnt(T, e, cx, cy);
    }
    for (const e of ents) if (!e.hidden) grassOver(T, e, cx, cy);
    if (m.def.drawExtra) m.def.drawExtra(T, cx, cy);
    if (G.field) G.field.drawOver(T, m, cx, cy);
    // time of day tint (outdoors)
    if (m.kind === 'out') tint(T, m, cx, cy);
    // location banner
    if (Wd.banner) {
      const b = Wd.banner;
      b.t++;
      const k = b.t < 14 ? b.t / 14 : b.t > 110 ? Math.max(0, 1 - (b.t - 110) / 14) : 1;
      const w = Math.ceil(G.tw(b.name)) + 26;
      const y = Math.round(-26 + 30 * k);
      G.box(T, 4, y, w, 22, ['#3a2a1a', '#c98d4f', '#f6e2b6'], 3);
      G.text(T, b.name, 17, y + 5, '#3a2a1a', 'rgba(255,255,255,0.4)');
      if (b.t > 126) Wd.banner = null;
    }
  }
  const TINT = { night: 'rgb(96,104,170)', dusk: 'rgb(244,190,160)', dawn: 'rgb(220,200,236)' };
  function tint(T, m, cx, cy) {
    const ph = G.timePhase();
    if (ph === 'day') return;
    T.globalCompositeOperation = 'multiply';
    T.fillStyle = TINT[ph];
    T.fillRect(0, 0, G.W, G.H);
    T.globalCompositeOperation = 'source-over';
    if (ph === 'night' || ph === 'dusk') {
      T.globalCompositeOperation = 'lighter';
      for (const l of m.lights) {
        const x = l.x - cx, y = l.y - cy;
        if (x < -30 || y < -30 || x > G.W + 30 || y > G.H + 30) continue;
        const g = T.createRadialGradient(x, y, 1, x, y, l.lamp ? 22 : 12);
        g.addColorStop(0, ph === 'night' ? 'rgba(255,214,120,0.55)' : 'rgba(255,214,120,0.25)');
        g.addColorStop(1, 'rgba(255,214,120,0)');
        T.fillStyle = g;
        T.fillRect(x - 24, y - 24, 48, 48);
      }
      T.globalCompositeOperation = 'source-over';
    }
  }

  // ------------------------------------------------------------ bottom screen: touch pad + party strip
  const PADBG = (() => {
    const [c, x] = A.cv(256, 192);
    x.fillStyle = '#efe6cf'; x.fillRect(0, 0, 256, 192);
    for (let i = -192; i < 256; i += 12) { x.fillStyle = 'rgba(214,190,140,0.35)'; for (let k = 0; k < 192; k++) x.fillRect(i + k, k, 5, 1); }
    x.fillStyle = '#2c2f45'; x.fillRect(0, 0, 256, 20);
    x.fillStyle = '#e3b23c'; x.fillRect(0, 20, 256, 2);
    return c;
  })();
  function hpCol(r) { return r > 0.5 ? '#3fc35a' : r > 0.2 ? '#f2c230' : '#ea4a3c'; }
  G.hpCol = hpCol;
  function drawPad(B) {
    B.drawImage(PADBG, 0, 0);
    const m = Wd.map;
    // header: place + clock
    G.text(B, m ? (m.def.name || '') : '', 6, 4, '#fbf3dc', null);
    const now = new Date();
    const ph = G.timePhase();
    const clock = (G.S.settings.time === 'real') ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` : (ph === 'night' ? '밤' : '낮');
    B.drawImage(ph === 'night' || ph === 'dusk' ? A.moon : A.sun, 250 - G.tw(clock) - 16, 4);
    G.textR(B, clock, 250, 4, '#fbf3dc', null);
    // party strip
    const party = G.S.party;
    for (let i = 0; i < 6; i++) {
      const x = 6 + i * 41, y = 26;
      G.rrect(B, x, y, 38, 34, 4, '#2c2f45');
      G.rrect(B, x + 1, y + 1, 36, 32, 3, i < party.length ? '#fdfaf0' : '#d8cfb8');
      const mon = party[i];
      if (mon) {
        const ic = G.mons.icon(mon.id);
        B.drawImage(ic, x + 3, y - 1);
        const st = G.data.stats(mon);
        const r = mon.hp / st.hp;
        G.rrect(B, x + 4, y + 27, 30, 4, 1, '#3a3d52');
        if (r > 0) B.fillStyle = hpCol(r), B.fillRect(x + 5, y + 28, Math.max(1, Math.round(28 * r)), 2);
        B.font = G.FONT;
        if (mon.hp <= 0) G.text(B, '기절', x + 13, y + 12, '#c83c32', null);
        else if (mon.status) G.text(B, G.data.STATUS[mon.status].short, x + 25, y + 13, '#7a3ab0', null);
      }
    }
    // stick zone: everything left of the B button below the party strip (registered first so buttons win)
    G.addHot({ kind: 'joy', x: 0, y: 62, w: 158, h: 130 });
    // A / B
    const ab = (cx, cy, r, label, key, col) => {
      const on = G.touchHeld[key] || G.keyHeld[key];
      G.disc(B, cx, cy + 2, r, 'rgba(40,30,20,0.3)');
      G.disc(B, cx, cy + (on ? 1 : 0), r, '#2c2f45');
      G.disc(B, cx, cy + (on ? 1 : 0), r - 1, col[1]);
      G.disc(B, cx, cy - 1 + (on ? 1 : 0), r - 3, col[0]);
      G.textC(B, label, cx, cy - 7 + (on ? 1 : 0), '#fff', 'rgba(0,0,0,0.3)');
      G.addHot({ kind: 'hold', key, cx, cy, r: r + 3 });
    };
    ab(222, 104, 22, 'A', 'a', ['#ef6a5a', '#b03a30']);
    ab(180, 138, 18, 'B', 'b', ['#f6c94a', '#b88a1c']);
    // menu + run buttons
    G.button(B, 104, 168, 52, 20, '메뉴', { onTap: () => { G.pressed.start = 1; } });
    const runOn = !!G.S.settings.run;
    G.button(B, 164, 168, 66, 20, runOn ? '달리기 켬' : '달리기 끔', {
      color: runOn ? '#f6d878' : '#f4f1e6', dark: runOn ? '#c49a2a' : '#a89f86',
      onTap: () => { G.S.settings.run = !G.S.settings.run; G.audio && G.audio.sfx('select'); }
    });
    if (G.field) G.field.drawPadExtra(B);
    drawStick(B);   // last, so a stick re-centred near a button sits on top of it
  }
  Wd.drawPad = drawPad;

  // floating stick: idles at STICK; while touched, the base sits where the thumb first landed
  const STICK = { x: 82, y: 118 }, TRAVEL = 12;
  const stickVis = { x: STICK.x, y: STICK.y };
  function stickArrow(B, cx, cy, d, on) {
    B.fillStyle = on ? '#f6d878' : '#8f93ad';
    for (let i = 0; i < 5; i++) {
      const w = i * 2 + 1, t = 33 - i;   // tip 33px from the centre, pointing outward
      if (d === 'up') B.fillRect(cx - i, cy - t, w, 1);
      else if (d === 'down') B.fillRect(cx - i, cy + t - 1, w, 1);
      else if (d === 'left') B.fillRect(cx - t, cy - i, 1, w);
      else B.fillRect(cx + t - 1, cy - i, 1, w);
    }
  }
  function drawStick(B) {
    const J = G.joy, live = J.on && !J.dead;
    if (live) { stickVis.x = J.ox; stickVis.y = J.oy; }
    else {   // glide home once the thumb lifts
      stickVis.x += (STICK.x - stickVis.x) * 0.35; stickVis.y += (STICK.y - stickVis.y) * 0.35;
      if (Math.abs(stickVis.x - STICK.x) + Math.abs(stickVis.y - STICK.y) < 1) { stickVis.x = STICK.x; stickVis.y = STICK.y; }
    }
    const bx = Math.round(stickVis.x), by = Math.round(stickVis.y);
    const key = live ? J.key : ['up', 'down', 'left', 'right'].find(d => G.keyHeld[d]) || null;
    let ox = 0, oy = 0;
    if (live) { const s = TRAVEL / G.JOY_REACH; ox = (J.x - J.ox) * s; oy = (J.y - J.oy) * s; }
    else if (key) { ox = DIRS[key][0] * TRAVEL * 0.8; oy = DIRS[key][1] * TRAVEL * 0.8; }
    const kx = Math.round(bx + ox), ky = Math.round(by + oy);
    // base: beige collar around a recessed slate well
    G.disc(B, bx, by + 2, 42, 'rgba(60,50,30,0.18)');
    G.disc(B, bx, by, 42, '#d9ccac');
    G.disc(B, bx, by, 40, '#e8dfc6');
    G.disc(B, bx, by, 37, '#2c2f45');
    G.disc(B, bx, by, 36, '#3d4157');
    G.disc(B, bx, by + 2, 34, '#4a4e66');
    ['up', 'down', 'left', 'right'].forEach(d => stickArrow(B, bx, by, d, key === d));
    // knob
    G.disc(B, kx, ky + 3, 15, 'rgba(20,18,30,0.4)');
    G.disc(B, kx, ky, 15, '#2c2f45');
    G.disc(B, kx, ky, 14, '#cfc2a0');
    G.disc(B, kx, ky - 1, 13, live ? '#fbf3dc' : '#efe6cf');
    G.disc(B, kx, ky - 1, 7, key ? '#f6d878' : '#e0d4b4');
    B.fillStyle = 'rgba(255,255,255,0.75)';
    B.fillRect(kx - 8, ky - 9, 4, 2); B.fillRect(kx - 9, ky - 7, 2, 2);
  }
})();

/* 모아루: 잠든 길의 노래 — 금오·월백 (docs/planning/legend-stories)
   the two sanctuaries LGZ01 햇귀절벽 · LGZ02 월은못, and the small hooks that put the eight legend scenes, the two
   optional requests and the sanctuary entrances into the chapter 1-3 maps. The story logic lives in legends.js;
   the rows of the new maps come from _mapgen8.py (built by _build_maps8.py), the rows changed in old maps from
   _mapgen4.py (바람등성이), _mapgen5.py (높은물길 입구) and _build_maps3.py (달빛방). */
'use strict';
(function () {
  const G = window.G;
  const M = G.MAPS;
  const H = G.mapHelpers;
  const { flag, say } = H;
  const L = () => G.legend;
  const Wd = () => G.world;
  const ROWS = /*ROWS*/null;

  // ------------------------------------------------------------ LGZ01 햇귀절벽 (from 바람등성이, after Q33 with 괴력운반)
  let gateSaid = false;
  const WB = { A: [6, 9], B: [15, 9] }, RING = [11, 7], GATE = [11, 4];
  // a hand-turned windbreak: a post with a cloth sail; dir 0..3 points the sail (and its shadow) a quarter turn on
  function windbreak(T, x, y, dir, cx, cy) {
    const X = x * 16 - cx, Y = y * 16 - cy;
    T.fillStyle = 'rgba(0,0,0,0.25)'; T.fillRect(X + 2, Y + 13, 12, 3);
    T.fillStyle = '#5a3a1a'; T.fillRect(X + 7, Y - 6, 2, 20);
    const ang = [-0.9, -0.2, 0.5, 1.2][dir], len = 11;
    const ex = X + 8 + Math.cos(ang) * len, ey = Y - 2 + Math.sin(ang) * len * 0.5;
    T.fillStyle = '#e8d8b0'; T.beginPath(); T.moveTo(X + 8, Y - 6); T.lineTo(ex, ey - 6); T.lineTo(ex, ey + 4); T.lineTo(X + 8, Y + 4); T.closePath(); T.fill();
    T.strokeStyle = '#8a6a3a'; T.lineWidth = 1; T.stroke();
    T.fillStyle = '#c84a2a'; T.fillRect(Math.round(ex) - 1, Math.round(ey) - 7, 2, 2);
    G.textC(T, x === WB.A[0] ? 'A' : 'B', X + 8, Y - 19, '#ffffff', 'rgba(0,0,0,0.6)');
  }
  M.lg_suncliff = {
    name: '햇귀절벽', kind: 'out', bgm: 'shrine', secret: true, rows: ROWS.lg_suncliff,
    warps: [{ x: 23, y: 12, to: 'ridge', tx: 3, ty: 24, dir: 'right', tdir: 'right' }],
    blocks: [{ x: GATE[0], y: GATE[1], cond: () => !L().sunCalm() }],
    objects: {
      '6,9': () => L().sunTurn('A'), '15,9': () => L().sunTurn('B'),
      '19,13': () => L().sunTablet(), '17,13': () => L().sunLog(), '11,4': () => L().sunGate(),
      '11,7': () => say('고리 문양이 새겨진 넓적한 안전 발판이다. 깃 그림자 셋이 여기 모이면 바람이 잔다고 한다.')
    },
    triggers: [
      { x: 10, y: 5, w: 3, h: 1, cond: () => !L().sunCalm() && !gateSaid, run: async () => { gateSaid = true; await L().sunGate(); } },
      { x: 8, y: 2, w: 7, h: 1, cond: () => !L().of('geumo').observed && !L().of('geumo').captured, run: () => L().sunLedge() }],
    npcs: [{ id: 'lg_geumo', mon: 'geumo', x: 11, y: 1, dir: 'down', cond: () => L().present('geumo'),
      talk: async () => { if (!L().of('geumo').observed) await L().sunLedge(); else await L().approach('geumo'); } }],
    drawExtra: (T, cx, cy) => {
      const z = L().st().sites.LGZ01, calm = L().sunCalm();
      // the ring-marked safe stone
      const RX = RING[0] * 16 - cx, RY = RING[1] * 16 - cy;
      T.fillStyle = '#9a8a6a'; T.fillRect(RX + 1, RY + 3, 14, 11); T.fillStyle = '#c8b890'; T.fillRect(RX + 2, RY + 4, 12, 9);
      T.strokeStyle = calm ? '#f6c04a' : '#7a6a4a'; T.lineWidth = 1; T.beginPath(); T.ellipse(RX + 8, RY + 8.5, 4, 3, 0, 0, 7); T.stroke();
      // three feather shadows, swaying in the wind until they rest together on the ring stone
      L().sunShadows().forEach(([x, y], i) => {
        const sway = calm ? 0 : Math.sin(G.frame / 18 + i * 2) * 1.5;
        const X = x * 16 + 8 - cx + sway, Y = y * 16 + 9 - cy;
        // a long feather: vane, quill and a darker tip, so each of the three reads on the grass
        T.save(); T.translate(X, Y); T.rotate(-0.5 + i * 0.5); T.fillStyle = calm ? 'rgba(70,30,10,0.5)' : 'rgba(30,20,40,0.42)';
        T.beginPath(); T.ellipse(0, 0, 9, 3, 0, 0, 7); T.fill(); T.fillRect(-13, -0.5, 5, 1);
        T.fillStyle = calm ? 'rgba(120,60,10,0.45)' : 'rgba(20,12,30,0.45)'; T.beginPath(); T.ellipse(5, 0, 3, 2, 0, 0, 7); T.fill(); T.restore();
      });
      windbreak(T, WB.A[0], WB.A[1], z.a | 0, cx, cy); windbreak(T, WB.B[0], WB.B[1], z.b | 0, cx, cy);
      // the log box by the entrance
      const LX = 17 * 16 - cx, LY = 13 * 16 - cy;
      T.fillStyle = '#6a4a2a'; T.fillRect(LX + 2, LY + 4, 12, 10); T.fillStyle = '#b08a5a'; T.fillRect(LX + 3, LY + 5, 10, 4); T.fillStyle = '#f0e0b8'; T.fillRect(LX + 5, LY + 6, 6, 2);
      // gusts at the gate and along the ledge until the wind is calmed
      if (!calm) for (let i = 0; i < 6; i++) {
        const k = ((G.frame / 40) + i / 6) % 1, X = (8 + k * 8) * 16 - cx, Y = (3 + (i % 3) * 0.6) * 16 - cy;
        T.fillStyle = `rgba(255,255,255,${(0.6 * (1 - k)).toFixed(2)})`; T.fillRect(Math.round(X), Math.round(Y), 14, 1);
      }
    },
    onEnter: async () => { gateSaid = false; await L().sunEnter(); }
  };

  // ------------------------------------------------------------ LGZ02 월은못 (from 달숨동굴 달빛방, after Q33 with 괴력운반)
  const OUTP = [[5, 6], [6, 6], [7, 6], [7, 5], [8, 5], [9, 5], [9, 4], [10, 4], [11, 4], [12, 4], [12, 3], [13, 3], [14, 3], [15, 3], [16, 3]];
  const REFL = OUTP.map(([x, y]) => [x, 16 - y]);   // their reflections lie lower in the water, mirrored about row 8
  const isRefl = (x, y) => REFL.some(p => p[0] === x && p[1] === y);
  M.lg_moonpool = {
    name: '월은못', kind: 'cave', bgm: 'shrine', secret: true, rows: ROWS.lg_moonpool,
    rescue: () => ({ map: 'camp', x: 11, y: 2, dir: 'down' }),
    // before you walk in, the examined entrance stone gives only the entrance and the safe footholds of the way out
    outline: () => L().st().sites.LGZ02.found ? [[1, 7], [2, 7], [3, 7], [4, 7]].concat(OUTP) : null,
    warps: [{ x: 1, y: 7, to: 'moonroom', tx: 12, ty: 4, dir: 'left', tdir: 'left', gated: 1 }],   // (12,4) is clear once the haul stone has moved
    noBoard: (x, y) => isRefl(x, y) ? '물에 비친 발판의 그림자다. 손을 뻗자 물결에 흔들려 흩어진다.\n진짜 발판은 물결에 흔들리지 않고, 가장자리에 이끼가 끼어 있다.'
      : '물판을 펼치기엔 물이 너무 고요하다. 달빛이 깨질 것 같아 그만두었다.\n(발판을 따라 걷자)',
    objects: { '19,3': () => L().moonBasin(), '2,3': () => L().moonTablet() },
    triggers: [
      { x: 11, y: 8, cond: () => L().moonLit(), run: async () => { L().st().sites.LGZ02.back = 1; } },
      { x: 4, y: 8, cond: () => L().moonLit() && L().st().sites.LGZ02.back && !L().of('wolbaek').observed && !L().of('wolbaek').captured, run: () => L().moonShore() }],
    npcs: [{ id: 'lg_wolbaek', mon: 'wolbaek', x: 5, y: 6, dir: 'right', cond: () => L().present('wolbaek'), talk: () => L().approach('wolbaek') }],
    drawExtra: (T, cx, cy) => {
      const lit = L().moonLit();
      // reflections: faint, wavering stones in the water (never walkable)
      REFL.forEach(([x, y], i) => {
        const X = x * 16 - cx + Math.sin(G.frame / 22 + i) * 1.2, Y = y * 16 - cy;
        T.fillStyle = 'rgba(210,214,240,0.22)'; T.fillRect(Math.round(X) + 3, Y + 5, 10, 7);
        T.fillStyle = 'rgba(240,244,255,0.18)'; T.fillRect(Math.round(X) + 4, Y + 6, 8, 2);
      });
      // the real stones of the way out keep a mossy rim
      OUTP.forEach(([x, y]) => { const X = x * 16 - cx, Y = y * 16 - cy; T.fillStyle = 'rgba(70,110,80,0.55)'; T.fillRect(X + 1, Y + 14, 14, 1); T.fillRect(X, Y + 2, 1, 12); T.fillRect(X + 15, Y + 2, 1, 12); });
      // the way back glows once the basin is touched
      if (lit) L().MOON.back.forEach(([x, y], i) => { const a = 0.25 + 0.15 * Math.sin(G.frame / 15 + i * 0.6); T.fillStyle = `rgba(190,200,255,${a.toFixed(2)})`; T.fillRect(x * 16 - cx + 2, y * 16 - cy + 3, 12, 10); });
      // the moon basin
      const BX = 19 * 16 - cx, BY = 3 * 16 - cy;
      T.fillStyle = '#5a5a7a'; T.fillRect(BX + 2, BY + 6, 12, 8); T.fillStyle = lit ? '#e8eeff' : '#8a96c8'; T.fillRect(BX + 3, BY + 7, 10, 3);
      G.disc(T, BX + 8, BY + 3, 3, lit ? 'rgba(240,244,255,0.9)' : 'rgba(200,210,255,0.5)');
      // moonlight falling through the open ceiling
      T.fillStyle = 'rgba(220,228,255,0.06)'; T.fillRect(6 * 16 - cx, 0 - cy, 12 * 16, 14 * 16);
    },
    onEnter: async () => { await L().moonEnter(); }
  };

  // ------------------------------------------------------------ hooks in the chapter 1-3 maps (LG_S01-08, LQ01-02, entrances)
  // LG_S01 햇살들판: the first safe stretch of road after the first grass
  M.route1.triggers = (M.route1.triggers || []).concat([{ x: 1, y: 13, w: 12, h: 1, cond: () => flag('q00') && L().due('LG_S01'), run: () => L().s01() }]);
  // (fallback) 바람나루: someone who saw the great bird pass at dawn
  M.city.npcs = M.city.npcs.concat([{ id: 'c_dawn', char: 'elder', x: 9, y: 18, dir: 'right', name: '들판 산책 할머니', cond: () => flag('q00'), talk: () => L().cityRumor('들판 산책 할머니') }]);
  // LG_S02 + LGZ02 entrance: 달숨동굴 달빛방
  M.moonroom.objects = Object.assign(M.moonroom.objects || {}, { '10,6': () => L().moonStone() });
  M.moonroom.hauls = (M.moonroom.hauls || []).concat([{ id: 'lg_moon', x: 12, y: 4, to: [11, 2], floor: '_', seatFloor: 'l',
    cond: () => L().siteCond('LGZ02'), condLine: '높은물길 조사(3장)를 마치고 오면 이 운반석을 옮겨 볼 수 있을 것 같다.',
    look: () => L().siteLook('LGZ02'),
    onDone: async () => { await say('운반석 너머로 서늘한 달빛이 흘러든다. 월은못으로 이어지는 좁은 길이 드러났다!'); } }]);
  M.moonroom.warps = M.moonroom.warps.concat([{ x: 13, y: 4, to: 'lg_moonpool', tx: 2, ty: 7, dir: 'right', tdir: 'right' }]);
  // LG_S03 + LQ01: 돛바람항 정비사 세나 (after the lighthouse)
  const sena = M.harbor.npcs.find(n => n.id === 'sena_p');
  if (sena) { const orig = sena.talk; sena.talk = () => L().senaTalk(orig); }
  // LG_S04 + LQ02: 기억나루 옛길 기록실 (기록판, 관리인 해솔)
  M.archive.objects = Object.assign(M.archive.objects || {}, { '5,3': () => L().archiveBoard() });
  const haesol = M.archive.npcs.find(n => n.id === 'haesol_a');
  if (haesol) {
    const plain = haesol.talk || (async () => say(typeof haesol.text === 'function' ? haesol.text() : haesol.text, '관리인 해솔'));
    delete haesol.text;
    haesol.talk = () => L().haesolTalk(plain);
  }
  // LG_S05 + LGZ01 entrance: 바람등성이 전망 돌판, the old wind watcher, the ring-marked stone in the cliff gap
  M.ridge.objects = Object.assign(M.ridge.objects || {}, { '4,22': () => L().ridgeTablet() });
  M.ridge.npcs = M.ridge.npcs.concat([{ id: 'rg_watch', char: 'elder', x: 8, y: 23, dir: 'left', name: '바람 관측 노인', talk: () => L().ridgeWatcher() }]);
  M.ridge.hauls = (M.ridge.hauls || []).concat([{ id: 'lg_sun', x: 4, y: 24, to: [5, 25], floor: '.',
    cond: () => L().siteCond('LGZ01'), condLine: '괴력운반은 익혔지만, 높은물길 조사(3장)가 끝나기 전에는 절벽 쪽 운반석에 손대지 않는 게 좋겠다.',
    look: () => L().siteLook('LGZ01'),
    onDone: async () => { await say('운반석이 받침에 내려앉자, 절벽 틈으로 이어지는 오솔길이 드러났다!\n따뜻한 바람이 그쪽에서 불어온다.'); } }]);
  M.ridge.warps = M.ridge.warps.concat([{ x: 2, y: 24, to: 'lg_suncliff', tx: 22, ty: 12, dir: 'left', tdir: 'left' }]);
  // LG_S06: 너울잠굴 옛 부두, the first safe landing at its east end (after Q25)
  M.nw3.triggers = (M.nw3.triggers || []).concat([{ x: 26, y: 7, w: 3, h: 2, cond: () => flag('q25') && L().due('LG_S06'), run: () => L().dockCameo() }]);
  // (fallback) 해무나루 구조대장 가온
  const gaon = M.m07.npcs.find(n => n.id === 'gaon');
  if (gaon) { const orig = gaon.talk; gaon.talk = async () => { await orig(); await L().gaonRecap(); }; }
  // LG_S07: 기억나루 강 건너 모래톱, the rock beside the old marker (q17 + q29)
  M.memory.objects = Object.assign(M.memory.objects || {}, { '26,4': () => L().sandbarTracks() });
  // LG_S08: 높은물길 첫 전망대의 울림돌 (after the chapter 3 ending), and 시온 remembers it
  M.r18.objects = Object.assign(M.r18.objects || {}, { '5,9': () => L().echoStone() });
  const sion = M.r18.npcs.find(n => n.id === 'r18_sion');
  if (sion) {
    const plain = async () => say(typeof sion.text === 'function' ? sion.text() : sion.text, '조합 조사원 시온');
    delete sion.text;
    sion.talk = () => L().sionAfter(plain);
  }

  // ------------------------------------------------------------ the map pages: the sanctuaries belong to MAP02 (달숨동굴) and MAP05 (바람등성이)
  // They are secret areas: drawn only after you have walked in (the entrance stone is marked once examined).
  const addTo = (ch, node, map) => { const n = ch && ch.nodes.find(k => k.id === node); if (!n) return; n.maps.push(map); if (n.show) n.show.push(map); };
  addTo(G.CH1, 'cave', 'lg_moonpool');
  addTo(G.CH2, 'ridge', 'lg_suncliff');
})();

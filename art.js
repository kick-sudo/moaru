/* 모아루: 잠든 길의 노래 — art: tiles, buildings, characters, small sprites */
'use strict';
(function () {
  const G = window.G;
  const A = G.art = {};
  function cv(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return [c, x];
  }
  A.cv = cv;
  const R = (x, X, Y, w, h, col) => { x.fillStyle = col; x.fillRect(X, Y, w, h); };
  const P = (x, X, Y, col) => { x.fillStyle = col; x.fillRect(X, Y, 1, 1); };
  A.R = R; A.P = P;
  function grid(x, rows, pal, ox, oy) {
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      for (let i = 0; i < row.length; i++) {
        const c = row[i];
        if (c === '.' || c === ' ') continue;
        const col = pal[c];
        if (col) P(x, ox + i, oy + y, col);
      }
    }
  }
  A.grid = grid;
  function hash(a, b, c) { let h = (a * 374761393 + b * 668265263 + (c || 0) * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0); }
  A.hash = hash;

  // ------------------------------------------------------------ palettes
  const GR = { l: '#b6e88a', b: '#92d36a', m: '#7cc25a', d: '#62ad4a', dd: '#3f8a38' };
  const TG = { o: '#2c6a2c', d: '#3f8f36', b: '#57ad44', l: '#86d062', t: '#b4ec86' };
  const PATH = { b: '#ecd7a2', d: '#d7bb80', l: '#f7eac6', e: '#c9a46a' };
  const WATER = { b: '#5aa6ea', d: '#3f86d4', l: '#a8dafb', f: '#e6f6ff', s: '#2f6cb8' };
  const TREE = { o: '#1c4623', b: '#4c9a41', s: '#377a31', l: '#7cc458', t: '#7a4b26', to: '#3e2614' };
  const WOOD = { b: '#c98d4f', d: '#8b5a2c', l: '#e4b47a', o: '#5e3a1a' };

  // ------------------------------------------------------------ outdoor ground pieces
  function grass(x, ox, oy, seed) {
    R(x, ox, oy, 16, 16, GR.b);
    const r = G.srng(seed * 31 + 7);
    const spots = [[2, 5], [10, 3], [6, 11], [13, 12], [1, 14], [9, 8]];
    for (const [sx, sy] of spots) {
      if (r() < 0.25) continue;
      const X = ox + ((sx + Math.floor(r() * 3)) % 14), Y = oy + Math.min(14, sy + Math.floor(r() * 2));
      P(x, X, Y, GR.d); P(x, X + 1, Y - 1, GR.d); P(x, X + 2, Y, GR.d); P(x, X + 1, Y - 2, GR.l);
    }
    for (let i = 0; i < 4; i++) P(x, ox + Math.floor(r() * 16), oy + Math.floor(r() * 16), r() < 0.5 ? GR.l : GR.m);
  }
  A.grassTile = grass;

  function blade(x, ox, oy, bx, by, h, lean, pal) {
    // tapered blade: 3px at the base, 1px tip, outline on both sides
    for (let i = 0; i < h; i++) {
      const t = i / (h - 1);
      const cx = bx + lean * t * t;
      const w = t < 0.45 ? 3 : t < 0.8 ? 2 : 1;
      const X = Math.round(cx - w / 2), Y = by - i;
      R(x, ox + X - 1, oy + Y, w + 2, 1, pal.o);
    }
    for (let i = 0; i < h - 1; i++) {
      const t = i / (h - 1);
      const cx = bx + lean * t * t;
      const w = t < 0.45 ? 3 : t < 0.8 ? 2 : 1;
      const X = Math.round(cx - w / 2), Y = by - i;
      R(x, ox + X, oy + Y, w, 1, t < 0.3 ? pal.d : t < 0.7 ? pal.b : pal.l);
      if (w > 1 && t > 0.2) P(x, ox + X, oy + Y, t < 0.7 ? pal.l : pal.t);
    }
  }
  function tallGrass(x, ox, oy, seed, pal, onlyFront) {
    if (!onlyFront) grass(x, ox, oy, seed);
    const r = G.srng(seed * 17 + 3);
    const back = [[2, 9, 8], [7, 8, 9], [12, 9, 8], [5, 10, 7], [10, 10, 7], [15, 10, 7]];
    const front = [[1, 15, 8], [4, 15, 9], [8, 15, 8], [11, 15, 9], [14, 15, 8]];
    if (!onlyFront) for (const [bx, by, h] of back) blade(x, ox, oy, bx, by, h + Math.floor(r() * 2), (r() - 0.5) * 3, pal);
    for (const [bx, by, h] of front) blade(x, ox, oy, bx, by, h + Math.floor(r() * 2), (r() - 0.5) * 3, pal);
  }

  function pathTile(x, map, tx, ty, ox, oy) {
    R(x, ox, oy, 16, 16, PATH.b);
    const r = G.srng(hash(tx, ty, 5));
    for (let i = 0; i < 6; i++) P(x, ox + Math.floor(r() * 16), oy + Math.floor(r() * 16), r() < 0.6 ? PATH.d : PATH.l);
    const isP = (dx, dy) => { const c = map.at(tx + dx, ty + dy); return c === '=' || c === 'D' || c === null || c === 'p'; };
    // soft grass edges where the path meets grass
    const edge = (dir) => {
      for (let i = 0; i < 16; i++) {
        const j = hash(tx * 16 + i, ty, dir) % 3;
        const n = j === 0 ? 1 : 2;
        for (let k = 0; k < n; k++) {
          let X, Y;
          if (dir === 0) { X = i; Y = k; } else if (dir === 1) { X = i; Y = 15 - k; } else if (dir === 2) { X = k; Y = i; } else { X = 15 - k; Y = i; }
          P(x, ox + X, oy + Y, k === n - 1 ? GR.m : GR.b);
        }
        let X, Y;
        if (dir === 0) { X = i; Y = n; } else if (dir === 1) { X = i; Y = 15 - n; } else if (dir === 2) { X = n; Y = i; } else { X = 15 - n; Y = i; }
        P(x, ox + X, oy + Y, PATH.e);
      }
    };
    if (!isP(0, -1)) edge(0);
    if (!isP(0, 1)) edge(1);
    if (!isP(-1, 0)) edge(2);
    if (!isP(1, 0)) edge(3);
  }
  function plaza(x, tx, ty, ox, oy) {
    R(x, ox, oy, 16, 16, '#ddd6c8');
    const off = (ty % 2) * 8;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const X = ox + ((j * 8 + off + (i ? 4 : 0)) % 16), Y = oy + i * 8;
      R(x, X, Y, 7, 7, (hash(tx * 2 + j, ty * 2 + i) % 5) ? '#e9e3d6' : '#e2dccd');
      R(x, X, Y, 7, 1, '#f4f0e6');
    }
    for (let i = 0; i < 16; i++) { P(x, ox + i, oy + 7, '#c2b9a8'); P(x, ox + i, oy + 15, '#c2b9a8'); }
  }
  function waterTile(x, map, tx, ty, ox, oy, f) {
    R(x, ox, oy, 16, 16, WATER.b);
    const r = G.srng(hash(tx, ty, 9));
    for (let i = 0; i < 3; i++) {
      const Y = Math.floor(r() * 13) + 1, X0 = Math.floor(r() * 12);
      const X = (X0 + f * 2 + (i & 1 ? -f : f)) & 15;
      R(x, ox + Math.min(X, 12), oy + Y, 4, 1, WATER.l);
      P(x, ox + Math.min(X, 12) + 1, oy + Y + 1, WATER.d);
    }
    const land = (dx, dy) => { const c = map.at(tx + dx, ty + dy); return c !== null && !'woRO'.includes(c); };
    if (land(0, -1)) { R(x, ox, oy, 16, 2, WATER.s); R(x, ox, oy + 2, 16, 1, WATER.f); }
    if (land(-1, 0)) { R(x, ox, oy, 1, 16, WATER.s); R(x, ox + 1, oy, 1, 16, WATER.l); }
    if (land(1, 0)) { R(x, ox + 15, oy, 1, 16, WATER.s); R(x, ox + 14, oy, 1, 16, WATER.l); }
    if (land(0, 1)) { R(x, ox, oy + 14, 16, 2, WATER.l); R(x, ox, oy + 15, 16, 1, WATER.f); }
  }
  function tree(x, ox, oy, seed) {
    const r = G.srng(seed);
    // trunk
    R(x, ox + 6, oy + 12, 4, 4, TREE.to); R(x, ox + 7, oy + 12, 2, 3, TREE.t);
    // canopy: outlined blob
    const cx = 7.5, cy = 6.5;
    for (let y = 0; y < 14; y++) for (let X = 0; X < 16; X++) {
      const dx = (X - cx) / 7.6, dy = (y - cy) / 6.8;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      let col = TREE.b;
      if (d > 0.78) col = TREE.o;
      else if (dx + dy > 0.55) col = TREE.s;
      else if (dx + dy < -0.6) col = TREE.l;
      P(x, ox + X, oy + y, col);
    }
    for (let i = 0; i < 6; i++) {
      const X = 3 + Math.floor(r() * 10), Y = 2 + Math.floor(r() * 9);
      P(x, ox + X, oy + Y, i < 3 ? TREE.l : TREE.s);
    }
    P(x, ox + 4, oy + 3, '#a6dd7c'); P(x, ox + 5, oy + 3, '#a6dd7c'); P(x, ox + 4, oy + 4, '#a6dd7c');
  }
  function bush(x, ox, oy) {
    for (let y = 3; y < 16; y++) for (let X = 0; X < 16; X++) {
      const dx = (X - 7.5) / 7.5, dy = (y - 10) / 6.2;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      P(x, ox + X, oy + y, d > 0.75 ? '#245a28' : dx + dy > 0.5 ? '#3d8436' : dx + dy < -0.5 ? '#86cf62' : '#5aa848');
    }
    P(x, ox + 4, oy + 7, '#f4f0a0'); P(x, ox + 10, oy + 9, '#f8b0c0'); P(x, ox + 7, oy + 12, '#f4f0a0');
  }
  // bramble of thorns with plum berries (가시덤불)
  function thornBush(x, ox, oy, seed) {
    const r = G.srng(seed);
    for (let y = 2; y < 16; y++) for (let X = 0; X < 16; X++) {
      const dx = (X - 7.5) / 7.6, dy = (y - 9.5) / 6.6;
      const d = dx * dx + dy * dy + (r() - 0.5) * 0.18;
      if (d > 1) continue;
      P(x, ox + X, oy + y, d > 0.74 ? '#2a3a22' : dx + dy > 0.5 ? '#3c5a2c' : dx + dy < -0.5 ? '#7aa04a' : '#56783a');
    }
    [[3, 5], [12, 4], [1, 10], [14, 11], [7, 2], [9, 14], [5, 13]].forEach(([X, Y]) => { P(x, ox + X, oy + Y, '#e8d8b0'); });
    [[5, 8], [10, 7], [8, 11], [12, 12]].forEach(([X, Y]) => { P(x, ox + X, oy + Y, '#8a2a5a'); P(x, ox + X + 1, oy + Y, '#b8487a'); P(x, ox + X, oy + Y - 1, '#d87aa0'); });
  }
  // dark mossy tree of the dew forest
  function mossTree(x, ox, oy, seed) {
    const r = G.srng(seed);
    R(x, ox + 6, oy + 12, 4, 4, '#3a2a1e'); R(x, ox + 7, oy + 12, 2, 3, '#5a4a2a'); P(x, ox + 6, oy + 13, '#6a9a4a');
    for (let y = 0; y < 14; y++) for (let X = 0; X < 16; X++) {
      const dx = (X - 7.5) / 7.7, dy = (y - 6.5) / 6.9;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      let col = '#2f6a3c';
      if (d > 0.78) col = '#173a24';
      else if (dx + dy > 0.55) col = '#245432';
      else if (dx + dy < -0.6) col = '#4f9a58';
      P(x, ox + X, oy + y, col);
    }
    for (let i = 0; i < 7; i++) P(x, ox + 3 + Math.floor(r() * 10), oy + 2 + Math.floor(r() * 9), i < 4 ? '#6fb870' : '#1e4a2c');
    P(x, ox + 4, oy + 3, '#9ad89a'); P(x, ox + 5, oy + 3, '#9ad89a');
    if (r() < 0.5) { P(x, ox + 11, oy + 8, '#cfe8ff'); }   // a dew drop
  }
  // soft moss floor, walkable
  function mossFloor(x, ox, oy, seed) {
    grass(x, ox, oy, seed);
    const r = G.srng(seed * 7 + 3);
    for (let i = 0; i < 9; i++) { const X = Math.floor(r() * 15), Y = Math.floor(r() * 15); P(x, ox + X, oy + Y, '#3f8a46'); P(x, ox + X + 1, oy + Y, '#5aa85a'); }
    if (r() < 0.35) { const X = 3 + Math.floor(r() * 9), Y = 4 + Math.floor(r() * 8); P(x, ox + X, oy + Y, '#f2ede0'); P(x, ox + X, oy + Y + 1, '#d8c8a8'); P(x, ox + X - 1, oy + Y, '#e86a5a'); P(x, ox + X + 1, oy + Y, '#e86a5a'); }
  }
  function flowers(x, ox, oy, seed, f) {
    grass(x, ox, oy, seed);
    const sets = [[3, 4, '#f25f5c'], [11, 6, '#fff4f0'], [6, 11, '#f6c945'], [13, 13, '#f25f5c']];
    sets.forEach(([X, Y, c], i) => {
      const s = (f + i) % 2;
      const px = ox + X + (s ? 0 : 0), py = oy + Y - s;
      P(x, px, py - 1, c); P(x, px - 1, py, c); P(x, px + 1, py, c); P(x, px, py + 1, c);
      P(x, px, py, '#ffe28a');
      P(x, px, py + 2, GR.dd);
    });
  }
  function fence(x, map, tx, ty, ox, oy) {
    grass(x, ox, oy, hash(tx, ty));
    const isF = dx => map.at(tx + dx, ty) === 'f';
    const L = isF(-1) ? 0 : 5, Rr = isF(1) ? 16 : 11;
    R(x, ox + L, oy + 5, Rr - L, 3, WOOD.o); R(x, ox + L, oy + 6, Rr - L, 1, WOOD.l);
    R(x, ox + L, oy + 10, Rr - L, 3, WOOD.o); R(x, ox + L, oy + 11, Rr - L, 1, WOOD.b);
    R(x, ox + 5, oy + 2, 6, 13, WOOD.o); R(x, ox + 6, oy + 3, 4, 11, WOOD.b); R(x, ox + 6, oy + 3, 1, 11, WOOD.l);
    R(x, ox + 5, oy + 15, 6, 1, 'rgba(30,60,20,0.35)');
  }
  function sign(x, ox, oy, seed) {
    grass(x, ox, oy, seed);
    R(x, ox + 7, oy + 10, 2, 6, WOOD.o);
    R(x, ox + 1, oy + 2, 14, 10, WOOD.o);
    R(x, ox + 2, oy + 3, 12, 8, WOOD.b);
    R(x, ox + 3, oy + 4, 10, 1, WOOD.l);
    R(x, ox + 4, oy + 6, 8, 1, '#7a4e26'); R(x, ox + 4, oy + 8, 6, 1, '#7a4e26');
  }
  // 현장점검 표식: a short stone post with the pathkeepers' blue band
  function surveyPost(x, ox, oy, seed) {
    grass(x, ox, oy, seed);
    R(x, ox + 3, oy + 13, 10, 2, 'rgba(0,0,0,0.18)');
    R(x, ox + 4, oy + 2, 8, 12, '#4a4a52');
    R(x, ox + 5, oy + 3, 6, 11, '#a8a49a');
    R(x, ox + 5, oy + 3, 2, 11, '#c8c4b8');
    R(x, ox + 5, oy + 6, 6, 3, '#2c5ea8'); R(x, ox + 5, oy + 6, 6, 1, '#4a90e2');
    R(x, ox + 7, oy + 10, 2, 2, '#f4f0e0');
    R(x, ox + 5, oy + 2, 6, 1, '#d8d4c8');
  }
  function ledge(x, map, tx, ty, ox, oy) {
    grass(x, ox, oy, hash(tx, ty, 3));
    R(x, ox, oy + 9, 16, 1, '#3f8a38');
    R(x, ox, oy + 10, 16, 4, '#b8834e');
    R(x, ox, oy + 10, 16, 1, '#d6a46a');
    for (let i = 1; i < 16; i += 4) R(x, ox + i, oy + 12, 2, 1, '#93622f');
    R(x, ox, oy + 14, 16, 2, '#6f4a26');
    if (map.at(tx - 1, ty) !== 'L') { R(x, ox, oy + 9, 2, 7, GR.b); }
    if (map.at(tx + 1, ty) !== 'L') { R(x, ox + 14, oy + 9, 2, 7, GR.b); }
  }
  function rock(x, ox, oy, seed) {
    grass(x, ox, oy, seed);
    for (let y = 2; y < 15; y++) for (let X = 1; X < 15; X++) {
      const dx = (X - 7.5) / 6.6, dy = (y - 9) / 6;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      P(x, ox + X, oy + y, d > 0.78 ? '#4a4a58' : dx + dy > 0.45 ? '#8c8c9a' : dx + dy < -0.55 ? '#e4e4ec' : '#b8b8c4');
    }
    R(x, ox + 4, oy + 15, 8, 1, 'rgba(30,60,20,0.35)');
  }
  function lamp(x, ox, oy, seed) {
    grass(x, ox, oy, seed);
    R(x, ox + 7, oy + 4, 2, 12, '#3a3a48'); R(x, ox + 7, oy + 4, 1, 12, '#6a6a7a');
    R(x, ox + 4, oy, 8, 5, '#3a3a48'); R(x, ox + 5, oy + 1, 6, 3, '#fff2b0');
    R(x, ox + 5, oy + 15, 6, 1, 'rgba(30,60,20,0.35)');
  }
  function sandTile(x, tx, ty, ox, oy) {
    R(x, ox, oy, 16, 16, '#f0e2b8');
    const r = G.srng(hash(tx, ty, 21));
    for (let i = 0; i < 5; i++) P(x, ox + Math.floor(r() * 16), oy + Math.floor(r() * 16), r() < 0.5 ? '#dcc890' : '#fbf3da');
  }

  // ---- 모아루 chapter 1 pieces ----
  const TG_DRY = { o: '#6a5420', d: '#9a7a30', b: '#c4a048', l: '#e2c46a', t: '#f4e2a0' };
  const TG_SAND = { o: '#7a6a3a', d: '#a89058', b: '#c8b070', l: '#e0cc90', t: '#f2e6be' };
  const TG_REED = { o: '#1e5a52', d: '#2e7a6a', b: '#46a088', l: '#78c8a8', t: '#b0e8cc' };
  const TG_SHADE = { o: '#163a22', d: '#24563a', b: '#357050', l: '#56966a', t: '#86c494' };
  const WATERLIKE = c => c === 'w' || c === 'o' || c === 'R' || c === 'O';
  // thin vine tangle: light, curly and clearly soft (덩굴 정리)
  function thinVine(x, ox, oy, seed) {
    grass(x, ox, oy, seed);
    const r = G.srng(seed);
    for (let y = 2; y < 16; y++) for (let X = 1; X < 15; X++) {
      const dx = (X - 7.5) / 7, dy = (y - 9.5) / 6.6;
      if (dx * dx + dy * dy > 1) continue;
      if ((X + y * 3 + Math.floor(r() * 3)) % 4 === 0) P(x, ox + X, oy + y, '#7a8a3a');
    }
    // looping stems
    const loops = [[4, 6, 3], [10, 5, 3], [7, 11, 3], [3, 12, 2], [12, 11, 2]];
    for (const [cx, cy, rr] of loops) for (let a = 0; a < 18; a++) {
      const ang = a / 18 * Math.PI * 2, X = Math.round(cx + Math.cos(ang) * rr), Y = Math.round(cy + Math.sin(ang) * rr);
      P(x, ox + X, oy + Y, a % 3 ? '#6a7a2a' : '#a8b84a');
    }
    [[2, 4], [13, 3], [6, 2], [9, 14], [14, 8], [1, 9]].forEach(([X, Y]) => { P(x, ox + X, oy + Y, '#9ad060'); P(x, ox + X + 1, oy + Y, '#c4ec7a'); });
    R(x, ox + 2, oy + 15, 12, 1, 'rgba(30,60,20,0.3)');
  }
  // ---- 모아루 chapter 2 pieces ----
  const SEA = { b: '#2e6cb4', l: '#5c9ae0', d: '#1c4a88', f: '#eef6ff' };
  function seaTile(x, m, tx, ty, ox, oy, f) {
    R(x, ox, oy, 16, 16, SEA.b);
    const r = G.srng(hash(tx, ty, 17));
    for (let i = 0; i < 3; i++) {
      const Y = Math.floor(r() * 13) + 1, X = (Math.floor(r() * 10) + f * 3 + (i & 1 ? -f : f)) & 15;
      R(x, ox + Math.min(X, 11), oy + Y, 5, 1, SEA.l); R(x, ox + Math.min(X, 11) + 1, oy + Y + 1, 3, 1, SEA.d);
    }
    const land = (dx, dy) => { const c = m.at(tx + dx, ty + dy); return c !== null && !'woROi'.includes(c); };
    if (land(0, -1)) { R(x, ox, oy, 16, 2, SEA.f); R(x, ox, oy + 2, 16, 1, SEA.l); }
    if (land(-1, 0)) { R(x, ox, oy, 2, 16, SEA.f); }
    if (land(1, 0)) { R(x, ox + 14, oy, 2, 16, SEA.f); }
    if (land(0, 1)) { R(x, ox, oy + 14, 16, 2, SEA.f); }
  }
  // small rock with clear cracks: 바위깨기 clears it (the big dark boulder 'Q' stays for later chapters)
  function crackRock(x, ox, oy, seed, base) {
    base();
    for (let y = 3; y < 15; y++) for (let X = 2; X < 14; X++) {
      const dx = (X - 7.5) / 5.8, dy = (y - 9) / 5.6, d = dx * dx + dy * dy;
      if (d > 1) continue;
      P(x, ox + X, oy + y, d > 0.75 ? '#5a4a3c' : dx + dy > 0.4 ? '#9a8670' : dx + dy < -0.5 ? '#e0d4bc' : '#c2b296');
    }
    [[7, 4], [7, 5], [8, 6], [8, 7], [7, 8], [8, 9], [9, 10], [6, 8], [5, 9], [10, 7], [11, 7]].forEach(([X, Y]) => P(x, ox + X, oy + Y, '#3a2e24'));
    R(x, ox + 4, oy + 15, 8, 1, 'rgba(30,40,20,0.35)');
  }
  function brazier(x, ox, oy, seed, f) {
    grass(x, ox, oy, seed);
    R(x, ox + 3, oy + 9, 10, 6, '#4a4a52'); R(x, ox + 4, oy + 10, 8, 4, '#8a8a96'); R(x, ox + 2, oy + 8, 12, 2, '#5a5a66');
    const k = (f || 0) & 1;
    R(x, ox + 5, oy + 4 + k, 6, 4, '#f08a2a'); R(x, ox + 6, oy + 2 + k, 4, 3, '#ffd75a'); R(x, ox + 7, oy + 1 + k, 2, 2, '#fff2b0');
  }
  function ropeRail(x, ox, oy, seed) {
    grass(x, ox, oy, seed);
    R(x, ox + 1, oy + 4, 2, 11, '#6a4a2a'); R(x, ox + 13, oy + 4, 2, 11, '#6a4a2a');
    for (let X = 1; X < 15; X++) { const sag = Math.round(Math.sin((X / 14) * Math.PI) * 2); P(x, ox + X, oy + 6 + sag, '#d8b070'); P(x, ox + X, oy + 10 + sag, '#c09a5a'); }
  }
  function tidePool(x, m, tx, ty, ox, oy, f) {
    R(x, ox, oy, 16, 16, '#c8b89a');
    for (let y = 2; y < 15; y++) for (let X = 1; X < 15; X++) {
      const dx = (X - 7.5) / 6.6, dy = (y - 8.5) / 5.8, d = dx * dx + dy * dy;
      if (d > 1) continue;
      P(x, ox + X, oy + y, d > 0.78 ? '#7a6a56' : d > 0.6 ? '#3e86c8' : '#5aa6ea');
    }
    R(x, ox + 4 + ((f || 0) & 1), oy + 7, 3, 1, '#a8dafb');
    P(x, ox + 10, oy + 10, '#f08a6a'); P(x, ox + 9, oy + 10, '#f08a6a'); P(x, ox + 10, oy + 9, '#f08a6a');
  }
  function magnetLock(x, ox, oy, base) {
    base();
    R(x, ox + 2, oy + 3, 12, 12, '#2a2a36'); R(x, ox + 3, oy + 4, 10, 10, '#5a5e6e'); R(x, ox + 3, oy + 4, 10, 1, '#8a8e9e');
    G.disc(x, ox + 8, oy + 9, 3, '#c8783a'); G.disc(x, ox + 8, oy + 9, 1, '#2a2a36');
    R(x, ox + 3, oy + 7, 2, 1, '#c8783a'); R(x, ox + 11, oy + 7, 2, 1, '#c8783a');
  }
  function oldMarker(x, ox, oy, seed) {
    grass(x, ox, oy, seed);
    R(x, ox + 4, oy + 2, 8, 13, '#4a4656'); R(x, ox + 5, oy + 3, 6, 12, '#8a8698'); R(x, ox + 5, oy + 3, 6, 1, '#b8b4c6');
    for (let y = 6; y < 13; y += 2) R(x, ox + 6, oy + y, 4, 1, '#5e5a6e');
    P(x, ox + 5, oy + 13, '#5a8a4a'); P(x, ox + 10, oy + 12, '#5a8a4a');
    R(x, ox + 4, oy + 15, 8, 1, 'rgba(30,40,20,0.35)');
  }
  // the heavy dark haul stone (운반석): far bigger than a round push stone, with a carved ring and rail notch (괴력운반, chapter 3)
  function bigBoulder(x, ox, oy, seed, base) {
    if (base) base(); else grass(x, ox, oy, seed);
    for (let y = 0; y < 16; y++) for (let X = 0; X < 16; X++) {
      const dx = (X - 7.5) / 8, dy = (y - 8.5) / 7.8;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      P(x, ox + X, oy + y, d > 0.8 ? '#1e2028' : dx + dy > 0.45 ? '#3a3e4c' : dx + dy < -0.6 ? '#7a7e8e' : '#555a6a');
    }
    // the carved ring (고리 문양) and the two rail notches at its foot
    for (let a = 0; a < 20; a++) { const ang = a / 20 * Math.PI * 2; P(x, ox + 8 + Math.round(Math.cos(ang) * 3.4), oy + 8 + Math.round(Math.sin(ang) * 3), a % 4 ? '#a8acba' : '#d0d4e0'); }
    R(x, ox + 4, oy + 14, 2, 1, '#a8acba'); R(x, ox + 10, oy + 14, 2, 1, '#a8acba');
    [[3, 11], [12, 4]].forEach(([X, Y]) => P(x, ox + X, oy + Y, '#5a8a4a'));
  }
  // ---- 모아루 chapter 3 pieces ----
  // the ground under a haul stone or its cradle: the floor named by the map's haul entry (default grass)
  function haulBase(x, m, tx, ty, ox, oy) {
    const h = (m.def.hauls || []).find(e => (e.x === tx && e.y === ty) || (e.to[0] === tx && e.to[1] === ty));
    const c = (h && h.floor) || m.def.haulFloor || '.', t = A.OUT[c];
    if (t && !t.bigrock && !t.haulseat) t.draw(x, m, tx, ty, ox, oy, 0); else grass(x, ox, oy, hash(tx, ty));
  }
  // a clam bed on the beach (조개 군락): three striped shells half sunk in wet sand
  function shellBed(x, tx, ty, ox, oy) {
    sandTile(x, tx, ty, ox, oy);
    for (let y = 6; y < 16; y++) for (let X = 0; X < 16; X++) { const dx = (X - 7.5) / 8, dy = (y - 11) / 5; if (dx * dx + dy * dy <= 1) P(x, ox + X, oy + y, (X + y) % 5 ? '#d6c08c' : '#c8b07a'); }
    [[3, 9, '#e8a878'], [9, 7, '#f0c098'], [8, 12, '#dc9468']].forEach(([X, Y, c]) => {
      for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) { const dx = (i - 2.5) / 3, dy = (j - 3) / 3.4; if (dx * dx + dy * dy > 1) continue; P(x, ox + X + i, oy + Y + j, j % 2 ? '#fbe8d0' : c); }
      R(x, ox + X, oy + Y + 4, 6, 1, '#8a5a3a'); P(x, ox + X + 2, oy + Y, '#ffffff');
    });
  }
  // a waterfall (폭포): falling white streaks over deep blue, foam where it lands. Never crossable in chapter 3.
  function waterfall(x, m, tx, ty, ox, oy, f) {
    R(x, ox, oy, 16, 16, '#3c7cc8');
    const r = G.srng(hash(tx, ty, 23));
    for (let i = 0; i < 7; i++) {
      const X = Math.floor(r() * 15), Y = (Math.floor(r() * 16) + f * 5) & 15, n = 3 + Math.floor(r() * 4);
      for (let k = 0; k < n; k++) P(x, ox + X, oy + ((Y + k) & 15), k === 0 ? '#ffffff' : '#bfe0fa');
    }
    for (let X = 0; X < 16; X += 4) R(x, ox + X + (f & 1), oy, 1, 16, 'rgba(255,255,255,0.18)');
    if (m.at(tx - 1, ty) !== 'W') { R(x, ox, oy, 2, 16, '#24508e'); P(x, ox + 2, oy + (f * 3 & 15), '#e8f6ff'); }
    if (m.at(tx + 1, ty) !== 'W') { R(x, ox + 14, oy, 2, 16, '#24508e'); }
    if (m.at(tx, ty + 1) !== 'W') { R(x, ox, oy + 11, 16, 5, '#e8f6ff'); for (let X = 0; X < 16; X += 3) R(x, ox + X, oy + 10 + ((X + f) & 1), 2, 1, '#ffffff'); R(x, ox, oy + 15, 16, 1, '#a8d4f4'); }
  }
  // cart rails on gravel; the longer run through the tile decides the direction
  function railTile(x, m, tx, ty, ox, oy) {
    gravel(x, tx, ty, ox, oy);
    const run = (dx, dy) => { let n = 0; for (let k = 1; k < 4 && m.at(tx + dx * k, ty + dy * k) === 'B'; k++) n++; return n; };
    const horiz = run(-1, 0) + run(1, 0) > run(0, -1) + run(0, 1);
    if (horiz) {
      for (let X = 1; X < 16; X += 4) R(x, ox + X, oy + 3, 2, 10, '#6a4a2a');
      R(x, ox, oy + 4, 16, 1, '#8a9098'); R(x, ox, oy + 11, 16, 1, '#8a9098'); R(x, ox, oy + 5, 16, 1, '#4a4e56'); R(x, ox, oy + 12, 16, 1, '#4a4e56');
    } else {
      for (let Y = 1; Y < 16; Y += 4) R(x, ox + 3, oy + Y, 10, 2, '#6a4a2a');
      R(x, ox + 4, oy, 1, 16, '#8a9098'); R(x, ox + 11, oy, 1, 16, '#8a9098'); R(x, ox + 5, oy, 1, 16, '#4a4e56'); R(x, ox + 12, oy, 1, 16, '#4a4e56');
    }
  }
  // the stone cradle a haul stone sits in (레일 받침); with the stone on it once carried
  function railSupport(x, tx, ty, ox, oy, full, base) {
    if (base) base(); else gravel(x, tx, ty, ox, oy);
    R(x, ox + 1, oy + 10, 14, 5, '#5a5448'); R(x, ox + 2, oy + 10, 12, 4, '#a89c84'); R(x, ox + 2, oy + 10, 12, 1, '#d0c4aa');
    R(x, ox + 1, oy + 6, 3, 6, '#5a5448'); R(x, ox + 12, oy + 6, 3, 6, '#5a5448'); R(x, ox + 2, oy + 6, 1, 5, '#c8bca2'); R(x, ox + 13, oy + 6, 1, 5, '#c8bca2');
    R(x, ox + 4, oy + 13, 2, 1, '#e3b23c'); R(x, ox + 10, oy + 13, 2, 1, '#e3b23c');   // painted rail marks
    if (!full) { for (let a = 0; a < 16; a++) { const ang = a / 16 * Math.PI * 2; P(x, ox + 8 + Math.round(Math.cos(ang) * 3), oy + 6 + Math.round(Math.sin(ang) * 2), '#e3b23c'); } return; }
    for (let y = 0; y < 12; y++) for (let X = 2; X < 14; X++) {
      const dx = (X - 7.5) / 6, dy = (y - 6) / 6, d = dx * dx + dy * dy;
      if (d > 1) continue;
      P(x, ox + X, oy + y, d > 0.78 ? '#1e2028' : dx + dy > 0.45 ? '#3a3e4c' : dx + dy < -0.6 ? '#7a7e8e' : '#555a6a');
    }
    for (let a = 0; a < 16; a++) { const ang = a / 16 * Math.PI * 2; P(x, ox + 8 + Math.round(Math.cos(ang) * 2.6), oy + 6 + Math.round(Math.sin(ang) * 2.4), '#d0d4e0'); }
  }
  // a little pool in the cave floor (물웅덩이): look in and something may be there
  function cavePool(x, m, tx, ty, ox, oy, f) {
    caveFloor(x, m, tx, ty, ox, oy, true);
    for (let y = 3; y < 15; y++) for (let X = 1; X < 15; X++) {
      const dx = (X - 7.5) / 6.6, dy = (y - 9) / 5.6, d = dx * dx + dy * dy;
      if (d > 1) continue;
      P(x, ox + X, oy + y, d > 0.78 ? '#3a3028' : d > 0.55 ? '#2a5a8a' : '#3e7cb8');
    }
    R(x, ox + 4 + ((f || 0) & 1), oy + 7, 3, 1, '#8ec8f0'); P(x, ox + 10, oy + 11, '#c8e8ff');
  }
  // clear teal water in a tiled facility basin (침전수로): calm, so the water board works here
  function basinWater(x, m, tx, ty, ox, oy, f) {
    R(x, ox, oy, 16, 16, '#2e8a96');
    const r = G.srng(hash(tx, ty, 37));
    for (let i = 0; i < 3; i++) { const Y = Math.floor(r() * 13) + 1, X = (Math.floor(r() * 12) + (f || 0) * 2) & 15; R(x, ox + Math.min(X, 12), oy + Y, 4, 1, '#7ccad2'); }
    const edge = (dx, dy) => m.at(tx + dx, ty + dy) !== 'o';
    if (edge(0, -1)) { R(x, ox, oy, 16, 2, '#e8f0f0'); R(x, ox, oy + 2, 16, 1, '#1e5a64'); }
    if (edge(-1, 0)) { R(x, ox, oy, 2, 16, '#e8f0f0'); R(x, ox + 2, oy, 1, 16, '#1e5a64'); }
    if (edge(1, 0)) { R(x, ox + 14, oy, 2, 16, '#c8d4d6'); }
    if (edge(0, 1)) { R(x, ox, oy + 14, 16, 2, '#c8d4d6'); }
  }
  function dockTile(x, m, tx, ty, ox, oy) {
    R(x, ox, oy, 16, 16, WATER.d);
    for (let i = 0; i < 4; i++) {
      const Y = oy + i * 4;
      R(x, ox, Y, 16, 4, WOOD.o); R(x, ox, Y, 16, 3, WOOD.b); R(x, ox, Y, 16, 1, WOOD.l);
      P(x, ox + 2 + (hash(tx, ty, i) % 11), Y + 1, WOOD.d);
    }
    const isD = (dx, dy) => { const c = m.at(tx + dx, ty + dy); return c === 'd' || c === 'n'; };
    if (!isD(-1, 0)) R(x, ox, oy, 1, 16, WOOD.o);
    if (!isD(1, 0)) R(x, ox + 15, oy, 1, 16, WOOD.o);
  }
  function rapidsTile(x, m, tx, ty, ox, oy, f) {
    R(x, ox, oy, 16, 16, '#3f86d4');
    const r = G.srng(hash(tx, ty, 13));
    for (let i = 0; i < 5; i++) {
      const X = Math.floor(r() * 12), Y = (Math.floor(r() * 16) + f * 4) & 15;
      R(x, ox + X, oy + Y, 4, 1, '#ffffff'); R(x, ox + X + 1, oy + ((Y + 1) & 15), 3, 1, '#c8ecff');
    }
    for (let i = 0; i < 3; i++) { const Y = (i * 6 + f * 4) & 15; R(x, ox + 1, oy + Y, 14, 1, 'rgba(255,255,255,0.35)'); }
  }
  function stoneBridge(x, m, tx, ty, ox, oy) {
    R(x, ox, oy, 16, 16, '#b8b4a8');
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { R(x, ox + j * 8 + 1, oy + i * 8 + 1, 6, 6, (hash(tx * 2 + j, ty * 2 + i) % 3) ? '#cfcbbe' : '#c4c0b2'); }
    const wl = (dx, dy) => WATERLIKE(m.at(tx + dx, ty + dy));
    if (wl(-1, 0)) { R(x, ox, oy, 2, 16, '#7a766a'); R(x, ox, oy, 1, 16, '#e8e4d8'); }
    if (wl(1, 0)) { R(x, ox + 14, oy, 2, 16, '#7a766a'); R(x, ox + 15, oy, 1, 16, '#5a564c'); }
    if (wl(0, -1)) { R(x, ox, oy, 16, 2, '#7a766a'); R(x, ox, oy, 16, 1, '#e8e4d8'); }
    if (wl(0, 1)) { R(x, ox, oy + 14, 16, 2, '#7a766a'); R(x, ox, oy + 15, 16, 1, '#5a564c'); }
  }
  function cliff(x, m, tx, ty, ox, oy) {
    R(x, ox, oy, 16, 16, '#8a7258');
    const r = G.srng(hash(tx, ty, 41));
    for (let y = 0; y < 16; y += 4) { R(x, ox, oy + y + 3, 16, 1, '#6e5a44'); R(x, ox, oy + y, 16, 1, '#a08868'); }
    for (let i = 0; i < 5; i++) P(x, ox + Math.floor(r() * 16), oy + Math.floor(r() * 16), r() < 0.5 ? '#5a4a38' : '#b8a080');
    const up = m.at(tx, ty - 1), dn = m.at(tx, ty + 1);
    if (up !== 'c') { R(x, ox, oy, 16, 3, '#6aa850'); R(x, ox, oy + 3, 16, 1, '#3f8a38'); }
    if (dn !== 'c' && dn !== null) { R(x, ox, oy + 14, 16, 2, '#5a4a38'); }
  }
  function steps(x, m, tx, ty, ox, oy) {
    R(x, ox, oy, 16, 16, '#a89e8a');
    for (let i = 0; i < 4; i++) { const Y = oy + i * 4; R(x, ox, Y, 16, 3, '#cfc6b0'); R(x, ox, Y, 16, 1, '#e8e0cc'); R(x, ox, Y + 3, 16, 1, '#7a7262'); }
  }
  function promoFlag(x, ox, oy, seed) {
    grass(x, ox, oy, seed);
    R(x, ox + 4, oy + 1, 2, 15, '#4a4a52'); R(x, ox + 4, oy + 1, 1, 15, '#8a8a96');
    R(x, ox + 6, oy + 2, 9, 7, '#d8701c'); R(x, ox + 6, oy + 2, 9, 1, '#f4a050');
    R(x, ox + 8, oy + 4, 5, 1, '#fff2d8'); R(x, ox + 8, oy + 6, 5, 1, '#fff2d8'); R(x, ox + 10, oy + 3, 1, 5, '#fff2d8');
    R(x, ox + 3, oy + 15, 5, 1, 'rgba(30,60,20,0.35)');
  }
  function berryTree(x, ox, oy, seed) {
    grass(x, ox, oy, seed);
    R(x, ox + 7, oy + 10, 2, 6, TREE.to);
    for (let y = 1; y < 12; y++) for (let X = 2; X < 14; X++) {
      const dx = (X - 7.5) / 6, dy = (y - 6) / 5.4, d = dx * dx + dy * dy;
      if (d > 1) continue;
      P(x, ox + X, oy + y, d > 0.75 ? '#245a28' : dx + dy < -0.5 ? '#7cc458' : '#4c9a41');
    }
    [[5, 5], [9, 4], [7, 8], [11, 7], [4, 8]].forEach(([X, Y]) => { R(x, ox + X, oy + Y, 2, 2, '#e04848'); P(x, ox + X, oy + Y, '#ff9a8a'); });
  }
  function fishMound(x, ox, oy, seed) {
    grass(x, ox, oy, seed);
    R(x, ox + 1, oy + 10, 14, 5, '#a8c870'); R(x, ox + 1, oy + 10, 14, 1, '#c8e890');
    R(x, ox + 12, oy + 3, 2, 10, WOOD.o); R(x, ox + 12, oy + 3, 1, 10, WOOD.l);
    R(x, ox + 10, oy + 4, 2, 2, '#e04848'); P(x, ox + 10, oy + 4, '#ffffff');
  }
  function gravel(x, tx, ty, ox, oy) {
    R(x, ox, oy, 16, 16, '#cfc4ac');
    const r = G.srng(hash(tx, ty, 29));
    for (let i = 0; i < 10; i++) { const X = Math.floor(r() * 15), Y = Math.floor(r() * 15); P(x, ox + X, oy + Y, r() < 0.5 ? '#a89c84' : '#e6dcc6'); if (r() < 0.3) P(x, ox + X + 1, oy + Y, '#8a7e68'); }
  }
  function quarryBlock(x, tx, ty, ox, oy) {
    gravel(x, tx, ty, ox, oy);
    R(x, ox + 1, oy + 3, 14, 12, '#6a6458'); R(x, ox + 2, oy + 4, 12, 10, '#a8a090'); R(x, ox + 2, oy + 4, 12, 2, '#cfc8b8');
    R(x, ox + 2, oy + 9, 12, 1, '#7a7466'); R(x, ox + 8, oy + 4, 1, 5, '#7a7466');
  }
  function oldWall(x, tx, ty, ox, oy, seed) {
    grass(x, ox, oy, seed);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      const X = ox + j * 8 + (i % 2 ? 4 : 0) - (i % 2 && j ? 8 : 0), Y = oy + 3 + i * 4;
      if (X < ox || X > ox + 12) continue;
      R(x, X, Y, 8, 4, '#6a6458'); R(x, X + 1, Y, 6, 3, (hash(tx, ty, i * 2 + j) % 3) ? '#b0a894' : '#9a927e'); R(x, X + 1, Y, 6, 1, '#d0c8b4');
    }
    R(x, ox, oy + 15, 16, 1, 'rgba(30,60,20,0.35)');
    if (hash(tx, ty, 77) % 2) { P(x, ox + 3, oy + 3, '#5a9a4a'); P(x, ox + 4, oy + 3, '#5a9a4a'); }
  }
  function campGround(x, tx, ty, ox, oy) {
    R(x, ox, oy, 16, 16, '#c8a878');
    const r = G.srng(hash(tx, ty, 33));
    for (let i = 0; i < 7; i++) P(x, ox + Math.floor(r() * 16), oy + Math.floor(r() * 16), r() < 0.5 ? '#a88a5a' : '#e0c898');
  }
  function lotus(x, m, tx, ty, ox, oy, f) {
    waterTile(x, m, tx, ty, ox, oy, f);
    G.disc(x, ox + 6, oy + 7, 4, '#3f8a46'); G.disc(x, ox + 6, oy + 7, 3, '#5aa85a'); R(x, ox + 6, oy + 4, 1, 3, '#3f8a46');
    G.disc(x, ox + 11, oy + 11, 3, '#3f8a46'); G.disc(x, ox + 11, oy + 11, 2, '#5aa85a');
    P(x, ox + 6, oy + 6, '#f8c8d8'); P(x, ox + 7, oy + 6, '#f8a8c0'); P(x, ox + 6, oy + 5, '#ffe8f0');
  }

  // a training groove in the camp ground, and the dark mouth of a cave in a cliff face
  function groove(x, tx, ty, ox, oy, filled) {
    campGround(x, tx, ty, ox, oy);
    if (filled) { G.disc(x, ox + 8, oy + 8, 7, '#5a4a3a'); G.disc(x, ox + 8, oy + 8, 6, '#9a8670'); G.disc(x, ox + 7, oy + 7, 4, '#c8b8a0'); return; }
    G.disc(x, ox + 8, oy + 8, 7, '#8a6a4a'); G.disc(x, ox + 8, oy + 8, 6, '#3a2a1c'); G.disc(x, ox + 8, oy + 9, 4, '#22180f');
  }
  function caveMouth(x, m, tx, ty, ox, oy) {
    R(x, ox, oy, 16, 16, '#8a7258');
    for (let y = 0; y < 16; y++) for (let X = 0; X < 16; X++) {
      const dx = (X - 7.5) / 7.2, dy = (y - 16) / 15;
      if (dx * dx + dy * dy <= 1) P(x, ox + X, oy + y, dx * dx + dy * dy > 0.82 ? '#3a2e24' : '#120e0c');
    }
    R(x, ox + 2, oy + 14, 12, 2, '#2a221c');
  }

  // outdoor legend: solid flag, grass zone, drawing
  A.OUT = {
    '.': { draw: (x, m, tx, ty, ox, oy) => grass(x, ox, oy, hash(tx, ty)) },
    ',': { grass: 1, tall: TG, draw: (x, m, tx, ty, ox, oy) => tallGrass(x, ox, oy, hash(tx, ty), TG) },
    ';': { grass: 2, tall: TG, draw: (x, m, tx, ty, ox, oy) => tallGrass(x, ox, oy, hash(tx, ty), TG) },
    'z': { grass: 1, tall: TG_DRY, draw: (x, m, tx, ty, ox, oy) => tallGrass(x, ox, oy, hash(tx, ty), TG_DRY) },
    'Z': { grass: 2, tall: TG_SAND, draw: (x, m, tx, ty, ox, oy) => { sandTile(x, tx, ty, ox, oy); tallGrass(x, ox, oy, hash(tx, ty), TG_SAND, true); } },
    'g': { grass: 1, tall: TG_SHADE, draw: (x, m, tx, ty, ox, oy) => tallGrass(x, ox, oy, hash(tx, ty), TG_SHADE) },
    'j': { grass: 2, tall: TG_REED, draw: (x, m, tx, ty, ox, oy) => tallGrass(x, ox, oy, hash(tx, ty), TG_REED) },
    '=': { draw: (x, m, tx, ty, ox, oy) => pathTile(x, m, tx, ty, ox, oy) },
    'p': { draw: (x, m, tx, ty, ox, oy) => plaza(x, tx, ty, ox, oy) },
    's': { draw: (x, m, tx, ty, ox, oy) => sandTile(x, tx, ty, ox, oy) },
    'T': { solid: 1, draw: (x, m, tx, ty, ox, oy) => { grass(x, ox, oy, hash(tx, ty)); tree(x, ox, oy, hash(tx, ty, 2)); } },
    'b': { solid: 1, draw: (x, m, tx, ty, ox, oy) => { grass(x, ox, oy, hash(tx, ty)); bush(x, ox, oy); } },
    'w': { solid: 1, water: 1, anim: 1, draw: (x, m, tx, ty, ox, oy, f) => waterTile(x, m, tx, ty, ox, oy, f || 0) },
    'F': { anim: 1, draw: (x, m, tx, ty, ox, oy, f) => flowers(x, ox, oy, hash(tx, ty), f || 0) },
    'f': { solid: 1, draw: (x, m, tx, ty, ox, oy) => fence(x, m, tx, ty, ox, oy) },
    'S': { solid: 1, sign: 1, draw: (x, m, tx, ty, ox, oy) => sign(x, ox, oy, hash(tx, ty)) },
    'L': { ledge: 1, draw: (x, m, tx, ty, ox, oy) => ledge(x, m, tx, ty, ox, oy) },
    'r': { solid: 1, draw: (x, m, tx, ty, ox, oy) => rock(x, ox, oy, hash(tx, ty)) },
    'k': { solid: 1, draw: (x, m, tx, ty, ox, oy) => { grass(x, ox, oy, hash(tx, ty)); thornBush(x, ox, oy, hash(tx, ty, 5)); } },
    'Y': { solid: 1, draw: (x, m, tx, ty, ox, oy) => { mossFloor(x, ox, oy, hash(tx, ty)); mossTree(x, ox, oy, hash(tx, ty, 2)); } },
    'M': { draw: (x, m, tx, ty, ox, oy) => mossFloor(x, ox, oy, hash(tx, ty)) },
    'l': { solid: 1, lamp: 1, draw: (x, m, tx, ty, ox, oy) => lamp(x, ox, oy, hash(tx, ty)) },
    '#': { solid: 1, draw: (x, m, tx, ty, ox, oy) => grass(x, ox, oy, hash(tx, ty)) },
    'D': { door: 1, draw: (x, m, tx, ty, ox, oy) => pathTile(x, m, tx, ty, ox, oy) },
    'X': { solid: 1, draw: (x, m, tx, ty, ox, oy) => grass(x, ox, oy, hash(tx, ty)) },
    'V': { solid: 1, vine: 1, draw: (x, m, tx, ty, ox, oy) => thinVine(x, ox, oy, hash(tx, ty, 8)) },
    'Q': { solid: 1, bigrock: 1, draw: (x, m, tx, ty, ox, oy) => bigBoulder(x, ox, oy, hash(tx, ty), () => haulBase(x, m, tx, ty, ox, oy)) },
    'd': { draw: (x, m, tx, ty, ox, oy) => dockTile(x, m, tx, ty, ox, oy) },
    'n': { draw: (x, m, tx, ty, ox, oy) => stoneBridge(x, m, tx, ty, ox, oy) },
    'R': { solid: 1, rapids: 1, anim: 1, draw: (x, m, tx, ty, ox, oy, f) => rapidsTile(x, m, tx, ty, ox, oy, f || 0) },
    'o': { solid: 1, water: 1, anim: 1, draw: (x, m, tx, ty, ox, oy, f) => lotus(x, m, tx, ty, ox, oy, f || 0) },
    'c': { solid: 1, draw: (x, m, tx, ty, ox, oy) => cliff(x, m, tx, ty, ox, oy) },
    't': { draw: (x, m, tx, ty, ox, oy) => steps(x, m, tx, ty, ox, oy) },
    'P': { solid: 1, draw: (x, m, tx, ty, ox, oy) => promoFlag(x, ox, oy, hash(tx, ty)) },
    'y': { solid: 1, berry: 1, draw: (x, m, tx, ty, ox, oy) => berryTree(x, ox, oy, hash(tx, ty)) },
    'h': { fish: 1, draw: (x, m, tx, ty, ox, oy) => fishMound(x, ox, oy, hash(tx, ty)) },
    'G': { draw: (x, m, tx, ty, ox, oy) => gravel(x, tx, ty, ox, oy) },
    'q': { solid: 1, draw: (x, m, tx, ty, ox, oy) => quarryBlock(x, tx, ty, ox, oy) },
    'C': { solid: 1, draw: (x, m, tx, ty, ox, oy) => oldWall(x, tx, ty, ox, oy, hash(tx, ty)) },
    'a': { draw: (x, m, tx, ty, ox, oy) => campGround(x, tx, ty, ox, oy) },
    'u': { solid: 1, slot: 1, draw: (x, m, tx, ty, ox, oy) => groove(x, tx, ty, ox, oy, false) },
    'U': { draw: (x, m, tx, ty, ox, oy) => groove(x, tx, ty, ox, oy, true) },
    'm': { draw: (x, m, tx, ty, ox, oy) => caveMouth(x, m, tx, ty, ox, oy) },
    'K': { solid: 1, marker: 1, draw: (x, m, tx, ty, ox, oy) => surveyPost(x, ox, oy, hash(tx, ty)) },
    'O': { solid: 1, water: 1, sea: 1, anim: 1, draw: (x, m, tx, ty, ox, oy, f) => seaTile(x, m, tx, ty, ox, oy, f || 0) },
    'J': { solid: 1, crack: 1, draw: (x, m, tx, ty, ox, oy) => crackRock(x, ox, oy, hash(tx, ty), () => grass(x, ox, oy, hash(tx, ty))) },
    'E': { solid: 1, brazier: 1, anim: 1, draw: (x, m, tx, ty, ox, oy, f) => brazier(x, ox, oy, hash(tx, ty), f) },
    'I': { solid: 1, draw: (x, m, tx, ty, ox, oy) => ropeRail(x, ox, oy, hash(tx, ty)) },
    'i': { solid: 1, pool: 1, anim: 1, draw: (x, m, tx, ty, ox, oy, f) => tidePool(x, m, tx, ty, ox, oy, f || 0) },
    'A': { solid: 1, magnet: 1, draw: (x, m, tx, ty, ox, oy) => magnetLock(x, ox, oy, () => pathTile(x, m, tx, ty, ox, oy)) },
    'N': { solid: 1, oldmark: 1, draw: (x, m, tx, ty, ox, oy) => oldMarker(x, ox, oy, hash(tx, ty)) },
    'v': { solid: 1, valve: 1, draw: (x, m, tx, ty, ox, oy) => { plaza(x, tx, ty, ox, oy); R(x, ox + 7, oy + 6, 2, 10, '#5a6670'); G.disc(x, ox + 8, oy + 6, 5, '#2c7a8a'); G.disc(x, ox + 8, oy + 6, 3, '#5ac0c8'); G.disc(x, ox + 8, oy + 6, 1, '#e8fcff'); } },
    'H': { solid: 1, draw: (x, m, tx, ty, ox, oy) => { R(x, ox, oy, 16, 16, '#6a8a7a'); R(x, ox + 1, oy + 1, 14, 14, '#d8f0ec'); R(x, ox + 1, oy + 1, 14, 14, 'rgba(160,220,210,0.55)'); R(x, ox + 7, oy, 2, 16, '#6a8a7a'); R(x, ox, oy + 7, 16, 2, '#6a8a7a'); P(x, ox + 3, oy + 3, '#ffffff'); P(x, ox + 4, oy + 2, '#ffffff'); P(x, ox + 11, oy + 11, '#ffffff'); } },
    // ---- chapter 3
    'e': { solid: 1, shellbed: 1, draw: (x, m, tx, ty, ox, oy) => shellBed(x, tx, ty, ox, oy) },
    'W': { solid: 1, falls: 1, anim: 1, draw: (x, m, tx, ty, ox, oy, f) => waterfall(x, m, tx, ty, ox, oy, f || 0) },
    'B': { draw: (x, m, tx, ty, ox, oy) => railTile(x, m, tx, ty, ox, oy) },
    '^': { solid: 1, haulseat: 1, draw: (x, m, tx, ty, ox, oy) => railSupport(x, tx, ty, ox, oy, false, () => haulBase(x, m, tx, ty, ox, oy)) },
    '%': { solid: 1, haulseat: 2, draw: (x, m, tx, ty, ox, oy) => railSupport(x, tx, ty, ox, oy, true, () => haulBase(x, m, tx, ty, ox, oy)) },
  };
  A.TALLFRONT = (x, ox, oy, seed, pal) => tallGrass(x, ox, oy, seed, pal || TG, true);

  // ------------------------------------------------------------ indoor pieces
  function woodFloor(x, tx, ty, ox, oy) {
    R(x, ox, oy, 16, 16, '#e7c08a');
    for (let i = 0; i < 4; i++) {
      const Y = oy + i * 4;
      R(x, ox, Y + 3, 16, 1, '#c99a60');
      R(x, ox, Y, 16, 1, '#f0d2a2');
      const cut = (hash(tx, ty * 4 + i) % 12) + 2;
      R(x, ox + cut, Y, 1, 3, '#c99a60');
    }
  }
  function tileFloor(x, tx, ty, ox, oy, a, b) {
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) R(x, ox + j * 8, oy + i * 8, 8, 8, (i + j + tx + ty) % 2 ? a : b);
    R(x, ox, oy, 16, 1, 'rgba(0,0,0,0.06)'); R(x, ox, oy, 1, 16, 'rgba(0,0,0,0.06)');
  }
  function wall(x, map, tx, ty, ox, oy) {
    const below = map.at(tx, ty + 1);
    const low = below !== '#' && below !== 'W' && below !== 'B' && below !== 'k' && below !== null;
    R(x, ox, oy, 16, 16, '#f3e5c3');
    for (let i = 1; i < 16; i += 4) R(x, ox + i, oy, 1, 16, '#eadab0');
    if (low) { R(x, ox, oy + 12, 16, 4, '#b98a58'); R(x, ox, oy + 12, 16, 1, '#d8a870'); R(x, ox, oy + 15, 16, 1, '#7c5530'); }
    if (map.at(tx, ty - 1) === null || ty === 0) R(x, ox, oy, 16, 2, '#6a5040');
  }
  function windowW(x, map, tx, ty, ox, oy) {
    wall(x, map, tx, ty, ox, oy);
    R(x, ox + 2, oy + 2, 12, 9, '#ffffff'); R(x, ox + 3, oy + 3, 10, 7, '#9ed2f2');
    R(x, ox + 3, oy + 3, 10, 2, '#c8e8fa'); R(x, ox + 8, oy + 3, 1, 7, '#ffffff');
    R(x, ox + 2, oy + 11, 12, 1, '#c8b08a');
  }
  function shelf(x, map, tx, ty, ox, oy) {
    R(x, ox, oy, 16, 16, '#7a4e2a'); R(x, ox + 1, oy + 1, 14, 14, '#9a6838');
    const cols = ['#d85050', '#4878c8', '#58a058', '#e8b840', '#a868c8', '#e88848'];
    for (let r2 = 0; r2 < 2; r2++) {
      R(x, ox + 1, oy + 7 + r2 * 7, 14, 1, '#5e3a1a');
      for (let i = 0; i < 6; i++) {
        const c = cols[hash(tx, ty * 2 + r2, i) % cols.length];
        const h = 4 + hash(tx, i, r2) % 2;
        R(x, ox + 2 + i * 2, oy + 7 + r2 * 7 - h, 2, h, c);
        P(x, ox + 2 + i * 2, oy + 7 + r2 * 7 - h, 'rgba(255,255,255,0.4)');
      }
    }
  }
  function table(x, m, tx, ty, ox, oy) {
    woodFloor(x, tx, ty, ox, oy);
    const L = m.at(tx - 1, ty) === 't' ? 0 : 1, Rr = m.at(tx + 1, ty) === 't' ? 16 : 15;
    R(x, ox + L, oy + 3, Rr - L, 9, '#7a4b26'); R(x, ox + L, oy + 3, Rr - L, 7, '#c98d4f'); R(x, ox + L, oy + 3, Rr - L, 1, '#e4b47a');
    if (L) R(x, ox + 2, oy + 12, 2, 3, '#7a4b26');
    if (Rr === 15) R(x, ox + 12, oy + 12, 2, 3, '#7a4b26');
  }
  function counter(x, m, tx, ty, ox, oy) {
    tileFloor(x, tx, ty, ox, oy, '#eef0f4', '#e0e4ec');
    R(x, ox, oy + 2, 16, 14, '#6b6f86'); R(x, ox, oy + 2, 16, 5, '#e6e2d4'); R(x, ox, oy + 2, 16, 1, '#ffffff');
    R(x, ox, oy + 7, 16, 9, '#c9b48a'); R(x, ox, oy + 7, 16, 1, '#8a7650');
    if (m.at(tx - 1, ty) !== 'c') R(x, ox, oy + 2, 1, 14, '#6b6f86');
    if (m.at(tx + 1, ty) !== 'c') R(x, ox + 15, oy + 2, 1, 14, '#6b6f86');
  }
  function tv(x, tx, ty, ox, oy) {
    woodFloor(x, tx, ty, ox, oy);
    R(x, ox + 1, oy + 9, 14, 6, '#7a4b26'); R(x, ox + 1, oy + 9, 14, 1, '#c98d4f');
    R(x, ox + 2, oy, 12, 10, '#2a2a36'); R(x, ox + 3, oy + 1, 10, 7, '#5878a8'); R(x, ox + 4, oy + 2, 4, 2, '#a8c8e8');
  }
  function pc(x, tx, ty, ox, oy, floor) {
    floor(x, tx, ty, ox, oy);
    R(x, ox + 1, oy + 8, 14, 7, '#9a9aa8'); R(x, ox + 1, oy + 8, 14, 1, '#d0d0dc');
    R(x, ox + 3, oy, 10, 9, '#4a4a58'); R(x, ox + 4, oy + 1, 8, 6, '#58c8a8'); R(x, ox + 5, oy + 2, 3, 1, '#c8f8e8');
    R(x, ox + 4, oy + 11, 8, 2, '#5a5a68');
  }
  function healer(x, tx, ty, ox, oy) {
    tileFloor(x, tx, ty, ox, oy, '#eef0f4', '#e0e4ec');
    R(x, ox, oy + 1, 16, 15, '#6b6f86'); R(x, ox + 1, oy + 2, 14, 13, '#d8dce8'); R(x, ox + 1, oy + 2, 14, 1, '#ffffff');
    for (let i = 0; i < 6; i++) {
      const X = ox + 3 + (i % 3) * 4, Y = oy + 5 + Math.floor(i / 3) * 4;
      R(x, X, Y, 3, 3, '#a8a8b8'); P(x, X + 1, Y + 1, '#ffffff');
    }
  }
  function mat(x, tx, ty, ox, oy, floor) {
    floor(x, tx, ty, ox, oy);
    R(x, ox + 1, oy + 5, 14, 10, '#b84a3a'); R(x, ox + 2, oy + 6, 12, 8, '#e0704e');
    for (let i = 3; i < 13; i += 3) R(x, ox + i, oy + 7, 1, 6, '#c85840');
  }
  function plant(x, tx, ty, ox, oy, floor) {
    floor(x, tx, ty, ox, oy);
    R(x, ox + 4, oy + 10, 8, 6, '#a85a30'); R(x, ox + 4, oy + 10, 8, 1, '#d88050');
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI, X = ox + 8 + Math.round(Math.cos(a) * 6), Y = oy + 9 - Math.round(Math.sin(a) * 7);
      R(x, Math.min(X, ox + 7) , Y, Math.abs(X - (ox + 8)) + 1, 2, i % 2 ? '#3d8436' : '#5aa848');
    }
    R(x, ox + 6, oy + 2, 4, 8, '#5aa848'); R(x, ox + 7, oy + 1, 2, 2, '#86cf62');
  }
  function rug(x, tx, ty, ox, oy) {
    R(x, ox, oy, 16, 16, '#4f8a6a'); R(x, ox + 1, oy + 1, 14, 14, '#5fa07c');
    R(x, ox + 3, oy + 3, 10, 10, '#e8d090'); R(x, ox + 4, oy + 4, 8, 8, '#5fa07c');
  }
  function bed(x, tx, ty, ox, oy) {
    woodFloor(x, tx, ty, ox, oy);
    R(x, ox + 1, oy, 14, 16, '#7a4b26'); R(x, ox + 2, oy + 1, 12, 4, '#ffffff'); R(x, ox + 2, oy + 5, 12, 10, '#e87070'); R(x, ox + 2, oy + 5, 12, 1, '#f8a0a0');
  }
  function statue(x, tx, ty, ox, oy) {
    tileFloor(x, tx, ty, ox, oy, '#e2eef4', '#cfe2ec');
    R(x, ox + 3, oy + 10, 10, 6, '#8a8a98'); R(x, ox + 3, oy + 10, 10, 1, '#c8c8d4');
    R(x, ox + 6, oy + 2, 4, 8, '#a8a8b8'); R(x, ox + 3, oy + 3, 3, 3, '#a8a8b8'); R(x, ox + 10, oy + 3, 3, 3, '#a8a8b8'); R(x, ox + 7, oy, 2, 3, '#c8c8d4');
  }
  function gymFloor(x, tx, ty, ox, oy) { tileFloor(x, tx, ty, ox, oy, '#e2eef4', '#cfe2ec'); }
  function gymPath(x, tx, ty, ox, oy) { tileFloor(x, tx, ty, ox, oy, '#f6e7b8', '#ead69c'); }
  function sink(x, tx, ty, ox, oy) {
    woodFloor(x, tx, ty, ox, oy);
    R(x, ox, oy, 16, 16, '#d8d8e0'); R(x, ox, oy + 6, 16, 10, '#b0b0bc'); R(x, ox + 3, oy + 1, 10, 5, '#9ab8d0'); R(x, ox, oy, 16, 1, '#ffffff');
  }
  const WOODF = (x, tx, ty, ox, oy) => woodFloor(x, tx, ty, ox, oy);
  const TILEF = (x, tx, ty, ox, oy) => tileFloor(x, tx, ty, ox, oy, '#eef0f4', '#e0e4ec');
  A.IN = {
    '.': { draw: (x, m, tx, ty, ox, oy) => woodFloor(x, tx, ty, ox, oy) },
    '_': { draw: (x, m, tx, ty, ox, oy) => TILEF(x, tx, ty, ox, oy) },
    'g': { draw: (x, m, tx, ty, ox, oy) => gymFloor(x, tx, ty, ox, oy) },
    'y': { draw: (x, m, tx, ty, ox, oy) => gymPath(x, tx, ty, ox, oy) },
    '#': { solid: 1, draw: (x, m, tx, ty, ox, oy) => wall(x, m, tx, ty, ox, oy) },
    'W': { solid: 1, draw: (x, m, tx, ty, ox, oy) => windowW(x, m, tx, ty, ox, oy) },
    'B': { solid: 1, shelf: 1, draw: (x, m, tx, ty, ox, oy) => shelf(x, m, tx, ty, ox, oy) },
    't': { solid: 1, draw: (x, m, tx, ty, ox, oy) => table(x, m, tx, ty, ox, oy) },
    'c': { solid: 1, counter: 1, draw: (x, m, tx, ty, ox, oy) => counter(x, m, tx, ty, ox, oy) },
    'v': { solid: 1, tv: 1, draw: (x, m, tx, ty, ox, oy) => tv(x, tx, ty, ox, oy) },
    'P': { solid: 1, pc: 1, draw: (x, m, tx, ty, ox, oy) => pc(x, tx, ty, ox, oy, m.floor === '_' ? TILEF : WOODF) },
    'H': { solid: 1, draw: (x, m, tx, ty, ox, oy) => healer(x, tx, ty, ox, oy) },
    'x': { exit: 1, draw: (x, m, tx, ty, ox, oy) => mat(x, tx, ty, ox, oy, m.floor === '_' ? TILEF : m.floor === 'g' ? gymFloor : WOODF) },
    'p': { solid: 1, draw: (x, m, tx, ty, ox, oy) => plant(x, tx, ty, ox, oy, m.floor === '_' ? TILEF : m.floor === 'g' ? gymFloor : WOODF) },
    'r': { draw: (x, m, tx, ty, ox, oy) => rug(x, tx, ty, ox, oy) },
    'b': { solid: 1, draw: (x, m, tx, ty, ox, oy) => bed(x, tx, ty, ox, oy) },
    'k': { solid: 1, draw: (x, m, tx, ty, ox, oy) => sink(x, tx, ty, ox, oy) },
    's': { solid: 1, draw: (x, m, tx, ty, ox, oy) => statue(x, tx, ty, ox, oy) },
    'X': { solid: 1, draw: (x, m, tx, ty, ox, oy) => woodFloor(x, tx, ty, ox, oy) },
    'w': { solid: 1, water: 1, anim: 1, draw: (x, m, tx, ty, ox, oy, f) => waterTile(x, m, tx, ty, ox, oy, f || 0) },
    'Y': { solid: 1, turn: 1, draw: (x, m, tx, ty, ox, oy) => { gymFloor(x, tx, ty, ox, oy); G.disc(x, ox + 8, oy + 8, 7, '#3a3e48'); G.disc(x, ox + 8, oy + 8, 6, '#9aa0b0'); G.disc(x, ox + 8, oy + 8, 3, '#5a6070'); } },
    'Z': { solid: 1, gate: 1, draw: (x, m, tx, ty, ox, oy) => { gymFloor(x, tx, ty, ox, oy); R(x, ox, oy + 2, 2, 14, '#4a4e5a'); R(x, ox + 14, oy + 2, 2, 14, '#4a4e5a'); for (let X = 2; X < 14; X++) { const Y = 5 + ((X >> 1) & 1) * 3; P(x, ox + X, oy + Y, '#ffe85a'); P(x, ox + X, oy + Y + 5, '#f2c230'); } } },
    'N': { solid: 1, board: 1, draw: (x, m, tx, ty, ox, oy) => { wall(x, m, tx, ty, ox, oy); R(x, ox + 1, oy + 2, 14, 12, '#6a4a2a'); R(x, ox + 2, oy + 3, 12, 10, '#c8925a'); R(x, ox + 3, oy + 4, 5, 4, '#fbf3dc'); R(x, ox + 9, oy + 5, 4, 5, '#e8f0f8'); R(x, ox + 4, oy + 9, 4, 3, '#f6e7a8'); R(x, ox + 5, oy + 4, 1, 1, '#e04848'); R(x, ox + 10, oy + 5, 1, 1, '#2c5ea8'); } },
    'z': { draw: (x, m, tx, ty, ox, oy) => { woodFloor(x, tx, ty, ox, oy); R(x, ox, oy, 16, 16, '#5a6670'); for (let k = 0; k < 4; k++) { R(x, ox, oy + k * 4, 16, 3, '#9aa6ae'); R(x, ox, oy + k * 4, 16, 1, '#c8d0d6'); } } },
    'V': { solid: 1, valve: 1, draw: (x, m, tx, ty, ox, oy) => { gymFloor(x, tx, ty, ox, oy); R(x, ox + 7, oy + 6, 2, 10, '#5a6670'); G.disc(x, ox + 8, oy + 6, 5, '#2a6a88'); G.disc(x, ox + 8, oy + 6, 3, '#4ab0c8'); G.disc(x, ox + 8, oy + 6, 1, '#e8f4f8'); } },
    // a low insulated railing between circuit lanes (돛바람 체육관)
    'q': { solid: 1, draw: (x, m, tx, ty, ox, oy) => { gymFloor(x, tx, ty, ox, oy); R(x, ox, oy + 6, 16, 2, '#3a3e48'); R(x, ox, oy + 6, 16, 1, '#8a90a0'); R(x, ox, oy + 11, 16, 2, '#3a3e48'); for (let X = 1; X < 16; X += 5) R(x, ox + X, oy + 4, 2, 11, '#5a6070'); R(x, ox, oy + 14, 16, 1, 'rgba(0,0,0,0.15)'); } },
    // garden gym hedge planter (잎향 체육관)
    'h': { solid: 1, draw: (x, m, tx, ty, ox, oy) => { gymFloor(x, tx, ty, ox, oy); R(x, ox + 1, oy + 9, 14, 7, '#8a6a4a'); R(x, ox + 1, oy + 9, 14, 1, '#b08a5a'); G.disc(x, ox + 5, oy + 7, 5, '#3f8a4a'); G.disc(x, ox + 11, oy + 7, 5, '#3f8a4a'); G.disc(x, ox + 8, oy + 5, 5, '#5aa864'); P(x, ox + 6, oy + 3, '#8ed096'); P(x, ox + 4, oy + 6, '#f08aa0'); P(x, ox + 11, oy + 4, '#f2d23a'); } },
    // ---- chapter 3: the scale pans of the 돌바퀴 load gym (a model stone pushed in sinks onto the pan)
    'u': { solid: 1, slot: 1, draw: (x, m, tx, ty, ox, oy) => { gymFloor(x, tx, ty, ox, oy); G.disc(x, ox + 8, oy + 9, 7, '#3a3e48'); G.disc(x, ox + 8, oy + 9, 6, '#c8ccd6'); G.disc(x, ox + 8, oy + 9, 4, '#9aa0ae'); R(x, ox + 2, oy + 2, 12, 1, '#5a6070'); } },
    'U': { draw: (x, m, tx, ty, ox, oy) => { gymFloor(x, tx, ty, ox, oy); G.disc(x, ox + 8, oy + 9, 7, '#3a3e48'); G.disc(x, ox + 8, oy + 9, 6, '#c8ccd6'); G.disc(x, ox + 8, oy + 8, 4, '#8a7a66'); G.disc(x, ox + 7, oy + 7, 2, '#c8b8a0'); } },
    'o': { solid: 1, draw: (x, m, tx, ty, ox, oy) => { gymFloor(x, tx, ty, ox, oy); for (let y = 2; y < 15; y++) for (let X = 1; X < 15; X++) { const dx = (X - 7.5) / 6.6, dy = (y - 9) / 6, d = dx * dx + dy * dy; if (d <= 1) P(x, ox + X, oy + y, d > 0.78 ? '#4a3e32' : dx + dy > 0.45 ? '#7a6a58' : dx + dy < -0.55 ? '#d0c0a8' : '#a8987e'); } } },
  };

  // ------------------------------------------------------------ caves (달숨동굴) and the reservoir works (저수로)
  // kind 'cave'; def.theme 'works' switches rock to masonry. '.' floors raise encounters, '_' floors never do.
  const CV = { f: '#6e5e4e', fl: '#86745e', fd: '#54463a', ceil: '#241e1a', ceilL: '#3a3028', face: '#5c4a3a', faceL: '#7c6650', faceD: '#3a2e24' };
  const WK = { f: '#8a949c', fl: '#a4aeb6', fd: '#6e7880', ceil: '#2a3238', ceilL: '#3e484e', face: '#5a6670', faceL: '#7a8892', faceD: '#3a444c' };
  const pal = m => (m.def && m.def.theme === 'works') ? WK : CV;
  const isCaveWall = c => c === '#' || c === 'e' || c === null;
  function caveFloor(x, m, tx, ty, ox, oy, smooth) {
    const C = pal(m);
    R(x, ox, oy, 16, 16, C.f);
    if (m.def && m.def.theme === 'works') {
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { R(x, ox + j * 8, oy + i * 8, 8, 8, (hash(tx * 2 + j, ty * 2 + i) % 4) ? C.f : C.fd); R(x, ox + j * 8, oy + i * 8, 8, 1, C.fl); R(x, ox + j * 8, oy + i * 8, 1, 8, C.fl); }
      return;
    }
    const r = G.srng(hash(tx, ty, 61));
    for (let i = 0; i < (smooth ? 3 : 7); i++) { const X = Math.floor(r() * 15), Y = Math.floor(r() * 15); P(x, ox + X, oy + Y, C.fd); if (!smooth && r() < 0.5) P(x, ox + X + 1, oy + Y, C.fl); }
    if (!smooth && r() < 0.3) { const X = 3 + Math.floor(r() * 9), Y = 4 + Math.floor(r() * 8); R(x, ox + X, oy + Y, 3, 2, C.fd); P(x, ox + X, oy + Y, C.fl); }
    // the wall above casts a soft shadow
    if (isCaveWall(m.at(tx, ty - 1))) R(x, ox, oy, 16, 2, 'rgba(0,0,0,0.25)');
  }
  function caveGravel(x, m, tx, ty, ox, oy) {
    caveFloor(x, m, tx, ty, ox, oy, true);
    const r = G.srng(hash(tx, ty, 63));
    for (let i = 0; i < 9; i++) { const X = Math.floor(r() * 14), Y = Math.floor(r() * 14); R(x, ox + X, oy + Y, 2, 2, r() < 0.5 ? '#9a8a76' : '#7a6a58'); P(x, ox + X, oy + Y, '#b8a890'); }
  }
  function caveWall(x, m, tx, ty, ox, oy, echo) {
    const C = pal(m), below = m.at(tx, ty + 1);
    R(x, ox, oy, 16, 16, C.ceil);
    const r = G.srng(hash(tx, ty, 71));
    for (let i = 0; i < 5; i++) P(x, ox + Math.floor(r() * 16), oy + Math.floor(r() * 16), C.ceilL);
    if (!isCaveWall(below)) {   // a rock face looking down onto the floor
      const works = m.def && m.def.theme === 'works';
      R(x, ox, oy + 4, 16, 12, C.face);
      if (works) {
        for (let y = 4; y < 16; y += 4) { R(x, ox, oy + y, 16, 1, C.faceD); for (let X = (y % 8 ? 0 : 4); X < 16; X += 8) R(x, ox + X, oy + y, 1, 4, C.faceD); }
        R(x, ox, oy + 4, 16, 1, C.faceL);
      } else {
        for (let i = 0; i < 4; i++) { const X = Math.floor(r() * 14); R(x, ox + X, oy + 5 + Math.floor(r() * 9), 1, 3, C.faceD); }
        R(x, ox, oy + 4, 16, 2, C.faceL); R(x, ox, oy + 15, 16, 1, C.faceD);
        for (let X = 0; X < 16; X += 5) P(x, ox + X + (hash(tx, X) % 3), oy + 4, C.ceil);
      }
      if (echo) {   // carved ripples: a wall that answers echoes (메아리 탐색)
        for (let k = 0; k < 3; k++) for (let a = 0; a < 10; a++) {
          const ang = Math.PI * (0.15 + 0.7 * a / 9), rr = 2 + k * 2.4;
          P(x, ox + 8 + Math.round(Math.cos(ang) * rr), oy + 13 - Math.round(Math.sin(ang) * rr), k % 2 ? '#b8c8f0' : '#8ea4e0');
        }
      }
    }
  }
  function caveRock(x, m, tx, ty, ox, oy) {
    caveFloor(x, m, tx, ty, ox, oy, true);
    for (let y = 2; y < 15; y++) for (let X = 1; X < 15; X++) {
      const dx = (X - 7.5) / 6.6, dy = (y - 9) / 6, d = dx * dx + dy * dy;
      if (d > 1) continue;
      P(x, ox + X, oy + y, d > 0.78 ? '#2e2620' : dx + dy > 0.45 ? '#5a4a3c' : dx + dy < -0.55 ? '#9a8670' : '#76624e');
    }
  }
  function caveWater(x, m, tx, ty, ox, oy, f) {
    R(x, ox, oy, 16, 16, '#2a4e7a');
    const r = G.srng(hash(tx, ty, 9));
    for (let i = 0; i < 2; i++) { const Y = Math.floor(r() * 13) + 1, X = (Math.floor(r() * 12) + f * 2) & 15; R(x, ox + Math.min(X, 12), oy + Y, 4, 1, '#5a86b8'); }
    if (m.at(tx, ty - 1) !== 'w') R(x, ox, oy, 16, 2, '#1a2e4a');
  }
  function slot(x, m, tx, ty, ox, oy, filled) {
    caveFloor(x, m, tx, ty, ox, oy, true);
    if (filled) {
      G.disc(x, ox + 8, oy + 8, 7, '#4a3e32'); G.disc(x, ox + 8, oy + 8, 6, '#8a7a66'); G.disc(x, ox + 7, oy + 7, 4, '#a8987e');
      R(x, ox + 4, oy + 12, 8, 1, '#5a4c3e');
    } else {
      G.disc(x, ox + 8, oy + 8, 7, '#9a8a74'); G.disc(x, ox + 8, oy + 8, 6, '#120e0c'); G.disc(x, ox + 8, oy + 9, 4, '#000000');
      P(x, ox + 4, oy + 4, '#c8b89c'); P(x, ox + 12, oy + 4, '#c8b89c');
    }
  }
  function crystal(x, m, tx, ty, ox, oy) {
    caveFloor(x, m, tx, ty, ox, oy, true);
    const shard = (X, Y, h, c1, c2) => { for (let i = 0; i < h; i++) { const w = Math.max(1, Math.round((h - i) / 2.2)); R(x, ox + X - (w >> 1), oy + Y - i, w, 1, i < h / 2 ? c1 : c2); } };
    shard(8, 14, 12, '#7a68d8', '#b8a8ff'); shard(4, 15, 7, '#6a58c0', '#a898f0'); shard(12, 15, 8, '#6a58c0', '#c8b8ff');
    P(x, ox + 8, oy + 4, '#ffffff'); P(x, ox + 12, oy + 9, '#ffffff');
  }
  function mushrooms(x, m, tx, ty, ox, oy) {
    caveFloor(x, m, tx, ty, ox, oy, true);
    const r = G.srng(hash(tx, ty, 81));
    for (let i = 0; i < 3; i++) {
      const X = 2 + Math.floor(r() * 10), Y = 5 + Math.floor(r() * 8);
      R(x, ox + X + 1, oy + Y, 1, 3, '#e8dcc0');
      R(x, ox + X - 1, oy + Y - 2, 5, 2, '#d8602c'); R(x, ox + X, oy + Y - 3, 3, 1, '#f08040'); P(x, ox + X, oy + Y - 2, '#ffe0b0');
    }
  }
  function moonFloor(x, m, tx, ty, ox, oy) {
    caveFloor(x, m, tx, ty, ox, oy, true);
    x.fillStyle = 'rgba(210,225,255,0.22)'; x.fillRect(ox, oy, 16, 16);
    const r = G.srng(hash(tx, ty, 91));
    for (let i = 0; i < 3; i++) P(x, ox + Math.floor(r() * 16), oy + Math.floor(r() * 16), '#e8f0ff');
  }
  function ladderHole(x, m, tx, ty, ox, oy) {
    caveFloor(x, m, tx, ty, ox, oy, true);
    G.disc(x, ox + 8, oy + 8, 7, '#120e0c');
    R(x, ox + 4, oy + 2, 2, 12, '#8a5a2c'); R(x, ox + 10, oy + 2, 2, 12, '#8a5a2c');
    for (let y = 4; y < 14; y += 3) R(x, ox + 4, oy + y, 8, 1, '#c98d4f');
  }
  function rails(x, m, tx, ty, ox, oy) {
    caveFloor(x, m, tx, ty, ox, oy, true);
    const horiz = m.at(tx - 1, ty) === 'c' || m.at(tx + 1, ty) === 'c';
    if (horiz) { R(x, ox, oy + 4, 16, 1, '#9aa0a8'); R(x, ox, oy + 11, 16, 1, '#9aa0a8'); for (let X = 1; X < 16; X += 4) R(x, ox + X, oy + 3, 2, 10, '#6a4a2a'); }
    else { R(x, ox + 4, oy, 1, 16, '#9aa0a8'); R(x, ox + 11, oy, 1, 16, '#9aa0a8'); for (let Y = 1; Y < 16; Y += 4) R(x, ox + 3, oy + Y, 10, 2, '#6a4a2a'); }
  }
  function tablet(x, m, tx, ty, ox, oy) {
    caveFloor(x, m, tx, ty, ox, oy, true);
    R(x, ox + 3, oy + 2, 10, 13, '#3a3028'); R(x, ox + 4, oy + 3, 8, 11, '#9a8a76'); R(x, ox + 4, oy + 3, 8, 1, '#c8b89c');
    for (let y = 6; y < 13; y += 2) R(x, ox + 5, oy + y, 6, 1, '#6a5a48');
  }
  function valve(x, m, tx, ty, ox, oy) {
    caveFloor(x, m, tx, ty, ox, oy, true);
    R(x, ox + 7, oy + 6, 2, 10, '#5a6670');
    G.disc(x, ox + 8, oy + 6, 5, '#a82820'); G.disc(x, ox + 8, oy + 6, 3, '#e04838'); G.disc(x, ox + 8, oy + 6, 1, '#f8d0c0');
  }
  // a pull lever on a post; the marks beside it (shape and number) are drawn by the map
  function lever(x, m, tx, ty, ox, oy, down) {
    caveFloor(x, m, tx, ty, ox, oy, true);
    R(x, ox + 3, oy + 9, 10, 6, '#3a3e48'); R(x, ox + 4, oy + 10, 8, 4, '#6a7080');
    const hx = down ? 11 : 5;
    R(x, ox + 7, oy + 9, 2, 2, '#2a2a30');
    for (let i = 0; i < 6; i++) P(x, ox + 8 + Math.round((hx - 8) * i / 6), oy + 9 - i, '#c8c8d0');
    G.disc(x, ox + hx, oy + 3, 2, down ? '#5ab85a' : '#e04838');
  }
  function grate(x, m, tx, ty, ox, oy) {
    R(x, ox, oy, 16, 16, '#3a444c');
    for (let i = 1; i < 16; i += 3) { R(x, ox + i, oy, 1, 16, '#7a8892'); }
    R(x, ox, oy, 16, 1, '#9aa8b2'); R(x, ox, oy + 15, 16, 1, '#2a3238');
  }
  function caveSteps(x, m, tx, ty, ox, oy) {
    const C = pal(m);
    R(x, ox, oy, 16, 16, C.fd);
    for (let i = 0; i < 4; i++) { const Y = oy + i * 4; R(x, ox, Y, 16, 3, C.fl); R(x, ox, Y, 16, 1, '#c8c0b0'); }
  }
  A.CAVE = {
    '.': { grass: 1, draw: (x, m, tx, ty, ox, oy) => caveFloor(x, m, tx, ty, ox, oy) },
    '_': { draw: (x, m, tx, ty, ox, oy) => caveFloor(x, m, tx, ty, ox, oy, true) },
    ',': { grass: 1, draw: (x, m, tx, ty, ox, oy) => caveGravel(x, m, tx, ty, ox, oy) },
    'm': { grass: 2, draw: (x, m, tx, ty, ox, oy) => mushrooms(x, m, tx, ty, ox, oy) },
    'l': { grass: 1, draw: (x, m, tx, ty, ox, oy) => moonFloor(x, m, tx, ty, ox, oy) },
    '#': { solid: 1, draw: (x, m, tx, ty, ox, oy) => caveWall(x, m, tx, ty, ox, oy) },
    'e': { solid: 1, echo: 1, draw: (x, m, tx, ty, ox, oy) => caveWall(x, m, tx, ty, ox, oy, true) },
    'r': { solid: 1, draw: (x, m, tx, ty, ox, oy) => caveRock(x, m, tx, ty, ox, oy) },
    'w': { solid: 1, water: 1, anim: 1, cavewater: 1, draw: (x, m, tx, ty, ox, oy, f) => caveWater(x, m, tx, ty, ox, oy, f || 0) },
    'u': { solid: 1, slot: 1, draw: (x, m, tx, ty, ox, oy) => slot(x, m, tx, ty, ox, oy, false) },
    'U': { draw: (x, m, tx, ty, ox, oy) => slot(x, m, tx, ty, ox, oy, true) },
    'k': { solid: 1, crystal: 1, draw: (x, m, tx, ty, ox, oy) => crystal(x, m, tx, ty, ox, oy) },
    'H': { draw: (x, m, tx, ty, ox, oy) => ladderHole(x, m, tx, ty, ox, oy) },
    'c': { draw: (x, m, tx, ty, ox, oy) => rails(x, m, tx, ty, ox, oy) },
    'S': { solid: 1, sign: 1, draw: (x, m, tx, ty, ox, oy) => tablet(x, m, tx, ty, ox, oy) },
    'L': { ledge: 1, draw: (x, m, tx, ty, ox, oy) => { caveFloor(x, m, tx, ty, ox, oy, true); R(x, ox, oy + 10, 16, 4, '#4a3c30'); R(x, ox, oy + 10, 16, 1, '#8a7660'); R(x, ox, oy + 14, 16, 2, '#2e2620'); } },
    'V': { solid: 1, vine: 1, draw: (x, m, tx, ty, ox, oy) => { caveFloor(x, m, tx, ty, ox, oy, true); thinVine(x, ox, oy, hash(tx, ty, 8)); } },
    'v': { solid: 1, valve: 1, draw: (x, m, tx, ty, ox, oy) => valve(x, m, tx, ty, ox, oy) },
    'g': { draw: (x, m, tx, ty, ox, oy) => grate(x, m, tx, ty, ox, oy) },
    't': { draw: (x, m, tx, ty, ox, oy) => caveSteps(x, m, tx, ty, ox, oy) },
    'X': { solid: 1, draw: (x, m, tx, ty, ox, oy) => caveFloor(x, m, tx, ty, ox, oy, true) },
    'J': { solid: 1, crack: 1, draw: (x, m, tx, ty, ox, oy) => crackRock(x, ox, oy, hash(tx, ty), () => caveFloor(x, m, tx, ty, ox, oy, true)) },
    'Y': { solid: 1, lever: 1, draw: (x, m, tx, ty, ox, oy) => lever(x, m, tx, ty, ox, oy, false) },
    'Z': { solid: 1, lever: 1, draw: (x, m, tx, ty, ox, oy) => lever(x, m, tx, ty, ox, oy, true) },
    'A': { solid: 1, magnet: 1, draw: (x, m, tx, ty, ox, oy) => magnetLock(x, ox, oy, () => caveFloor(x, m, tx, ty, ox, oy, true)) },
    'x': { exit: 1, draw: (x, m, tx, ty, ox, oy) => { caveFloor(x, m, tx, ty, ox, oy, true); R(x, ox + 2, oy + 6, 12, 8, 'rgba(255,240,200,0.25)'); } },
    // ---- chapter 3: tide pools in the sea caves, and the calm teal basins of the purification works (the water board works there)
    'i': { solid: 1, pool: 1, anim: 1, draw: (x, m, tx, ty, ox, oy, f) => cavePool(x, m, tx, ty, ox, oy, f || 0) },
    'o': { solid: 1, water: 1, anim: 1, draw: (x, m, tx, ty, ox, oy, f) => basinWater(x, m, tx, ty, ox, oy, f || 0) },
  };

  // pushable round stone (바위 밀기) and its small gym model
  A.boulder = (() => {
    const [c, x] = cv(16, 16);
    for (let y = 1; y < 16; y++) for (let X = 0; X < 16; X++) {
      const dx = (X - 7.5) / 7.6, dy = (y - 8.8) / 7, d = dx * dx + dy * dy;
      if (d > 1) continue;
      P(x, X, y, d > 0.8 ? '#3a3028' : dx + dy > 0.5 ? '#6e5e4c' : dx + dy < -0.55 ? '#c8b8a0' : '#9a8670');
    }
    [[5, 5], [6, 4], [4, 6]].forEach(([X, Y]) => P(x, X, Y, '#e8dcc8'));
    [[9, 9], [10, 10], [11, 9]].forEach(([X, Y]) => P(x, X, Y, '#5a4a3a'));
    return c;
  })();
  // the ring-marked haul stone while it is being carried (괴력운반)
  A.haulStone = (() => {
    const [c, x] = cv(16, 16);
    bigBoulder(x, 0, 0, 1, () => {});
    return c;
  })();
  // a flat box of light / dark map icons is drawn by the field module; the props below sit in the ground canvas
  A.drawProp = (x, p) => {
    const X = p.x * 16, Y = p.y * 16;
    if (p.k === 'cart') {   // 새길상회 transport cart, two tiles wide
      R(x, X + 2, Y + 3, 28, 9, '#6a4a2a'); R(x, X + 3, Y + 4, 26, 7, '#a8784a'); R(x, X + 3, Y + 4, 26, 1, '#c89a68');
      R(x, X + 4, Y - 2, 24, 7, '#d8701c'); R(x, X + 4, Y - 2, 24, 2, '#f4a050'); R(x, X + 12, Y, 8, 1, '#fff2d8');
      G.disc(x, X + 8, Y + 13, 3, '#3a2a1a'); G.disc(x, X + 8, Y + 13, 1, '#a8784a'); G.disc(x, X + 24, Y + 13, 3, '#3a2a1a'); G.disc(x, X + 24, Y + 13, 1, '#a8784a');
    } else if (p.k === 'crates') {
      R(x, X + 1, Y + 4, 14, 12, '#6a4a2a'); R(x, X + 2, Y + 5, 12, 10, '#c98d4f'); R(x, X + 2, Y + 9, 12, 1, '#8a5a2c'); R(x, X + 7, Y + 5, 1, 10, '#8a5a2c');
      R(x, X + 4, Y, 9, 6, '#6a4a2a'); R(x, X + 5, Y + 1, 7, 4, '#d8a060');
    } else if (p.k === 'board') {
      R(x, X + 2, Y + 9, 2, 7, '#5e3a1a'); R(x, X + 12, Y + 9, 2, 7, '#5e3a1a');
      R(x, X + 1, Y + 1, 14, 10, '#5e3a1a'); R(x, X + 2, Y + 2, 12, 8, '#e8d8b0');
      R(x, X + 3, Y + 3, 4, 3, '#f8f0e0'); R(x, X + 8, Y + 4, 5, 4, '#f4a050'); R(x, X + 3, Y + 7, 4, 2, '#a8c8e8');
    } else if (p.k === 'boat') {   // ferry, two tiles wide, floating
      R(x, X + 1, Y + 7, 30, 6, '#5e3a1a'); R(x, X + 3, Y + 6, 26, 5, '#a8703a'); R(x, X + 3, Y + 6, 26, 1, '#d8a060');
      R(x, X + 14, Y - 6, 2, 13, '#5e3a1a'); R(x, X + 9, Y - 5, 12, 2, '#e8d8b0');
      R(x, X + 1, Y + 13, 30, 1, 'rgba(0,30,60,0.35)');
    } else if (p.k === 'well') {
      G.disc(x, X + 8, Y + 10, 6, '#6a6458'); G.disc(x, X + 8, Y + 10, 4, '#1a2e4a');
      R(x, X + 2, Y + 1, 2, 9, '#5e3a1a'); R(x, X + 12, Y + 1, 2, 9, '#5e3a1a'); R(x, X + 1, Y, 14, 3, '#a8703a');
    } else if (p.k === 'fire') {
      R(x, X + 3, Y + 11, 10, 3, '#5e3a1a'); R(x, X + 4, Y + 10, 8, 2, '#8a5a2c');
      R(x, X + 6, Y + 5, 4, 6, '#f8822c'); R(x, X + 7, Y + 3, 2, 4, '#ffd75a');
    } else if (p.k === 'burrow') {   // a 가시토 burrow in the meadow
      G.disc(x, X + 8, Y + 11, 6, '#6a5a3a'); G.disc(x, X + 8, Y + 11, 5, '#2e2418'); R(x, X + 3, Y + 6, 10, 2, '#8a7a4a');
    } else if (p.k === 'ropeBridge') {   // a snapped footbridge: two plank stubs and a dangling rope
      R(x, X + 2, Y + 4, 12, 3, '#a8703a'); R(x, X + 2, Y + 4, 12, 1, '#d8a060');
      R(x, X + 7, Y + 7, 1, 8, '#c8b078'); R(x, X + 8, Y + 13, 2, 1, '#c8b078');
    } else if (p.k === 'crane') {   // a small dock crane, 2 tiles wide and 3 tall (bottom-left tile at p.x,p.y)
      R(x, X + 2, Y + 10, 28, 6, '#5a6670'); R(x, X + 2, Y + 10, 28, 1, '#9aa6ae');
      R(x, X + 12, Y - 26, 6, 36, '#e3b23c'); for (let i = -24; i < 8; i += 6) R(x, X + 12, Y + i, 6, 1, '#a87818');
      R(x, X - 6, Y - 30, 36, 5, '#e3b23c'); R(x, X - 6, Y - 30, 36, 1, '#f6d878'); R(x, X - 6, Y - 26, 36, 1, '#a87818');
      R(x, X - 3, Y - 25, 1, 18, '#3a3a40'); R(x, X - 6, Y - 8, 7, 5, '#c84a3c'); R(x, X + 24, Y - 25, 6, 6, '#5a6670');
    } else if (p.k === 'windmill') {   // a low pinwheel on a post (바람개비)
      R(x, X + 7, Y - 2, 2, 18, '#8a6a4a'); R(x, X + 5, Y + 14, 6, 2, '#5a4636');
      const c = [X + 8, Y - 3];
      [['#e05a4a', 1, 0], ['#f2d23a', 0, 1], ['#4a90e2', -1, 0], ['#5aa864', 0, -1]].forEach(([col, dx, dy]) => {
        for (let i = 1; i < 7; i++) R(x, c[0] + dx * i - (dy ? Math.floor(i / 2) : 0), c[1] + dy * i - (dx ? Math.floor(i / 2) : 0), dy ? Math.ceil(i / 2) : 1, dx ? Math.ceil(i / 2) : 1, col);
      });
      G.disc(x, c[0], c[1], 2, '#ffffff');
    }
  };

  // ------------------------------------------------------------ buildings (stamps over '#' footprints)
  const ROOFS = {
    red: ['#c84a3c', '#e8705a', '#8e2c24', '#f39a7e'],
    blue: ['#3e70c0', '#5a90dc', '#284c8c', '#8ab4f0'],
    green: ['#3f8a4a', '#5aa864', '#285a30', '#8ed096'],
    orange: ['#e0802c', '#f4a04a', '#a85818', '#fcc890'],
    teal: ['#2a8a98', '#46aab8', '#1a5c68', '#86d4dc'],
    grey: ['#6a7088', '#8a90a8', '#464c62', '#b8bed4'],
    navy: ['#3a4a7a', '#56689c', '#263254', '#8e9cc8'],
  };
  function roof(x, X, Y, w, h, pal) {
    const [b, l, d, hl] = pal;
    R(x, X, Y, w, h, d);
    R(x, X + 1, Y + 1, w - 2, h - 3, b);
    for (let yy = Y + 4; yy < Y + h - 3; yy += 4) R(x, X + 1, yy, w - 2, 1, d);
    for (let yy = Y + 2; yy < Y + h - 3; yy += 4) {
      const off = ((yy - Y) / 4) % 2 ? 3 : 7;
      for (let xx = X + off; xx < X + w - 2; xx += 8) R(x, xx, yy, 1, 2, d);
    }
    R(x, X + 1, Y + 1, w - 2, 1, hl);
    R(x, X + 1, Y + 2, w - 2, 1, l);
    R(x, X, Y + h - 3, w, 3, d); R(x, X, Y + h - 3, w, 1, l);
  }
  function wallBlock(x, X, Y, w, h, base, shade) {
    R(x, X, Y, w, h, shade);
    R(x, X + 1, Y, w - 2, h - 1, base);
    R(x, X, Y + h - 1, w, 1, '#5a4636');
  }
  function windowO(x, X, Y, lit) {
    R(x, X, Y, 12, 10, '#5a4636');
    R(x, X + 1, Y + 1, 10, 8, lit ? '#ffe08a' : '#8ec8ee');
    R(x, X + 1, Y + 1, 10, 3, lit ? '#fff2c0' : '#c4e6fa');
    R(x, X + 6, Y + 1, 1, 8, '#ffffff'); R(x, X + 1, Y + 5, 10, 1, '#ffffff');
  }
  function doorO(x, X, Y, col, glass) {
    R(x, X + 1, Y + 1, 14, 15, '#3e2c20');
    if (glass) {
      R(x, X + 2, Y + 2, 12, 14, '#7cc4e8'); R(x, X + 2, Y + 2, 12, 3, '#bfe4f6'); R(x, X + 8, Y + 2, 1, 14, '#e8f6fc');
    } else {
      R(x, X + 2, Y + 2, 12, 14, col || '#9a6236'); R(x, X + 2, Y + 2, 12, 1, '#c88a52');
      R(x, X + 4, Y + 4, 8, 4, '#80502a'); R(x, X + 4, Y + 10, 8, 4, '#80502a');
      R(x, X + 11, Y + 9, 2, 2, '#f2c84a');
    }
  }
  A.drawBuilding = (x, b, map, lit) => {
    if (b.k === 'tent') { A.drawTent(x, b); return; }
    if (b.k === 'glass') { A.drawGlassHouse(x, b, map); return; }
    if (b.k === 'tower') { A.drawTower(x, b, map); return; }
    const X = b.x * 16, Y = b.y * 16, w = b.w * 16, h = b.h * 16;
    const pal = ROOFS[b.roof || 'red'];
    const wallH = b.wallH || 30;
    const doors = [];
    for (let ty = b.y; ty < b.y + b.h; ty++) for (let tx = b.x; tx < b.x + b.w; tx++) if (map.at(tx, ty) === 'D') doors.push(tx);
    const roofH = h - wallH + 4;
    // shadow on the ground to the right
    x.fillStyle = 'rgba(30,50,20,0.22)'; x.fillRect(X + w, Y + 6, 3, h - 6);
    wallBlock(x, X + 2, Y + h - wallH, w - 4, wallH, b.wall || '#f4ead2', '#d6c6a4');
    // beams
    if (b.k === 'house') { R(x, X + 2, Y + h - wallH, w - 4, 2, '#9a6838'); }
    roof(x, X, Y, w, roofH, pal);
    // windows
    const wy = Y + h - wallH + 8;
    const slots = [];
    for (let i = 0; i < b.w; i++) if (!doors.includes(b.x + i)) slots.push(i);
    const nWin = b.k === 'gym' ? 0 : Math.min(slots.length, b.w >= 6 ? 4 : 2);
    const chosen = [];
    if (nWin) {
      const pickIdx = nWin === 2 ? [slots[0], slots[slots.length - 1]] : [slots[0], slots[1], slots[slots.length - 2], slots[slots.length - 1]];
      pickIdx.forEach(i => { if (!chosen.includes(i)) chosen.push(i); });
    }
    chosen.forEach(i => windowO(x, X + i * 16 + 2, wy, lit));
    doors.forEach(tx => doorO(x, tx * 16, Y + h - 16, b.door, b.k === 'center' || b.k === 'shop' || b.k === 'gym'));
    // emblems / signs
    if (b.k === 'center') {
      const cx = X + w / 2, cy = Y + 10;
      G.disc(x, cx, cy + 4, 9, '#ffffff'); G.disc(x, cx, cy + 4, 8, '#f25f5c');
      R(x, cx - 2, cy - 1, 4, 10, '#ffffff'); R(x, cx - 5, cy + 2, 10, 4, '#ffffff');
    }
    if (b.k === 'shop' || b.k === 'lab' || b.k === 'gym' || b.label) {
      const label = b.label || (b.k === 'shop' ? '상점' : b.k === 'lab' ? '연구소' : '체육관');
      const tw = Math.ceil(G.tw(label)) + 8;
      const sx = Math.round(X + w / 2 - tw / 2), sy = Y + roofH - 14;
      R(x, sx - 1, sy - 1, tw + 2, 15, '#3a2e26');
      R(x, sx, sy, tw, 13, b.k === 'gym' ? '#f6d878' : '#fdf6e4');
      G.text(x, label, sx + 4, sy + 1, '#3a2e26', null);
    }
    if (b.k === 'gym') {
      const cx = X + w / 2, cy = Y + 9;
      if (b.emblem === 'rock') {   // stacked stones
        G.disc(x, cx, cy + 4, 5, '#ffffff'); G.disc(x, cx, cy + 4, 4, '#a8987e'); G.disc(x, cx, cy - 2, 3, '#ffffff'); G.disc(x, cx, cy - 2, 2, '#c8b89c');
      } else if (b.emblem === 'wave') {   // two curling waves
        for (let k = 0; k < 2; k++) for (let a = 0; a < 12; a++) { const ang = Math.PI * a / 11; R(x, Math.round(cx - 8 + k * 8 + Math.cos(ang) * 4), Math.round(cy + 2 - Math.sin(ang) * 4), 2, 2, k ? '#bfe4f6' : '#ffffff'); }
      } else if (b.emblem === 'bolt') {   // a lighthouse lamp with a spark
        R(x, cx - 2, cy - 4, 4, 10, '#ffffff'); R(x, cx - 3, cy - 5, 6, 2, '#f2d23a');
        [[-6, 0], [5, 0], [-5, -4], [4, -4]].forEach(([dx, dy]) => R(x, cx + dx, cy + dy, 2, 1, '#f2d23a'));
        R(x, cx - 1, cy + 6, 2, 2, '#f2d23a');
      } else if (b.emblem === 'leaf') {   // a leaf with its vein
        for (let i = 0; i < 9; i++) { const ww = Math.round(Math.sin(Math.PI * i / 8) * 5); R(x, cx - ww, cy - 4 + i, ww * 2 + 1, 1, i % 2 ? '#bfe8a8' : '#ffffff'); }
        R(x, cx, cy - 4, 1, 10, '#5aa864');
      } else if (b.emblem === 'filter') {   // a clear drop over a filter mesh (푸른숨 보건 체육관)
        for (let i = 0; i < 8; i++) { const ww = Math.round(Math.sin(Math.PI * Math.min(1, (i + 1) / 6) / 2) * (i < 5 ? i : 4)); R(x, cx - ww, cy - 5 + i, ww * 2 + 1, 1, i < 2 ? '#ffffff' : '#9ee4ea'); }
        R(x, cx - 6, cy + 4, 13, 1, '#ffffff'); for (let X = -6; X <= 6; X += 3) R(x, cx + X, cy + 3, 1, 3, '#ffffff');
      } else if (b.emblem === 'wheel') {   // a stone cart wheel (돌바퀴 하중 체육관)
        for (let a = 0; a < 24; a++) { const ang = a / 24 * Math.PI * 2; R(x, Math.round(cx + Math.cos(ang) * 5), Math.round(cy + 1 + Math.sin(ang) * 5), 2, 2, '#ffffff'); }
        R(x, cx - 4, cy + 1, 9, 1, '#d8d0bc'); R(x, cx, cy - 3, 1, 9, '#d8d0bc'); G.disc(x, cx, cy + 1, 2, '#ffffff');
      } else {
        for (let i = 0; i < 7; i++) R(x, cx - 1 + i, cy - 3 + i, 3, 2, '#ffffff');
        R(x, cx + 2, cy - 3, 1, 9, '#e3b23c');
      }
    }
  };
  // canvas tent for the mountain camp (drawn instead of a house when b.k === 'tent')
  A.drawTent = (x, b) => {
    const X = b.x * 16, Y = b.y * 16, w = b.w * 16, h = b.h * 16;
    x.fillStyle = 'rgba(30,50,20,0.22)'; x.fillRect(X + 4, Y + h - 4, w - 4, 4);
    for (let yy = 0; yy < h - 2; yy++) {
      const k = yy / (h - 2), half = Math.round(w / 2 * k);
      R(x, X + w / 2 - half, Y + yy, half * 2, 1, (Math.floor((yy) / 3) % 2) ? '#e8d8b0' : '#d8c494');
    }
    R(x, X + w / 2 - 1, Y, 2, h - 2, '#a88a5a');
    R(x, X + w / 2 - 6, Y + h - 14, 12, 12, '#5a3a20'); R(x, X + w / 2 - 5, Y + h - 13, 10, 11, '#3a2414');
    R(x, X + 2, Y + h - 3, w - 4, 1, '#8a6a3a');
  };
  // the cream glass greenhouse (잎향시 유리온실): an arched glass roof on a low cream wall
  A.drawGlassHouse = (x, b, map) => {
    const X = b.x * 16, Y = b.y * 16, w = b.w * 16, h = b.h * 16;
    x.fillStyle = 'rgba(30,50,20,0.22)'; x.fillRect(X + w, Y + 10, 3, h - 10);
    const wallH = 26, roofH = h - wallH;
    // arched glass roof
    for (let yy = 0; yy < roofH + 4; yy++) {
      const k = yy / (roofH + 4), inset = Math.round((1 - Math.sqrt(Math.max(0, 1 - (1 - k) * (1 - k)))) * 18);
      R(x, X + inset, Y + yy, w - inset * 2, 1, yy % 6 === 0 ? '#7aa89a' : '#cfeee6');
      R(x, X + inset, Y + yy, 1, 1, '#6a8a7a'); R(x, X + w - inset - 1, Y + yy, 1, 1, '#6a8a7a');
    }
    for (let i = 1; i < b.w; i++) R(x, X + i * 16, Y + 6, 1, roofH - 2, '#8ab4a6');
    for (let i = 0; i < 9; i++) P(x, X + 10 + i * 19 % (w - 20), Y + 6 + (i * 7) % (roofH - 8), '#ffffff');
    // cream wall with tall windows
    wallBlock(x, X + 2, Y + h - wallH, w - 4, wallH, '#f8f0dc', '#e2d4b4');
    const doors = [];
    for (let tx = b.x; tx < b.x + b.w; tx++) if (map.at(tx, b.y + b.h - 1) === 'D') doors.push(tx);
    for (let i = 0; i < b.w; i++) {
      if (doors.includes(b.x + i)) continue;
      R(x, X + i * 16 + 3, Y + h - wallH + 4, 10, 14, '#6a8a7a'); R(x, X + i * 16 + 4, Y + h - wallH + 5, 8, 12, '#bfe8dc');
      R(x, X + i * 16 + 4, Y + h - wallH + 5, 8, 3, '#e4f8f0'); P(x, X + i * 16 + 6, Y + h - wallH + 12, '#5aa864'); P(x, X + i * 16 + 9, Y + h - wallH + 10, '#e88aa0');
    }
    doors.forEach(tx => doorO(x, tx * 16, Y + h - 16, null, true));
    const label = b.label || '유리온실', tw = Math.ceil(G.tw(label)) + 8, sx = Math.round(X + w / 2 - tw / 2), sy = Y + roofH - 8;
    R(x, sx - 1, sy - 1, tw + 2, 15, '#3a2e26'); R(x, sx, sy, tw, 13, '#fdf6e4'); G.text(x, label, sx + 4, sy + 1, '#3a2e26', null);
  };
  // the lighthouse (돛바람항 등대): a striped tower rising from a small keeper's house; the lamp is lit by the map
  A.drawTower = (x, b, map) => {
    const X = b.x * 16, Y = b.y * 16, w = b.w * 16, h = b.h * 16, cx = X + w / 2, top = 4, bot = Y + h;
    x.fillStyle = 'rgba(30,50,20,0.22)'; x.fillRect(cx + 14, top + 24, 4, bot - top - 26);
    // a low keeper's hut on both sides of the tower foot
    wallBlock(x, X + 2, Y + h - 18, w - 4, 18, '#f4ead2', '#d6c6a4');
    R(x, X, Y + h - 24, w, 7, '#8e2c24'); R(x, X + 1, Y + h - 24, w - 2, 5, '#c84a3c'); R(x, X + 1, Y + h - 24, w - 2, 1, '#f39a7e');
    windowO(x, X + 5, Y + h - 15, false); windowO(x, X + w - 17, Y + h - 15, false);
    // the striped tower
    for (let yy = top + 19; yy < bot - 4; yy++) {
      const k = (yy - top) / (bot - top), half = Math.round(7 + k * 5);
      R(x, cx - half, yy, half * 2, 1, Math.floor((yy - top - 19) / 9) % 2 ? '#c84a3c' : '#f4f0e8');
      R(x, cx - half, yy, 1, 1, '#5a4636'); R(x, cx + half - 1, yy, 1, 1, '#5a4636');
    }
    R(x, cx - 10, top + 16, 20, 3, '#3a3e48'); R(x, cx - 10, top + 16, 20, 1, '#8a90a0');
    for (let i = -9; i <= 9; i += 3) R(x, cx + i, top + 12, 1, 4, '#3a3e48');
    R(x, cx - 6, top + 4, 12, 12, '#3a3e48'); R(x, cx - 5, top + 5, 10, 10, '#8a90a0'); R(x, cx - 1, top + 5, 2, 10, '#3a3e48');
    R(x, cx - 8, top, 16, 4, '#c84a3c'); R(x, cx - 8, top, 16, 1, '#f39a7e'); R(x, cx - 1, top - 3, 2, 3, '#3a3e48');
    const doors = [];
    for (let tx = b.x; tx < b.x + b.w; tx++) if (map.at(tx, b.y + b.h - 1) === 'D') doors.push(tx);
    doors.forEach(tx => doorO(x, tx * 16, Y + h - 16, '#5a6a88', false));
  };
  // window glow positions (for night lighting)
  A.buildingLights = (b, map) => {
    if (b.k === 'tent') return [{ x: b.x * 16 + b.w * 8, y: b.y * 16 + b.h * 16 - 8 }];
    if (b.k === 'glass') return [];
    if (b.k === 'tower') return [];
    const doors = [];
    for (let ty = b.y; ty < b.y + b.h; ty++) for (let tx = b.x; tx < b.x + b.w; tx++) if (map.at(tx, ty) === 'D') doors.push(tx);
    const slots = [];
    for (let i = 0; i < b.w; i++) if (!doors.includes(b.x + i)) slots.push(i);
    const nWin = b.k === 'gym' ? 0 : Math.min(slots.length, b.w >= 6 ? 4 : 2);
    if (!nWin) return [];
    const idx = nWin === 2 ? [slots[0], slots[slots.length - 1]] : [slots[0], slots[1], slots[slots.length - 2], slots[slots.length - 1]];
    const wallH = b.wallH || 30;
    return [...new Set(idx)].map(i => ({ x: b.x * 16 + i * 16 + 8, y: b.y * 16 + b.h * 16 - wallH + 13 }));
  };

  // shrine pieces (해오름 서낭당): drawn as stamps
  A.drawShrine = (x, s) => {
    const X = s.x * 16, Y = s.y * 16;
    if (s.k === 'oldtree') {
      // huge old tree with a straw rope and five-colour cloth strips
      const w = s.w * 16, h = s.h * 16;
      R(x, X + w / 2 - 8, Y + h - 22, 16, 22, '#5e3a1a'); R(x, X + w / 2 - 6, Y + h - 22, 6, 20, '#8a5a2c');
      for (let yy = 0; yy < h - 14; yy++) for (let xx = 0; xx < w; xx++) {
        const dx = (xx - w / 2 + 0.5) / (w / 2), dy = (yy - (h - 14) / 2) / ((h - 14) / 2);
        const d = dx * dx + dy * dy;
        if (d > 1) continue;
        const n = A.hash(xx >> 2, yy >> 2, 77) % 7;
        P(x, X + xx, Y + yy, d > 0.86 ? '#1c4623' : (dx + dy > 0.5 ? '#2f6c2c' : n === 0 ? '#7cc458' : dx + dy < -0.5 ? '#5aa848' : '#3f8a3a'));
      }
      R(x, X + w / 2 - 10, Y + h - 16, 20, 2, '#e8d088');
      const cols = ['#e04848', '#f4d03c', '#3a6ad0', '#f8f8f8', '#3a9a5a'];
      for (let i = 0; i < 5; i++) R(x, X + w / 2 - 9 + i * 4, Y + h - 14, 2, 6 + (i % 2) * 2, cols[i]);
    } else if (s.k === 'altar') {
      R(x, X, Y + 6, 32, 10, '#6a6a78'); R(x, X + 1, Y + 7, 30, 3, '#a8a8b8'); R(x, X + 2, Y + 10, 28, 5, '#8a8a98');
      R(x, X + 10, Y, 12, 7, '#b0a07a'); R(x, X + 11, Y + 1, 10, 2, '#e8d8a8');
    } else if (s.k === 'sotdae') {
      // tall pole with a wooden bird on top
      R(x, X + 7, Y - 18, 2, 34, '#7a4b26'); R(x, X + 7, Y - 18, 1, 34, '#a8703a');
      R(x, X + 3, Y - 23, 10, 4, '#a8703a'); R(x, X + 11, Y - 25, 3, 3, '#a8703a'); R(x, X + 13, Y - 24, 2, 1, '#3a2a1a');
      R(x, X + 2, Y - 22, 3, 2, '#7a4b26');
    }
  };

  // ------------------------------------------------------------ characters
  const CD = window.CHARDATA;
  const charCache = {};
  const DEFPAL = { K: '#262630', W: '#f8f8f8', E: '#262630', G: '#283040', R: '#f0a090', A: '#e04838', a: '#a82820' };
  A.charFrames = name => {
    if (charCache[name]) return charCache[name];
    const [head, body, palKey] = CD.chars[name];
    const pal = Object.assign({}, DEFPAL, CD.pal[palKey]);
    const bodies = CD[body];
    const H = body === 'kid' ? 20 : 24;
    const mk = (dir, key, flip) => {
      const [c, x] = cv(16, H);
      grid(x, CD.heads[head][dir].concat(bodies[key]), pal, 0, 0);
      if (!flip) return c;
      const [c2, x2] = cv(16, H);
      x2.translate(16, 0); x2.scale(-1, 1); x2.drawImage(c, 0, 0);
      return c2;
    };
    const f = {
      down: [mk('down', 'down_stand'), mk('down', 'down_step'), mk('down', 'down_stand'), mk('down', 'down_step', true)],
      up: [mk('up', 'up_stand'), mk('up', 'up_step'), mk('up', 'up_stand'), mk('up', 'up_step', true)],
      left: [mk('left', 'left_stand'), mk('left', 'left_step'), mk('left', 'left_stand'), mk('left', 'left_step2')],
      right: [mk('left', 'left_stand', true), mk('left', 'left_step', true), mk('left', 'left_stand', true), mk('left', 'left_step2', true)],
      h: H
    };
    return (charCache[name] = f);
  };
  // big portrait for dialogue / intro: the down-stand frame scaled
  A.charStand = name => A.charFrames(name).down[0];

  // ------------------------------------------------------------ small sprites
  // capture cubes: a small isometric box with a lid seam and a gem on the front edge
  function makeCube(col, opt) {
    opt = opt || {};
    const [c, x] = cv(16, 16);
    const pT = [8, 0.6], pL = [0.6, 4.2], pC = [8, 7.8], pR = [15.4, 4.2], pBL = [0.6, 12], pB = [8, 15.6], pBR = [15.4, 12];
    const inPoly = (pts, px, py) => { let inside = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside; } return inside; };
    const face = (px, py) => inPoly([pT, pR, pC, pL], px, py) ? 'top' : inPoly([pL, pC, pB, pBL], px, py) ? 'left' : inPoly([pC, pR, pBR, pB], px, py) ? 'right' : null;
    const at = (X, Y) => face(X + 0.5, Y + 0.5);
    for (let Y = 0; Y < 16; Y++) for (let X = 0; X < 16; X++) {
      const f = at(X, Y);
      if (!f) continue;
      const edge = !at(X - 1, Y) || !at(X + 1, Y) || !at(X, Y - 1) || !at(X, Y + 1);
      let k = col[f];
      if (opt.stripes && f === 'left') k = opt.stripes[Math.floor((X + 0.5 - 0.6) / 2.5) % opt.stripes.length];
      if (f !== 'top') {   // lid seam, parallel to the top edges, a third of the way down the sides
        const top = f === 'left' ? 4.2 + (X + 0.5 - 0.6) * 0.486 : 4.2 + (15.4 - X - 0.5) * 0.486;
        const yy = Y + 0.5 - top;
        if (yy > 2.6 && yy < 3.9) k = col.seam;
      }
      // light rim where the top meets the sides
      if (f !== 'top' && (at(X, Y - 1) === 'top')) k = col.rim || col.top;
      P(x, X, Y, edge ? col.line : k);
    }
    P(x, 6, 3, col.shine); P(x, 7, 3, col.shine); P(x, 5, 4, col.shine);
    // gem on the front edge, sitting on the seam
    R(x, 7, 10, 2, 2, col.gem); P(x, 7, 10, '#ffffff');
    return c;
  }
  A.cube = makeCube({ top: '#7ee0d2', left: '#3cb4a6', right: '#28877e', rim: '#a8f0e4', line: '#173c3c', seam: '#fff2d8', shine: '#e2fff8', gem: '#ffd23a' });
  A.goldcube = makeCube({ top: '#ffe48a', left: '#f2c03e', right: '#c48e28', rim: '#fff2b8', line: '#5a3a10', seam: '#fff8e4', shine: '#fffbe6', gem: '#e8503a' });
  // master cube in the five traditional colours (오방색)
  A.mastercube = makeCube({ top: '#fbf6ec', left: '#3a6ad0', right: '#2a2838', rim: '#ffffff', line: '#14121c', seam: '#f6c84a', shine: '#ffffff', gem: '#e8503a' }, { stripes: ['#3a6ad0', '#e8503a', '#f6c84a'] });
  A.gourd = A.cube;   // old name kept for anything still pointing at it
  // medicine bottle (healing items in the bag)
  A.medicine = (() => {
    const [c, x] = cv(16, 16);
    grid(x, [
      '................',
      '......oooo......',
      '......obbo......',
      '.....oooooo.....',
      '.....owwwwo.....',
      '....owwwwwwo....',
      '....owwwggwo....',
      '....owwgggwo....',
      '....owgggwwo....',
      '....owgwwwwo....',
      '....owwwwwwo....',
      '....ottttttto...',
      '....owwwwwwo....',
      '.....oooooo.....',
      '.....ssssss.....',
      '................'], { o: '#3a3a4a', b: '#a8784a', w: '#e6f6ee', g: '#4cb850', t: '#f2b84a', s: 'rgba(0,0,0,0.22)' }, 0, 0);
    return c;
  })();
  A.bubble = (() => {
    const [c, x] = cv(12, 14);
    grid(x, [
      '.kkkkkkkkkk.',
      'kwwwwwwwwwwk',
      'kwwwwrrwwwwk',
      'kwwwwrrwwwwk',
      'kwwwwrrwwwwk',
      'kwwwwrrwwwwk',
      'kwwwwrrwwwwk',
      'kwwwwwwwwwwk',
      'kwwwwrrwwwwk',
      'kwwwwrrwwwwk',
      '.kkkkkkkkkk.',
      '....kwwk....',
      '.....kk.....',
      '............'], { k: '#2c2f45', w: '#ffffff', r: '#e04848' }, 0, 0);
    return c;
  })();
  A.heart = (() => {
    const [c, x] = cv(12, 14);
    grid(x, [
      '.kkkkkkkkkk.',
      'kwwwwwwwwwwk',
      'kwwrrwwrrwwk',
      'kwrrrrrrrrwk',
      'kwrrrrrrrrwk',
      'kwwrrrrrrwwk',
      'kwwwrrrrwwwk',
      'kwwwwrrwwwwk',
      'kwwwwwwwwwwk',
      '.kkkkkkkkkk.',
      '....kwwk....',
      '.....kk.....',
      '............',
      '............'], { k: '#2c2f45', w: '#ffffff', r: '#f25a7a' }, 0, 0);
    return c;
  })();
  A.shadow = (() => {
    const [c, x] = cv(14, 5);
    grid(x, ['..xxxxxxxxxx..', '.xxxxxxxxxxxx.', 'xxxxxxxxxxxxxx', '.xxxxxxxxxxxx.', '..xxxxxxxxxx..'], { x: 'rgba(20,40,20,0.28)' }, 0, 0);
    return c;
  })();
  // sun / moon icons for the clock
  A.sun = (() => {
    const [c, x] = cv(12, 12);
    G.disc(x, 6, 6, 4, '#f6c94a'); G.disc(x, 6, 6, 3, '#ffe68a');
    [[6, 0], [6, 11], [0, 6], [11, 6], [1, 1], [10, 1], [1, 10], [10, 10]].forEach(([a, b]) => P(x, a, b, '#f6a93a'));
    return c;
  })();
  A.moon = (() => {
    const [c, x] = cv(12, 12);
    G.disc(x, 6, 6, 5, '#f6e7a8'); G.disc(x, 8, 4, 4, 'rgba(0,0,0,0)');
    x.globalCompositeOperation = 'destination-out'; G.disc(x, 8, 4, 4, '#000'); x.globalCompositeOperation = 'source-over';
    return c;
  })();

  // resonance minerals (evolution stones): one rough crystal, each with its own mark
  function makeStone(col, mark) {
    const [c, x] = cv(16, 16);
    grid(x, [
      '................',
      '......oooo......',
      '....oohhllo.....',
      '...ohhlllllo....',
      '..ohlllllllmo...',
      '..olllllllmmo...',
      '.ollllllllmmmo..',
      '.olllllllmmmmo..',
      '.ollllllmmmmmo..',
      '.olllllmmmmmdo..',
      '..ollmmmmmmddo..',
      '..ommmmmmmddo...',
      '...ommmmdddo....',
      '....oooooooo....',
      '.....ssssss.....',
      '................'], { o: col.o, h: col.h, l: col.l, m: col.m, d: col.d, s: 'rgba(0,0,0,0.22)' }, 0, 0);
    mark.forEach(([X, Y]) => P(x, X, Y, col.k));
    return c;
  }
  A.moonstone = makeStone({ o: '#4a3a6a', h: '#ffffff', l: '#ece6fa', m: '#cbbcef', d: '#9a88d0', k: '#e8b830' },
    [[8, 4], [9, 4], [7, 5], [6, 6], [6, 7], [6, 8], [6, 9], [7, 10], [8, 10], [9, 10]]);
  A.chargestone = makeStone({ o: '#5a3a10', h: '#fff8d0', l: '#ffd860', m: '#f2b030', d: '#c8801a', k: '#fffef0' },
    [[9, 3], [8, 4], [7, 5], [6, 6], [7, 6], [8, 6], [9, 6], [8, 7], [7, 8], [6, 9], [5, 10]]);
  A.leafstone = makeStone({ o: '#1f4a2a', h: '#eaffd8', l: '#a2e27c', m: '#5cb85c', d: '#367a36', k: '#eaffd0' },
    [[4, 10], [5, 9], [6, 8], [7, 7], [8, 6], [9, 5], [10, 4], [6, 7], [8, 8], [8, 5], [10, 6]]);

  A.firestone = makeStone({ o: '#5a1a10', h: '#fff2d0', l: '#ffb060', m: '#f06a2a', d: '#b03a18', k: '#fff4a0' },
    [[8, 3], [8, 4], [7, 5], [9, 5], [6, 6], [9, 6], [6, 7], [10, 7], [6, 8], [8, 8], [10, 8], [7, 9], [9, 9], [8, 10]]);
  A.wavestone = makeStone({ o: '#123a6a', h: '#e8f6ff', l: '#9ad0f8', m: '#4a90e2', d: '#2c5ea8', k: '#ffffff' },
    [[3, 6], [4, 5], [5, 5], [6, 6], [7, 7], [8, 7], [9, 6], [10, 5], [4, 9], [5, 8], [6, 8], [7, 9], [8, 10], [9, 10], [10, 9]]);

  // ---- chapter 1 tools and key items (16x16 bag icons)
  const icon = (rows, pal) => { const [c, x] = cv(16, 16); grid(x, rows, pal, 0, 0); return c; };
  A.lampItem = icon([
    '......oo........', '.....o..o.......', '....oooooo......', '....obbbbo......', '...oyyyyyyo.....', '...oywwyyyo.....',
    '...oywyyyyo.....', '...oyyyyyyo.....', '...oyyyyyyo.....', '....obbbbo......', '....oooooo......', '.....o..o.......',
    '................', '................', '................', '................'], { o: '#3a2a1a', b: '#b88a3a', y: '#ffd860', w: '#fff8d8' });
  A.rod = icon([
    '..............o.', '.............o..', '............o.l.', '...........o..l.', '..........o...l.', '.........o....l.',
    '........o.....l.', '.......o......l.', '......o.......l.', '.....o........r.', '....oo...........', '...orro.........',
    '...orro.........', '....oo..........', '..oo............', '.oo.............'], { o: '#5e3a1a', l: '#e8f0f8', r: '#e04848' });
  A.boardItem = icon([
    '................', '....oooooooo....', '...owwwwwwwwo...', '..owbbbbbbbbwo..', '..owbwwwwwwbwo..', '..owbbbbbbbbwo..',
    '..owwwwwwwwwwo..', '..owbbbbbbbbwo..', '..owbwwwwwwbwo..', '..owbbbbbbbbwo..', '...owwwwwwwwo...', '....oooooooo....',
    '.....ssssss.....', '................', '................', '................'], { o: '#1c3c6a', w: '#f4f8fc', b: '#4a90e2', s: 'rgba(0,0,0,0.2)' });
  A.book = icon([
    '................', '...oooooooooo...', '..oggggggggggo..', '..ogyyyyyyyygo..', '..oggggggggggo..', '..ogggwwwwgggo..',
    '..ogggwwwwgggo..', '..oggggggggggo..', '..oggggggggggo..', '..oggggggggggo..', '..owwwwwwwwwwo..', '...oooooooooo...',
    '....ssssssss....', '................', '................', '................'], { o: '#2c2f45', g: '#3f8a4a', y: '#f2c230', w: '#f4f0e0', s: 'rgba(0,0,0,0.2)' });
  A.berry = icon([
    '................', '.......ll.......', '......lgg.......', '.......o........', '....oooooo......', '...orrrrrro.....',
    '..orwwrrrrro....', '..orwrrrrrro....', '..orrrrrrrro....', '..orrrrrrrdo....', '...orrrrrdo.....', '....oooooo......',
    '.....ssss.......', '................', '................', '................'], { o: '#6a1a1a', r: '#e04848', d: '#b02828', w: '#ffb0a0', l: '#5aa848', g: '#3f8a38', s: 'rgba(0,0,0,0.2)' });
  A.rope = icon([
    '................', '.....oooooo.....', '...oorrrrrroo...', '..orroooooorro..', '..oro......oro..', '..oro.oooo.oro..',
    '..oro.orro.oro..', '..oro.oooo.oro..', '..oro......oro..', '..orroooooorro..', '...oorrrrrroo...', '.....oooooo.r...',
    '.............r..', '..............r.', '................', '................'], { o: '#6a4a2a', r: '#d8b070' });
  A.letter = icon([
    '................', '..oooooooooooo..', '..owwwwwwwwwwo..', '..owllllllllwo..', '..owwwwwwwwwwo..', '..owllllllwwwo..',
    '..owwwwwwwwwwo..', '..owllllllllwo..', '..owwwwwwwwwwo..', '..owllllwwwwwo..', '..owwwwwwwwwwo..', '..oooooooooooo..',
    '...ssssssssss...', '................', '................', '................'], { o: '#5e3a1a', w: '#fbf3dc', l: '#a89878', s: 'rgba(0,0,0,0.2)' });
  A.part = icon([
    '................', '......oooo......', '...oo.okko.oo...', '...okookkookko..', '....okkkkkkko...', '..ookkkooookkoo.',
    '..okkkoppookkko.', '..okkkoppookkko.', '..ookkkooookkoo.', '....okkkkkkko...', '...okookkookko..', '...oo.okko.oo...',
    '......oooo......', '................', '................', '................'], { o: '#2a2a36', k: '#9aa0b0', p: '#b8a8ff' });
  A.quartz = icon([
    '................', '.......o........', '......owo.......', '.....owwbo......', '.....owbbo...o..', '....owwbbbo.owo.',
    '....owbbbbo.obo.', '...owwbbbbbo.o..', '...owbbbbbbo....', '...owbbbbbbo....', '....obbbbbo.....', '.....ooooo......',
    '................', '................', '................', '................'], { o: '#4a4a6a', w: '#ffffff', b: '#d8e0f8' });
  A.mapfrag = icon([
    '................', '..oooooooo......', '..oyyyyyyyoo....', '..oyggyyyyyyo...', '..oyggyybyyyo...', '..oyyyyybbyyo...',
    '..oyyrryyybyyo..', '..oyyrryyyyyyo..', '...oyyyyyggyyo..', '....oyyyyggyo...', '.....ooyyyyo....', '.......oooo.....',
    '................', '................', '................', '................'], { o: '#6a4a2a', y: '#f0e2b8', g: '#7cc458', b: '#4a90e2', r: '#e04848' });

  A.mapItem = icon([
    '................', '.oooooooooooooo.', '.oyygyyoyyybyyo.', '.oyggyyoyybbyyo.', '.oyyyyyoybbyyyo.', '.oyrryyoybyyggo.',
    '.oyrryyoyyyyggo.', '.oyyyyyoyyyyyyo.', '.oyyggyoyyyrryo.', '.oyyggyoyyyrryo.', '.oyyyyyoyyyyyyo.', '.oooooooooooooo.',
    '..ssssssssssss..', '................', '................', '................'], { o: '#6a4a2a', y: '#f0e2b8', g: '#7cc458', b: '#4a90e2', r: '#e04848', s: 'rgba(0,0,0,0.2)' });
  A.token = icon([
    '................', '.....oooooo.....', '...oowwwwwwoo...', '..owwyyyyyywwo..', '..owyyyooyyywo..', '.owyyyoggoyyywo.',
    '.owyyoggggoyywo.', '.owyyoggggoyywo.', '.owyyyoggoyyywo.', '..owyyyooyyywo..', '..owwyyyyyywwo..', '...oowwwwwwoo...',
    '.....oooooo.....', '......ssss......', '................', '................'], { o: '#5e3a1a', w: '#fbf3dc', y: '#e3b23c', g: '#2c7a3a', s: 'rgba(0,0,0,0.2)' });

  // 도깨비 사탕: a striped jawbreaker in a twisted wrapper
  A.candy = (() => {
    const [c, x] = cv(16, 16);
    const span = [[6, 9], [4, 11], [4, 11], [3, 12], [3, 12], [3, 12], [3, 12], [4, 11], [4, 11], [6, 9]];  // rows 3..12
    const inside = (X, Y) => { const s = span[Y - 3]; return !!s && X >= s[0] && X <= s[1]; };
    const stripes = ['#ef5a6a', '#f8d860', '#5cb0ea'];
    const dark = { '#ef5a6a': '#c23a52', '#f8d860': '#d8a838', '#5cb0ea': '#3a80c0' };
    R(x, 4, 14, 8, 1, 'rgba(0,0,0,0.22)');
    // wrapper twists, flaring away from the sweet
    grid(x, [
      'o..............o',
      'oo............oo',
      'owo..........owo',
      'owwo........owwo',
      'owwo........owwo',
      'owo..........owo',
      'oo............oo',
      'o..............o'], { o: '#6a3a6a', w: '#f8d8ec' }, 0, 4);
    P(x, 1, 7, '#ffffff'); P(x, 14, 7, '#ffffff');
    for (let Y = 3; Y <= 12; Y++) for (let X = 3; X <= 12; X++) {
      if (!inside(X, Y)) continue;
      const edge = !inside(X - 1, Y) || !inside(X + 1, Y) || !inside(X, Y - 1) || !inside(X, Y + 1);
      let col = edge ? '#3a1f3d' : stripes[Math.floor((X + Y) / 2) % 3];
      if (!edge && X + Y > 17) col = dark[col];   // shade the lower right
      P(x, X, Y, col);
    }
    P(x, 5, 5, '#ffffff'); P(x, 6, 5, '#ffffff'); P(x, 5, 6, '#ffffff'); P(x, 7, 4, '#fff3c8');
    return c;
  })();
  // 도깨비 방망이 (goblin club): knobby head tapering into a wrapped grip, drawn upright
  A.club = (() => {
    const W = 22, H = 36, [c, x] = cv(W, H);
    const knobs = [[4.6, 8.5, 2.7], [17.6, 10.5, 2.7], [4.4, 15.5, 2.4], [17.4, 17.5, 2.4], [7.6, 2.8, 2.6], [14.6, 3.4, 2.6], [6.4, 21.5, 2], [15.6, 22.5, 2]];
    const bumps = [[10.5, 9.5], [13.5, 14.5], [9.5, 18.5], [12.5, 23]];   // knobs facing the viewer
    const hw = y => 7.4 - (y - 7) * 0.22;
    const inBody = (X, Y) => {
      const px = X + 0.5, py = Y + 0.5;
      if (px < 0 || py < 0 || px > W || py > H) return false;
      if (Math.hypot(px - 11, py - 7.5) <= 7.4) return true;                       // domed head
      if (py >= 7.5 && py <= 26.5 && Math.abs(px - 11) <= hw(py)) return true;      // tapering body
      if (py > 26 && py <= 35.5 && Math.abs(px - 11) <= 2.8) return true;           // grip
      return knobs.some(([kx, ky, r]) => Math.hypot(px - kx, py - ky) <= r);
    };
    for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
      if (!inBody(X, Y)) continue;
      const edge = !inBody(X - 1, Y) || !inBody(X + 1, Y) || !inBody(X, Y - 1) || !inBody(X, Y + 1);
      const left = X < 10, right = X > 12;
      let col;
      if (edge) col = '#3b2414';
      else if (Y >= 27) col = (Y === 28 || Y === 29 || Y === 32 || Y === 33) ? (left ? '#ec6a52' : right ? '#a8322a' : '#d84a3c') : (left ? '#c88450' : right ? '#7a4424' : '#a8643a');
      else {
        const s = (X + 0.5 - 11) / 7 + (Y < 6 ? -0.25 : 0);
        col = s < -0.5 ? '#d8955c' : s > 0.45 ? '#7a4424' : '#a8643a';
      }
      P(x, X, Y, col);
    }
    for (const [kx, ky, r] of knobs) P(x, Math.round(kx - r / 2), Math.round(ky - r / 2), '#f0c08a');   // shine on each knob
    for (const [bx, by] of bumps) {
      const X = Math.floor(bx), Y = Math.floor(by);
      R(x, X - 1, Y - 1, 3, 3, '#c07a48'); P(x, X - 1, Y - 1, '#f0c08a'); P(x, X + 1, Y + 1, '#5e3418'); P(x, X, Y + 1, '#7a4424'); P(x, X + 1, Y, '#7a4424');
    }
    return c;
  })();
})();

/* 모아루: 잠든 길의 노래 — monster sprites: vector shapes -> quantised cel-shaded pixel art (front / back / icon) */
'use strict';
(function () {
  const G = window.G;
  const Mo = G.mons = {};

  // ------------------------------------------------------------ colour helpers
  function h2r(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function r2h(r) { return '#' + r.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
  const dk = (h, f) => r2h(h2r(h).map(v => v * f));
  const lt = (h, f) => r2h(h2r(h).map(v => v + (255 - v) * f));
  Mo.dk = dk; Mo.lt = lt;

  // ------------------------------------------------------------ painter
  function painter(x, scale) {
    const used = new Set();
    const g = { x, used, back: false };
    x.lineJoin = 'round'; x.lineCap = 'round';
    x.setTransform(scale, 0, 0, scale, 0, 0);
    const use = c => { used.add(c); return c; };
    // generic shape: outline, cel shade (light from upper left), optional highlight
    g.shape = (path, col, o) => {
      o = o || {};
      const line = use(o.line || dk(col, 0.42));
      const shade = use(o.shade || dk(col, 0.78));
      use(col);
      x.beginPath(); path(x);
      if (!o.noLine) { x.strokeStyle = line; x.lineWidth = (o.lw || 2.1) / scale * scale; x.stroke(); }
      x.save();
      x.beginPath(); path(x); x.clip();
      if (o.flat) { x.fillStyle = col; x.fill(); }
      else {
        x.fillStyle = shade; x.fill();
        x.translate(o.sx === undefined ? -1.6 : o.sx, o.sy === undefined ? -2.2 : o.sy);
        x.beginPath(); path(x); x.fillStyle = col; x.fill();
        if (o.hl !== false) {
          const hl = use(o.light || lt(col, 0.45));
          x.translate(0, 0);
          if (o.hlPath) { x.beginPath(); o.hlPath(x); x.fillStyle = hl; x.fill(); }
        }
      }
      x.restore();
    };
    g.E = (cx, cy, rx, ry, col, o) => {
      o = o || {};
      const rot = o.rot || 0;
      const hlp = o.hl === false ? null : (p => p.ellipse(cx - rx * 0.38, cy - ry * 0.45, rx * 0.32, ry * 0.22, rot - 0.5, 0, Math.PI * 2));
      g.shape(p => p.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2), col, Object.assign({ hlPath: hlp }, o));
    };
    g.Pg = (pts, col, o) => g.shape(p => { p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); }, col, o);
    // smooth closed curve through points
    g.Sm = (pts, col, o) => g.shape(p => smoothPath(p, pts), col, o);
    g.line = (pts, w, col, o) => {
      o = o || {};
      const line = use(o.line || dk(col, 0.42)); use(col);
      x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
      if (!o.noLine) { x.strokeStyle = line; x.lineWidth = w + 2; x.stroke(); }
      x.strokeStyle = col; x.lineWidth = w; x.stroke();
    };
    g.fill = (path, col) => { use(col); x.beginPath(); path(x); x.fillStyle = col; x.fill(); };
    g.dot = (px, py, col, w, h) => { use(col); x.fillStyle = col; x.fillRect(px, py, w || 1, h || 1); };
    // eyes: style 'big' (black with shine), 'iris' (coloured iris), 'line' (closed / sleepy)
    g.eye = (cx, cy, r, o) => {
      o = o || {};
      if (o.style === 'line') {
        g.line([[cx - r, cy], [cx, cy + (o.up ? -r * 0.5 : r * 0.4)], [cx + r, cy]], 1.4, use('#2a2230'), { noLine: true });
        return;
      }
      const ry = r * (o.tall || 1.15);
      g.fill(p => p.ellipse(cx, cy, r + 1, ry + 1, 0, 0, Math.PI * 2), use(o.rim || '#2a2230'));
      if (o.style === 'iris') {
        g.fill(p => p.ellipse(cx, cy, r, ry, 0, 0, Math.PI * 2), use('#ffffff'));
        g.fill(p => p.ellipse(cx + (o.look || 0), cy + 0.3, r * 0.68, ry * 0.75, 0, 0, Math.PI * 2), use(o.iris || '#6a4a2a'));
        g.fill(p => p.ellipse(cx + (o.look || 0), cy + 0.5, r * 0.36, ry * 0.42, 0, 0, Math.PI * 2), use('#1e1820'));
      } else {
        g.fill(p => p.ellipse(cx, cy, r, ry, 0, 0, Math.PI * 2), use(o.iris || '#2a2230'));
      }
      g.dot(Math.round(cx - r * 0.45), Math.round(cy - ry * 0.55), use('#ffffff'), 2, 2);
      if (r > 3) g.dot(Math.round(cx + r * 0.25), Math.round(cy + ry * 0.35), use('#ffffff'), 1, 1);
      if (o.lid) g.fill(p => { p.ellipse(cx, cy - ry * 0.55, r + 1.2, ry * 0.6, 0, Math.PI, Math.PI * 2); }, use(o.lid));
    };
    g.mouth = (cx, cy, w, o) => {
      o = o || {};
      if (o.open) {
        g.fill(p => { p.moveTo(cx - w, cy); p.quadraticCurveTo(cx, cy + w * 1.4, cx + w, cy); p.closePath(); }, use('#5a2030'));
        g.fill(p => { p.ellipse(cx, cy + w * 0.6, w * 0.5, w * 0.3, 0, 0, Math.PI * 2); }, use('#f07080'));
      } else {
        x.beginPath(); x.moveTo(cx - w, cy); x.quadraticCurveTo(cx - w / 2, cy + w * 0.7, cx, cy); x.quadraticCurveTo(cx + w / 2, cy + w * 0.7, cx + w, cy);
        x.strokeStyle = use('#3a2028'); x.lineWidth = 1.2; x.stroke();
      }
    };
    g.blush = (cx, cy, rx) => g.fill(p => p.ellipse(cx, cy, rx || 2.6, (rx || 2.6) * 0.55, 0, 0, Math.PI * 2), use('#ff9fb2'));
    // cute big eye: dark rim, coloured iris with a lighter lower glow, a big and a small shine.
    // o.lid paints a heavy upper lid (confident look); o.closed draws a happy ^ arc
    g.ceye = (cx, cy, r, o) => {
      o = o || {};
      if (o.closed) { g.line([[cx - r, cy + 1.2], [cx, cy - r * 0.6], [cx + r, cy + 1.2]], 1.6, use('#2a2230'), { noLine: true }); return; }
      const ry = r * (o.tall || 1.22), dark = o.dark || '#241c2c', iris = o.iris || '#5a4a7a';
      g.fill(p => p.ellipse(cx, cy, r, ry, 0, 0, Math.PI * 2), use(dark));
      // coloured glow pooled at the bottom of the eye
      g.fill(p => p.ellipse(cx, cy + ry * 0.5, r * 0.66, ry * 0.36, 0, 0, Math.PI * 2), use(iris));
      g.fill(p => p.ellipse(cx, cy + ry * 0.62, r * 0.4, ry * 0.2, 0, 0, Math.PI * 2), use(lt(iris, 0.45)));
      g.fill(p => p.ellipse(cx - r * 0.3, cy - ry * 0.34, r * 0.46, r * 0.46, 0, 0, Math.PI * 2), use('#ffffff'));
      g.fill(p => p.ellipse(cx + r * 0.42, cy + ry * 0.12, r * 0.17, r * 0.17, 0, 0, Math.PI * 2), use('#ffffff'));
      if (o.brow) g.line([[cx - r * 0.9, cy - ry - 2 - o.brow], [cx + r * 0.7, cy - ry - 1.4]], 1.1, use(o.browCol || '#4a2e22'), { noLine: true });
    };
    // paint inside a path only (stripes, patterns)
    g.clip = (path, fn) => { x.save(); x.beginPath(); path(x); x.clip(); fn(); x.restore(); };
    g.rect = (X, Y, w, h, col) => g.fill(p => p.rect(X, Y, w, h), col);
    // a small rounded flame (tip up), s = size
    g.flame = (cx, cy, s, rot, cols) => {
      cols = cols || ['#ff6a3a', '#ffd25a'];
      x.save(); x.translate(cx, cy); x.rotate(rot || 0);
      g.Sm([[0, -12 * s], [5 * s, -4 * s], [6.5 * s, 2 * s], [3.5 * s, 6 * s], [-3.5 * s, 6 * s], [-6.5 * s, 2 * s], [-5 * s, -4 * s]], cols[0], { light: lt(cols[1], 0.3) });
      g.Sm([[0, -5 * s], [3 * s, 1 * s], [2 * s, 4.5 * s], [-2 * s, 4.5 * s], [-3 * s, 1 * s]], cols[1], { noLine: true, hl: false });
      x.restore();
    };
    return g;
  }
  function smoothPath(p, pts) {
    const n = pts.length;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let m0 = mid(pts[n - 1], pts[0]);
    p.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) {
      const a = pts[i], m = mid(a, pts[(i + 1) % n]);
      p.quadraticCurveTo(a[0], a[1], m[0], m[1]);
    }
    p.closePath();
  }

  // ------------------------------------------------------------ quantise to the colours used (crisp pixels)
  function quantise(x, w, h, used) {
    const pal = [...used].map(h2r);
    const img = x.getImageData(0, 0, w, h), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 120) { d[i + 3] = 0; continue; }
      let best = 0, bd = 1e9;
      for (let k = 0; k < pal.length; k++) {
        const c = pal[k];
        const dd = (c[0] - d[i]) ** 2 + (c[1] - d[i + 1]) ** 2 + (c[2] - d[i + 2]) ** 2;
        if (dd < bd) { bd = dd; best = k; }
      }
      const c = pal[best];
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
    // close one-pixel gaps in the outer outline with a dark edge
    const a = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] ? 1 : 0;
    for (let y = 0; y < h; y++) for (let X = 0; X < w; X++) {
      const i = y * w + X;
      if (!a[i]) continue;
      const edge = X === 0 || y === 0 || X === w - 1 || y === h - 1 || !a[i - 1] || !a[i + 1] || !a[i - w] || !a[i + w];
      if (!edge) continue;
      const j = i * 4;
      const lum = d[j] * 0.3 + d[j + 1] * 0.59 + d[j + 2] * 0.11;
      if (lum > 95) { d[j] *= 0.42; d[j + 1] *= 0.42; d[j + 2] *= 0.46; }
    }
    x.putImageData(img, 0, 0);
  }

  // ------------------------------------------------------------ the monsters (drawn in a 64 x 64 space, 80 for the legend)
  const W = '#ffffff';
  const DRAW = {};

  // (starter lines daram / bulguri / muldal and their evolutions are pixel bitmaps in sprites.js)

  // 반짝이: a firefly whose glowing tail is a little cheongsa-chorong lantern (blue silk over red)
  DRAW.banjjak = (g, back) => {
    const navy = '#4a5a9a', face = '#f4ecd8', glow = '#fff2a0';
    g.E(32, 50, 14, 11, '#fff8c8', { noLine: true, hl: false, flat: true });
    [-1, 1].forEach(s => g.E(32 + s * 11, 20, 10, 5.4, '#e2f2ff', { rot: s * 0.75, light: '#ffffff', line: '#7a9ac8' }));
    // lantern tail: a tall cheongsa-chorong — blue silk crown, red silk body, gold ribs
    g.line([[32, 36], [32, 39]], 1.2, '#c49a2a', { noLine: true });
    g.E(32, 48.5, 12.5, 11, '#fff6b0', { noLine: true, hl: false, flat: true });
    g.Sm([[25.5, 40], [38.5, 40], [40.5, 46], [39.5, 54], [24.5, 54], [23.5, 46]], '#ef5a46', { light: '#ffa088' });
    g.clip(p => { p.rect(20, 38, 24, 5.6); }, () => g.Sm([[25.5, 40], [38.5, 40], [40.5, 46], [39.5, 54], [24.5, 54], [23.5, 46]], '#3a6ad0', { light: '#7aa2f0', noLine: true }));
    [28.2, 32, 35.8].forEach(X => g.line([[X, 43.8], [X, 53.6]], 0.8, '#ffd27a', { noLine: true }));
    g.rect(24, 39, 16, 1.8, '#e8b030'); g.rect(24, 53.4, 16, 1.8, '#e8b030');
    g.line([[32, 55.2], [32, 60]], 1.2, '#3a6ad0', { noLine: true }); g.E(32, 60.5, 1.6, 1.6, '#ef5a46', { hl: false });
    // little legs
    g.line([[25, 36], [21, 40]], 1.1, '#2a2a40', { noLine: true }); g.line([[39, 36], [43, 40]], 1.1, '#2a2a40', { noLine: true });
    g.E(32, 33, 10, 7, navy, { light: '#7a8ac8' });
    g.line([[27, 15], [22, 6]], 1, '#2a2a40', { noLine: true }); g.line([[37, 15], [42, 6]], 1, '#2a2a40', { noLine: true });
    g.E(22, 5.5, 2.4, 2.4, glow, { line: '#c8a020' }); g.E(42, 5.5, 2.4, 2.4, glow, { line: '#c8a020' });
    g.E(32, 22, 10.5, 9, navy, { light: '#7a8ac8' });
    if (!back) {
      g.E(32, 24.5, 8, 6, face, { hl: false });
      g.ceye(28, 22.6, 3.2, { iris: '#5a7ad0' }); g.ceye(36, 22.6, 3.2, { iris: '#5a7ad0' });
      g.mouth(32, 27.4, 1.4);
      g.blush(25.4, 27, 1.8); g.blush(38.6, 27, 1.8);
    }
  };

  // 찌르릉: a round hedgehog whose spines are little lightning bolts
  DRAW.jjireung = (g, back) => {
    const spike = '#ffe04a', body = '#b8805a', face = '#fff0d6';
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (0.92 + i * 0.145), ca = Math.cos(a), sa = Math.sin(a);
      const P = (r, o) => [32 + ca * r - sa * o, 40 + sa * r + ca * o];
      g.Pg([P(12, -4), P(20, -3), P(19, 1.5), P(28, 0), P(21, 3.5), P(22, 0.5), P(13, 4)], spike, { line: '#a8701a', light: '#fff8c0' });
      g.E(P(27.5, 0)[0], P(27.5, 0)[1], 1.6, 1.6, '#5ab8f0', { hl: false, noLine: true });
    }
    g.E(24.5, 58.5, 4.6, 2.6, '#7a5236'); g.E(39.5, 58.5, 4.6, 2.6, '#7a5236');
    g.E(32, 44, 15.5, 13.5, body, { light: '#e0aa80' });
    if (!back) {
      g.E(32, 45.5, 11.5, 10.5, face, { hl: false });
      g.ceye(26.6, 43, 3.6, { iris: '#c08a2a' }); g.ceye(37.4, 43, 3.6, { iris: '#c08a2a' });
      g.E(32, 47.6, 1.9, 1.4, '#ff7a90', { hl: false });
      g.mouth(32, 49.6, 1.8);
      g.blush(22.6, 48.4, 2.2); g.blush(41.4, 48.4, 2.2);
      g.line([[13, 50], [10, 47], [12, 46], [9, 43]], 0.9, '#9ad8ff', { line: '#2a6ab8' }); g.line([[51, 50], [54, 47], [52, 46], [55, 43]], 0.9, '#9ad8ff', { line: '#2a6ab8' });
    }
  };

  // 두더콩: a mole popping out of its dirt mound in a miner's helmet
  DRAW.dudeo = (g, back) => {
    const fur = '#8e6c5c', face = '#f2dcc8', pink = '#ff9ab2', soil = '#9a6a44';
    g.E(32, 34, 13.5, 14, fur, { light: '#b8907c' });
    if (!back) {
      g.E(32, 38, 9.5, 8.5, face, { hl: false });
      g.ceye(27.2, 33.5, 3, { closed: true }); g.ceye(36.8, 33.5, 3, { closed: true });
      g.E(32, 38.5, 3.8, 3, pink, { light: '#ffd8e2' });
      g.mouth(32, 42.6, 1.6);
      g.blush(24.6, 38.6, 2.2); g.blush(39.4, 38.6, 2.2);
    }
    // miner's helmet with a lamp
    g.fill(p => p.ellipse(32, 23.5, 13.5, 9.5, 0, Math.PI, Math.PI * 2), '#f6c43a');
    g.shape(p => { p.ellipse(32, 23.5, 13.5, 9.5, 0, Math.PI, Math.PI * 2); p.closePath(); }, '#f6c43a', { light: '#ffe48a' });
    g.rect(17.5, 22.6, 29, 2.6, '#d8a020');
    g.E(32, 16.5, 3.4, 3, '#fffbe0', { line: '#8a6a20', light: '#ffffff' });
    // mound in front
    g.Sm([[4, 62], [8, 52], [18, 46], [32, 48], [46, 46], [56, 52], [60, 62]], soil, { light: '#c08a5a' });
    [[14, 56], [24, 53], [44, 55], [52, 58], [34, 58]].forEach(([X, Y]) => g.E(X, Y, 1.8, 1.4, '#c8a888', { hl: false, noLine: true }));
    if (!back) {
      // shovel paws resting on the mound
      [-1, 1].forEach(s => { g.E(32 + s * 11, 47.5, 5.4, 3.6, pink, { rot: s * 0.3, light: '#ffd8e2' }); [-1.8, 0, 1.8].forEach(k => g.line([[32 + s * 13 + k, 49], [32 + s * 14 + k * 1.2, 51.5]], 0.9, '#fff4f6', { line: '#b86a7a' })); });
    }
  };

  // 두더왕: the mole king on top of its mound — stone crown, red cape, huge shovel claws
  DRAW.dudeowang = (g, back) => {
    const fur = '#7a5848', face = '#f2dcc8', pink = '#ff8aa4', soil = '#8a5a3a';
    g.Sm([[4, 62], [10, 54], [32, 51], [54, 54], [60, 62]], soil, { light: '#b8804e' });
    // cape
    g.Sm([[14, 30], [50, 30], [55, 56], [32, 58], [9, 56]], '#d84a4a', { light: '#ff8a7a' });
    g.rect(13, 29, 38, 3.4, '#fff6ec');
    g.E(32, 42, 15.5, 14, fur, { light: '#a8806c' });
    if (!back) g.E(32, 45, 10, 9, face, { hl: false });
    // crown of stones
    [[21, 14, 4.2], [26.5, 10.5, 4.8], [32, 9, 5.2], [37.5, 10.5, 4.8], [43, 14, 4.2]].forEach(([X, Y, r]) => g.Sm([[X, Y - r], [X + r, Y - r * 0.2], [X + r * 0.6, Y + r], [X - r * 0.7, Y + r * 0.8], [X - r, Y - r * 0.1]], '#b4b4c4', { light: '#ecebf6' }));
    g.E(32, 9, 2.2, 2.2, '#f24a5a', { light: '#ffb0b8' });
    g.E(32, 24, 14.5, 11.5, fur, { light: '#a8806c' });
    if (!back) {
      g.E(32, 28, 9.5, 7, face, { hl: false });
      g.ceye(26.6, 22.8, 3, { closed: true }); g.ceye(37.4, 22.8, 3, { closed: true });
      g.E(32, 27.5, 4.2, 3.2, pink, { light: '#ffd8e2' });
      g.mouth(32, 32, 2.6, { open: true });
      g.blush(23.4, 28, 2.2); g.blush(40.6, 28, 2.2);
      // raised shovel claws
      [-1, 1].forEach(s => { g.E(32 + s * 19, 40, 7.5, 5.5, pink, { rot: s * 0.5, light: '#ffd8e2' }); [-2.6, 0, 2.6].forEach(k => g.Pg([[32 + s * 22 + k, 41], [32 + s * 25 + k * 1.3, 49], [32 + s * 24 + k, 41]], '#fff4f6', { line: '#b86a7a' })); });
    }
  };

  // 개굴: a wide, low frog with eyes on top and an enormous smile
  DRAW.gaegul = (g, back) => {
    const skin = '#5ccaa8', belly = '#f6faea', spot = '#2f9a7c';
    g.E(13, 57, 9, 4, skin, { light: '#a8ecd4' }); g.E(51, 57, 9, 4, skin, { light: '#a8ecd4' });
    g.E(32, 46, 22, 13.5, skin, { light: '#a8ecd4' });
    if (!back) g.E(32, 51, 14, 8, belly, { hl: false });
    [[14, 42], [50, 40], [43, 35], [21, 36]].forEach(([X, Y]) => g.E(X, Y, 2.2, 1.8, spot, { hl: false, noLine: true }));
    g.E(19.5, 30, 8, 7.5, skin, { light: '#a8ecd4' }); g.E(44.5, 30, 8, 7.5, skin, { light: '#a8ecd4' });
    if (!back) {
      g.E(19.5, 29.5, 5.4, 5.6, '#ffffff', { hl: false });  g.E(44.5, 29.5, 5.4, 5.6, '#ffffff', { hl: false });
      g.ceye(19.8, 30, 3.8, { iris: '#2f9a7c' }); g.ceye(44.2, 30, 3.8, { iris: '#2f9a7c' });
      g.fill(p => { p.moveTo(18, 41); p.quadraticCurveTo(32, 50, 46, 41); p.quadraticCurveTo(32, 46, 18, 41); }, '#2a5a4a');
      g.E(32, 45.6, 3.6, 1.6, '#ff8aa0', { hl: false, noLine: true });
      g.blush(14.5, 42, 2.6); g.blush(49.5, 42, 2.6);
      g.E(25, 54, 4.4, 2.6, skin, { light: '#a8ecd4' }); g.E(39, 54, 4.4, 2.6, skin, { light: '#a8ecd4' });
    }
  };

  // 왕개굴: frog king — lotus crown, lily-pad cape, cattail sceptre
  DRAW.wanggaegul = (g, back) => {
    const skin = '#3fb894', belly = '#f2f8e4', spot = '#24806a';
    // cattail sceptre
    g.line([[54, 18], [54, 60]], 1.6, '#5a8a3a', { line: '#2a4a1a' });
    g.E(54, 18, 2.8, 6, '#8a5a30', { light: '#b88050' });
    // lily-pad cape
    g.Sm([[6, 52], [10, 32], [32, 26], [54, 32], [58, 52], [32, 58]], '#5cb84a', { light: '#9ae07a' });
    g.line([[32, 30], [32, 56]], 0.8, '#3a8a2a', { noLine: true }); g.line([[32, 40], [14, 50]], 0.8, '#3a8a2a', { noLine: true }); g.line([[32, 40], [50, 50]], 0.8, '#3a8a2a', { noLine: true });
    g.E(12, 58, 10, 4.4, skin, { light: '#90e0c4' }); g.E(52, 58, 10, 4.4, skin, { light: '#90e0c4' });
    g.E(32, 46, 21, 14, skin, { light: '#90e0c4' });
    if (!back) g.E(32, 50, 13.5, 9, belly, { hl: false });
    g.E(18.5, 26, 8.5, 8, skin, { light: '#90e0c4' }); g.E(45.5, 26, 8.5, 8, skin, { light: '#90e0c4' });
    g.E(32, 34, 18, 9.5, skin, { light: '#90e0c4' });
    // lotus crown
    [[-6, -0.5], [0, 0], [6, 0.5]].forEach(([dx, r]) => g.E(32 + dx, 13, 3.2, 6, '#ffb0cc', { rot: r, light: '#ffe4ee' }));
    g.E(32, 18, 7, 2.6, '#5cb84a', { hl: false });
    if (!back) {
      g.E(18.5, 25.5, 5.8, 6, '#ffffff', { hl: false }); g.E(45.5, 25.5, 5.8, 6, '#ffffff', { hl: false });
      g.ceye(18.8, 26, 4, { iris: '#e8a020', brow: 0.4, browCol: '#1e6a52' }); g.ceye(45.2, 26, 4, { iris: '#e8a020', brow: 0.4, browCol: '#1e6a52' });
      g.fill(p => { p.moveTo(19, 36.5); p.quadraticCurveTo(32, 45, 45, 36.5); p.quadraticCurveTo(32, 41.5, 19, 36.5); }, '#1e4a3c');
      g.blush(14, 36, 2.6); g.blush(50, 36, 2.6);
    }
  };

  // 송송이: a pine-mushroom with a fat speckled cap, its face on the stem, a pine sprig
  DRAW.songsong = (g, back) => {
    const cap = '#b8784a', stalk = '#fbf2dc';
    g.E(25, 59, 4.6, 2.6, '#e2d2b0'); g.E(39, 59, 4.6, 2.6, '#e2d2b0');
    g.Sm([[22, 59], [20, 46], [22, 34], [42, 34], [44, 46], [42, 59]], stalk, { light: '#ffffff' });
    g.Sm([[5, 36], [8, 22], [20, 9], [32, 6], [44, 9], [56, 22], [59, 36], [46, 39], [32, 37], [18, 39]], cap, { light: '#e0a878', hlPath: p => p.ellipse(22, 16, 7, 3.5, -0.4, 0, 7) });
    [[16, 22], [30, 14], [42, 20], [25, 28], [48, 30], [12, 31], [36, 28]].forEach(([X, Y]) => g.E(X, Y, 2.2, 1.6, '#fbe8cc', { hl: false, noLine: true }));
    if (!back) {
      g.ceye(26.6, 46, 3.6, { iris: '#a8784a' }); g.ceye(37.4, 46, 3.6, { iris: '#a8784a' });
      g.mouth(32, 51, 1.8);
      g.blush(22.6, 50.6, 2.4); g.blush(41.4, 50.6, 2.4);
      // pine sprig held at its side
      g.line([[45, 52], [52, 44]], 1, '#5a3a20', { noLine: true });
      [[48, 47], [50, 45], [52, 43]].forEach(([X, Y]) => { g.line([[X, Y], [X + 4, Y - 3]], 0.8, '#3f9a36', { noLine: true }); g.line([[X, Y], [X + 4.4, Y + 0.6]], 0.8, '#3f9a36', { noLine: true }); });
    }
  };

  // 부엉콩: an egg-shaped dusk owl with a lavender face disc and a crescent on its chest
  DRAW.buong = (g, back) => {
    const fur = '#7a6aa8', disc = '#e8e0f6', dark = '#4a3a78';
    g.line([[26, 57], [25, 61]], 1.6, '#f0a040'); g.line([[38, 57], [39, 61]], 1.6, '#f0a040');
    g.Pg([[15, 22], [12, 7], [24, 17]], fur, { light: '#a89ad0' }); g.Pg([[49, 22], [52, 7], [40, 17]], fur, { light: '#a89ad0' });
    g.E(32, 38, 19, 20, fur, { light: '#a89ad0' });
    g.E(13.5, 42, 4.8, 10, dark, { rot: 0.2, light: fur }); g.E(50.5, 42, 4.8, 10, dark, { rot: -0.2, light: fur });
    if (!back) {
      g.E(32, 48, 10, 9, '#d8cff0', { hl: false });
      g.fill(p => { p.arc(32, 48, 4.4, 0.6, Math.PI * 2 - 0.6); p.arc(34.4, 46.6, 3.8, Math.PI * 2 - 0.9, 0.9, true); p.closePath(); }, '#ffe27a');
      g.E(24.5, 31, 8, 7.6, disc, { hl: false }); g.E(39.5, 31, 8, 7.6, disc, { hl: false });
      g.ceye(24.5, 31, 4.6, { iris: '#f0a020' }); g.ceye(39.5, 31, 4.6, { iris: '#f0a020' });
      g.Pg([[29.8, 36.5], [34.2, 36.5], [32, 40]], '#f2c04a', { light: '#ffe08a' });
      g.blush(18, 38, 2.2); g.blush(46, 38, 2.2);
    } else {
      [[22, 34], [42, 34], [32, 44]].forEach(([X, Y]) => g.line([[X - 3, Y], [X, Y + 2], [X + 3, Y]], 1, dark, { noLine: true }));
    }
  };

  // 금오: the three-legged sun crow — round and regal, golden eyes, a sun halo behind (80 x 80 space)
  DRAW.geumo = (g, back) => {
    const black = '#2a2a48', sheen = '#5a5a96', gold = '#f6cc4a', red = '#f0553a';
    g.E(40, 34, 28, 28, red, { light: '#ff9a6a', line: '#a82a1a', hlPath: p => p.ellipse(31, 22, 9, 6, -0.5, 0, 7) });
    g.E(40, 34, 22, 22, '#f8783c', { noLine: true, hl: false, flat: true });
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.E(40 + Math.cos(a) * 25, 34 + Math.sin(a) * 25, 1.6, 1.6, '#ffd27a', { hl: false, noLine: true }); }
    [-1, 1].forEach(s => {
      g.Sm([[40 + s * 8, 40], [40 + s * 24, 24], [40 + s * 37, 18], [40 + s * 36, 27], [40 + s * 39, 33], [40 + s * 31, 37], [40 + s * 33, 44], [40 + s * 20, 47], [40 + s * 12, 52]], black, { light: sheen });
      [[26, 27], [31, 34], [27, 42]].forEach(([X, Y]) => g.line([[40 + s * (X - 6), Y + 4], [40 + s * X, Y]], 1.6, gold, { line: '#8a6010' }));
    });
    g.Sm([[34, 62], [40, 75], [46, 62]], black, { light: sheen });
    g.Pg([[36.5, 69], [40, 76], [43.5, 69]], gold, { line: '#8a6010' });
    [[33.5, 0], [40, 1.5], [46.5, 0]].forEach(([X, d]) => { g.line([[X, 58], [X + (X - 40) * 0.2, 67 + d]], 2, '#f0a030', { line: '#7a4a10' }); g.line([[X - 2.5 + (X - 40) * 0.2, 68 + d], [X + 2.5 + (X - 40) * 0.2, 68 + d]], 1.6, '#f0a030', { line: '#7a4a10' }); });
    g.E(40, 48, 12.5, 13, black, { light: sheen });
    if (!back) g.E(40, 51, 6.5, 7.5, sheen, { hl: false, noLine: true });
    g.Sm([[35, 16], [37.5, 6], [40.5, 13], [44, 5], [45.5, 16]], gold, { line: '#8a6010', light: '#fff0a8' });
    g.E(40, 28, 13, 12, black, { light: sheen });
    if (!back) {
      g.ceye(34.6, 27.5, 3.8, { iris: '#f6cc4a', dark: '#141428' }); g.ceye(45.4, 27.5, 3.8, { iris: '#f6cc4a', dark: '#141428' });
      g.Pg([[37.4, 32.5], [42.6, 32.5], [40, 37.5]], '#f6cc4a', { line: '#8a6010', light: '#fff0a8' });
      g.blush(30, 33, 2); g.blush(50, 33, 2);
    }
  };

  // 꼬마게: a little crab waving one big claw, eyes on stalks
  DRAW.kkomage = (g, back) => {
    const shell = '#f2704a', claw = '#ff8a5e', belly = '#ffe0cc';
    // legs
    [[-1, 46], [-1, 51], [1, 46], [1, 51]].forEach(([s, Y]) => g.line([[32 + s * 15, Y], [32 + s * 23, Y + 3], [32 + s * 25, Y + 8]], 1.8, shell));
    // claws raised
    g.line([[18, 40], [11, 30]], 2.4, shell); g.line([[46, 40], [52, 32]], 2.2, shell);
    g.Sm([[4, 26], [8, 14], [14, 12], [18, 18], [14, 22], [17, 28], [10, 32]], claw, { light: '#ffc0a0' });
    g.Sm([[47, 30], [50, 21], [55, 20], [58, 25], [55, 28], [56, 32], [51, 34]], claw, { light: '#ffc0a0' });
    g.E(32, 44, 18, 11.5, shell, { light: '#ffa888', hlPath: p => p.ellipse(24, 38, 6, 3, -0.2, 0, 7) });
    if (!back) g.E(32, 48, 10, 5.5, belly, { hl: false });
    // eye stalks
    g.line([[26, 35], [25, 27]], 1.6, shell); g.line([[38, 35], [39, 27]], 1.6, shell);
    g.E(25, 25, 4.8, 4.8, '#ffffff', { line: '#a83a2a', hl: false }); g.E(39, 25, 4.8, 4.8, '#ffffff', { line: '#a83a2a', hl: false });
    if (!back) {
      g.ceye(25, 25.4, 3.2, { iris: '#c84a2a' }); g.ceye(39, 25.4, 3.2, { iris: '#c84a2a' });
      g.mouth(32, 44.2, 2);
      g.blush(24, 44, 2.2); g.blush(40, 44, 2.2);
      g.E(51, 12, 2, 2, '#d8f0ff', { line: '#7aaad0', hl: false }); g.E(55, 7, 1.4, 1.4, '#d8f0ff', { line: '#7aaad0', hl: false });
    }
  };

  // 집게장군: a crab general in a plumed helmet and lacquered armour plates
  DRAW.jipge = (g, back) => {
    const shell = '#d8463a', armor = '#9a2e2e', gold = '#f2c84a', claw = '#ef6448';
    [[-1, 47], [-1, 53], [1, 47], [1, 53]].forEach(([s, Y]) => g.line([[32 + s * 18, Y], [32 + s * 26, Y + 3], [32 + s * 28, Y + 8]], 2.2, shell));
    g.line([[15, 40], [9, 30]], 3, shell); g.line([[49, 40], [55, 30]], 3, shell);
    g.Sm([[1, 26], [4, 10], [12, 6], [18, 13], [13, 18], [17, 25], [8, 31]], claw, { light: '#ffa888' });
    g.Sm([[63, 26], [60, 10], [52, 6], [46, 13], [51, 18], [47, 25], [56, 31]], claw, { light: '#ffa888' });
    g.E(32, 46, 21, 13, shell, { light: '#f2806a' });
    g.Sm([[16, 42], [48, 42], [50, 50], [32, 55], [14, 50]], armor, { light: '#c84a4a' });
    [[20, 46], [32, 48], [44, 46]].forEach(([X, Y]) => g.E(X, Y, 1.6, 1.6, gold, { hl: false }));
    g.line([[15, 42], [49, 42]], 1.2, gold, { noLine: true });
    // helmet with plume over the eyes
    g.Sm([[19, 30], [20, 20], [26, 15], [38, 15], [44, 20], [45, 30]], '#5a5a6e', { light: '#9a9ab4' });
    g.rect(18, 28.5, 28, 3, gold);
    g.line([[32, 15], [32, 8]], 1.4, gold, { noLine: true });
    g.Sm([[32, 9], [36, 3], [40, 6], [37, 10]], '#e83a3a', { light: '#ff8a7a' }); g.Sm([[32, 9], [28, 3], [24, 6], [27, 10]], '#e83a3a', { light: '#ff8a7a' });
    if (!back) {
      g.E(25.5, 34.5, 4.6, 4.6, '#ffffff', { line: '#7a2a2a', hl: false }); g.E(38.5, 34.5, 4.6, 4.6, '#ffffff', { line: '#7a2a2a', hl: false });
      g.ceye(25.5, 35, 3.1, { iris: '#c84a2a', brow: 0.2, browCol: '#3a1a1a' }); g.ceye(38.5, 35, 3.1, { iris: '#c84a2a', brow: 0.2, browCol: '#3a1a1a' });
      g.mouth(32, 41, 2.4);
    }
  };

  // 갈매: a fluffy seagull chick with a tiny fish in its beak
  DRAW.galmae = (g, back) => {
    const white = '#fbfbf6', grey = '#a8b6cc', beak = '#f6c445';
    g.line([[27, 56], [26, 61]], 1.6, '#f08a40'); g.line([[37, 56], [38, 61]], 1.6, '#f08a40');
    [-1, 1].forEach(s => g.Sm([[32 + s * 10, 36], [32 + s * 24, 30], [32 + s * 29, 36], [32 + s * 24, 42], [32 + s * 14, 48]], grey, { light: '#d8e2f0' }));
    [-1, 1].forEach(s => { g.line([[32 + s * 23, 33], [32 + s * 27, 37]], 1, '#4a5a74', { noLine: true }); });
    g.E(32, 42, 15, 14.5, white, { light: '#ffffff', line: '#7a8aa0' });
    g.E(32, 27, 12.5, 11, white, { light: '#ffffff', line: '#7a8aa0' });
    if (!back) {
      g.ceye(27, 26, 3.6, { iris: '#4a7ac0' }); g.ceye(37, 26, 3.6, { iris: '#4a7ac0' });
      g.Sm([[28, 30.5], [36, 30.5], [35, 34], [29, 34]], beak, { light: '#ffe08a' });
      g.E(32.6, 32.6, 1, 1, '#e8503a', { hl: false, noLine: true });
      // the fish
      g.E(41, 33.5, 4.4, 2.2, '#9ac8f0', { rot: 0.2, line: '#3a6aa8' }); g.Pg([[45, 33], [48, 31], [48, 36]], '#9ac8f0', { line: '#3a6aa8' });
      g.blush(22.6, 31, 2); g.blush(41.4, 29.4, 1.8);
    }
  };

  // 해파롱: a pastel jellyfish with frilly tentacles that crackle with sparks
  DRAW.haepa = (g, back) => {
    const bell = '#eaa8f0', frill = '#d48ae8', tent = '#c8a0f0', spark = '#ffe45a';
    [[20, 0.6], [26, -0.4], [32, 0.5], [38, -0.5], [44, 0.4]].forEach(([X, ph], i) => {
      const pts = [[X, 34]]; for (let k = 1; k <= 5; k++) pts.push([X + Math.sin(k * 1.3 + ph) * 3, 34 + k * 5.2]);
      g.line(pts, 1.8, tent, { line: '#8a5ab8' });
      g.E(pts[5][0], pts[5][1], 1.6, 1.6, '#ffffff', { hl: false, line: '#8a5ab8' });
    });
    g.Sm([[13, 36], [16, 32], [21, 36], [26, 32], [32, 36], [38, 32], [43, 36], [48, 32], [51, 36], [46, 39], [32, 40], [18, 39]], frill, { light: '#f2c8f8' });
    g.Sm([[12, 34], [13, 20], [21, 11], [32, 8], [43, 11], [51, 20], [52, 34], [32, 36]], bell, { light: '#fbe0ff', hlPath: p => p.ellipse(22, 17, 5, 3, -0.5, 0, 7) });
    [[24, 15], [40, 14], [32, 12]].forEach(([X, Y]) => g.E(X, Y, 1.6, 1.4, '#ffffff', { hl: false, noLine: true }));
    if (!back) {
      g.ceye(26, 25, 3.6, { iris: '#a85ad0' }); g.ceye(38, 25, 3.6, { iris: '#a85ad0' });
      g.mouth(32, 29.6, 1.6);
      g.blush(21.4, 29.2, 2.2); g.blush(42.6, 29.2, 2.2);
      g.line([[8, 44], [11, 40], [9, 39], [12, 35]], 1, spark, { line: '#a8801a' }); g.line([[56, 44], [53, 40], [55, 39], [52, 35]], 1, spark, { line: '#a8801a' });
    }
  };

  // ------------------------------------------------------------ sprite cache
  // Designer-drawn monsters arrive as pixel bitmaps (G.SPRITES, decoded once by Mo.load);
  // the rest are painted from vectors at their native size.
  const cache = {};
  const IMG = {};
  Mo.load = async () => {
    const S = G.SPRITES || {};
    await Promise.all(Object.keys(S).map(k => new Promise(res => {
      const im = new Image();
      im.onload = () => { IMG[k] = im; res(); };
      im.onerror = () => res();
      im.src = S[k];
    })));
  };
  const BIG = new Set(['geumo', 'haetae']);
  const bitmap = key => {
    const im = IMG[key];
    if (!im) return null;
    const [c, x] = G.art.cv(im.width, im.height);
    x.drawImage(im, 0, 0);
    return c;
  };
  const mirror = src => {
    const [c, x] = G.art.cv(src.width, src.height);
    x.setTransform(-1, 0, 0, 1, src.width, 0); x.drawImage(src, 0, 0);
    return c;
  };
  // species whose sheet hasn't been pixelized yet: a soft egg in the type colour with a pencil '?'
  function placeholder(id, view) {
    const sp = G.data && G.data.MONS[id];
    const col = sp ? (G.data.TYPE_COL[sp.t[0]] || '#b3aa8c') : '#b3aa8c', dk = sp ? (G.data.TYPE_DARK[sp.t[0]] || '#7a7258') : '#7a7258';
    const size = view === 'icon' ? 32 : view === 'mini' ? 28 : view === 'back' ? 96 : 64;
    const [c, x] = G.art.cv(size, size);
    const cx = size / 2, r = size * 0.36, cy = size - r * 1.12 - 2;
    for (let y = 0; y < size; y++) for (let X = 0; X < size; X++) {
      const dx = (X + 0.5 - cx) / (r * 0.92), dy = (y + 0.5 - cy) / (r * 1.1), d = dx * dx + dy * dy;
      if (d > 1) continue;
      x.fillStyle = d > 0.8 ? dk : (dx < -0.2 && dy < -0.25) ? '#ffffff' : ((X + y) % 4 === 0 ? G.mons.lt(col, 0.25) : G.mons.lt(col, 0.55));
      x.fillRect(X, y, 1, 1);
    }
    if (size >= 28) {
      const q = Math.max(1, Math.round(size / 32));
      const Q = ['.ooo.', 'o...o', '....o', '...o.', '..o..', '.....', '..o..'];
      const ox = Math.round(cx - 2.5 * q), oy = Math.round(cy - 3.5 * q);
      x.fillStyle = dk;
      Q.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'o') x.fillRect(ox + i * q, oy + j * q, q, q); }));
    }
    return c;
  }
  function render(id, view) {
    const bm = bitmap(id + ':' + view);
    if (bm) return bm;
    if (!DRAW[id]) return placeholder(id, view);
    const big = BIG.has(id);
    const base = big ? 80 : 64;
    const scale = view === 'icon' ? 32 / base : view === 'back' ? 1.5 : view === 'mini' ? (big ? 0.34 : 0.42) : 1;
    const size = view === 'icon' ? 32 : view === 'mini' ? 28 : Math.round(base * scale);
    const [c, x] = G.art.cv(size, size);
    const g = painter(x, scale);
    if (view === 'back') x.setTransform(-scale, 0, 0, scale, size, 0);   // back view faces the opponent
    if (view === 'mini') x.setTransform(scale, 0, 0, scale, (size - base * scale) / 2, size - base * scale);
    DRAW[id](g, view === 'back');
    x.setTransform(1, 0, 0, 1, 0, 0);
    quantise(x, size, size, g.used);
    return c;
  }
  Mo.front = id => cache[id + ':f'] || (cache[id + ':f'] = render(id, 'front'));
  Mo.back = id => cache[id + ':b'] || (cache[id + ':b'] = render(id, 'back'));
  Mo.icon = id => cache[id + ':i'] || (cache[id + ':i'] = render(id, 'icon'));
  // giants carry a smaller 80px card for boxed screens (dex, summary, evolution); everyone else uses the front
  Mo.card = id => cache[id + ':c'] || (cache[id + ':c'] = bitmap(id + ':card') || Mo.front(id));
  // small overworld sprites for the monster that follows the player: {down, up, left, right}
  Mo.mini = id => {
    if (cache[id + ':m']) return cache[id + ':m'];
    let left = bitmap(id + ':mini'), up = bitmap(id + ':miniup');
    if (!left) left = render(id, 'mini');
    const right = mirror(left);
    return (cache[id + ':m'] = { down: left, left, right, up: up || right });
  };
  // white silhouette (for flashes / evolution)
  Mo.silhouette = (id, view, col) => {
    const key = id + ':s:' + view + ':' + (col || 'w');
    if (cache[key]) return cache[key];
    const src = view === 'back' ? Mo.back(id) : view === 'card' ? Mo.card(id) : Mo.front(id);
    const [c, x] = G.art.cv(src.width, src.height);
    x.drawImage(src, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = col || '#ffffff';
    x.fillRect(0, 0, src.width, src.height);
    return (cache[key] = c);
  };
  Mo.has = id => !!(DRAW[id] || IMG[id + ':front']);
  Mo.ids = () => [...new Set([...Object.keys(DRAW), ...Object.keys(G.SPRITES || {}).map(k => k.split(':')[0])])];
})();

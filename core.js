/* 모아루: 잠든 길의 노래 — core: screens, loop, input, timers, text, panels, layers */
'use strict';
(function () {
  const G = window.G = window.G || {};
  G.W = 256; G.H = 192;
  G.cvT = document.getElementById('top');
  G.cvB = document.getElementById('bot');
  G.T = G.cvT.getContext('2d');
  G.B = G.cvB.getContext('2d');
  G.FONT = '12px G11B, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

  // ------------------------------------------------------------ random
  G.rand = Math.random;
  G.ri = (a, b) => a + Math.floor(G.rand() * (b - a + 1));
  G.chance = p => G.rand() < p;
  G.pick = arr => arr[Math.floor(G.rand() * arr.length)];
  G.srng = seed => () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  G.clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  // ------------------------------------------------------------ timers (frame based)
  G.frame = 0;
  const timers = [];
  G.wait = n => new Promise(r => timers.push({ t: G.frame + Math.max(1, Math.round(n)), r }));
  function runTimers() {
    for (let i = timers.length - 1; i >= 0; i--) {
      if (timers[i].t <= G.frame) { const r = timers[i].r; timers.splice(i, 1); r(); }
    }
  }
  // tweens: G.tween(frames, fn(t)) resolves when done
  const tweens = [];
  G.tween = (frames, fn) => new Promise(r => { tweens.push({ f: 0, n: Math.max(1, frames), fn, r }); fn(0); });
  function runTweens() {
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      tw.f++;
      const t = Math.min(1, tw.f / tw.n);
      tw.fn(t);
      if (t >= 1) { tweens.splice(i, 1); tw.r(); }
    }
  }

  // ------------------------------------------------------------ input
  const KEYMAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
    KeyZ: 'a', Space: 'a', KeyJ: 'a', KeyX: 'b', KeyK: 'b', Escape: 'b', Backspace: 'b',
    Enter: 'start', NumpadEnter: 'start', KeyC: 'start', KeyM: 'start'
  };
  const BTN = ['up', 'down', 'left', 'right', 'a', 'b', 'start'];
  G.keyHeld = {}; G.touchHeld = {}; G.pressed = {}; G.holdT = {};
  BTN.forEach(b => { G.keyHeld[b] = 0; G.touchHeld[b] = 0; G.holdT[b] = 0; });
  G.btn = b => !!(G.keyHeld[b] || G.touchHeld[b]);
  G.hit = b => !!G.pressed[b];
  G.lastInput = 'key';
  addEventListener('keydown', e => {
    const b = KEYMAP[e.code];
    if (G.typing) return;           // a DOM text field has focus
    if (!b) return;
    e.preventDefault();
    G.lastInput = 'key';
    if (!e.repeat) { G.pressed[b] = 1; if (b === 'start' && G.inMenuLike && G.inMenuLike()) G.pressed.a = 1; }
    G.keyHeld[b] = 1;
    G.audio && G.audio.unlock();
  });
  addEventListener('keyup', e => { const b = KEYMAP[e.code]; if (b) G.keyHeld[b] = 0; });
  addEventListener('blur', () => { BTN.forEach(b => { G.keyHeld[b] = 0; G.touchHeld[b] = 0; }); if (G.joy) { G.joy.on = false; G.joy.dead = false; G.joy.key = null; G.joy.id = null; } });
  // key repeat for menus: true on press, then every 5 frames after 16 frames held
  G.rep = b => {
    if (G.pressed[b]) return true;
    if (!G.btn(b)) return false;
    const t = G.holdT[b];
    return t > 16 && (t - 16) % 5 === 0;
  };

  // touch / mouse on the bottom screen: immediate-mode hot regions registered while drawing
  G.hot = [];
  G.addHot = r => { G.hot.push(r); return r; };
  const ptrs = new Map();   // pointerId -> {region, key}
  function toCanvas(cv, e) {
    const rc = cv.getBoundingClientRect();
    return { x: (e.clientX - rc.left) * G.W / rc.width, y: (e.clientY - rc.top) * G.H / rc.height };
  }
  function findHot(p) {
    for (let i = G.hot.length - 1; i >= 0; i--) {
      const r = G.hot[i];
      if (r.r ? (Math.hypot(p.x - r.cx, p.y - r.cy) <= r.r) : (p.x >= r.x && p.y >= r.y && p.x < r.x + r.w && p.y < r.y + r.h)) return r;
    }
    return null;
  }

  // floating joystick: wherever the thumb lands inside a 'joy' region becomes the centre,
  // and dragging away from it holds one of the four directions
  const JOY = G.joy = { on: false, dead: false, id: null, ox: 0, oy: 0, x: 0, y: 0, key: null };
  G.JOY_DEAD = 6;      // drag distance (game px) before a direction engages
  G.JOY_REACH = 26;    // past this the centre trails the finger, so reversing never needs a long swipe
  function joyDir(dx, dy, cur) {
    if (Math.hypot(dx, dy) < (cur ? G.JOY_DEAD * 0.7 : G.JOY_DEAD)) return null;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    let horiz = ax > ay;
    if (cur === 'left' || cur === 'right') horiz = ay <= ax * 1.3;      // hysteresis around the diagonals
    else if (cur === 'up' || cur === 'down') horiz = ax > ay * 1.3;
    return horiz ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }
  function joySet(d) {
    if (d === JOY.key) return;
    if (JOY.key) G.touchHeld[JOY.key] = 0;
    JOY.key = d;
    if (d) { G.touchHeld[d] = 1; G.pressed[d] = 1; }
  }
  function joyMove(p) {
    let dx = p.x - JOY.ox, dy = p.y - JOY.oy;
    const dist = Math.hypot(dx, dy);
    if (dist > G.JOY_REACH) {
      const k = (dist - G.JOY_REACH) / dist;
      JOY.ox += dx * k; JOY.oy += dy * k;
      dx = p.x - JOY.ox; dy = p.y - JOY.oy;
    }
    JOY.x = p.x; JOY.y = p.y;
    joySet(joyDir(dx, dy, JOY.key));
  }
  // the screen under the thumb changed (menu, battle…): drop the direction and ignore this touch until it lifts
  G.joyCancel = () => { joySet(null); if (JOY.on) JOY.dead = true; };
  function joyEnd() { joySet(null); JOY.on = false; JOY.dead = false; JOY.id = null; }

  function releaseTouch(id) {
    if (JOY.on && JOY.id === id) joyEnd();
    const s = ptrs.get(id);
    if (!s) return;
    if (s.key) G.touchHeld[s.key] = 0;
    ptrs.delete(id);
  }
  G.cvB.addEventListener('pointerdown', e => {
    e.preventDefault();
    G.lastInput = e.pointerType === 'mouse' ? 'mouse' : 'touch';
    G.audio && G.audio.unlock();
    G.cvB.setPointerCapture && G.cvB.setPointerCapture(e.pointerId);
    const p = toCanvas(G.cvB, e);
    const r = findHot(p);
    if (!r) return;
    if (r.kind === 'joy') {
      if (JOY.on) return;                 // one stick at a time
      Object.assign(JOY, { on: true, dead: false, id: e.pointerId, ox: p.x, oy: p.y, x: p.x, y: p.y, key: null });
      return;
    }
    const s = { region: r, key: null };
    if (r.kind === 'hold') {
      s.key = r.key; G.touchHeld[r.key] = 1; G.pressed[r.key] = 1;
    } else if (r.onTap) {
      r.onTap(p);
    }
    ptrs.set(e.pointerId, s);
  });
  G.cvB.addEventListener('pointermove', e => {
    if (JOY.on && JOY.id === e.pointerId && !JOY.dead) joyMove(toCanvas(G.cvB, e));
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => G.cvB.addEventListener(t, e => releaseTouch(e.pointerId)));
  G.cvT.addEventListener('pointerdown', e => {
    e.preventDefault();
    G.lastInput = e.pointerType === 'mouse' ? 'mouse' : 'touch';
    G.audio && G.audio.unlock();
    const p = toCanvas(G.cvT, e);
    G.topTap = p;
    if (G.onTopTap && G.onTopTap(p)) return;
    G.pressed.a = 1;
  });
  ['contextmenu', 'selectstart', 'dblclick'].forEach(t => {
    G.cvB.addEventListener(t, e => e.preventDefault());
    G.cvT.addEventListener(t, e => e.preventDefault());
  });

  // who is viewing: true only for the artifact's owner (page runtime's `user` capability); false anywhere else
  let ownerP = null;
  G.isOwner = () => ownerP || (ownerP = (async () => {
    try {
      const u = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('user') : null;
      return u ? !!(await u.isOwner()) : false;
    } catch (e) { return false; }
  })());

  // ------------------------------------------------------------ text
  G.text = (ctx, s, x, y, col, sh) => {
    ctx.font = G.FONT;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    s = String(s);
    if (sh !== null) { ctx.fillStyle = sh || 'rgba(0,0,0,0.18)'; ctx.fillText(s, Math.round(x) + 1, Math.round(y) + 1); }
    ctx.fillStyle = col || '#36363f';
    ctx.fillText(s, Math.round(x), Math.round(y));
  };
  G.textR = (ctx, s, x, y, col, sh) => G.text(ctx, s, x - G.tw(s), y, col, sh);
  G.textC = (ctx, s, x, y, col, sh) => G.text(ctx, s, x - G.tw(s) / 2, y, col, sh);
  const twCache = new Map();
  G.tw = s => {
    s = String(s);
    let v = twCache.get(s);
    if (v === undefined) { G.T.font = G.FONT; v = G.T.measureText(s).width; if (twCache.size < 4000) twCache.set(s, v); }
    return v;
  };
  G.wrap = (s, maxW) => {
    const out = [];
    for (const para of String(s).split('\n')) {
      let line = '';
      for (const word of para.split(' ')) {
        const t = line ? line + ' ' + word : word;
        if (G.tw(t) <= maxW) { line = t; continue; }
        if (line) out.push(line);
        if (G.tw(word) > maxW) {
          let cur = '';
          for (const ch of word) {
            if (G.tw(cur + ch) > maxW) { out.push(cur); cur = ch; } else cur += ch;
          }
          line = cur;
        } else line = word;
      }
      out.push(line);
    }
    return out;
  };
  // Korean particle helper: josa(name, '이','가')
  G.josa = (word, a, b) => {
    const c = String(word).charCodeAt(String(word).length - 1);
    if (c < 0xac00 || c > 0xd7a3) return b;
    return (c - 0xac00) % 28 ? a : b;
  };
  G.eul = w => w + G.josa(w, '을', '를');
  G.iga = w => w + G.josa(w, '이', '가');
  G.eun = w => w + G.josa(w, '은', '는');
  G.wa = w => w + G.josa(w, '과', '와');
  G.ro = w => {
    const c = String(w).charCodeAt(String(w).length - 1);
    if (c < 0xac00 || c > 0xd7a3) return w + '로';
    const jong = (c - 0xac00) % 28;
    return w + (jong === 0 || jong === 8 ? '로' : '으로');
  };

  // ------------------------------------------------------------ pixel shapes
  const insetCache = {};
  function insets(r) {
    if (insetCache[r]) return insetCache[r];
    const a = [];
    for (let i = 0; i < r; i++) {
      const dy = r - i - 0.5;
      a.push(Math.round(r - Math.sqrt(Math.max(0, r * r - dy * dy))));
    }
    return (insetCache[r] = a);
  }
  G.rrect = (ctx, x, y, w, h, r, fill) => {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    ctx.fillStyle = fill;
    if (r <= 0) { ctx.fillRect(x, y, w, h); return; }
    r = Math.min(r, w >> 1, h >> 1);
    const ins = insets(r);
    ctx.fillRect(x, y + r, w, h - 2 * r);
    for (let i = 0; i < r; i++) {
      ctx.fillRect(x + ins[i], y + i, w - 2 * ins[i], 1);
      ctx.fillRect(x + ins[i], y + h - 1 - i, w - 2 * ins[i], 1);
    }
  };
  // layered DS-like box: list of [color, inset] rings drawn outside-in
  G.box = (ctx, x, y, w, h, rings, r) => {
    r = r == null ? 4 : r;
    rings.forEach((c, i) => G.rrect(ctx, x + i, y + i, w - 2 * i, h - 2 * i, Math.max(0, r - i), c));
  };
  G.STYLE = {
    text: ['#2c2f45', '#e9c45a', '#2c2f45', '#fbfbf7'],
    white: ['#3a3d52', '#ffffff', '#f4f4f0'],
    panel: ['#3a3d52', '#fdfcf6'],
    dark: ['#14151f', '#3a3d52', '#262838'],
    gold: ['#5a3f12', '#f6d878', '#e3b23c']
  };
  G.disc = (ctx, cx, cy, r, fill) => {
    ctx.fillStyle = fill;
    for (let y = -r; y < r; y++) {
      const hw = Math.round(Math.sqrt(r * r - (y + 0.5) * (y + 0.5)));
      ctx.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2, 1);
    }
  };

  // big touch button on the bottom screen (also keyboard-selectable through `sel`)
  G.button = (ctx, x, y, w, h, label, opt) => {
    opt = opt || {};
    const base = opt.color || '#f4f1e6', dark = opt.dark || '#a89f86', ink = opt.ink || '#2e2c36';
    const sel = !!opt.sel, dis = !!opt.disabled;
    const press = opt.pressed ? 1 : 0;
    G.rrect(ctx, x, y + 2, w, h, 5, 'rgba(20,18,30,0.35)');
    G.rrect(ctx, x, y + press, w, h, 5, sel ? '#2c2f45' : '#4a4658');
    G.rrect(ctx, x + 1, y + 1 + press, w - 2, h - 2, 4, dis ? '#c9c6bd' : dark);
    G.rrect(ctx, x + 1, y + 1 + press, w - 2, h - 4, 4, dis ? '#dedbd2' : base);
    if (sel) {
      G.rrect(ctx, x - 2, y - 2, w + 4, 2, 0, '#f6c94a');
      G.rrect(ctx, x - 2, y + h, w + 4, 2, 0, '#f6c94a');
      G.rrect(ctx, x - 2, y - 2, 2, h + 4, 0, '#f6c94a');
      G.rrect(ctx, x + w, y - 2, 2, h + 4, 0, '#f6c94a');
    }
    if (label != null) {
      const lines = String(label).split('\n');
      const ty = y + press + Math.round((h - 2 - lines.length * 14) / 2) + 1;
      lines.forEach((ln, i) => G.textC(ctx, ln, x + w / 2, ty + i * 14, dis ? '#8d8a82' : ink, opt.shadow === undefined ? 'rgba(255,255,255,0.55)' : opt.shadow));
    }
    if (opt.onTap && !dis) G.addHot({ x, y, w, h, onTap: opt.onTap });
  };

  // ------------------------------------------------------------ layers & scenes
  G.layers = [];
  G.scene = null;
  G.lock = 0;                       // >0 while a script is running
  G.pushLayer = l => { G.layers.push(l); return l; };
  G.popLayer = l => { const i = G.layers.indexOf(l); if (i >= 0) G.layers.splice(i, 1); };
  G.topLayer = () => G.layers[G.layers.length - 1];
  G.run = async fn => {
    G.lock++;
    try { return await fn(); }
    catch (err) { console.error(err); }
    finally { G.lock--; }
  };

  // fade overlay (both screens)
  G.fadeA = 0; G.fadeCol = '#000';
  G.fadeTo = (a, frames, col) => {
    if (col) G.fadeCol = col;
    const from = G.fadeA;
    return G.tween(frames || 12, t => { G.fadeA = from + (a - from) * t; });
  };

  // ------------------------------------------------------------ main loop
  let acc = 0, last = performance.now();
  G.fps = 60;
  function update() {
    G.frame++;
    for (const b of BTN) G.holdT[b] = G.btn(b) ? G.holdT[b] + 1 : 0;
    runTimers();
    runTweens();
    const l = G.topLayer();
    if (l && l.update) l.update();
    if (G.scene && G.scene.update) G.scene.update(!!l);
    for (const k in G.pressed) G.pressed[k] = 0;
  }
  function render() {
    G.hot = [];
    const T = G.T, B = G.B;
    T.imageSmoothingEnabled = false; B.imageSmoothingEnabled = false;
    if (G.scene) { G.scene.drawTop && G.scene.drawTop(T); G.scene.drawBot && G.scene.drawBot(B); }
    for (const l of G.layers) {
      if (l.drawTop) l.drawTop(T);
      if (l.drawBot) { G.hot = []; l.drawBot(B); }
    }
    if (G.overlay) G.overlay(T, B);
    // the stick only lives on screens that draw it; anywhere else a held thumb must not keep steering
    if (G.joy.on && !G.joy.dead && !G.hot.some(r => r.kind === 'joy')) G.joyCancel();
    if (G.fadeA > 0.001) {
      T.globalAlpha = B.globalAlpha = G.fadeA;
      T.fillStyle = B.fillStyle = G.fadeCol;
      T.fillRect(0, 0, G.W, G.H); B.fillRect(0, 0, G.W, G.H);
      T.globalAlpha = B.globalAlpha = 1;
    }
  }
  function loop(now) {
    acc += Math.min(100, now - last);
    last = now;
    let n = 0;
    while (acc >= 1000 / 60 && n < 4) { for (let s = 0; s < (G.speed || 1); s++) update(); acc -= 1000 / 60; n++; }
    if (n) render();
    requestAnimationFrame(loop);
  }
  G.start = () => { last = performance.now(); requestAnimationFrame(loop); };
  G.stepFrames = n => { for (let i = 0; i < n; i++) update(); render(); };   // for tests

  // ------------------------------------------------------------ layout: two screens, stacked or side by side
  function layout() {
    const dev = document.getElementById('device');
    const app = document.getElementById('app');
    const cs = getComputedStyle(app);
    const aw = app.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const ah = app.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - (document.getElementById('hint').offsetHeight || 0);
    const gap = 10;
    const sStack = Math.min(aw / 256, (ah - gap) / 384);
    const sSide = Math.min((aw - gap) / 512, ah / 192);
    const side = sSide > sStack * 1.12;
    const s = Math.max(0.5, side ? sSide : sStack);
    const pretty = s >= 2 ? Math.floor(s * 2) / 2 : s;   // half-step scales look cleaner on big screens
    dev.classList.toggle('side', side);
    [G.cvT, G.cvB].forEach(c => { c.style.width = Math.floor(256 * pretty) + 'px'; c.style.height = Math.floor(192 * pretty) + 'px'; });
  }
  addEventListener('resize', layout);
  G.layout = layout;
})();

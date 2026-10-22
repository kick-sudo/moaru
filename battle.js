/* 모아루: 잠든 길의 노래 — battles: wild and trainer, catching, EXP, levels, moves, evolution */
'use strict';
(function () {
  const G = window.G, D = G.data;
  const Bt = G.battle = {};
  let BT = null;          // current battle state
  Bt.state = () => BT;
  const sfx = n => G.audio && G.audio.sfx(n);
  const name = m => D.nameOf(m);

  // ------------------------------------------------------------ math
  const STAGE = n => n >= 0 ? (2 + n) / 2 : 2 / (2 - n);
  const ACCST = n => n >= 0 ? (3 + n) / 3 : 3 / (3 - n);
  function statOf(mon, key, stages) {
    let v = D.stats(mon)[key] * STAGE(stages[key] || 0);
    if (key === 'spe' && mon.status === 'par') v *= 0.5;
    return Math.max(1, Math.floor(v));
  }
  function calcDamage(att, def, mv, aSt, dSt, crit) {
    const m = D.MOVES[mv];
    const special = D.SPECIAL.has(m.t);
    const A = statOf(att, special ? 'spa' : 'atk', crit ? {} : aSt);
    const Df = statOf(def, special ? 'spd' : 'def', crit ? {} : dSt);
    let dmg = Math.floor(Math.floor(Math.floor(2 * att.lv / 5 + 2) * m.p * A / Df) / 50) + 2;
    if (crit) dmg = Math.floor(dmg * 1.5);
    const stab = D.MONS[att.id].t.includes(m.t) ? 1.5 : 1;
    const eff = m.t === '???' ? 1 : D.eff(m.t, D.MONS[def.id].t);
    if (eff === 0) return { dmg: 0, eff };
    dmg = Math.max(1, Math.floor(dmg * stab * eff * G.ri(85, 100) / 100));
    return { dmg, eff };
  }
  Bt.calcDamage = calcDamage;
  Bt.expGain = (enemy, trainer, n) => Math.max(1, Math.floor(D.MONS[enemy.id].xp * enemy.lv / 4 * (trainer ? 1.5 : 1) / Math.max(1, n)));

  // ------------------------------------------------------------ sprite state helpers
  function sprite(side) { return side === 'p' ? BT.ps : BT.es; }
  function active(side) { return side === 'p' ? G.S.party[BT.pi] : BT.eParty[BT.ei]; }
  function stages(side) { return side === 'p' ? BT.pSt : BT.eSt; }
  function other(side) { return side === 'p' ? 'e' : 'p'; }
  function vol(side) { return side === 'p' ? BT.pV : BT.eV; }
  const sts = mm => mm.st ? [].concat(mm.st) : [];
  const sideName = (side, m) => (side === 'e' && BT.wild ? '야생 ' : side === 'e' ? '상대 ' : '') + name(m);
  // status moves that cannot land: poison on poison types, and type immunity (electric status vs ground ...)
  const statusBlocked = (mm, def) => (mm.status === 'psn' && (D.MONS[def.id].t.includes('독') || D.MONS[def.id].t.includes('강철'))) || (mm.t !== '노말' && D.eff(mm.t, D.MONS[def.id].t) === 0);
  const newStages = () => ({ atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0 });

  // ------------------------------------------------------------ background
  function makeBg(night) {
    const [c, x] = G.art.cv(256, 192);
    const sky = x.createLinearGradient(0, 0, 0, 110);
    if (night) { sky.addColorStop(0, '#1c2048'); sky.addColorStop(1, '#5a4a8a'); }
    else { sky.addColorStop(0, '#8fd0f4'); sky.addColorStop(1, '#e6f6fa'); }
    x.fillStyle = sky; x.fillRect(0, 0, 256, 110);
    if (night) { const r = G.srng(7); x.fillStyle = '#f6f2d0'; for (let i = 0; i < 26; i++) x.fillRect(Math.floor(r() * 256), Math.floor(r() * 70), 1, 1); }
    else {
      // soft flat-bottomed clouds
      const cloud = (cx, cy, s) => {
        [[-12, 2, 7], [-4, -3, 9], [6, -1, 8], [14, 3, 6]].forEach(([dx, dy, r]) => G.disc(x, cx + dx * s, cy + dy * s, Math.round(r * s), '#ffffff'));
        x.fillStyle = '#ffffff'; x.fillRect(Math.round(cx - 18 * s), Math.round(cy + 2 * s), Math.round(38 * s), Math.round(5 * s));
        x.fillStyle = '#d8eef8'; x.fillRect(Math.round(cx - 16 * s), Math.round(cy + 6 * s), Math.round(34 * s), 2);
      };
      cloud(44, 20, 1); cloud(220, 14, 0.7); cloud(126, 30, 0.55);
    }
    // far hills
    x.fillStyle = night ? '#2a3a5a' : '#8ac07a';
    for (let X = 0; X < 256; X++) { const h = 14 + Math.sin(X / 23) * 6 + Math.sin(X / 9) * 2; x.fillRect(X, 92 - h, 1, h + 20); }
    x.fillStyle = night ? '#243050' : '#6aa866';
    for (let X = 0; X < 256; X++) { const h = 8 + Math.sin(X / 15 + 2) * 4; x.fillRect(X, 100 - h, 1, h + 20); }
    // ground
    const gr = x.createLinearGradient(0, 98, 0, 192);
    if (night) { gr.addColorStop(0, '#3a5a4a'); gr.addColorStop(1, '#2a3e38'); }
    else { gr.addColorStop(0, '#a8dc84'); gr.addColorStop(1, '#78c060'); }
    x.fillStyle = gr; x.fillRect(0, 98, 256, 94);
    x.fillStyle = night ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.18)';
    for (let i = 0; i < 6; i++) x.fillRect(0, 104 + i * 14, 256, 1);
    // platforms
    const plat = (cx, cy, rx, ry) => {
      x.fillStyle = night ? '#24382e' : '#5a9a48';
      x.beginPath(); x.ellipse(cx, cy + 3, rx, ry, 0, 0, 7); x.fill();
      x.fillStyle = night ? '#3e6050' : '#8ccf6a';
      x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 7); x.fill();
      x.fillStyle = night ? '#4e7462' : '#a6e086';
      x.beginPath(); x.ellipse(cx - 4, cy - 2, rx * 0.8, ry * 0.6, 0, 0, 7); x.fill();
    };
    plat(186, 90, 52, 12);
    plat(70, 166, 64, 16);
    return c;
  }

  // ------------------------------------------------------------ drawing
  function drawBoxE(T) {
    const m = active('e');
    if (!m || !BT.es.boxOn) return;
    const st = D.stats(m);
    const x = BT.es.boxX, y = 10;
    G.box(T, x, y, 124, 32, ['#2c2f45', '#f6f0dc', '#ffffff'], 6);
    G.text(T, name(m), x + 8, y + 4, '#2c2f45', null);
    G.textR(T, 'Lv' + m.lv, x + 118, y + 4, '#2c2f45', null);
    if (G.S.dex.caught[m.id] && BT.wild) { G.rrect(T, x + 2, y + 6, 4, 4, 1, '#e04848'); }
    G.text(T, 'HP', x + 8, y + 19, '#e3a020', null);
    G.menus.hpBar(T, x + 26, y + 22, 92, BT.es.hp / st.hp);
    if (m.status) statusTag(T, m.status, x + 82, y - 6);
  }
  function drawBoxP(T) {
    const m = active('p');
    if (!m || !BT.ps.boxOn) return;
    const st = D.stats(m);
    const x = BT.ps.boxX, y = 94;
    G.box(T, x, y, 124, 44, ['#2c2f45', '#f6f0dc', '#ffffff'], 6);
    G.text(T, name(m), x + 8, y + 4, '#2c2f45', null);
    G.textR(T, 'Lv' + m.lv, x + 118, y + 4, '#2c2f45', null);
    G.text(T, 'HP', x + 8, y + 18, '#e3a020', null);
    G.menus.hpBar(T, x + 26, y + 21, 92, BT.ps.hp / st.hp);
    G.textR(T, `${Math.max(0, Math.round(BT.ps.hp))}/${st.hp}`, x + 118, y + 27, '#36363f', null);
    // exp bar
    const lo = D.expFor(m.lv), hi = D.expFor(m.lv + 1);
    const r = G.clamp((BT.ps.exp - lo) / (hi - lo), 0, 1);
    T.fillStyle = '#3a3d52'; T.fillRect(x + 8, y + 40, 110, 3);
    T.fillStyle = '#4ab8f0'; T.fillRect(x + 8, y + 40, Math.round(110 * r), 3);
    if (m.status) statusTag(T, m.status, x + 4, y - 6);
  }
  function statusTag(T, s, x, y) {
    const lb = D.STATUS[s].short, w = Math.ceil(G.tw(lb)) + 8;
    const col = { psn: '#a050c8', par: '#d8a020', slp: '#7a8aa0' }[s];
    G.rrect(T, x, y, w, 14, 3, '#2c2f45'); G.rrect(T, x + 1, y + 1, w - 2, 12, 2, col);
    G.text(T, lb, x + 4, y + 1, '#fff', null);
  }
  function drawMon(T, side) {
    const s = sprite(side), m = active(side);
    if (!m || !s.on || s.alpha <= 0) return;
    const img = side === 'p' ? G.mons.back(m.id) : G.mons.front(m.id);
    const scale = s.scale;
    const w = img.width * scale, h = img.height * scale;
    const baseY = side === 'p' ? 172 : 96;
    const cx = (side === 'p' ? 70 : 186) + s.dx;
    const x = Math.round(cx - w / 2), y = Math.round(baseY - h + s.dy);
    if (s.blink && Math.floor(G.frame / 3) % 2) return;
    T.globalAlpha = s.alpha;
    if (s.clip !== undefined) { T.save(); T.beginPath(); T.rect(0, 0, 256, baseY + 2); T.clip(); }
    T.drawImage(img, x, y + (s.clip || 0), w, h);
    if (s.flash > 0) { T.globalAlpha = s.alpha * s.flash; T.drawImage(G.mons.silhouette(m.id, side === 'p' ? 'back' : 'front'), x, y + (s.clip || 0), w, h); }
    if (s.clip !== undefined) T.restore();
    T.globalAlpha = 1;
  }
  function drawTop(T) {
    if (!BT) return;
    T.drawImage(BT.bg, BT.shake ? G.ri(-2, 2) : 0, 0);
    // trainer silhouette during intro
    if (BT.trainerImg && BT.trainerOn > 0) {
      const fr = BT.trainerImg;
      T.globalAlpha = Math.min(1, BT.trainerOn);
      T.drawImage(fr, 0, 0, 16, fr.height, 168 + BT.trainerDX, 96 - fr.height * 3, 48, fr.height * 3);
      T.globalAlpha = 1;
    }
    drawMon(T, 'e');
    drawMon(T, 'p');
    for (const f of BT.fx) f.draw(T, f.t / f.n);
    drawBoxE(T);
    drawBoxP(T);
    if (BT.flashA > 0) { T.globalAlpha = BT.flashA; T.fillStyle = BT.flashCol || '#fff'; T.fillRect(0, 0, 256, 192); T.globalAlpha = 1; }
  }

  // bottom screen per UI mode
  function drawBot(B) {
    if (!BT) return;
    const m = active('p');
    if (BT.ui === 'command') {
      G.menus.header(B, '무엇을 할까?', m ? name(m) : '');
      const sel = BT.cmdSel;
      G.button(B, 16, 28, 224, 70, '싸운다', { sel: sel === 0, color: '#f08a7a', dark: '#b84a3a', ink: '#ffffff', shadow: 'rgba(0,0,0,0.3)', onTap: () => cmd(0) });
      G.button(B, 8, 110, 80, 46, '가방', { sel: sel === 1, color: '#f6d878', dark: '#c49a2a', onTap: () => cmd(1) });
      G.button(B, 168, 110, 80, 46, '몬스터', { sel: sel === 2, color: '#a8dc8a', dark: '#4a9a3a', onTap: () => cmd(2) });
      G.button(B, 96, 122, 64, 34, BT.wild ? '도망' : '-', { sel: sel === 3, color: '#a8c8f0', dark: '#4a78b8', disabled: !BT.wild, onTap: () => cmd(3) });
      G.textC(B, BT.wild ? '' : '트레이너 승부 중', 128, 166, '#8a8270', null);
    } else if (BT.ui === 'moves') {
      G.menus.header(B, '기술을 고르세요', m ? name(m) : '');
      m.moves.forEach((mv, i) => {
        const mm = D.MOVES[mv.id];
        const x = 8 + (i % 2) * 122, y = 28 + Math.floor(i / 2) * 64;
        G.button(B, x, y, 118, 58, null, { sel: BT.moveSel === i, color: G.mons.lt(D.TYPE_COL[mm.t], 0.55), dark: D.TYPE_COL[mm.t], disabled: mv.pp <= 0, onTap: () => pickMove(i) });
        G.textC(B, mm.n, x + 59, y + 9, mv.pp <= 0 ? '#8d8a82' : '#2e2c36', 'rgba(255,255,255,0.6)');
        G.text(B, mm.t, x + 10, y + 32, D.TYPE_DARK[mm.t], null);
        G.textR(B, `PP ${mv.pp}/${mm.pp}`, x + 108, y + 32, '#4a4658', null);
        const eff = BT && active('e') && mm.p ? D.eff(mm.t, D.MONS[active('e').id].t) : 1;
        if (mm.p && G.S.dex.seen[active('e').id] && eff !== 1) G.textC(B, eff > 1 ? '효과 굉장함' : eff === 0 ? '효과 없음' : '효과 별로', x + 59, y + 46, eff > 1 ? '#c83a2a' : '#6a6a7a', null);
      });
      G.button(B, 80, 160, 96, 26, '취소', { onTap: () => pickMove(-1) });
    } else {
      // idle panel: show both monsters' names
      G.menus.header(B, BT.wild ? '야생 몬스터와 승부' : (BT.tr ? BT.tr.title + ' ' + BT.tr.name : '승부'), '');
      const e = active('e');
      if (e) {
        G.box(B, 16, 40, 224, 110, G.STYLE.white, 8);
        const img = G.mons.icon(e.id);
        B.drawImage(img, 30, 60, 64, 64);
        G.text(B, name(e), 110, 62, '#2c2f45', null);
        let bx = 110;
        D.MONS[e.id].t.forEach(t => { bx += G.menus.typeBadge(B, t, bx, 82) + 3; });
        G.text(B, G.S.dex.caught[e.id] ? '도감 등록됨' : '', 110, 104, '#8a8270', null);
      }
    }
  }
  function update(paused) {
    if (!BT) return;
    // HP / EXP display easing
    const pm = active('p'), em = active('e');
    if (pm) { BT.ps.hp += Math.sign(pm.hp - BT.ps.hp) * Math.min(Math.abs(pm.hp - BT.ps.hp), Math.max(0.5, D.stats(pm).hp / 40)); }
    if (em) { BT.es.hp += Math.sign(em.hp - BT.es.hp) * Math.min(Math.abs(em.hp - BT.es.hp), Math.max(0.5, D.stats(em).hp / 40)); }
    for (let i = BT.fx.length - 1; i >= 0; i--) { const f = BT.fx[i]; f.t++; if (f.t >= f.n) { BT.fx.splice(i, 1); f.res(); } }
    if (paused) return;
    if (BT.ui === 'command') {
      // 0 fight (top) / 1 bag (left) / 3 run (middle) / 2 party (right)
      const s = BT.cmdSel, w = BT.wild;
      if (G.rep('up')) BT.cmdSel = 0;
      else if (G.rep('down') && s === 0) BT.cmdSel = w ? 3 : 1;
      else if (G.rep('left')) BT.cmdSel = s === 2 ? (w ? 3 : 1) : s === 3 ? 1 : s;
      else if (G.rep('right')) BT.cmdSel = s === 1 ? (w ? 3 : 2) : s === 3 ? 2 : s;
      if (s !== BT.cmdSel) sfx('move');
      if (G.hit('a')) cmd(BT.cmdSel);
    } else if (BT.ui === 'moves') {
      const s = BT.moveSel, n = active('p').moves.length;
      if (G.rep('left') || G.rep('right')) BT.moveSel = Math.min(n - 1, s ^ 1);
      if (G.rep('up') || G.rep('down')) BT.moveSel = Math.min(n - 1, (s + 2) % 4);
      if (s !== BT.moveSel) sfx('move');
      if (G.hit('a')) pickMove(BT.moveSel);
      if (G.hit('b')) pickMove(-1);
    }
  }
  const scene = { update, drawTop, drawBot };

  // ------------------------------------------------------------ ui awaiting
  function cmd(i) {
    if (!BT || BT.ui !== 'command') return;
    if (i === 3 && !BT.wild) return;
    BT.cmdSel = i; sfx('select');
    const r = BT.uiRes; BT.ui = null; BT.uiRes = null; r && r(i);
  }
  function pickMove(i) {
    if (!BT || BT.ui !== 'moves') return;
    const m = active('p');
    if (i >= 0 && m.moves[i].pp <= 0) { sfx('cancel'); return; }
    sfx(i < 0 ? 'cancel' : 'select');
    if (i >= 0) BT.moveSel = i;
    const r = BT.uiRes; BT.ui = null; BT.uiRes = null; r && r(i);
  }
  const askUI = mode => new Promise(res => { BT.ui = mode; BT.uiRes = res; });

  // ------------------------------------------------------------ fx
  const fx = (n, draw) => new Promise(res => BT.fx.push({ t: 0, n, draw, res }));
  Bt.fx = fx;
  const msg = (t, auto) => G.say(t, { auto: auto === undefined ? 55 : auto });
  function monPos(side) {
    const s = sprite(side);
    return side === 'p' ? { x: 70 + s.dx, y: 128 } : { x: 186 + s.dx, y: 62 };
  }
  async function lunge(side) {
    const s = sprite(side), dir = side === 'p' ? 1 : -1;
    await G.tween(6, t => { s.dx = dir * 10 * t; s.dy = -dir * 4 * t; });
    await G.tween(6, t => { s.dx = dir * 10 * (1 - t); s.dy = -dir * 4 * (1 - t); });
  }
  async function hitFlash(side) {
    const s = sprite(side);
    s.blink = true; await G.wait(24); s.blink = false;
  }
  // move animations by type
  async function moveFx(mv, side) {
    const m = D.MOVES[mv], tgt = other(side);
    const a = monPos(side), b = monPos(tgt);
    const T = m.t;
    if (!m.p) {
      const s0 = sts(m)[0];
      if (m.splash) {
        sfx('jump');
        await fx(26, (C, t) => { for (let i = 0; i < 5; i++) { const k = (t * 1.3 + i * 0.2) % 1; C.fillStyle = '#9ad8f8'; C.fillRect(a.x - 16 + i * 8, a.y + 20 - Math.sin(k * Math.PI) * 16, 3, 3); } });
        return;
      }
      if (m.escape) {
        sfx('sparkle');
        await fx(26, (C, t) => { for (let i = 0; i < 10; i++) { const ang = i * 0.63 + t * 5; C.fillStyle = i % 2 ? '#f6c8e8' : '#c8b8f0'; C.fillRect(a.x + Math.cos(ang) * (8 + t * 30), a.y + Math.sin(ang) * (6 + t * 20), 3, 3); } });
        return;
      }
      if (m.heal || m.ring) {
        sfx('heal');
        const col = m.ring ? '#7ec4f8' : '#a8f0a0';
        await fx(32, (C, t) => { for (let i = 0; i < 8; i++) { const k = (t * 1.2 + i / 8) % 1; C.fillStyle = col; C.fillRect(a.x - 22 + i * 6, a.y + 24 - k * 44, 3, 3); } if (m.ring) { C.strokeStyle = 'rgba(126,196,248,' + (1 - t) + ')'; C.lineWidth = 2; C.beginPath(); C.ellipse(a.x, a.y + 10, 26, 8, 0, 0, 7); C.stroke(); } });
        return;
      }
      if (m.refresh) {
        sfx('heal');
        await fx(26, (C, t) => { for (let i = 0; i < 8; i++) { const k = (t * 1.3 + i / 8) % 1; C.fillStyle = '#e8f6ff'; C.fillRect(a.x - 20 + i * 5, a.y + 20 - k * 40, 2, 2); } });
        return;
      }
      if (m.yawn) {
        sfx('status');
        await fx(40, (C, t) => { for (let i = 0; i < 4; i++) { const k = G.clamp(t * 1.4 - i * 0.18, 0, 1); const x = a.x + (b.x - a.x) * k, y = a.y + (b.y - a.y) * k - 14 - Math.sin(k * Math.PI * 2 + i) * 6; C.fillStyle = '#f8d8a8'; C.fillRect(x - 2, y - 2, 4, 4); C.fillRect(x + 2, y - 8, 1, 7); } });
        return;
      }
      if (s0 && s0.who === 'self') {
        sfx('buff');
        await fx(30, (C, t) => { for (let i = 0; i < 6; i++) { const x = a.x - 20 + i * 8, y = a.y + 24 - t * 50 - (i % 2) * 8; C.fillStyle = '#ffe28a'; C.fillRect(x, y, 3, 6); C.fillRect(x - 1, y + 1, 5, 1); } });
      } else if (s0) {
        sfx('debuff');
        await fx(30, (C, t) => { for (let i = 0; i < 6; i++) { const x = b.x - 22 + i * 9, y = b.y - 26 + t * 44 + (i % 2) * 8; C.fillStyle = '#6a9af0'; C.fillRect(x, y, 3, 6); C.fillRect(x - 1, y + 4, 5, 1); } });
      } else {
        sfx('status');
        const col = { slp: '#c8b8f0', psn: '#b070e0', par: '#f6d84a' }[m.status] || '#ffffff';
        await fx(36, (C, t) => { for (let i = 0; i < 10; i++) { const ang = i * 0.63 + t * 4; C.fillStyle = col; C.fillRect(b.x + Math.cos(ang) * (26 - t * 10), b.y + Math.sin(ang) * 14 - 4 + i % 3, 3, 3); } });
      }
      return;
    }
    await lunge(side);
    const R = G.srng(mv.length * 31 + 7);
    if (T === '불') {
      sfx('fire');
      await fx(30, (C, t) => { for (let i = 0; i < 9; i++) { const k = (t * 1.6 + i / 9) % 1; const x = b.x - 22 + (i * 47 % 44), y = b.y + 22 - k * 40; const s = 7 - k * 5; C.fillStyle = k < 0.4 ? '#ffd75a' : k < 0.7 ? '#f8822c' : '#d8401c'; C.fillRect(x - s / 2, y - s / 2, s, s); } });
    } else if (T === '물') {
      sfx('water');
      await fx(26, (C, t) => { for (let i = 0; i < 6; i++) { const k = G.clamp(t * 1.4 - i * 0.07, 0, 1); const x = a.x + (b.x - a.x) * k, y = a.y + (b.y - a.y) * k - Math.sin(k * Math.PI) * 24; C.fillStyle = '#7ec4f8'; C.fillRect(x - 3, y - 3, 6, 6); C.fillStyle = '#ffffff'; C.fillRect(x - 2, y - 2, 2, 2); } });
    } else if (T === '풀') {
      sfx('leaf');
      await fx(28, (C, t) => { for (let i = 0; i < 7; i++) { const k = G.clamp(t * 1.5 - i * 0.08, 0, 1); const x = a.x + (b.x - a.x) * k + Math.sin(k * 9 + i) * 8, y = a.y + (b.y - a.y) * k - Math.sin(k * Math.PI) * 18; C.fillStyle = i % 2 ? '#5cb85c' : '#8ee06a'; C.fillRect(x - 3, y - 1, 6, 3); C.fillRect(x - 1, y - 2, 2, 5); } });
    } else if (T === '전기') {
      sfx('zap');
      await fx(24, (C, t) => { if (Math.floor(t * 12) % 2) return; C.strokeStyle = '#ffe85a'; C.lineWidth = 3; C.beginPath(); let x = b.x, y = 0; C.moveTo(x, y); for (let i = 0; i < 6; i++) { x = b.x + (i % 2 ? 10 : -10); y += (b.y + 10) / 6; C.lineTo(x, y); } C.stroke(); C.strokeStyle = '#ffffff'; C.lineWidth = 1; C.stroke(); });
      BT.flashA = 0.5; BT.flashCol = '#fff8b0'; await G.wait(3); BT.flashA = 0;
    } else if (T === '땅') {
      sfx('rock');
      await fx(26, (C, t) => { for (let i = 0; i < 6; i++) { const k = G.clamp(t * 1.3 - i * 0.05, 0, 1); const x = b.x - 25 + i * 10, y = b.y + 30 - Math.sin(k * Math.PI) * 34; C.fillStyle = '#a8784a'; C.fillRect(x - 4, y - 3, 8, 6); C.fillStyle = '#d8a870'; C.fillRect(x - 3, y - 3, 3, 2); } });
      BT.shake = true; await G.wait(10); BT.shake = false;
    } else if (T === '비행') {
      sfx('wind');
      await fx(24, (C, t) => { C.strokeStyle = 'rgba(255,255,255,0.9)'; C.lineWidth = 2; for (let i = 0; i < 3; i++) { const k = G.clamp(t * 1.5 - i * 0.15, 0, 1); C.beginPath(); C.arc(b.x - 30 + k * 60, b.y - 10 + i * 10, 14, 0.4, 2.2); C.stroke(); } });
    } else if (T === '에스퍼') {
      sfx('psy');
      await fx(30, (C, t) => { for (let i = 0; i < 4; i++) { const k = G.clamp(t * 1.4 - i * 0.18, 0, 1); if (k <= 0 || k >= 1) continue; C.strokeStyle = i % 2 ? 'rgba(236,108,154,' + (1 - k) + ')' : 'rgba(200,170,250,' + (1 - k) + ')'; C.lineWidth = 2; C.beginPath(); C.ellipse(b.x, b.y, 6 + k * 30, 4 + k * 18, 0, 0, 7); C.stroke(); } });
    } else if (T === '드래곤') {
      sfx('dragon');
      await fx(30, (C, t) => { for (let i = 0; i < 12; i++) { const ang = i * 0.52 + t * 8; const r = 28 * (1 - t) + 4; C.fillStyle = i % 3 ? '#8a7af0' : '#d8c8ff'; C.fillRect(b.x + Math.cos(ang) * r - 2, b.y + Math.sin(ang) * r * 0.7 - 2, 4, 4); } });
      BT.shake = true; await G.wait(6); BT.shake = false;
    } else if (T === '강철') {
      sfx('hit');
      await fx(22, (C, t) => { for (let i = 0; i < 6; i++) { const ang = i * 1.05 + t * 3; const r = 6 + t * 26; C.fillStyle = i % 2 ? '#e8eef4' : '#a8b4c0'; C.fillRect(b.x + Math.cos(ang) * r - 3, b.y + Math.sin(ang) * r - 1, 6, 2); } C.fillStyle = 'rgba(255,255,255,' + (1 - t) + ')'; C.fillRect(b.x - 6, b.y - 6, 12, 12); });
      BT.shake = true; await G.wait(5); BT.shake = false;
    } else if (T === '고스트') {
      sfx('psy');
      await fx(32, (C, t) => { for (let i = 0; i < 7; i++) { const k = G.clamp(t * 1.4 - i * 0.07, 0, 1); const x = a.x + (b.x - a.x) * k + Math.sin(k * 8 + i) * 10, y = a.y + (b.y - a.y) * k - Math.sin(k * Math.PI) * 14; C.fillStyle = 'rgba(122,104,168,' + (0.9 - k * 0.4) + ')'; C.fillRect(x - 4, y - 3, 8, 6); C.fillStyle = 'rgba(200,184,240,0.8)'; C.fillRect(x - 2, y - 2, 3, 2); } });
    } else if (T === '벌레') {
      sfx('bug');
      await fx(24, (C, t) => { for (let i = 0; i < 8; i++) { const ang = i * 0.8; const r = 30 * (1 - t); C.fillStyle = i % 2 ? '#c8e04a' : '#8ab820'; C.fillRect(b.x + Math.cos(ang) * r - 2, b.y + Math.sin(ang) * r * 0.6 - 2, 4, 4); } });
    } else {
      sfx('hit');
      await fx(16, (C, t) => { const r = 6 + t * 14; C.fillStyle = 'rgba(255,255,255,' + (1 - t) + ')'; for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4; C.fillRect(b.x + Math.cos(ang) * r - 2, b.y + Math.sin(ang) * r - 2, 4, 4); } C.fillStyle = '#ffe28a'; C.fillRect(b.x - 4, b.y - 4, 8, 8); });
    }
  }

  // ------------------------------------------------------------ battle setup / transitions
  async function transitionIn() {
    G.audio && G.audio.music('battle');
    for (let i = 0; i < 2; i++) { await G.fadeTo(0.85, 3, '#ffffff'); await G.fadeTo(0, 3); }
    // closing bars
    const bars = 8;
    let k = 0;
    G.overlay = (T, B) => {
      T.fillStyle = '#101018';
      for (let i = 0; i < bars; i++) {
        const w = Math.round(256 * k);
        if (i % 2) T.fillRect(256 - w, i * 24, w, 24); else T.fillRect(0, i * 24, w, 24);
      }
    };
    await G.tween(24, t => { k = t; });
    G.overlay = null;
    await G.fadeTo(1, 1, '#101018');
  }
  function begin(o) {
    const night = G.isNight();
    BT = {
      wild: !!o.wild, tr: o.trainer || null,
      eParty: o.eParty, ei: 0, pi: G.S.party.findIndex(m => m.hp > 0),
      pSt: newStages(), eSt: newStages(),
      ps: { on: false, alpha: 1, dx: 0, dy: 0, scale: 1, flash: 0, hp: 0, exp: 0, boxOn: false, boxX: 130 },
      es: { on: false, alpha: 1, dx: 0, dy: 0, scale: 1, flash: 0, hp: 0, boxOn: false, boxX: 4 },
      fx: [], ui: null, cmdSel: 0, moveSel: 0, bg: makeBg(night), part: new Set(), runTries: 0,
      leveled: new Set(), result: null, flashA: 0,
      pV: {}, eV: {}, yawns: {}, fled: null
    };
    BT.part.add(BT.pi);
    BT.prevScene = G.scene;
    G.scene = scene;
    return BT;
  }
  async function end() {
    await G.fadeTo(1, 14, '#000');
    BT.fx.forEach(f => f.res());
    G.scene = BT.prevScene;
    const res = BT.result;
    BT = null;
    G.S.graceSteps = 3;
    G.audio && G.audio.music(G.world.map.def.bgm || (G.world.map.kind === 'out' ? 'route' : 'town'));
    await G.fadeTo(0, 14);
    return res;
  }

  async function sendOutPlayer(first) {
    const m = active('p');
    BT.ps.hp = m.hp; BT.ps.exp = m.exp;
    if (!first) BT.pSt = newStages();
    BT.pV = {};
    BT.part.add(BT.pi);
    await msg(`가라! ${name(m)}!`, 30);
    sfx('throw');
    // gourd arc
    await fx(20, (C, t) => { const x = 20 + t * 50, y = 150 - Math.sin(t * Math.PI) * 60; C.drawImage(G.art.cube, x - 8, y - 8); });
    sfx('pop');
    BT.ps.on = true; BT.ps.flash = 1; BT.ps.scale = 0.2;
    await G.tween(12, t => { BT.ps.scale = 0.2 + 0.8 * t; BT.ps.flash = 1 - t; });
    G.audio && G.audio.cry(m.id);
    BT.ps.boxOn = true;
    await G.tween(10, t => { BT.ps.boxX = 256 - 126 * t; });
  }
  async function sendOutEnemy(first) {
    const m = active('e');
    BT.es.hp = m.hp;
    BT.eSt = newStages();
    BT.eV = {};
    D.seen(m.id);
    if (!BT.wild) {
      await msg(`${BT.tr.title} ${G.iga(BT.tr.name)} ${G.eul(name(m))} 내보냈다!`, 40);
      sfx('pop');
      BT.es.on = true; BT.es.flash = 1; BT.es.scale = 0.2;
      await G.tween(12, t => { BT.es.scale = 0.2 + 0.8 * t; BT.es.flash = 1 - t; });
    }
    G.audio && G.audio.cry(m.id);
    BT.es.boxOn = true;
  }

  // ------------------------------------------------------------ turn engine
  function aiMove(side) {
    const m = active(side), foe = active(other(side));
    const usable = m.moves.map((mv, i) => [mv, i]).filter(([mv]) => mv.pp > 0);
    if (!usable.length) return -1;
    if (BT.wild) return G.pick(usable)[1];
    const tg = side === 'e' && BT.tr && BT.tr.telegraph && BT.tr.telegraph[m.id];
    let pool = usable;
    if (tg) {
      BT.tgNext = BT.tgNext || {};
      const queued = BT.tgNext[m.uid];
      if (queued !== undefined) { delete BT.tgNext[m.uid]; if (m.moves[queued] && m.moves[queued].pp > 0) return queued; }
      else if (G.chance(tg.chance || 0.5)) {
        const k = usable.find(([mv]) => tg.moves.includes(mv.id));
        if (k) { BT.tgNext[m.uid] = k[1]; return { warn: tg.msg }; }
      }
      // a telegraphed move only ever comes after its warning (the design rule: the hum, then the bolt), so the player can answer it
      const rest = usable.filter(([mv]) => !tg.moves.includes(mv.id));
      if (rest.length) pool = rest;
    }
    const lead = side === 'e' && BT.tr && BT.tr.lead && BT.tr.lead[m.id];
    if (lead && !(BT.leadUsed = BT.leadUsed || {})[m.uid]) {
      BT.leadUsed[m.uid] = 1;
      const k = usable.find(([mv]) => mv.id === lead), lm = D.MOVES[lead], fv = vol(other(side));
      if (k && !(lm.yawn && (foe.status || fv.drowsy)) && !(lm.status && (foe.status || statusBlocked(lm, foe)))) return k[1];
    }
    const smart = BT.tr && BT.tr.smart;
    let best = null, bestS = -1;
    for (const [mv, i] of pool) {
      const mm = D.MOVES[mv.id];
      const fv = vol(other(side)), myv = vol(side);
      let s;
      if (mm.splash) s = 1;
      else if (mm.escape) s = BT.wild ? 40 : 0;
      else if (mm.p) {
        const eff = D.eff(mm.t, D.MONS[foe.id].t);
        const stab = D.MONS[m.id].t.includes(mm.t) ? 1.5 : 1;
        s = mm.dream && foe.status !== 'slp' ? 0 : mm.p * (mm.hits || 1) * eff * stab * (mm.a ? mm.a / 100 : 1);
      } else if (mm.heal) { const r = m.hp / D.stats(m).hp; s = r < 0.35 ? 140 : r < 0.6 ? 55 : 0; }
      else if (mm.yawn) s = foe.status || fv.drowsy || (BT.yawns[m.uid] || 0) >= 2 ? 0 : 75;
      else if (mm.ring) s = myv.ring ? 0 : 50;
      else if (mm.refresh) s = m.status || myv.drowsy ? 90 : 0;
      else if (mm.status) s = foe.status || statusBlocked(mm, foe) ? 0 : 45;
      else { const s0 = sts(mm)[0]; s = s0.who === 'self' ? (stages(side)[s0.s] < 2 ? 30 : 0) : (stages(other(side))[s0.s] > -2 ? 28 : 0); }
      s *= smart ? 1 : (0.6 + G.rand() * 0.8);
      if (s > bestS) { bestS = s; best = i; }
    }
    return best;
  }
  async function useMove(side, mi) {
    const att = active(side), defSide = other(side), def = active(defSide);
    let mvId, slot = null;
    if (mi < 0) mvId = 'struggle';
    else { slot = att.moves[mi]; mvId = slot.id; }
    const mm = D.MOVES[mvId];
    const an = (side === 'e' && BT.wild ? '야생 ' : side === 'e' ? '상대 ' : '') + name(att);
    const dn = (defSide === 'e' && BT.wild ? '야생 ' : defSide === 'e' ? '상대 ' : '') + name(def);
    // status that prevents acting
    if (att.status === 'slp') {
      att.slp = (att.slp || 1) - 1;
      if (att.slp > 0) { await msg(`${G.eun(an)} 쿨쿨 잠들어 있다.`, 45); return; }
      att.status = null; await msg(`${G.eun(an)} 잠에서 깨어났다!`, 45);
    }
    if (att.status === 'par' && G.chance(0.25)) { await msg(`${G.eun(an)} 몸이 저려서 움직일 수 없다!`, 45); return; }
    if (slot) slot.pp--;
    await msg(`${an}의 ${mm.n}!`, 28);
    // accuracy
    if (mm.a) {
      const acc = mm.a * ACCST(stages(side).acc);
      if (G.rand() * 100 >= acc) { await msg(`그러나 ${an}의 공격은 빗나갔다!`, 45); return; }
    }
    if (mm.splash) { await moveFx(mvId, side); await msg('그러나 아무 일도 일어나지 않았다!', 45); return; }
    if (mm.escape) {
      if (!BT.wild) { await msg('그러나 효과가 없었다!', 45); return; }
      await moveFx(mvId, side);
      BT.fled = side; sfx('run');
      if (side === 'e') { BT.es.on = false; BT.es.boxOn = false; }
      await msg(side === 'e' ? `${G.eun(an)} 꿈길을 따라 사라져 버렸다!` : `${G.eun(an)} 꿈길을 따라 무사히 빠져나왔다!`, 50);
      return;
    }
    if (!mm.p) {
      if (mm.heal) {
        const mx = D.stats(att).hp;
        if (att.hp >= mx) { await msg('그러나 체력이 이미 가득하다!', 45); return; }
        await moveFx(mvId, side);
        att.hp = Math.min(mx, att.hp + Math.max(1, Math.floor(mx * mm.heal)));
        while (Math.abs(sprite(side).hp - att.hp) > 0.6) await G.wait(1);
        await msg(`${G.eun(an)} 체력을 회복했다!`, 45);
        return;
      }
      if (mm.ring) {
        const v = vol(side);
        if (v.ring) { await msg('그러나 효과가 없었다!', 45); return; }
        await moveFx(mvId, side); v.ring = true;
        await msg(`${G.eun(an)} 물의 고리를 둘렀다!`, 45);
        return;
      }
      if (mm.refresh) {
        const v = vol(side);
        if (!att.status && !v.drowsy) { await msg('그러나 효과가 없었다!', 45); return; }
        await moveFx(mvId, side);
        att.status = null; v.drowsy = 0;
        await msg(`${G.eun(an)} 숨을 고르고 몸 상태를 되찾았다!`, 45);
        return;
      }
      if (mm.yawn) {
        const v = vol(defSide);
        if (def.status || v.drowsy) { await msg('그러나 효과가 없었다!', 45); return; }
        await moveFx(mvId, side);
        v.drowsy = 2; BT.yawns[att.uid] = (BT.yawns[att.uid] || 0) + 1;
        await msg(`${G.eun(dn)} 스르르 졸음이 오기 시작했다!\n(다음 차례가 끝나면 잠든다)`, 55);
        return;
      }
      // status / stat moves
      if (mm.status) {
        if (def.status || statusBlocked(mm, def)) { await moveFx(mvId, side); await msg('그러나 효과가 없었다!', 45); return; }
        await moveFx(mvId, side);
        def.status = mm.status; if (mm.status === 'slp') def.slp = G.ri(2, 4);
        sfx('status');
        await msg(`${G.eun(dn)} ${D.STATUS[mm.status].verb}`, 50);
        return;
      }
      await moveFx(mvId, side);
      for (const s0 of sts(mm)) {
        const tSide = s0.who === 'self' ? side : defSide, tN = s0.who === 'self' ? an : dn;
        const st = stages(tSide);
        if ((s0.d < 0 && st[s0.s] <= -6) || (s0.d > 0 && st[s0.s] >= 6)) { await msg(`${tN}의 ${D.STAT_NAME[s0.s]}은(는) 더 이상 변하지 않는다!`, 45); continue; }
        st[s0.s] = G.clamp(st[s0.s] + s0.d, -6, 6);
        await msg(`${tN}의 ${G.iga(D.STAT_NAME[s0.s])} ${Math.abs(s0.d) >= 2 ? '크게 ' : ''}${s0.d > 0 ? '올라갔다!' : '떨어졌다!'}`, 45);
      }
      return;
    }
    if (mm.dream && def.status !== 'slp') { await msg(`그러나 ${G.eun(dn)} 잠들어 있지 않다!`, 45); return; }
    // damaging move (some strike more than once)
    const nHits = mm.hits ? (Array.isArray(mm.hits) ? G.ri(mm.hits[0], mm.hits[1]) : mm.hits) : 1;
    let dmg = 0, eff = 1, landed = 0;
    for (let h = 0; h < nHits && def.hp > 0; h++) {
      await moveFx(mvId, side);
      const crit = G.chance(1 / 16);
      const r = calcDamage(att, def, mvId, stages(side), stages(defSide), crit);
      eff = r.eff;
      if (eff === 0) { await msg(`${dn}에게는 효과가 없는 것 같다...`, 50); return; }
      sfx(eff > 1 ? 'hit2' : eff < 1 ? 'hit0' : 'hit');
      hitFlash(defSide);
      def.hp = Math.max(0, def.hp - r.dmg); dmg += r.dmg; landed++;
      await G.wait(nHits > 1 ? 14 : 26);
      while (Math.abs(sprite(defSide).hp - def.hp) > 0.6) await G.wait(1);
      if (crit) await msg('급소에 맞았다!', 40);
    }
    if (eff > 1) await msg('효과가 굉장했다!', 40);
    else if (eff < 1) await msg('효과가 별로인 듯하다...', 40);
    if (nHits > 1) await msg(`${landed}번 맞았다!`, 40);
    if (mm.drain && att.hp > 0) {
      const h = Math.max(1, Math.floor(dmg * mm.drain)), mx = D.stats(att).hp;
      if (att.hp < mx) { att.hp = Math.min(mx, att.hp + h); sfx('heal'); await msg(`${dn}에게서 기운을 빨아들였다!`, 40); }
    }
    if (mm.recoil) { att.hp = Math.max(0, att.hp - Math.max(1, Math.floor(dmg * mm.recoil))); await msg(`${G.eun(an)} 반동으로 데미지를 입었다!`, 40); }
    if (mm.sec && def.hp > 0 && G.chance(mm.sec.ch)) {
      if (mm.sec.status && !def.status && !(mm.sec.status === 'psn' && D.MONS[def.id].t.includes('독'))) { def.status = mm.sec.status; sfx('status'); await msg(`${G.eun(dn)} ${D.STATUS[mm.sec.status].verb}`, 45); }
      if (mm.sec.s) { const st = stages(defSide); if (st[mm.sec.s] > -6) { st[mm.sec.s] += mm.sec.d; await msg(`${dn}의 ${G.iga(D.STAT_NAME[mm.sec.s])} 떨어졌다!`, 40); } }
    }
  }
  async function faint(side) {
    const m = active(side), s = sprite(side);
    G.audio && G.audio.cry(m.id, true);
    sfx('faint');
    await G.tween(18, t => { s.clip = t * 70; s.alpha = 1 - t * 0.6; });
    s.on = false; s.clip = undefined; s.alpha = 1;
    if (side === 'e') s.boxOn = false;
    const nm = (side === 'e' && BT.wild ? '야생 ' : side === 'e' ? '상대 ' : '') + name(m);
    await msg(`${G.eun(nm)} 쓰러졌다!`, 50);
    if (side === 'p') { BT.ps.boxOn = false; BT.ps.boxX = 256; }
  }

  // EXP to every participant still standing
  async function giveExp() {
    const e = active('e');
    const parts = [...BT.part].filter(i => G.S.party[i] && G.S.party[i].hp > 0);
    for (const i of parts) {
      const m = G.S.party[i];
      if (m.lv >= 100) continue;
      const gain = Bt.expGain(e, !BT.wild, parts.length);
      await msg(`${G.eun(name(m))} 경험치를 ${gain} 얻었다!`, 45);
      await addExp(m, gain, i === BT.pi);
    }
    BT.part = new Set([BT.pi]);
  }
  async function addExp(m, gain, onField) {
    let left = gain;
    while (left > 0 && m.lv < 100) {
      const need = D.expFor(m.lv + 1) - m.exp;
      const step = Math.min(left, need);
      const from = m.exp;
      m.exp += step; left -= step;
      if (onField) { sfx('exp'); await G.tween(Math.min(40, 10 + Math.round(step / 3)), t => { BT.ps.exp = from + step * t; }); }
      if (m.exp >= D.expFor(m.lv + 1)) await levelUp(m, onField);
    }
  }
  async function levelUp(m, onField) {
    const before = D.stats(m);
    m.lv++;
    const after = D.stats(m);
    m.hp += after.hp - before.hp;
    if (onField) { BT.ps.exp = D.expFor(m.lv); BT.ps.hp = m.hp; }
    BT.leveled.add(m.uid);
    G.audio && G.audio.jingle('level');
    const L = await G.say(`${name(m)}의 레벨이 올랐다! (Lv.${m.lv})`, { keep: true });
    await statWindow(before, after);
    G.closeText(L);
    // new moves at this level
    for (const [lv, mv] of D.MONS[m.id].learn) if (lv === m.lv) await learnMove(m, mv);
  }
  function statWindow(a, b) {
    return new Promise(res => {
      const L = { modal: true, t: 0 };
      L.update = () => { L.t++; if (L.t > 10 && (G.hit('a') || G.hit('b'))) { G.popLayer(L); res(); } };
      L.drawTop = T => {
        G.box(T, 150, 6, 102, 128, G.STYLE.white, 6);
        [['HP', 'hp'], ['공격', 'atk'], ['방어', 'def'], ['특수공격', 'spa'], ['특수방어', 'spd'], ['스피드', 'spe']].forEach(([k, s], i) => {
          G.text(T, k, 158, 14 + i * 19, '#36363f', null);
          G.textR(T, L.t < 60 ? '+' + (b[s] - a[s]) : b[s], 244, 14 + i * 19, '#2c2f45', null);
        });
      };
      G.pushLayer(L);
    });
  }
  async function learnMove(m, mv) {
    if (m.moves.some(x => x.id === mv)) return;
    const mn = D.MOVES[mv].n;
    if (m.moves.length < 4) {
      m.moves.push({ id: mv, pp: D.MOVES[mv].pp });
      G.audio && G.audio.jingle('learn');
      await G.say(`${G.eun(name(m))} 새로 ${G.eul(mn)} 배웠다!`);
      return;
    }
    if (G.autoLearn) { await G.autoLearn(m, mv); return; }   // play-test hook (unset in the game)
    await G.say(`${G.eun(name(m))} ${G.eul(mn)} 배우고 싶어 한다.\n하지만 기술을 4개까지만 기억할 수 있다.`);
    for (;;) {
      const ok = await G.ask(`다른 기술을 잊고 ${G.eul(mn)} 배우게 할까?`);
      if (!ok) {
        const giveUp = await G.ask(`${G.eul(mn)} 배우는 것을 포기할까?`);
        if (giveUp) { await G.say(`${G.eun(name(m))} ${G.eul(mn)} 배우지 않았다.`); return; }
        continue;
      }
      const items = m.moves.map(x => ({ label: D.MOVES[x.id].n, right: `${D.MOVES[x.id].t} ${D.MOVES[x.id].p ? '위력 ' + D.MOVES[x.id].p : '변화'}` }));
      const nm = D.MOVES[mv];
      const i = await G.list(items, {
        title: '어느 기술을 잊을까?', cancelLabel: '취소',
        top: (T, s) => {
          G.menus.topCard(T, '새 기술: ' + nm.n);
          G.text(T, `${nm.t}  ${nm.p ? '위력 ' + nm.p : '변화 기술'}  명중 ${nm.a || '-'}  PP ${nm.pp}`, 10, 26, '#2c2f45', null);
          if (s >= 0) { const o = D.MOVES[m.moves[s].id]; G.text(T, `잊을 기술: ${o.n}`, 10, 60, '#b0403a', null); G.text(T, `${o.t}  ${o.p ? '위력 ' + o.p : '변화 기술'}  명중 ${o.a || '-'}`, 10, 80, '#5a5648', null); }
        }
      });
      if (i < 0) continue;
      const old = D.MOVES[m.moves[i].id].n;
      m.moves[i] = { id: mv, pp: D.MOVES[mv].pp };
      await G.say(`하나, 둘... 짠!\n${G.eun(name(m))} ${G.eul(old)} 깨끗이 잊었다!`);
      G.audio && G.audio.jingle('learn');
      await G.say(`그리고 ${G.eun(name(m))} 새로 ${G.eul(mn)} 배웠다!`);
      return;
    }
  }
  Bt.learnMove = learnMove;

  // ------------------------------------------------------------ catching
  async function throwGourd(itemId) {
    const e = active('e'), st = D.stats(e);
    D.useItem(itemId);
    await msg(`${G.S.name}${G.josa(G.S.name, '은', '는')} ${G.eul(D.ITEMS[itemId].n)} 던졌다!`, 25);
    sfx('throw');
    const gx = 186, gy = 70;
    let gpos = { x: 40, y: 150, rot: 0, on: true };
    const cubeImg = G.art[D.ITEMS[itemId].icon] || G.art.cube;
    const drawG = (C) => { if (!gpos.on) return; C.save(); C.translate(gpos.x, gpos.y); C.rotate(gpos.rot); C.drawImage(cubeImg, -8, -10); C.restore(); };
    const gfx = { t: 0, n: 1e9, draw: drawG, res: () => {} };
    BT.fx.push(gfx);
    await G.tween(22, t => { gpos.x = 40 + (gx - 40) * t; gpos.y = 150 + (gy - 150) * t - Math.sin(t * Math.PI) * 50; gpos.rot = t * 8; });
    gpos.rot = 0;
    sfx('pop');
    BT.es.flash = 1;
    await G.tween(14, t => { BT.es.scale = 1 - t; BT.es.flash = 1; });
    BT.es.on = false; BT.es.scale = 1; BT.es.flash = 0;
    await G.tween(12, t => { gpos.y = gy + 26 * t * t; });
    // shake count
    let a = ((3 * st.hp - 2 * e.hp) * D.MONS[e.id].cr * D.ITEMS[itemId].ball) / (3 * st.hp);
    if (e.status === 'slp') a *= 2; else if (e.status) a *= 1.5;
    let shakes = 0;
    if (a >= 255 || D.ITEMS[itemId].master) shakes = 4;
    else {
      const b = 1048560 / Math.sqrt(Math.sqrt(16711680 / Math.max(1, a)));
      while (shakes < 4 && G.rand() * 65536 < b) shakes++;
    }
    for (let i = 0; i < Math.min(3, shakes); i++) {
      await G.wait(18);
      sfx('wobble');
      await G.tween(14, t => { gpos.rot = Math.sin(t * Math.PI * 2) * 0.35; });
      gpos.rot = 0;
    }
    await G.wait(16);
    if (shakes >= 4) {
      sfx('caught');
      await fx(24, (C, t) => { for (let i = 0; i < 6; i++) { const ang = i * 1.05; C.fillStyle = '#ffe85a'; C.fillRect(gpos.x + Math.cos(ang) * t * 22 - 1, gpos.y + Math.sin(ang) * t * 16 - 1, 3, 3); } });
      G.audio && G.audio.jingle('catch');
      await G.say(`좋았어! ${G.iga('야생 ' + name(e))} 큐브에 쏙 들어갔다!`);
      gfx.n = 0;
      const isNew = !G.S.dex.caught[e.id];
      e.status = e.status || null;
      const where = D.receive(e);
      if (isNew) await G.menus.dexReveal(e.id);   // the silhouette in the dex turns into the picture
      if (where === 'box') await G.say(`데리고 다닐 몬스터가 가득 차서 ${G.eun(name(e))} 보관함으로 보내졌다.`);
      return true;
    }
    // broke free
    sfx('pop');
    gpos.on = false; gfx.n = 0;
    BT.es.on = true; BT.es.flash = 1;
    await G.tween(10, t => { BT.es.flash = 1 - t; });
    const lines = ['앗! 큐브에서 빠져나왔다!', '아깝다! 거의 잡을 뻔했는데!', '으악! 조금만 더 하면 됐는데!', '아아! 거의 다 잡았는데!'];
    await msg(lines[Math.min(3, shakes)], 60);
    return false;
  }

  // ------------------------------------------------------------ player's turn choice
  async function playerChoice() {
    if (G.autoBattle) { const r = G.autoBattle(active('p'), active('e'), BT); if (r) return r; }   // play-test hook (unset in the game)
    for (;;) {
      const c = await askUI('command');
      if (c === 0) {
        const m = active('p');
        if (m.moves.every(x => x.pp <= 0)) { await msg(`${G.eun(name(m))} 쓸 수 있는 기술이 없다!`, 40); return { k: 'move', i: -1 }; }
        const i = await askUI('moves');
        if (i < 0) continue;
        return { k: 'move', i };
      }
      if (c === 1) {
        const r = await G.menus.bag({ battle: true, wild: BT.wild });
        if (!r) continue;
        if (r.done) return { k: 'used' };
        return { k: 'ball', id: r.id };
      }
      if (c === 2) {
        const i = await G.menus.party({ title: '누구로 바꿀까요?', start: BT.pi });
        if (i < 0) continue;
        const m = G.S.party[i];
        if (i === BT.pi) { await G.say(`${G.eun(name(m))} 이미 싸우고 있다!`); continue; }
        if (m.hp <= 0) { await G.say(`${G.eun(name(m))} 싸울 기운이 없다!`); continue; }
        return { k: 'switch', i };
      }
      if (c === 3) return { k: 'run' };
    }
  }
  async function doSwitch(i) {
    const m = active('p');
    await msg(`돌아와, ${name(m)}!`, 30);
    sfx('recall');
    await G.tween(10, t => { BT.ps.scale = 1 - t * 0.8; BT.ps.flash = t; });
    BT.ps.on = false; BT.ps.scale = 1; BT.ps.flash = 0;
    await G.tween(8, t => { BT.ps.boxX = 130 + 126 * t; });
    BT.pi = i;
    await sendOutPlayer(false);
  }
  async function forcedSwitch() {
    const alive = G.S.party.filter(m => m.hp > 0).length;
    if (!alive) return false;
    const i = await G.menus.party({ title: '다음 몬스터를 고르세요', forced: true, start: G.S.party.findIndex(m => m.hp > 0) });
    const m = G.S.party[i];
    if (!m || m.hp <= 0) { await G.say('싸울 수 있는 몬스터를 골라 주세요.'); return forcedSwitch(); }
    BT.pi = i;
    await sendOutPlayer(false);
    return true;
  }
  async function tryRun() {
    const p = active('p'), e = active('e');
    BT.runTries++;
    const ps = statOf(p, 'spe', BT.pSt), es = statOf(e, 'spe', BT.eSt);
    const ok = ps >= es || G.rand() < Math.min(1, 0.45 + (ps / es) * 0.25 + BT.runTries * 0.15);
    if (ok) { sfx('run'); await msg('무사히 도망쳤다!', 40); return true; }
    await msg('도망칠 수 없었다!', 40);
    return false;
  }

  // end-of-turn: poison
  async function endTurn() {
    for (const side of ['p', 'e']) {
      const m = active(side);
      if (!m || m.hp <= 0) continue;
      const nm = sideName(side, m), v = vol(side);
      if (m.status === 'psn') {
        const d = Math.max(1, Math.floor(D.stats(m).hp / 8));
        m.hp = Math.max(0, m.hp - d);
        sfx('hit0'); hitFlash(side);
        await msg(`${G.eun(nm)} 독 때문에 아파한다!`, 45);
        while (Math.abs(sprite(side).hp - m.hp) > 0.6) await G.wait(1);
      }
      if (m.hp > 0 && v.ring) {
        const mx = D.stats(m).hp;
        if (m.hp < mx) {
          m.hp = Math.min(mx, m.hp + Math.max(1, Math.floor(mx / 16)));
          sfx('heal');
          await msg(`물의 고리가 ${nm}의 체력을 조금 회복시켰다!`, 40);
          while (Math.abs(sprite(side).hp - m.hp) > 0.6) await G.wait(1);
        }
      }
      if (m.hp > 0 && v.drowsy) {
        v.drowsy--;
        if (!v.drowsy && !m.status) { m.status = 'slp'; m.slp = G.ri(2, 3); sfx('status'); await msg(`${G.eun(nm)} 꾸벅꾸벅... 결국 잠들어 버렸다!`, 50); }
      }
    }
  }

  // returns 'win' | 'lose' | 'run' | 'caught'
  async function loop() {
    for (;;) {
      const act = await playerChoice();
      const p = active('p'), e = active('e');
      // non-move actions first
      if (act.k === 'run') { if (await tryRun()) return 'run'; }
      if (act.k === 'switch') await doSwitch(act.i);
      if (act.k === 'ball') { if (await throwGourd(act.id)) return 'caught'; }
      // enemy item use (smart trainers heal once)
      let eAct = { k: 'move', i: aiMove('e') };
      if (BT.tr && BT.tr.potion && !BT.tr.usedPotion && e.hp > 0 && e.hp < D.stats(e).hp * 0.3) {
        BT.tr.usedPotion = true; eAct = { k: 'heal' };
      }
      const order = [];
      if (act.k === 'move') {
        const pm = act.i >= 0 ? D.MOVES[p.moves[act.i].id] : D.MOVES.struggle;
        const em = eAct.k === 'move' && eAct.i >= 0 ? D.MOVES[e.moves[eAct.i].id] : null;
        const pPri = pm.pri || 0, ePri = em ? (em.pri || 0) : 5;
        const pS = statOf(p, 'spe', BT.pSt), eS = statOf(e, 'spe', BT.eSt);
        const pFirst = pPri !== ePri ? pPri > ePri : pS !== eS ? pS > eS : G.chance(0.5);
        if (pFirst) order.push(['p', act.i], ['e', eAct]); else order.push(['e', eAct], ['p', act.i]);
      } else order.push(['e', eAct]);
      for (const [side, a] of order) {
        const me = active(side), foe = active(other(side));
        if (!me || me.hp <= 0 || !foe || foe.hp <= 0) continue;
        if (side === 'e' && a.k === 'heal') {
          const st = D.stats(me); me.hp = Math.min(st.hp, me.hp + 20);
          sfx('heal'); await msg(`${BT.tr.title} ${G.iga(BT.tr.name)} 상처약을 썼다!`, 50);
          continue;
        }
        if (side === 'e' && a.i && a.i.warn) { await msg(`${sideName('e', me)}${a.i.warn}`, 60); continue; }   // the warning turn: nothing else happens
        await useMove(side, side === 'e' ? a.i : a);
        if (BT.fled || foe.hp <= 0 || me.hp <= 0) break;
      }
      if (BT.fled) return 'run';
      // a battle this turn's moves already decided ends at once: no end-of-turn poison after the last knockout
      if (BT.eParty.some(m => m.hp > 0) && G.S.party.some(m => m.hp > 0)) await endTurn();
      // faint handling
      const res = await afterFaints();
      if (res) return res;
    }
  }
  async function afterFaints() {
    const e = active('e'), p = active('p');
    if (e.hp <= 0) {
      await faint('e');
      await giveExp();
      const next = BT.eParty.findIndex(m => m.hp > 0);
      if (next < 0) {
        // both fell on the last exchange (recoil): the win stands and the last friend hangs on
        if (p.hp <= 0 && !G.S.party.some(m => m.hp > 0)) { p.hp = 1; await msg(`${G.eun(sideName('p', p))} 간신히 버텨 냈다!`, 50); }
        else if (p.hp <= 0) { await faint('p'); BT.part.delete(BT.pi); }
        return 'win';
      }
      BT.ei = next;
      await sendOutEnemy(false);
    }
    if (p.hp <= 0) {
      await faint('p');
      BT.part.delete(BT.pi);
      if (!G.S.party.some(m => m.hp > 0)) return 'lose';
      await forcedSwitch();
    }
    return null;
  }

  async function evolveChecks() {
    for (const m of G.S.party) {
      if (BT.leveled.has(m.uid) && D.levelEvoReady(m)) await evolve(m, D.MONS[m.id].evo.to);
    }
  }
  // o.noCancel: mineral and resonance evolutions are confirmed beforehand, so they run to the end
  async function evolve(m, to, o) {
    o = o || {};
    const from = m.id;
    const prev = G.scene;
    let t = 0, phase = 0, cancel = false;
    const sc = {
      update() { t++; },
      drawTop(T) {
        T.fillStyle = '#101020'; T.fillRect(0, 0, 256, 192);
        for (let i = 0; i < 40; i++) { const a = i * 0.7 + t * 0.02, r = 30 + (i * 37 % 90) + Math.sin(t / 20 + i) * 6; T.fillStyle = i % 3 ? '#f6e7a8' : '#a8c8f8'; T.fillRect(128 + Math.cos(a) * r, 80 + Math.sin(a) * r * 0.7, 2, 2); }
        const id = phase === 2 ? to : (phase === 1 && Math.floor(t / Math.max(3, 18 - t / 14)) % 2 ? to : from);
        const img = phase === 1 ? G.mons.silhouette(id, 'card') : G.mons.card(id);
        T.drawImage(img, 128 - img.width, 80 - img.height, img.width * 2, img.height * 2);
      },
      drawBot(B) { G.menus.header(B, '진화', ''); G.textC(B, phase === 1 && !o.noCancel ? 'B 버튼: 진화 멈추기' : '', 128, 90, '#5a5648', null); G.addHot({ x: 0, y: 0, w: 256, h: 192, onTap: () => { if (phase === 1 && !o.noCancel) G.pressed.b = 1; } }); }
    };
    G.scene = sc;
    G.audio && G.audio.music('evolve');
    await G.say(`어라...? ${G.iga(name(m))} 빛나기 시작했다!`);
    phase = 1; t = 0;
    for (let i = 0; i < 220; i++) { await G.wait(1); if (!o.noCancel && (G.btn('b') || G.pressed.b)) { cancel = true; break; } }
    if (cancel) {
      phase = 0;
      await G.say(`어라? ${G.eun(name(m))} 진화를 멈췄다!`);
      G.scene = prev;
      return false;
    } else {
      BT && (BT.leveled.delete(m.uid));
      await G.fadeTo(1, 10, '#ffffff');
      const oldName = name(m);
      const before = D.stats(m), ratio = before.hp ? Math.max(0, m.hp) / before.hp : 1;
      m.id = to;
      const after = D.stats(m);
      // the same share of HP as before, never above the new maximum; a fainted monster stays fainted
      m.hp = m.hp <= 0 ? 0 : Math.max(1, Math.min(after.hp, Math.round(after.hp * ratio)));
      phase = 2;
      const newKind = !G.S.dex.caught[to];
      D.caught(to);
      await G.fadeTo(0, 20);
      G.audio && G.audio.jingle('evolve');
      await G.say(`축하합니다! ${G.eun(oldName)} ${G.ro(D.MONS[to].n)} 진화했다!`);
      if (newKind) await G.say(`${D.MONS[to].n}의 정보가 도감에 새로 기록되었다!`);
      for (const [lv, mv] of D.MONS[to].learn) if (lv === m.lv) await learnMove(m, mv);
    }
    G.scene = prev;
    return true;
  }
  Bt.evolve = evolve;
  const fieldMusic = () => G.audio && G.audio.music(G.world.map.def.bgm || (G.world.map.kind === 'out' ? 'route' : 'town'));
  // what an evolution changes, shown before a mineral or resonance evolution is confirmed
  Bt.evoPreview = (m, to, how) => new Promise(res => {
    const from = m.id, A0 = D.MONS[from], B0 = D.MONS[to];
    const chain = [to]; let og = D.origin(to); while (og) { chain.push(og.from); og = D.origin(og.from); }
    const known = new Set(m.moves.map(x => x.id)), recall = [];
    for (const id of chain) for (const [lv, mv] of D.MONS[id].learn) if (lv <= m.lv && !known.has(mv) && !recall.includes(mv)) recall.push(mv);
    const next = B0.learn.find(([lv]) => lv > m.lv);
    const L = { modal: true };
    const done = v => { G.popLayer(L); G.audio && G.audio.sfx(v ? 'select' : 'cancel'); res(v); };
    L.update = () => { if (G.hit('a')) done(true); else if (G.hit('b')) done(false); };
    L.drawTop = T => {
      G.menus.topCard(T, '진화 미리보기 · ' + how);
      G.box(T, 6, 21, 100, 74, G.STYLE.white, 5); G.menus.drawCard(T, from, 6, 21, 100, 72);
      G.box(T, 150, 21, 100, 74, G.STYLE.white, 5); G.menus.drawCard(T, to, 150, 21, 100, 72, G.mons.silhouette(to, 'card', '#3a3d52'));
      G.textC(T, '▶', 128, 50, '#e3b23c', null);
      G.textC(T, A0.n, 56, 96, '#2c2f45', null); G.textC(T, B0.n, 200, 96, '#2c2f45', null);
      const bw = ts => ts.length * 28 - 3;
      let bx = Math.round(56 - bw(A0.t) / 2); A0.t.forEach(t => { bx += G.menus.typeBadge(T, t, bx, 113) + 3; });
      bx = Math.round(200 - bw(B0.t) / 2); B0.t.forEach(t => { bx += G.menus.typeBadge(T, t, bx, 113) + 3; });
      G.box(T, 6, 132, 244, 56, G.STYLE.white, 5);
      G.text(T, `Lv.${m.lv} 그대로 · 기술·탐험 기술·별명 유지`, 12, 135, '#5a5648', null);
      G.text(T, '복습 가능: ' + (recall.length ? recall.slice(0, 3).map(id => D.MOVES[id].n).join(', ') + (recall.length > 3 ? ' 외 ' + (recall.length - 3) : '') : '없음'), 12, 151, '#36363f', null);
      G.text(T, '다음 기술: ' + (next ? `Lv.${next[0]} ${D.MOVES[next[1]].n}` : '없음'), 12, 167, '#36363f', null);
    };
    L.drawBot = B => {
      G.menus.header(B, '진화할까요?', how);
      G.wrap(`${G.eun(name(m))} ${G.ro(B0.n)} 진화한다. 실행한 뒤에만 ${how === '공명 조율' ? '조율 기록이 남는다' : how + '이 소모된다'}.`, 228).forEach((ln, k) => G.text(B, ln, 14, 34 + k * 16, '#36363f', null));
      G.button(B, 20, 110, 104, 36, '진화시키기', { color: '#d6efc8', dark: '#5a9a4a', onTap: () => done(true) });
      G.button(B, 132, 110, 104, 36, '그만두기', { onTap: () => done(false) });
    };
    G.pushLayer(L);
  });
  // a resonance mineral touched outside battle: true only when the evolution really happened
  Bt.stoneEvolve = async (m, itemId) => {
    const evo = D.MONS[m.id].evo;
    if (!evo || evo.item !== itemId) return false;
    if (!(await Bt.evoPreview(m, evo.to, D.ITEMS[itemId].n))) return false;
    const ok = await evolve(m, evo.to, { noCancel: true });
    fieldMusic();
    return ok;
  };
  // 공명 조율 (single-player stand-in for trade evolutions): Lv.36 + third badge + Q22 at the 잎향 공명연구소
  Bt.resonanceEvolve = async m => {
    const evo = D.MONS[m.id].evo;
    if (!evo || !evo.res || m.lv < evo.lv || !D.resonanceReady()) return false;
    if (!(await Bt.evoPreview(m, evo.to, '공명 조율'))) return false;
    const ok = await evolve(m, evo.to, { noCancel: true });
    fieldMusic();
    return ok;
  };
  // the dex's evolution menu: a level evolution that was stopped can be tried again while the level holds
  Bt.levelEvolve = async m => {
    if (!D.levelEvoReady(m)) return false;
    const ok = await evolve(m, D.MONS[m.id].evo.to);
    fieldMusic();
    return ok;
  };

  // 도깨비 사탕: one level outside battle — same stat window, new moves and evolution as a battle level-up
  Bt.feedLevel = async m => {
    const back = G.pushLayer({
      drawTop: T => G.menus.monSummary(T, m, 'stats'),
      drawBot: B => {
        G.menus.header(B, '도깨비 사탕', '남은 사탕 ' + (G.S.bag.candy || 0));
        B.drawImage(G.mons.icon(m.id), 52, 58);
        const lv = G.bigText('Lv.' + m.lv, 3, '#2c2f45');
        B.drawImage(lv, 92, 52);
        G.textC(B, '화면을 누르면 계속', 128, 150, '#8a8270', null);
        G.addHot({ x: 0, y: 22, w: 256, h: 170, onTap: () => { G.pressed.a = 1; } });
      }
    });
    const before = D.stats(m);
    m.lv++;
    m.exp = D.expFor(m.lv);
    const after = D.stats(m);
    m.hp += after.hp - before.hp;
    G.audio && G.audio.jingle('level');
    const L = await G.say(`${name(m)}의 레벨이 올랐다! (Lv.${m.lv})`, { keep: true });
    await statWindow(before, after);
    G.closeText(L);
    for (const [lv, mv] of D.MONS[m.id].learn) if (lv === m.lv) await learnMove(m, mv);
    G.popLayer(back);
    if (D.levelEvoReady(m)) {
      await evolve(m, D.MONS[m.id].evo.to);
      fieldMusic();
    }
  };

  // ------------------------------------------------------------ public entries
  async function run(o) {
    await transitionIn();
    begin(o);
    await G.fadeTo(0, 10);
    const e = active('e');
    if (BT.wild) {
      BT.es.on = true; BT.es.dx = 120;
      await G.tween(30, t => { BT.es.dx = 120 * (1 - t); });
      G.audio && G.audio.cry(e.id);
      D.seen(e.id);
      BT.es.hp = e.hp; BT.es.boxOn = true;
      await msg(o.legend ? o.legend : `앗! 야생 ${G.iga(name(e))} 튀어나왔다!`, o.legend ? null : 70);
    } else {
      BT.trainerImg = G.art.charStand(o.trainer.char); BT.trainerOn = 1; BT.trainerDX = 80;
      await G.tween(24, t => { BT.trainerDX = 80 * (1 - t); });
      await msg(`${o.trainer.title} ${G.iga(o.trainer.name)} 승부를 걸어왔다!`, 70);
      await G.tween(14, t => { BT.trainerDX = 90 * t; BT.trainerOn = 1 - t; });
      BT.trainerOn = 0;
      await sendOutEnemy(true);
    }
    await sendOutPlayer(true);
    let res = await loop();
    BT.result = res;
    if (res === 'win' && !BT.wild) {
      const tr = BT.tr;
      G.audio && G.audio.music('victory');
      BT.trainerImg = G.art.charStand(tr.char); BT.trainerDX = 80; BT.trainerOn = 1;
      await G.tween(20, t => { BT.trainerDX = 80 * (1 - t); });
      await G.say(`${tr.title} ${G.wa(tr.name)}의 승부에서 이겼다!`);
      if (tr.lose) await G.say(tr.lose, { name: tr.title + ' ' + tr.name });
      const prize = tr.prize || (tr.base || 16) * Math.max(...BT.eParty.map(m => m.lv));
      G.S.money += prize;
      await G.say(`${G.S.name}${G.josa(G.S.name, '은', '는')} 상금으로 ${prize.toLocaleString()}원을 받았다!`);
    } else if (res === 'win') {
      G.audio && G.audio.music('victory');
      await G.wait(30);
    }
    if (res === 'lose' && BT.tr && BT.tr.noBlackout) {
      await G.say(`${G.S.name}에게는 싸울 수 있는 몬스터가 없다!`);
    } else if (res === 'lose') {
      await G.say(`${G.S.name}에게는 싸울 수 있는 몬스터가 없다!`);
      const lost = Math.floor(G.S.money / 2);
      G.S.money -= lost;
      await G.say(`${G.S.name}${G.josa(G.S.name, '은', '는')} 허둥지둥 ${lost.toLocaleString()}원을 떨어뜨렸다...\n... ... 눈앞이 캄캄해졌다!`);
    }
    if (res !== 'lose') await evolveChecks();
    return await end();
  }

  Bt.wild = async enc => {
    if (!G.S.party.some(m => m.hp > 0)) { await Bt.blackout(); return 'lose'; }
    const mon = D.makeMon(enc.id, enc.lv, enc.moves ? { moves: enc.moves, ivMin: 8 } : undefined);
    const res = await run({ wild: true, eParty: [mon], legend: enc.legend });
    if (res === 'lose') await Bt.blackout();
    return res;
  };
  Bt.trainer = async tr => {
    if (!G.S.party.some(m => m.hp > 0)) { await Bt.blackout(); return false; }   // never start a fight with nobody able to stand
    const team = tr.team.map(([id, lv, moves]) => D.makeMon(id, lv, { ivMin: tr.iv || 6, moves }));
    const res = await run({ trainer: Object.assign({}, tr), eParty: team });
    if (res === 'lose') { if (tr.noBlackout) { D.healParty(); return false; } await Bt.blackout(); return false; }
    if (res === 'win' && tr.flag) G.S.flags[tr.flag] = 1;   // scripted battles (leaders, rivals) record their win here too
    return res === 'win';
  };
  Bt.blackout = async () => {
    const hp = G.S.healPoint || { map: 'home', x: 3, y: 4, dir: 'down' };
    await G.fadeTo(1, 20);
    D.healParty();
    G.world.enter(hp.map, hp.x, hp.y, hp.dir || 'up', { quiet: true, noEvents: true });
    await G.fadeTo(0, 20);
    await G.say(G.MAPS[hp.map].healLine || (G.MAPS[hp.map].kind === 'in' && hp.map === 'home' ? '엄마: 어머, 많이 지쳤구나! 푹 쉬고 나니 다들 기운을 차렸단다.' : '간호사: 맡겨 주신 몬스터들은 모두 건강해졌어요. 너무 무리하지 마세요!'));
  };
})();

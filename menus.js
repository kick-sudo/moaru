/* 모아루: 잠든 길의 노래 — UI: text box, choices, lists, start menu, party, bag, dex, settings, shop, box, dialogs */
'use strict';
(function () {
  const G = window.G, A = G.art, D = G.data;
  const Mn = G.menus = {};

  // ------------------------------------------------------------ text box (top screen)
  const TB = { x: 3, y: 141, w: 250, h: 48 };
  function drawTextBox(T, L) {
    G.box(T, TB.x, TB.y, TB.w, TB.h, G.STYLE.text, 5);
    if (L.name) {
      const w = Math.ceil(G.tw(L.name)) + 12;
      G.box(T, TB.x + 6, TB.y - 15, w, 17, ['#2c2f45', '#e9c45a', '#2c2f45'], 4);
      G.text(T, L.name, TB.x + 12, TB.y - 13, '#fbf3dc', null);
    }
    const pg = L.pages[L.page] || [];
    let left = Math.floor(L.chars);
    pg.forEach((ln, i) => {
      const s = ln.slice(0, Math.max(0, left));
      left -= ln.length;
      G.text(T, s, TB.x + 10, TB.y + 8 + i * 17, '#36363f', '#d6d3cb');
    });
    if (L.ready && !L.keep && Math.floor(G.frame / 16) % 2 === 0) {
      const ax = TB.x + TB.w - 16, ay = TB.y + TB.h - 13;
      T.fillStyle = '#e04848';
      for (let i = 0; i < 4; i++) T.fillRect(ax + i, ay + i, 7 - i * 2, 1);
    }
  }
  G.say = (text, opts) => new Promise(res => {
    opts = opts || {};
    G.T.font = G.FONT;
    const lines = G.wrap(text, TB.w - 22);
    const pages = [];
    for (let i = 0; i < lines.length; i += 2) pages.push(lines.slice(i, i + 2));
    const spd = [0.6, 1.2, 3][G.S ? (G.S.settings.text ?? 1) : 1];
    const L = { modal: true, pages, page: 0, chars: 0, t: 0, name: opts.name, keep: !!opts.keep, ready: false };
    L.update = () => {
      const total = pages[L.page].join('').length;
      if (L.chars < total) {
        L.chars += spd;
        if ((G.hit('a') || G.hit('b')) && L.page_t > 3) L.chars = total;
        L.page_t = (L.page_t || 0) + 1;
        if (L.chars >= total) { L.chars = total; L.t = 0; }
        return;
      }
      L.ready = true;
      L.t++;
      if (L.keep && L.page === pages.length - 1) { if (!L.resolved) { L.resolved = true; res(L); } return; }
      const auto = opts.auto && L.t >= opts.auto;
      if (G.hit('a') || G.hit('b') || auto) {
        if (!auto) G.audio && G.audio.sfx('blip');
        if (L.page < pages.length - 1) { L.page++; L.chars = 0; L.page_t = 0; L.ready = false; }
        else { G.popLayer(L); res(); }
      }
    };
    L.drawTop = T => drawTextBox(T, L);
    G.pushLayer(L);
  });
  G.closeText = L => { if (L) G.popLayer(L); };

  // ------------------------------------------------------------ bottom-screen background
  const BOTBG = (() => {
    const [c, x] = A.cv(256, 192);
    x.fillStyle = '#e9e3d2'; x.fillRect(0, 0, 256, 192);
    for (let y = 0; y < 192; y += 4) { x.fillStyle = y % 8 ? 'rgba(255,255,255,0.35)' : 'rgba(200,188,160,0.25)'; x.fillRect(0, y, 256, 2); }
    return c;
  })();
  function header(B, title, sub) {
    B.drawImage(BOTBG, 0, 0);
    B.fillStyle = '#2c2f45'; B.fillRect(0, 0, 256, 20);
    B.fillStyle = '#e3b23c'; B.fillRect(0, 20, 256, 2);
    G.text(B, title, 8, 4, '#fbf3dc', null);
    if (sub) G.textR(B, sub, 248, 4, '#e9c45a', null);
  }
  Mn.header = header;

  // ------------------------------------------------------------ choice buttons (bottom screen)
  G.choose = (options, opts) => new Promise(res => {
    opts = opts || {};
    const items = options.map(o => typeof o === 'string' ? { label: o } : o);
    const L = { modal: true, sel: opts.start || 0 };
    const done = i => { G.popLayer(L); G.audio && G.audio.sfx(i < 0 ? 'cancel' : 'select'); res(i); };
    L.update = () => {
      if (G.rep('up')) { L.sel = (L.sel + items.length - 1) % items.length; G.audio && G.audio.sfx('move'); }
      if (G.rep('down')) { L.sel = (L.sel + 1) % items.length; G.audio && G.audio.sfx('move'); }
      if (G.hit('a') && !items[L.sel].disabled) return done(L.sel);
      if (G.hit('b') && opts.cancel !== undefined) return done(opts.cancel);
    };
    L.drawBot = B => {
      header(B, opts.title || '선택', opts.sub);
      const n = items.length, bh = n > 4 ? 24 : 30, gap = 6;
      const total = n * bh + (n - 1) * gap;
      const y0 = Math.max(28, Math.round(22 + (170 - total) / 2));
      items.forEach((it, i) => {
        G.button(B, 28, y0 + i * (bh + gap), 200, bh, it.label, { sel: i === L.sel, disabled: it.disabled, color: it.color, dark: it.dark, onTap: () => { L.sel = i; done(i); } });
      });
    };
    G.pushLayer(L);
  });
  G.ask = async (q, labels, opts) => {
    const L = await G.say(q, Object.assign({ keep: true }, opts || {}));
    const r = await G.choose(labels || ['예', '아니요'], { title: '선택', cancel: 1 });
    G.closeText(L);
    return r === 0;
  };

  // ------------------------------------------------------------ generic scrolling list on the bottom screen
  // items: [{label, right, disabled, icon}] ; opts: {title, sub, top(T, sel), rowH, cancelLabel}
  G.list = (items, opts) => new Promise(res => {
    opts = opts || {};
    const rowH = opts.rowH || 22, rows = Math.floor(132 / rowH);
    const L = { modal: true, sel: Math.min(opts.start || 0, Math.max(0, items.length - 1)), top: 0 };
    const finish = i => { G.popLayer(L); G.audio && G.audio.sfx(i < 0 ? 'cancel' : 'select'); res(i); };
    const fix = () => { if (L.sel < L.top) L.top = L.sel; if (L.sel >= L.top + rows) L.top = L.sel - rows + 1; };
    fix();
    L.update = () => {
      if (items.length) {
        if (G.rep('up')) { L.sel = (L.sel + items.length - 1) % items.length; fix(); G.audio && G.audio.sfx('move'); }
        if (G.rep('down')) { L.sel = (L.sel + 1) % items.length; fix(); G.audio && G.audio.sfx('move'); }
        if (G.rep('left')) { L.sel = Math.max(0, L.sel - rows); fix(); }
        if (G.rep('right')) { L.sel = Math.min(items.length - 1, L.sel + rows); fix(); }
        if (G.hit('a') && !items[L.sel].disabled) return finish(L.sel);
      }
      if (G.hit('b')) return finish(-1);
    };
    L.drawTop = opts.top ? T => opts.top(T, items.length ? L.sel : -1) : null;
    L.drawBot = B => {
      header(B, opts.title || '', opts.sub);
      for (let r = 0; r < rows; r++) {
        const i = L.top + r;
        if (i >= items.length) break;
        const it = items[i], y = 26 + r * rowH;
        const sel = i === L.sel;
        G.rrect(B, 6, y, 228, rowH - 2, 4, sel ? '#2c2f45' : '#8a8270');
        G.rrect(B, 7, y + 1, 226, rowH - 4, 3, sel ? '#fff7dc' : '#fdfbf3');
        let tx = 13;
        if (it.icon) { B.drawImage(it.icon, 8, y + rowH / 2 - 17); tx = 40; }
        G.text(B, it.label, tx, y + Math.round((rowH - 2) / 2) - 7, it.disabled ? '#9a968c' : (it.color || '#36363f'), null);
        if (it.right) G.textR(B, it.right, 228, y + Math.round((rowH - 2) / 2) - 7, it.disabled ? '#9a968c' : '#5a5648', null);
        G.addHot({ x: 6, y, w: 228, h: rowH - 2, onTap: () => { if (it.disabled) return; L.sel = i; finish(i); } });
      }
      if (!items.length) G.textC(B, opts.empty || '아무것도 없다.', 120, 80, '#8a8270', null);
      // scroll + close buttons
      const pages = Math.max(1, Math.ceil(items.length / rows));
      if (pages > 1) {
        G.button(B, 238, 26, 14, 40, '▲', { onTap: () => { L.sel = Math.max(0, L.sel - rows); fix(); } });
        G.button(B, 238, 116, 14, 40, '▼', { onTap: () => { L.sel = Math.min(items.length - 1, L.sel + rows); fix(); } });
      }
      G.button(B, 80, 166, 96, 22, opts.cancelLabel || '닫기', { onTap: () => finish(-1) });
    };
    G.pushLayer(L);
  });

  // ------------------------------------------------------------ DOM dialog (name entry, save code)
  Mn.dialog = (o) => new Promise(res => {
    const dlg = document.getElementById('dlg');
    const msg = document.getElementById('dlgMsg'), inp = document.getElementById('dlgInput'), ta = document.getElementById('dlgText');
    const ok = document.getElementById('dlgOk'), cancel = document.getElementById('dlgCancel'), copy = document.getElementById('dlgCopy'), note = document.getElementById('dlgNote');
    msg.textContent = o.msg || '';
    inp.hidden = !o.input; ta.hidden = !o.text; copy.hidden = !o.copy; note.hidden = !o.note;
    note.textContent = o.note || '';
    cancel.hidden = o.noCancel;
    ok.textContent = o.okLabel || '확인';
    if (o.input) { inp.value = o.value || ''; inp.maxLength = o.max || 6; }
    if (o.text) { ta.value = o.value || ''; ta.readOnly = !!o.readOnly; }
    dlg.hidden = false;
    G.typing = true;
    setTimeout(() => { (o.input ? inp : o.text && !o.readOnly ? ta : ok).focus(); if (o.text && o.readOnly) { ta.focus(); ta.select(); } }, 30);
    const close = v => {
      dlg.hidden = true; G.typing = false;
      ok.onclick = cancel.onclick = copy.onclick = null; inp.onkeydown = null;
      res(v);
    };
    ok.onclick = () => close(o.input ? inp.value.trim() : o.text ? ta.value.trim() : true);
    cancel.onclick = () => close(null);
    copy.onclick = () => {
      const t = ta.value;
      const fallback = () => { ta.focus(); ta.select(); copy.textContent = '선택됨 — 직접 복사하세요'; };
      try { navigator.clipboard.writeText(t).then(() => { copy.textContent = '복사했어요'; }, fallback); } catch (e) { fallback(); }
    };
    inp.onkeydown = e => { if (e.key === 'Enter') ok.click(); if (e.key === 'Escape') cancel.click(); };
  });

  // ------------------------------------------------------------ small drawing helpers
  function typeBadge(ctx, t, x, y) {
    const w = Math.ceil(G.tw(t)) + 10;
    G.rrect(ctx, x, y, w, 15, 4, D.TYPE_DARK[t]);
    G.rrect(ctx, x + 1, y + 1, w - 2, 13, 3, D.TYPE_COL[t]);
    G.text(ctx, t, x + 5, y + 1, '#ffffff', 'rgba(0,0,0,0.35)');
    return w;
  }
  Mn.typeBadge = typeBadge;
  function hpBar(ctx, x, y, w, r) {
    G.rrect(ctx, x, y, w, 6, 2, '#3a3d52');
    ctx.fillStyle = '#5a5e74'; ctx.fillRect(x + 1, y + 1, w - 2, 4);
    if (r > 0) { ctx.fillStyle = G.hpCol(r); ctx.fillRect(x + 1, y + 1, Math.max(1, Math.round((w - 2) * r)), 4); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x + 1, y + 1, Math.max(1, Math.round((w - 2) * r)), 1); }
  }
  Mn.hpBar = hpBar;
  const TOPBG = (() => {
    const [c, x] = A.cv(256, 192);
    const g = x.createLinearGradient(0, 0, 0, 192); g.addColorStop(0, '#f6efdc'); g.addColorStop(1, '#e4d8bc');
    x.fillStyle = g; x.fillRect(0, 0, 256, 192);
    x.fillStyle = 'rgba(227,178,60,0.18)';
    for (let i = 0; i < 12; i++) x.fillRect(0, 16 + i * 16, 256, 1);
    return c;
  })();
  Mn.TOPBG = TOPBG;
  function topCard(T, title) {
    T.drawImage(TOPBG, 0, 0);
    T.fillStyle = '#2c2f45'; T.fillRect(0, 0, 256, 18);
    G.text(T, title, 8, 3, '#fbf3dc', null);
  }
  Mn.topCard = topCard;

  // a monster's picture at its own pixel size, bottom-centred in a box (giants use their 80px card)
  function drawCard(T, id, x, y, w, h, img) {
    img = img || G.mons.card(id);
    T.drawImage(img, Math.round(x + (w - img.width) / 2), Math.round(y + h - img.height - 1));
  }
  Mn.drawCard = drawCard;

  // monster summary on the top screen
  function monSummary(T, mon, mode) {
    topCard(T, '몬스터 정보');
    if (!mon) return;
    const sp = D.MONS[mon.id], st = D.stats(mon);
    G.box(T, 6, 21, 84, 82, G.STYLE.white, 4);
    drawCard(T, mon.id, 6, 21, 84, 82);
    G.text(T, D.nameOf(mon), 96, 22, '#2c2f45', null);
    G.textR(T, 'Lv.' + mon.lv, 248, 22, '#2c2f45', null);
    let bx = 96;
    sp.t.forEach(t => { bx += typeBadge(T, t, bx, 39) + 3; });
    G.text(T, `HP ${Math.max(0, mon.hp)}/${st.hp}`, 96, 56, '#36363f', null);
    hpBar(T, 96, 72, 152, mon.hp / st.hp);
    const next = mon.lv >= 100 ? 0 : D.expFor(mon.lv + 1) - mon.exp;
    G.textR(T, mon.hp <= 0 ? '기절' : mon.status ? D.STATUS[mon.status].n : '양호', 248, 56, mon.hp <= 0 ? '#b0403a' : mon.status ? '#7a3ab0' : '#5a5648', null);
    G.textR(T, '다음 Lv까지 ' + next, 248, 81, '#5a5648', null);
    if (mode === 'moves' || mode === undefined) {
      mon.moves.forEach((mv, i) => {
        const m = D.MOVES[mv.id], y = 106 + i * 21;
        G.rrect(T, 6, y, 244, 19, 4, D.TYPE_DARK[m.t]);
        G.rrect(T, 7, y + 1, 242, 17, 3, '#fdfbf3');
        G.rrect(T, 8, y + 2, 4, 15, 1, D.TYPE_COL[m.t]);
        G.text(T, m.n, 16, y + 3, '#36363f', null);
        G.text(T, m.t, 112, y + 3, D.TYPE_DARK[m.t], null);
        G.text(T, m.p ? '위력' + m.p + (m.hits ? '×' + (Array.isArray(m.hits) ? m.hits.join('~') : m.hits) : '') : '변화', 146, y + 3, '#5a5648', null);
        G.textR(T, `PP${mv.pp}/${m.pp}`, 246, y + 3, '#5a5648', null);
      });
    }
    if (mode === 'stats') {
      [['공격', st.atk], ['방어', st.def], ['특수공격', st.spa], ['특수방어', st.spd], ['스피드', st.spe]].forEach(([k, v], i) => {
        G.text(T, k, 14, 108 + i * 16, '#36363f', null); G.textR(T, v, 120, 108 + i * 16, '#2c2f45', null);
      });
      if (sp.evo) {
        G.text(T, '진화 조건', 150, 108, '#36363f', null);
        G.textR(T, D.evoText(sp.evo), 246, 124, '#2c2f45', null);
        if (D.levelEvoReady(mon)) G.textR(T, '도감에서 진화 가능', 246, 140, '#2c7a3a', null);
      }
    }
  }
  Mn.monSummary = monSummary;

  // ------------------------------------------------------------ party screen
  // mode: 'view' | 'battle' (forced: cannot cancel) | 'item' (pick a target) ; returns index or -1
  Mn.party = (o) => new Promise(res => {
    o = o || {};
    const party = G.S.party;
    const L = { modal: true, sel: o.start || 0, swap: -1 };
    const finish = i => { G.popLayer(L); res(i); };
    L.update = () => {
      const n = party.length;
      const mv = v => { if (v !== L.sel && v >= 0 && v < n) { L.sel = v; G.audio && G.audio.sfx('move'); } };
      if (G.rep('up')) mv(L.sel - 2);
      if (G.rep('down')) mv(L.sel + 2);
      if (G.rep('left')) mv(L.sel % 2 ? L.sel - 1 : L.sel);
      if (G.rep('right')) mv(L.sel % 2 ? L.sel : L.sel + 1);
      if (G.hit('a')) { G.audio && G.audio.sfx('select'); finish(L.sel); }
      if (G.hit('b') && !o.forced) { G.audio && G.audio.sfx('cancel'); finish(-1); }
    };
    L.drawTop = T => monSummary(T, party[L.sel], o.topMode);
    L.drawBot = B => {
      header(B, o.title || '몬스터', o.sub);
      party.forEach((mon, i) => {
        const x = 6 + (i % 2) * 124, y = 26 + Math.floor(i / 2) * 44;
        const sel = i === L.sel;
        const st = D.stats(mon);
        G.rrect(B, x, y, 120, 41, 5, sel ? '#2c2f45' : '#8a8270');
        G.rrect(B, x + 1, y + 1, 118, 39, 4, mon.hp <= 0 ? '#f2d6d0' : sel ? '#fff4cf' : '#fdfbf3');
        B.drawImage(G.mons.icon(mon.id), x + 2, y + 4);
        G.text(B, D.nameOf(mon), x + 34, y + 4, '#36363f', null);
        G.textR(B, 'Lv' + mon.lv, x + 116, y + 4, '#5a5648', null);
        hpBar(B, x + 34, y + 21, 82, Math.max(0, mon.hp) / st.hp);
        const mk = o.mark ? o.mark(mon) : null;
        if (mk) G.text(B, mk, x + 34, y + 27, '#2c7a3a', null);
        else {
          G.text(B, mon.hp <= 0 ? '기절' : mon.status ? D.STATUS[mon.status].short : '', x + 34, y + 27, '#b0403a', null);
          G.textR(B, `${Math.max(0, mon.hp)}/${st.hp}`, x + 116, y + 27, '#5a5648', null);
        }
        G.addHot({ x, y, w: 120, h: 41, onTap: () => { L.sel = i; G.audio && G.audio.sfx('select'); finish(i); } });
      });
      if (!o.forced) G.button(B, 80, 166, 96, 22, '돌아가기', { onTap: () => { G.audio && G.audio.sfx('cancel'); finish(-1); } });
      else G.textC(B, o.hint || '내보낼 몬스터를 고르세요', 128, 170, '#5a5648', null);
    };
    G.pushLayer(L);
  });

  async function partyMenu() {
    let start = 0;
    for (;;) {
      if (!G.S.party.length) return;
      const i = await Mn.party({ start });
      if (i < 0) return;
      start = i;
      const mon = G.S.party[i];
      const c = await G.choose(['기술 보기', '능력치 보기', '순서 바꾸기', '돌아가기'], { title: D.nameOf(mon), cancel: 3 });
      if (c === 0 || c === 1) await viewMon(mon, c === 0 ? 'moves' : 'stats');
      if (c === 2) {
        const j = await Mn.party({ start: i, title: '어느 몬스터와 바꿀까요?' });
        if (j >= 0 && j !== i) { const p = G.S.party; [p[i], p[j]] = [p[j], p[i]]; start = j; G.audio && G.audio.sfx('select'); }
      }
    }
  }
  Mn.partyMenu = partyMenu;
  function viewMon(mon, mode) {
    return new Promise(res => {
      const L = { modal: true, mode };
      L.update = () => {
        if (G.hit('left') || G.hit('right')) L.mode = L.mode === 'moves' ? 'stats' : 'moves';
        if (G.hit('a') || G.hit('b')) { G.popLayer(L); res(); }
      };
      L.drawTop = T => monSummary(T, mon, L.mode);
      L.drawBot = B => {
        header(B, D.nameOf(mon), '도감 No.' + String(D.MONS[mon.id].no).padStart(3, '0'));
        const lines = G.wrap(D.MONS[mon.id].dex, 228);
        lines.forEach((ln, i) => G.text(B, ln, 14, 32 + i * 16, '#36363f', null));
        G.button(B, 14, 132, 110, 26, '기술', { sel: L.mode === 'moves', onTap: () => { L.mode = 'moves'; } });
        G.button(B, 132, 132, 110, 26, '능력치', { sel: L.mode === 'stats', onTap: () => { L.mode = 'stats'; } });
        G.button(B, 80, 166, 96, 22, '돌아가기', { onTap: () => { G.popLayer(L); res(); } });
      };
      G.pushLayer(L);
    });
  }
  Mn.viewMon = viewMon;

  // ------------------------------------------------------------ bag
  // returns {id, target} or null. inBattle limits to usable items
  const POCKET = { heal: '회복 주머니', ball: '큐브 주머니', tool: '도구 주머니', stone: '광물 주머니', tm: '교본 주머니', key: '중요한 물건', secret: '비밀 주머니' };
  const descOf = it => typeof it.desc === 'function' ? it.desc() : it.desc;
  Mn.descOf = descOf;
  const inPocket = c => Object.keys(G.S.bag).filter(id => G.S.bag[id] > 0 && D.ITEMS[id] && D.ITEMS[id].cat === c);
  Mn.bag = async (o) => {
    o = o || {};
    let cat = o.cat || 'heal';
    for (;;) {
      // the secret pouch only exists once something is in it
      const order = ['heal', 'ball'].concat(['tool', 'stone', 'tm', 'key', 'secret'].filter(c => inPocket(c).length));
      if (!order.includes(cat)) cat = 'heal';
      const next = order[(order.indexOf(cat) + 1) % order.length];
      const ids = inPocket(cat);
      const items = ids.map(id => ({ label: D.ITEMS[id].n, right: '×' + G.S.bag[id], color: cat === 'secret' ? '#6a3a8a' : undefined }));
      items.push({ label: '▶ ' + POCKET[next], color: '#2c5ea8' });
      const i = await G.list(items, {
        title: '가방', sub: POCKET[cat],
        top: (T, s) => {
          topCard(T, '가방');
          G.text(T, '돈  ' + G.S.money.toLocaleString() + '원', 10, 26, '#2c2f45', null);
          if (s >= 0 && s < ids.length) {
            const it = D.ITEMS[ids[s]];
            G.box(T, 6, 112, 244, 72, G.STYLE.white, 5);
            G.text(T, it.n, 14, 118, '#2c2f45', null);
            G.wrap(descOf(it), 226).slice(0, 3).forEach((ln, k) => G.text(T, ln, 14, 138 + k * 16, '#36363f', null));
            T.drawImage(A[it.icon] || A.medicine, 200, 40, 32, 32);
          }
        }
      });
      if (i < 0) return null;
      if (i === ids.length) { cat = next; continue; }
      const id = ids[i], it = D.ITEMS[id];
      if (o.battle && !['heal', 'ball'].includes(it.cat)) { await G.say('지금은 쓸 수 없다!'); continue; }
      if (it.cat === 'key') {
        if (it.map) { await G.field.worldMap(); continue; }
        if (it.rod) {
          const W = G.world, p = W.player, st = W.map.tile(p.x, p.y), [dx, dy] = W.DIRS[p.dir], ft = W.map.tile(p.x + dx, p.y + dy);
          if (st && st.fish && ft && ft.water) { G.closeAll && G.closeAll(); return { field: () => G.field.fish() }; }
          await G.say('낚시 둔덕에서 물을 바라보고 써야 한다.'); continue;
        }
        await G.say(descOf(it)); continue;
      }
      if (it.cat === 'tool') {
        if (it.rope) {
          if (!G.field.ropeOK()) { await G.say('동굴 안에서만 쓸 수 있다.'); continue; }
          return { field: () => G.field.rescue(true) };
        }
        continue;
      }
      if (it.cat === 'tm') {
        if (!G.S.party.length) { await G.say('아직 함께하는 몬스터가 없다.'); continue; }
        const mv = it.tm, MV = D.MOVES[mv];
        const t = await Mn.party({ title: MV.n + ' 누구에게?', topMode: 'moves', mark: m => m.moves.some(x => x.id === mv) ? '이미 알고 있음' : D.canTM(m, mv) ? '배울 수 있음' : '배울 수 없음' });
        if (t < 0) continue;
        const mon = G.S.party[t];
        if (mon.moves.some(x => x.id === mv)) { await G.say(`${G.eun(D.nameOf(mon))} 이미 ${G.eul(MV.n)} 알고 있다.`); continue; }
        if (!D.canTM(mon, mv)) { await G.say(`${G.eun(D.nameOf(mon))} ${G.eul(MV.n)} 배우기 어려워 보인다.`); continue; }
        await G.battle.learnMove(mon, mv);
        continue;
      }
      if (it.cat === 'ball') {
        if (!o.battle) { await G.say('지금은 쓸 수 없다. 야생 몬스터와 싸울 때 던져 보자!'); continue; }
        if (!o.wild) { await G.say('남의 몬스터는 큐브에 담을 수 없다!'); continue; }
        if (it.owner && !(await G.isOwner())) { await G.say(`${G.iga(it.n)} 꿈쩍도 하지 않는다...\n주인이 아니면 쓸 수 없는 것 같다.`); continue; }
        return { id };
      }
      if (!G.S.party.length) { await G.say('아직 함께하는 몬스터가 없다.'); continue; }
      if (it.stone) {
        if (o.battle) { await G.say('지금은 광물을 대 볼 여유가 없다!'); continue; }
        const reacts = m => { const e = D.MONS[m.id].evo; return e && e.item === id; };
        const t = await Mn.party({ title: G.eul(it.n) + ' 누구에게?', topMode: 'stats', mark: m => reacts(m) ? '울림에 반응!' : '' });
        if (t < 0) continue;
        await Mn.applyItem(id, G.S.party[t]);
        continue;
      }
      if (it.lvup) {
        if (o.battle) { await G.say('싸우는 중에는 먹일 틈이 없다!'); continue; }
        // stay on the party screen so the same monster can be fed again and again
        let t = 0;
        while (G.S.bag[id] > 0) {
          t = await Mn.party({ title: G.eul(it.n) + ' 누구에게?', sub: '×' + G.S.bag[id], topMode: 'stats', start: t });
          if (t < 0) break;
          await Mn.applyItem(id, G.S.party[t]);
        }
        continue;
      }
      const t = await Mn.party({ title: G.eul(it.n) + ' 누구에게?', topMode: 'moves' });
      if (t < 0) continue;
      const mon = G.S.party[t];
      const r = await Mn.applyItem(id, mon);
      if (r && o.battle) return { id, target: t, done: true };
    }
  };
  // apply a healing item; returns true if used
  Mn.applyItem = async (id, mon) => {
    const it = D.ITEMS[id], st = D.stats(mon), name = D.nameOf(mon);
    if (it.revive) {
      if (mon.hp > 0) { await G.say('기절하지 않은 몬스터에게는 쓸 수 없다.'); return false; }
      D.useItem(id); mon.hp = Math.floor(st.hp * it.revive); mon.status = null;
      G.audio && G.audio.sfx('heal'); await G.say(`${G.iga(name)} 기운을 차렸다!`); return true;
    }
    if (it.stone) {
      const e = D.MONS[mon.id].evo;
      if (!e || e.item !== id) {
        // a later form of this line reacts: say what has to happen first (the stone is never used up)
        let cur = mon.id, ce = e, steps = [];
        while (ce && ce.item !== id) { steps.push(ce); cur = ce.to; ce = D.MONS[cur].evo; }
        if (ce && ce.item === id && steps.length) {
          const s0 = steps[0];
          await G.say(`${G.eul(it.n)} 대 보았지만 아직 반응하지 않는다.\n${G.eun(name)} ${s0.lv ? 'Lv.' + s0.lv + '에 ' : ''}${G.ro(D.MONS[s0.to].n)} 자란 뒤에 ${G.iga(it.n)} 반응한다고 한다.`);
        } else await G.say(`${G.eul(it.n)} 대 보았지만...\n${G.eun(name)} 아무 반응이 없다. (${it.n}은 그대로 남아 있다)`);
        return false;
      }
      const ok = await G.battle.stoneEvolve(mon, id);
      if (ok) D.useItem(id);   // used up only when the evolution really happened
      return ok;
    }
    if (mon.hp <= 0) { await G.say('기절한 몬스터에게는 쓸 수 없다.'); return false; }
    if (it.lvup) {
      if (mon.lv >= 100) { await G.say(`${G.eun(name)} 이미 Lv.100이다. 더 이상 레벨이 오르지 않는다.`); return false; }
      D.useItem(id);
      await G.battle.feedLevel(mon);
      return true;
    }
    if (it.heal) {
      if (mon.hp >= st.hp) { await G.say('체력이 이미 가득하다.'); return false; }
      D.useItem(id); const before = mon.hp; mon.hp = Math.min(st.hp, mon.hp + it.heal);
      G.audio && G.audio.sfx('heal'); await G.say(`${name}의 체력이 ${mon.hp - before} 회복되었다!`); return true;
    }
    if (it.cure) {
      if (mon.status !== it.cure) { await G.say('효과가 없을 것 같다.'); return false; }
      D.useItem(id); mon.status = null;
      G.audio && G.audio.sfx('heal'); await G.say(`${name}의 ${D.STATUS[it.cure].n} 상태가 나았다!`); return true;
    }
    return false;
  };

  // ------------------------------------------------------------ dex
  // a kind that is not caught yet shows only its black silhouette; the picture appears once it is caught
  const DEXSIL = '#1c1c26';
  // the owner (the designer) can flip on a preview that shows every entry without touching the save
  function dexInfo(id) {
    const sp = D.MONS[id], o = D.origin(id);
    if (o) return o.item ? `${D.MONS[o.from].n}에게 ${D.ITEMS[o.item].n}` : o.res ? `${D.MONS[o.from].n} Lv.${o.lv} + 공명 조율 (세 번째 배지·잎향 공명연구소)` : `${D.MONS[o.from].n} Lv.${o.lv}에 진화`;
    return sp.hab ? '서식: ' + sp.hab : '';
  }
  function dexTop(T, id, preview) {
    topCard(T, preview ? '도감 · 디자이너 미리보기' : '도감');
    if (!id) {
      G.box(T, 6, 24, 244, 72, G.STYLE.white, 5);
      G.text(T, '아루 대륙 몬스터 도감', 14, 32, '#2c2f45', null);
      G.text(T, `발견 ${Object.keys(G.S.dex.seen).filter(k => D.MONS[k] && !D.MONS[k].hidden).length}  ·  포획 ${D.dexCount()}  /  ${D.DEX.length}`, 14, 54, '#5a5648', null);
      G.wrap('미리보기는 디자이너만 볼 수 있어요. 기록(발견·포획)은 바뀌지 않아요.', 226).forEach((ln, k) => G.text(T, ln, 14, 112 + k * 16, '#6a3a8a', null));
      return;
    }
    const sp = D.MONS[id], seen = preview || G.S.dex.seen[id], caught = preview || G.S.dex.caught[id];
    G.box(T, 6, 24, 84, 84, G.STYLE.white, 4);
    drawCard(T, id, 6, 24, 84, 84, caught ? null : G.mons.silhouette(id, 'card', DEXSIL));
    G.text(T, `No.${String(sp.no).padStart(3, '0')}  ${seen ? sp.n : '???'}`, 98, 26, '#2c2f45', null);
    if (seen) { let bx = 98; sp.t.forEach(t => { bx += typeBadge(T, t, bx, 44) + 3; }); }
    const info = seen ? dexInfo(id) : '';
    if (info) G.wrap(info, 150).slice(0, 2).forEach((ln, k) => G.text(T, ln, 98, 64 + k * 15, '#5a5648', null));
    if (preview) { const mn = G.mons.mini(id); T.drawImage(Math.floor(G.frame / 40) % 2 ? mn.right : mn.left, 222, 80); }
    if (preview && !G.mons.has(id)) G.text(T, '도트 작업 대기 (시안 필요)', 98, 94, '#b0403a', null);
    G.box(T, 6, 114, 244, 72, G.STYLE.white, 5);
    const txt = caught ? sp.dex : seen ? '잡으면 자세한 정보를 볼 수 있다.' : '아직 만나지 못한 몬스터.';
    G.wrap(txt, 226).forEach((ln, k) => G.text(T, ln, 14, 122 + k * 16, '#36363f', null));
  }
  // a kind caught for the first time: its dex card turns from the black silhouette into the full picture
  Mn.dexReveal = id => new Promise(res => {
    const sp = D.MONS[id], no = String(sp.no).padStart(3, '0');
    const HOLD = 36, FLASH = 12, READY = HOLD + FLASH + 14;
    let t = 0;
    const L = { modal: true };
    L.update = () => {
      t++;
      if (t === HOLD) { G.audio && G.audio.sfx('sparkle'); G.audio && G.audio.cry(id); }
      if (t > READY && (G.hit('a') || G.hit('b'))) { G.popLayer(L); G.audio && G.audio.sfx('select'); res(); }
    };
    L.drawTop = T => {
      topCard(T, '도감 등록');
      const shown = t >= HOLD;
      G.disc(T, 128, 104, shown ? 74 : 66, shown ? 'rgba(255,248,214,0.85)' : 'rgba(255,255,255,0.55)');
      const img = shown ? G.mons.card(id) : G.mons.silhouette(id, 'card', DEXSIL);
      const bob = shown ? 0 : Math.round(Math.sin(t / 6));
      T.drawImage(img, 128 - img.width, 184 - img.height * 2 + bob, img.width * 2, img.height * 2);
      if (shown) for (let i = 0; i < 10; i++) {
        const a = i * 0.63 + t * 0.03, r = 62 + (i % 3) * 9, k = (t + i * 7) % 24 < 12;
        T.fillStyle = k ? '#ffe85a' : '#ffffff';
        const x = Math.round(128 + Math.cos(a) * r), y = Math.round(104 + Math.sin(a) * r * 0.75);
        T.fillRect(x - 1, y, 3, 1); T.fillRect(x, y - 1, 1, 3);
      }
      if (t >= HOLD && t < HOLD + FLASH) { T.fillStyle = `rgba(255,255,255,${(1 - (t - HOLD) / FLASH).toFixed(2)})`; T.fillRect(0, 0, 256, 192); }
    };
    L.drawBot = B => {
      header(B, '도감 등록', 'No.' + no);
      if (t < HOLD) { G.textC(B, '새로운 몬스터를 도감에 기록하는 중...', 128, 86, '#5a5648', null); return; }
      G.text(B, sp.n, 14, 30, '#2c2f45', null);
      let bx = 14 + Math.ceil(G.tw(sp.n)) + 8; sp.t.forEach(ty => { bx += typeBadge(B, ty, bx, 32) + 3; });
      const head = G.wrap(`${sp.n}의 정보가 도감에 새로 기록되었다!`, 228);
      head.forEach((ln, k) => G.text(B, ln, 14, 50 + k * 16, '#2c7a3a', null));
      const y0 = 50 + head.length * 16 + 8;
      G.wrap(sp.dex || '', 228).slice(0, Math.floor((164 - y0) / 16)).forEach((ln, k) => G.text(B, ln, 14, y0 + k * 16, '#36363f', null));
      if (t > READY) G.textC(B, 'A 버튼으로 계속', 128, 172, '#8a8270', null);
      G.addHot({ x: 0, y: 0, w: 256, h: 192, onTap: () => { G.pressed.a = 1; } });
    };
    G.pushLayer(L);
  });
  Mn.dex = async () => {
    const ids = D.DEX;
    const owner = await G.isOwner();
    let preview = owner && G.S.settings.dexPreview === true, start = owner ? 1 : 0;   // off unless the designer turns it on
    for (;;) {
      const head = owner ? [{ label: preview ? '◆ 디자이너 미리보기  켜짐' : '◇ 디자이너 미리보기  꺼짐', color: '#6a3a8a' }] : [];
      const off = head.length;
      const items = head.concat(ids.map(id => {
        const s = D.MONS[id], seen = preview || G.S.dex.seen[id], caught = G.S.dex.caught[id];
        return { label: `${String(s.no).padStart(3, '0')}  ${seen ? s.n : '???'}`, right: caught ? '포획' : G.S.dex.seen[id] ? '발견' : '', color: caught || preview ? '#2c2f45' : seen ? '#5a5648' : '#9a968c' };
      }));
      const i = await G.list(items, {
        title: '몬스터 도감', sub: `발견 ${Object.keys(G.S.dex.seen).filter(k => D.MONS[k] && !D.MONS[k].hidden).length} · 포획 ${D.dexCount()}`, start,
        top: (T, s) => dexTop(T, s >= off ? ids[s - off] : null, preview)
      });
      if (i < 0) return;
      if (i < off) { preview = !preview; G.S.settings.dexPreview = preview; start = 0; continue; }
      start = i;
      const id = ids[i - off];
      if (preview || G.S.dex.seen[id]) G.audio && G.audio.cry(id);
      // evolution menu: a stopped level evolution can be tried again while the level holds
      const ready = G.S.party.filter(m => m.id === id && D.levelEvoReady(m));
      if (ready.length) {
        const to = D.MONS[id].evo.to;
        const ok = await G.ask(`${D.MONS[id].n} ${ready.length}마리가 ${G.ro(D.MONS[to].n)} 진화할 수 있다.\n지금 진화시킬까? (진화 중 B 버튼으로 멈출 수 있다)`, ['진화시키기', '그만두기']);
        if (ok) {
          let k = 0;
          if (ready.length > 1) { const j = await Mn.party({ title: '누구를 진화시킬까?', topMode: 'stats', mark: m => ready.includes(m) ? '진화 가능' : '' }); if (j < 0 || !ready.includes(G.S.party[j])) continue; k = ready.indexOf(G.S.party[j]); }
          await G.battle.levelEvolve(ready[k]);
        }
      }
    }
  };

  // ------------------------------------------------------------ settings & save
  Mn.saveGame = () => {
    try { localStorage.setItem('geumo_save_v1', JSON.stringify(G.S)); return true; } catch (e) { return false; }
  };
  // ------------------------------------------------------------ 비밀 주문 — typed into the save-code box
  // only a hash of each spell is kept, so reading the source doesn't give it away
  const spellHash = s => [...s].reduce((h, ch) => (Math.imul(h, 131) + ch.codePointAt(0)) >>> 0, 7);
  const SPELLS = { 4253758596: 'candy', 1860923197: 'cube' };
  // one swing fills the pouch (up to the bag limit of 99)
  const GIFTS = { candy: { id: 'candy', per: 99 }, cube: { id: 'mastercube', per: 99, owner: true } };
  Mn.trySpell = async v => {
    const g = GIFTS[SPELLS[spellHash(String(v).replace(/[\s!.,~?…'"·]/g, ''))]];
    if (!g) return false;
    if (g.owner && !(await G.isOwner())) return false;   // anyone but the owner just gets "bad save code"
    const it = D.ITEMS[g.id];
    const n = Math.min(g.per, D.CANDY_MAX - (G.S.bag[g.id] || 0));
    if (n <= 0) { await G.say(`${G.iga(it.n)} 이미 가방에 가득하다!`); return true; }
    await ttukttak(n, String(v).trim().slice(0, 24), g.id);
    return true;
  };
  let nightBg = null;
  function nightBackdrop() {
    if (nightBg) return nightBg;
    const [c, x] = A.cv(256, 192);
    const g = x.createLinearGradient(0, 0, 0, 192);
    g.addColorStop(0, '#0c1030'); g.addColorStop(0.7, '#2a1f4e'); g.addColorStop(1, '#3a2a5a');
    x.fillStyle = g; x.fillRect(0, 0, 256, 192);
    const r = G.srng(11);
    for (let i = 0; i < 50; i++) { x.fillStyle = `rgba(255,246,214,${(0.25 + r() * 0.75).toFixed(2)})`; x.fillRect(Math.floor(r() * 256), Math.floor(r() * 130), 1, 1); }
    x.drawImage(A.moon, 202, 18, 24, 24);
    x.fillStyle = '#1a1430';
    for (let X = 0; X < 256; X++) { const h = Math.round(18 + Math.sin(X / 23) * 3 + Math.sin(X / 7 + 1) * 1.5); x.fillRect(X, 192 - h, 1, h); }
    return (nightBg = c);
  }
  // the goblin club knocks twice — 뚝! 딱! — and candies spill out
  async function ttukttak(n, spoken, itemId) {
    const it = D.ITEMS[itemId], spr = A[it.icon] || A.candy;
    const prev = G.scene;
    const rr = (a, b) => a + G.rand() * (b - a);
    const PX = 98, PY = 184, LEN = 58;           // club grip (pivot) and head distance
    const st = { a: -0.25, shake: 0, word: null, wt: 0, sparks: [], candies: [], got: false };
    const head = () => [PX + Math.sin(st.a) * LEN, PY - Math.cos(st.a) * LEN];
    const sc = {
      update() {
        st.wt++;
        if (st.shake > 0) st.shake--;
        for (const c of st.candies) {
          c.vy += 0.24; c.x += c.vx; c.y += c.vy;
          if (c.y > c.floor) { c.y = c.floor; c.vy = c.vy > 1.2 ? -c.vy * 0.42 : 0; c.vx *= 0.7; }
          if (c.x < 2 || c.x > 238) { c.vx = -c.vx; c.x = G.clamp(c.x, 2, 238); }
        }
        for (const p of st.sparks) { p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--; }
        st.sparks = st.sparks.filter(p => p.life > 0);
      },
      drawTop(T) {
        const sx = st.shake ? (st.shake % 4 < 2 ? 2 : -2) : 0;
        T.drawImage(nightBackdrop(), sx, 0);
        const cw = A.club.width * 2, ch = A.club.height * 2;
        T.save(); T.translate(PX + sx, PY); T.rotate(st.a); T.drawImage(A.club, -cw / 2, -ch + 4, cw, ch); T.restore();
        for (const p of st.sparks) { T.fillStyle = p.c; T.fillRect(Math.round(p.x) + sx, Math.round(p.y), 2, 2); }
        for (const c of st.candies) T.drawImage(spr, Math.round(c.x) + sx, Math.round(c.y));
        if (st.word && st.wt < 40) {
          const img = G.bigText(st.word, 3, '#fbe8a8'), sh = G.bigText(st.word, 3, '#5a2a18');
          const [hx, hy] = st.wordAt;
          const y = Math.round(hy - 52 - Math.min(8, st.wt / 2)), x = Math.round(G.clamp(hx - img.width / 2, 4, 252 - img.width));
          T.globalAlpha = st.wt > 28 ? (40 - st.wt) / 12 : 1;
          T.drawImage(sh, x + 2, y + 2); T.drawImage(img, x, y);
          T.globalAlpha = 1;
        }
      },
      drawBot(B) {
        header(B, '도깨비 방망이', '');
        G.textC(B, `"${spoken}"`, 128, 52, '#2c2f45', null);
        if (st.got) {
          B.drawImage(spr, 112, 80, 32, 32);
          G.textC(B, it.n + ' × ' + n, 128, 120, '#6a3a8a', null);
        }
        G.addHot({ x: 0, y: 22, w: 256, h: 170, onTap: () => { G.pressed.a = 1; } });
      }
    };
    await G.fadeTo(1, 10, '#000');
    G.scene = sc;
    G.audio && G.audio.jingle('secret');
    await G.fadeTo(0, 14);
    await G.wait(40);
    const swing = async (word, snd, last) => {
      await G.tween(16, k => { st.a = -0.25 - 0.85 * (1 - (1 - k) * (1 - k)); });   // wind up
      await G.wait(4);
      await G.tween(5, k => { st.a = -1.1 + 2.25 * k * k; });                        // strike
      st.shake = 12; st.word = word; st.wt = 0; st.wordAt = head();
      G.audio && G.audio.sfx(snd);
      const [hx, hy] = head();
      for (let i = 0; i < 16; i++) st.sparks.push({ x: hx, y: hy, vx: rr(-2.6, 2.6), vy: rr(-3.4, 0.4), life: G.ri(12, 26), c: G.pick(['#fbe8a8', '#f6c94a', '#ffffff', '#f49ac0']) });
      if (last) {
        for (let i = 0; i < n; i++) st.candies.push({ x: hx - 8 + rr(-4, 4), y: hy - 12, vx: rr(-3.4, 1.4), vy: rr(-6.5, -3.5), floor: 158 + G.ri(-3, 3) });
        G.audio && G.audio.sfx('sparkle');
      }
      await G.wait(last ? 10 : 18);
      await G.tween(10, k => { st.a = 1.15 - 1.4 * k; });                            // lift back
    };
    await swing('뚝!', 'knock');
    await swing('딱!', 'knock2', true);
    await G.wait(60);
    G.S.bag[itemId] = (G.S.bag[itemId] || 0) + n;
    st.got = true;
    G.audio && G.audio.sfx('item');
    await G.say(`${it.n} ${n}개를 받았다!\n가방 속 ${it.cat === 'secret' ? '비밀 주머니' : '큐브 주머니'}에 넣어 두었다.`);
    await G.fadeTo(1, 10, '#000');
    G.scene = prev;
    await G.fadeTo(0, 10);
  }

  Mn.encode = () => btoa(unescape(encodeURIComponent(JSON.stringify(G.S))));
  Mn.decode = s => { try { const o = JSON.parse(decodeURIComponent(escape(atob(s.trim())))); return o && o.party && o.flags ? o : null; } catch (e) { return null; } };
  Mn.settings = async () => {
    for (;;) {
      const s = G.S.settings;
      const spd = ['느림', '보통', '빠름'][s.text ?? 1];
      const tm = { real: '실제 시간', day: '항상 낮', night: '항상 밤' }[s.time || 'real'];
      const i = await G.list([
        { label: '글자 속도', right: spd },
        { label: '시간', right: tm },
        { label: '소리', right: s.sound ? '켬' : '끔' },
        { label: '지도 목표 안내', right: s.guide === false ? '끔' : '켬' },
        { label: '저장 코드 만들기' },
        { label: '저장 코드 불러오기' },
        { label: '처음부터 하기', color: '#b0403a' }
      ], {
        title: '설정', top: T => {
          topCard(T, '설정');
          const lines = ['시간: 실제 시계를 따라 낮과 밤이 바뀝니다.', '밤에만 나오는 몬스터도 있어요.', '', '저장 코드로 다른 기기에서 이어서', '할 수 있습니다.'];
          lines.forEach((ln, k) => G.text(T, ln, 12, 30 + k * 18, '#36363f', null));
        }
      });
      if (i < 0) return;
      if (i === 0) s.text = ((s.text ?? 1) + 1) % 3;
      if (i === 1) s.time = { real: 'day', day: 'night', night: 'real' }[s.time || 'real'];
      if (i === 2) { s.sound = !s.sound; G.audio && G.audio.setOn(s.sound); }
      if (i === 3) { s.guide = s.guide === false; continue; }
      if (i === 4) { Mn.saveGame(); await Mn.dialog({ msg: '아래 저장 코드를 복사해 두세요. 다른 기기의 설정 > 저장 코드 불러오기에 붙여 넣으면 이어서 할 수 있어요.', text: true, value: Mn.encode(), readOnly: true, copy: true, noCancel: true, okLabel: '닫기' }); }
      if (i === 5) {
        const v = await Mn.dialog({ msg: '저장 코드를 붙여 넣어 주세요. 지금 진행 상황은 덮어써집니다.', text: true, value: '' });
        if (v) {
          if (await Mn.trySpell(v)) continue;
          const o = Mn.decode(v);
          if (!o) { await G.say('저장 코드를 읽을 수 없어요. 코드 전체를 정확히 붙여 넣었는지 확인해 주세요.'); continue; }
          G.S = G.normalize(o); Mn.saveGame();
          await G.say('저장 코드를 불러왔어요!');
          G.world.enter(G.S.pos.map, G.S.pos.x, G.S.pos.y, G.S.pos.dir, { noEvents: true });
          return;
        }
      }
      if (i === 6) {
        const ok = await G.ask('정말 처음부터 할까요? 저장된 진행 상황이 모두 지워집니다.', ['처음부터 하기', '취소']);
        if (ok) { try { localStorage.removeItem('geumo_save_v1'); } catch (e) {} location.reload(); return; }
      }
    }
  };

  // ------------------------------------------------------------ start menu
  function fmtTime(sec) { const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60; return `${h}:${String(m).padStart(2, '0')}`; }
  Mn.fmtTime = fmtTime;
  Mn.BADGES = [['badge1', '산등', '#b8834e', '#f0d0a0'], ['badge2', '물울림', '#2a7890', '#86d4dc'], ['badge3', '등대', '#c49a2a', '#f6e27a'], ['badge4', '잎향', '#3f8a4a', '#a8e090'],
    ['badge5', '푸른숨', '#2a8a96', '#9ee4ea'], ['badge6', '돌바퀴', '#6a6458', '#d0c8b4']];
  function trainerCard(T) {
    topCard(T, '트레이너 카드');
    const S = G.S;
    G.box(T, 6, 24, 244, 160, G.STYLE.white, 6);
    const ch = A.charStand(S.char);
    T.drawImage(ch, 0, 0, 16, ch.height, 186, 38, 48, ch.height * 3);
    const BADGES = Mn.BADGES;
    const got = BADGES.filter(b => S.flags[b[0]]);
    const rows = [['이름', S.name], ['돈', S.money.toLocaleString() + '원'], ['도감', `${D.dexCount()}마리 포획`], ['플레이 시간', fmtTime(S.time || 0)],
      ['배지', !got.length ? '없음' : got.length <= 4 ? got.map(b => b[1]).join('·') : `${got.length}개 · ${got[got.length - 1][1]}까지`]];
    rows.forEach(([k, v], i) => { G.text(T, k, 18, 36 + i * 24, '#5a5648', null); G.text(T, v, 94, 36 + i * 24, '#2c2f45', null); });
    BADGES.forEach((b, i) => {
      const x = 112 + i * 23, y = 162;
      if (S.flags[b[0]]) { G.disc(T, x, y, 10, b[2]); G.disc(T, x, y, 8, b[3]); T.fillStyle = '#ffffff'; T.fillRect(x - 4, y - 5, 3, 2); }
      else { G.disc(T, x, y, 10, '#d8d0bc'); G.disc(T, x, y, 8, '#efe8d6'); }
    });
  }
  Mn.start = async () => {
    G.audio && G.audio.sfx('menu');
    for (;;) {
      const cave = G.field.inCave(), hasMap = G.field.hasMap();
      const all = [['dex', '도감'], ['party', '몬스터'], ['bag', '가방'], ['note', '수첩'], ['map', hasMap ? '지도' : '지도 없음'], ['save', '저장'], ['set', '설정'], ['rescue', '구조 요청'], ['close', '닫기']];
      const labels = all.filter(([k]) => k !== 'rescue' || cave);
      const n = labels.length;
      const L = { modal: true, sel: Math.min(Mn._startSel || 0, n - 1) };
      const pick = await new Promise(res => {
        const done = i => { G.popLayer(L); res(i); };
        L.update = () => {
          if (G.rep('left')) L.sel = (L.sel + n - 1) % n;
          if (G.rep('right')) L.sel = (L.sel + 1) % n;
          if (G.rep('up')) L.sel = (L.sel + n - 3) % n;
          if (G.rep('down')) L.sel = (L.sel + 3) % n;
          if (G.hit('a')) { G.audio && G.audio.sfx('select'); done(L.sel); }
          if (G.hit('b') || G.hit('start')) { G.audio && G.audio.sfx('cancel'); done(n - 1); }
        };
        L.drawTop = trainerCard;
        L.drawBot = B => {
          header(B, '메뉴', G.S.name);
          const COL = { dex: ['#f4e2a8', '#c49a2a'], party: ['#cfe6f6', '#4a88b8'], bag: ['#f6d4c4', '#c06a4a'], note: ['#e4f0d4', '#5a8a3a'], map: ['#f0e2b8', '#a8844a'],
            save: ['#d6efc8', '#5a9a4a'], set: ['#e4dcf4', '#8a7ab8'], rescue: ['#f6d8a8', '#c0782a'], close: ['#f4f1e6', '#a89f86'] };
          labels.forEach(([k, lb], i) => {
            const x = 10 + (i % 3) * 80, y = 26 + Math.floor(i / 3) * 54;
            G.button(B, x, y, 74, 48, lb, { sel: i === L.sel, color: COL[k][0], dark: COL[k][1], disabled: k === 'map' && !hasMap, onTap: () => { L.sel = i; G.audio && G.audio.sfx('select'); done(i); } });
          });
        };
        G.pushLayer(L);
      });
      Mn._startSel = pick;
      const k = labels[pick][0];
      if (k === 'dex') await Mn.dex();
      else if (k === 'party') { if (G.S.party.length) await partyMenu(); else await G.say('아직 몬스터가 없다.'); }
      else if (k === 'bag') { const r = await Mn.bag(); if (r && r.field) { await r.field(); return; } }
      else if (k === 'note') await G.field.notebook();
      else if (k === 'map') await G.field.worldMap();
      else if (k === 'save') {
        const ok = await G.ask('지금까지의 모험을 기록할까요?');
        if (ok) { const r = Mn.saveGame(); G.audio && G.audio.sfx(r ? 'save' : 'cancel'); await G.say(r ? `${G.S.name}${G.josa(G.S.name, '은', '는')} 모험을 꼼꼼히 기록했다!` : '이 브라우저에서는 저장할 수 없어요. 설정 > 저장 코드 만들기를 이용해 주세요.'); }
      }
      else if (k === 'set') await Mn.settings();
      else if (k === 'rescue') { if (await G.field.rescue(false)) return; }
      else return;
    }
  };

  // ------------------------------------------------------------ shop
  Mn.shop = async (stock) => {
    for (;;) {
      const items = stock.map(id => ({ label: D.ITEMS[id].n, right: D.ITEMS[id].price.toLocaleString() + '원' }));
      const i = await G.list(items, {
        title: '상점', sub: G.S.money.toLocaleString() + '원',
        top: (T, s) => {
          topCard(T, '상점');
          G.text(T, '가진 돈  ' + G.S.money.toLocaleString() + '원', 10, 26, '#2c2f45', null);
          const id = stock[s];
          if (!id) return;
          G.text(T, '가방에 ' + (G.S.bag[id] || 0) + '개', 10, 46, '#5a5648', null);
          G.box(T, 6, 112, 244, 72, G.STYLE.white, 5);
          G.text(T, D.ITEMS[id].n, 14, 118, '#2c2f45', null);
          G.wrap(descOf(D.ITEMS[id]), 226).slice(0, 3).forEach((ln, k) => G.text(T, ln, 14, 138 + k * 16, '#36363f', null));
        }, cancelLabel: '그만 사기'
      });
      if (i < 0) return;
      const id = stock[i], price = D.ITEMS[id].price;
      const maxN = Math.min(99, Math.floor(G.S.money / price));
      if (maxN < 1) { await G.say('돈이 모자란다.'); continue; }
      const n = await Mn.qty(D.ITEMS[id].n, price, maxN);
      if (n > 0) {
        G.S.money -= n * price; D.addItem(id, n);
        G.audio && G.audio.sfx('buy');
        await G.say(`${D.ITEMS[id].n} ${n}개를 샀다! 고맙습니다!`);
        if (id === 'cube' && n >= 10) { D.addItem('goldcube', 1); await G.say('큐브를 많이 사 주셔서 금빛 큐브를 하나 덤으로 드릴게요!'); }
      }
    }
  };
  Mn.qty = (name, price, maxN) => new Promise(res => {
    const L = { modal: true, n: 1 };
    const done = v => { G.popLayer(L); res(v); };
    L.update = () => {
      if (G.rep('up')) L.n = L.n >= maxN ? 1 : L.n + 1;
      if (G.rep('down')) L.n = L.n <= 1 ? maxN : L.n - 1;
      if (G.rep('right')) L.n = Math.min(maxN, L.n + 10);
      if (G.rep('left')) L.n = Math.max(1, L.n - 10);
      if (G.hit('a')) { G.audio && G.audio.sfx('select'); done(L.n); }
      if (G.hit('b')) { G.audio && G.audio.sfx('cancel'); done(0); }
    };
    L.drawBot = B => {
      header(B, name + ' 몇 개?', G.S.money.toLocaleString() + '원');
      G.box(B, 48, 44, 160, 60, G.STYLE.white, 6);
      G.textC(B, '×' + L.n, 128, 54, '#2c2f45', null);
      G.textC(B, (L.n * price).toLocaleString() + '원', 128, 76, '#5a5648', null);
      G.button(B, 14, 50, 30, 48, '−', { onTap: () => { L.n = L.n <= 1 ? maxN : L.n - 1; } });
      G.button(B, 212, 50, 30, 48, '+', { onTap: () => { L.n = L.n >= maxN ? 1 : L.n + 1; } });
      G.button(B, 28, 118, 96, 30, '사기', { color: '#d6efc8', dark: '#5a9a4a', onTap: () => done(L.n) });
      G.button(B, 132, 118, 96, 30, '취소', { onTap: () => done(0) });
    };
    G.pushLayer(L);
  });

  // ------------------------------------------------------------ storage box (PC)
  Mn.box = async () => {
    await G.say(`${G.S.name}${G.josa(G.S.name, '은', '는')} 컴퓨터를 켰다.\n몬스터 보관함에 접속했다!`);
    for (;;) {
      const c = await G.choose(['몬스터 맡기기', '몬스터 데려오기', '끄기'], { title: '몬스터 보관함', sub: `보관 ${G.S.box.length}마리`, cancel: 2 });
      if (c === 2) return;
      if (c === 0) {
        if (G.S.party.length <= 1) { await G.say('마지막 몬스터는 맡길 수 없다!'); continue; }
        const i = await Mn.party({ title: '어느 몬스터를 맡길까요?' });
        if (i < 0) continue;
        const alive = G.S.party.filter((m, k) => k !== i && m.hp > 0).length;
        if (!alive) { await G.say('싸울 수 있는 몬스터가 한 마리는 있어야 한다!'); continue; }
        const [m] = G.S.party.splice(i, 1); D.healMon(m); G.S.box.push(m);
        await G.say(`${G.eul(D.nameOf(m))} 보관함에 맡겼다.`);
      }
      if (c === 1) {
        if (!G.S.box.length) { await G.say('보관함이 비어 있다.'); continue; }
        if (G.S.party.length >= 6) { await G.say('데리고 다닐 수 있는 몬스터는 6마리까지다.'); continue; }
        const i = await G.list(G.S.box.map(m => ({ label: D.nameOf(m), right: 'Lv' + m.lv, icon: G.mons.icon(m.id) })), {
          title: '보관함', rowH: 30, top: (T, s) => monSummary(T, G.S.box[s])
        });
        if (i < 0) continue;
        const [m] = G.S.box.splice(i, 1); G.S.party.push(m);
        await G.say(`${G.eul(D.nameOf(m))} 데려왔다!`);
      }
    }
  };

  // ------------------------------------------------------------ healing (center / mom)
  Mn.heal = async () => {
    G.audio && G.audio.sfx('heal');
    await G.fadeTo(0.6, 16, '#ffffff');
    D.healParty();
    G.audio && G.audio.jingle('heal');
    await G.wait(70);
    await G.fadeTo(0, 16);
  };

  // in-menu flag used by core to make Enter confirm inside menus
  G.inMenuLike = () => G.layers.length > 0;
})();

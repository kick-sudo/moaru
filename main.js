/* 모아루: 잠든 길의 노래 — boot, title, new game, ending, saving */
'use strict';
(function () {
  const G = window.G, D = G.data, A = G.art;
  const SAVE_KEY = 'geumo_save_v1';

  G.newState = (name, char) => ({
    v: 2, name, char, money: 1500, party: [], box: [], bag: {}, flags: {},
    dex: { seen: {}, caught: {} }, time: 0, steps: 0, graceSteps: 0,
    pos: { map: 'home', x: 7, y: 2, dir: 'down' },
    healPoint: { map: 'home', x: 6, y: 5, dir: 'up' },
    settings: { text: 1, time: 'real', sound: true, run: false }
  });
  G.normalize = o => {
    const base = G.newState(o.name || '한결', o.char || 'boy');
    const out = Object.assign(base, o);
    out.settings = Object.assign(base.settings, o.settings || {});
    out.dex = Object.assign({ seen: {}, caught: {} }, o.dex || {});
    out.flags = o.flags || {};
    out.bag = Object.assign({}, o.bag || {});
    const REN = { gourd: 'cube', goldgourd: 'goldcube' };   // v1 saves carried gourds
    for (const k in REN) if (out.bag[k]) { out.bag[REN[k]] = (out.bag[REN[k]] || 0) + out.bag[k]; delete out.bag[k]; }
    for (const k of Object.keys(out.bag)) if (!D.ITEMS[k] || !(out.bag[k] > 0)) delete out.bag[k];
    out.party = (o.party || []).filter(m => m && D.MONS[m.id]);
    out.box = (o.box || []).filter(m => m && D.MONS[m.id]);
    // saves from the first draft world: companions, bag and dex stay, the story restarts in 이슬마을
    if ((o.v || 1) < 2 && o.flags && o.flags.started) {
      out.v = 2;
      const st = out.party.concat(out.box).map(m => D.baseOf(m.id)).find(b => ['daram', 'bulguri', 'muldal'].includes(b));
      out.flags = { started: 1, starter: st || 'daram', prof_talk: 1, rival0: 1, rival_wait: 1, migrated: 1 };
      for (const k of Object.keys(out.bag)) if (['key', 'tm'].includes(D.ITEMS[k].cat)) delete out.bag[k];
      out.tiles = {}; out.boulders = {}; out.visited = {}; out.explored = {}; out.seenBarrier = {}; out.survey = null;
      out.pos = { map: 'lab', x: 6, y: 5, dir: 'up' };
      out.healPoint = base.healPoint;
    }
    if (!G.MAPS[out.pos.map]) out.pos = base.pos;
    return out;
  };
  function loadSave() {
    try { const s = localStorage.getItem(SAVE_KEY); if (!s) return null; const o = JSON.parse(s); return o && o.party ? G.normalize(o) : null; } catch (e) { return null; }
  }
  G.autosave = () => { if (G.S && G.S.flags.started) G.menus.saveGame(); };

  // ------------------------------------------------------------ title screen
  const BIGCACHE = {};
  function bigText(str, scale, col, shadow) {
    const key = str + scale + col;
    if (BIGCACHE[key]) return BIGCACHE[key];
    const w = Math.ceil(G.tw(str)) + 2;
    const [c, x] = A.cv(w, 16);
    G.text(x, str, 0, 1, col, shadow || null);
    // crisp the anti-aliased glyph edges
    const img = x.getImageData(0, 0, w, 16), d = img.data;
    for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 100 ? 255 : 0;
    x.putImageData(img, 0, 0);
    const [c2, x2] = A.cv(w * scale, 16 * scale);
    x2.imageSmoothingEnabled = false;
    x2.drawImage(c, 0, 0, w * scale, 16 * scale);
    return (BIGCACHE[key] = c2);
  }
  G.bigText = bigText;
  // dawn over the Aru continent: ridges, a calm waterway and the old road running to the horizon
  const titleBg = (() => {
    const [c, x] = A.cv(256, 192);
    const g = x.createLinearGradient(0, 0, 0, 130);
    g.addColorStop(0, '#1c2350'); g.addColorStop(0.45, '#5a4a86'); g.addColorStop(0.78, '#e48a7a'); g.addColorStop(1, '#f8d08a');
    x.fillStyle = g; x.fillRect(0, 0, 256, 192);
    const r = G.srng(11);
    for (let i = 0; i < 46; i++) { x.fillStyle = `rgba(255,248,230,${0.25 + r() * 0.6})`; x.fillRect(Math.floor(r() * 256), Math.floor(r() * 70), 1, 1); }
    // far ridges
    const ridge = (base, amp, f1, f2, col) => { x.fillStyle = col; for (let X = 0; X < 256; X++) { const h = base + Math.sin(X / f1) * amp + Math.sin(X / f2 + 2) * amp * 0.4; x.fillRect(X, 192 - h, 1, h); } };
    ridge(84, 10, 31, 11, '#6a5a8e');
    ridge(70, 9, 23, 7, '#4a4274');
    // meadow
    x.fillStyle = '#3a5a5a'; x.fillRect(0, 132, 256, 60);
    for (let Y = 132; Y < 192; Y += 2) { x.fillStyle = Y % 4 ? '#3e6260' : '#36564f'; x.fillRect(0, Y, 256, 1); }
    // the waterway: narrow at the horizon, wide at the front
    for (let Y = 124; Y < 192; Y++) {
      const t = (Y - 124) / 68, cx = 150 - Math.sin(t * 2.6) * 34 + t * 10, w = 6 + t * 70;
      x.fillStyle = Y % 3 ? '#8aa8d0' : '#a8c4e4'; x.fillRect(Math.round(cx - w / 2), Y, Math.round(w), 1);
    }
    // the old road along the bank
    for (let Y = 128; Y < 192; Y++) {
      const t = (Y - 128) / 64, cx = 92 - t * 60 + Math.sin(t * 3) * 8, w = 3 + t * 30;
      x.fillStyle = '#d8b88a'; x.fillRect(Math.round(cx - w / 2), Y, Math.round(w), 1);
      if (Y % 5 === 0) { x.fillStyle = '#b8966a'; x.fillRect(Math.round(cx - w / 4), Y, Math.max(1, Math.round(w / 6)), 1); }
    }
    // village lights on the far bank
    [[188, 122], [196, 121], [204, 123], [60, 124], [66, 125]].forEach(([X, Y]) => { x.fillStyle = '#ffe08a'; x.fillRect(X, Y, 2, 2); x.fillStyle = 'rgba(255,224,138,0.3)'; x.fillRect(X - 1, Y - 1, 4, 4); });
    return c;
  })();
  function titleScene(hasSave) {
    let t = 0;
    return {
      update() { t++; },
      drawTop(T) {
        T.drawImage(titleBg, 0, 0);
        // the great water monster rising from the calm waterway
        const big = G.mons.front('yongsot'), by = 92 + Math.round(Math.sin(t / 40) * 2);
        T.globalAlpha = 0.92; T.drawImage(G.mons.silhouette('yongsot', 'front', '#2a2a52'), 150, by + 2); T.globalAlpha = 1;
        T.drawImage(big, 148, by);
        T.fillStyle = '#8aa8d0'; T.fillRect(150, by + big.height - 12, 92, 2);
        for (let i = 0; i < 6; i++) { const k = (t / 50 + i / 6) % 1; T.fillStyle = `rgba(230,244,255,${1 - k})`; T.fillRect(160 + i * 13, by + big.height - 14 - k * 6, 2, 1); }
        // a young pathkeeper and a first companion on the road
        const hero = A.charStand('boy');
        T.drawImage(hero, 0, 0, 16, hero.height, 52, 150, 16, hero.height);
        const mini = G.mons.mini('daram').right;
        T.drawImage(mini, 66, 160);
        const title = bigText('모아루', 4, '#fff1c8');
        const sh = bigText('모아루', 4, '#3a2440');
        const tx = Math.round(128 - title.width / 2);
        T.drawImage(sh, tx + 3, 12 + 3); T.drawImage(title, tx, 12);
        const sub = bigText('잠든 길의 노래', 2, '#ffe2b0');
        const ssh = bigText('잠든 길의 노래', 2, '#3a2440');
        T.drawImage(ssh, Math.round(128 - sub.width / 2) + 2, 78 + 2); T.drawImage(sub, Math.round(128 - sub.width / 2), 78);
      },
      drawBot(B) {
        G.menus.header(B, '모아루: 잠든 길의 노래', '시안 빌드');
        if (hasSave) {
          G.button(B, 28, 34, 200, 40, `이어하기  (${hasSave.name} · ${G.menus.fmtTime(hasSave.time || 0)})`, { sel: G.titleSel === 0, color: '#f6d878', dark: '#c49a2a', onTap: () => G.titlePick(0) });
          G.button(B, 28, 84, 200, 34, '새로 시작', { sel: G.titleSel === 1, onTap: () => G.titlePick(1) });
        } else {
          G.button(B, 28, 50, 200, 46, '새로 시작', { sel: true, color: '#f6d878', dark: '#c49a2a', onTap: () => G.titlePick(1) });
        }
        G.textC(B, '화면을 누르면 소리가 켜져요', 128, 136, '#8a8270', null);
        G.textC(B, '글꼴: 갈무리 (SIL OFL 1.1)', 128, 160, '#a8a090', null);
      }
    };
  }
  async function title() {
    const save = loadSave();
    G.S = save || G.newState('한결', 'boy');
    G.titleSel = 0;
    G.scene = titleScene(save);
    G.audio.music('title');
    const pick = await new Promise(res => {
      G.titlePick = i => { G.audio.sfx('select'); res(i); };
      const L = { modal: true, update() {
        if (save && (G.rep('up') || G.rep('down'))) { G.titleSel ^= 1; G.audio.sfx('move'); }
        if (G.hit('a') || G.hit('start')) G.titlePick(save ? G.titleSel : 1);
      } };
      G.pushLayer(L);
      const done = res;
      G.titlePick = i => { G.popLayer(L); G.audio.sfx('select'); done(i); };
    });
    await G.fadeTo(1, 16);
    if (pick === 0 && save) {
      G.S = save;
      startWorld(true);
      await G.fadeTo(0, 16);
    } else {
      if (save) {
        G.scene = titleScene(null);
        await G.fadeTo(0, 8);
        const ok = await G.ask('새로 시작하면 이전 기록이 지워져요.\n정말 처음부터 할까요?', ['처음부터 하기', '돌아가기']);
        if (!ok) { await G.fadeTo(1, 8); return title(); }
        await G.fadeTo(1, 8);
      }
      await intro();
    }
  }

  // ------------------------------------------------------------ intro (연우 박사)
  async function intro() {
    let show = null;
    const scene = {
      drawTop(T) {
        T.drawImage(G.menus.TOPBG, 0, 0);
        G.disc(T, 128, 92, 54, 'rgba(227,178,60,0.18)');
        const prof = A.charStand('prof');
        T.drawImage(prof, 0, 0, 16, prof.height, 104, 22, 48, prof.height * 3);
        if (show) {
          const img = G.mons.front(show);
          T.drawImage(img, 168, 60);
        }
      },
      drawBot(B) { G.menus.header(B, '연우 박사', '길지기 연구소'); G.textC(B, 'A 버튼이나 화면을 눌러 계속', 128, 96, '#8a8270', null); }
    };
    G.scene = scene;
    G.audio.music('town');
    await G.fadeTo(0, 20);
    const N = '연우 박사';
    await G.say('반가워! 아루 대륙에 온 것을 환영한단다!', { name: N });
    await G.say('나는 연우. 이슬마을 길지기 연구소에서 길과 몬스터를 함께 연구하고 있지.', { name: N });
    show = 'daram'; G.audio.cry('daram');
    await G.say('이 대륙에는 몬스터라고 불리는 생물들이 사람과 함께 살아.\n옛날엔 사람과 몬스터가 함께 닦은 길이 대륙 끝까지 이어져 있었단다.', { name: N });
    await G.say('그런데 요즘 그 오래된 길들이 하나둘 잠들고 있어.\n숲길이 끊기고, 동굴의 울림이 흐트러지고, 물길이 막히지.', { name: N });
    show = null;
    await G.say('그 길을 다시 걷고 돌보는 사람을 길지기라고 부른단다.\n그럼 이제 너에 대해 알려 주겠니?', { name: N });
    const L = await G.say('너는 어떤 모습이니?', { name: N, keep: true });
    const look = await new Promise(res => {
      const C = { modal: true, sel: 0 };
      C.update = () => {
        if (G.rep('left') || G.rep('right')) { C.sel ^= 1; G.audio.sfx('move'); }
        if (G.hit('a')) { G.popLayer(C); G.audio.sfx('select'); res(C.sel); }
      };
      C.drawBot = B => {
        G.menus.header(B, '모습 고르기', '');
        ['boy', 'girl'].forEach((ch, i) => {
          const x = 20 + i * 116;
          G.button(B, x, 34, 100, 120, null, { sel: C.sel === i, onTap: () => { C.sel = i; G.popLayer(C); G.audio.sfx('select'); res(i); } });
          const fr = A.charStand(ch);
          B.drawImage(fr, 0, 0, 16, fr.height, x + 26, 44, 48, fr.height * 3);
          G.textC(B, i ? '소녀' : '소년', x + 50, 130, '#2e2c36', null);
        });
      };
      G.pushLayer(C);
    });
    G.closeText(L);
    const char = look ? 'girl' : 'boy';
    const def = look ? '금비' : '한결';
    await G.say('이름은 뭐라고 하니?', { name: N, auto: 30 });
    let nm = await G.menus.dialog({ msg: '이름을 알려 주세요 (최대 6글자)', input: true, value: def, max: 6, okLabel: '정했어요' });
    nm = (nm || def).replace(/\s+/g, '').slice(0, 6) || def;
    G.S = G.newState(nm, char);
    G.S.flags.started = 1;
    await G.say(`${nm}${G.josa(nm, '이', '')}구나! 좋은 이름이야.`, { name: N });
    await G.say(`${nm}, 오늘부터 우리 연구소의 견습 조사원이란다.\n동료와 함께 잠든 길을 깨우러 가 보자꾸나!`, { name: N });
    await G.fadeTo(1, 30);
    startWorld(false);
    await G.fadeTo(0, 20);
    await G.say(`${nm}${G.josa(nm, '은', '는')} 오늘따라 일찍 눈을 떴다.\n아래층에서 엄마가 부르는 소리가 들린다.`);
  }

  function startWorld(resume) {
    G.S.flags.started = 1;
    G.scene = G.world.scene;
    G.world.player.char = G.S.char;
    const p = G.S.pos;
    G.world.enter(p.map, p.x, p.y, p.dir, { noEvents: resume });
    G.autosave();
    if (G.S.flags.migrated) {
      delete G.S.flags.migrated;
      G.run(async () => {
        await G.say('게임 세계가 「모아루: 잠든 길의 노래」로 새로 꾸며졌어요.\n함께하던 동료와 가방, 도감 기록은 그대로 남아 있어요.');
        await G.say('이야기는 이슬마을 길지기 연구소에서 다시 시작돼요.\n연우 박사님께 말을 걸어 보세요!');
      });
    }
  }
  G.startWorld = startWorld;

  // ------------------------------------------------------------ chapter end (1장 끝)
  G.chapterEnd = async (ch) => {
    ch = ch || 1;
    await G.fadeTo(1, 30);
    const prev = G.scene;
    let t = 0;
    const n = G.S.name;
    const stats = [`플레이 시간  ${G.menus.fmtTime(G.S.time || 0)}`, `잡은 몬스터  ${D.dexCount()} / ${D.DEX.length}`, `배지  ${['badge1', 'badge2', 'badge3', 'badge4'].filter(k => G.S.flags[k]).length}개`];
    const lines = ch === 1 ? [
      '모아루: 잠든 길의 노래', '', '1장 · 잠든 길을 깨우다', '', '',
      `${n}${G.josa(n, '와', '과')} 동료들은`, '끊긴 숲길을 다시 잇고,', '달숨동굴의 울림을 되찾고,', '물울림의 수문을 되살렸다.', '',
      '하지만 새길상회의 공사는', '대륙 곳곳으로 이어지고 있다.', '', '', ...stats, '', '',
      '2장 · 돛바람항으로', '— 동쪽 수문이 열렸다 —', '', '', '', '글꼴: 갈무리 (Lee Minseo, SIL OFL 1.1)']
      : [
      '모아루: 잠든 길의 노래', '', '2장 · 바람과 향기의 길', '', '',
      `${n}${G.josa(n, '와', '과')} 동료들은`, '돛바람 등대에 불을 밝히고,', '바위울림터널의 물길을 되돌리고,', '기억나루의 옛길을 복원하고,', '잎향시의 온실에 숨을 돌려주었다.', '',
      '새길상회의 장비는 땅속 울림을 키워', '무언가를 찾고 있었다.', '그 흔적은 바다 건너 해안으로 이어진다.', '', '', ...stats, '', '',
      '3장 · 다음 해안으로', '— 다음 시안 빌드에서 이어집니다 —', '', '', '', '글꼴: 갈무리 (Lee Minseo, SIL OFL 1.1)'];
    const scene = {
      update() { t++; },
      drawTop(T) {
        T.drawImage(titleBg, 0, 0);
        const big = G.mons.front(ch === 1 ? 'yongsot' : 'joryubyeol');
        T.drawImage(big, 148, 92 + Math.sin(t / 25) * 3);
        T.fillStyle = 'rgba(10,8,20,0.45)'; T.fillRect(0, 0, 256, 192);
        const y0 = 196 - t * 0.35;
        lines.forEach((ln, i) => { const y = y0 + i * 16; if (y > -16 && y < 192) G.textC(T, ln, 128, y, i === 0 ? '#fbe8a8' : '#f4ead2', 'rgba(0,0,0,0.5)'); });
      },
      drawBot(B) {
        G.menus.header(B, '함께한 몬스터', G.S.name);
        G.S.party.forEach((m, i) => {
          const x = 10 + (i % 3) * 80, y = 30 + Math.floor(i / 3) * 70;
          G.box(B, x, y, 74, 64, G.STYLE.white, 5);
          B.drawImage(G.mons.icon(m.id), x + 21, y + 4);
          G.textC(B, D.nameOf(m), x + 37, y + 36, '#2c2f45', null);
          G.textC(B, 'Lv' + m.lv, x + 37, y + 49, '#5a5648', null);
        });
      }
    };
    G.scene = scene;
    G.audio.music('ending');
    await G.fadeTo(0, 30);
    const total = Math.ceil((196 + lines.length * 16) / 0.35);
    for (let i = 0; i < total; i++) { await G.wait(1); if (i > 120 && (G.hit('a') || G.hit('start'))) break; }
    await G.fadeTo(1, 30);
    G.scene = prev;
    G.audio.music(G.world.map.def.bgm || 'route');
    await G.fadeTo(0, 30);
    if (ch === 1) await G.say('1장 끝! 동쪽 수문이 열렸다. 갈대여울을 지나면 2장의 무대, 돛바람항이다.\n그 전에 [다시 가 볼 곳]을 둘러보거나 도감을 채워 볼 수도 있다.');
    else await G.say('2장은 여기까지! 다음 해안 이야기는 3장에서 이어져요.\n그동안 [다시 가 볼 곳]을 둘러보거나, 공명 조율·진화석으로 동료를 키워 볼 수 있어요.');
    const ok = await G.ask('지금까지의 모험을 기록할까요?');
    if (ok) { G.menus.saveGame(); G.audio.sfx('save'); await G.say('모험을 꼼꼼히 기록했다!'); }
  };
  G.ending = G.chapterEnd;

  // ------------------------------------------------------------ play time + autosave on map change
  setInterval(() => { if (G.S && G.S.flags && G.S.flags.started && G.scene !== null && !document.hidden) G.S.time = (G.S.time || 0) + 1; }, 1000);
  const enter0 = G.world.enter;
  G.world.enter = (...a) => { enter0(...a); G.autosave(); };
  addEventListener('visibilitychange', () => { if (document.hidden) G.autosave(); });

  // ------------------------------------------------------------ boot
  async function boot(data) {
    try {
      const ff = new FontFace('G11B', 'url(' + window.GALMURI11B + ')');
      await ff.load();
      document.fonts.add(ff);
    } catch (e) { console.warn('font', e); }
    await G.mons.load();
    G.isOwner();   // start asking early; the answer is needed only for the master cube
    G.layout();
    requestAnimationFrame(G.layout);
    G.start();
    window.claude?.hot?.snapshot?.(() => ({ save: G.S && G.S.flags && G.S.flags.started ? JSON.stringify(G.S) : null }));
    if (data && data.save) {
      try { G.S = G.normalize(JSON.parse(data.save)); G.audio.setOn(G.S.settings.sound); startWorld(true); return; } catch (e) {}
    }
    await title();
    G.audio.setOn(G.S.settings.sound);
  }
  window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data ?? {});
})();

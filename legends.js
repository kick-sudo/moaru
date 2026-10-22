/* 모아루: 잠든 길의 노래 — 금오·월백 (docs/planning/legend-stories)
   the two legends' records, the eight optional scenes LG_S01-08, the optional requests LQ01 「해를 등에 진 새」 and
   LQ02 「달빛에 남은 귀로」, the sanctuaries LGZ01 햇귀절벽 · LGZ02 월은못 with observation → (optional) battle /
   capture → retry, the legend page of the dex, the 전설 기록 tab of the notebook and the encounter light effects.
   Nothing here writes a main-story flag (q00-q33, badges, ch*_end); the main path never waits on a legend. */
'use strict';
(function () {
  const G = window.G, D = G.data;
  const Lg = G.legend = {};
  const W = () => G.world, F = () => G.field;
  const flag = k => !!(G.S && G.S.flags[k]);
  const say = (t, name) => G.say(t, name ? { name } : undefined);
  const sfx = n => G.audio && G.audio.sfx(n);
  const P = () => G.S.name;
  const nm = id => D.MONS[id].n;

  // ------------------------------------------------------------ the record: G.S.legends (everything starts undiscovered)
  // per legend: heard (a story / record), trace (a sign it left), sighted (seen with your own eyes), named (its name is
  // known), observed (the sanctuary observation = the request's story is complete), trialReady (it waits at its sanctuary
  // and can be challenged), captured (caught in this save — once per save) + counters for the play log
  const FIELDS = ['heard', 'trace', 'sighted', 'named', 'observed', 'trialReady', 'captured'];
  const COUNT = ['tries', 'ko', 'fled', 'lost'];
  Lg.KEYS = ['geumo', 'wolbaek'];
  // battle manners (docs: existing moves + the telegraph rule, no new ability): 금오 decides fast and presses with fire and
  // wing, its 태양불꽃 always announced a turn ahead; 월백 opens with a veil of mist, mixes illusion and sleep, and gathers
  // its moon-fire before a 그림자구슬. A warning turn is a turn without an attack, so the player can heal or switch.
  const LEG = {
    geumo: { lv: 48, quest: 'LQ01', site: 'LGZ01', map: 'lg_suncliff', bg: 'sun',
      moves: ['blaze', 'dive', 'sunfire', 'flamewheel'],
      ai: { smart: true, telegraph: { geumo: { moves: ['sunfire'], msg: '의 눈무늬 꼬리깃 셋이 해처럼 달아오른다! 다음 차례에 태양불꽃이 쏟아질 것 같다!', chance: 0.5 } } },
      appear: '해를 등에 진 금오가 긴 날개를 활짝 폈다!', home: '햇귀절벽' },
    wolbaek: { lv: 49, quest: 'LQ02', site: 'LGZ02', map: 'lg_moonpool', bg: 'moon',
      moves: ['psybeam', 'shadowball', 'hypnosis', 'mistveil'],
      ai: { lead: { wolbaek: 'mistveil' }, telegraph: { wolbaek: { moves: ['shadowball'], msg: '의 아홉 꼬리 끝 달불이 하나로 모여 일렁인다! 다음 차례에 그림자구슬이 날아올 것 같다!', chance: 0.5 } } },
      appear: '아홉 꼬리 끝에 달불이 켜지며 월백이 모습을 드러냈다!', home: '월은못' }
  };
  Lg.LEG = LEG;
  function st(S) {
    const s = S.legends || (S.legends = {});
    Lg.KEYS.forEach(k => {
      const r = s[k] = s[k] || {};
      FIELDS.concat(COUNT).forEach(f => { if (typeof r[f] !== 'number') r[f] = r[f] ? 1 : 0; });
    });
    s.scenes = s.scenes || {}; s.log = Array.isArray(s.log) ? s.log : []; s.quests = s.quests || {}; s.sites = s.sites || {};
    ['LQ01', 'LQ02'].forEach(q => { s.quests[q] = s.quests[q] || {}; });
    ['LGZ01', 'LGZ02'].forEach(z => { s.sites[z] = s.sites[z] || {}; });
    return s;
  }
  Lg.st = () => st(G.S);
  Lg.of = id => Lg.st()[id];
  const owned = (S, id) => S.party.concat(S.box).some(m => m && m.id === id);

  // older saves: defaults (undiscovered) without touching anything else; a 금오 already in the party / box (or a capture
  // recorded by the first draft world) counts as this save's one capture, so no second one appears. A designer preview
  // of the dex is not ownership and is never read here.
  Lg.normalize = (out, orig) => {
    const s = st(out);
    Lg.KEYS.forEach(id => {
      const r = s[id], own = owned(out, id);
      const v1 = id === 'geumo' && orig && orig.flags && orig.flags.geumo_caught;
      if (!r.captured && (own || out.dex.caught[id] || v1)) { r.captured = 1; r.legacy = 1; }
      if (own) { out.dex.seen[id] = 1; out.dex.caught[id] = 1; }
      if (r.captured) { r.named = 1; r.sighted = 1; r.trialReady = 0; }
    });
  };

  // ------------------------------------------------------------ the journal (전설 기록)
  const REC = {
    LG_S01: { t: '새벽에 지나간 새', marks: { geumo: ['trace'] },
      d: '햇살들판 위로 날개를 펼친 커다란 그림자가 지나갔다. 바람이 따뜻해지고, 길 위에 발자국처럼 세 점이 잠깐 비쳤다.' },
    LG_S02: { t: '달빛방의 은빛 흔적', marks: { wolbaek: ['trace'] },
      d: '달숨동굴 달빛방의 물기 어린 돌에 긴 은빛 털 한 가닥과 갈라진 달빛 무늬가 남아 있었다. 달모찌의 털인지, 반사광인지는 알 수 없다.' },
    LG_S03: { t: '금빛 새가 지나간 날의 기상 일지', marks: { geumo: ['heard'] },
      d: '돛바람 등대의 오래된 정비 일지: 바람이 유난히 따뜻했던 아침, 금빛 새가 북서쪽 절벽 쪽으로 지나갔다. 등대를 고친 것은 사람과 동료들이었고, 새는 그저 지나갔다.' },
    LG_S04: { t: '해와 달의 두 길', marks: { geumo: ['heard'], wolbaek: ['heard'] },
      d: '옛길 기록판 한쪽 끝에는 세 발 달린 날개가, 다른 쪽 끝에는 아홉 갈래 꼬리가 새겨져 있다. 날개 쪽 발자국은 떠나고, 꼬리 쪽 발자국은 돌아온다.' },
    LG_S05: { t: '금오 목격', marks: { geumo: ['sighted', 'named'] },
      d: '바람등성이 전망 돌판에서, 바람이 한 번 걷힌 사이 먼 절벽 위의 세 발 달린 금빛 새를 보았다. 등성이 사람들은 그 새를 금오라고 부른다.' },
    LG_S06: { t: '월백 첫 조우', marks: { wolbaek: ['sighted', 'named'] },
      d: '옛 부두 아래 물 위에 번진 아홉 갈래 은빛이 긴 꼬리로 이어졌다. 하얀 여우가 안전한 돌판을 디디며 조용히 멀어졌다. 해무나루 사람들은 월백이라고 부른다.' },
    LG_S07: { t: '다시 돌아온 발걸음', marks: { wolbaek: ['trace'] },
      d: '기억나루 강 건너 모래톱: 나가는 발자국보다 돌아오는 작은 발자국이 더 선명하다. 얇은 은빛 털과 아홉 갈래 꼬리 자국이 마을 쪽 귀로를 가리킨다.' },
    LG_S08: { t: '해와 달이 만나는 옛길', marks: { geumo: ['heard'], wolbaek: ['heard'] },
      d: '높은물길 첫 전망대의 울림돌: 낮의 표식과 밤의 표식이 같은 골짜기 쪽으로 이어진다. 시온은 장비가 옛 생물 이동로까지 잰 기록이 따로 있을지 찾아보겠다고 했다.' },
    LQ01: { t: '금오 관찰 기록', marks: { geumo: ['sighted', 'named', 'observed'] },
      d: '햇귀절벽 위에서 금오와 같은 높이로 마주 보았다. 금오는 긴 날개와 눈무늬 꼬리깃을 활짝 펴고, 작은 동료가 지나갈 길을 내려다보았다.' },
    LQ02: { t: '월백 관찰 기록', marks: { wolbaek: ['sighted', 'named', 'observed'] },
      d: '월은못을 한 바퀴 돌아와 처음 발판을 비워 두자, 아홉 꼬리 끝이 차례로 빛나며 월백이 그 자리에 섰다. 떠나는 용기만큼 돌아올 자리를 남기는 마음도 길이 된다.' }
  };
  Lg.REC = REC;
  // marks: the record's own marks, or a lighter set when the story only reached you second-hand (a recap)
  Lg.record = (id, marks) => {
    const s = Lg.st();
    if (!s.log.includes(id)) s.log.push(id);
    const mk = marks || REC[id].marks;
    for (const k in mk) mk[k].forEach(f => { s[k][f] = 1; });
  };
  Lg.has = id => Lg.st().log.includes(id);
  Lg.due = id => !Lg.st().scenes[id];
  Lg.label = id => (Lg.of(id).named ? nm(id) : '???');
  Lg.journal = () => {
    if (!G.S || !G.S.legends) return [];
    const s = Lg.st();
    return s.log.filter(k => REC[k]).map(k => {
      const who = Object.keys(REC[k].marks).map(Lg.label).join('·');
      return { t: REC[k].t, who, d: REC[k].d + (s.scenes[k] === 'skip' ? '\n(장면은 건너뛰었다)' : s.scenes[k] ? '' : '\n(직접 본 장면이 아니라 전해 들은 기록)'), done: k === 'LQ01' || k === 'LQ02' };
    });
  };

  // ------------------------------------------------------------ scene runner: short, optional, skippable
  // The record is written first, so skipping (B during the animation) still keeps it; the presentation plays once.
  async function scene(id, body) {
    const s = Lg.st();
    Lg.record(id);
    const c = { skip: false, textL: null };
    c.skipNow = () => { if (c.skip) return; c.skip = true; if (c.textL && c.textL.close) c.textL.close(); };
    // the whole scene keeps a hint on the lower screen: B or a tap there skips the rest (animation and lines alike).
    // The button is read in a layer's own update (inside the frame, before the input is cleared), never after an await.
    const hint = { sceneHint: true, update: () => { if (G.hit('b')) c.skipNow(); },
      drawBot: B => { G.menus.header(B, REC[id].t, '전설 기록'); G.textC(B, 'B 버튼 · 화면 누르기: 장면 건너뛰기', 128, 96, '#8a8270', null); G.addHot({ x: 0, y: 22, w: 256, h: 170, onTap: c.skipNow }); } };
    // an animation on the field; draw(T, cx, cy, k) with k 0..1
    c.anim = async (n, draw) => {
      if (c.skip) return;
      let done = false;
      const run = F().play(n, (T, cx, cy, k) => { if (!c.skip && !done) draw(T, cx, cy, k); });
      for (let i = 0; i <= n + 1 && !c.skip; i++) await G.wait(1);
      done = true;
      if (!c.skip) await run;
    };
    c.say = async (t, name) => {
      if (c.skip) return;
      const p = G.say(t, { name, onB: c.skipNow });
      c.textL = G.topLayer();
      await p;
      c.textL = null;
    };
    G.pushLayer(hint);
    try { await body(c); } finally { G.popLayer(hint); }
    s.scenes[id] = c.skip ? 'skip' : 'seen';
    await say(c.skip ? `(장면을 건너뛰었다. 수첩의 [전설 기록]에 「${REC[id].t}」${G.josa(REC[id].t, '이', '가')} 남았다)` : `(수첩의 [전설 기록]에 「${REC[id].t}」${G.josa(REC[id].t, '을', '를')} 적었다)`);
    G.autosave();
  }
  Lg.scene = scene;
  // a second-hand telling (the fallbacks): records what you heard, never the sighting itself
  async function recap(id, marks, lines, name) {
    for (const t of lines) await say(t, name);
    const had = Lg.has(id);
    Lg.record(id, marks);
    if (!had) { sfx('select'); await say(`(수첩의 [전설 기록]에 「${REC[id].t}」${G.josa(REC[id].t, '을', '를')} 적었다)`); }
    G.autosave();
  }

  // small drawing helpers for the field overlays
  const sparkle = (T, x, y, col, s) => { T.fillStyle = col; T.fillRect(Math.round(x - s), Math.round(y), s * 2 + 1, 1); T.fillRect(Math.round(x), Math.round(y - s), 1, s * 2 + 1); };
  const lead = () => { const f = W().follower; return f && !f.hidden && G.S.party[0] ? f : null; };
  const leadName = () => G.S.party[0] ? D.nameOf(G.S.party[0]) : '';
  // a picture card on the top screen while a scene talks (drawTop(T, t) gets a frame counter)
  async function withTop(drawTop, body) {
    let t = 0;
    const L = { drawTop: T => { t++; drawTop(T, t); } };
    G.pushLayer(L);
    try { await body(); } finally { G.popLayer(L); }
  }
  // a quiet sky band for distant sightings
  function skyCard(T, kind) {
    const g = T.createLinearGradient(0, 0, 0, 192);
    if (kind === 'dawn') { g.addColorStop(0, '#2a3a74'); g.addColorStop(0.55, '#e88a6a'); g.addColorStop(1, '#f8d48a'); }
    else { g.addColorStop(0, '#0e1230'); g.addColorStop(0.7, '#2a2a5a'); g.addColorStop(1, '#3e3a6a'); }
    T.fillStyle = g; T.fillRect(0, 0, 256, 192);
  }

  // the observation card: the legend's whole picture on its own light (sun disc / moon), fading in
  function legendCard(T, t, id) {
    skyCard(T, id === 'geumo' ? 'dawn' : 'night');
    const img = G.mons.front(id), k = Math.min(1, t / 60);
    // the whole picture stays above the text box (y < 140)
    const x = Math.round(128 - img.width / 2), y = Math.round(138 - img.height);
    if (id === 'geumo') { G.disc(T, 128, 70, 50 + Math.sin(t / 20) * 2, 'rgba(255,214,120,0.4)'); G.disc(T, 128, 70, 34, 'rgba(255,236,170,0.75)'); }
    else { G.disc(T, 128, 60, 40, 'rgba(220,228,255,0.25)'); G.disc(T, 128, 60, 28, 'rgba(240,244,255,0.8)'); }
    T.fillStyle = id === 'geumo' ? '#4a2a3a' : '#22223e'; T.fillRect(0, 140, 256, 52);
    T.globalAlpha = k; T.drawImage(img, x, y); T.globalAlpha = 1;
    if (G.legendFx) G.legendFx(T, id, 'front', { x, y }, 1, k, t);
  }

  // ------------------------------------------------------------ LG_S01 세 갈래의 그림자 (햇살들판 · after q00)
  Lg.s01 = () => scene('LG_S01', async c => {
    const p = W().player, f = lead();
    sfx('wind');
    await c.anim(84, (T, cx, cy, k) => {
      // a great winged shadow sweeps across the field from the east; the air turns warm and gold
      const img = G.mons.silhouette('geumo', 'front', '#1e1426');
      T.globalAlpha = 0.18 * Math.sin(Math.PI * k) + 0.06; T.fillStyle = '#ffd88a'; T.fillRect(0, 0, 256, 192);
      T.globalAlpha = 0.3 * Math.min(1, Math.sin(Math.PI * k) * 1.6);
      const x = 260 - k * 470, y = (p.y - 3) * 16 - cy - 10 + Math.sin(k * 5) * 6;
      T.drawImage(img, Math.round(x), Math.round(y), img.width * 1.4, img.height * 1.4);
      T.globalAlpha = 1;
      for (let i = 0; i < 12; i++) { const a = (k * 3 + i * 0.37) % 1; sparkle(T, (i * 47 + k * 300) % 256, 30 + (i * 29) % 140 - a * 30, `rgba(255,226,140,${(1 - a).toFixed(2)})`, 1); }
    });
    if (f) { f.emote = 50; f.dir = 'up'; }
    await c.say('훅— 따뜻한 바람이 불어왔다.\n날개를 펼친 커다란 그림자가 들판을 가로질러 지나갔다.');
    // three points flash on the road ahead, like footprints
    await c.anim(60, (T, cx, cy, k) => {
      const X = p.x * 16 + 8 - cx, Y = (p.y - 2) * 16 + 8 - cy, a = Math.sin(Math.PI * k);
      [[-5, 2], [0, -3], [5, 2]].forEach(([dx, dy]) => { T.fillStyle = `rgba(255,214,90,${a.toFixed(2)})`; T.fillRect(X + dx - 1, Y + dy - 1, 3, 3); T.fillStyle = `rgba(255,255,230,${a.toFixed(2)})`; T.fillRect(X + dx, Y + dy, 1, 1); });
    });
    if (f) await c.say(`${G.iga(leadName())} 하늘을 올려다본다.`);
    await c.say('길 위에 발자국 같은 세 점이 잠깐 반짝이다 사라졌다.\n...언젠가 저 새를 가까이서 만나 볼 수 있을까?');
  });
  // fallback (바람나루 주민): told when the field scene was missed
  Lg.cityRumor = async (N) => {
    if (!flag('q00')) { await say('바람나루는 바람이 머무는 나루라서, 계절마다 새들이 쉬어 간단다.', N); return; }
    if (Lg.has('LG_S01')) { await say(Lg.st().scenes.LG_S01 ? '햇살들판 위로 큰 새 그림자를 봤다고? 나도 봤단다! 새벽마다 따뜻한 바람을 몰고 오지.' : '큰 새 이야기, 기억하지? 새벽 들판에 따뜻한 바람이 불면 그 새가 지나간 거란다.', N); return; }
    await recap('LG_S01', { geumo: ['heard'] }, ['얘, 오늘 새벽에 햇살들판 위로 커다란 새가 지나갔단다.\n날개 그림자가 길을 덮고, 바람이 갑자기 따뜻해지더구나.', '발자국처럼 세 점이 길에 비쳤다는 사람도 있었지. 무슨 새일까?'], N);
  };

  // ------------------------------------------------------------ LG_S02 은빛 털이 남은 돌 (달빛방 · after q08)
  Lg.moonStone = async () => {
    if (!flag('q08')) { await say('물기 어린 바위다. 천장 틈으로 들어온 달빛이 젖은 표면에 어른거린다.'); return; }
    if (!Lg.due('LG_S02')) { await say('은빛 털 한 가닥이 걸려 있던 바위다. 갈라진 달빛 무늬가 아직 희미하게 남아 있다.'); return; }
    await scene('LG_S02', async c => {
      const x = 10, y = 6;
      sfx('sparkle');
      await c.anim(70, (T, cx, cy, k) => {
        const X = x * 16 + 8 - cx, Y = y * 16 + 4 - cy;
        T.strokeStyle = `rgba(230,236,255,${(0.4 + 0.6 * Math.sin(Math.PI * k)).toFixed(2)})`; T.lineWidth = 1;
        T.beginPath(); T.moveTo(X - 7, Y + 2); T.quadraticCurveTo(X - 1, Y - 6 - k * 3, X + 7, Y - 1); T.stroke();
        for (let i = 0; i < 4; i++) sparkle(T, X - 6 + i * 4, Y + 6 + ((i * 3) % 4), `rgba(200,210,255,${(0.6 * Math.sin(Math.PI * (k + i * 0.2) % Math.PI)).toFixed(2)})`, 1);
      });
      await c.say('물기 어린 바위 위에 긴 은빛 털 한 가닥이 걸려 있다.\n바위 표면에는 갈라진 달빛 무늬가 희미하게 남았다.');
      await c.say('달모찌의 털일까? 아니면 동굴 반사광이 만든 착각일까...\n털끝이 달빛을 받아 아주 잠깐 푸르스름하게 빛났다.');
    });
  };

  // ------------------------------------------------------------ LG_S03 일지에 남은 따뜻한 바람 (돛바람항 정비사 세나 · after q13)
  async function senaLog(c, N) {
    await c.say('그러고 보니 등대 정비 일지에 이상한 기록이 하나 있어. 우리 선배들이 쓴 거야.', N);
    await c.say('"바람이 유난히 따뜻했던 아침, 금빛 새 한 마리가 등대 위를 지나 북서쪽 절벽으로 갔다."\n그날 아침 계기판 바늘이 다 같이 따뜻한 쪽으로 기울었대.', N);
    await c.say('오해는 말아 줘. 등대를 고친 건 너랑 동료들, 그리고 항구 사람들이야.\n새는 그냥... 지나갔을 뿐이지. 그래도 궁금하잖아?', N);
  }
  // Sena's talk after the lighthouse: her own lines first (the 자력 맞춤 lesson keeps priority), then the legend topics
  Lg.senaTalk = async (orig) => {
    const N = '정비사 세나', q = Lg.st().quests.LQ01, g = Lg.of('geumo');
    const canOffer = flag('q13') && flag('badge3') && flag('f_smash') && !q.started;
    const logDue = flag('q13') && Lg.due('LG_S03');
    // her own lines always come first (the 자력 맞춤 lesson keeps priority); the legend topic follows in the same talk
    await orig();
    if (logDue) await scene('LG_S03', async c => { await senaLog(c, N); });
    if (q.started && Lg.has('LG_S03')) q.listen = 1;          // the request already began at the cliff: the log is its first step
    if (canOffer) { await offerLQ01(N); return; }
    if (q.started && !g.observed && !logDue) await say(g.sighted ? '금빛 새를 봤다고? 일지의 그 절벽 방향이 맞았구나! 바람등성이 전망 바위 옆 운반석 너머라던데... 조심해.' : '일지에 적힌 대로 바람등성이 대피소 옆 전망 돌판에서 북서쪽 절벽을 봐 줘.\n새벽까지 기다릴 필요는 없을 거야. 바람이 걷히는 순간이 있대.', N);
    // after the cliff (in either order): one closing line, once
    if (g.observed && !q.told) {
      q.told = 1;
      await say('햇귀절벽에서 금오를 마주 봤다고? 일지에 한 줄 더 적어 둘게.\n"금빛 새는 작은 동료가 바람막이 사이를 지나올 때까지 기다려 주었다."', N);
      G.autosave();
    }
  };
  async function offerLQ01(N) {
    const q = Lg.st().quests.LQ01;
    await say('바위깨기도 익혔고 배지도 셋이나 모았네! 그럼 부탁 하나만 할게.', N);
    const ok = await G.ask('일지 속 그 금빛 새가 정말 있는지, 바람등성이 전망 돌판에서 확인해 줄래?\n(선택 의뢰 「해를 등에 진 새」 · 본편 진행과는 상관없어)', ['살펴볼게요', '나중에요'], { name: N });
    if (!ok) { await say('언제든 말해. 일지는 항만소 서랍에 잘 넣어 둘게.', N); return; }
    q.started = 1; q.listen = 1;
    sfx('item');
    await say('고마워! 바람등성이 대피소 옆에 오래된 전망 돌판이 있어. 거기서 북서쪽 절벽을 봐.\n가까이 가는 길은... 아직 아무도 몰라. 무리하지 마!', N);
    G.autosave();
  }

  // ------------------------------------------------------------ LG_S04 해를 향한 길, 달을 향한 길 (옛길 기록실 · after q17)
  function boardCard(T, t) {
    G.menus.topCard(T, '옛길 기록판');
    G.box(T, 6, 24, 244, 160, G.STYLE.white, 5);
    T.fillStyle = '#e8dcc0'; T.fillRect(14, 40, 228, 112); T.fillStyle = '#b8a888'; T.fillRect(14, 95, 228, 3);
    // the old road across the board, footsteps leaving on the left, returning on the right
    for (let i = 0; i < 9; i++) { T.fillStyle = '#7a6a4a'; T.fillRect(56 + i * 16, 100 + (i % 2) * 6, 3, 2); }
    // a three-legged winged figure at the dawn end, a nine-tailed figure at the night end (silhouettes only: no names yet)
    const sun = G.mons.silhouette('geumo', 'icon', '#a8641a'), moon = G.mons.silhouette('wolbaek', 'icon', '#5a5a8a');
    T.drawImage(sun, 20, 52); T.drawImage(moon, 204, 52);
    G.disc(T, 36, 50, 5, 'rgba(240,170,60,0.5)'); G.disc(T, 220, 50, 4, 'rgba(180,190,240,0.6)');
    const k = Math.min(1, t / 60);
    T.fillStyle = `rgba(255,236,170,${(0.35 * k).toFixed(2)})`; T.fillRect(56, 96, 60 * k, 2);
    T.fillStyle = `rgba(200,210,255,${(0.35 * k).toFixed(2)})`; T.fillRect(196 - 60 * k, 108, 60 * k, 2);
    G.text(T, '떠나는 발걸음 →', 22, 112, '#7a5a2a', null); G.textR(T, '← 돌아오는 발걸음', 236, 124, '#4a4a7a', null);
  }
  Lg.archiveBoard = async () => {
    if (!flag('q17')) { await say('기록판 위로 먼지가 두껍게 쌓여 있다. 옛길 지도가 복원되면 무엇이 그려졌는지 알 수 있을 것 같다.'); return; }
    if (!Lg.due('LG_S04')) {
      await withTop(boardCard, async () => { await say('옛길 기록판. 한쪽 끝에는 세 발 달린 날개가, 다른 쪽 끝에는 아홉 갈래 꼬리가 새겨져 있다.'); });
      if (flag('q29') && !Lg.has('LG_S07')) await recap('LG_S07', { wolbaek: ['heard'] }, ['기록판 아래 탁본에 작은 글씨가 있다. "강 건너 모래톱에도 같은 귀로가 남아 있다."'], null);
      return;
    }
    await withTop(boardCard, () => scene('LG_S04', async c => {
      await c.say('복원한 옛길 지도 옆, 오래된 기록판에 그림이 새겨져 있다.\n같은 옛길의 양쪽 끝에 서로 다른 무언가가 서 있다.');
      await c.say('해가 뜨는 쪽 끝에는 세 발 달린 날개. 해가 지는 쪽 끝에는 아홉 갈래 꼬리.\n날개 쪽 발자국은 길 밖으로 떠나고, 꼬리 쪽 발자국은 마을로 돌아온다.');
      await c.say('그림 아래 문장: "길을 펼치는 빛과 길을 기억하는 빛."\n둘이 다투는 그림이 아니다. 같은 길을 서로 다른 시간에 지키는 모습 같다.');
    }));
  };

  // ------------------------------------------------------------ LQ02 (옛길 기록실 관리인 해솔 · after q17)
  async function offerLQ02(N) {
    const q = Lg.st().quests.LQ02;
    await say('기록판을 보셨군요. 아홉 갈래 꼬리 쪽은 우리 나루에서 "월백"이라고 불러요.\n달빛 아래 남은 발걸음을 읽고, 길 잃은 사람에게 돌아갈 길을 비춰 준대요.', N);
    await say('옛 기록 속 이야기 하나: 길을 잃은 아이가 자기가 남긴 발자국을 따라 돌아왔대요.\n발자국이 은빛으로 빛났다고요. 영혼이나 귀신 이야기가 아니에요. 살아 있는 걸음의 잔향이죠.', N);
    Lg.record('LG_S04', { wolbaek: ['heard', 'named'] });
    if (!Lg.has('LG_S02') && flag('q08')) await recap('LG_S02', { wolbaek: ['heard'] }, ['달숨동굴 달빛방에서 은빛 털을 봤다는 탐굴사 석호의 탁본도 있어요. 물에 비친 긴 자국이었대요.'], N);
    const ok = await G.ask('달빛에 남은 귀로를 함께 찾아봐 줄래요?\n(선택 의뢰 「달빛에 남은 귀로」 · 본편 진행과는 상관없어요)', ['찾아볼게요', '나중에요'], { name: N });
    if (!ok) { await say('언제든 이야기해 줘요. 기록판은 늘 여기 있으니까.', N); return; }
    q.started = 1; q.listen = 1;
    sfx('item');
    await say('기록판의 나가는 발자국과 돌아오는 발자국을 견주어 봐요. 옛 부두나 강 건너에서 본 것도\n들려주면 좋고요. 전부 모을 필요는 없어요. 달빛방 근처에서 시작된 이야기니까요.', N);
    G.autosave();
  }
  Lg.haesolTalk = async (orig) => {
    const N = '관리인 해솔', q = Lg.st().quests.LQ02;
    if (!flag('q17')) { await orig(); return; }
    const topics = [];
    if (!q.started) topics.push(['은빛 여우 이야기', () => offerLQ02(N)]);
    else if (!Lg.of('wolbaek').observed) topics.push(['달빛에 남은 귀로', () => haesolProgress(N)]);
    else if (!q.told) topics.push(['월은못 이야기', () => haesolClosing(N)]);
    if (Lg.has('LG_S04') || Lg.st().scenes.LG_S04) topics.push(['기록판 다시 듣기', () => haesolBoard(N)]);
    if (!topics.length) { await orig(); return; }
    const opts = [['요즘 이야기', orig]].concat(topics).concat([['그만', null]]);
    const i = await G.choose(opts.map(o => o[0]), { title: N, cancel: opts.length - 1 });
    if (i < 0 || !opts[i][1]) return;
    await opts[i][1]();
  };
  async function haesolProgress(N) {
    const q = Lg.st().quests.LQ02, w = Lg.of('wolbaek');
    if (!q.compare) {
      q.compare = 1;
      await say('기록판의 발자국, 다시 볼까요? 나가는 발자국은 크고 깊고, 돌아오는 발자국은 작고 가벼워요.\n그런데 돌아오는 쪽이 더 선명하게 남아 있어요. 신기하죠.', N);
    }
    const seen = [w.sighted && '옛 부두의 아홉 빛', Lg.has('LG_S07') && '강 건너 모래톱의 발자국'].filter(Boolean);
    if (seen.length) await say(`${seen.join('과 ')} 이야기까지... 고마워요. 기록판에 같이 적어 둘게요.`, N);
    if (!flag('q33') || !F().unlocked('haul')) await say('달빛방 옆 고리무늬 운반석 너머에 못이 있었다는 기록이 있어요.\n운반석을 옮길 수 있게 되면(괴력운반·높은물길 조사 뒤) 가 봐요.', N);
    else await say('달숨동굴 달빛방 옆 고리무늬 운반석을 옮기면 월은못이에요.\n물에 비친 길과 실제 발판을 잘 구분해요. 소리나 밤 시간을 기다릴 필요는 없대요.', N);
  }
  // after 월은못 (also when the request began there, before ever meeting 해솔): the story told back, once
  async function haesolClosing(N) {
    const q = Lg.st().quests.LQ02;
    q.told = 1; q.listen = 1; q.compare = 1;
    await say('월은못에서 아홉 꼬리를 봤다고요? 처음 발판을 비워 뒀더니...\n기록판의 그 이야기 그대로네요. 떠나는 용기만큼, 돌아올 자리를 남기는 마음.', N);
    if (!Lg.has('LG_S04')) Lg.record('LG_S04', { wolbaek: ['heard', 'named'] });
    await say('기록판 돌아오는 발자국 옆에 오늘 이야기를 같이 새겨 둘게요. 고마워요.', N);
    G.autosave();
  }
  async function haesolBoard(N) {
    await withTop(boardCard, async () => {
      await say('해 쪽 그림은 길을 펼치는 빛, 달 쪽 그림은 길을 기억하는 빛이에요.\n"금오가 펼친 길을 월백이 기억한다"고 나루 어르신들은 말해요.', N);
      if (!Lg.has('LG_S07')) await recap('LG_S07', { wolbaek: ['heard'] }, ['아, 강 건너 모래톱에도 같은 귀로 탁본이 있어요. 돌아오는 발자국이 더 선명한 자리.\n못 가 봤어도 괜찮아요. 이 탁본이 그대로 옮겨 온 거니까.'], N);
    });
  }

  // ------------------------------------------------------------ LG_S05 절벽 너머의 날개 (바람등성이 전망 돌판 · badge3 + 바위깨기)
  function farCard(T, t, id) {
    skyCard(T, 'dawn');
    // far cliffs, the wind band, and the legend small and far away
    T.fillStyle = '#5a3a5a'; for (let x = 0; x < 256; x++) { const h = 44 + Math.sin(x / 19) * 10 + Math.sin(x / 7) * 3; T.fillRect(x, 192 - h, 1, h); }
    T.fillStyle = '#3a2a40'; for (let x = 120; x < 256; x++) { const h = 70 + Math.sin(x / 11 + 1) * 8; T.fillRect(x, 192 - h - (x - 120) * 0.3, 1, h + (x - 120) * 0.3); }
    const img = G.mons.front(id), k = Math.min(1, t / 90), s = 0.42;
    const x = 150 + k * 30, y = 30 - k * 8 + Math.sin(t / 14) * 2;
    T.globalAlpha = Math.min(1, t / 30); T.drawImage(img, Math.round(x), Math.round(y), Math.round(img.width * s), Math.round(img.height * s)); T.globalAlpha = 1;
    for (let i = 0; i < 6; i++) { const a = ((t / 70 + i / 6) % 1); T.fillStyle = `rgba(255,255,255,${(0.5 * (1 - a)).toFixed(2)})`; T.fillRect((i * 61 + t * 2) % 300 - 20, 80 + i * 14, 40, 1); }
  }
  Lg.ridgeTablet = async () => {
    const ready = flag('badge3') && flag('f_smash');
    if (!ready) { await say('바람등성이 전망 돌판이다. "바람이 걷히는 날, 북서쪽 절벽 끝에 빛이 앉는다" 라고 새겨져 있다.\n지금은 바람이 거세서 먼 곳이 뿌옇다.'); return; }
    if (!Lg.due('LG_S05')) {
      await say('전망 돌판 너머 북서쪽 절벽. 금빛 새가 앉아 있던 자리가 멀리 보인다.');
      if (flag('q33') && F().unlocked('haul') && !Lg.of('geumo').observed) await say('돌판 옆 고리무늬 운반석 너머로 절벽 위 오솔길이 이어지는 것 같다.');
      return;
    }
    await withTop((T, t) => farCard(T, t, 'geumo'), () => scene('LG_S05', async c => {
      sfx('wind');
      await c.say('전망 돌판에 손을 얹자, 등성이를 훑던 바람이 한 번 크게 걷혔다.');
      await c.anim(90, (T, cx, cy, k) => { T.fillStyle = `rgba(255,236,190,${(0.25 * Math.sin(Math.PI * k)).toFixed(2)})`; T.fillRect(0, 0, 256, 192); });
      await c.say('멀리 북서쪽 절벽 끝에 세 발 달린 금빛 새가 앉아 있다.\n긴 날개를 한 번 펴더니, 가까이 오지도 길을 열어 주지도 않고 해 쪽으로 날아갔다.');
      if (lead()) { lead().emote = 50; await c.say(`${G.iga(leadName())} 새가 사라진 쪽을 오래 바라본다.`); }
      await c.say('저 새를 봤구먼! 등성이 사람들은 금오라고 부르지. 해를 등에 지고 길을 먼저 살피는 새야.\n가까이 간 사람은 아직 없어. 저 절벽엔 바람이 너무 세거든.', '바람 관측 노인');
    }));
    const q = Lg.st().quests.LQ01; if (q.started) q.survey = 1;
  };
  Lg.ridgeWatcher = async () => {
    const N = '바람 관측 노인';
    if (!(flag('badge3') && flag('f_smash'))) { await say('전망 돌판을 보러 왔나? 바람이 걷히는 날이면 북서쪽 절벽이 아주 잘 보인단다.', N); return; }
    if (!Lg.of('geumo').sighted) { await say('대피소 옆 전망 돌판에 손을 얹어 보게. 바람이 걷히는 순간이 있어.', N); return; }
    if (Lg.of('geumo').captured) { await say('금오가 자네 곁에 있다니! 등성이 바람이 오늘따라 순하구먼.', N); return; }
    if (Lg.of('geumo').observed) { await say('햇귀절벽에서 금오를 마주 봤다고? 바람막이를 맞춘 건 자네가 처음일 걸세.', N); return; }
    await say('금오는 절벽 위 바람이 가장 센 곳에 앉아. 돌판 옆 고리무늬 운반석 너머가 햇귀절벽이지.\n운반석은 괴력운반 없이는 꿈쩍도 안 해. 높은물길 쪽 일이 끝나면 한번 옮겨 보게.', N);
  };

  // ------------------------------------------------------------ LG_S06 물 위를 지나간 아홉 빛 (너울잠굴 옛 부두 · after q25)
  Lg.dockCameo = () => scene('LG_S06', async c => {
    const p = W().player;
    await c.say('부두 끝, 첫 안전 하선점. 발밑 물결 위로 은빛 줄기가 하나 번졌다.');
    sfx('psy');
    await c.anim(110, (T, cx, cy, k) => {
      // nine silver streaks light one after another on the water, then gather into one long-tailed shape
      for (let i = 0; i < 9; i++) {
        const on = Math.min(1, Math.max(0, k * 12 - i)), X = (12 + i * 1.4) * 16 - cx, Y = (11 + Math.sin(i) * 0.8) * 16 - cy;
        if (on <= 0) continue;
        const gx = X + (21 * 16 - cx - X) * Math.max(0, k - 0.75) * 4 * 0.25;
        T.fillStyle = `rgba(214,222,255,${(0.75 * on * (1 - Math.max(0, k - 0.8) * 4)).toFixed(2)})`;
        T.fillRect(Math.round(gx) - 6, Math.round(Y), 12, 1); T.fillRect(Math.round(gx) - 3, Math.round(Y) + 2, 6, 1);
      }
    });
    await c.say('하나, 둘... 아홉. 물결인 줄 알았던 빛이 긴 꼬리로 이어졌다.');
    await c.anim(120, (T, cx, cy, k) => {
      const mini = G.mons.mini('wolbaek').right, X = (19 + k * 11) * 16 - cx, Y = 12 * 16 - cy - 8 + Math.sin(k * 20) * 1.5;
      T.globalAlpha = k < 0.15 ? k / 0.15 : k > 0.85 ? (1 - k) / 0.15 : 1;
      T.drawImage(mini, Math.round(X), Math.round(Y)); T.globalAlpha = 1;
      for (let i = 0; i < 5; i++) sparkle(T, X - 6 - i * 8, Y + 22 + (i % 2), `rgba(200,210,255,${(0.6 - i * 0.1).toFixed(2)})`, 1);
    });
    if (lead()) lead().emote = 50;
    await c.say('하얀 여우 한 마리가 물 위의 안전한 돌판을 디디며 조용히 멀어졌다.\n아홉 갈래 꼬리 끝이 한 번 빛나고, 이내 바다 안개 속으로 사라졌다.');
    await c.say('...방금 봤어요? 할머니들이 말하던 월백이에요! 달길을 걷는 아홉 꼬리 여우.\n길 잃은 배를 비춰 준다는데, 낮에 보다니.', '구조대원 해들');
  });
  // fallback: 구조대장 가온 remembers what his crew saw
  Lg.gaonRecap = async () => {
    const N = '구조대장 가온';
    if (!flag('q25') || Lg.has('LG_S06')) return;
    const ok = await G.ask('아, 그리고... 옛 부두에서 물빛 이야기 들었어? 대원들이 본 거래.', ['들려주세요', '다음에요'], { name: N });
    if (!ok) return;
    await recap('LG_S06', { wolbaek: ['heard', 'named'] }, ['부두가 이어진 날, 물 위에 은빛 줄기가 아홉 갈래로 번졌대. 물결인 줄 알았는데 긴 꼬리였다고.\n어르신들은 그걸 월백이라고 불러. 돌아올 길을 비춰 주는 여우.', '부두 끝 하선점에서 물을 오래 보면 너도 볼지 몰라. 못 봐도 괜찮아. 이야기는 남으니까.'], N);
  };

  // ------------------------------------------------------------ LG_S07 돌아오는 쪽의 발자국 (기억나루 모래톱 · q17 + q29)
  Lg.sandbarTracks = async () => {
    if (!(flag('q17') && flag('q29'))) { await say('모래톱 바위 옆 젖은 모래에 발자국이 어지럽게 찍혀 있다.'); return; }
    if (!Lg.due('LG_S07')) { await say('돌아오는 작은 발자국이 아직도 선명하다. 은빛 털 한 올이 바람에 흔들린다.'); return; }
    await scene('LG_S07', async c => {
      const x = 26, y = 4;
      await c.anim(80, (T, cx, cy, k) => {
        for (let i = 0; i < 7; i++) {   // the faint outgoing prints, then the clearer small prints coming back
          const a = Math.min(1, k * 8 - i);
          if (a <= 0) continue;
          T.fillStyle = `rgba(90,80,70,${(0.35 * a).toFixed(2)})`; T.fillRect((x + 1 + i * 0.5) * 16 - cx, (y - 1) * 16 - cy + (i % 2) * 4, 3, 2);
          T.fillStyle = `rgba(200,214,255,${(0.8 * a).toFixed(2)})`; T.fillRect((x + 3 - i * 0.5) * 16 - cx, (y - 1) * 16 - cy + 8 + (i % 2) * 3, 2, 2);
        }
      });
      await c.say('모래톱 바위 옆에 발자국이 두 줄 나 있다.\n나가는 큰 발자국은 흐릿한데, 돌아오는 작은 발자국이 더 선명하다.');
      await c.say('그 옆으로 얇은 은빛 털과 아홉 갈래 꼬리 자국이 이어져, 마을 쪽 귀로를 가리킨다.\n누군가 길을 잃었다가 무사히 돌아간 흔적 같다.');
    });
  };

  // ------------------------------------------------------------ LG_S08 두 빛이 만나는 길 (높은물길 첫 전망대 울림돌 · ch3_end)
  Lg.echoStone = async () => {
    if (!flag('ch3_end')) { await say('전망대 가장자리의 울림돌이다. 두드리면 낮게 운다.'); return; }
    if (!Lg.due('LG_S08')) { await say('울림돌의 해 문양과 달 문양이 같은 골짜기 쪽을 가리킨다.'); return; }
    await withTop((T, t) => {
      skyCard(T, 'dawn'); T.fillStyle = '#2a3a4a'; for (let x = 0; x < 256; x++) { const h = 60 + Math.sin(x / 23) * 14; T.fillRect(x, 192 - h, 1, h); }
      const k = Math.min(1, t / 80);
      T.strokeStyle = `rgba(255,214,120,${(0.8 * k).toFixed(2)})`; T.lineWidth = 2; T.beginPath(); T.moveTo(20, 60); T.quadraticCurveTo(90, 40 + 30 * k, 128, 130); T.stroke();
      T.strokeStyle = `rgba(200,210,255,${(0.8 * k).toFixed(2)})`; T.beginPath(); T.moveTo(236, 60); T.quadraticCurveTo(170, 40 + 30 * k, 128, 130); T.stroke();
      G.disc(T, 20, 60, 7, '#f6c04a'); G.disc(T, 236, 60, 6, '#d8e0ff'); G.disc(T, 128, 130, 3 + k * 3, 'rgba(255,255,255,0.7)');
    }, () => scene('LG_S08', async c => {
      sfx('knock2');
      await c.say('울림돌을 두드리자 낮은 울림이 폭포 소리 아래로 퍼졌다.\n돌 표면에 해 문양과 달 문양이 새겨져 있다.');
      await c.say('낮의 표식과 밤의 표식이 서로 다른 쪽에서 출발해, 같은 골짜기 한 곳으로 모인다.');
      await c.say('...해 문양과 달 문양? 상회 장비가 자원만 잰 게 아니었을 수도 있겠어.\n옛 생물들이 다니던 길까지 잰 기록이 따로 있을지 몰라. 본부 조사 때 찾아볼게.', '조합 조사원 시온');
      await c.say('그렇다고 이 일을 전설에게 맡길 생각은 없어. 길은 사람들이 고쳐야지. 그래도... 궁금하네.', '조합 조사원 시온');
    }));
  };
  Lg.sionAfter = async (orig) => {
    await orig();                                             // his own line first, then the stone
    if (!flag('ch3_end')) return;
    if (Lg.has('LG_S08') && !Lg.due('LG_S08')) await say('울림돌의 해와 달 표식, 본부 조사 목록에 넣어 뒀어. 생물 이동로 기록이 있을지도 몰라.', '조합 조사원 시온');
    else await say('전망대 가장자리의 울림돌, 두드려 봤어? 문양이 좀 특이하더라.', '조합 조사원 시온');
  };

  // ------------------------------------------------------------ sanctuary entrances (the haul stones)
  // the stone is only noted (map mark + 다시 가 볼 곳) once it is really examined; nothing shows on the map before
  Lg.siteLook = async (z) => {
    const s = Lg.st().sites[z];
    if (!s.found) { s.found = 1; G.autosave(); }
    const fh = F().unlocked('haul') && !!G.S.bag.harness;
    if (z === 'LGZ01') await say(fh && flag('q33') ? '운반석 뒤 절벽 틈으로 바람이 휘파람처럼 새어 나온다. 그 너머에 오솔길이 있는 것 같다.' : '운반석 뒤 절벽 틈으로 따뜻한 바람이 새어 나온다. 너머에 길이 있는 걸까?');
    else await say(fh && flag('q33') ? '운반석 틈으로 서늘한 달빛과 물 냄새가 스민다. 너머에 못이 있는 것 같다.' : '운반석 틈으로 서늘한 달빛이 스민다. 너머에 무언가 있는 것 같다.');
  };
  Lg.siteCond = z => flag('q33') && (z !== 'LGZ02' || flag('q08'));
  Lg.siteCondLine = z => z === 'LGZ01' ? '괴력운반은 익혔지만, 높은물길 조사(3장)가 끝나기 전에는 절벽 쪽으로 손을 대지 않는 게 좋겠다.' : '높은물길 조사(3장)를 마치고 오면 이 운반석을 옮겨 볼 수 있을 것 같다.';

  // ------------------------------------------------------------ the legend battle: observation first, battle / capture is a choice
  Lg.encounter = async (id) => {
    const r = Lg.of(id), L = LEG[id];
    if (r.captured) return 'captured';
    if (!G.S.party.some(m => m.hp > 0)) { await say('동료들이 모두 지쳤다. 쉬고 다시 오자.'); return 'none'; }
    const cubes = ['cube', 'goldcube', 'mastercube'].some(k => G.S.bag[k] > 0);
    if (!cubes) { const ok = await G.ask(`가방에 큐브가 없다. 그래도 ${G.wa(nm(id))} 겨뤄 볼까?\n(잡으려면 큐브가 필요하다. 겨루지 않아도 기록은 남는다)`, ['겨뤄 본다', '그만둔다']); if (!ok) return 'none'; }
    r.tries++;
    G.audio && G.audio.cry(id);
    const res = await G.battle.wild({ id, lv: L.lv, moves: L.moves, ai: L.ai, legend: L.appear, scene: L.bg,
      onCaught: () => { const s = Lg.of(id); s.captured = 1; s.trialReady = 0; s.named = 1; s.sighted = 1; } });
    if (res === 'caught' || r.captured) {
      r.captured = 1; r.trialReady = 0;
      G.autosave();
      await say(id === 'geumo' ? `금오가 ${P()}의 동료가 되었다!\n햇귀절벽의 바람이 잔잔해지고, 금빛 깃털 하나가 바위 위에 남았다.` : `월백이 ${P()}의 동료가 되었다!\n월은못의 물빛이 고요해지고, 아홉 갈래 은빛이 한 번 반짝였다.`);
      W().respawn();
      return 'caught';
    }
    if (res === 'win') { r.ko++; await say(id === 'geumo' ? '금오가 날개를 접고 절벽 끝에 내려앉아 숨을 고른다.\n동료들을 추스르고 다시 다가가면 겨룰 수 있을 것 같다.' : '월백이 꼬리를 접고 첫 발판 위에 웅크렸다.\n동료들을 추스르고 다시 다가가면 겨룰 수 있을 것 같다.'); }
    else if (res === 'run') { r.fled++; await say(`${G.eun(nm(id))} 그 자리에서 ${P()}${G.josa(P(), '을', '를')} 조용히 지켜보고 있다.`); }
    else if (res === 'lose') { r.lost++; await say(`${G.eun(nm(id))} ${L.home}에서 기다리고 있을 것이다. 동료들이 회복하면 다시 찾아가자.`); }
    r.trialReady = 1;
    G.autosave();
    return res;
  };
  // talking to the legend at its sanctuary after the observation: no long scene, just the choice
  Lg.approach = async (id) => {
    const r = Lg.of(id);
    if (r.captured) return;
    await say(id === 'geumo' ? '금오가 긴 날개를 반쯤 펴고 이쪽을 내려다본다.\n당당하지만, 서두르지 않는 눈빛이다.' : '월백이 처음 발판 위에서 고개를 갸웃한다.\n아홉 꼬리 끝에 달불이 하나씩 켜졌다 꺼진다.');
    const c = await G.choose(['더 다가간다 (승부·포획)', '조용히 물러난다'], { title: nm(id), cancel: 1 });
    if (c !== 0) { await say(`${P()}${G.josa(P(), '은', '는')} 한 걸음 물러났다. ${G.eun(nm(id))} 그 자리에 머물러 있다.`); return; }
    await Lg.encounter(id);
  };

  // observation completes the request's story (reward once); battle stays a choice
  async function observed(id) {
    const q = Lg.st().quests[LEG[id].quest], r = Lg.of(id);
    Lg.record(LEG[id].quest);
    q.started = 1; q.approach = 1; q.observe = 1;
    r.trialReady = r.captured ? 0 : 1;
    if (!q.reward) {
      q.reward = 1;
      D.addItem('token', 2); sfx('item');
      await say(`(선택 의뢰 「${id === 'geumo' ? '해를 등에 진 새' : '달빛에 남은 귀로'}」 관찰 완료)\n조사증표 2개를 받았다! 전설 관찰 기록이 수첩에 남았다.`);
    }
    G.autosave();
  }

  // ------------------------------------------------------------ LGZ01 햇귀절벽: two windbreaks, three feather shadows
  // Windbreak A turns the first shadow, B the third, and the middle one follows both; all three on the ring stone = calm.
  const SUN = { A: [6, 9], B: [15, 9], P: [11, 7], gate: [11, 4] };
  const OFF1 = [[-3, 1], [-2, -1], [0, 0], [-1, 2]], OFF3 = [[3, 1], [2, 2], [1, -1], [0, 0]], OFF2 = [[0, 3], [0, 0], [2, 0], [-2, 0]];
  Lg.SUN = SUN;
  const sunSt = () => { const z = Lg.st().sites.LGZ01; if (typeof z.a !== 'number') { z.a = 0; z.b = 0; } return z; };
  Lg.sunShadows = () => {
    const z = sunSt(), P0 = SUN.P;
    return [OFF1[z.a], OFF2[(z.a + z.b) % 4], OFF3[z.b]].map(([dx, dy]) => [P0[0] + dx, P0[1] + dy]);
  };
  Lg.sunCalm = () => !!sunSt().calm;
  Lg.sunTurn = async (which) => {
    const z = sunSt();
    if (z.calm) { await say('세 깃 그림자가 안전 발판 위에 겹쳐 있다. 바람막이를 그대로 두자.\n(되돌리려면 입구 옆 돌판에서)'); return; }
    const ok = await G.ask(`손으로 돌리는 바람막이 ${which}다. 방향을 한 칸 돌릴까?`, ['돌린다', '그대로 둔다']);
    if (!ok) return;
    if (which === 'A') z.a = (z.a + 1) % 4; else z.b = (z.b + 1) % 4;
    sfx('wind'); W().shake = 4;
    const sh = Lg.sunShadows(), on = sh.filter(([x, y]) => x === SUN.P[0] && y === SUN.P[1]).length;
    if (on === 3) {
      z.calm = 1; sfx('sparkle');
      const q = Lg.st().quests.LQ01; q.started = 1; q.approach = 1;
      await say('세 깃 그림자가 고리무늬 안전 발판 위에 하나로 겹쳤다!\n절벽을 때리던 바람이 잦아들며, 위로 오르는 좁은 길이 조용해졌다.');
      G.autosave();
    } else await say(on ? `안전 발판 위에 그림자가 ${on}개 겹쳐 있다. 바람이 조금 누그러졌다.` : '깃 그림자들이 바람에 밀려 자리를 옮겼다.');
  };
  Lg.sunTablet = async () => {
    const c = await G.choose(['바람막이 처음 자리로', '현장 일지 다시 읽기', '바람등성이 대피소로 돌아가기', '그만'], { title: '햇귀절벽 돌판', cancel: 3 });
    if (c === 0) { const z = sunSt(); z.a = 0; z.b = 0; z.calm = 0; sfx('rock'); await say('바람막이 두 개가 처음 방향으로 돌아갔다. 바람이 다시 거세진다.'); }
    else if (c === 1) await Lg.sunLog();
    else if (c === 2) { await G.fadeTo(1, 16); W().enter('ridge', 6, 22, 'down'); await G.fadeTo(0, 16); await say('바람등성이 대피소 앞으로 돌아왔다. 대피소에서 무료로 쉬어 갈 수 있다.'); }
  };
  // 현장 일지: fills in whatever part of the story you missed, so an old save can start right here
  Lg.sunLog = async () => {
    const q = Lg.st().quests.LQ01;
    await say('바람에 바랜 현장 일지 상자. 등대 정비사들과 등성이 관측자들이 남긴 기록이 들어 있다.');
    if (!Lg.has('LG_S03')) await recap('LG_S03', null, ['"따뜻한 바람이 불던 아침, 금빛 새가 등대 위를 지나 북서쪽 절벽으로." — 등대 정비 일지 사본'], null);
    if (!Lg.of('geumo').sighted) await recap('LG_S05', { geumo: ['heard', 'named'] }, ['"절벽 끝에 앉는 세 발 달린 새. 등성이 사람들은 금오라 부른다." — 바람 관측 노인의 메모'], null);
    q.started = 1; q.listen = 1; q.survey = 1;
    await say('"바람막이 두 개를 돌려 깃 그림자 셋을 고리무늬 돌 위에 모으면, 위로 오르는 길의 바람이 잔다.\n불·비행 동료나 특별한 기술은 필요 없다."');
    G.autosave();
  };
  Lg.sunGate = async () => {
    if (Lg.sunCalm()) return;
    await say('절벽 위로 오르는 좁은 길에 바람이 휘몰아친다. 이대로는 발을 디딜 수 없다.\n(바람막이를 돌려 깃 그림자 셋을 고리무늬 안전 발판에 겹쳐 보자)');
  };
  Lg.sunEnter = async () => {
    const z = sunSt();
    if (!z.entered) {
      z.entered = 1;
      await G.wait(10);
      await say('햇귀절벽. 해가 가장 먼저 닿는 절벽이다. 바람이 절벽을 타고 거세게 올라온다.\n바닥에 깃털 모양 그림자 셋이 일렁이고, 손으로 돌리는 바람막이 두 개가 서 있다.');
      if (!Lg.st().quests.LQ01.started || !Lg.has('LG_S03')) await say('입구 옆에 현장 일지 상자가 있다. 놓친 이야기가 있다면 읽어 보자.');
    }
    G.autosave();
  };
  // stepping onto the ledge: the observation (once); later visits go straight to the choice when you talk to 금오
  Lg.sunLedge = async () => {
    const r = Lg.of('geumo');
    if (r.captured || r.observed) return;
    await withTop((T, t) => legendCard(T, t, 'geumo'), async () => {
      sfx('wind');
      await say('바람이 잔 절벽 끝. 그곳에 금오가 앉아 있다.');
      G.audio && G.audio.cry('geumo');
      await say('금오가 긴 날개와 눈무늬 꼬리깃 세 줄을 천천히 펼쳤다.\n세 발로 바위를 딛고, 같은 높이에 선 이쪽을 똑바로 바라본다.');
      await say('처음 햇살들판에서 쫓아보고 싶었던 그 그림자다.\n금오는 서두르지 않는다. 작은 동료가 바람막이 사이를 지나오는 것까지 다 보았다는 듯이.');
    });
    await observed('geumo');
    await Lg.approach('geumo');
  };

  // ------------------------------------------------------------ LGZ02 월은못: out on the real stones, back on the hidden way
  Lg.MOON = { out: [[5, 6], [6, 6], [7, 6], [7, 5], [8, 5], [9, 5], [9, 4], [10, 4], [11, 4], [12, 4], [12, 3], [13, 3], [14, 3], [15, 3], [16, 3]],
    back: [[17, 5], [17, 6], [17, 7], [16, 7], [15, 7], [15, 8], [14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8], [8, 8], [7, 8], [6, 8], [5, 8]],
    S: [5, 6], basin: [19, 3], shore: [4, 8] };
  const moonSt = () => Lg.st().sites.LGZ02;
  Lg.moonLit = () => !!moonSt().lit;
  function lightBack(on) {
    const M2 = Lg.MOON;
    G.S.tiles = G.S.tiles || {};
    const t = G.S.tiles.lg_moonpool = G.S.tiles.lg_moonpool || {};
    M2.back.forEach(([x, y]) => { if (on) t[x + ',' + y] = '_'; else delete t[x + ',' + y]; });
    W().rebuild('lg_moonpool');
  }
  Lg.moonBasin = async () => {
    const z = moonSt();
    if (z.lit) { await say('달 문양 수반에 은빛 물이 고여 있다. 돌아오는 길의 발판이 물 위에 떠올라 있다.'); return; }
    await say('달 문양이 새겨진 수반이다. 물 위에 한 번도 본 적 없는 별자리가 비친다.');
    const ok = await G.ask('수반에 손을 담가 볼까?', ['담가 본다', '그만둔다']);
    if (!ok) return;
    z.lit = 1; sfx('psy');
    await F().play(60, (T, cx, cy, k) => { Lg.MOON.back.forEach(([x, y], i) => { const a = Math.min(1, Math.max(0, k * 20 - i)); T.fillStyle = `rgba(214,222,255,${(0.7 * a).toFixed(2)})`; T.fillRect(x * 16 + 2 - cx, y * 16 + 6 - cy, 12, 4); }); });
    lightBack(true);
    const q = Lg.st().quests.LQ02; q.started = 1; q.approach = 1;
    await say('나가는 길과는 다른 자리에, 물 위로 둥근 발판이 하나씩 떠올랐다.\n돌아오는 길이다. 물가로 돌아가 처음 발판을 비워 두자.');
    G.autosave();
  };
  Lg.moonReflection = async () => {
    await say('물에 비친 발판의 그림자다. 손을 뻗자 물결에 흔들려 흩어진다.\n진짜 발판은 물결에 흔들리지 않고, 가장자리에 이끼가 끼어 있다.');
  };
  Lg.moonTablet = async () => {
    const c = await G.choose(['발판 처음으로', '수첩 다시 읽기', '입구로 구조 요청 (무료)', '산등 야영지로 구조 요청 (무료)', '그만'], { title: '월은못 돌판', cancel: 4 });
    if (c === 0) { const z = moonSt(); z.lit = 0; lightBack(false); sfx('rock'); await say('돌아오는 길의 발판이 물속으로 가라앉았다. 처음 상태로 돌아왔다.'); }
    else if (c === 1) { await Lg.moonLog(); await F().notebook(3); }
    else if (c === 2) { await G.fadeTo(1, 16); W().enter('moonroom', 10, 4, 'left'); await G.fadeTo(0, 16); await say('달빛방으로 돌아왔다.'); }
    else if (c === 3) { await G.fadeTo(1, 16); W().enter('camp', 11, 2, 'down'); await G.fadeTo(0, 16); await say('구조대가 산등 야영지까지 데려다 주었다. 야영지 쉼터에서 무료로 쉬어 갈 수 있다.'); }
  };
  Lg.moonLog = async () => {
    const q = Lg.st().quests.LQ02;
    if (!Lg.has('LG_S02') && !Lg.has('LG_S04')) await recap('LG_S04', { wolbaek: ['heard', 'named'] }, ['돌판 아래 새겨진 글: "길을 기억하는 아홉 갈래 빛, 사람들은 월백이라 부른다. 나간 길과 돌아온 길이 다르다."'], null);
    q.started = 1; q.listen = 1; q.compare = 1;
    await say('돌판의 글: "물에 비친 길은 흔들리고, 실제 발판은 흔들리지 않는다. 끝의 수반에 닿으면 돌아오는 길이 뜬다.\n돌아온 뒤 처음 발판은 비워 둘 것."');
    G.autosave();
  };
  Lg.moonEnter = async () => {
    const z = moonSt();
    if (z.lit) lightBack(true);
    if (!z.entered) {
      z.entered = 1;
      await G.wait(10);
      await say('월은못. 뚫린 천장으로 달빛이 쏟아져, 고요한 물이 거울처럼 빛난다.\n물 위에 발판이 이어져 있다. 물에 비친 것과 진짜가 섞여 있는 것 같다.');
      if (!Lg.st().quests.LQ02.started) await say('물가의 돌판에 무언가 새겨져 있다. 놓친 이야기가 있다면 읽어 보자.');
    }
    G.autosave();
  };
  // back on the shore with the first stone empty: the nine tails light one by one (once)
  Lg.moonShore = async () => {
    const r = Lg.of('wolbaek');
    if (!Lg.moonLit() || r.captured || r.observed) return;
    const S0 = Lg.MOON.S;
    await withTop((T, t) => legendCard(T, t, 'wolbaek'), async () => {
      await say('물가로 돌아와 처음 발판을 바라보았다. 아무도 서 있지 않은 빈 발판.');
      sfx('psy');
      await F().play(100, (T, cx, cy, k) => {
        for (let i = 0; i < 9; i++) {
          const a = Math.min(1, Math.max(0, k * 11 - i)), ang = -2.6 + i * 0.36;
          const X = S0[0] * 16 + 8 - cx + Math.cos(ang) * 22, Y = S0[1] * 16 + 6 - cy + Math.sin(ang) * 16;
          G.disc(T, X, Y, 2 + a, `rgba(150,160,255,${(0.8 * a).toFixed(2)})`); T.fillStyle = `rgba(240,244,255,${a.toFixed(2)})`; T.fillRect(Math.round(X), Math.round(Y) - 1, 1, 1);
        }
      });
      Lg.of('wolbaek').present = 1; W().respawn();
      G.audio && G.audio.cry('wolbaek');
      await say('아홉 꼬리 끝에 청보랏빛 달불이 하나씩 켜졌다. 하나, 둘... 아홉.\n빈 발판 위에 은빛 여우 월백이 서 있다.');
      await say('월백이 푸른 눈으로 지나온 물길을 돌아본다. 나간 길과 돌아온 길, 두 줄의 발자국이 물 위에 은빛으로 남았다.\n떠나는 용기만큼 돌아올 자리를 남기는 마음도 길이 된다.');
    });
    await observed('wolbaek');
    await Lg.approach('wolbaek');
  };
  // is the legend standing at its sanctuary right now (for the map's npc entry)
  Lg.present = id => { const r = Lg.of(id); return !r.captured && (id === 'geumo' ? true : !!(r.observed || r.present)); };

  // ------------------------------------------------------------ the notebook: goals, places to revisit
  Lg.objectives = () => {
    if (!G.S) return [];
    const out = [], s = Lg.st();
    const g = Lg.of('geumo'), w = Lg.of('wolbaek'), q1 = s.quests.LQ01, q2 = s.quests.LQ02;
    const fh = F().unlocked('haul') && !!G.S.bag.harness;
    if (q1.started || (flag('q13') && flag('badge3') && flag('f_smash'))) {
      const d = !q1.started ? '돛바람항 정비사 세나에게 오래된 기상 일지 이야기를 듣자.'
        : !g.sighted ? '바람등성이 대피소 옆 전망 돌판에서 북서쪽 절벽을 살펴보자. 새벽을 기다릴 필요는 없다.'
        : !(fh && flag('q33')) ? '전망 돌판 옆 고리무늬 운반석 너머가 햇귀절벽이다. 괴력운반을 배우고 높은물길 조사(3장)를 마친 뒤 옮겨 보자.'
        : !g.observed ? '고리무늬 운반석을 옮겨 햇귀절벽으로. 바람막이 두 개를 돌려 깃 그림자 셋을 안전 발판에 겹치고 절벽 위로.'
        : g.captured ? '금오 관찰 완료 · 포획 완료.' : '금오 관찰 완료. 다시 다가가면 겨루거나 포획에 도전할 수도 있다(선택).';
      out.push({ done: !!g.observed, t: '해를 등에 진 새 (선택)', d, opt: 1 });
    }
    if (q2.started || flag('q17')) {
      const d = !q2.started ? '기억나루 옛길 기록실의 관리인 해솔에게 기록판의 은빛 여우 이야기를 듣자.'
        : !(fh && flag('q33') && flag('q08')) ? '달숨동굴 달빛방 옆 고리무늬 운반석 너머에 월은못이 있다. 괴력운반을 배우고 높은물길 조사(3장)를 마친 뒤 옮겨 보자.'
        : !w.observed ? '월은못: 물에 비친 발판과 진짜 발판을 구분해 끝의 수반까지 갔다가, 떠오른 다른 길로 돌아오자. 처음 발판은 비워 둘 것.'
        : w.captured ? '월백 관찰 완료 · 포획 완료.' : '월백 관찰 완료. 다시 다가가면 겨루거나 포획에 도전할 수도 있다(선택).';
      out.push({ done: !!w.observed, t: '달빛에 남은 귀로 (선택)', d, opt: 1 });
    }
    return out;
  };
  Lg.revisits = () => {
    if (!G.S) return [];
    const s = Lg.st(), out = [], fh = F().unlocked('haul') && !!G.S.bag.harness;
    const ent = id => !!(G.S.explored && G.S.explored[id]);
    if (s.sites.LGZ01.found) out.push({ t: '바람등성이 전망 바위 운반석', need: '괴력운반 · 높은물길 조사 뒤', open: fh && flag('q33'), done: ent('lg_suncliff'), d: '전망 돌판 옆 고리무늬 운반석 뒤 절벽 틈으로 바람이 새어 나온다. 너머에 길이 있는 것 같다.' });
    if (s.sites.LGZ02.found) out.push({ t: '달빛방 옆 운반석', need: '괴력운반 · 높은물길 조사 뒤', open: fh && flag('q33') && flag('q08'), done: ent('lg_moonpool'), d: '달숨동굴 달빛방 동쪽 벽의 고리무늬 운반석. 틈으로 서늘한 달빛이 스민다.' });
    return out;
  };

  // ------------------------------------------------------------ the dex: a 전설 page after the numbered entries
  Lg.listed = id => { const r = Lg.of(id); return !!(r.heard || r.trace || r.sighted || r.named || r.observed || r.captured || G.S.dex.seen[id] || G.S.dex.caught[id]); };
  Lg.dexIds = preview => (G.S ? D.LEGENDS.filter(id => preview || Lg.listed(id)) : []);
  Lg.dexRow = (id, preview) => {
    const r = Lg.of(id), caught = G.S.dex.caught[id], named = preview || r.named || caught || G.S.dex.seen[id];
    return { label: `${String(D.MONS[id].no).padStart(3, '0')}  ${named ? nm(id) : '???'}`, right: caught ? '포획' : r.observed ? '관찰' : r.sighted ? '목격' : G.S.dex.seen[id] ? '발견' : '흔적', color: caught || preview ? '#2c2f45' : '#6a3a8a' };
  };
  // what the page shows grows with the record: a trace mark → the silhouette (once seen) → name, types → the picture when caught
  Lg.dexTop = (T, id, preview) => {
    const r = Lg.of(id), sp = D.MONS[id], caught = preview || G.S.dex.caught[id], seen = G.S.dex.seen[id];
    const named = preview || r.named || caught || seen, typed = preview || r.observed || caught || seen, shape = preview || r.sighted || r.observed || caught || seen;
    G.menus.topCard(T, preview ? '도감 · 디자이너 미리보기' : '도감 · 전설 기록');
    const bw = G.menus.cardBox(id), x0 = 6 + bw + 8;
    G.box(T, 6, 24, bw, 84, G.STYLE.white, 4);
    if (shape) G.menus.drawCard(T, id, 6, 24, bw, 84, caught ? null : G.mons.silhouette(id, 'card', '#1c1c26'));
    else {   // only a trace so far: three gold points, or a silver hair
      const cx = 6 + bw / 2, cy = 66;
      if (id === 'geumo') [[-7, 4], [0, -5], [7, 4]].forEach(([dx, dy]) => G.disc(T, cx + dx, cy + dy, 3, '#e3b23c'));
      else { T.strokeStyle = '#9aa4c8'; T.lineWidth = 1; T.beginPath(); T.moveTo(cx - 14, cy + 6); T.quadraticCurveTo(cx, cy - 12, cx + 14, cy); T.stroke(); }
      G.textC(T, '?', cx, cy + 14, '#8a8270', null);
    }
    G.text(T, `No.${String(sp.no).padStart(3, '0')}  ${named ? sp.n : '???'}`, x0, 26, '#2c2f45', null);
    if (typed) { let bx = x0; sp.t.forEach(t => { bx += G.menus.typeBadge(T, t, bx, 44) + 3; }); }
    else G.text(T, '타입: ???', x0, 44, '#8a8270', null);
    const stage = caught ? '포획' : r.observed ? '관찰 완료' : r.sighted ? '목격' : seen ? '발견' : r.trace ? '흔적' : '소문';
    G.wrap(`전설 · ${stage}${sp.hab && (r.observed || caught) ? ' · ' + sp.hab : ''}`, 248 - x0).slice(0, 2).forEach((ln, k) => G.text(T, ln, x0, 64 + k * 15, '#6a3a8a', null));
    G.box(T, 6, 114, 244, 72, G.STYLE.white, 5);
    const recs = Lg.st().log.filter(k => REC[k] && REC[k].marks[id]).map(k => REC[k].t);
    const txt = caught ? sp.dex : (recs.length ? '기록: ' + recs.join(' · ') : '아직 기록이 없다.') + (typed ? '' : '  (자세한 모습은 직접 만나야 알 수 있다)');
    G.wrap(txt, 226).slice(0, 4).forEach((ln, k) => G.text(T, ln, 14, 122 + k * 16, '#36363f', null));
  };

  // ------------------------------------------------------------ encounter light: separate effects, never painted into the sprites
  // 월백: moon-fire on the nine tail tips, lighting one after another; 금오: the three sun eyes glint
  G.legendFx = (T, id, view, P0, scale, alpha, tt) => {
    const meta = G.mons.meta(id + ':' + view);
    if (!meta) return;
    const t = tt !== undefined ? tt : G.frame;
    T.save(); T.globalAlpha = Math.max(0, Math.min(1, alpha === undefined ? 1 : alpha));
    if (id === 'wolbaek' && meta.tips) {
      const n = meta.tips.length, cyc = 150, ph = t % cyc;
      meta.tips.forEach(([x, y], i) => {
        const on = ph > i * 9 && ph < i * 9 + 80 ? 1 : 0.25, fl = Math.sin((t + i * 7) / 4);
        const X = P0.x + x * scale, Y = P0.y + y * scale;
        T.fillStyle = `rgba(110,110,240,${(0.35 * on).toFixed(2)})`; T.fillRect(Math.round(X - 2), Math.round(Y - 3 - fl), 5, 4);
        T.fillStyle = `rgba(170,170,255,${(0.6 * on).toFixed(2)})`; T.fillRect(Math.round(X - 1), Math.round(Y - 4 - fl), 3, 3);
        T.fillStyle = `rgba(240,240,255,${(0.8 * on).toFixed(2)})`; T.fillRect(Math.round(X), Math.round(Y - 5 - fl), 1, 2);
      });
    } else if (id === 'geumo' && meta.eyes) {
      meta.eyes.forEach(([x, y], i) => {
        const a = 0.5 + 0.5 * Math.sin((t + i * 23) / 9);
        sparkle(T, P0.x + x * scale, P0.y + y * scale, `rgba(255,248,200,${(0.75 * a).toFixed(2)})`, a > 0.8 ? 2 : 1);
      });
      for (let i = 0; i < 4; i++) {   // a few embers rising off the wings
        const a = ((t / 60 + i / 4) % 1), X = P0.x + (20 + i * 26) * scale, Y = P0.y + (30 - a * 24) * scale;
        T.fillStyle = `rgba(255,190,90,${(0.6 * (1 - a)).toFixed(2)})`; T.fillRect(Math.round(X), Math.round(Y), 1, 1);
      }
    }
    T.restore();
  };
  // the legends' battle backdrops: the sun / moon disc and the light belong to the encounter, not to the creature
  G.legendBg = (kind, night) => {
    const B = G.battle;
    if (kind === 'sun') return B.makeBg(false, x => {
      G.disc(x, 186, 46, 40, 'rgba(255,214,130,0.45)'); G.disc(x, 186, 46, 30, 'rgba(255,232,170,0.85)'); G.disc(x, 186, 46, 22, '#fff2c8');
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; x.fillStyle = 'rgba(255,226,150,0.5)'; x.fillRect(Math.round(186 + Math.cos(a) * 46), Math.round(46 + Math.sin(a) * 46), 2, 2); }
    }, [[0, '#3a4a8a'], [0.6, '#f0a070'], [1, '#fbe0a0']]);
    return B.makeBg(true, x => {
      G.disc(x, 186, 42, 34, 'rgba(200,210,255,0.25)'); G.disc(x, 186, 42, 24, '#eef2ff'); G.disc(x, 180, 38, 5, 'rgba(200,206,236,0.8)'); G.disc(x, 192, 48, 3, 'rgba(200,206,236,0.8)');
    });
  };
})();

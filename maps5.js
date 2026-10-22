/* 모아루: 잠든 길의 노래 — chapter 2 world, part 2: 바위울림터널 → 기억나루 · 울림당 회랑 → 햇꽃정원길 → 잎향시(네 번째 관장전) · 유리온실 → 다음 해안 항로
   plus the chapter 2 data for the notebook and the map (layouts from _mapgen4.py; rows pasted in by the build) */
'use strict';
(function () {
  const G = window.G, M = G.MAPS, H = G.mapHelpers;
  const { flag, set, say, give, P } = H;
  const Wd = () => G.world, D = () => G.data, F = () => G.field;
  const visit = id => { G.S.visited = G.S.visited || {}; G.S.visited[id] = 1; };
  const num = k => (G.S.flags[k] | 0);
  const sfx = n => G.audio && G.audio.sfx(n);
  const ROWS = {
    tn1: [
      '##############################',
      '##############################',
      '###........#########........##',
      '###..cc....#########..H.....##',
      '###........###__####........##',
      '###........###__####........##',
      '###........###__####........##',
      '###........###__######__######',
      '####.........#JJ#.........####',
      '####......................####',
      '####......__________......####',
      '####......__________..r...####',
      '####...r..................####',
      '####......................####',
      '####......................####',
      '#############____#############',
      '#############____#############',
      '#############_xx_#############'],
    tn2: [
      '##############################',
      '##############################',
      '###_Y__u__#########.........##',
      '###_______#########...H.....##',
      '###_______J________.........##',
      '###_______J________.........##',
      '###_______#########.........##',
      '######################__######',
      '###________________________###',
      '###wwwwwwwwwwwwwwwwwgwwwwww###',
      '###wwwwwwwwwwwwwwwwwgwwwwww###',
      '###wwwwwwwwwwwwwwwwwgwwwwww###',
      '###wwwwwwwwwwwwwwwwwgwwwwww###',
      '###wwwwwwwwwwwwwwwwwgwwwwww###',
      '###wwwwwww__wwwwwwwwgwwwwww###',
      '###wwwwwww__gggggggggwwwwww###',
      '###wHwwwwwwwwwwwwwwwwwwwwww###',
      '###wwwwwwwwwwwwwwwwwwwwwwww###',
      '##############################',
      '##############################'],
    tn3: [
      '############################',
      '############################',
      '############........########',
      '############._......########',
      '############........########',
      '############........########',
      '########................####',
      '########..S.........S...####',
      '########................####',
      '##S_____................XXXx',
      '##______................XXXx',
      '##______................####',
      '##______........S.......####',
      '##__H___................####',
      '############################',
      '############################'],
    memory: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRT',
      'TRRRRRRRRRRRRRRRRRRRRRRRRRssNssRRT',
      'TRRRRRRRRRRRRRRRRRRRRRRRRRsssssRRT',
      'TRRRRRRRRRRRRRRRRRRRRRRRRRrsssrRRT',
      'TRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRT',
      'Tddd............==...............T',
      'T================================T',
      'T........l......==...#########l..T',
      'T..######.#####.==...#########...T',
      'T..######.#####.==.N.#########...T',
      'T..######.#####.==...#########...T',
      'T..##DD##.##D##.==...#########.N.T',
      'T...............==.N.####DD###...T',
      'T.............N.==...............T',
      'T.l............l==..l............T',
      'T================================T',
      'T...............==..........FFFF.T',
      'T..######.#####.==...#####..FFFF.T',
      'T..######.#####.==...#####..FFFF.T',
      'T..######.#####.==...#####..FFFF.T',
      'T..##D###.##D##.==...##D##..FFFF.T',
      'T...............==...............T',
      'T.FFFFF.........==.S....K...N....T',
      'T.FFFFF.......cc.=cc.............T',
      'TTTTTTTTTTTTTTcccmccTTTTTTTTTTTTTT'],
    echohall: [
      '############################',
      '############################',
      '###......#___S____#......###',
      '###..S...#________#...S..###',
      '###......#________#......###',
      '###......#________#......###',
      '###......####__####......###',
      '###...r..####__####..r...###',
      '###......####__####......###',
      '###......####__####......###',
      '###......................###',
      '###......................###',
      '###.......________.......###',
      '###......................###',
      '###......................###',
      '############____############',
      '############____############',
      '#############xx#############'],
    gardenroad: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T.........ww................ww.........T',
      'T.,,,,,,,.ww.FFFFFF..;;;;;;.ww.FFFFFFF.T',
      'T.,,,,,,,.ww.FFFFFF..;;;;;;.ww.FFFFFFF.T',
      'T.,,,,,,,.ww.FFFFFF..;;;;;;.ww.FFFFFFF.T',
      'T.,,,,,,,.ww.FFFFFF..;;;;;;.ww.FFFFFFF.T',
      'T.,,,,,,,.ww.FFFFFF..;;;;;;.ww.FFFFFFF.T',
      'T.........ww................ww.........T',
      'T=========nn================nn==========',
      'T..S......ww.......==.......ww......S..T',
      'T.FFFFFFF.ww.,,,,,.==.......ww.;;;;;;;.T',
      'T.FFFFFFF.ww.,,,,,.==...E...ww.;;;;;;;.T',
      'T.FFFFFFF.ww.,,,,,.==.b...b.ww.;;;;;;;.T',
      'T.FFFFFFF.ww.,,,,,.==....K..ww.;;;;;;;.T',
      'T.........ww.......==.......ww.........T',
      'TTTTTTTTTTTTTTTTTTT==TTTTTTTTTTTTTTTTTTT'],
    leafhyang: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..................==..................T',
      'T..############.FF.==.FFF........FFFFF.T',
      'T..############.FF.==.FFF.######.FFFFF.T',
      'T..############.FF.==.FFF.######.FFFFF.T',
      'T..############.FF.==.FFF.######.FFFFF.T',
      'T..############.FF.==.FFF.##D###.FFFFF.T',
      'T..############.FF.==.FFF........FFFFF.T',
      'T..#####DD#####.FF.==.FFF........FFFFF.T',
      'T...............FF.==..................T',
      'T..................==..................T',
      '=======================================T',
      'T.......l.......l..==..########l.......T',
      'T.######..#####....==..########........T',
      'T.######..#####....==..########........T',
      'T.######..#####....==..########........T',
      'T.##DD##..##D##....==..###DD###........T',
      'T..................==..................T',
      'TwwwwwwwwwwwwwwwwwwnnwwwwwwwwwwwwwwwwwwT',
      'T..................==..................T',
      'T======================================T',
      'T.......l..........==.S........l.......T',
      'T.#######..######..==..######..........T',
      'T.#######..######..==..######...FFFFFF.T',
      'T.#######..######..==..######...FFFFFF.T',
      'T.###D###..###D##..==..###D##...FFFFFF.T',
      'T..................==.........K.FFFFFF.T',
      'T..................==...........FFFFFF.T',
      'T..................==..................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'],
    greenhouse: [
      'HHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
      'H...S...b....S....b...S...XXXH',
      'H.FFFFFFb..FFFFFF.b.FFFFFFXXXH',
      'H.FFFFFFb..FFFFFF.b.FFFFFFXXXH',
      'H.FFFFFFb..FFFFFF.b.FFFFFF...H',
      'H.......b.........b..........H',
      'H.......b.........b..........H',
      'H...v...b....v....b...v......H',
      'H.......b.........b..........H',
      'H=======V=========V==========H',
      'H,,,,,,,,,,,..=..,,,,,,,,,,,,H',
      'H,,,,,,,,,,,..=..,,,,,,,,,,,,H',
      'H,,,,,,,,,,,..=..,,,,,,,,,,,,H',
      'HwwwwwwwwwwwwwwwwwwwwwwwwwwwwH',
      'HwwwwwwwwwwwwwwwwwwwwwwwwwwwwH',
      'H.............=..............H',
      'H.............=..............H',
      'H============================H',
      'HFFFF.........=..........FFFFH',
      'HFFFF.........=..........FFFFH',
      'H.............==.............H',
      'HHHHHHHHHHHHHHDDHHHHHHHHHHHHHH'],
    searoute: [
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
      'OOOOOOOOOOOOOOOOOOOOOOOOOssssT',
      'OOOOOOOOOOOOOOOOOOOOOOOOOs...T',
      'OOOOOOOOOOOOOOOOOOOOOOOOOs...T',
      'OOOOOOOOOOOOOOOOOOOOOOOOOs.S.T',
      'OOOOOOOOssOOOOOOOOOOOOOOOs...T',
      'OOOOOOOOsssOOOOOOOOOOOOOOs...T',
      'OOOOOOOOOsOOOOOOOOOOOOOOds==.T',
      'OOOOOOOOOOOOOOOOOOOOOOOOds==.T',
      'OOOOOOOOOOOOOOOOOOOOOOOOOs...T',
      'OOOOOOOOOOOOOOOOOOOOOOOOOs...T',
      'OOOOOOOOOOOOOOOOOOOOOOOOOs...T',
      'OOOOOOOOOOOOOOOOOOOOOOOOOs...T',
      'OOOOOOOOOOOOOOOOOOOOOOOOOs...T',
      'OOOOOOOOOOOOOOOOOOOOOOOOOs...T',
      'OOOOOOOOOOOOOOOOOOOOOOOOOssssT']
  };
  const STOCK2 = H.STOCK2;
  const shutter = (T, x, y, cx, cy) => { const X = x * 16 - cx, Y = y * 16 - cy; T.fillStyle = '#5a6670'; T.fillRect(X, Y, 16, 16); T.fillStyle = '#f2d23a'; for (let i = 0; i < 16; i += 6) T.fillRect(X + i, Y + 6, 3, 3); };

  // ------------------------------------------------------------ D06 바위울림터널 (Q16)
  const tnRescue = () => flag('tn_frommem') ? { map: 'memory', x: 17, y: 24, dir: 'up' } : { map: 'ridge', x: 18, y: 2, dir: 'down' };
  const lift = async (to) => {
    if (!flag('q16')) { await say('작업용 승강로다. 출구층 쪽 전원이 끊겨 움직이지 않는다.'); return; }
    const ok = await G.ask(to === 'exit' ? '터널 승강로를 타고 출구층(기억나루 쪽)으로 갈까?' : '터널 승강로를 타고 입구층(바람등성이 쪽)으로 갈까?');
    if (!ok) return;
    sfx('door');
    await G.fadeTo(1, 20);
    if (to === 'exit') Wd().enter('tn3', 13, 4, 'down'); else Wd().enter('tn1', 14, 5, 'down');
    await G.fadeTo(0, 20);
    await say('덜컹덜컹... 승강로가 반대편 층에 닿았다.');
  };
  M.tn1 = {
    name: '바위울림터널 입구층', floorName: '입구층', kind: 'cave', bgm: 'cave', rows: ROWS.tn1,
    dark: { lamp: 72, none: 24 }, rescue: tnRescue,
    warps: [{ x: 14, y: 17, to: 'ridge', tx: 18, ty: 2, dir: 'down', tdir: 'down' }, { x: 15, y: 17, to: 'ridge', tx: 18, ty: 2, dir: 'down', tdir: 'down' },
      { x: 22, y: 3, to: 'tn2', tx: 22, ty: 4, tdir: 'down' }],
    items: [{ id: 'potion', x: 5, y: 6, flag: 'tn1_potion' }, { id: 'rope', x: 27, y: 6, flag: 'tn1_rope' }, { id: 'goldcube', x: 9, y: 2, flag: 'tn1_cube' }],
    objects: { '14,4': () => lift('exit'), '15,4': () => lift('exit') },
    npcs: [
      { id: 'tw1', char: 'worker', x: 22, y: 7, dir: 'down', sight: 4,
        trainer: { flag: 'tr_tw1', title: '새길상회 작업자', name: '기태', char: 'worker', team: [['heukkori', 27], ['jagalkong', 27]], base: 26,
          before: '터널 공사 중이야! 여긴 관계자만!', lose: '...공사가 또 늦어지겠군.', after: '지하층에 물이 차서 우리도 골치야. 배수로를 메운 게 문제라던데... 쉿.' } },
      { id: 'tn_hint', char: 'seokho', x: 6, y: 9, dir: 'right', name: '견습 탐굴사',
        text: '바위울림터널이에요. 층무늬 벽 보이죠? 달숨동굴이랑 읽는 법은 같아요.\n가운데 금 간 낙석 뒤는 작업용 승강로예요. 출구 전원이 돌아와야 움직여요.' }],
    drawExtra: (T, cx, cy) => {
      const X = 14 * 16 - cx, Y = 4 * 16 - cy;
      T.fillStyle = '#3a3e48'; T.fillRect(X, Y, 32, 14); T.fillStyle = flag('q16') ? '#7cf08a' : '#6a7080'; T.fillRect(X + 2, Y + 2, 28, 10);
      T.fillStyle = '#9aa0a8'; T.fillRect(X + 2, Y + 2, 28, 2); T.fillStyle = '#2a2a30'; T.fillRect(X + 15, Y - 18, 2, 18);
    },
    onEnter: async () => { visit('tunnel'); set('tn_frommem', 0); if (!flag('tn1_seen')) { set('tn1_seen'); await G.wait(10); await say('바위벽이 낮게 웅웅 울린다. 층층이 무늬가 새겨진 오래된 터널이다.'); } }
  };
  const drain = async () => {
    const t = G.S.tiles = G.S.tiles || {}, o = t.tn2 = t.tn2 || {};
    const m = Wd().getMap('tn2');
    for (let y = 9; y <= 17; y++) for (let x = 3; x <= 26; x++) if (m.at(x, y) === 'w') o[x + ',' + y] = '_';
    Wd().rebuild('tn2');
  };
  M.tn2 = {
    name: '바위울림터널 지하층', floorName: '지하층', kind: 'cave', bgm: 'cave', rows: ROWS.tn2,
    dark: { lamp: 64, none: 22 }, rescue: tnRescue,
    warps: [{ x: 22, y: 3, to: 'tn1', tx: 22, ty: 4, tdir: 'down' }, { x: 4, y: 16, to: 'tn3', tx: 5, ty: 13, tdir: 'right' }],
    items: [{ id: 'superpotion', x: 10, y: 14, flag: 'tn2_spot' }, { id: 'awake', x: 26, y: 2, flag: 'tn2_awake' }],
    objects: {
      '7,2': async () => {
        if (flag('tn_part')) { await say('배수 부품이 홈에 꼭 맞게 끼워져 있다.'); return; }
        if (!G.S.bag.drainpart) { await say('배수 장치의 홈이다. 부품 하나가 빠져 있어 물길이 막혀 있다.'); return; }
        const ok = await G.ask('배수 부품을 홈에 끼울까?'); if (!ok) return;
        D().useItem('drainpart'); F().setTile('tn2', 7, 2, 'U'); set('tn_part'); sfx('knock2');
        await say('배수 부품을 끼웠다! 이제 옆의 배수 레버를 당기면 물이 빠질 것 같다.');
      }
    },
    onLever: async (x, y) => {
      if (flag('tn_drain')) { await say('배수 레버가 내려가 있다. 지하층의 물이 모두 빠졌다.'); return; }
      if (!flag('tn_part')) { await say('배수 레버를 당겨 봤지만 덜컥 걸린다. 오른쪽 홈에 부품이 빠져 있어 물길이 막혀 있다.'); return; }
      F().setTile('tn2', 4, 2, 'Z'); sfx('water'); Wd().shake = 10;
      await F().play(70, (T, cx, cy, k) => { T.fillStyle = `rgba(80,140,220,${0.45 * (1 - k)})`; T.fillRect(0, 0, 256, 192); });
      await drain();
      set('tn_drain');
      await say('쿠르르릉... 배수로가 다시 열리며 고여 있던 물이 빠져나갔다!\n물에 잠겼던 아래쪽 바닥과 사다리가 드러났다.');
    },
    npcs: [
      { id: 'tw2', char: 'worker', x: 15, y: 5, dir: 'right', sight: 3,
        trainer: { flag: 'tr_tw2', title: '새길상회 작업반장', name: '두식', char: 'worker', team: [['deuldori', 28], ['heukkori', 28]], base: 28,
          before: '배수로 일은 내가 맡았어. 함부로 손대지 마!', lose: '...그래, 그래. 사실 나도 찜찜했어.',
          after: '배수 부품은 홈에 끼우고 레버를 당기면 돼. 감독이 물을 막아 두라고 했지만...',
          afterWin: async () => {
            await say('터널을 빨리 뚫으려고 배수로를 메웠더니 안쪽에 물이 차 버렸어.\n이게 빼 둔 배수 부품이야. 저 안쪽 홈에 끼우고 레버를 당기면 물이 빠질 거야.', '새길상회 작업반장 두식');
            await give('drainpart', 1);
          } } }],
    onEnter: async () => {
      visit('tunnel');
      if (!flag('tn2_seen')) { set('tn2_seen'); await G.wait(10); await say('발밑 아래로 시커먼 물이 고여 있다. 물이 빠지지 않아 길이 잠겨 버렸다.\n난간 같은 쇠발판이 물 위로 이어져 있다.'); }
    }
  };
  // tn3: three vibration markers, low -> middle -> high, open the exit door
  const MARK = { '10,7': { r: 0, n: '낮게 웅— 하고 울리는 표식' }, '16,12': { r: 1, n: '중간 높이로 우웅— 울리는 표식' }, '20,7': { r: 2, n: '높게 찌잉— 울리는 표식' } };
  const markAt = async (key) => {
    const mk = MARK[key];
    if (flag('q16')) { await say(`${mk.n}이다. 지금은 고르게 울리고 있다.`); return; }
    const echo = F().unlocked('echo') && F().actor('echo');
    await say(`${mk.n}이다.` + (echo ? `\n(메아리 탐색: ${['첫', '두', '세'][mk.r]} 번째로 확인할 표식이다)` : ''));
    const ok = await G.ask('이 표식의 울림을 확인해 기록할까?'); if (!ok) return;
    const seq = num('tn3_seq');
    if (mk.r !== seq) {
      set('tn3_seq', 0); sfx('bump');
      await say('울림이 엉켜 흩어졌다... 안내판의 순서대로 처음부터 다시 확인하자.\n(낮은 울림 → 중간 울림 → 높은 울림)');
      return;
    }
    set('tn3_seq', seq + 1); sfx('select');
    if (seq + 1 < 3) { await say(`울림을 기록했다. (${seq + 1}/3)`); return; }
    for (const [x, y] of [[24, 9], [25, 9], [26, 9], [24, 10], [25, 10], [26, 10]]) F().setTile('tn3', x, y, '_');
    sfx('knock2'); Wd().shake = 10;
    set('q16');
    await say('세 울림이 하나로 겹치자 출구의 돌문이 천천히 열렸다!\n바깥 공기가 흘러 들어온다.');
    await say('돌문 옆에 상회 작업자들이 흘린 서류 묶음이 있다...');
    await give('oldcopy', 1);
    await say('훼손된 옛길 기록 사본이다. 이 산 너머 마을의 옛길이 그려져 있지만 군데군데 지워져 있다.\n그리고 터널 승강로에도 전원이 들어왔다! 이제 입구층과 출구층을 바로 오갈 수 있다.');
  };
  M.tn3 = {
    name: '바위울림터널 출구층', floorName: '출구층', kind: 'cave', bgm: 'cave', rows: ROWS.tn3,
    dark: { lamp: 64, none: 22, spots: [{ x: 26, y: 9, r: 34, a: 0.9, cond: () => flag('q16') }] }, rescue: tnRescue,
    warps: [{ x: 4, y: 13, to: 'tn2', tx: 5, ty: 16, tdir: 'right', gated: 1 }, { x: 27, y: 9, to: 'memory', tx: 17, ty: 24, dir: 'right', tdir: 'up' }, { x: 27, y: 10, to: 'memory', tx: 17, ty: 24, dir: 'right', tdir: 'up' }],
    signs: { '2,9': '탐굴 안내판\n"출구 돌문은 세 진동 표식이 맞물리면 열림.\n확인 순서: 낮은 울림 → 중간 울림 → 높은 울림"' },
    objects: { '10,7': () => markAt('10,7'), '16,12': () => markAt('16,12'), '20,7': () => markAt('20,7'), '13,3': () => lift('entry') },
    drawExtra: (T, cx, cy) => {
      if (!flag('q16')) { const X = 24 * 16 - cx, Y = 9 * 16 - cy; T.fillStyle = '#3a3028'; T.fillRect(X, Y - 4, 48, 36); T.fillStyle = '#5c4a3a'; T.fillRect(X + 2, Y - 2, 44, 33); T.fillStyle = '#7c6650'; T.fillRect(X + 4, Y, 40, 2); for (let i = 0; i < 3; i++) { T.fillStyle = i < num('tn3_seq') ? '#7cf08a' : '#b8a8ff'; T.fillRect(X + 10 + i * 12, Y + 12, 6, 6); } }
      const X = 13 * 16 - cx, Y = 3 * 16 - cy; T.fillStyle = '#3a3e48'; T.fillRect(X - 8, Y, 32, 14); T.fillStyle = flag('q16') ? '#7cf08a' : '#6a7080'; T.fillRect(X - 6, Y + 2, 28, 10);
    },
    onEnter: async () => { visit('tunnel'); }
  };

  // ------------------------------------------------------------ M05 기억나루 (Q17)
  const bridgeDown = () => { for (let y = 0; y <= 5; y++) { F().setTile('memory', 16, y, 'd'); F().setTile('memory', 17, y, 'd'); } };
  M.memory = {
    name: '기억나루', kind: 'out', bgm: 'shrine', rows: ROWS.memory,
    buildings: [
      { k: 'center', x: 3, y: 9, w: 6, h: 4, roof: 'red', wall: '#fbf6ee' },
      { k: 'shop', x: 10, y: 9, w: 5, h: 4, roof: 'navy', wall: '#f4f2fa' },
      { k: 'house', x: 21, y: 8, w: 9, h: 6, roof: 'navy', wall: '#efe8f4', wallH: 36, label: '울림당' },
      { k: 'house', x: 3, y: 18, w: 6, h: 4, roof: 'grey', wall: '#f2eef6', label: '기록실' },
      { k: 'house', x: 10, y: 18, w: 5, h: 4, roof: 'navy', wall: '#f6f0e4', label: '쉼터' },
      { k: 'house', x: 21, y: 18, w: 5, h: 4, roof: 'grey' }],
    props: [{ k: 'boat', x: 4, y: 5 }],
    warps: [
      { x: 5, y: 12, to: 'center_k', tx: 5, ty: 6, dir: 'up' }, { x: 6, y: 12, to: 'center_k', tx: 6, ty: 6, dir: 'up' },
      { x: 12, y: 12, to: 'shop_k', tx: 4, ty: 5, dir: 'up' },
      { x: 25, y: 13, to: 'echohall', tx: 13, ty: 16, dir: 'up', tdir: 'up' }, { x: 26, y: 13, to: 'echohall', tx: 14, ty: 16, dir: 'up', tdir: 'up' },
      { x: 5, y: 21, to: 'archive', tx: 4, ty: 4, dir: 'up' }, { x: 12, y: 21, to: 'inn', tx: 4, ty: 4, dir: 'up' }, { x: 23, y: 21, to: 'house_k1', tx: 3, ty: 5, dir: 'up' },
      { x: 17, y: 25, to: 'tn3', tx: 26, ty: 9, dir: 'down', tdir: 'left', gated: 1 }],
    links: { n: { to: 'gardenroad', dx: 3, gated: 1, cond: () => flag('q17') } },
    signs: { '19,23': '기억나루\n"잊힌 길을 기억하는 나루" ▲ 북쪽 보행길: 햇꽃정원길 (발판 보수 중)' },
    onMark: async (x, y) => {
      await say('오래된 길 표지석이다. 이끼 아래로 "옛 나루길" 이라는 글자가 희미하게 보인다.');
      if (G.S.bag.compass && !flag('q17')) await say('길비나침반 바늘이 표지석을 잠깐 가리키더니, 다시 울림당 쪽으로 돌아간다.');
    },
    npcs: [
      { id: 'haesol_m', char: 'haesol', x: 24, y: 14, dir: 'down', name: '관리인 해솔', cond: () => flag('q17_start') && !flag('q17'),
        talk: async () => {
          const N = '관리인 해솔';
          if (!(flag('eh_m1') && flag('eh_m2') && flag('eh_m3'))) { await say('울림당 회랑의 표지는 세 곳이에요. 길비나침반 바늘이 아직 기록하지 않은 표지를 가리킬 거예요.\n동굴등을 켜고 천천히 둘러봐요.', N); return; }
          await say('세 표지를 모두 대조했군요! 자, 그 사본을 이리...', N);
          G.audio && G.audio.sfx('sparkle');
          await F().play(60, (T, cx, cy, k) => { T.fillStyle = `rgba(230,220,255,${0.5 * Math.sin(Math.PI * k)})`; T.fillRect(0, 0, 256, 192); });
          if (G.S.bag.oldcopy) D().useItem('oldcopy');
          await say('잘못 옮겨진 조각들이 제자리를 찾았어요. 이게 복원한 옛길 지도예요.\n북쪽 보행길의 방향과 큰 지형이 드러났죠. 샛길은 직접 걸으며 채워 가요.', N);
          await give('map06', 1);
          await say('(메뉴의 [지도]에 기억나루 북쪽 일대가 더해졌다)');
          await give('bookmark', 1, true); await give('canalplan', 1, true); await give('tm_refresh', 1, true);
          await say(`${P()}${G.josa(P(), '은', '는')} 기억의 책갈피, 상회의 옛 수로 도면, 교본: 맑은숨을 받았다!`);
          await say('그 도면은 잎향시 수로에 설치된 상회 장비 위치예요. 정원도시에도 같은 문제가 있을지 몰라요.\n맑은숨 교본은 졸음과 상태이상을 스스로 푸는 기술이고요.', N);
          set('q17');
          await say('그럼, 보수하던 발판을 내릴게요!', N);
          sfx('door'); bridgeDown(); Wd().shake = 6;
          await say('강 위로 나무 발판이 놓였다! 안개가 걷히며 북쪽 보행길이 보인다.');
          Wd().respawn();
        } },
      { id: 'mm_elder', char: 'elder', x: 14, y: 15, dir: 'down', name: '나루 할머니',
        text: () => flag('q17') ? '안개가 걷히니 강 건너 정원길이 훤히 보이는구나. 옛 여행자들도 저 길로 다녔단다.' : '안개 정령은 오래된 길의 울림에서 태어난 아이들이란다. 무서운 존재가 아니야.\n길이 끊기면 안개가 짙어지고, 길이 이어지면 안개가 걷히지.' },
      { id: 'mm_kid', char: 'kidB', x: 20, y: 22, dir: 'left', move: 'wander', name: '나루 아이', text: '숨솜은 손에 잡힐 듯 말 듯 해. 가까이 가면 부끄러워서 숨어 버려!' },
      { id: 'mm_woman', char: 'woman', x: 30, y: 15, dir: 'left', name: '종이등 장인', text: '이 마을 종이등은 옛길 표지마다 하나씩 걸었대요. 길 잃은 여행자가 불빛을 따라오도록.' },
      { id: 'mm_ferry', char: 'ferry', x: 4, y: 7, dir: 'up', name: '나룻배 사공', text: '강물이 불어서 나룻배는 쉬는 중이에요. 터널 배수로가 열렸으니 곧 물도 잦아들겠죠.' },
      { id: 'mm_sumsom', mon: 'sumsom', act: 'splash', x: 30, y: 10, dir: 'left', text: '숨솜이 표지석 옆에서 둥실 떠오르더니, 수줍게 뒤로 숨었다.' },
      { id: 'mm_coach', char: 'man', x: 18, y: 17, dir: 'down', name: '연합마차 마부', cond: () => flag('badge4'), talk: () => H.coach('memory') }],
    drawExtra: (T, cx, cy) => {
      if (flag('q17')) return;   // the mist over the river lifts once the old road is restored
      for (let i = 0; i < 9; i++) {
        const x = ((i * 53 + G.frame * 0.3) % (34 * 16 + 80)) - 40 - cx, y = 8 + (i % 4) * 22 - cy;
        T.fillStyle = 'rgba(236,236,250,0.32)'; T.fillRect(x, y, 70, 12); T.fillRect(x + 10, y - 4, 50, 4);
      }
    },
    onEnter: async () => {
      visit('memory');
      if (flag('q17') && Wd().getMap('memory').at(16, 3) !== 'd') bridgeDown();
      const p = Wd().player; if (p.y >= 23) set('tn_frommem', 1);
      if (flag('q16') && !flag('q17_start')) {
        set('q17_start');
        await G.wait(16);
        const N = '관리인 해솔';
        await say('...터널 쪽에서 사람이? 안개가 걷혀서 놀랐더니, 당신이 돌문을 연 거군요.', N);
        await say('저는 이 나루의 옛길 기록을 지키는 관리인 해솔이에요.\n그 서류... 상회가 우리 울림당 기록을 베껴 간 사본이네요. 군데군데 지워졌지만.', N);
        await say('울림당 회랑의 표지 세 곳과 대조하면 원래 길을 복원할 수 있어요.\n이 길비나침반을 빌려줄게요. 흐릿해진 표지 쪽을 가리켜요.', N);
        await give('compass', 1);
        await say('울림당은 마을 동쪽 큰 건물이에요. 고스트 동료가 없어도 괜찮아요. 나침반이면 충분해요.\n지치면 쉼터에서 무료로 쉬어 가요.', N);
        Wd().respawn();
      }
    }
  };
  H.center('center_k', '기억나루', 'memory', 5, 13);
  H.shop('shop_k', '기억나루', 'memory', 12, 13, STOCK2);
  H.house('house_k1', '기억나루', 'memory', 23, 22, [
    { id: 'k1', char: 'man', x: 5, y: 2, dir: 'down', name: '아저씨',
      text: '새길상회가 산을 뚫는다더니, 우리 마을 옛길 기록을 빌려 갔다가 안 돌려줬어요.\n...어쩐지 안개가 짙어지더라니.' }]);
  M.archive = {
    name: '옛길 기록실', kind: 'in', bgm: 'shrine',
    rows: ['#W######W#', 'BBBB..BBBB', '..........', '...tttt...', '..........', '....x.....'],
    warps: [{ x: 4, y: 5, to: 'memory', tx: 5, ty: 22, dir: 'down' }],
    objects: { '3,3': async () => say(flag('q17') ? '복원한 옛길 지도가 펼쳐져 있다. 북쪽 보행길이 정원도시까지 이어진다.' : '찢어진 옛길 지도 조각들이 탁자 위에 흩어져 있다.'), '4,3': async () => say('옛 여행자들의 기록장. "울림이 곧 길이다" 라는 문장이 여러 번 적혀 있다.') },
    npcs: [
      { id: 'haesol_a', char: 'haesol', x: 6, y: 2, dir: 'down', name: '관리인 해솔', cond: () => flag('q17'),
        text: '잎향시 수로에도 상회 장비가 있을 거예요. 그 도면을 약초사 미루에게 보여 주면 도움이 될 거예요.' },
      { id: 'ar_clerk', char: 'clerk', x: 2, y: 2, dir: 'down', name: '기록 담당',
        text: '이 기록실엔 대륙 옛길의 기록이 모여 있어요. 상회가 베껴 간 기록도 여기 원본이 있죠.' }]
  };
  M.inn = {
    name: '나루 쉼터', kind: 'in', bgm: 'shrine', heal: [4, 3],
    rows: ['#W######W#', 'b..b..b..p', '..........', '..tt......', '..........', '....x.....'],
    warps: [{ x: 4, y: 5, to: 'memory', tx: 12, ty: 22, dir: 'down' }],
    npcs: [
      { id: 'inn_k', char: 'woman', x: 7, y: 3, dir: 'left', name: '쉼터 주인',
        talk: async () => {
          const ok = await G.ask('나루 쉼터예요. 무료로 한숨 자고 가요?', ['쉬어 갈게요', '괜찮아요'], { name: '쉼터 주인' });
          if (!ok) return;
          await G.fadeTo(1, 20); await G.menus.heal(); await G.wait(30); await G.fadeTo(0, 20);
          await say('푹 자고 일어나니 몸이 가볍다! 동료들도 기운이 넘친다.');
        } }]
  };

  // ------------------------------------------------------------ D08 울림당 회랑 (Q17)
  const EH = { '5,3': 'eh_m1', '13,2': 'eh_m2', '22,3': 'eh_m3' };
  const EHN = { eh_m1: '서쪽 표지', eh_m2: '가운데 표지', eh_m3: '동쪽 표지' };
  const ehMark = async key => {
    const k = EH[key];
    if (flag(k)) { await say('이미 기록과 대조한 표지다. 글자가 또렷하게 읽힌다.'); return; }
    if (!G.S.bag.compass) { await say('흐릿한 표지석이다. 글자가 너무 희미해서 읽을 수 없다.'); return; }
    sfx('sparkle');
    await say(`길비나침반을 대자 ${EHN[k]}의 흐릿한 글자가 떠올랐다!\n사본의 지워진 부분과 대조해 옮겨 적었다.`);
    set(k);
    const n = Object.values(EH).filter(flag).length;
    if (n < 3) { await say(`(${n}/3) 나침반 바늘이 다음 표지 쪽으로 돌아간다.`); return; }
    set('q17_marks');
    await say('세 표지를 모두 대조했다! 사본의 빈칸이 모두 채워졌다.\n울림당 앞의 해솔에게 돌아가자.');
  };
  M.echohall = {
    name: '울림당 회랑', kind: 'cave', theme: 'works', bgm: 'shrine', rows: ROWS.echohall,
    dark: { lamp: 72, none: 26, col: 'rgba(22,16,40,0.92)', spots: [{ x: 13, y: 15, r: 30, a: 0.7 }] },
    rescue: { map: 'memory', x: 25, y: 14, dir: 'down' },
    warps: [{ x: 13, y: 17, to: 'memory', tx: 25, ty: 14, dir: 'down', tdir: 'down' }, { x: 14, y: 17, to: 'memory', tx: 26, ty: 14, dir: 'down', tdir: 'down' }],
    objects: { '5,3': () => ehMark('5,3'), '13,2': () => ehMark('13,2'), '22,3': () => ehMark('22,3') },
    items: [{ id: 'awake', x: 4, y: 13, flag: 'eh_awake' }, { id: 'superpotion', x: 23, y: 9, flag: 'eh_spot' }],
    drawExtra: (T, cx, cy) => {
      if (!G.S.bag.compass || flag('q17_marks')) return;
      const p = Wd().player, left = Object.keys(EH).filter(k => !flag(EH[k])).map(k => k.split(',').map(Number));
      if (!left.length) return;
      left.sort((a, b) => Math.hypot(a[0] - p.x, a[1] - p.y) - Math.hypot(b[0] - p.x, b[1] - p.y));
      const [tx, ty] = left[0], a = Math.atan2(ty - p.y, tx - p.x);
      G.disc(T, 234, 22, 15, '#3a2e26'); G.disc(T, 234, 22, 13, '#f4ead2'); G.disc(T, 234, 22, 2, '#3a2e26');
      T.strokeStyle = '#c84a3c'; T.lineWidth = 2; T.beginPath(); T.moveTo(234, 22); T.lineTo(234 + Math.cos(a) * 11, 22 + Math.sin(a) * 11); T.stroke();
    },
    onEnter: async () => { visit('echohall'); if (!flag('eh_seen')) { set('eh_seen'); await G.wait(10); await say('울림당 회랑. 벽마다 옛 여행자들의 표지가 새겨져 있다.\n길비나침반 바늘이 어둠 속 어딘가를 가리킨다.'); } }
  };

  // ------------------------------------------------------------ R11 햇꽃정원길
  M.gardenroad = {
    name: '햇꽃정원길', kind: 'out', bgm: 'route', rows: ROWS.gardenroad,
    links: { s: { to: 'memory', dx: -3, gated: 1 }, e: { to: 'leafhyang', dy: 3 } },
    signs: { '3,9': '전망대\n"남쪽으로 기억나루와 바위울림산이 내려다보입니다"', '36,9': '햇꽃정원길\n▶ 동쪽: 잎향시   ▼ 남쪽: 기억나루' },
    items: [{ id: 'brazierpart', x: 6, y: 8, flag: 'gr_part' }, { id: 'hyperpotion', x: 4, y: 3, flag: 'gr_hyper' }, { id: 'revive', x: 34, y: 12, flag: 'gr_revive' }],
    onBrazier: async () => grBrazier(),
    npcs: [
      { id: 'gr_keeper', char: 'gardener', x: 25, y: 11, dir: 'left', name: '화로 쉼터지기', talk: () => grBrazier() },
      { id: 'gr_dog', mon: 'hwarogyeon', act: 'hop', x: 23, y: 10, dir: 'down', text: '공용 화로견이 화롯불 곁에서 꾸벅꾸벅 졸고 있다. 불 동료가 없는 여행자도 도와준다고 한다.' },
      { id: 'gr1', char: 'gardener', x: 15, y: 7, dir: 'down', sight: 1,
        trainer: { flag: 'tr_gr1', title: '정원사', name: '초록', char: 'gardener', team: [['ipppuri', 29], ['yeoubul', 30]], base: 22,
          before: '꽃길을 지나가려면 꽃처럼 활짝 웃으며 승부!', lose: '꽃잎이 흩날리네...', after: '잎향시 꽃들이 요즘 향기가 너무 짙어. 머리가 어질어질하다니까.' } },
      { id: 'gr2', char: 'woman', x: 33, y: 9, dir: 'up', sight: 1,
        trainer: { flag: 'tr_gr2', title: '산책 아가씨', name: '해별', char: 'woman', team: [['bangulssak', 30], ['bulbari', 30], ['napul', 30]], base: 24,
          before: '정원길 산책엔 승부가 빠질 수 없죠!', lose: '햇볕처럼 따끈한 승부였어요.', after: '여우불은 불씨돌로 진화해요. 진화해도 예전 기술은 센터에서 복습할 수 있어요.' } }],
    onEnter: async () => { visit('gardenroad'); }
  };
  // Q21-F (second fire stone): the public brazier on the garden road
  async function grBrazier() {
    const N = '화로 쉼터지기';
    if (!flag('badge3')) { await say('공용 화로 쉼터예요. 지나가는 여행자 누구나 몸을 녹이고 가요.', N); return; }
    if (flag('q21f_b')) { await say('화로가 고르게 타요. 불꽃 안전 수업, 잘 기억해 둬요!', N); await G.menus.heal(); return; }
    if (!G.S.bag.brazierpart) { await say('화로 받침 부품 하나가 빠져서 불이 자꾸 꺼져요. 길 어딘가에 떨어뜨렸는데...\n찾아 주면 불꽃 안전 수업을 보여 줄게요.', N); return; }
    D().useItem('brazierpart');
    await say('찾아 줬군요! 부품을 끼우고... 자, 불꽃 안전 수업을 시작할게요.', N);
    await say('화로견이 숨을 고르게 불어넣는다. 불꽃이 커지지도 작아지지도 않고 일정하게 춤춘다.');
    await say('불 동료와 지낼 땐 바람길을 막지 않고, 주변의 마른 풀을 치워 두는 거예요.\n불은 다루는 사람의 마음을 닮거든요.', N);
    set('q21f_b');
    G.audio && G.audio.jingle('badge');
    await give('firestone', 1);
    await say('수업 수료 기념 불씨돌이에요! 여우불이나 불발이에게 써 봐요.', N);
  }

  // ------------------------------------------------------------ M06 잎향시
  const SCENT = () => !flag('q18');
  M.leafhyang = {
    name: '잎향시', kind: 'out', bgm: 'town', rows: ROWS.leafhyang,
    buildings: [
      { k: 'glass', x: 3, y: 2, w: 12, h: 7, label: '유리온실' },
      { k: 'house', x: 26, y: 3, w: 6, h: 4, roof: 'green', wall: '#f2f6e8', label: '약초 공방' },
      { k: 'center', x: 2, y: 13, w: 6, h: 4, roof: 'red', wall: '#fbf6ee' },
      { k: 'shop', x: 10, y: 13, w: 5, h: 4, roof: 'green', wall: '#f4f8f0' },
      { k: 'gym', x: 23, y: 12, w: 8, h: 5, roof: 'green', wall: '#f4f2e4', wallH: 36, emblem: 'leaf' },
      { k: 'house', x: 2, y: 22, w: 7, h: 4, roof: 'teal', wall: '#eef4f6', label: '공명연구소' },
      { k: 'house', x: 11, y: 22, w: 6, h: 4, roof: 'navy', wall: '#f4f0e6', label: '교본 도서실' },
      { k: 'house', x: 23, y: 22, w: 6, h: 4, roof: 'orange', wall: '#f6eee0', label: '연합 교환소' }],
    warps: [
      { x: 8, y: 8, to: 'greenhouse', tx: 14, ty: 20, dir: 'up', tdir: 'up' }, { x: 9, y: 8, to: 'greenhouse', tx: 15, ty: 20, dir: 'up', tdir: 'up' },
      { x: 28, y: 6, to: 'herbal', tx: 4, ty: 4, dir: 'up' },
      { x: 4, y: 16, to: 'center_y', tx: 5, ty: 6, dir: 'up' }, { x: 5, y: 16, to: 'center_y', tx: 6, ty: 6, dir: 'up' },
      { x: 12, y: 16, to: 'shop_y', tx: 4, ty: 5, dir: 'up' },
      { x: 26, y: 16, to: 'gym4', tx: 7, ty: 14, dir: 'up' }, { x: 27, y: 16, to: 'gym4', tx: 7, ty: 14, dir: 'up' },
      { x: 5, y: 25, to: 'reslab', tx: 5, ty: 6, dir: 'up' }, { x: 14, y: 25, to: 'library', tx: 5, ty: 5, dir: 'up' }, { x: 26, y: 25, to: 'exhall', tx: 4, ty: 4, dir: 'up' }],
    blocks: [{ x: 8, y: 8, cond: () => !flag('q18_brief') }, { x: 9, y: 8, cond: () => !flag('q18_brief') }, { x: 26, y: 16, cond: () => !flag('q18') }, { x: 27, y: 16, cond: () => !flag('q18') }],
    links: { w: { to: 'gardenroad', dy: -3 } },
    signs: { '22,21': '잎향시\n"꽃과 수로의 계단 도시"  ▲ 유리온실 · 약초 공방  ▶ 정원 체육관' },
    objects: {
      '8,8': async () => { if (!flag('q18_brief')) await say('유리온실 문이 잠겨 있다.\n"수로 점검 중 — 조사는 약초사 미루의 허가를 받으세요"'); },
      '9,8': async () => { if (!flag('q18_brief')) await say('유리온실 문이 잠겨 있다.\n"수로 점검 중 — 조사는 약초사 미루의 허가를 받으세요"'); },
      '26,16': async () => { if (!flag('q18')) await say('체육관 문 앞에 꽃향기가 자욱하다.\n"온실 수로 복구 후 정식 개관합니다 — 관장 윤슬"'); },
      '27,16': async () => { if (!flag('q18')) await say('체육관 문 앞에 꽃향기가 자욱하다.\n"온실 수로 복구 후 정식 개관합니다 — 관장 윤슬"'); }
    },
    npcs: [
      { id: 'miru_c', char: 'miru', x: 11, y: 9, dir: 'left', name: '약초사 미루', cond: () => !flag('q18_brief'),
        talk: async () => {
          const N = '약초사 미루';
          if (!flag('q17')) { await say('꽃향기가 너무 짙죠? 온실에서 무슨 일이 생긴 것 같아요.', N); return; }
          await say('어머, 길지기님이시네요! 저는 약초사 미루예요. 온실 꽃들이 향을 너무 많이 내고,\n수로 몇 군데가 막혀 버렸어요. 새길상회가 설치한 양액 장비 때문인 것 같아요.', N);
          if (G.S.bag.canalplan) await say('그 도면... 상회의 옛 수로 도면이잖아요! 역시 온실 수로에 장비가 붙어 있었어.', N);
          await say('온실 조사를 부탁해도 될까요? 조사 허가증이랑 온실 수로 관리도를 드릴게요.\n관리도엔 공공 입구, 화단 이름, 조사할 밸브 구역만 그려져 있어요.', N);
          await give('permit', 1, true); await give('map07', 1, true);
          await say(`${P()}${G.josa(P(), '은', '는')} 온실 조사 허가증과 온실 수로 관리도를 받았다!\n(메뉴의 [지도]에 유리온실이 더해졌다)`);
          await say('세 화단의 밸브를 해바라기 → 잎숨 → 달맞이 순서로 물을 보내야 해요.\n밸브와 화단은 바닥의 색깔 배관으로 이어져 있으니 배관을 따라가 보세요!', N);
          await say('안쪽 낮은 덩굴은 덩굴 정리로, 잔잔한 수로는 잔물타기로 건너면 돼요. 중간엔 쉼터도 있어요.', N);
          set('q18_brief');
          Wd().respawn();
        } },
      { id: 'yl_gymg', char: 'gardener', x: 25, y: 17, dir: 'down', name: '체육관 정원사', cond: () => !flag('q18'),
        text: '관장 윤슬 님은 온실 수로를 같이 살피고 계세요. 향기가 이렇게 짙으면 승부도 어지러워서요!' },
      { id: 'yl_w1', char: 'woman', x: 17, y: 10, dir: 'down', move: 'wander', name: '잎향 시민',
        text: () => SCENT() ? '에취! 꽃향기가 너무 짙어서 코가 간질간질해요. 원래 이렇지 않았는데...' : '향기가 은은해졌어요! 이제야 꽃 냄새가 제대로 나네요.' },
      { id: 'yl_kid', char: 'kidA', x: 30, y: 19, dir: 'left', name: '잎향 꼬마', text: () => SCENT() ? '잎뿌리들이 수로가 막혀서 다 수로 옆에 나와 있어. 목마른가 봐.' : '잎뿌리들이 수로로 돌아갔어! 물놀이하나 봐.' },
      { id: 'yl_bam', mon: 'bamhyang', act: 'sniff', x: 34, y: 10, dir: 'left', text: () => SCENT() ? '밤향화가 고개를 푹 숙이고 있다. 향기를 조절하느라 지친 모양이다.' : '밤향화가 은은한 향기를 퍼뜨리며 기분 좋게 흔들린다.' },
      { id: 'yl_sup', mon: 'supdeung', act: 'hop', x: 16, y: 1, dir: 'down', text: '숲등짐이 등의 이끼로 온실 주변의 습도를 맞추고 있다.' },
      { id: 'yl_ip', mon: 'ipppuri', act: 'splash', x: 36, y: 17, dir: 'left', text: () => SCENT() ? '잎뿌리가 막힌 수로 옆에서 목이 마른 듯 시들시들하다.' : '잎뿌리가 시원한 수로 물에 뿌리를 담그고 있다.' },
      { id: 'yl_coach', char: 'man', x: 18, y: 12, dir: 'down', name: '연합마차 마부', cond: () => flag('badge4'), talk: () => H.coach('leafhyang') }],
    drawExtra: (T, cx, cy) => {
      if (!SCENT()) return;   // drifting pink scent until the greenhouse is fixed (screen-space motes)
      for (let i = 0; i < 22; i++) {
        const x = (i * 97 + G.frame * (0.25 + (i % 3) * 0.12)) % 272 - 8, y = (i * 53 + Math.sin(G.frame / 45 + i) * 10 + G.frame * 0.08) % 204 - 6;
        T.fillStyle = i % 2 ? 'rgba(240,140,185,0.6)' : 'rgba(250,196,220,0.55)'; T.fillRect(Math.round(x), Math.round(y), 2, 2);
        if (i % 4 === 0) T.fillRect(Math.round(x) + 1, Math.round(y) - 1, 1, 1);
      }
    },
    onEnter: async () => { visit('leafhyang'); if (!flag('yl_seen')) { set('yl_seen'); await G.wait(10); await say('계단식 꽃밭과 수로가 펼쳐진 정원도시... 그런데 꽃향기가 숨 막힐 만큼 짙다.'); } }
  };
  H.center('center_y', '잎향시', 'leafhyang', 4, 17);
  H.shop('shop_y', '잎향시', 'leafhyang', 12, 17, STOCK2);
  M.herbal = {
    name: '약초 공방', kind: 'in', bgm: 'town',
    rows: ['#W######W#', 'BB.p..p.BB', '..........', '..tt..tt..', '..........', '....x.....'],
    warps: [{ x: 4, y: 5, to: 'leafhyang', tx: 28, ty: 7, dir: 'down' }],
    npcs: [
      { id: 'miru_h', char: 'miru', x: 5, y: 2, dir: 'down', name: '약초사 미루', cond: () => flag('q18_brief'),
        talk: async () => {
          const N = '약초사 미루';
          if (!flag('q18')) { await say('온실 밸브는 해바라기 → 잎숨 → 달맞이 순서예요. 바닥의 색깔 배관을 따라가 봐요!', N); return; }
          await say('향기가 은은해졌어요. 꽃들도, 시민들도, 동료들도 숨을 돌렸어요. 정말 고마워요!', N);
          await say('약초는 너무 많이 줘도 독이 되거든요. 상회 장비는 그걸 몰랐던 거예요.', N);
        } }]
  };
  // 공명연구소: Q22 조율실의 네 박자 and the resonance service
  const RES_POINTS = { '2,1': { k: 'q22_a', n: '호흡 계측기', ask: '연습 동료의 숨이 "흡 — 후 —" 길게 이어진다. 어느 박자에 맞출까?', opts: ['느린 박자', '빠른 박자'], right: 0 },
    '6,1': { k: 'q22_b', n: '힘 계측기', ask: '바늘이 힘을 줄 때마다 크게 흔들린다. 바늘을 가운데 초록 칸에 두려면?', opts: ['힘을 조금 뺀다', '힘을 더 준다'], right: 0 },
    '10,1': { k: 'q22_c', n: '울림 계측기', ask: '두 울림이 "둥 · 둥둥" 엇갈린다. 연습 동료와 어떻게 맞출까?', opts: ['같은 박자로 따라 울린다', '반대 박자로 울린다'], right: 0 } };
  const resPoint = async key => {
    const p = RES_POINTS[key];
    if (!flag('badge3')) { await say(`${p.n}다. 세 번째 배지를 받은 길지기부터 조율 수업을 받을 수 있다.`); return; }
    if (flag('q22')) { await say(`${p.n}가 고른 박자로 깜빡인다.`); return; }
    if (!flag('q22_start')) { await say(`${p.n}다. 연구원에게 먼저 수업 설명을 듣자.`); return; }
    if (flag(p.k)) { await say(`${p.n}는 이미 맞췄다.`); return; }
    const L = await G.say(p.ask, { keep: true });
    const c = await G.choose(p.opts, { title: p.n, cancel: -1 });
    G.closeText(L);
    if (c !== p.right) { sfx('bump'); await say('박자가 어긋났다. 연습 동료가 고개를 갸웃한다. 다시 해 보자!'); return; }
    set(p.k); sfx('select');
    await say(`${p.n}의 불빛이 초록으로 바뀌었다!`);
    if (flag('q22_a') && flag('q22_b') && flag('q22_c')) await say('세 계측기가 모두 초록이다. 연구원에게 알리자!');
  };
  M.reslab = {
    name: '공명연구소', kind: 'in', floor: '_', bgm: 'water',
    rows: ['#W###W###W###', '__P___P___P__', '_____________', '__tt_____tt__', '_____________', '_____________', '_____________', '_____xx______'],
    warps: [{ x: 5, y: 7, to: 'leafhyang', tx: 5, ty: 26, dir: 'down' }, { x: 6, y: 7, to: 'leafhyang', tx: 5, ty: 26, dir: 'down' }],
    objects: { '2,1': () => resPoint('2,1'), '6,1': () => resPoint('6,1'), '10,1': () => resPoint('10,1') },
    npcs: [
      { id: 'res_head', char: 'prof', x: 6, y: 4, dir: 'down', name: '공명연구소장 온결',
        talk: async () => {
          const N = '공명연구소장 온결';
          if (!flag('badge3')) { await say('공명연구소예요. 몬스터 몸속 울림과 공명 광물을 연구하죠.\n세 번째 배지를 받은 길지기에게 공명 조율 수업을 열어요.', N); return; }
          if (!flag('q22_start') && !flag('q22')) {
            set('q22_start');
            await say('등대배지를 받았군요! 공명 조율 수업을 받아 볼래요?\n어떤 동료들은 몸속 울림이 바깥 울림과 맞아야 다음 모습으로 자라요.', N);
            await say('돌두름, 몽실각, 버팀곰, 그늘솜. 이 네 계열은 Lv.36이 넘으면\n조율 진화를 할 수 있어요. 교환도, 소모품도 필요 없어요.', N);
            await say('수업은 연구소 연습 동료와 해요. 세 계측기 — 호흡, 힘, 울림 — 를 맞춰 보세요.\n네 종을 다 데려올 필요도, 네 번째 배지도 필요 없어요.', N);
            return;
          }
          if (!flag('q22')) {
            if (!(flag('q22_a') && flag('q22_b') && flag('q22_c'))) { await say('호흡, 힘, 울림. 세 계측기를 모두 초록으로 맞춰 보세요.', N); return; }
            set('q22');
            G.audio && G.audio.jingle('badge');
            await say('세 박자에 마지막 한 박자 — 동료를 믿는 마음까지. 이게 조율실의 네 박자예요.\n축하해요, 공명 조율 자격을 드릴게요!', N);
            return;
          }
          const ready = G.S.party.filter(m => { const e = D().MONS[m.id].evo; return e && e.res && m.lv >= e.lv; });
          if (!ready.length) { await say('조율 진화는 Lv.36 이상인 돌두름·몽실각·버팀곰·그늘솜이 대상이에요.\n그런 동료가 생기면 데려와요. 언제든 무료예요!', N); return; }
          const i = await G.menus.party({ title: '누구를 조율할까?', mark: m => { const e = D().MONS[m.id].evo; return e && e.res && m.lv >= e.lv ? '조율 가능' : ''; } });
          if (i < 0) return;
          const mon = G.S.party[i], e = D().MONS[mon.id].evo;
          if (!(e && e.res)) { await say(`${G.eun(D().nameOf(mon))} 조율 진화를 하지 않는 동료예요.`, N); return; }
          if (mon.lv < e.lv) { await say(`Lv.${e.lv}이 되면 다시 데려와요. 지금은 Lv.${mon.lv}이에요.`, N); return; }
          await G.battle.resonanceEvolve(mon);
        } },
      { id: 'res_mate', mon: 'mongsil', act: 'hop', x: 2, y: 4, dir: 'right', text: '연구소의 연습 동료 몽실각이 박자에 맞춰 몸을 흔든다.' },
      { id: 'res_r', char: 'yura', x: 10, y: 4, dir: 'down', name: '연구원',
        text: '계측기는 벽에 붙은 세 화면이에요. 앞에 서서 A 버튼!\n정답은 연습 동료의 모습을 잘 보면 알 수 있어요. 급할 것 없어요.' }]
  };
  M.library = {
    name: '교본 도서실', kind: 'in', bgm: 'town',
    rows: ['#W###WW###W#', 'BBBB.BB.BBBB', '............', '.tt..tt..tt.', '............', '............', '.....xx.....'],
    warps: [{ x: 5, y: 6, to: 'leafhyang', tx: 14, ty: 26, dir: 'down' }, { x: 6, y: 6, to: 'leafhyang', tx: 14, ty: 26, dir: 'down' }],
    npcs: [
      { id: 'lib', char: 'clerk', x: 4, y: 2, dir: 'down', name: '도서실 사서',
        talk: async () => {
          await say('교본 도서실이에요. 동료가 지금과 예전 모습에서 배울 수 있었던 기술을\n지금 레벨까지 전부 무료로 복습할 수 있어요. 돌로 일찍 진화했어도 괜찮아요!', '도서실 사서');
          await F().centerService('도서실 사서');
        } },
      { id: 'lib2', char: 'elder', x: 9, y: 4, dir: 'left', name: '독서하는 할아버지', text: '교본은 몇 번이고 다시 쓸 수 있지. 기술은 써서 닳는 게 아니라 익혀서 느는 거야.' }]
  };
  M.exhall = {
    name: '진화석 연합 교환소', kind: 'in', bgm: 'town',
    rows: ['#W######W#', 'BB..N...BB', '..cccc....', '..........', '..........', '....x.....'],
    warps: [{ x: 4, y: 5, to: 'leafhyang', tx: 26, ty: 26, dir: 'down' }],
    objects: { '4,1': async () => F().surveyBoard('교환소 게시판') },
    npcs: [{ id: 'ex_c', char: 'clerk', x: 3, y: 1, dir: 'down', name: '연합 교환소',
      talk: async () => { await say('진화석 연합 교환소예요. 해금된 진화석을 사거나, 조사증표로 바꿀 수 있어요.', '연합 교환소'); await F().exchange('연합 교환소'); } }]
  };

  // ------------------------------------------------------------ D07 유리온실 (Q18): three valves in bed order, the hidden scent records
  // the floor pipes: valve -> bed. 해바라기(2-7), 잎숨(11-16), 달맞이(20-25)
  const VALVES = { '4,7': { bed: 'moon', col: '#e04838' }, '13,7': { bed: 'sun', col: '#f2c230' }, '22,7': { bed: 'leaf', col: '#4a90e2' } };
  const BEDS = { sun: { n: '해바라기 화단', x0: 2 }, leaf: { n: '잎숨 화단', x0: 11 }, moon: { n: '달맞이 화단', x0: 20 } };
  const GH_ORDER = ['sun', 'leaf', 'moon'];
  const ghValve = async (x, y) => {
    const v = VALVES[x + ',' + y]; if (!v) return;
    if (flag('q18_valves')) { await say('밸브가 고르게 열려 있다. 물이 화단 순서대로 흐른다.'); return; }
    const seq = num('gh_seq');
    const ok = await G.ask('수로 밸브다. 돌려서 물을 보낼까?'); if (!ok) return;
    sfx('water');
    if (v.bed !== GH_ORDER[seq]) {
      set('gh_seq', 0);
      await say(`물이 ${BEDS[v.bed].n}으로 콸콸 넘쳤다! 순서가 어긋났다...\n밸브들이 저절로 처음 자리로 돌아갔다. (해바라기 → 잎숨 → 달맞이)`);
      return;
    }
    set('gh_seq', seq + 1);
    await say(`${BEDS[v.bed].n}에 물이 고르게 스며든다! (${seq + 1}/3)`);
    if (seq + 1 < 3) return;
    set('q18_valves');
    G.audio && G.audio.jingle('learn');
    await say('세 화단에 차례로 물이 돌자, 꽃들이 한숨 돌린 듯 잎을 펼쳤다.\n...그런데 동쪽 양액 탱크 쪽에서 누군가 허둥지둥 서류를 숨긴다!');
    Wd().respawn();
  };
  M.greenhouse = {
    name: '유리온실', kind: 'out', bgm: 'route', rows: ROWS.greenhouse,
    warps: [{ x: 14, y: 21, to: 'leafhyang', tx: 8, ty: 9, dir: 'down', tdir: 'down' }, { x: 15, y: 21, to: 'leafhyang', tx: 9, ty: 9, dir: 'down', tdir: 'down' }],
    rescue: { map: 'leafhyang', x: 8, y: 9, dir: 'down' },
    waterLine: '잔잔한 관개수로다. 물판으로 건널 수 있을 것 같다.\n(배우는 곳: 물울림 체육관 · 리안의 강습)',
    signs: { '4,1': '해바라기 화단\n"물 순서 1번"', '13,1': '잎숨 화단\n"물 순서 2번"', '22,1': '달맞이 화단\n"물 순서 3번"' },
    onValve: ghValve,
    objects: {
      '26,3': () => ghTank(), '27,3': () => ghTank(), '28,3': () => ghTank(),
      '24,14': async () => {
        if (!flag('q18') || !flag('q21w')) { await say('수로 옆 물높이 표식이다. 줄무늬 눈금이 젖어 있다.'); return; }
        if (flag('q21w2')) { await say('이미 기록한 물높이 표식이다.'); return; }
        set('q21w2'); sfx('select');
        await say('온실 수로의 물높이 눈금을 기록했다! 수로가 정상으로 돌아 눈금이 고르다.');
        await say('기록 고마워요! 조수연구소 대신 드리는 관측 보상이에요.', '조수연구소 연구원');
        await give('wavestone', 1);
      }
    },
    items: [{ id: 'superpotion', x: 2, y: 11, flag: 'gh_spot' }, { id: 'hyperpotion', x: 27, y: 18, flag: 'gh_hyper' }],
    npcs: [
      { id: 'gh_rest', char: 'gardener', x: 16, y: 19, dir: 'left', name: '온실 관리인',
        talk: async () => {
          const N = '온실 관리인';
          await say('여기서 잠깐 쉬어 가요. 꽃향기가 너무 짙어서 다들 지쳤거든요.', N);
          await G.menus.heal();
          if (!flag('gh_anti')) { set('gh_anti'); await give('antidote', 3); await say('독 기술을 쓰는 동료가 많아요. 해독제를 챙겨 가요!', N); return; }
          await say('수로를 건너면 덩굴 너머에 밸브가 셋 있어요. 바닥 배관 색을 따라가 봐요!', N);
        } },
      { id: 'gh_res', char: 'yura', x: 22, y: 15, dir: 'left', name: '조수연구소 연구원', cond: () => flag('q18') && flag('q21w') && !flag('q21w2'),
        text: '유라 선배 부탁으로 왔어요. 수로 옆 줄무늬 물높이 표식을 한 번 확인해 줄래요?' },
      { id: 'ghboss', char: 'boss', x: 25, y: 5, dir: 'left', sight: 3, cond: () => flag('q18_valves') && !flag('tr_ghboss'),
        trainer: { flag: 'tr_ghboss', title: '새길상회 감독', name: '여울빛', char: 'boss', base: 34, prize: 3000, smart: true,
          team: [['deonggul', 30, ['razor', 'poisonpow', 'acid', 'sleeppow']], ['bangulssak', 30, ['vine', 'acid', 'stunspore', 'sleeppow']], ['hwarogyeon', 31]],
          before: '밸브를 건드린 게 너구나! 이 향기 측정 기록은 내놓을 수 없어.\n양액을 늘리면 꽃이 빨리 자란다고 했는데... 향이 이렇게 넘칠 줄은!', lose: '...기록을 숨긴 건 내 잘못이야.',
          after: '본사는 다음 해안 공사에도 같은 장비를 쓴대. 바다 건너 해안길이야.',
          afterWin: async () => {
            await say('...알았다, 알았어. 향기 측정 기록이랑 양액 장치에서 뺀 핵심 부품이야.\n탱크에 부품을 다시 끼우면 물이 정상으로 돌 거다.', '새길상회 감독 여울빛');
            await give('scentlog', 1, true); await give('corepart', 1, true);
            await say(`${P()}${G.josa(P(), '은', '는')} 향기 측정 기록과 온실 핵심 부품을 받았다!`);
            const b = Wd().npc('ghboss'); if (b) b.hidden = true;
          } } }],
    drawExtra: (T, cx, cy) => {
      // floor pipes from each valve to its bed (three pixel lanes)
      const lane = { '4,7': 4, '13,7': 10, '22,7': 13 };
      for (const k in VALVES) {
        const [vx] = k.split(',').map(Number), v = VALVES[k], bx = BEDS[v.bed].x0 + 2;
        T.fillStyle = v.col;
        const yl = (k === '13,7' ? 5 : 6) * 16 + lane[k] - cy, x0 = vx * 16 + 7 - cx, x1 = bx * 16 + 7 - cx;
        T.fillRect(x0, yl, 3, 7 * 16 + 4 - (yl + cy));
        T.fillRect(Math.min(x0, x1), yl, Math.abs(x1 - x0) + 3, 3);
        T.fillRect(x1, 4 * 16 + 10 - cy, 3, yl - (4 * 16 + 10 - cy));
        G.disc(T, x0 + 1, 7 * 16 + 4 - cy, 4, v.col);
      }
      // watered beds shimmer
      const seq = flag('q18_valves') ? 3 : num('gh_seq');
      for (let i = 0; i < seq; i++) {
        const b = BEDS[GH_ORDER[i]];
        for (let j = 0; j < 4; j++) { const x = (b.x0 + ((G.frame / 9 + j * 1.7) % 6)) * 16 - cx, y = (2 + (j % 3)) * 16 + 4 - cy; T.fillStyle = 'rgba(140,200,255,0.8)'; T.fillRect(Math.round(x), y, 2, 3); }
      }
      // the nutrient tank
      const X = 26 * 16 - cx, Y = 1 * 16 - cy;
      T.fillStyle = '#5a6670'; T.fillRect(X + 2, Y + 2, 44, 44); T.fillStyle = flag('q18') ? '#8ad0a8' : '#e88aa0'; T.fillRect(X + 6, Y + 8, 36, 30);
      T.fillStyle = '#c8d0d6'; T.fillRect(X + 6, Y + 8, 36, 4); G.textC(T, '양액', X + 24, Y + 18, '#ffffff', 'rgba(0,0,0,0.5)');
    },
    onEnter: async () => { visit('greenhouse'); if (!flag('gh_seen')) { set('gh_seen'); await G.wait(10); await say('유리 지붕 아래 화단과 수로가 펼쳐져 있다. 달콤한 향기가 머리를 어지럽힌다.'); } }
  };
  async function ghTank() {
    if (flag('q18')) { await say('양액 탱크가 맑은 초록빛으로 고르게 돌고 있다.'); return; }
    if (!G.S.bag.corepart) { await say(flag('q18_valves') ? '양액 탱크다. 핵심 부품이 빠져 있어 양액이 마구 쏟아진다.' : '분홍빛 양액이 가득 찬 탱크다. 달콤한 향이 짙게 난다.'); return; }
    const ok = await G.ask('온실 핵심 부품을 탱크에 끼울까?'); if (!ok) return;
    D().useItem('corepart');
    sfx('knock2');
    await F().play(60, (T, cx, cy, k) => { T.fillStyle = `rgba(160,230,190,${0.5 * Math.sin(Math.PI * k)})`; T.fillRect(0, 0, 256, 192); });
    set('q18');
    G.audio && G.audio.jingle('badge');
    await say('탱크가 낮게 웅 울리더니 양액이 맑은 초록빛으로 바뀌었다!\n온실 가득하던 짙은 향기가 은은하게 가라앉는다.');
    await say('온실이... 숨을 쉬어요! 꽃들이 향기를 줄였어요!', '약초사 미루');
    await say('이 향기 측정 기록은 연구소에 넘길게요. 그리고 이건 고마움의 표시예요.', '약초사 미루');
    if (G.S.bag.scentlog) D().useItem('scentlog');
    await give('leafstone', 1);
    await say('잎숨돌이에요. 꾸벅초나 덩굴종이 이 숨결에 반응해요.\n윤슬 관장님도 이제 체육관을 정식으로 연대요. 꼭 도전해 봐요!', '약초사 미루');
    Wd().respawn();
  }
  H.ghTank = ghTank;

  // ------------------------------------------------------------ G04 잎향 정원 체육관
  M.gym4 = {
    name: '잎향 정원 체육관', kind: 'in', floor: 'g', bgm: 'gym',
    rows: [
      '#W####WWW####W#',
      'ggggggggggggggg', 'ggggggggggggggg',
      'hhhhhhhhhhhgghh',
      'ggggggggggggggg', 'ggggggggggggggg',
      'hhgghhhhhhhhhhh',
      'ggggggggggggggg', 'ggggggggggggggg',
      'hhhhhhhhhhhgghh',
      'ggggggggggggggg', 'ggggggggggggggg',
      'hhgghhhhhhhhhhh',
      'sgggggggggggggs',
      'ggggggggggggggg',
      'ggggggxxxgggggg'],
    warps: [{ x: 6, y: 15, to: 'leafhyang', tx: 26, ty: 17, dir: 'down' }, { x: 7, y: 15, to: 'leafhyang', tx: 26, ty: 17, dir: 'down' }, { x: 8, y: 15, to: 'leafhyang', tx: 27, ty: 17, dir: 'down' }],
    objects: {
      '0,13': async () => say(flag('badge4') ? `잎향 정원 체육관 관장 윤슬\n인정받은 길지기: ${P()}` : '잎향 정원 체육관 관장 윤슬\n"향기는 서두르지 않는다. 한 박자 뒤를 읽어라"'),
      '14,13': async () => say('정원 안내판: "산울타리 틈을 따라 지그재그로 오르세요."')
    },
    npcs: [
      { id: 'g4a', char: 'gardener', x: 6, y: 10, dir: 'right', sight: 4,
        trainer: { flag: 'tr_g4a', title: '정원사', name: '새싹', char: 'gardener', team: [['ipppuri', 31], ['deonggul', 32]], base: 26,
          before: '산울타리 미로에 온 걸 환영해!', lose: '가지치기 당했네...', after: '관장님 밤향화는 향기가 짙어지면 다음 차례에 꽃잎을 휘몰아쳐. 그때 바꿔!' } },
      { id: 'g4b', char: 'woman', x: 8, y: 5, dir: 'left', sight: 5,
        trainer: { flag: 'tr_g4b', title: '향기 연구가', name: '라온', char: 'woman', team: [['kkubeok', 32], ['gyundeung', 32], ['bangulssak', 33]], base: 26,
          before: '독과 졸음, 버틸 준비는 됐어?', lose: '맑은숨으로 버티다니!', after: '해독제와 잠깨는약, 아니면 맑은숨. 지속 압박엔 회복 수단이 답이야.' } },
      { id: 'g4guide', char: 'man', x: 12, y: 14, dir: 'left', name: '안내원',
        text: () => flag('badge4') ? '축하해! 해양학교 도하 교관님께 추천서를 보여 주면 파도타기를 배울 수 있어.' : '도전자! 관장 윤슬은 풀·독 타입. 불·비행·에스퍼 기술이 잘 통해!\n향기가 짙어지면 다음 차례에 큰 기술이 와. 교체로 받아 내자.' },
      { id: 'leader4', char: 'yunseul', x: 7, y: 1, dir: 'down', name: '관장 윤슬',
        talk: async () => {
          const N = '관장 윤슬';
          if (flag('badge4')) { await say('해양학교의 도하 교관에게 가 봐. 다음 해안은 바다 건너야.', N); return; }
          await say('온실을 되살려 줘서 고마워. 나는 잎향 정원 체육관 관장 윤슬.\n향기는 서두르지 않아. 한 박자 뒤를 읽고, 버티고, 바꿔 타는 법을 보여 줘.', N);
          const won = await G.battle.trainer({ flag: 'badge4', title: '관장', name: '윤슬', char: 'yunseul', smart: true, potion: true, iv: 16, prize: 3600,
            lead: { kkubeok: 'poisonpow' },
            telegraph: { bamhyang: { moves: ['petal'], msg: '의 꽃잎에서 달콤한 향기가 짙어진다! 다음 차례에 꽃잎이 휘몰아칠 것 같다!', chance: 0.5 },
              posik: { moves: ['leafstorm'], msg: '이(가) 잎을 잔뜩 부풀린다! 다음 차례에 잎폭풍이 올 것 같다!', chance: 0.4 } },
            team: [['kkubeok', 32, ['megadrain', 'poisonpow', 'acid', 'moonlight']], ['posik', 35, ['razor', 'sleeppow', 'acid', 'leafstorm']], ['bamhyang', 36, ['petal', 'megadrain', 'stunspore', 'sleeppow']]],
            lose: '...한 박자 뒤를 읽었구나. 향기에 휩쓸리지 않는 단단함, 멋졌어.' });
          if (!won) { await say('지쳤으면 센터에서 쉬고 다시 와. 재도전은 언제든 무료야.\n향기가 짙어지는 순간을 기억해. 그때가 바꿔 탈 때야.', N); return; }
          await say('잎향 정원 체육관의 인증, 잎향배지야.', N);
          G.audio && G.audio.jingle('badge');
          await say(`${P()}${G.josa(P(), '은', '는')} 관장 윤슬에게서 잎향배지를 받았다!`);
          await give('tm_scent', 1);
          await say('향기장막 교본이야. 향기로 몸을 감싸 방어와 특수방어를 함께 올려. 풀 동료라면 누구나!', N);
          await give('recommend2', 1);
          await say('그리고 파도타기 강습 추천서. 돛바람항 해양학교의 도하 교관에게 보여 줘.', N);
          await say('...미루가 넘긴 향기 기록을 보니, 새길상회가 바다 건너 다음 해안에도\n같은 장비로 공사를 하고 있대. 연구소들이 정식으로 조사를 부탁하더라.', N);
          await say('연합마차도 이제 탈 수 있어. 항구까지 금방일 거야. 가 봐!', N);
          set('q19');
        } }]
  };

  // ------------------------------------------------------------ R12 다음 해안 항로 (after Q20)
  M.searoute = {
    name: '다음 해안 항로', kind: 'out', bgm: 'water', rows: ROWS.searoute,
    links: { n: { to: 'harbor', dx: 10, gated: 1 }, s: { to: 'r13', dx: 0, from: 10, until: 13, gated: 1, cond: () => flag('q24_start') } },
    seaLine: '파도가 높은 바다다. 하얀 줄 부표 너머는 물살이 거센 경계다.',
    signs: { '27,6': '다음 해안 선착장\n"이 너머 해안길은 공사 중 — 새길상회 해안 공사 구간"' },
    items: [{ id: 'revive', x: 9, y: 8, flag: 'sr_isle' }, { id: 'goldcube', n: 3, x: 8, y: 7, flag: 'sr_cube' }],
    triggers: [{ x: 25, y: 9, w: 1, h: 2, cond: () => flag('q20') && !flag('ch2_end'), run: async () => { set('ch2_end'); await G.chapterEnd(2); if (H.kickoff3) await H.kickoff3(); } }],
    npcs: [{ id: 'sr_worker', char: 'worker', x: 27, y: 12, dir: 'left', name: '해안 공사 인부',
      text: '여기서부터는 새길상회 해안 공사 구간이야. 길이 아직 다 이어지지 않았어.\n...본사 사람들이 바다 건너 섬에서 뭔가 큰 걸 찾는다나 봐.' },
      { id: 'sr_rescue', char: 'sailor', x: 26, y: 8, dir: 'down', name: '구조대원 파랑', cond: () => flag('ch2_end'),
        text: '흰 부표 사이를 따라 남쪽으로 내려가면 해무 섬이에요. 섬 서쪽 해변 선착장에서 내려요!\n구조대장 가온 님이 해무나루 구조대 앞에서 기다려요.' }],
    drawExtra: (T, cx, cy) => {
      const lane = flag('q24_start');   // chapter 3: a gap in the boundary line, marked by white buoys down to 흰부표 해로
      for (let X = 0; X < 25; X += 2) { if (lane && X >= 9 && X <= 14) continue; const x = X * 16 + 8 - cx, y = 17 * 16 + 4 - cy + (Math.floor(G.frame / 24 + X) % 2); G.disc(T, x, y, 3, '#ffffff'); G.disc(T, x, y, 2, '#f2a020'); }
      if (lane) for (let y = 12; y <= 17; y += 2) [9, 14].forEach(X => { const x = X * 16 + 8 - cx, yy = y * 16 + 9 - cy + ((X + y + Math.floor(G.frame / 24)) % 2); G.disc(T, x, yy, 3, '#2c5ea8'); G.disc(T, x, yy, 2, '#ffffff'); });
      [[5, 3], [15, 5], [20, 12], [12, 14]].forEach(([bx, by]) => { const x = bx * 16 + 8 - cx, y = by * 16 + 9 - cy + (Math.floor(G.frame / 20) % 2); G.disc(T, x, y, 4, '#ffffff'); G.disc(T, x, y, 3, '#2c7ac8'); T.fillStyle = '#ffffff'; T.fillRect(x - 1, y - 7, 2, 4); });
    },
    onEnter: async () => { visit('searoute'); if (flag('ch2_end') && !flag('q24_start') && H.kickoff3) await H.kickoff3(); }
  };

  // ------------------------------------------------------------ chapter 2 data for the notebook and the map
  const tileOpen = (map, x, y) => !!(G.S.tiles && G.S.tiles[map] && G.S.tiles[map][x + ',' + y]);
  G.CH2 = {
    title: '2장 지도',
    nodes: [
      { id: 'mulullim', code: 'M03', n: '물울림시', town: 1, x: 20, y: 150, lx: 4, ly: 160, maps: ['mulullim'], show: ['mulullim'] },
      { id: 'reedford', code: 'R07', n: '갈대여울', x: 56, y: 150, lx: 38, ly: 128, maps: ['reedford'] },
      { id: 'harbor', code: 'M04', n: '돛바람항', town: 1, x: 98, y: 156, lx: 80, ly: 164, maps: ['harbor', 'center_h', 'shop_h', 'hb_office', 'workshop', 'school', 'tidelab', 'house_h1', 'house_h2', 'gym3'], show: ['harbor'] },
      { id: 'backfield', code: 'R08', n: '항구 뒤 들길', x: 72, y: 120, lx: 40, ly: 98, maps: ['backfield'] },
      { id: 'oldmine', code: 'D04', n: '옛 운송 갱도', x: 34, y: 112, lx: 6, ly: 82, maps: ['oldmine'] },
      { id: 'tidedeck', code: 'R09', n: '조수만 데크', x: 150, y: 160, lx: 158, ly: 148, maps: ['tidedeck'] },
      { id: 'lighthouse', code: 'D05', n: '등대', x: 134, y: 134, lx: 142, ly: 128, maps: ['lh1', 'lh2', 'lh3'], show: ['lh1', 'lh2', 'lh3'] },
      { id: 'ridge', code: 'R10', n: '바람등성이', x: 104, y: 106, lx: 112, ly: 102, maps: ['ridge', 'shelter'], show: ['ridge'] },
      { id: 'tunnel', code: 'D06', n: '바위울림터널', x: 108, y: 84, lx: 116, ly: 79, maps: ['tn1', 'tn2', 'tn3'], show: ['tn1', 'tn2', 'tn3'] },
      { id: 'memory', code: 'M05', n: '기억나루', town: 1, x: 110, y: 58, lx: 58, ly: 53, maps: ['memory', 'center_k', 'shop_k', 'archive', 'inn', 'house_k1'], show: ['memory'] },
      { id: 'echohall', code: 'D08', n: '울림당 회랑', x: 148, y: 66, lx: 156, ly: 62, maps: ['echohall'] },
      { id: 'gardenroad', code: 'R11', n: '햇꽃정원길', x: 140, y: 34, lx: 84, ly: 23, maps: ['gardenroad'] },
      { id: 'leafhyang', code: 'M06', n: '잎향시', town: 1, x: 198, y: 36, lx: 206, ly: 29, maps: ['leafhyang', 'center_y', 'shop_y', 'herbal', 'reslab', 'library', 'exhall', 'gym4'], show: ['leafhyang'] },
      { id: 'greenhouse', code: 'D07', n: '유리온실', x: 226, y: 66, lx: 196, ly: 76, maps: ['greenhouse'] },
      { id: 'searoute', code: 'R12', n: '다음 해안 항로', x: 214, y: 180, lx: 136, ly: 176, maps: ['searoute'] }],
    edges: [['mulullim', 'reedford'], ['reedford', 'harbor'], ['harbor', 'backfield'], ['backfield', 'oldmine'], ['harbor', 'tidedeck'], ['harbor', 'lighthouse'],
      ['harbor', 'ridge'], ['ridge', 'tunnel'], ['tunnel', 'memory'], ['memory', 'echohall'], ['memory', 'gardenroad'], ['gardenroad', 'leafhyang'], ['leafhyang', 'greenhouse'], ['harbor', 'searoute']],
    waters: [{ r: [0, 172, 256, 20], nodes: ['harbor', 'tidedeck', 'searoute'] }, { r: [66, 44, 96, 5], nodes: ['memory'] }],
    // which regions each map item covers (map-exploration-rules MAP04-MAP08)
    scopes: {
      MAP04: ['harbor', 'backfield', 'tidedeck', 'lighthouse'],
      MAP05: ['ridge', 'tunnel'],
      MAP06: ['memory', 'echohall', 'gardenroad', 'leafhyang'],
      MAP07: ['leafhyang', 'greenhouse'],
      MAP08: ['harbor', 'searoute']
    },
    posts: [
      { id: 'p_rf', map: 'reedford', x: 41, y: 6, n: '갈대 둔덕 표식' },
      { id: 'p_hb', map: 'harbor', x: 31, y: 24, n: '부두 표식' },
      { id: 'p_bf', map: 'backfield', x: 17, y: 6, n: '들길 표식' },
      { id: 'p_rg', map: 'ridge', x: 6, y: 24, n: '대피소 앞 표식' },
      { id: 'p_mm', map: 'memory', x: 24, y: 23, n: '나루 남쪽 표식' },
      { id: 'p_gr', map: 'gardenroad', x: 25, y: 13, n: '화로 쉼터 표식' },
      { id: 'p_lf', map: 'leafhyang', x: 30, y: 26, n: '정원 표식' }],
    objectives() {
      const out = [];
      const q = (done, t, d, opt, at) => out.push(Object.assign({ done, t, d, opt }, at || {}));
      q(flag('q12'), '항구로 가는 의뢰서', '물울림시 동쪽 수문 너머 갈대여울의 수로 두 곳을 물판으로 건너 돛바람항으로 가자. 항만소에 새 조사 의뢰서를 전하자.', 0, { node: 'harbor', map: 'harbor', x: 20, y: 12 });
      if (flag('q12')) q(flag('q13'), '꺼진 등대', '정비사 세나와 함께 등대 동력실을 점검하자. 정비도 순서의 레버, 떨어진 받침돌, 자기축 방위. 전기 동료는 필요 없다.', 0, { node: 'lighthouse', map: 'harbor', x: 39, y: 5 });
      if (flag('q13')) q(flag('badge3'), '등대의 증표', '다시 문을 연 돛바람 체육관에서 관장 단우에게 도전하자. 땅 타입은 전기를 받지 않는다. 고리가 울리면 다음 차례에 번개가 온다.', 0, { node: 'harbor', map: 'harbor', x: 15, y: 20 });
      if (flag('badge3')) q(flag('q15'), '바위깨기 강습', '공방의 무쇠 공방장에게 강습권을 보여 주고 바위깨기를 배우자. 마당의 금 간 바위 두 개를 치우면 탐굴도를 받는다.', 0, { node: 'harbor', map: 'harbor', x: 27, y: 11 });
      if (flag('q15')) q(flag('q16'), '바위울림터널', '항구 북쪽 길의 낙석을 치우고 바람등성이를 올라 바위울림터널로. 지하의 물을 빼고, 진동 표식을 순서대로 확인해 출구를 열자.', 0, flag('tn_drain') ? { node: 'tunnel', map: 'tn3', x: 25, y: 9 } : { node: 'tunnel', map: 'ridge', x: 18, y: 1 });
      if (flag('q16')) q(flag('q17'), '울림당의 옛길', '기억나루 관리인 해솔의 길비나침반으로 울림당 회랑의 표지 세 곳을 대조하고, 해솔에게 돌아가자.', 0, flag('q17_marks') ? { node: 'memory', map: 'memory', x: 24, y: 14 } : { node: 'echohall', map: 'memory', x: 25, y: 13 });
      if (flag('q17')) q(flag('q18'), '향기가 넘치는 온실', '북쪽 발판과 햇꽃정원길을 지나 잎향시로. 약초사 미루에게 온실 조사 허가를 받고, 세 밸브를 해바라기 → 잎숨 → 달맞이 순서로 열자.', 0, flag('q18_brief') ? { node: 'greenhouse', map: 'leafhyang', x: 8, y: 8 } : { node: 'leafhyang', map: 'leafhyang', x: 11, y: 9 });
      if (flag('q18')) q(flag('badge4'), '잎향의 증표', '정식으로 문을 연 잎향 정원 체육관에서 관장 윤슬에게 도전하자. 향기가 짙어지면 다음 차례에 큰 기술이 온다. 불·비행·에스퍼 기술이 잘 통한다.', 0, { node: 'leafhyang', map: 'leafhyang', x: 26, y: 16 });
      if (flag('badge4')) q(flag('q20'), '파도타기 강습', '돛바람항 해양학교의 교관 도하에게 추천서를 보여 주고 파도타기를 배우자. 연합마차를 타면 항구까지 금방이다.', 0, { node: 'harbor', map: 'harbor', x: 25, y: 19 });
      if (flag('q20')) q(flag('ch2_end'), '다음 해안으로', '부두에서 남쪽 바다로 나가 다음 해안 항로를 건너자. 동쪽 해안 선착장이 다음 조사지다.', 0, { node: 'searoute', map: 'searoute', x: 24, y: 9 });
      // optional threads
      if (flag('badge3')) q(flag('q21f_a') && flag('q21f_b'), '화로의 온도 (선택)', '항구 공방의 식은 화로와 햇꽃정원길의 공용 화로를 고치자. 부품은 바람등성이 대피소와 정원길 위에 있다. 각각 불씨돌 1개.', 1, { node: 'harbor' });
      if (flag('badge3')) q(flag('q21w'), '조수의 세 높이 (선택)', '조수연구소 유라의 부탁. 관측 데크 세 곳의 줄무늬 물높이 표식을 기록해 오자. 바다로 나갈 필요는 없다. 물결돌 1개.', 1, { node: 'tidedeck' });
      if (flag('badge3')) q(flag('q22'), '조율실의 네 박자 (선택)', '잎향시 공명연구소에서 세 계측기를 맞추면 공명 조율 자격을 받는다. 네 번째 배지 전에도 할 수 있다.', 1, { node: 'leafhyang' });
      if (flag('q13')) q(flag('q23'), '물가 낚시 수업 (선택)', '항구 부두의 낚시꾼 해원에게 물가낚싯대를 받자. 낚시 둔덕에서 여러 물가 동료를 만날 수 있다.', 1, { node: 'harbor' });
      if (flag('om_seen')) q(G.S.flags.om_cart === 'store', '옛 갱도의 광차 (선택)', '두 갈림길 레버로 광차의 길을 정하고 출발 레버를 당겨, 옛 창고 바리케이드를 열자.', 1, { node: 'oldmine' });
      if (flag('slip_heard') || (G.S.bag.slip || 0) > 0) q(flag('q_slips'), '흩날린 운송표 (선택)', '항구 뒤 들길에 흩어진 운송표 세 장을 항만소장에게 돌려주자.', 1, { node: 'backfield' });
      return out;
    },
    target() {
      const g = this.objectives().find(o => !o.done && !o.opt);
      return g && g.node ? g : null;
    },
    revisits() {
      const fr = F().unlocked('ripple'), fs = F().unlocked('surf'), fm = F().unlocked('magnet');
      const S = F().seenAt, K = F().seenKey;
      const out = [];
      const r = (seen, t, need, open, done, d, later) => { if (seen || done) out.push({ t, need, open, done, d, later }); };
      r(S('reedford', 'water'), '갈대여울 북쪽 작은 섬', '잔물타기', fr, flag('rf_log'), '두 번째 수로 북쪽 갈래에 모래섬이 있다. 무언가 놓여 있다.');
      r(flag('om_seen'), '옛 운송 갱도 창고', '광차 퍼즐', true, flag('om_tm'), '바리케이드로 막힌 옛 창고. 광차로 들이받으면 열릴지도?');
      r(flag('om_seen'), '야영지로 이어지는 옛 운송로', '등대 전력', flag('q13'), flag('mine_short'), '갱도 서쪽 쇠창살. 등대 발전기가 돌아오면 레버로 올릴 수 있다. 산등 야영지로 이어진다.');
      r(S('lh3', 'magnet'), '등대 관측 난간 상자', '자력 맞춤', fm, flag('lh_box'), '관측 난간 끝, 자성 자물쇠로 잠긴 작은 상자. 나침돌 계열의 자력 맞춤이 필요하다.');
      r(S('tidedeck', 'sea') || S('tidedeck', 'water'), '조수만 바위섬', '파도타기', fs, flag('td_shelf'), '데크 동쪽 바다 위 바위섬. 모래톱에 무언가 반짝인다.');
      r(flag('q20'), '항로 위 작은 섬', '파도타기', fs, flag('sr_isle'), '다음 해안 항로 한가운데 작은 모래섬.');
      r(S('memory', 'rapids'), '기억나루 불어난 강', '급류타기 (3장)', F().unlocked('current') && !!G.S.bag.bridle, H.num && H.num('sq305') >= 2, '물살이 거세게 흐르는 강. 강 한가운데 모래톱에 옛 표지가 보인다. 급류타기를 익히면 건널 수 있다.', !F().unlocked('current'));
      return out;
    }
  };
  // the chapter being played: its goals fill the notebook and its map page opens first
  Object.defineProperty(G, 'CH', { configurable: true, get: () => (G.S && G.S.flags && G.S.flags.ch1_end) ? G.CH2 : G.CH1, set: v => { G.CH1 = v; } });
})();

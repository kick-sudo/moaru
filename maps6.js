/* 모아루: 잠든 길의 노래 — chapter 3 world, part 1: 흰부표 해로 → 해무나루 · 너울잠굴 · 바닷솔길
   (layouts from _mapgen5.py; the rows are pasted in by _build_maps67.py). Flags: q24..q33 main, sq301..sq308 optional. */
'use strict';
(function () {
  const G = window.G, M = G.MAPS, H = G.mapHelpers;
  const { flag, set, say, give, P } = H;
  const Wd = () => G.world, D = () => G.data, F = () => G.field;
  const visit = id => { G.S.visited = G.S.visited || {}; G.S.visited[id] = 1; };
  const num = k => (G.S.flags[k] | 0);
  const sfx = n => G.audio && G.audio.sfx(n);
  const ROWS = {
    r13: [
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
      'OOrrrrrrrOOOOOOOOOOOOOOOOOOOOOOOOO',
      'OOrssssSrOOOOOOOOOOOOOOOOOOOOOOOOO',
      'OOrsssssdOOOOOOOOOOOOOOOOOOOsTTTTT',
      'OOrsssssrOOOOOOOOOOOOOOOOOOOsssssT',
      'OOrrrrrrrOOOOOOOOOOOOOrrsssssssssT',
      'OOOOOOOOOOOOOOOOOOOOOOsssssssssesT',
      'OOOOOOOOOOOOOOOOOOrrsssssssssZZZsT',
      'OOOOOOOOOOOOOOOOOOrsssssZZZZsZZZsT',
      'OOOOOOOOOOOOOOOOOOssssesZZZZsssssT',
      'OOOOOOOOOOOOOOOOOOssssssZZZZsssssT',
      'OOOOOOOOOOOOOOOOOOssSssssssssssssT',
      'OOOOOOOOOOOOrOOOOds===============',
      'OOOOOOOOOOOOOOOOOds===============',
      'OOOOOOOOOOOOOOOOOOsssssssssssZZZsT',
      'OOOOOOOOOOOOOOOOOOhssZZZsssssZZZsT',
      'OOOOOOOOOOOOOOOOOOsssZZZsssssZZZsT',
      'OOOOOOOOOOOOOOOrrOssrssrsssesssssT',
      'OOOOOOOOOOOOOOOrOOrrsssssssssssssT',
      'OOOOOOOOOOOOOOOOOOTTTTTTTTTTTTTTTT'],
    m07: [
      'TTTTTTTTTTTTTTcwwwwwwcffffffffffffOOOOOO',
      'T.FFF....F....cwwwwwwcwwwwwwwwwwdfOOOOOO',
      'T.......F.....cwwwwwwcRRRRRRRRRRRfOOOOOO',
      'T.yyyy........cwwwwwwcwwwwwwwwwwwfOOOOOO',
      'T.y..y........cwwwwwwcwwwwwwwwwwwfOOOOOO',
      'T.yyyy........cwwwwwwcRRRRRRRRRRRfOOOOOO',
      'T.............cwwwwwwcwwwwwwwwwwwfOOOOOO',
      'T.............cddddddcffffddffffffOOOOOO',
      'T................==...............OOOOOO',
      'T................==.S.############OOOOOO',
      'T.######.#####...==...############OOOOOO',
      'T.######.#####...==...############OOOOOO',
      'T.######.#####...==...#########D##OOOOOO',
      'T.##DD##.##D##...==...###D###..=..OOOOOO',
      'T...==.....=.....==......=.....=..OOOOOO',
      'T.#####..#####...==......=.....=..OOOOOO',
      'T.#####..#####...==......=.....=..OOOOOO',
      'T.##D##..##D##S..==......=.....=..OOOOOO',
      '==================================OOOOOO',
      '==================================OOOOOO',
      'Tcccc=.........................l.ssOOOOO',
      'Tcccc=...K.....l........l........ddddddO',
      'Tcccc=sssssssssssssssssssssssssssddddddO',
      'Tccmc=ssssssssssssssssssssssrssssssOOOOO',
      'Tss===sssssssssssssssssssssssssrsssOOOOO',
      'TsssssssrssssssssssshssssssssssssssOOOOO',
      'TsrsssssssssOOOOOOOOOOOOOOOOOOOOOssOOOOO',
      'TssssssrssssOOOOOOOOOOOOOOOOOOOOOssOOOOO',
      'TsssssssssssOOOOOOOOOOOOOOOOOOOOOssOOOOO',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTOOOOOO'],
    nw1: [
      '##############x###############',
      '##############_###############',
      '##############J###############',
      '#########_____________########',
      '######..i....___......i..#####',
      '######......._S_.........#####',
      '######..r....___......r..#####',
      '##########..._____...#########',
      '###____J.....___.......J____##',
      '###____######___########____##',
      '###_i__######___########__i_##',
      '###____######___########____##',
      '#######......___....i..#######',
      '#######...r..___...r...#######',
      '#######......___.......#######',
      '#############_____############',
      '#############_____############',
      '#############_____############',
      '#############__S__############',
      '##############xx##############'],
    nw2: [
      '################################',
      '################################',
      '##___________ww_____S_Y______###',
      '##___________ww______________###',
      '##___________ww______________###',
      '##___________ww______________###',
      '##___________uu______________###',
      '##___________ww______________###',
      '##___________ww________________#',
      '##.....______ww________________x',
      '##.....______ww_____........___#',
      '##..i..______ww_____........_###',
      '##.....______ww_____....i..._###',
      '##.....______ww_____........_###',
      '##___________ww_____........_###',
      '##_________S_ww______________###',
      '###________#####################',
      '###________#####################',
      '###________#####################',
      '###x############################'],
    nw3: [
      'cccccccccccccccccccccccccccccc',
      'cccccccccccccccccccccccccccccc',
      'cccccccccccccccccccccccccccccc',
      'ccccccccOOOOOOOOOOOOOOOOOOsssT',
      'ccccccccOOOOOOOOOOOOOOOOOOsssT',
      'ccccccOOrOOOOOOOOOOOOOOOOOsSsT',
      'csssssOOOOOOOOOOOOOOOOOOOOsssT',
      'cssSssdddddOdddddOdddddOddddds',
      'msssssdddddOdddddOdddddOddddds',
      'csssssOOOOOOOOOOOOOOOOOOOOsssT',
      'csssssOOOOOOOOrOOOOOOOOOOOsssT',
      'ccccccOOOOOOOOOOOOOOOOOOOOsssT',
      'ccccccOOOOOOOOOOOOOOOOOOOOsssT',
      'ccccccOOOOOOOOOOOOOOOOOOOOsssT',
      'ccccccOOOOOOOOOOOOOOOOOOOOsssT',
      'ccccccOOOOOOOOOOOOOOOOOOOOsssT'],
    r14: [
      'OOOOOOOOOOOOOOOOTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'OOOOOOOOOOOOOOOO...T.....................T',
      'OOOOOOOOOOOOOzzzzz..........T..zzzzzz..T.T',
      'OOOOOOOOOOOOOzzzzz.T..E......T.zzzzzz....T',
      'sssssttsssssszzzzz.............zzzzzz.T..T',
      'ssssssssssssszzzzz...b....b....zzzzzz....T',
      'c.S.....................................ST',
      '==========================================',
      '==========================================',
      'c...............K........................T',
      'c..zzzzzz...........zzzzzzzz.......zzzz..T',
      'c..zzzzzzy..T.......zzzzzzzz..T....zzzz..T',
      'c..zzzzzz........T..zzzzzzzz.......zzzz..T',
      'c..zzzzzz...........zzzzzzzz.....T.zzzz..T',
      'c........................................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT']
  };
  const STOCK3 = () => H.STOCK2();
  H.num = num;

  // ------------------------------------------------------------ chapter 3 begins at the end of 다음 해안 항로 (after the chapter 2 credits)
  H.kickoff3 = async () => {
    if (flag('q24_start')) return;
    const N = '구조대원 파랑';
    set('q24_start');
    Wd().respawn();
    await G.wait(10);
    await say('저기요! 돛바람항에서 온 길지기죠? 해양교관 도하 님한테 연락받았어요.\n저는 해무나루 구조대원 파랑이에요.', N);
    await say('하얀 줄 부표 너머는 물살이 거세서 막아 뒀는데, 남쪽에 흰 부표로 안전 항로를 새로 표시했어요.\n흰 부표 사이를 따라 내려가면 해무 섬이에요.', N);
    await say('섬 서쪽 해변의 나무 선착장에서 내려서 동쪽으로 걸으면 해무나루예요.\n구조대장 가온 님이 기다리고 있어요. 중간 바위섬엔 구조대원이 있으니 힘들면 쉬어 가요!', N);
  };
  // the coast ferry of chapter 3 (after Q27): 해무나루 ↔ 푸른숨시, and back to 돛바람항
  H.ferry3 = async (here) => {
    const N = '정기선 선장';
    if (!flag('q27')) { await say('정화소 물길이 막힌 뒤로 정기선은 쉬고 있어요.\n수로가 맑아지면 해무나루와 푸른숨시, 돛바람항을 무료로 이어 드릴게요.', N); return; }
    const STOPS = [{ k: 'm07', n: '해무나루', map: 'm07', x: 34, y: 21, dir: 'left' }, { k: 'm08', n: '푸른숨시', map: 'm08', x: 9, y: 25, dir: 'up' },
      { k: 'harbor', n: '돛바람항', map: 'harbor', x: 7, y: 25, dir: 'down' }].filter(s => s.k !== here && (G.S.visited || {})[s.k]);
    if (!STOPS.length) { await say('아직 다른 부두를 다녀온 적이 없네요.', N); return; }
    const L = await G.say('정기선이에요. 어디로 모실까요? 무료예요!', { name: N, keep: true });
    const c = await G.choose(STOPS.map(s => s.n).concat(['괜찮아요']), { title: '정기선', cancel: STOPS.length });
    G.closeText(L);
    if (c < 0 || c >= STOPS.length) return;
    const s = STOPS[c];
    sfx('water');
    await G.fadeTo(1, 20);
    Wd().enter(s.map, s.x, s.y, s.dir);
    await G.fadeTo(0, 20);
    await say(`잔잔한 바다를 건너 ${s.n} 부두에 닿았다.`);
  };
  // 돛바람항 gets a ferry hand for the new line
  M.harbor.npcs.push({ id: 'hb_ferry3', char: 'sailor', x: 5, y: 25, dir: 'down', name: '정기선 선장', cond: () => flag('q24'),
    talk: () => H.ferry3('harbor') });

  // ------------------------------------------------------------ side-quest helpers (each one keeps its own flags; a reward is paid once)
  // a 교본 already owned becomes 조사증표 instead (no duplicate key items)
  H.giveTM3 = async (id, alt, N) => {
    if (G.S.bag[id]) { await give('token', alt); if (N) await say(`${D().ITEMS[id].n}${G.josa(D().ITEMS[id].n, '은', '는')} 이미 있구나. 대신 조사증표를 줄게.`, N); return; }
    await give(id, 1);
  };
  H.stamp3 = (k, t) => { G.S.records3 = G.S.records3 || {}; G.S.records3[k] = t; };

  // ------------------------------------------------------------ R13 흰부표 해로 (sea lane, rescue islet, the west beach of 해무 island)
  const SHELLS = {
    '22,15': { k: 'sq302_a', n: '북쪽 군락', d: '굵은 모래 · 껍데기 줄무늬가 넓고 성글다.' },
    '27,23': { k: 'sq302_b', n: '남쪽 군락', d: '고운 모래 · 껍데기 줄무늬가 가늘고 촘촘하다.' },
    '31,12': { k: 'sq302_c', n: '동쪽 군락', d: '자갈 섞인 모래 · 껍데기 줄무늬가 두껍고 겹쳐 있다.' } };
  const shellBed = async key => {
    const s = SHELLS[key];
    if (num('sq302') !== 1) { await say('줄무늬 조개들이 젖은 모래에 반쯤 묻혀 있다.' + (flag('q24') ? '\n(해무나루 조개 관찰소에서 군락 관찰을 부탁하고 있다)' : '')); return; }
    if (flag(s.k)) { await say(`이미 기록한 ${s.n}이다.\n${s.d}`); return; }
    set(s.k); sfx('select');
    await say(`조개 관찰점 · ${s.n}\n${s.d}`);
    const n = ['sq302_a', 'sq302_b', 'sq302_c'].filter(flag).length;
    await say(`관찰 수첩에 모래 굵기와 줄무늬를 적었다. (${n}/3)` + (n >= 3 ? '\n관찰소의 보라에게 가서 비교해 보자!' : ''));
  };
  const ring = async k => {
    const st = num('sq301');
    if (st < 2) { await say('밧줄을 거는 쇠고리가 박힌 바위다.' + (st === 1 ? '\n걸린 부표를 먼저 찾아야 한다.' : '')); return; }
    if (st >= 3 || flag(k)) { await say('부표 끈이 고리에 단단히 걸려 있다.'); return; }
    set(k); sfx('select');
    if (!(flag('sq301_r1') && flag('sq301_r2'))) { await say('부표 끈을 고리에 걸었다. 남은 고리 하나에도 걸자.'); return; }
    set('sq301', 3);
    await say('두 고리에 부표 끈을 다시 걸었다! 주황 부표가 파도 위에서 똑바로 섰다.\n구조대장 가온에게 알리자.');
  };
  M.r13 = {
    name: '흰부표 해로', kind: 'out', bgm: 'water', rows: ROWS.r13,
    links: {
      n: { to: 'searoute', dx: 0, from: 10, until: 13, gated: 1 },
      e: { to: 'm07', dy: 0, from: 18, until: 19 },
      s: { to: 'r14', dx: 0, from: 0, until: 15, gated: 1, cond: () => flag('q25') }
    },
    rescue: { map: 'm07', x: 25, y: 14, dir: 'down', n: '해무나루 구조대 앞' }, rescueKind: 'water',
    seaLine: '흰 부표가 떠 있는 안전 항로다. 해상 안정판과 파도타기 동료가 있으면 건널 수 있다.',
    signs: { '7,8': '바위섬 구조 쉼터\n"지치면 구조대원에게 말을 거세요 — 해무나루 구조대"' },
    items: [{ id: 'superpotion', x: 3, y: 10, flag: 'r13_isle' }, { id: 'goldcube', n: 2, x: 32, y: 10, flag: 'r13_cube' }, { id: 'revive', x: 32, y: 24, flag: 'r13_rev' }],
    objects: {
      '22,15': () => shellBed('22,15'), '27,23': () => shellBed('27,23'), '31,12': () => shellBed('31,12'),
      '20,23': () => ring('sq301_r1'), '23,23': () => ring('sq301_r2'),
      '16,24': async () => {   // SQ3-01: the snagged buoy behind the cove rocks (reach it on the sea board)
        const st = num('sq301');
        if (st >= 2) { await say('바위 틈이 깨끗하다. 걸려 있던 부표는 건져 냈다.'); return; }
        if (st < 1) { await say('바위 틈에 주황색 무언가가 끼어 출렁인다. 부표 같다.'); F().note('r13:buoy'); return; }
        set('sq301', 2); sfx('item');
        await say('바위 틈에 끼어 있던 주황 부표를 끈째 건져 냈다!\n해변의 쇠고리 두 개에 끈을 다시 걸자.');
      },
      '12,18': async () => {   // SQ3-08 sea observation point: 실해마
        if (num('sq308') !== 1) { await say('바다 한가운데 관측 바위다. 해초가 물살 방향으로 길게 누워 있다.'); return; }
        if (flag('sq308_a')) { await say('이미 기록한 관찰점이다.'); return; }
        set('sq308_a'); sfx('select');
        await say('관찰점 · 바깥여울 해초밭\n"실해마는 해초에 꼬리를 걸고 쉬다가, 같은 물살을 따라 무리째 움직인다."');
        await say(`관찰 수첩에 적었다. (${['sq308_a', 'sq308_b', 'sq308_c'].filter(flag).length}/3)`);
      },
      '20,17': async () => {   // the beach board, and SQ3-08 beach observation point: 찰칵게
        await say('흰부표 해변\n"찰칵게가 쌓은 작은 둑은 밟지 말아 주세요"  ▶ 해무나루');
        if (num('sq308') !== 1 || flag('sq308_b')) return;
        set('sq308_b'); sfx('select');
        await say('관찰점 · 해변 둑\n"찰칵게는 젖은 모래를 집게로 눌러 작은 둑을 쌓는다. 파도가 넘으면 더 넓게 다시 쌓는다."');
        await say(`관찰 수첩에 적었다. (${['sq308_a', 'sq308_b', 'sq308_c'].filter(flag).length}/3)`);
      }
    },
    npcs: [
      { id: 'r13_isle', char: 'sailor', x: 5, y: 9, dir: 'right', name: '구조대원 물결',
        talk: async () => {
          const N = '구조대원 물결';
          await say('바위섬 구조 쉼터예요! 잠깐 쉬어 가요.', N);
          await G.menus.heal();
          await say('동료들이 기운을 차렸어요.', N);
          const ok = await G.ask('해무나루 구조대 앞까지 구조 보트로 데려다 줄까요? 무료예요.', ['부탁해요', '괜찮아요'], { name: N });
          if (!ok) { await say('흰 부표 사이로만 다니면 안전해요. 동쪽 해변 선착장에서 내리면 돼요!', N); return; }
          Wd().surfing = null; sfx('water');
          await G.fadeTo(1, 20); Wd().enter('m07', 25, 14, 'down'); await G.fadeTo(0, 20);
          await say('구조 보트가 해무나루 부두에 닿았다.');
        } },
      { id: 'r13s1', char: 'swimmer', swim: true, x: 6, y: 15, dir: 'right', sight: 4,
        trainer: { flag: 'tr_r13s1', title: '수영 소녀', name: '바다', char: 'swimmer', team: [['pomal', 32], ['deungbulhaepa', 32]], base: 22,
          before: '흰 부표 밖은 물살이 세. 나랑 한판 하고 쉬었다 가!', lose: '포말이가 박수 쳐 주네. 졌다!', after: '포말이는 칭찬받으면 앞지느러미를 짝짝 마주 쳐. 귀엽지?' } },
      { id: 'r13s2', char: 'swimmer', swim: true, x: 16, y: 6, dir: 'left', sight: 3,
        trainer: { flag: 'tr_r13s2', title: '수영 선수', name: '파도', char: 'swimmer', team: [['silhaema', 33], ['byeolbangul', 32]], base: 22,
          before: '실해마는 물살 읽는 선수야. 따라올 수 있겠어?', lose: '물살이 네 편이었나 봐.', after: '실해마가 방울 소리를 내면 길을 잃었다는 뜻이래. 그땐 같이 기다려 줘.' } },
      { id: 'r13b1', char: 'kidB', x: 27, y: 17, dir: 'down', sight: 2,
        trainer: { flag: 'tr_r13b1', title: '갯벌 꼬마', name: '조약', char: 'kidB', team: [['chalkakge', 32], ['moraekkom', 33]], base: 20,
          before: '찰칵게 둑 밟지 마! ...아, 승부하러 온 거야?', lose: '모래꼼이 껍데기를 꼭 닫아 버렸어.', after: '조개 군락은 모래 굵기가 다 달라. 관찰소 언니가 그거 연구해.' } },
      { id: 'r13_pomal', mon: 'pomal', act: 'splash', x: 25, y: 20, dir: 'left', cond: () => num('sq301') < 4, text: '포말이가 해변에서 물거품을 뿜으며 논다.' },
      { id: 'r13_pomals', mon: 'pomal', act: 'hop', x: 21, y: 24, dir: 'right', cond: () => num('sq301') >= 4, text: '포말이 무리가 새 부표 옆에서 쉬고 있다. 부표 끈을 코로 콕콕 확인한다.' },
      { id: 'r13_pomals2', mon: 'haepum', act: 'sniff', x: 22, y: 24, dir: 'left', cond: () => num('sq301') >= 4, text: '해품범이 물살을 막는 쪽으로 몸을 눕히고 무리를 지켜본다.' },
      { id: 'r13_crab', mon: 'chalkakge', act: 'sniff', x: 29, y: 19, dir: 'left', text: '찰칵게가 젖은 모래를 집게로 꾹꾹 눌러 작은 둑을 쌓고 있다.' }],
    drawExtra: (T, cx, cy) => {
      const bob = Math.floor(G.frame / 24) % 2;
      // the white lane: buoys on both sides from the north edge down to the landing
      for (let y = 0; y <= 16; y += 2) [9, 14].forEach(x => { const X = x * 16 + 8 - cx, Y = y * 16 + 9 - cy + ((x + y + bob) % 2); G.disc(T, X, Y, 3, '#2c5ea8'); G.disc(T, X, Y, 2, '#ffffff'); });
      // three safety buoys (red with a white band) along the way
      [[11, 4], [12, 9], [11, 14]].forEach(([x, y]) => { const X = x * 16 + 8 - cx, Y = y * 16 + 8 - cy + bob; G.disc(T, X, Y, 5, '#ffffff'); G.disc(T, X, Y, 4, '#e04848'); T.fillStyle = '#ffffff'; T.fillRect(X - 4, Y - 1, 8, 2); T.fillRect(X - 1, Y - 10, 2, 5); });
      // SQ3-01: the snagged buoy, then the restored one on its rings
      if (num('sq301') < 2) { const X = 16 * 16 + 8 - cx, Y = 24 * 16 + 9 - cy + bob; G.disc(T, X, Y, 4, '#3a2a1a'); G.disc(T, X, Y, 3, '#f08a2a'); }
      if (num('sq301') >= 3) {
        T.strokeStyle = '#d8c090'; T.lineWidth = 1; T.beginPath(); T.moveTo(20 * 16 + 8 - cx, 23 * 16 + 8 - cy); T.lineTo(21 * 16 + 8 - cx, 26 * 16 - cy); T.lineTo(23 * 16 + 8 - cx, 23 * 16 + 8 - cy); T.stroke();
        const X = 21 * 16 + 8 - cx, Y = 25 * 16 + 12 - cy + bob; G.disc(T, X, Y, 4, '#ffffff'); G.disc(T, X, Y, 3, '#f08a2a');
      }
    },
    onEnter: async () => {
      visit('r13');
      if (!flag('r13_seen')) { set('r13_seen'); await G.wait(10); await say('하얀 부표가 남쪽으로 줄지어 떠 있다. 부표 사이가 안전 항로다.\n멀리 동쪽에 모래 해변과 나무 선착장이 보인다.'); }
    }
  };

  // ------------------------------------------------------------ M07 해무나루 (island village, no gym)
  const acceptQ25 = async N => {
    await give('map10', 1, true);
    await say(`${P()}${G.josa(P(), '은', '는')} 너울잠굴 안전도를 받았다!\n(메뉴의 [지도]에 너울잠굴이 더해졌다)`);
    await say('입구랑 안전 발판, 대피 지점만 그려 놨어. 안쪽 길은 걸으면서 채워 줘.\n작은 낙석은 바위깨기로, 둥근 받침돌은 바위 밀기로 옮기면 돼.', N);
    await say('맨 안쪽 관측 수문에 옛 부두 발판을 내리는 레버가 있어. 그걸 내리면 부두가 이어질 거야.\n힘들면 메뉴의 [구조 요청]. 우리가 데리러 갈게.', N);
    set('q25_start');
  };
  const gaonTalk = async () => {
    const N = '구조대장 가온';
    if (!flag('q24')) {
      await say('흰 부표를 따라 잘 왔구나! 나는 해무나루 구조대장 가온이야.', N);
      await say('부표는 길을 알려 주지만, 돌아올 자리도 같이 봐 둬.\n우리 부두가 보이면 언제든 쉬어 가도 돼.', N);
      await give('map09', 1, true);
      await say(`${P()}${G.josa(P(), '은', '는')} 해무군도 안내도를 받았다!\n(메뉴의 [지도]에 3장 지도가 더해졌다)`);
      await say('부두랑 마을, 해안 큰 윤곽만 그린 안내도야. 걸은 길은 저절로 채워질 거야.', N);
      set('q24');
      await say('...부탁이 하나 있어. 마을 남쪽 너울잠굴 너머에 구조대가 쓰던 옛 부두가 있었거든.\n몇 해 전 낙석으로 끊겼는데, 그 부두가 이어지면 바닷솔길로 푸른숨시까지 걸어갈 수 있어.', N);
      const ok = await G.ask('옛 부두 조사를 맡아 줄래?', ['맡을게요', '조금 이따가'], { name: N });
      if (ok) await acceptQ25(N); else await say('그래, 마을부터 둘러봐. 준비되면 다시 말 걸어 줘.', N);
      Wd().respawn();
      return;
    }
    if (!flag('q25_start')) {
      const ok = await G.ask('옛 부두 조사, 지금 맡아 줄래?', ['맡을게요', '아직이요'], { name: N });
      if (ok) await acceptQ25(N);
      return;
    }
    if (num('sq301') === 3) {   // SQ3-01 report
      set('sq301', 4);
      await say('부표를 다시 걸어 줬다고? 바위 뒤까지 살펴 줬구나. 고마워!', N);
      await say('봐, 포말이들이 새 부표를 따라 돌아오고 있어. 부표는 길을 알려 주고, 돌아올 자리도 알려 주지.', N);
      await give('token', 1); await give('berry', 3);
      H.stamp3('sq301', '돌아오지 않은 부표: 바위 뒤 부표를 건져 두 고리에 다시 걸었다.');
      return;
    }
    if (!flag('q25')) { await say('옛 부두는 너울잠굴 동쪽 끝이야. 관측 수문의 레버로 발판을 내려 줘.\n받침돌이 엉키면 입구 돌판에서 처음 자리로 돌릴 수 있어.', N); }
    else if (!flag('q26')) await say('부두가 이어졌어! 바닷솔길을 따라가면 푸른숨시야.\n그쪽 정화사 은서가 도움을 청했다더라. 동료들이 정화소 밖으로 쉬러 나왔대.', N);
    else if (!flag('q28')) await say('푸른숨시 일은 잘 되고 있어? 정화소가 맑아지면 정기선도 다시 돌 거야.', N);
    else if (!flag('q29')) await say('다섯 번째 배지! 급류 강습장의 여민 교관한테 가 봐. 북쪽 굽이강엔 급류가 많거든.', N);
    else await say('급류도 건너고... 이제 진짜 구조대원 같은데? 언제든 쉬어 가.', N);
    if (flag('q24') && !num('sq301')) {   // SQ3-01 offer (optional)
      await say('참, 포말이가 끊어진 부표 끈을 물고 왔어.\n해변 어딘가에 부표가 걸린 것 같은데...', N);
      const ok = await G.ask('시간 있으면 찾아봐 줄래? (선택 의뢰)', ['찾아볼게요', '나중에요'], { name: N });
      if (!ok) return;
      set('sq301', 1);
      await say('끈은 구조대 안 탁자에 있어. 흰부표 해변 남쪽, 바위 뒤를 살펴봐. 물 쪽에서 다가가야 할 거야.\n부표를 찾으면 해변의 쇠고리 두 개에 끈을 다시 걸어 줘.', N);
    }
  };
  const SCHOOL = () => flag('q29_start');
  // Q29 거센 물에도 돌아오는 길: 교관 여민 teaches 급류타기 (or lends the rescue team's 해품범) and the board bridle
  H.yeominTalk = async () => {
    const N = '교관 여민';
    if (!flag('badge5')) {
      await say('급류 강습장 교관 여민이야. 강습은 다섯 번째 배지를 받은 길지기부터 받을 수 있어.\n미리 알려 줄게. 굵은 물결 띠가 급류, 가느다란 줄무늬는 잔잔한 물이야.', N);
      await say('강습장에 들어가려고 급류를 건널 필요는 없어. 정기선이든 걸어서든 여기로 오면 돼.\n물에 맞는 동료가 없어도 괜찮아. 구조대의 해품범이 함께 가 줄 거야.', N);
      return;
    }
    if (!flag('q29_start')) {
      await say('푸른숨배지! 좋아, 급류타기 강습을 시작하자.', N);
      await say('급류타기는 잔물타기의 다음 단계야. 물판에 고정끈을 걸고, 동료가 물살을 가로질러 끌어 줘.\n표식이 있는 급류 띠만 건널 수 있어. 폭포는 아직 안 돼.', N);
      await H.teachOrLend('current', 'haepum', N);
      await give('bridle', 1);
      set('q29_start');
      await say('수조 선착장에서 물을 바라보고 A! 물살 두 개를 건너 오른쪽 위 선착판에 내렸다가,\n다시 물살 두 개를 건너 선착장으로 돌아오면 수료야. 실패해도 다시 하면 돼!', N);
      return;
    }
    if (!flag('q29')) {
      const ok = await G.ask('코스를 처음부터 다시 할래?', ['처음부터', '계속할게요'], { name: N });
      if (ok) { ['q29_b1', 'q29_b2', 'q29_land'].forEach(k => delete G.S.flags[k]); await say('좋아, 선착장에서 다시 출발! 물살 두 개, 선착판, 그리고 돌아오기.', N); }
      else await say('물살 두 개를 건너 오른쪽 위 선착판에 내렸다가, 다시 건너서 선착장으로!', N);
      return;
    }
    if (!flag('q30_start')) await say('굽이강은 해무나루 북쪽 강어귀에서 거슬러 올라가. 푸른숨시 운송 접수소의 담소가 운송도를 줄 거야.', N);
    else await say('굽이강 급류 띠는 표식이 있는 곳만 건너. 폭포는 위에서 바라보기만!', N);
  };
  H.finishQ29 = async () => {
    const N = '교관 여민';
    if (!(flag('q29_b1') && flag('q29_b2') && flag('q29_land'))) return;
    set('q29');
    G.audio && G.audio.jingle('badge');
    await say('진입, 횡단, 안전 하선, 귀환까지! 급류타기 수료야.', N);
    await say('굽이강은 강어귀에서 북쪽으로 거슬러 올라가. 굵은 물결 띠는 건너도 되고,\n폭포는 건너지 않아. 지친 동료가 있으면 강가 하선점에서 쉬어 가.', N);
    await say('푸른숨시 운송 접수소의 담소가 굽이강 운송도를 갖고 있대. 정기선 타고 다녀와!', N);
  };
  M.m07 = {
    name: '해무나루', kind: 'out', bgm: 'town', rows: ROWS.m07, currents: true,
    buildings: [
      { k: 'center', x: 2, y: 10, w: 6, h: 4, roof: 'red', wall: '#fbf6ee' },
      { k: 'shop', x: 9, y: 10, w: 5, h: 4, roof: 'blue', wall: '#f4f6fa' },
      { k: 'house', x: 22, y: 9, w: 7, h: 5, roof: 'orange', wall: '#f6eee0', label: '구조대' },
      { k: 'house', x: 29, y: 9, w: 5, h: 4, roof: 'teal', wall: '#eef6f6', label: '관찰소' },
      { k: 'house', x: 2, y: 15, w: 5, h: 3, roof: 'green' },
      { k: 'house', x: 9, y: 15, w: 5, h: 3, roof: 'red', wall: '#f8f0e4', label: '우편' }],
    props: [{ k: 'boat', x: 36, y: 23 }, { k: 'crates', x: 33, y: 20 }],
    blocks: [{ x: 33, y: 20 }, { x: 26, y: 7, cond: () => !SCHOOL() }, { x: 27, y: 7, cond: () => !SCHOOL() }, { x: 3, y: 23, cond: () => !flag('q25_start') }],
    warps: [
      { x: 4, y: 13, to: 'center_hm', tx: 5, ty: 6, dir: 'up' }, { x: 5, y: 13, to: 'center_hm', tx: 6, ty: 6, dir: 'up' },
      { x: 11, y: 13, to: 'shop_hm', tx: 4, ty: 5, dir: 'up' },
      { x: 25, y: 13, to: 'rescue_hm', tx: 5, ty: 5, dir: 'up' },
      { x: 31, y: 12, to: 'shell_hm', tx: 4, ty: 4, dir: 'up' },
      { x: 4, y: 17, to: 'house_hm', tx: 3, ty: 5, dir: 'up' },
      { x: 11, y: 17, to: 'post_hm', tx: 4, ty: 4, dir: 'up' },
      { x: 3, y: 23, to: 'nw1', tx: 14, ty: 18, dir: 'up', tdir: 'up' }],
    links: {
      w: { to: 'r13', dy: 0, from: 18, until: 19 },
      n: { to: 'r15', dx: -8, from: 15, until: 20, gated: 1, cond: () => flag('q30_start') }
    },
    seaLine: '해무나루 앞바다다. 섬 사이로 흰 부표 항로가 이어진다.',
    waterLine: '해무나루 강어귀다. 물판으로 건널 수 있을 것 같다.',
    signs: {
      '20,9': '해무나루\n"구조대와 조개의 섬마을"  ◀ 흰부표 해변   ▲ 굽이강 강어귀   ▶ 정기선 부두',
      '14,17': '해무나루 우편 취급소\n"편지는 기한 없이 맡아 드려요"'
    },
    objects: {
      '3,23': async () => { if (!flag('q25_start')) await say('동굴 입구에 팻말이 걸려 있다.\n"너울잠굴 — 안전도 없이 들어가지 마세요 · 해무나루 구조대"'); },
      '26,7': async () => { if (!SCHOOL()) await say('급류 강습장 선착장이다.\n"강습은 다섯 번째 배지를 받은 길지기부터 · 교관 여민"'); },
      '27,7': async () => { if (!SCHOOL()) await say('급류 강습장 선착장이다.\n"강습은 다섯 번째 배지를 받은 길지기부터 · 교관 여민"'); }
    },
    // the rapids school course (Q29): enter band 1, cross band 2, land on the far plank, come back to the dock
    onCurrent: async (x, y) => {
      if (!flag('q29_start') || flag('q29')) return;
      if (y === 5 && !flag('q29_b1')) { set('q29_b1'); sfx('select'); await say('첫 번째 물살에 들어섰다! 고정끈이 팽팽하게 버틴다.', '교관 여민'); }
      if (y === 2 && flag('q29_b1') && !flag('q29_b2')) { set('q29_b2'); sfx('select'); await say('두 번째 물살도 가로질렀어! 이제 오른쪽 위 선착판에 내려 봐.', '교관 여민'); }
    },
    triggers: [
      { x: 32, y: 1, cond: () => flag('q29_start') && flag('q29_b2') && !flag('q29_land'), run: async () => { set('q29_land'); sfx('select'); await say('안전하게 내렸어! 이번엔 다시 물판에 올라 물살 두 개를 건너 선착장으로 돌아와.', '교관 여민'); } },
      { x: 26, y: 7, w: 2, h: 1, cond: () => flag('q29_land') && !flag('q29'), run: () => H.finishQ29() }],
    npcs: [
      { id: 'gaon', char: 'gaon', x: 24, y: 14, dir: 'down', name: '구조대장 가온', talk: gaonTalk },
      { id: 'hm_greet', char: 'sailor', x: 2, y: 18, dir: 'right', name: '구조대원 파랑',
        text: () => flag('q24') ? '해무나루 구조대는 언제나 부두에 있어요. 다치면 센터, 길을 잃으면 구조대!' : '해무나루에 어서 와요! 가온 대장님은 주황 지붕 구조대 앞에 계세요.' },
      { id: 'yeomin', char: 'yeomin', x: 28, y: 8, dir: 'left', name: '교관 여민', talk: () => H.yeominTalk() },
      { id: 'hm_ferry', char: 'sailor', x: 38, y: 22, dir: 'left', name: '정기선 선장', talk: () => H.ferry3('m07') },
      { id: 'maru', char: 'fisher', x: 21, y: 24, dir: 'down', name: '낚시 안내원 마루', talk: () => H.maruTalk() },
      { id: 'hm_elder', char: 'elder', x: 7, y: 7, dir: 'down', move: 'wander', name: '해무 할머니',
        text: () => flag('q25') ? '옛 부두가 다시 이어졌다며? 구조대 배가 거기 닿던 때가 생각나는구먼.' : '저 너울잠굴 너머에 옛 부두가 있었지. 낙석으로 끊긴 뒤로 다들 배로만 다녀.' },
      { id: 'hm_kid', char: 'kidA', x: 14, y: 21, dir: 'right', move: 'wander', name: '해무 꼬마',
        text: '포말이는 조개를 코로 밀어서 마른 데로 옮겨 줘! 칭찬해 주면 박수도 쳐.' },
      { id: 'hm_rescue2', char: 'sailor', x: 30, y: 15, dir: 'left', name: '구조대원 바람',
        text: () => flag('q27') ? '정기선이 다시 다녀요! 부두 끝의 선장님께 말하면 푸른숨시나 돛바람항으로 가요.' : '부두 끝 정기선은 지금 쉬는 중이에요. 푸른숨시 정화소 물길이 막혀서요.' },
      { id: 'hm_pomal', mon: 'pomal', act: 'splash', x: 18, y: 23, dir: 'left', text: '포말이가 조개를 코로 밀어 마른 모래 쪽으로 옮기고 있다.' },
      { id: 'hm_haepum', mon: 'haepum', act: 'sniff', x: 33, y: 23, dir: 'left', text: '구조대의 해품범이 부두 옆에서 물살을 살핀다. 잠잠한 곳을 찾으면 꼬리로 물을 친다.' },
      { id: 'hm_clam', mon: 'moraekkom', act: 'hop', x: 30, y: 14, dir: 'down', text: '모래꼼이 관찰소 앞에서 모래알을 하나씩 꼭 맞게 쌓고 있다.' }],
    drawExtra: (T, cx, cy) => {
      // buoy ropes drying in front of the rescue station (구조대 생활 장면)
      const X = 22 * 16 - cx, Y = 14 * 16 + 2 - cy;
      T.fillStyle = '#8a6a4a'; T.fillRect(X, Y, 2, 12); T.fillRect(X + 30, Y, 2, 12);
      T.strokeStyle = '#d8c090'; T.lineWidth = 1; T.beginPath(); T.moveTo(X + 1, Y + 1); T.quadraticCurveTo(X + 16, Y + 6, X + 31, Y + 1); T.stroke();
      [[6, '#f08a2a'], [14, '#ffffff'], [22, '#f08a2a']].forEach(([dx, c]) => { G.disc(T, X + dx, Y + 5, 2, c); });
      // the practice pool's yellow course marks
      if (flag('q28')) [[22, 2], [32, 2], [22, 5], [32, 5]].forEach(([x, y]) => { T.fillStyle = '#f2d23a'; T.fillRect(x * 16 - cx + (x === 22 ? 0 : 13), y * 16 - cy, 3, 16); });
    },
    onEnter: async () => {
      visit('m07');
      if (!flag('m07_seen')) { set('m07_seen'); await G.wait(10); await say('젖은 부표 끈이 널린 작은 섬마을. 갈매기 소리 사이로 포말이들이 물거품을 뿜는다.'); }
    }
  };
  H.center('center_hm', '해무나루', 'm07', 4, 14);
  H.shop('shop_hm', '해무나루', 'm07', 11, 14, STOCK3);
  H.house('house_hm', '해무나루 집', 'm07', 4, 18, [
    { id: 'hmh1', char: 'woman', x: 5, y: 2, dir: 'down', name: '해무 주민', text: () => flag('q27') ? '정기선이 다니니까 푸른숨시 시장에 가기 편해졌어요!' : '푸른숨시까지는 배로 반나절이에요. 요즘은 정기선이 쉬어서 다들 집에 있어요.' },
    { id: 'hmh2', mon: 'pomal', act: 'hop', x: 5, y: 4, dir: 'left', text: '집 안의 포말이가 앞지느러미로 박수를 친다. 손님이 반가운 모양이다.' }]);

  // 구조대: Q24-Q25 base, SQ3-01's broken rope on the table
  M.rescue_hm = {
    name: '해무나루 구조대', kind: 'in', bgm: 'town',
    rows: ['#W###WW###W#', 'B...NN.....B', '............', '..tt....tt..', '..tt........', '............', '.....xx.....'],
    warps: [{ x: 5, y: 6, to: 'm07', tx: 25, ty: 14, dir: 'down' }, { x: 6, y: 6, to: 'm07', tx: 25, ty: 14, dir: 'down' }],
    objects: {
      '4,1': async () => say('구조 게시판: "흰 부표 항로 — 바위섬 쉼터 운영 중"\n"너울잠굴 옛 부두 — 조사 길지기 모집 · 구조대장 가온"'),
      '5,1': async () => say('구조대 근무표다. 해품범과 포말이의 이름이 나란히 적혀 있다.'),
      '2,3': async () => {
        if (num('sq301') < 1) { await say('탁자 위에 끊어진 부표 끈이 놓여 있다. 끝이 이빨 자국으로 젖어 있다.'); return; }
        if (!flag('sq301_rope')) { set('sq301_rope'); sfx('select'); }
        await say('포말이가 물고 온 끊어진 부표 끈이다. 주황 칠이 묻어 있다.\n흰부표 해변 남쪽 바위 뒤에 부표가 걸려 있을지도 모른다.');
      }
    },
    npcs: [
      { id: 'rs1', char: 'sailor', x: 9, y: 4, dir: 'left', name: '구조대원 해들',
        text: () => flag('q25') ? '옛 부두가 이어지니 구조 보트가 돌아갈 길도 짧아졌어요!' : '구조 요청은 메뉴에서 보낼 수 있어요. 동굴이든 물 위든 데리러 가요!' },
      { id: 'rs_pomal', mon: 'pomal', act: 'hop', x: 3, y: 5, dir: 'up', text: '포말이가 끊어진 끈 냄새를 맡더니 고개를 갸웃한다.' }]
  };
  // 조개 관찰소: SQ3-02 (보라), SQ3-08's tank observation point, the 보루패 demonstration
  H.boraTalk = async () => {
    const N = '관찰원 보라';
    if (!flag('q24')) { await say('조개 관찰소예요. 구조대장님께 먼저 인사하고 와요!', N); return; }
    const st = num('sq302');
    if (st === 0) {
      await say('어서 와요, 관찰원 보라예요. 흰부표 해변에 조개 군락이 셋 있거든요.\n군락마다 모래 굵기랑 껍데기 줄무늬가 달라요.', N);
      await say('세 군락의 모래와 줄무늬를 기록해 주면 좋겠어요.\n잡지 않고 보기만 하면 돼요.', N);
      const ok = await G.ask('기록해 줄래요? (선택 의뢰)', ['기록할게요', '나중에요'], { name: N });
      if (!ok) return;
      set('sq302', 1);
      await say('조개 군락은 해변의 줄무늬 조개밭이에요. 앞에서 A 버튼으로 관찰해요.\n세 곳을 다 적으면 이 수조의 모래꼼과 비교해 봐요!', N);
      return;
    }
    if (st === 1) {
      const n = ['sq302_a', 'sq302_b', 'sq302_c'].filter(flag).length;
      if (n < 3) { await say(`아직 ${3 - n}곳 남았어요. 북쪽·남쪽·동쪽 해변의 조개밭이에요.`, N); return; }
      for (;;) {
        const L = await G.say('수조의 모래꼼은 고운 모래를 꼭꼭 쌓고, 껍데기 줄무늬가 가늘고 촘촘해요.\n이 모래꼼은 어느 군락에서 왔을까요?', { name: N, keep: true });
        const c = await G.choose(['북쪽 군락 (굵은 모래)', '남쪽 군락 (고운 모래)', '동쪽 군락 (자갈 섞인 모래)'], { title: '군락 비교', cancel: -1 });
        G.closeText(L);
        if (c === 1) break;
        sfx('bump');
        await say(c < 0 ? '천천히 해도 돼요. 수첩에 적은 줄무늬를 다시 봐요.' : '음... 줄무늬 간격을 다시 봐요. 모래꼼은 자기 몸에 맞는 고운 모래를 골라 쌓아요.', N);
        if (c < 0) return;
      }
      set('sq302', 2); sfx('select');
      await say('맞아요, 남쪽 군락! 모래꼼은 고운 모래로 껍데기 줄무늬를 촘촘하게 키워요.\n관찰 기록 고마워요. 이건 관찰소에서 드리는 물결돌이에요.', N);
      await give('wavestone', 1);
      H.stamp3('sq302', '조개가 고른 모래: 남쪽 군락의 고운 모래와 촘촘한 줄무늬를 기록했다.');
      const ok = await G.ask('관찰소 모래꼼이 물결돌로 자라는 시연을 볼래요? (돌은 관찰소 것을 써요)', ['볼래요', '괜찮아요'], { name: N });
      if (ok) {
        set('sq302_demo'); sfx('sparkle');
        await F().play(60, (T, cx, cy, k) => { T.fillStyle = `rgba(150,220,255,${0.5 * Math.sin(Math.PI * k)})`; T.fillRect(0, 0, 256, 192); });
        await say('수조의 모래꼼이 물결돌의 떨림에 반응해 껍데기를 넓게 펼쳤다...\n보루패가 되었다! 비스듬히 선 껍데기 옆으로 작은 물결이 흘러간다.');
        await say('진화는 언제나 동료가 고르는 거예요. 길지기님 모래꼼도 원할 때만 돌을 써요!', N);
        Wd().respawn();
      }
      return;
    }
    await say(flag('sq302_demo') ? '보루패가 수조 물결을 비스듬히 흘려보내죠? 살아 있는 방파제예요.' : '언제든 시연을 보러 와요. 진화는 동료가 고르는 거예요.', N);
    if (!flag('sq302_demo')) {
      const ok = await G.ask('지금 시연을 볼래요?', ['볼래요', '괜찮아요'], { name: N });
      if (ok) { set('sq302_demo'); await say('수조의 모래꼼이 보루패가 되었다!'); Wd().respawn(); }
    }
  };
  M.shell_hm = {
    name: '조개 관찰소', kind: 'in', floor: '_', bgm: 'water',
    rows: ['#W######W#', 'B.ww..ww.B', '__ww__ww__', '__________', '_____t____', '____x_____'],
    warps: [{ x: 4, y: 5, to: 'm07', tx: 31, ty: 13, dir: 'down' }],
    objects: {
      '2,1': async () => {   // SQ3-08 tank observation point: 모래꼼
        await say('관찰 수조다. 고운 모래 위에서 모래꼼이 껍데기를 반쯤 열고 있다.');
        if (num('sq308') !== 1 || flag('sq308_c')) return;
        set('sq308_c'); sfx('select');
        await say('관찰점 · 관찰소 수조\n"모래꼼은 물이 탁해지면 껍데기를 닫고, 맑은 물을 천천히 내보낸다."');
        await say(`관찰 수첩에 적었다. (${['sq308_a', 'sq308_b', 'sq308_c'].filter(flag).length}/3)`);
      },
      '6,1': async () => say(flag('sq302_demo') ? '보루패가 껍데기를 비스듬히 세워 수조의 물결을 흘려보낸다.' : '작은 수조에 조개 군락별 모래 샘플이 담겨 있다.')
    },
    npcs: [
      { id: 'bora', char: 'bora', x: 5, y: 3, dir: 'down', name: '관찰원 보라', talk: () => H.boraTalk() },
      { id: 'sh_clam', mon: 'moraekkom', swim: true, act: 'hop', x: 2, y: 2, dir: 'down', cond: () => !flag('sq302_demo'), text: '수조의 모래꼼이 모래알을 하나씩 꼭 맞게 쌓고 있다.' },
      { id: 'sh_borupae', mon: 'borupae', swim: true, act: 'sniff', x: 2, y: 2, dir: 'down', cond: () => flag('sq302_demo'), text: '시연에서 자란 보루패가 수조 물결을 비스듬히 흘려보낸다.' }]
  };
  // 우편 취급소: SQ3-06 (누리)
  H.nuriTalk = async () => {
    const N = '우편 담당 누리';
    const st = num('sq306');
    if (!flag('q24')) { await say('우편 취급소예요. 섬 밖으로 가는 편지는 구조대 배로 보내요.', N); return; }
    if (st === 0) {
      await say('어서 와요, 우편 담당 누리예요. 돌바퀴시에서 일하는 동생한테 편지를 쓰긴 했는데...', N);
      const ok = await G.ask('혹시 그쪽으로 가게 되면 전해 줄래요?\n기한도 비용도 없어요. (선택 의뢰)', ['전해 줄게요', '나중에요'], { name: N });
      if (!ok) return;
      set('sq306', 1); await give('letter3', 1);
      await say('돌바퀴시 적재장에서 일하는 노을이에요. 이름만 알려 줄게요.\n가는 길은... 큰 강을 거슬러 가야 한대요. 언제가 돼도 괜찮아요!', N);
      return;
    }
    if (st === 1) { await say('노을이는 돌바퀴시 적재장에서 일해요. 서두르지 않아도 돼요.', N); return; }
    if (st === 2) {
      if (!flag('q31')) { await say('답장을 받아 왔다고요? 돌아오는 길이 먼데... 화차가 다니게 되면 그때 줘요!\n(돌바퀴시의 도시간 화차가 열리면 돌아오자)', N); return; }
      set('sq306', 3); if (G.S.bag.reply3) D().useItem('reply3');
      await say('노을이 답장! "쉬는 시간에 쓴다, 잘 지내" ...이것만 써도 다 알 것 같아요. 고마워요!', N);
      const c = await G.choose(['푹 쉬라고 전해 달래요', '건강하게 잘 지낸대요'], { title: '어떻게 전할까?', cancel: 0 });
      await say(c === 0 ? '쉬라는 말, 제가 먼저 해야겠네요. 다음 편지엔 꼭 쓸게요.' : '건강하다니 다행이에요. 다음엔 제가 놀러 가 볼래요.', N);
      await give('token', 2);
      G.S.money += 500; sfx('item');
      await say(`${P()}${G.josa(P(), '은', '는')} 수고비 500원을 받았다!`);
      H.stamp3('sq306', '도착했다는 짧은 편지: 해무나루 누리와 돌바퀴시 노을 사이에 편지를 이었다.');
      Wd().respawn();
      return;
    }
    await say('우편함에 노을이 편지가 하나 더 왔어요. 이제 정기선이랑 화차로 금방이에요.', N);
  };
  M.post_hm = {
    name: '해무나루 우편 취급소', kind: 'in', bgm: 'town',
    rows: ['#W######W#', 'BB..N...BB', '..cccc....', '..........', '..........', '....x.....'],
    warps: [{ x: 4, y: 5, to: 'm07', tx: 11, ty: 18, dir: 'down' }],
    objects: { '4,1': async () => say(num('sq306') >= 3 ? '우편함에 돌바퀴시 소인이 찍힌 새 편지가 꽂혀 있다.' : '섬 우편함이다. "구조대 배 편으로 보냅니다"') },
    npcs: [{ id: 'nuri', char: 'nuri', x: 3, y: 1, dir: 'down', name: '우편 담당 누리', talk: () => H.nuriTalk() }]
  };
  // SQ3-08 (마루, the fishing guide on the south beach)
  H.maruTalk = async () => {
    const N = '낚시 안내원 마루';
    const st = num('sq308');
    if (!flag('q24')) { await say('낚시 안내원 마루야. 해무나루 둔덕에선 어떤 낚싯대로도 바다 동료를 만날 수 있어.', N); return; }
    if (st === 0) {
      await say('낚시 안내원 마루야. 해무나루 둔덕은 어떤 낚싯대로도 실해마·모래꼼·찰칵게를 만날 수 있어.\n그런데 잡지 않아도 남는 기록이 있거든.', N);
      await say('바다·해변·관찰소 수조, 고정 관찰점 세 곳의 설명을 읽고 오는 거야.\n포획도 전투도 필요 없어.', N);
      const ok = await G.ask('관찰점 세 곳, 읽고 와 줄래? (선택 의뢰)', ['읽어 올게', '나중에'], { name: N });
      if (!ok) return;
      set('sq308', 1);
      await say('바다 관찰점은 흰부표 해로 한가운데 관측 바위, 해변은 흰부표 해변 안내판,\n수조는 조개 관찰소야. 다 읽으면 나한테 보여 줘!', N);
      return;
    }
    if (st === 1) {
      const n = ['sq308_a', 'sq308_b', 'sq308_c'].filter(flag).length;
      if (n < 3) { await say(`관찰점 ${3 - n}곳이 남았어. 바다의 관측 바위, 해변 안내판, 관찰소 수조!`, N); return; }
      set('sq308', 2);
      await say('물살을 따라 쉬는 실해마, 맑은 물을 내보내는 모래꼼, 둑을 쌓는 찰칵게...\n잡지 않아도 이렇게 남는 거야. 좋은 수첩이 됐네!', N);
      await give('token', 3);
      H.stamp3('sq308', '잡지 않아도 남는 기록: 실해마·모래꼼·찰칵게의 서식 관찰 스탬프.');
      await say('낚시 게시판에도 네 기록을 붙여 둘게. 둔덕은 어느 낚싯대든 그대로 쓸 수 있어.', N);
      return;
    }
    await say('둔덕에 찌를 던지고, 흔들리면 A! 잡든 안 잡든 기록은 남아.', N);
  };

  // ------------------------------------------------------------ D09 너울잠굴 (Q25): a fallen rock, two seat stones and the old pier lever
  const nwRescue = { map: 'm07', x: 3, y: 24, dir: 'down' };
  M.nw1 = {
    name: '너울잠굴 입구 암반길', floorName: '입구 암반길', kind: 'cave', bgm: 'cave', rows: ROWS.nw1,
    dark: { lamp: 72, none: 24 }, rescue: nwRescue,
    warps: [{ x: 14, y: 19, to: 'm07', tx: 3, ty: 24, dir: 'down', tdir: 'down' }, { x: 15, y: 19, to: 'm07', tx: 3, ty: 24, dir: 'down', tdir: 'down' },
      { x: 14, y: 0, to: 'nw2', tx: 3, ty: 18, dir: 'up', tdir: 'up' }],
    signs: { '14,5': '너울잠굴 · 관측 수문 방향 ▲\n"낙석 주의 — 해무나루 구조대"', '15,18': '너울잠굴\n"안전도에 표시된 발판으로만 다니세요 — 해무나루 구조대"' },
    items: [{ id: 'superpotion', x: 4, y: 9, flag: 'nw1_a' }, { id: 'goldcube', n: 2, x: 26, y: 9, flag: 'nw1_b' }],
    npcs: [
      { id: 'nw1t', char: 'hiker', x: 18, y: 13, dir: 'left', sight: 3,
        trainer: { flag: 'tr_nw1t', title: '동굴 탐험가', name: '여울', char: 'hiker', team: [['gwibami', 33], ['jagalkong', 33], ['moraekkom', 34]], base: 22,
          before: '이 동굴은 물웅덩이마다 사는 동료가 달라! 실력 좀 볼까?', lose: '웅덩이처럼 깊은 실력이네.', after: '물웅덩이를 들여다보면 모래꼼이 숨어 있기도 해. 놀라지 마!' } }],
    onEnter: async () => { visit('d09'); if (!flag('nw1_seen')) { set('nw1_seen'); await G.wait(10); await say('짠 바다 냄새가 나는 동굴이다. 바위 틈마다 맑은 물웅덩이가 고여 있다.'); } }
  };
  M.nw2 = {
    name: '너울잠굴 관측 수문', floorName: '관측 수문', kind: 'cave', theme: 'works', bgm: 'cave', rows: ROWS.nw2,
    dark: { lamp: 80, none: 26 }, rescue: nwRescue,
    warps: [{ x: 3, y: 19, to: 'nw1', tx: 14, ty: 1, dir: 'down', tdir: 'down' }, { x: 31, y: 9, to: 'nw3', tx: 1, ty: 8, dir: 'right', tdir: 'right' }],
    boulders: [{ id: 'nb1', x: 12, y: 6 }, { id: 'nb2', x: 8, y: 10 }],
    signs: { '20,2': '옛 부두 발판 레버\n"관측 수문 옆 · 조수 관측용 발판을 수동으로 내릴 것"' },
    objects: { '11,15': async () => { await say('받침돌 돌판이다.\n"수로 받침돌 — 처음 자리로"'); const ok = await G.ask('돌을 처음 자리로 되돌릴까?'); if (ok) await F().resetPuzzle(); } },
    items: [{ id: 'hyperpotion', x: 25, y: 14, flag: 'nw2_a' }],
    onSlot: async () => {
      const filled = ['nb1', 'nb2'].filter(id => F().sunkAt('nw2', id)).length;
      if (filled === 1) await say('받침돌 하나가 수로 홈에 맞물렸다. 하나 더 맞추면 건널 수 있겠다.');
      if (filled === 2) await say('두 받침돌이 수로를 가로질러 맞물렸다! 동쪽 관측실로 건너갈 수 있다.');
    },
    quietSlots: true,
    onLever: async (x, y) => {
      if (flag('q25')) { await say('레버가 내려가 있다. 옛 부두 발판이 바다 위로 이어져 있다.'); return; }
      const ok = await G.ask('옛 부두 발판 레버다. 힘껏 당겨 볼까?'); if (!ok) return;
      F().setTile('nw2', 22, 2, 'Z'); sfx('knock2'); Wd().shake = 10;
      [[11, 7], [11, 8], [17, 7], [17, 8], [23, 7], [23, 8]].forEach(([X, Y]) => F().setTile('nw3', X, Y, 'd'));
      set('q25');
      G.audio && G.audio.jingle('learn');
      await say('끼이익... 쿵! 동굴 밖 바다 쪽에서 무거운 발판이 내려앉는 소리가 울렸다.\n옛 부두의 끊긴 칸이 다시 이어진 것 같다!');
      await say('(동쪽 통로로 나가면 옛 부두다)');
    },
    npcs: [
      { id: 'nw2t', char: 'worker', x: 25, y: 5, dir: 'down', sight: 3,
        trainer: { flag: 'tr_nw2t', title: '새길상회 측량원', name: '단비', char: 'worker', team: [['heukkori', 34], ['huugi', 34]], base: 24,
          before: '관측 수문에서 뭐 하냐고? 우린 바닥 수치만 재고 가!', lose: '...수치만 재고 간다니까.', after: '이 근처 바다 밑 울림이 크대. 본사가 그런 데만 골라 재라더라.' } }],
    onEnter: async () => { visit('d09'); if (!flag('nw2_seen')) { set('nw2_seen'); await G.wait(10); await say('돌로 쌓은 오래된 관측 수문이다. 가운데 수로에 받침돌 홈 두 개가 비어 있다.'); } }
  };
  M.nw3 = {
    name: '너울잠굴 옛 부두', kind: 'out', bgm: 'water', rows: ROWS.nw3,
    rescue: nwRescue, rescueKind: 'water',
    warps: [{ x: 0, y: 8, to: 'nw2', tx: 30, ty: 9, dir: 'left', tdir: 'left' }],
    links: { e: { to: 'r14', dy: 0, from: 7, until: 8, cond: () => flag('q25') } },
    noBoard: '부두 아래로 물살이 소용돌이친다. 물판을 펼치기엔 너무 위험하다.\n(관측 수문의 레버로 옛 부두 발판을 내릴 수 있다)',
    signs: { '3,7': '옛 구조 부두\n"끊긴 칸은 관측 수문의 레버로 내릴 수 있음"', '27,5': '바닷솔길 ▶\n"푸른숨시까지 해안 보행로"' },
    npcs: [
      { id: 'nw3_rescue', char: 'sailor', x: 27, y: 9, dir: 'up', name: '구조대원 해들', cond: () => flag('q25'),
        text: () => flag('q26') ? '부두 덕에 구조 보트도 바닷솔길까지 와요. 늘 고마워요!' : '부두가 이어졌어요! 동쪽 바닷솔길을 따라가면 푸른숨시예요.\n가온 대장님 말로는 정화사 은서 님이 도움을 청했대요. 정화소 동료들이 쉬러 나왔다나 봐요.' }],
    drawExtra: (T, cx, cy) => {
      if (flag('q25')) return;   // the broken spans: stubs and dangling ropes
      [11, 17, 23].forEach(x => [7, 8].forEach(y => { const X = x * 16 - cx, Y = y * 16 - cy; T.fillStyle = '#a8703a'; T.fillRect(X - 2, Y + 4, 3, 3); T.fillRect(X + 15, Y + 4, 3, 3); T.fillStyle = '#c8b078'; T.fillRect(X + 2, Y + 7, 1, 7); }));
    },
    onEnter: async () => { visit('d09'); if (!flag('nw3_seen')) { set('nw3_seen'); await G.wait(10); await say(flag('q25') ? '바다 위로 옛 부두가 길게 이어진다. 내려앉은 발판이 단단히 맞물려 있다.' : '바다 위로 옛 부두가 이어지다 군데군데 끊겨 있다. 끊긴 칸 아래로 물살이 소용돌이친다.'); } }
  };

  // ------------------------------------------------------------ R14 바닷솔길 (coastal path to 푸른숨시)
  M.r14 = {
    name: '바닷솔길', kind: 'out', bgm: 'route', rows: ROWS.r14,
    links: {
      w: { to: 'nw3', dy: 0, from: 7, until: 8 },
      e: { to: 'm08', dy: 0, from: 7, until: 8 },
      n: { to: 'r13', dx: 0, from: 0, until: 15, gated: 1 }
    },
    seaLine: '흰부표 해로로 이어지는 바다다. 밝은 모래 계단이 하선점이다.',
    signs: { '2,6': '바닷솔길\n◀ 너울잠굴 옛 부두   ▶ 푸른숨시', '40,6': '푸른숨시 ▶\n"흰 수로와 정화소의 도시"' },
    items: [{ id: 'superpotion', x: 37, y: 13, flag: 'r14_a' }, { id: 'cube', n: 5, x: 2, y: 13, flag: 'r14_b' }],
    npcs: [
      { id: 'r14_rest', char: 'gardener', x: 24, y: 3, dir: 'down', name: '바닷솔 쉼터지기',
        talk: async () => { const N = '바닷솔 쉼터지기'; await say('바닷솔 쉼터예요. 화로 옆에서 잠깐 쉬어 가요.', N); await G.menus.heal(); await say('동료들이 따뜻해졌네요. 푸른숨시는 동쪽으로 조금만 더 가면 돼요.', N); } },
      { id: 'r14t1', char: 'hiker', x: 12, y: 9, dir: 'down', sight: 3,
        trainer: { flag: 'tr_r14t1', title: '해안 산책가', name: '솔바람', char: 'hiker', team: [['moraekong', 34], ['yeoubul', 34], ['huugi', 35]], base: 22,
          before: '바닷솔 향기 좋지? 한판 하고 가자!', lose: '바닷바람이 네 편이었구나.', after: '후욱이는 바람길이 막힌 데서 같은 자리를 빙빙 돌아. 푸른숨시 통풍탑에 많대.' } },
      { id: 'r14t2', char: 'woman', x: 33, y: 9, dir: 'left', sight: 4,
        trainer: { flag: 'tr_r14t2', title: '약초 채집가', name: '잎새', char: 'woman', team: [['ipppuri', 35], ['huugi', 35]], base: 22,
          before: '독 동료를 무서워하면 안 돼! 내 동료들 실력 볼래?', lose: '독은 무서운 게 아니라 조심하는 거구나.', after: '푸른숨시 진득이들이 쉬러 나왔대. 아픈 게 아니라 일이 너무 많아서래.' } },
      { id: 'r14_huugi', mon: 'huugi', act: 'hop', x: 30, y: 4, dir: 'left', text: '후욱이가 바닷바람을 따라 둥실둥실 떠 있다.' }],
    onEnter: async () => {
      visit('r14');
      if (!flag('r14_seen')) { set('r14_seen'); await G.wait(10); await say('짭짤한 바닷바람에 바닷솔 향기가 섞여 있다. 해안 보행로가 동쪽으로 이어진다.'); }
    }
  };
})();

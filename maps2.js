/* 모아루: 잠든 길의 노래 — chapter 1 world, part 2: 이슬숲 → 돌마루시(첫 관장전) → 노래초원 → 산등 야영지 */
'use strict';
(function () {
  const G = window.G, M = G.MAPS, H = G.mapHelpers;
  const { flag, set, say, give, P } = H;
  const Wd = () => G.world, D = () => G.data, F = () => G.field;
  const visit = id => { G.S.visited = G.S.visited || {}; G.S.visited[id] = 1; };

  // ------------------------------------------------------------ D01 이슬숲: the broken footbridge and the vine detour
  M.forest = {
    name: '이슬숲', kind: 'out', bgm: 'route',
    rows: [
      'YYYYYYYYYY==YYYYYYYY',
      'YYYYYYYYMM==MMYYYYYY',
      'YkkkkYYMMM==MMMMYYYY',
      'Yk..kYM,,,==,,,MMYYY',
      'Yk...VM,,,==,,,,MYYY',
      'YkkkkYMM,,==,,,,MYYY',
      'YYYYYYYMMM.=..MMMYYY',
      'YYY.#####..=..MMMYYY',
      'YYY.#####..=...MMYYY',
      'YYY.##D##..=....MMYY',
      'YYY...=....=......YY',
      'YYMM..=====...S...YY',
      'YYwwwwwwwwwwwwwwM.YY',
      'YYww..wwwwwwwwwwM.YY',
      'YYwwwwwwwwwwwwwwM.YY',
      'YYMMMMMM...=.SMMMVYY',
      'YY,,,,,M...=...,,.YY',
      'YY,,,,,,...=..,,,.YY',
      'YYk,,,,,M..=..,,,.YY',
      'YYkk,,,MM..=.MMMM.YY',
      'YYYYMMMM...=....K.YY',
      'YYY,,,,,..==.,,,,,YY',
      'YY,,,,,,..=..,,,,,YY',
      'YY,,,;;;..=..;;;,,YY',
      'YYM,,;;;..=..;;;;MYY',
      'YYMM,,,...=...,,MMYY',
      'YYYMM.....=....MMYYY',
      'YYYYYMMM..=..MMYYYYY',
      'YYYYYYYYM=MMYYYYYYYY',
      'YYYYYYYYY=YYYYYYYYYY'],
    buildings: [{ k: 'tent', x: 4, y: 7, w: 5, h: 3 }],
    warps: [{ x: 6, y: 9, to: 'resthut', tx: 3, ty: 5, dir: 'up' }],
    links: { s: { to: 'leafshade', dx: 1 }, n: { to: 'dolmaru', dx: -1, cond: () => flag('q03') } },
    vineFloor: 'M',
    signs: {
      '14,11': '이슬숲 길지기 쉼터\n← 쉼터   ↑ 돌마루시',
      '13,15': '끊어진 다리\n다리가 무너졌다. 동쪽 덩굴길로 돌아가시오. — 바람나루 길지기'
    },
    items: [
      { id: 'cube', n: 3, x: 2, y: 3, flag: 'fo_thicket' },
      { id: 'antidote', x: 8, y: 16, flag: 'fo_anti1' },
      { id: 'antidote', x: 15, y: 8, flag: 'fo_anti2' },
      { id: 'potion', x: 3, y: 26, flag: 'fo_potion' },
      { id: 'superpotion', x: 4, y: 13, flag: 'rv_fisle' }],
    npcs: [
      { id: 'dasom', char: 'bugkid', x: 4, y: 22, dir: 'right', sight: 4,
        trainer: { flag: 'tr_dasom', title: '곤충채집 소녀', name: '다솜', char: 'bugkid', team: [['ttakkom', 6], ['ttakkom', 7]], base: 15,
          before: '숲에서 벌레 몬스터를 관찰하는 중이야. 승부할래?', lose: '따꼼이가 겁먹었잖아...',
          after: '독에 걸리면 해독제를 쓰거나 센터에서 쉬면 돼.\n독은 전투가 끝나도 남으니까 꼭 치료해 줘!' } },
      { id: 'taeo', char: 'bugkid', x: 15, y: 17, dir: 'left', sight: 3,
        trainer: { flag: 'tr_taeo', title: '곤충채집 소년', name: '태오', char: 'kidA', team: [['kkomul', 6], ['gochi', 7], ['kkomul', 6]], base: 15,
          before: '이슬콩은 금방 잎잠이가 되고, 잎잠이는 새벽나비가 돼!', lose: '잎잠이는 단단하지만 공격을 못 하거든...',
          after: '불리한 상대가 나오면 다른 동료로 바꿔 봐!\n[몬스터] 버튼으로 교체하는 것도 작전이야.' } },
      { id: 'yerin', char: 'kidB', x: 14, y: 9, dir: 'left', sight: 3,
        trainer: { flag: 'tr_yerin', title: '숲 산책가', name: '예린', char: 'kidB', team: [['gasijam', 8], ['jjirikong', 8]], base: 16,
          before: '쉼터 앞까지 왔구나! 마지막 시험이야!', lose: '찌리콩까지 졌어! 대단해!',
          after: '찌리콩은 이 숲에서도 드물게 만날 수 있어. 잎 끝에 작은 불꽃이 튀면 근처에 있는 거야.' } }],
    triggers: [
      { x: 11, y: 15, w: 1, h: 1, cond: () => !flag('q03') && !flag('q03_detour'), run: async () => {
        set('q03_detour');
        Wd().player.dir = 'up';
        await say('다리가 무너져 강물만 흐르고 있다...\n건너편 기둥에 묶인 다리줄이 축 늘어져 있다.');
        await say('동쪽 끝의 좁은 덩굴길로 돌아가면 건너편에 닿을 수 있을 것 같다.');
      } },
      { x: 10, y: 1, w: 2, h: 1, cond: () => !flag('q03'), run: async () => {
        await say('잠깐만요! 북쪽에서 다리줄을 내려 주고 가 줄래요?\n그래야 바람나루 수레도 다시 숲을 지날 수 있어요.', '쉼터 길지기');
        await Wd().walk(Wd().player, 'down', 1);
      } }],
    objects: {
      '11,12': async () => {
        if (flag('q03')) { await say('튼튼하게 다시 이어진 다리다.'); return; }
        if (Wd().player.y !== 11) return;
        await say('기둥에 감긴 다리줄이 팽팽하게 매여 있다.');
        const ok = await G.ask('다리줄을 풀어 남쪽으로 내릴까?');
        if (!ok) return;
        G.audio && G.audio.sfx('door');
        await F().play(30, (T, cx, cy, k) => { T.fillStyle = '#c8b078'; T.fillRect(11 * 16 + 7 - cx, 12 * 16 - cy, 2, Math.round(k * 48)); });
        [12, 13, 14].forEach(y => F().setTile('forest', 11, y, 'd'));
        G.audio && G.audio.sfx('knock2');
        set('q03');
        await say('다리줄이 건너편 기둥에 걸리며 판자가 하나씩 제자리를 찾았다!\n끊겼던 숲길이 다시 이어졌다. 이제 기술 없이도 오갈 수 있다.');
        Wd().respawn();
      },
      '11,14': async () => {
        if (flag('q03')) { await say('튼튼하게 다시 이어진 다리다.'); return; }
        await say('다리가 무너져 건널 수 없다. 표지판대로 동쪽 덩굴길로 돌아가자.');
      }
    },
    drawExtra: (T, cx, cy) => {
      if (flag('q03')) return;
      // snapped plank stubs at both ends of the bridge
      T.fillStyle = '#5e3a1a'; T.fillRect(11 * 16 + 1 - cx, 12 * 16 - cy, 14, 5); T.fillRect(11 * 16 + 1 - cx, 14 * 16 + 11 - cy, 14, 5);
      T.fillStyle = '#a8703a'; T.fillRect(11 * 16 + 2 - cx, 12 * 16 - cy, 12, 3); T.fillRect(11 * 16 + 2 - cx, 14 * 16 + 12 - cy, 12, 3);
      T.fillStyle = '#c8b078'; T.fillRect(11 * 16 + 7 - cx, 12 * 16 + 5 - cy, 1, 7);
    },
    onEnter: async () => { visit('forest'); }
  };
  M.resthut = {
    name: '이슬숲 쉼터', kind: 'in', bgm: 'town', heal: [3, 4],
    rows: ['#W####W#', 'B......p', '........', '..tt....', '........', '...x....'],
    warps: [{ x: 3, y: 5, to: 'forest', tx: 6, ty: 10, dir: 'down' }],
    npcs: [{ id: 'keeper', char: 'harang', x: 5, y: 2, dir: 'down', name: '쉼터 길지기',
      talk: async () => {
        const N = '쉼터 길지기';
        await say('숲길 쉼터예요. 지친 몬스터들은 여기서 쉬어 가세요.', N);
        await G.menus.heal();
        await say('모두 기운을 차렸어요!', N);
        if (!flag('rh_lesson')) {
          const ok = await G.ask('그리고... 길지기 수업 하나 들어 볼래요? 짧은 연습 승부 뒤에\n동료에게 몸을 단단히 지키는 기술을 가르쳐 줄게요.', ['들을래요', '다음에요'], { name: N });
          if (!ok) return;
          const won = await G.battle.trainer({ flag: 'rh_lesson_win', title: '쉼터 길지기', name: '이안', char: 'harang', team: [['jjaek', 7], ['jwi', 7]], prize: 200, noBlackout: true,
            lose: '좋아요, 몸이 단단해지면 오래 버틸 수 있어요.' });
          D().healParty();
          set('rh_lesson');
          await say(won ? '훌륭해요! 수업 내용을 알려 줄게요.' : '괜찮아요, 수업은 이기고 지는 게 아니에요.', N);
          const i = await G.menus.party({ title: '단단해지기를 누구에게?', topMode: 'moves' });
          if (i >= 0) await G.battle.learnMove(G.S.party[i], 'harden');
          await say('방어를 올리면 물리 공격을 버티기 쉬워져요. 돌마루 관장 토담 님도 그걸 잘 쓰죠.', N);
        } else await say('숲 북쪽 덤불 속에는 덩굴로 가려진 물건이 있대요. 덩굴 정리로 살펴보세요.', N);
      } }]
  };

  // ------------------------------------------------------------ M02 돌마루시: quarry city and the first gym
  M.dolmaru = {
    name: '돌마루시', kind: 'out', bgm: 'town',
    rows: [
      'cccccccccccccccccccccccccccc',
      'cqGqGGqc...............F...c',
      'cGGGGqGc.########..######..c',
      'cqGGGGGc.########..######..c',
      'cGGqGGG..########..######..c',
      'cGGGGGG..########..######.Pc',
      'cqGGqGG..####DD##..##D###..=',
      'cGGGGGG......GG......=.....=',
      'cGGGGGGGGGGGGGGGGGGGGGGGGGG=',
      'c.GGGG..GGGGGGGGGGGGGGG.F..c',
      'cwwwwwwwwwwnnwwwwwwwwwwwwwwc',
      'cwwwwwwwwwwnnwwwwwwwwwwwwwwc',
      'c.....GGGGGGGGGGGGGG.......c',
      'c.######..GGG..#####..####.c',
      'c.######..GGG..#####..####.c',
      'c.######..GGG..#####..####.c',
      'c.##DD##..GGG..##D##..##D#.c',
      'c...GG....GGG....G......G..c',
      'c.F......GGGG.....F......K.c',
      'c..bb...GGGG....bb.....F...c',
      'cccccccccGGccccccccccccccccc',
      'cccccccccGGccccccccccccccccc'],
    buildings: [
      { k: 'gym', x: 9, y: 2, w: 8, h: 5, roof: 'orange', wall: '#efe4d0', wallH: 36, emblem: 'rock' },
      { k: 'lab', x: 19, y: 2, w: 6, h: 5, roof: 'navy', wall: '#f4f0e6', label: '연구소 분관' },
      { k: 'center', x: 2, y: 13, w: 6, h: 4, roof: 'red', wall: '#fbf6ee' },
      { k: 'shop', x: 15, y: 13, w: 5, h: 4, roof: 'blue', wall: '#f4f6fa' },
      { k: 'house', x: 22, y: 13, w: 4, h: 4, roof: 'grey', wall: '#e8e0cc' }],
    props: [{ k: 'crates', x: 7, y: 9 }, { k: 'board', x: 23, y: 9 }],
    warps: [
      { x: 13, y: 6, to: 'gym1', tx: 5, ty: 14, dir: 'up' }, { x: 14, y: 6, to: 'gym1', tx: 6, ty: 14, dir: 'up' },
      { x: 21, y: 6, to: 'branch', tx: 5, ty: 7, dir: 'up' },
      { x: 4, y: 16, to: 'center_d', tx: 5, ty: 6, dir: 'up' }, { x: 5, y: 16, to: 'center_d', tx: 6, ty: 6, dir: 'up' },
      { x: 17, y: 16, to: 'shop_d', tx: 4, ty: 5, dir: 'up' },
      { x: 24, y: 16, to: 'house_d', tx: 3, ty: 5, dir: 'up' }],
    links: { s: { to: 'forest', dx: 1 }, e: { to: 'songfield', dy: 1 } },
    signs: { '10,18': '돌마루시\n채석장 언덕의 돌다리 도시' },
    objects: { '23,9': async () => say('공사 안내 게시판이다.\n"새길상회 — 산을 넘는 새 도로, 곧 열립니다!" 주황 깃발 그림이 크게 그려져 있다.') },
    npcs: [
      { id: 'qman', char: 'hiker', x: 4, y: 4, dir: 'right', move: 'turn', name: '채석장 일꾼',
        text: '돌마루 사람들은 자갈콩이랑 같이 돌을 고르지. 녀석들이 단단한 돌을 귀신같이 찾아내거든.\n요즘은 산 너머 동굴 쪽 울림이 이상하다고 다들 수군대.' },
      { id: 'gguide', char: 'man', x: 15, y: 7, dir: 'down', name: '체육관 안내원',
        text: () => flag('badge1') ? '산등배지를 땄다고? 동쪽 공사 초소도 이제 지나갈 수 있을 거야!' : '토담 관장은 바위·땅 타입 전문이야. 물·풀 기술이 아주 잘 통하고, 격투 기술도 좋아.\n체육관 안에서는 작은 모형 돌을 밀어 길을 여는 훈련을 하지.' },
      { id: 'postg', char: 'worker', x: 26, y: 7, dir: 'left', name: '공사 초소 직원', cond: () => !flag('badge1'),
        text: '여긴 새길상회 공사 초소예요. 산길 보행로는 체육관 배지를 가진 길지기만 지날 수 있어요.\n위험한 구간이 많거든요.' },
      { id: 'postg2', char: 'worker', x: 25, y: 9, dir: 'up', name: '공사 초소 직원', cond: () => flag('badge1'),
        text: '산등배지 확인했습니다! 노래초원 보행로를 지나면 산등 야영지가 나와요.\n동굴 쪽은... 저희 작업 구역이라 조심하세요.' },
      { id: 'dkid', char: 'kidB', x: 18, y: 17, dir: 'left', move: 'wander', name: '소녀',
        text: '돌다리 아래 개울은 숲에서 흘러 내려오는 물이야. 숲길이 다시 이어져서 수레가 들어오기 시작했대!' }],
    triggers: [
      { x: 26, y: 6, w: 1, h: 3, cond: () => !flag('badge1'), run: async () => {
        const g = Wd().npc('postg'); if (g) { g.emote = 30; Wd().facePlayer(g); }
        await say('잠깐만요! 이 앞은 공사 구간이라 체육관 배지를 확인해야 해요.\n돌마루 체육관 관장 토담 님께 인정받고 오세요.', '공사 초소 직원');
        await Wd().walk(Wd().player, 'left', 1);
      } },
      { x: 13, y: 7, w: 2, h: 1, cond: () => !flag('q04_note'), run: async () => {
        await say('체육관 도전 전에 연구소 분관에서 안전 훈련 안내를 받아야 해요.\n오른쪽 남색 지붕 건물이에요!', '체육관 안내원');
        await Wd().walk(Wd().player, 'down', 1);
      } }],
    onEnter: async () => {
      visit('dolmaru');
      if (flag('q03') && !flag('dm_arrive')) {
        set('dm_arrive');
        await G.wait(20);
        G.audio && G.audio.sfx('door');
        await F().play(110, (T, cx, cy, k) => {
          const x = 9 * 16 - 8, y = (21 - k * 9) * 16;
          T.fillStyle = '#6a4a2a'; T.fillRect(Math.round(x - cx), Math.round(y - cy), 30, 12);
          T.fillStyle = '#c98d4f'; T.fillRect(Math.round(x + 1 - cx), Math.round(y + 1 - cy), 28, 8);
          T.fillStyle = '#5aa848'; T.fillRect(Math.round(x + 4 - cx), Math.round(y - 5 - cy), 22, 6);
          T.fillStyle = '#3a2a1a'; T.fillRect(Math.round(x + 4 - cx), Math.round(y + 10 - cy), 5, 5); T.fillRect(Math.round(x + 21 - cx), Math.round(y + 10 - cy), 5, 5);
        });
        await say('숲길이 다시 이어지자, 바람나루의 채소를 실은 수레가 덜컹덜컹 들어왔다!\n돌마루 사람들이 반가운 얼굴로 손을 흔든다.');
      }
    }
  };
  H.center('center_d', '돌마루', 'dolmaru', 4, 17);
  H.shop('shop_d', '돌마루', 'dolmaru', 17, 17, H.STOCK1);
  H.house('house_d', '돌마루', 'dolmaru', 24, 17, [
    { id: 'hd', char: 'elder', x: 2, y: 2, dir: 'down', name: '할아버지',
      text: '돌마루의 돌다리는 자갈콩과 사람이 같이 고른 돌로 쌓았다네.\n몬스터가 사는 방식을 알면 길을 놓을 자리도 보이는 법이지.' },
    { id: 'hd2', char: 'kidA', x: 5, y: 4, dir: 'left', move: 'wander', name: '꼬마',
      text: '레벨이 오르면 몬스터가 진화하기도 하고, 어떤 몬스터는 특별한 돌에 닿아야 진화한대!\n공명 광물이라던가?' }]);
  M.branch = {
    name: '연구소 분관', kind: 'in', bgm: 'town',
    rows: ['#W###W###W##', 'BBBB.PP.BBBB', '............', '............', '...tttt.....', '............', 'BB........BB', '.....xx.....'],
    warps: [{ x: 5, y: 7, to: 'dolmaru', tx: 21, ty: 7, dir: 'down' }, { x: 6, y: 7, to: 'dolmaru', tx: 21, ty: 7, dir: 'down' }],
    objects: { '3,4': async () => say('"달숨동굴 반향 기록 — 귀밤이 무리의 비행 경로가 해마다 동쪽으로 틀어지고 있음."') },
    npcs: [
      { id: 'dokyung', char: 'prof', x: 8, y: 3, dir: 'down', name: '분관 연구원 도경',
        talk: async () => {
          const N = '분관 연구원 도경';
          if (!flag('q04_note')) {
            if (!G.S.bag.notebook) { await say('어서 와요, 돌마루 분관이에요.', N); return; }
            await say(`이슬마을에서 온 견습 길지기 ${P()}! 조사 수첩 잘 받았어요.\n이슬마을, 바람나루, 그리고 숲길까지... 기록이 이어졌네요.`, N);
            D().useItem('notebook');
            set('q04_note');
            await say('그럼 안전 훈련 안내를 할게요. 각 지역 체육관은 승부만 하는 곳이 아니에요.\n동료의 힘을 안전하게 쓰는 법을 훈련하는 곳이기도 하죠.', N);
            await say('돌마루 체육관에서 배지를 받으면, 산등 야영지의 탐굴사에게서\n바위 밀기를 배울 자격이 생겨요. 동굴을 지나려면 꼭 필요하답니다.', N);
            await say('그리고 바위·땅 타입은 방어가 높아요. 한 마리로 밀어붙이기보다\n여러 동료를 번갈아 쓰는 게 요령이에요. 행운을 빌어요!', N);
            return;
          }
          if (!flag('badge1')) { await say('토담 관장은 방어가 단단한 몬스터로 버티는 걸 좋아해요.\n물·풀 기술, 또는 격투 기술을 준비해 보세요.', N); return; }
          await say('산등배지 축하해요! 동쪽 노래초원을 지나면 산등 야영지예요.\n요즘 달숨동굴 쪽 공명석 채굴 소리가 커졌다는데... 조사 부탁할게요.', N);
        } },
      { id: 'baide', char: 'woman', x: 3, y: 6, dir: 'right', move: 'wander', name: '연구원',
        text: '공명석은 물의 흐름이나 땅의 진동 같은 자연의 변화를 전달하는 광물이에요.\n귀밤이 같은 몬스터는 그 울림을 따라 길을 찾는대요.' }]
  };
  // 돌마루 체육관: two small model stones block the way; the gym's own helper pushes them with you
  M.gym1 = {
    name: '돌마루 체육관', kind: 'in', floor: 'g', bgm: 'town', gymStones: true,
    rows: [
      '#W###WW###W#',
      'gggggyyggggg',
      'ggoggyyggogg',
      'gggggyyggggg',
      'ooooooyooooo',
      'gggggyyggggg',
      'gggggyyggggg',
      'ggoggyyggogg',
      'gggggyyggggg',
      'ooooyooooooo',
      'gggggyyggggg',
      'sggggyyggggs',
      'gggggyyggggg',
      'gggggyyggggg',
      'gggggxxggggg'],
    boulders: [{ id: 'm1', x: 4, y: 9, model: true }, { id: 'm2', x: 6, y: 4, model: true }],
    warps: [{ x: 5, y: 14, to: 'dolmaru', tx: 13, ty: 7, dir: 'down' }, { x: 6, y: 14, to: 'dolmaru', tx: 14, ty: 7, dir: 'down' }],
    objects: {
      '0,11': async () => say(flag('badge1') ? `돌마루 체육관 관장 토담\n인정받은 길지기: ${P()}` : '돌마루 체육관 관장 토담\n"단단함은 버티는 힘, 버티는 힘은 지키는 힘"'),
      '11,11': async () => { const ok = await G.ask('모형 돌을 처음 자리로 되돌릴까?'); if (ok) await F().resetPuzzle(); }
    },
    npcs: [
      { id: 'g1', char: 'hiker', x: 9, y: 12, dir: 'left', sight: 4,
        trainer: { flag: 'tr_g1', title: '견습 탐굴사', name: '바위', char: 'hiker', team: [['jagalkong', 8], ['jagalkong', 9]], base: 20,
          before: '모형 돌을 밀어 보기 전에 나랑 한 판!', lose: '단단한 것도 물에는 약하지...', after: '모형 돌은 A 버튼으로 살펴본 다음 그쪽으로 걸으면 밀려. 체육관 자갈콩이 도와줄 거야.' } },
      { id: 'g2', char: 'todam', x: 2, y: 6, dir: 'right', sight: 3,
        trainer: { flag: 'tr_g2', title: '견습 탐굴사', name: '모래', char: 'hiker', team: [['moraekong', 9], ['kongju', 8]], base: 20,
          before: '모래콩의 모래 흩뿌리기, 피할 수 있겠어?', lose: '명중률이 떨어져도 끝까지 버텼구나!', after: '명중률이 떨어지면 다른 동료로 바꿔서 다시 시작하는 것도 방법이야.' } },
      { id: 'guide', char: 'man', x: 8, y: 13, dir: 'left', name: '안내원',
        text: () => flag('badge1') ? '축하해! 이제 산등 야영지에서 진짜 바위 밀기를 배울 수 있을 거야.' : '도전자! 안쪽 길은 모형 돌로 막혀 있어. 돌을 살펴보면 체육관 동료가 같이 밀어 줘.\n관장 토담은 바위·땅 타입. 물·풀·격투 기술을 챙겨!' },
      { id: 'leader', char: 'todam', x: 6, y: 1, dir: 'down', name: '관장 토담',
        talk: async () => {
          const N = '관장 토담';
          if (flag('badge1')) { await say('돌은 혼자 서 있지 않아. 서로 받치며 쌓이지.\n길지기와 동료도 그렇다는 걸 잊지 마라.', N); return; }
          await say('돌마루 체육관 관장 토담이다. 채석장 돌처럼 단단하게 버티는 법을 가르치지.', N);
          await say('방어가 높은 상대를 어떻게 넘을지, 한 마리 대신 여럿을 어떻게 쓸지.\n보여 다오, 견습 길지기!', N);
          const won = await G.battle.trainer({ flag: 'badge1', title: '관장', name: '토담', char: 'todam', smart: true, potion: true, iv: 10, prize: 1300,
            team: [['jagalkong', 10, ['butt', 'curl', 'mudslap', 'harden']], ['moraekong', 11, ['scratch', 'curl', 'sandattack', 'mudslap']], ['dolgubi', 13, ['bind', 'screech', 'harden', 'rockthrow']]],
            lose: '...허허, 무너졌구나. 단단함만으로는 길을 다 지킬 수 없지. 좋은 승부였다.' });
          if (!won) { await say('지쳤다면 센터에서 쉬고 다시 오너라. 도전에 비용은 들지 않는다.\n바위·땅 상대에겐 물·풀, 그리고 격투 기술을 떠올려 봐라.', N); return; }
          await say('이건 돌마루 체육관의 인증, 산등배지다.', N);
          G.audio && G.audio.jingle('badge');
          await say(`${P()}${G.josa(P(), '은', '는')} 관장 토담에게서 산등배지를 받았다!`);
          await give('cube', 5);
          await give('tm_rock', 1);
          await say('암석수비 교본이다. 바위처럼 몸을 단단히 굳히는 기술이지. 몇 번이고 가르칠 수 있다.', N);
          await give('recommend', 1);
          await say('그리고 바위 밀기 추천서. 산등 야영지의 탐굴사 석호에게 보여 주면\n동료와 함께 둥근 돌을 미는 법을 가르쳐 줄 거다. 동굴을 지나려면 필요해.', N);
          await say('동쪽 공사 초소도 이제 열어 줄 거다. 몸조심해라.', N);
        } }]
  };

  // ------------------------------------------------------------ R04 노래초원
  M.songfield = {
    name: '노래초원', kind: 'out', bgm: 'route',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTcttcTTT',
      'TT,,,,..F.,,,,,,TT..,,,,,....cttc.TT',
      'T,,,,,,...,,,,,,,..,,,,,,,...cttc..T',
      'T,,;;,,.....,,,...;;;,,,,....cttc..T',
      'T,;;;;,..ww..,,...;;;;,......cttc.ST',
      'T,,;;,..wwww..,....;;,....F..cttc..T',
      'T.......www.......,,,.........tt...T',
      '=......................,,,,........T',
      '=...,,,,..S.....;;;....,,,,..,,,,..T',
      '=..,,,,,,.......;;;;...........,,,.T',
      'T..,,,,,..ww.....;;..,,,.......,...T',
      'T...,,,..wwww.......,,,,,..XX......T',
      'T........www..F.....,,,,...XX..F...T',
      'T.,,,,....K.....,,,......,,,,......T',
      'T,,;;,,....,,,,,;;;,,...,,,;;,,,...T',
      'T,;;;;,,..,,,,,;;;;;,,..,,;;;;,,...T',
      'TT,,,,....,,,,,,,,,,,,,..,,,,,,,..TT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'],
    props: [{ k: 'burrow', x: 24, y: 6 }, { k: 'burrow', x: 13, y: 13 }, { k: 'burrow', x: 29, y: 11 }],
    links: { w: { to: 'dolmaru', dy: -1 }, n: { to: 'camp', dx: -20 } },
    signs: { '10,8': '노래초원\n얕은 웅덩이에서 노랫소리가 들리는 들판', '34,4': '↑ 산등 야영지 (달숨동굴 입구)\n동굴에 들어가기 전에 야영지 쉼터에서 꼭 쉬어 가세요.' },
    items: [{ id: 'potion', x: 5, y: 9, flag: 'sf_potion' }, { id: 'cube', n: 2, x: 33, y: 15, flag: 'sf_cube' }, { id: 'awake', x: 19, y: 1, flag: 'sf_awake' }],
    npcs: [
      { id: 'hana', char: 'kidB', x: 14, y: 6, dir: 'down', sight: 3,
        trainer: { flag: 'tr_hana', title: '피크닉 소녀', name: '하나', char: 'kidB', team: [['dorekong', 9], ['dorekong', 9]], base: 18,
          before: '도레콩들이 노래 연습 중이었는데... 승부할래?', lose: '도레콩들이 졸려 하네...',
          after: '도레콩은 두 음만 번갈아 불러. 여럿이 모이면 서로 따라 하다가 같이 잠든대!' } },
      { id: 'jun', char: 'kidA', x: 22, y: 9, dir: 'left', sight: 4,
        trainer: { flag: 'tr_jun', title: '반바지 소년', name: '준', char: 'kidA', team: [['ppultori', 10], ['gasito', 10]], base: 18,
          before: '가시토랑 뿔토리는 같은 굴을 나눠 쓰는 사이래!', lose: '뿔토리 뿔이 아직 무뎠나 봐...',
          after: '가시토는 어린 동료가 오면 가시를 눕혀 길을 내준대. 다정하지?' } },
      { id: 'cartman', char: 'worker', x: 26, y: 12, dir: 'right', name: '새길상회 일꾼', cond: () => !flag('q05'),
        talk: async () => {
          const N = '새길상회 일꾼';
          await say('어휴, 수레 바퀴가 굴 입구에 딱 걸려 버렸네.\n안에 가시토 새끼들이 있다는데... 나 혼자선 짐을 못 내려.', N);
          const ok = await G.ask('...길지기라고? 그럼 연습 삼아 한 판 하고, 짐 내리는 것 좀 도와줄래?', ['도와줄게요', '다음에요'], { name: N });
          if (!ok) return;
          const won = await G.battle.trainer({ flag: 'tr_cart', title: '새길상회 일꾼', name: '강수', char: 'worker', team: [['jagalkong', 10], ['moraekong', 10]], prize: 500, noBlackout: true,
            lose: '허허, 실력이 좋네. 약속대로 짐 내리자!' });
          D().healParty();
          await say(won ? '자, 그럼 영차!' : '승부는 내가 이겼지만... 그래도 도와준다니 고맙지. 영차!', N);
          G.audio && G.audio.sfx('rock');
          set('q05');
          F().setTile('songfield', 27, 11, '.'); F().setTile('songfield', 28, 11, '.'); F().setTile('songfield', 27, 12, '.'); F().setTile('songfield', 28, 12, '.');
          Wd().respawn();
          await say('짐을 내리자 수레가 굴 입구에서 빠져나왔다!\n굴 안에서 가시토와 뿔토리가 조심조심 고개를 내밀었다.');
          await say('미안하다, 녀석들아. 상회에선 길만 빨리 내라고 하니... 이 동네 사정은 잘 몰랐어.\n이거 받아. 고마워서 주는 거야.', N);
          await give('berry', 3);
        } },
      { id: 'gasito_b', mon: 'gasito', act: 'sniff', x: 29, y: 12, dir: 'left', cond: () => flag('q05'),
        talk: async () => { G.audio && G.audio.cry('gasito'); await say('가시토가 가시를 눕히고 굴 앞에 앉아 있다.\n옆의 뿔토리가 이마로 가시토를 톡톡 건드린다.'); } },
      { id: 'ppul_b', mon: 'ppultori', act: 'hop', x: 30, y: 11, dir: 'left', cond: () => flag('q05'),
        talk: async () => { G.audio && G.audio.cry('ppultori'); await say('뿔토리가 무엇이든 이마로 톡 건드려 확인하고 있다.'); } },
      { id: 'healguide', char: 'woman', x: 33, y: 7, dir: 'left', name: '등산객',
        text: '이 돌계단을 오르면 산등 야영지예요. 쉼터에서 무료로 쉴 수 있어요.\n동굴은 어두우니까 꼭 준비하고 들어가세요!' }],
    drawExtra: (T, cx, cy) => {
      if (flag('q05')) return;
      A_drawCart(T, 27 * 16 - cx, 11 * 16 + 8 - cy);
    },
    onEnter: async () => { visit('songfield'); }
  };
  function A_drawCart(T, X, Y) {
    T.fillStyle = '#6a4a2a'; T.fillRect(X + 2, Y + 3, 28, 9); T.fillStyle = '#a8784a'; T.fillRect(X + 3, Y + 4, 26, 7);
    T.fillStyle = '#d8701c'; T.fillRect(X + 4, Y - 6, 24, 9); T.fillStyle = '#f4a050'; T.fillRect(X + 4, Y - 6, 24, 2);
    T.fillStyle = '#fff2d8'; T.fillRect(X + 12, Y - 3, 8, 1);
    T.fillStyle = '#3a2a1a'; T.fillRect(X + 5, Y + 10, 6, 6); T.fillRect(X + 21, Y + 10, 6, 6);
    T.fillStyle = '#c8b090'; T.fillRect(X + 7, Y + 12, 2, 2); T.fillRect(X + 23, Y + 12, 2, 2);
  }
  G.mapHelpers.drawCart = A_drawCart;

  // ------------------------------------------------------------ H01 산등 야영지: shelter, push training, fishing, the cave mouth
  M.camp = {
    name: '산등 야영지', kind: 'out', bgm: 'town',
    rows: [
      'cccccccccccccccccccccccc',
      'cccccccccccmccccccccmccc',
      'ccaaaaaaaaaaaaaaaaaaaacc',
      'caaaa#####aaaa######aaac',
      'caaaa#####aaaa######aaac',
      'caaaa##D##aaaa######aaac',
      'caaaaaa=aaaaaaaaaaaaaaac',
      'caayaaa========aaaaaaaac',
      'caaaKaaaa=aaaaaauaaaaaac',
      'cTaaaaaaa=aaaaaaaaaaaaac',
      'cTTaaaaaa=aaaaaaaaaaaaac',
      'c..wwwaaa=aaaaaFFFFaaaac',
      'c.wwwwhaa=aaaaFFFFFFaaac',
      'c..wwwaaa=aaaa..FFFaaaac',
      'cT.......=......aaaaaaac',
      'cTT......==.....aaaaaTTc',
      'cTTTT.....=....TTTTTTTTc',
      'cccccccccc==cccccccccccc'],
    buildings: [{ k: 'tent', x: 5, y: 3, w: 5, h: 3 }, { k: 'tent', x: 14, y: 3, w: 6, h: 3 }],
    props: [{ k: 'fire', x: 11, y: 4 }],
    boulders: [{ id: 'train', x: 16, y: 10 }],
    warps: [{ x: 7, y: 5, to: 'camptent', tx: 4, ty: 5, dir: 'up' }, { x: 11, y: 1, to: 'cave1', tx: 11, ty: 14, dir: 'up', tdir: 'up' },
      { x: 20, y: 1, to: 'oldmine', tx: 1, ty: 11, dir: 'up', tdir: 'right' }],
    blocks: [{ x: 11, y: 4 }, { x: 20, y: 1, cond: () => !flag('mine_short') }],
    links: { s: { to: 'songfield', dx: 20 } },
    signs: {},
    items: [{ id: 'rope', x: 21, y: 13, flag: 'cp_rope' }],
    npcs: [
      { id: 'seokho', char: 'seokho', x: 15, y: 9, dir: 'down', name: '탐굴사 석호',
        talk: async () => {
          const N = '탐굴사 석호';
          if (!flag('badge1')) { await say('나는 탐굴사 석호. 동굴 길을 돌보는 사람이지.\n달숨동굴은 위험해서, 돌마루 체육관 배지를 가진 길지기에게만 길을 가르쳐 준다네.', N); return; }
          if (!flag('f_push')) {
            await say('오, 산등배지에 토담의 추천서까지! 그럼 수업을 시작하지.', N);
            if (G.S.bag.recommend) D().useItem('recommend');
            await say('바위 밀기는 힘자랑이 아니야. 돌이 굴러갈 길을 먼저 보고,\n동료와 같은 박자로 한 칸씩 미는 거지. 작은 동료가 혼자 무거운 걸 들 필요는 없어.', N);
            const lead = G.S.party.find(m => F().canLearn(m, 'push')) || G.S.party[0];
            F().teach(lead, 'push');
            set('f_push');
            G.audio && G.audio.jingle('learn');
            await say(`${G.eun(D().nameOf(lead))} 탐험 기술 [바위 밀기]를 익혔다!`);
            await say('저기 훈련 돌이 보이지? 위쪽 홈으로 밀어 넣어 보게.\n돌을 살펴본 다음 그쪽으로 걸으면 함께 민다네. 잘못 밀면 되돌리면 그만이고.', N);
            return;
          }
          if (!flag('q06')) { await say('훈련 돌을 위쪽 홈에 밀어 넣어 보게. 돌이 갈 칸이 미리 표시될 거야.', N); return; }
          if (!flag('q08')) { await say('동굴등은 가방에 있기만 하면 저절로 켜지네. 연료 걱정은 없어.\n안에서 길을 잃으면 메뉴의 [구조 요청]을 쓰게. 입구까지 데려다주지.', N); return; }
          await say('동굴의 울림이 돌아왔어. 다 자네 덕분이야.', N);
        } },
      { id: 'caveg', char: 'hiker', x: 11, y: 2, dir: 'down', name: '탐굴 안내원', cond: () => !flag('q06'),
        text: '달숨동굴 입구예요. 석호 씨의 동굴 준비 수업을 마친 길지기만 들어갈 수 있어요.\n바위 밀기와 동굴등이 꼭 필요하거든요.' },
      { id: 'narae', char: 'narae', x: 7, y: 12, dir: 'left', name: '낚시꾼 나래',
        talk: async () => {
          const N = '낚시꾼 나래';
          if (!flag('q07_start')) {
            set('q07_start');
            await say('흐아... 낚시 가방을 잃어버렸어. 낚싯대랑 미끼통이 다 들어 있는데.\n아까 야영지 옆 마른 둔덕에서 쉬었었는데, 거기 두고 온 것 같아.', N);
            await say('찾아 주면 정말 고마울 거야! 동쪽 둔덕 쪽이야.', N);
            return;
          }
          if (!flag('q07_bag')) { await say('동쪽 마른 둔덕 근처를 한번 봐 줄래? 파란 가방이야.', N); return; }
          if (!flag('q07')) {
            D().useItem('fishbag');
            set('q07');
            await say('내 가방! 정말 고마워. 답례로... 여분 낚싯대를 줄게!', N);
            await give('rod', 1);
            await say('낚싯대는 물가의 낚시 둔덕에서 물을 바라보고 쓰면 돼.\n찌가 흔들리면 그때 A 버튼! 너무 일찍 당기면 놓쳐.', N);
            const ok = await G.ask('그리고 부탁 하나... 내가 돌보던 물쫄이가 있는데, 급류에 다쳐서 회복 중이야.\n작은 물살에도 밀려나는 녀석이지만, 매일 여울을 거슬러 오르는 아이야. 데려가 줄래?', ['데려갈게', '지금은 괜찮아'], { name: N });
            if (ok) {
              const m = D().makeMon('muljjori', 7, { ivMin: 10 });
              m.hp = Math.max(1, Math.floor(D().stats(m).hp / 2));
              const fresh = !G.S.dex.caught.muljjori;
              D().receive(m); set('q07_adopt');
              G.audio && G.audio.jingle('catch');
              await say(`${P()}${G.josa(P(), '은', '는')} 물쫄이를 입양했다! 아직 체력이 반쯤 남아 있다.`);
              if (fresh) await G.menus.dexReveal('muljjori');
              await say('고마워! 약해 보여도 오래 키우면 깜짝 놀랄 거야. 정말이야!', N);
            } else await say('그래, 괜찮아! 저 연못 낚시 둔덕에서도 물쫄이를 만날 수 있어.', N);
            return;
          }
          await say('야영지 연못은 물쫄이가 사는 곳이야. 매일 여울을 거슬러 오르느라 바쁘지.', N);
        } },
      { id: 'campkid', char: 'kidA', x: 19, y: 14, dir: 'up', move: 'wander', name: '야영 소년',
        text: '동굴 안에서는 귀밤이들이 소리로 길을 찾는대. 근데 요즘은 자꾸 길을 잃는다나 봐.' }],
    objects: {
      '20,1': async () => { if (!flag('mine_short')) await say('녹슨 쇠창살로 막힌 옛 갱도 출구다. "새길상회 옛 운송 갱도 — 폐쇄"\n안쪽에서 빗장을 올려야 열릴 것 같다.'); },
      '20,13': async () => {
        if (!flag('q07_start') || flag('q07_bag')) { await say('바싹 마른 흙둔덕이다.'); return; }
        set('q07_bag'); D().addItem('fishbag', 1); G.audio && G.audio.sfx('item');
        await say('마른 둔덕 그늘에 파란 낚시 가방이 놓여 있다!\n나래에게 가져다주자.');
      }
    },
    onSlot: async () => {
      if (flag('q06')) return;
      set('q06');
      const N = '탐굴사 석호';
      await say('좋았어! 돌이 갈 길을 보고 같은 박자로 밀었지. 그게 바위 밀기야.', N);
      await say('자, 이건 동굴등. 가방에 넣어 두기만 하면 동굴에서 저절로 켜진다네.\n연료도 필요 없고, 어떤 동료와 다녀도 상관없어.', N);
      await give('lamp', 1);
      await say('그리고 달숨동굴 안전도. 입구와 대피소, 층의 대략만 그려 뒀네.\n세부 길은 자네가 걸으면서 채우게. 그게 탐굴사의 지도라네.', N);
      await give('map02', 1);
      await say('동굴 안에서는 [구조 요청]으로 언제든 입구까지 돌아올 수 있네. 탈출줄도 같은 일을 하지.\n자, 달숨동굴로 가 보게. 나도 안쪽에서 기다리겠네.', N);
      Wd().respawn();
    },
    drawExtra: (T, cx, cy) => {
      if (!flag('mine_short')) { const X = 20 * 16 - cx, Y = 1 * 16 - cy; T.fillStyle = '#5a6670'; for (let i = 1; i < 16; i += 4) T.fillRect(X + i, Y, 2, 16); T.fillRect(X, Y + 2, 16, 2); T.fillRect(X, Y + 10, 16, 2); }
      if (flag('q07_start') && !flag('q07_bag')) { const x = 20 * 16 - cx, y = 13 * 16 - cy; T.fillStyle = '#1c3c6a'; T.fillRect(x + 3, y + 6, 10, 8); T.fillStyle = '#4a90e2'; T.fillRect(x + 4, y + 7, 8, 6); T.fillStyle = '#e8f0f8'; T.fillRect(x + 6, y + 4, 4, 3); }
    },
    onEnter: async () => {
      visit('camp');
      G.S.caveDoor = 'camp';
      if (!flag('cp_supply')) {
        set('cp_supply');
        await G.wait(10);
        await say('산등 야영지에 온 걸 환영해요! 첫 방문 길지기에게 드리는 보급품이에요.', '야영지 관리인');
        await give('antidote', 3, true); await give('potion', 3, true); await give('rope', 1, true);
        await say(`${P()}${G.josa(P(), '은', '는')} 해독제 3개, 상처약 3개, 탈출줄 1개를 받았다!\n(쉼터 천막에서 무료로 쉬고, 보관함과 상점도 쓸 수 있다)`);
      }
    }
  };
  M.camptent = {
    name: '야영지 쉼터', kind: 'in', bgm: 'town', heal: [4, 3],
    rows: ['#W######W#', 'B..HH....P', '..........', '..tt......', '..........', '....x.....'],
    warps: [{ x: 4, y: 5, to: 'camp', tx: 7, ty: 6, dir: 'down' }],
    npcs: [
      { id: 'keeper', char: 'woman', x: 3, y: 2, dir: 'down', name: '야영지 관리인',
        talk: async () => {
          await say('여기서 몬스터들을 쉬게 해 줄게요.', '야영지 관리인');
          await G.menus.heal();
          await say('다들 기운이 넘쳐요! 동굴 조심해요.', '야영지 관리인');
        } },
      { id: 'clerk', char: 'clerk', x: 7, y: 2, dir: 'down', name: '장비 초소 점원',
        talk: async () => { await say('장비 초소예요. 필요한 걸 고르세요!', '장비 초소 점원'); await G.menus.shop(['potion', 'superpotion', 'antidote', 'awake', 'parlyz', 'rope', 'cube', 'goldcube']); } },
      { id: 'tutor', char: 'seokho', x: 6, y: 4, dir: 'left', name: '견습 탐굴사', noTurn: true,
        talk: async () => { await say('기술 복습이나 탐험 기술 교육이 필요하면 말해요.', '견습 탐굴사'); await F().centerService('견습 탐굴사'); } }]
  };
})();

/* 모아루: 잠든 길의 노래 — chapter 1 world, part 3: 달숨동굴 → 모래바람길 → 물울림시(두 번째 관장전) → 물안개 산책길 · 저수로
   (layouts come from _mapgen3.py; the rows are pasted in by the build) */
'use strict';
(function () {
  const G = window.G, M = G.MAPS, H = G.mapHelpers;
  const { flag, set, say, give, P } = H;
  const Wd = () => G.world, D = () => G.data, F = () => G.field;
  const visit = id => { G.S.visited = G.S.visited || {}; G.S.visited[id] = 1; };
  const ROWS = {
    cave1: [
      '########################',
      '########################',
      '###......####.........##',
      '###....k.####.r_________',
      '###......####.........##',
      '###......#######...#####',
      '###......#######...#####',
      '#####..#########...#####',
      '####.............,,,####',
      '####..r..........,,,####',
      '####...._______.....####',
      '####,,,._______..r..####',
      '####,,,...._........####',
      '####......._........####',
      '##########___cc#########',
      '##########___#X#########',
      '##########___###########',
      '###########x############'],
    cave2: [
      '################################',
      '################################',
      '#####_##########################',
      '##H___##########################',
      '#####_##########################',
      '#####_...........###############',
      '######...........###############',
      '##S###...r.......####......#####',
      '#_____...........####...k..#####',
      '#_________________uu____________',
      '______...........####......#####',
      '#_____.mmm.......####......#####',
      '#_____.mmm....r..###############',
      '######.mmm.......###############',
      '##########_#####################',
      '##########_#####################',
      '##########ee####################',
      '##########__####################',
      '###########H####################',
      '################################'],
    moonroom: [
      '##############',
      '##llllllllll##',
      '##lrlllllll^##',
      '##llllllllll##',
      '##llllllllllQ_',
      '##llllllllll##',
      '##llllllllrl##',
      '##llll___lll##',
      '#######H######',
      '##############'],
    echoroom: [
      '############',
      '##________##',
      '##_k____k_##',
      '##________##',
      '##________##',
      '##________##',
      '##________##',
      '######H#####',
      '############'],
    cave3: [
      '############################',
      '############################',
      '############################',
      '##########_XX_______u_u___##',
      '#########__________________#',
      '#########_cccccccccccccccc_#',
      '#########_________c________#',
      '#_________________c________#',
      '__________________c_________',
      '#_________________c________#',
      '#########_________c________#',
      '#########______X__c_____XX_#',
      '##########___u____________##',
      '############################',
      '############################',
      '############################'],
    cave4: [
      '######################',
      '######################',
      '######################',
      '#...................##',
      '#...r..._______.....##',
      '#.......___k___.....##',
      '#......._______.....##',
      '........_______.....XX',
      '#......._______.....##',
      '#.....r.........r...##',
      '#...............cccc##',
      '######################',
      '######################',
      '######################'],
    sandwind: [
      'ccTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'cczzzzzzzzzzzzzzsssssssssssssssswwsT',
      'cczzzzzzzzzzzrzzssssZZZZZZZZZZZswwsT',
      'cczzzzzzzzyzzzzzssssZZZZZZZZZZZswwsT',
      'cczzzzzzzzzzzzzzssssZZZZZZZrZZZswwsT',
      'cczzzzzzzzzzzzzzssssZZZZZZZZZZZswwsT',
      'cczzzzzzzzzzzzzzssssssssKssssssswwsT',
      'mm==============================nn==',
      'cc==============================nn==',
      'ccszzzzzzzzzsssssssssssssssssssswwsT',
      'ccszzzzzzzzzsswwwwwwwssssssssssswwsT',
      'ccszzzzzzzzzsswwwsswwsZZZZZZZZZswwsT',
      'ccszzzrzzzzzsswwwsswwsZZZZZZZZZswwsT',
      'ccszzzzzzzzzsswwwwwwwsZZZZZZZZZswwsT',
      'ccsssssssssssssssssssssssssssssswwsT',
      'ccTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'],
    mulullim: [
      'TTTTTTTTT==TTTTTTTTTwwTTTTTTTTTT',
      'T........==.........ww.........T',
      'T.#####..==..#####..ww.#######.T',
      'T.#####..==..#####..ww.#######.T',
      'T.#####..==..#####..ww.#######.T',
      'T.##D##..==..##D##..ww.###D###.T',
      'T...============....ww.........T',
      'T........==.........ww.fffffff.T',
      'T......F.==.....F...ww.dwwwwwd.T',
      'T..F.....==.........ww.dwwwwwd.T',
      'T........==.........ww..d......T',
      'wwwwwwwwdwwwwwwwwwwwwwwwdwwwwwwR',
      'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwR',
      'wwwwwwdwwwwwwwwwwwwwwwwwwwwwwwwR',
      'T.....d..==....................X',
      'T........==...............####.T',
      'T.######.==#####..####....####.T',
      'T.######.==#####..####..P.####.T',
      'T.######.==#####..####....#D##.T',
      'T.##DD##.==##D##..#D##.....=...T',
      'T...==...==..=.....=.......=S..T',
      '============================...T',
      '=.......................P......T',
      'T.F.............F............F.T',
      'T..............................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'],
    mistwalk: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'TwwwwwoowwwwwwwwwwwwwwwT',
      'Twwwwwoowwwo..wwwoowwwwT',
      'TwwwwwwwwwwwwwwwwwwwwwwT',
      'TwwwwwwwwwwwwwwwwwwwwwwT',
      'T......................T',
      'T.......########.......T',
      'T.......########.......T',
      'T....r..########....y..T',
      'T.......###DD###.......T',
      'T........======...r....T',
      'T..........==..........T',
      'T.ggggggg..==.jj.......T',
      'T.ggggggg..==.jjwwwwww.T',
      'T.ggggggg..==.jjwwwwww.T',
      'T.ggggggg..==.jjwwwwww.T',
      'T.ggggggg..==.jjddwwww.T',
      'T.ggggggg..==.jjwwwwww.T',
      'T...F......==.jjwwwwww.T',
      'T..........==.jjwwwwww.T',
      'T.gggggg...==.jjjjjjjj.T',
      'T.gggggg...==...jjjjjj.T',
      'T.gggggg...==...jjjjjj.T',
      'T.gggggg...==..........T',
      'T.gggggg...==.....K....T',
      'T.gggggg...==......F...T',
      'T........====..........T',
      'T..F.....====..........T',
      'T........====..........T',
      'TTTTTTTTT==TTTTTTTTTTTTT'],
    reservoir: [
      '##########################',
      '#________________________#',
      '#__gg_________________v__#',
      '#________________________#',
      '#________________________#',
      '####################tt####',
      '#_____#_______ww_________#',
      '#_____#_______ww_________#',
      '#_____V_______ww_________#',
      '#_____#_______uu_________#',
      '#_____#_______ww_________#',
      '#_____#_______ww_________#',
      '#wwwwwwwww__wwwwwwwwwwwww#',
      '#wwwwwwwww__wwwwwwwwwwwww#',
      '#____________#############',
      '#_t__________#############',
      '#____________#############',
      '##########################']
  };
  const caveRescue = () => (G.S.caveDoor === 'east' && flag('q08')) ? { map: 'sandwind', x: 2, y: 7, dir: 'right' } : { map: 'camp', x: 11, y: 2, dir: 'down' };
  const lift = async (to) => {
    if (!flag('q08')) { await say('녹슨 손수레 승강로다. 레일이 끊겨 있어 움직이지 않는다.'); return; }
    const ok = await G.ask(to === 'east' ? '손수레 승강로를 타고 동굴 동쪽 출구로 갈까?' : '손수레 승강로를 타고 야영지 쪽 입구로 갈까?');
    if (!ok) return;
    G.audio && G.audio.sfx('door');
    await G.fadeTo(1, 20);
    if (to === 'east') Wd().enter('cave4', 18, 9, 'left'); else Wd().enter('cave1', 12, 13, 'down');
    await G.fadeTo(0, 20);
    await say('덜컹덜컹... 승강로가 반대편 입구에 닿았다.');
  };

  // ------------------------------------------------------------ D02 달숨동굴
  M.cave1 = {
    name: '달숨동굴 입구층', floorName: '입구층', kind: 'cave', bgm: 'cave', rows: ROWS.cave1,
    dark: { lamp: 96, none: 64 }, rescue: caveRescue,
    warps: [{ x: 11, y: 17, to: 'camp', tx: 11, ty: 2, dir: 'down', tdir: 'down' }],
    links: { e: { to: 'cave2', dy: 7 } },
    items: [{ id: 'potion', x: 4, y: 2, flag: 'c1_potion' }, { id: 'cube', n: 2, x: 21, y: 2, flag: 'c1_cube' }],
    objects: { '14,15': () => lift('east') },
    npcs: [
      { id: 'c1hint', char: 'seokho', x: 7, y: 13, dir: 'right', name: '견습 탐굴사',
        text: '입구층은 바깥 빛이 들어와서 밝은 편이에요. 안쪽 반향층부터는 동굴등 불빛이 좁아지니 천천히!\n귀밤이들이 요즘 자꾸 벽에 부딪힌대요. 울림이 흐트러졌나 봐요.' },
      { id: 'sanha', char: 'hiker', x: 16, y: 12, dir: 'left', sight: 4,
        trainer: { flag: 'tr_sanha', title: '등산가', name: '산하', char: 'hiker', team: [['jagalkong', 11], ['gwibami', 11]], base: 22,
          before: '동굴 입구에서 몸 좀 풀고 가자고!', lose: '허허, 동굴 갈 준비는 됐구먼.',
          after: '자갈콩은 마음에 드는 돌을 등에 얹고 다녀. 오래 붙어 있으면 몸의 일부가 된다지.' } }],
    onEnter: async () => { visit('cave'); }
  };
  M.cave2 = {
    name: '달숨동굴 반향층', floorName: '반향층', kind: 'cave', bgm: 'cave', rows: ROWS.cave2,
    dark: { lamp: 52, none: 18 }, rescue: caveRescue,
    boulders: [{ id: 'A', x: 15, y: 9 }, { id: 'B', x: 12, y: 6 }, { id: 'C', x: 5, y: 3 }],
    warps: [{ x: 2, y: 3, to: 'moonroom', tx: 7, ty: 7, tdir: 'up' }, { x: 11, y: 18, to: 'echoroom', tx: 6, ty: 6, tdir: 'up' }],
    links: { w: { to: 'cave1', dy: -7 }, e: { to: 'cave3', dy: -1 } },
    echoWalls: [{ tiles: [[10, 16], [11, 16]], open: '_', flag: 'rv_echo_open' }],
    objects: {
      '2,7': async () => {
        await say('반향층 돌판: "둥근 돌이 길을 막았다면 이 돌판을 두드려 처음으로 되돌리시오."');
        const ok = await G.ask('반향층의 돌을 처음 자리로 되돌릴까?\n(이미 홈에 맞물린 돌은 그대로 남는다)');
        if (ok) await F().resetPuzzle();
      }
    },
    onSlot: async () => {
      const t = G.S.tiles && G.S.tiles.cave2 || {};
      if (t['18,9'] === 'U' && t['19,9'] === 'U' && !flag('q08_puzzle')) {
        set('q08_puzzle');
        await say('두 개의 돌이 틈을 메워 건너편으로 가는 길이 이어졌다!');
      }
    },
    npcs: [
      { id: 'c2hint', char: 'seokho', x: 3, y: 11, dir: 'right', name: '견습 탐굴사',
        text: () => flag('q08_puzzle') ? '틈이 메워졌네요! 건너편은 새길상회 작업장이에요.' : '건너편으로 가려면 오른쪽 틈 두 칸을 둥근 돌로 메워야 해요.\n돌을 살펴보고, 갈 칸 표시를 확인하면서 한 칸씩! 막히면 입구 돌판으로 되돌리면 돼요.' }],
    onEnter: async () => {
      visit('cave');
      if (!flag('c2_dark')) { set('c2_dark'); await G.wait(10); await say(G.S.bag.lamp ? '동굴등 불빛이 주변만 겨우 비춘다... 반향층은 훨씬 어둡다.' : '사방이 캄캄하다...'); }
    }
  };
  M.moonroom = {
    name: '달빛방', floorName: '달빛방', secret: true, kind: 'cave', bgm: 'shrine', rows: ROWS.moonroom,
    dark: { lamp: 72, none: 30, col: 'rgba(10,12,30,0.88)' }, rescue: caveRescue,
    warps: [{ x: 7, y: 8, to: 'cave2', tx: 3, ty: 3, tdir: 'right' }],
    items: [{ id: 'moonstone', x: 6, y: 2, flag: 'rv_moon' }],
    onEnter: async () => {
      visit('cave');
      if (!flag('mr_seen')) { set('mr_seen'); await G.wait(10); await say('천장 틈으로 달빛이 흘러들어 바닥이 은은하게 빛난다.\n달모찌가 깨어나는 곳이라고 하던 그 방이다.'); }
    }
  };
  M.echoroom = {
    name: '반향방', floorName: '반향방', secret: true, kind: 'cave', bgm: 'cave', rows: ROWS.echoroom,
    dark: { lamp: 80, none: 30 }, rescue: caveRescue,
    warps: [{ x: 6, y: 7, to: 'cave2', tx: 11, ty: 17, tdir: 'up' }],
    items: [{ id: 'memo', x: 3, y: 4, flag: 'rv_memo' }, { id: 'quartz', x: 8, y: 4, flag: 'rv_quartz' }, { id: 'rope', x: 5, y: 1, flag: 'rv_erope' }],
    onEnter: async () => { visit('cave'); set('rv_echo'); }
  };
  M.cave3 = {
    name: '달숨동굴 작업장', floorName: '작업장', kind: 'cave', bgm: 'cave', rows: ROWS.cave3,
    dark: { lamp: 64, none: 22 }, rescue: caveRescue,
    links: { w: { to: 'cave2', dy: 1 }, e: { to: 'cave4', dy: -1 } },
    objects: {
      '20,3': async () => say('공명석을 떼어 낸 자리가 움푹 파여 있다. 주변 바위가 미세하게 떨린다.'),
      '22,3': async () => say('공명석을 떼어 낸 자리다. 새길상회 표식이 새겨진 쐐기가 박혀 있다.'),
      '13,12': async () => say('떼어 낸 공명석 조각이 흩어져 있다. 귀밤이가 피하는 듯 이쪽엔 아무도 없다.')
    },
    npcs: [
      { id: 'seokho3', char: 'seokho', x: 6, y: 7, dir: 'down', name: '탐굴사 석호', cond: () => !flag('q08_workers'),
        talk: async () => {
          const N = '탐굴사 석호';
          await say('여기까지 왔군! 잠깐 쉬어 가게. 이 앞이 작업장이야.', N);
          await G.menus.heal();
          await say('몬스터들 기운이 돌아왔네. 새길상회 사람들이 공명석을 떼어 가면서\n동굴 울림이 흐트러졌어. 기록과 부품을 확인해야겠네. 조심하게.', N);
        } },
      { id: 'w1', char: 'worker', x: 13, y: 8, dir: 'left', sight: 4,
        trainer: { flag: 'tr_w1', title: '새길상회 일꾼', name: '도훈', char: 'worker', team: [['gwibami', 12], ['jagalkong', 12]], base: 24,
          before: '여긴 작업 구역이야! 길지기라도 함부로 못 들어와!', lose: '으윽, 감독님한테 혼나겠네...',
          after: '우린 위에서 시키는 대로 공명석을 떼어 갈 뿐이야. 동력원으로 쓴다나 봐.' } },
      { id: 'w2', char: 'worker', x: 22, y: 8, dir: 'left', sight: 3,
        trainer: { flag: 'tr_w2', title: '새길상회 반장', name: '경수', char: 'worker', team: [['moraekong', 13], ['gwibami', 13]], base: 26,
          before: '공명석 운반은 일정이 빠듯하다고! 비켜!', lose: '...알았다, 알았어. 이 기록 가져가.',
          after: '작업 기록엔 물울림 수문 장비 얘기도 있어. 부품 하나는 받침대에서 떼어 온 거고.',
          afterWin: async () => {
            const N = '새길상회 반장 경수';
            await say('사실 나도 찜찜했어. 받침대 부품을 떼어 내고부터 귀밤이들이 길을 잃더라고.\n이 작업 기록이랑 받침대 핵심 부품, 네가 제자리에 돌려놓아 줘.', N);
            await give('records', 1, true); await give('part', 1, true);
            await say(`${P()}${G.josa(P(), '은', '는')} 작업 기록과 공명 핵심 부품을 받았다!`);
            set('q08_workers');
            Wd().respawn();
          } } }],
    onEnter: async () => { visit('cave'); }
  };
  M.cave4 = {
    name: '달숨동굴 동쪽 출구', floorName: '동쪽 출구', kind: 'cave', bgm: 'cave', rows: ROWS.cave4,
    dark: { lamp: 64, none: 22, spots: [{ x: 11, y: 5, r: 34, a: 0.9, cond: () => flag('q08') }] }, rescue: caveRescue,
    links: { w: { to: 'cave3', dy: 1 }, e: { to: 'sandwind', dy: 0, cond: () => flag('q08') } },
    objects: {
      '11,5': async () => say(flag('q08') ? '받침대 위 공명석이 낮고 고르게 울리고 있다.' : '공명석 받침대다. 가운데 홈이 텅 비어 있어 울림이 끊겨 있다.'),
      '19,10': () => lift('west')
    },
    npcs: [
      { id: 'seokho4', char: 'seokho', x: 10, y: 7, dir: 'up', name: '탐굴사 석호', cond: () => flag('q08_workers'),
        talk: async () => {
          const N = '탐굴사 석호';
          if (!flag('q08')) {
            await say('부품을 되찾았군! 자, 받침대에 다시 끼워 보자.', N);
            D().useItem('part');
            G.audio && G.audio.sfx('sparkle');
            await F().play(60, (T, cx, cy, k) => { for (let i = 0; i < 3; i++) { const kk = (k * 1.5 - i * 0.2); if (kk <= 0 || kk >= 1) continue; T.strokeStyle = `rgba(184,168,255,${1 - kk})`; T.lineWidth = 2; T.beginPath(); T.arc(11 * 16 + 8 - cx, 5 * 16 + 8 - cy, 8 + kk * 60, 0, 7); T.stroke(); } });
            await say('받침대의 공명석이 낮게 울리기 시작했다...!');
            G.audio && G.audio.cry('gwibami');
            await F().play(90, (T, cx, cy, k) => {
              for (let i = 0; i < 6; i++) { const mini = G.mons.mini('gwibami').right; const x = (2 + i * 2 + k * 30) * 16, y = (3 + (i % 3) * 2) * 16 - Math.sin(k * 6 + i) * 10; T.drawImage(mini, Math.round(x - cx), Math.round(y - cy)); }
            });
            await say('어둠 속에서 귀밤이 무리가 날아올라, 망설임 없이 동쪽으로 빠져나갔다!');
            F().setTile('cave4', 20, 7, '.'); F().setTile('cave4', 21, 7, '.');
            G.audio && G.audio.sfx('knock2');
            set('q08');
            await say('울림이 돌아오자 막혀 있던 동쪽 출구의 바위문이 스르르 열렸다!', N);
            await say('고맙네. 이제 동굴 양 끝의 손수레 승강로도 다시 쓸 수 있어. 오갈 때 이용하게.\n그 작업 기록은 물울림 수문연구소의 소리에게 전해 주게. 수문 장비 얘기가 있거든.', N);
            set('f_echo');
            const bat = G.S.party.concat(G.S.box).find(m => F().canLearn(m, 'echo'));
            await say('그리고 하나 더. 귀밤이 무리가 소리로 길을 찾는 걸 봤지? 그걸 [메아리 탐색]이라 하네.\n귀밤이 계열 동료가 있다면 벽 너머 빈 공간도 찾을 수 있어.', N);
            if (bat) { F().teach(bat, 'echo'); G.audio && G.audio.jingle('learn'); await say(`${G.eun(D().nameOf(bat))} 탐험 기술 [메아리 탐색]을 익혔다!`); }
            else await say('지금은 귀밤이 계열 동료가 없구먼. 나중에 동료가 되면 센터에서 가르칠 수 있네.\n반향층 아래 무늬 벽은 급할 것 없으니 그때 살펴보게.', N);
            Wd().respawn();
            return;
          }
          await say('동굴이 다시 숨을 쉬는군. 물울림까지 조심히 가게!', N);
        } }],
    drawExtra: (T, cx, cy) => {
      if (!flag('q08')) {   // the stone door at the east exit
        const X = 20 * 16 - cx, Y = 7 * 16 - cy;
        T.fillStyle = '#3a3028'; T.fillRect(X, Y - 4, 32, 20);
        T.fillStyle = '#5c4a3a'; T.fillRect(X + 2, Y - 2, 28, 17);
        T.fillStyle = '#7c6650'; T.fillRect(X + 4, Y, 24, 2); T.fillRect(X + 15, Y + 3, 2, 11);
        T.fillStyle = '#b8a8ff'; T.fillRect(X + 14, Y + 6, 4, 4);
      }
    },
    onEnter: async () => { visit('cave'); }
  };

  // ------------------------------------------------------------ R05 모래바람길
  M.sandwind = {
    name: '모래바람길', kind: 'out', bgm: 'route', rows: ROWS.sandwind,
    links: { w: { to: 'cave4', dy: 0, gated: 1 }, e: { to: 'mulullim', dy: 14 } },   // the cave's east door opens with Q08
    waterLine: '넓은 물웅덩이다. 건너편 모래턱에 무언가 반짝인다.\n잔물타기를 익히면 건너가 볼 수 있을 것 같다.',
    items: [{ id: 'goldcube', n: 3, x: 17, y: 11, flag: 'rv_puddle' }, { id: 'potion', x: 30, y: 14, flag: 'sw_potion' }],
    npcs: [
      { id: 'sw1', char: 'hiker', x: 18, y: 6, dir: 'down', sight: 2,
        trainer: { flag: 'tr_sw1', title: '등산가', name: '모래', char: 'hiker', team: [['ttoari', 13], ['moraekong', 14]], base: 22,
          before: '동굴에서 나왔구먼! 바깥 공기 맛 좀 보라고!', lose: '모래바람보다 매섭구먼...',
          after: '마른 풀숲엔 또아리, 모래턱 풀숲엔 모래콩이 많지. 사는 곳이 확실히 다르다네.' } },
      { id: 'sw2', char: 'kidB', x: 26, y: 9, dir: 'up', sight: 2,
        trainer: { flag: 'tr_sw2', title: '새 관찰가', name: '소담', char: 'kidB', team: [['jjoreu', 14], ['solgae', 15]], base: 20,
          before: '바람깃이 바람을 읽는 거 본 적 있어?', lose: '바람이 너한테 불었나 봐!',
          after: '물울림시까지는 이 돌길만 따라가면 돼. 마른 돌다리로 들어갈 수 있어.' } },
      { id: 'swman', char: 'man', x: 12, y: 9, dir: 'left', name: '여행자',
        text: '동굴 울림이 돌아왔다더니 바람 냄새도 달라졌네.\n저 앞 물울림시는 요즘 수문이 이상해서 강물이 거칠어졌대.' }],
    onEnter: async () => { visit('sandwind'); G.S.caveDoor = 'east'; }
  };

  // ------------------------------------------------------------ M03 물울림시: canal city and the second gym
  // the public ferry: three docks (south quay, north walk, gym); free once 소리 has the records
  const DOCKS = { sw: { n: '남쪽 선착장', x: 6, y: 14, dir: 'down' }, nw: { n: '북쪽 산책길 선착장', x: 8, y: 10, dir: 'up' }, ne: { n: '체육관 선착장', x: 24, y: 10, dir: 'up' } };
  const ferry = async (from) => {
    const N = '사공';
    if (!flag('q09_met')) { await say('나룻배는 수문연구소 안내를 받은 뒤에 운행해요. 지금은 물살 점검 중이라서요.', N); return; }
    const to = Object.keys(DOCKS).filter(k => k !== from);
    const coast = from === 'sw' && flag('q13');
    const opts = to.map(k => DOCKS[k].n).concat(coast ? ['돛바람항 (연안 나룻배)'] : []);
    const L = await G.say('어디로 건너갈까요? 공용 나룻배는 무료예요!', { name: N, keep: true });
    const c = await G.choose(opts.concat(['괜찮아요']), { title: '공용 나룻배', cancel: opts.length });
    G.closeText(L);
    if (coast && c === to.length) { if (H.coastFerry) await H.coastFerry(true); return; }
    if (c < 0 || c >= to.length) return;
    const d = DOCKS[to[c]];
    G.audio && G.audio.sfx('water');
    await G.fadeTo(1, 18);
    Wd().enter('mulullim', d.x, d.y, d.dir, { quiet: true });
    await G.fadeTo(0, 18);
    await say(`나룻배가 잔잔하게 수로를 건너 ${d.n}에 닿았다.`);
  };
  M.mulullim = {
    name: '물울림시', kind: 'out', bgm: 'water', rows: ROWS.mulullim,
    buildings: [
      { k: 'house', x: 2, y: 2, w: 5, h: 4, roof: 'blue' },
      { k: 'house', x: 13, y: 2, w: 5, h: 4, roof: 'teal' },
      { k: 'gym', x: 23, y: 2, w: 7, h: 4, roof: 'blue', wall: '#e8f2f6', wallH: 34, emblem: 'wave' },
      { k: 'center', x: 2, y: 16, w: 6, h: 4, roof: 'red', wall: '#fbf6ee' },
      { k: 'shop', x: 11, y: 16, w: 5, h: 4, roof: 'blue', wall: '#f4f6fa' },
      { k: 'house', x: 18, y: 16, w: 4, h: 4, roof: 'orange' },
      { k: 'house', x: 26, y: 15, w: 4, h: 4, roof: 'grey', wall: '#dfe6ea', label: '수문 관리소' }],
    signs: { '28,20': '수문 관리소 · 저수로 계단\n저수로에는 이 건물 안 계단으로 내려간다.\n(북쪽 물안개 산책길 끝 수문연구소의 확인을 받은 뒤 이용 가능)' },
    warps: [
      { x: 4, y: 5, to: 'house_m1', tx: 3, ty: 5, dir: 'up' }, { x: 15, y: 5, to: 'house_m2', tx: 3, ty: 5, dir: 'up' },
      { x: 26, y: 5, to: 'gym2', tx: 7, ty: 15, dir: 'up' },
      { x: 4, y: 19, to: 'center_m', tx: 5, ty: 6, dir: 'up' }, { x: 5, y: 19, to: 'center_m', tx: 6, ty: 6, dir: 'up' },
      { x: 13, y: 19, to: 'shop_m', tx: 4, ty: 5, dir: 'up' }, { x: 19, y: 19, to: 'house_m3', tx: 3, ty: 5, dir: 'up' },
      { x: 27, y: 18, to: 'sluicehouse', tx: 3, ty: 5, dir: 'up' }],
    links: { n: { to: 'mistwalk', dx: 0 }, w: { to: 'sandwind', dy: -14 }, e: { to: 'reedford', dy: -6, gated: 1, cond: () => flag('ch1_end') } },
    npcs: [
      { id: 'sori', char: 'sori', x: 11, y: 14, dir: 'down', name: '수문연구소 소리', cond: () => !flag('q09_met'),
        talk: async () => {
          const N = '수문연구소 소리';
          await say(`어, 길지기 배지... 혹시 달숨동굴 쪽에서 왔어요? 나는 수문연구소 연구원 소리예요.`, N);
          if (!G.S.bag.records) { await say('요즘 수로 물길이 이상해서 다들 걱정이에요.', N); return; }
          await say('그 작업 기록, 잠깐 봐도 돼요?', N);
          D().useItem('records');
          await say('...역시. 새길상회가 동굴에서 뗀 공명 부품을 우리 수문 장비에 연결했어요.\n물을 막아 운송량을 늘리려고 한 거예요. 그래서 저수로 수문이 엉켜 버렸고요.', N);
          await say('체육관도 저수로 점검 때문에 잠시 쉬고 있어요. 관장 리안이 수문을 같이 보고 있거든요.\n북쪽 물안개 산책길 끝 수문연구소에서 기록을 같이 확인해 줄래요?', N);
          await say('이 도시랑 연구소, 저수로를 몇 번 오가야 할 거예요. 이거 받아요. 수로 안내도예요.\n공공 선착장이랑 연구소, 수문 구역만 그려 둔 거라 나머지는 걸으면서 채워 가면 돼요.', N);
          await give('map03', 1);
          G.audio && G.audio.sfx('item');
          await say('(메뉴의 [지도]에 물울림 일대가 더해졌다)');
          await say('아, 그리고 수로 건너편으로 갈 땐 공용 나룻배를 타요. 무료고 언제든 오갈 수 있어요!', N);
          set('q09_met');
          Wd().respawn();
        } },
      { id: 'ferry_sw', char: 'ferry', x: 7, y: 14, dir: 'left', name: '사공', talk: () => ferry('sw') },
      { id: 'ferry_nw', char: 'ferry', x: 7, y: 10, dir: 'right', name: '사공', talk: () => ferry('nw') },
      { id: 'ferry_ne', char: 'ferry', x: 25, y: 10, dir: 'left', name: '사공', talk: () => ferry('ne') },
      { id: 'gymguard', char: 'man', x: 26, y: 6, dir: 'down', name: '체육관 관리인', cond: () => !flag('q09'),
        text: '죄송해요, 저수로 점검 때문에 체육관은 잠시 쉬어요.\n관장 리안 님이 수문을 살펴보고 계세요.' },
      { id: 'rian_pool', char: 'rian', x: 22, y: 8, dir: 'right', name: '관장 리안', cond: () => flag('badge2'),
        talk: async () => {
          const N = '관장 리안';
          if (!flag('f_ripple')) {
            await say('강습권 가져왔구나. 그럼 잔물타기 수업을 시작하자!', N);
            if (G.S.bag.ticket) D().useItem('ticket');
            await say('잔물타기는 동료가 물살을 읽고, 너는 접이식 물판 위에서 균형을 잡는 거야.\n작은 동료가 너를 업고 헤엄칠 필요는 없어. 물판이 너를 받쳐 주니까.', N);
            const apt = G.S.party.concat(G.S.box).filter(m => F().canLearn(m, 'ripple'));
            if (apt.length) {
              const lead = G.S.party.find(m => F().canLearn(m, 'ripple')) || apt[0];
              F().teach(lead, 'ripple');
              G.audio && G.audio.jingle('learn');
              await say(`${G.eun(D().nameOf(lead))} 탐험 기술 [잔물타기]를 익혔다!`);
            } else {
              G.S.loans = G.S.loans || {}; G.S.loans.ripple = 'muljjori';
              await say('물에 맞는 동료가 없구나. 괜찮아, 수문연구소에서 지원 물쫄이를 보내왔어.\n이 아이는 전투에는 나서지 않고, 물길만 함께 이끌어 줄 거야.', N);
              await say(`지원 물쫄이가 ${P()}의 물길 안내를 맡았다!`);
            }
            set('f_ripple');
            await give('board', 1);
            await say('자, 왼쪽 선착장에서 물을 바라보고 A 버튼. 물판을 펼치고 오른쪽 선착장까지 건너가 봐!\n물살은 왼쪽에서 오른쪽으로 흘러. 흐름을 타면 금방이야.', N);
            set('q10_ready');
            return;
          }
          if (!flag('q10')) { await say('왼쪽 선착장에서 출발해서 오른쪽 선착장에 닿으면 돼!', N); return; }
          await say('이제 잔잔한 강과 연못은 어디든 건널 수 있어. 급류와 바다는 아직 안 돼!\n이슬마을 호수 섬이나 바람나루 강 건너도 가 볼 수 있을 거야.', N);
        } },
      { id: 'mguide', char: 'woman', x: 14, y: 22, dir: 'up', move: 'wander', name: '물울림 주민',
        text: () => flag('q09') ? '수문이 고쳐지니 물소리가 다시 고르게 들려요. 이 도시는 물소리로 시간을 알거든요.' : '울림퐁이 수문 옆에서 노래하면 물살이 잔잔해진다는 옛말이 있어요.\n요즘은 노랫소리도 물소리에 묻혀 버려요.' },
      { id: 'gateman', char: 'worker', x: 29, y: 14, dir: 'right', name: '수문 관리원',
        text: () => (flag('q09') && flag('badge2') && flag('q10')) ? '동쪽 수문이 열렸어요! 이 너머는 아직 공사 중인 옛 수로예요.' : '동쪽 수문 출구는 점검 중이에요.\n수문 복구, 체육관 인증, 잔물타기 강습이 끝나면 열 수 있어요.' }],
    triggers: [
      { x: 1, y: 21, w: 1, h: 2, cond: () => !flag('q09_met') && !!G.S.bag.records, run: async () => {
        const W = Wd(), n = W.npc('sori');
        if (n) {
          n.emote = 36; G.audio && G.audio.sfx('alert');
          n.x = 4; n.y = W.player.y; n.dir = 'left';
          await G.wait(10);
          await n.talk();
        }
      } },
      { x: 29, y: 8, w: 1, h: 2, cond: () => flag('q10_ready') && !flag('q10'), run: async () => {
        set('q10');
        G.audio && G.audio.jingle('badge');
        await say('반대편 선착장에 무사히 닿았다! 물살을 읽는 감각이 몸에 익었다.');
        await say(`잘했어, ${P()}! 이제 잔물타기가 탐험 수첩에 등록됐어.\n처음엔 건널 수 없던 호수 건너편, 이제 같이 갈 수 있겠지?`, '관장 리안');
        if (flag('q09') && flag('badge2')) await say('동쪽 수문 출구도 열어 둘게. 다음 여정은 그쪽이야.\n가기 전에 예전에 못 갔던 물가들도 둘러보고 와!', '관장 리안');
      } },
      { x: 30, y: 14, w: 1, h: 1, cond: () => flag('q09') && flag('badge2') && flag('q10') && !flag('ch1_end'), run: async () => {
        set('ch1_end');
        await G.chapterEnd(1);
        F().setTile('mulullim', 31, 14, '=');
        if (H.kickoff2) await H.kickoff2();
      } },
      { x: 30, y: 14, w: 1, h: 1, cond: () => flag('ch1_end') && !flag('q11_start'), run: async () => { if (H.kickoff2) await H.kickoff2(); } }],
    drawExtra: (T, cx, cy) => {
      // the east sluice gate: closed shutters, or raised once chapter 1 is done
      const open = flag('q09') && flag('badge2') && flag('q10');
      const X = 30 * 16 + 8 - cx, Y = 11 * 16 - cy;
      T.fillStyle = '#4a5660'; T.fillRect(X, Y - 12, 4, 60); T.fillRect(X + 20, Y - 12, 4, 60);
      T.fillStyle = '#6a7a86'; T.fillRect(X - 2, Y - 16, 28, 6);
      if (!open) { T.fillStyle = '#7a5a3a'; T.fillRect(X + 4, Y - 6, 16, 52); T.fillStyle = '#a8784a'; for (let i = 0; i < 6; i++) T.fillRect(X + 4, Y - 4 + i * 8, 16, 2); }
      else { T.fillStyle = '#7a5a3a'; T.fillRect(X + 4, Y - 14, 16, 8); }
    },
    onEnter: async () => { visit('mulullim'); if (flag('ch1_end') && Wd().getMap('mulullim').at(31, 14) !== '=') F().setTile('mulullim', 31, 14, '='); }
  };
  H.center('center_m', '물울림', 'mulullim', 4, 20);
  H.shop('shop_m', '물울림', 'mulullim', 13, 20, H.STOCK1);
  H.house('house_m1', '물울림시', 'mulullim', 4, 6, [
    { id: 'm1', char: 'elder', x: 2, y: 2, dir: 'down', name: '할머니',
      text: '거대한 물 몬스터가 지나간 잔잔한 물길을 따라 이 도시가 생겼단다.\n물살이 거칠어지면 그 몬스터도 길을 잃는다고 했지.' }]);
  H.house('house_m2', '물울림시', 'mulullim', 15, 6, [
    { id: 'm2', char: 'kidA', x: 5, y: 3, dir: 'left', move: 'wander', name: '꼬마',
      text: '울림퐁 노래 들어 봤어? 졸음이 쏟아지는데, 졸리기 시작하면 다른 동료로 바꾸면 돼!\n교체하면 졸음이 싹 사라지거든.' }]);
  H.house('house_m3', '물울림시', 'mulullim', 19, 20, [
    { id: 'm3', char: 'woman', x: 5, y: 2, dir: 'down', name: '아주머니',
      talk: async () => {
        if (!flag('gift_super')) { set('gift_super'); await say('동굴을 지나왔다고? 고생했구나. 이거 받으렴.', '아주머니'); await give('superpotion', 2); return; }
        await say('리안 관장은 물쫄이를 아주 아낀단다. 약해 보여도 언젠가 크게 자란다고.', '아주머니');
      } }]);
  M.sluicehouse = {
    name: '수문 관리소', kind: 'in', bgm: 'water',
    rows: ['#W####W#', 'z......p', 'B.......', '..tt....', '........', '...x....'],
    warps: [{ x: 3, y: 5, to: 'mulullim', tx: 27, ty: 19, dir: 'down' }, { x: 0, y: 1, to: 'reservoir', tx: 3, ty: 15, dir: 'left', tdir: 'right' }],
    npcs: [
      { id: 'sl1', char: 'worker', x: 1, y: 1, dir: 'down', name: '수문 관리원', cond: () => !flag('q09_lab'),
        text: '이 계단은 저수로로 내려가요. 수문연구소의 확인 없이는 들어갈 수 없어요.\n북쪽 물안개 산책길 끝 연구소에 들러 주세요.' },
      { id: 'sl2', char: 'worker', x: 5, y: 2, dir: 'down', name: '수문 관리원', cond: () => flag('q09_lab'),
        text: () => flag('q09') ? '수문이 다시 고르게 열리고 닫혀요. 고마워요!' : '저수로 안은 발판과 계단으로 이어져 있어요. 물에 들어갈 필요는 없어요.\n덩굴과 둥근 돌만 조심하면 돼요!' }],
    // before the lab has checked the records, the keeper says so at the door instead of silently standing in the way
    onEnter: async () => {
      if (flag('q09_lab')) return;
      await G.wait(8);
      await say(flag('q09_met') ? '어서 와요. 저수로 계단은 수문연구소 확인을 받은 뒤에 열어 드려요.\n북쪽 물안개 산책길 끝 연구소에 먼저 들러 주세요. 수로는 공용 나룻배로 건너면 돼요.'
        : '어서 와요. 여기는 저수로로 내려가는 계단을 지키는 곳이에요.\n요즘 수문이 이상해서, 수문연구소 확인 없이는 열어 드릴 수 없어요.', '수문 관리원');
    }
  };

  // 물울림 체육관: open sluices in the right order (모형 수문 퍼즐)
  const chan = (row, dry) => {
    const list = [];
    for (let x = 0; x < 14; x++) list.push([x, row, dry ? (x === 7 || x === 8 ? 'y' : 'g') : 'w']);
    G.S.tiles = G.S.tiles || {};
    const t = G.S.tiles.gym2 = G.S.tiles.gym2 || {};
    list.forEach(([x, y, c]) => { t[x + ',' + y] = c; });
    Wd().rebuild('gym2');
  };
  const valve = async (which) => {
    G.audio && G.audio.sfx('water');
    if (which === 1) { set('gA', flag('gA') ? 0 : 1); set('gB', flag('gB') ? 0 : 1); }
    else set('gB', flag('gB') ? 0 : 1);
    chan(8, flag('gA')); chan(4, !flag('gB'));
    await say(which === 1 ? '첫 번째 수문 손잡이를 돌렸다! 아래 수로와 위 수로의 물이 서로 자리를 바꾼다.' : '두 번째 수문 손잡이를 돌렸다! 위 수로의 물길이 바뀐다.');
  };
  M.gym2 = {
    name: '물울림 체육관', kind: 'in', floor: 'g', bgm: 'gym',
    rows: [
      '#W####WW####W#',
      'gggggggyyggggg',
      'ggggggyyyygggg',
      'gggggggyyggggg',
      'gggggggyyggggg',
      'gggggggyyggggg',
      'gggVgggyyggggg',
      'gggggggyyggggg',
      'wwwwwwwwwwwwww',
      'gggggggyyggggg',
      'gggggggyyggVgg',
      'sggggggyyggggs',
      'gggggggyyggggg',
      'gggggggyyggggg',
      'gggggggyyggggg',
      'gggggggxxggggg'],
    warps: [{ x: 7, y: 15, to: 'mulullim', tx: 26, ty: 6, dir: 'down' }, { x: 8, y: 15, to: 'mulullim', tx: 26, ty: 6, dir: 'down' }],
    objects: {
      '11,10': () => valve(1), '3,6': () => valve(2),
      '0,11': async () => say(flag('badge2') ? `물울림 체육관 관장 리안\n인정받은 길지기: ${P()}` : '물울림 체육관 관장 리안\n"물길은 한 번에 열리지 않는다. 순서를 읽어라"'),
      '13,11': async () => say('수문 모형 안내판: "아래 손잡이는 두 수로를 함께 바꾸고, 위 손잡이는 위 수로만 바꾼다."')
    },
    npcs: [
      { id: 'g2a', char: 'kidB', x: 3, y: 12, dir: 'right', sight: 4,
        trainer: { flag: 'tr_g2a', title: '수영 소녀', name: '물결', char: 'kidB', team: [['dorekong', 16], ['muljjori', 15]], base: 22,
          before: '도레콩 노래 들으면 졸릴걸?', lose: '졸음도 교체하면 사라지는구나...', after: '졸음이 오면 다음 차례가 끝날 때 잠들어. 그 전에 바꾸면 괜찮아!' } },
      { id: 'g2b', char: 'kidA', x: 10, y: 6, dir: 'left', sight: 3,
        trainer: { flag: 'tr_g2b', title: '수문 견습생', name: '여울', char: 'kidA', team: [['dorekong', 17], ['jjoreu', 16]], base: 22,
          before: '위 수로까지 왔구나! 관장님께 가려면 나를 넘어!', lose: '수문 순서를 읽었구나!', after: '관장님 울림퐁은 물의 고리로 조금씩 회복해. 길게 끌면 불리해!' } },
      { id: 'gguide2', char: 'man', x: 12, y: 13, dir: 'left', name: '안내원',
        text: () => flag('badge2') ? '축하해! 리안 관장님이 체육관 옆 수조에서 잔물타기를 가르쳐 줄 거야.' : '도전자! 관장 리안은 물과 소리의 공명을 다뤄. 물·노말 혼합 팀이지.\n울림퐁의 포근한노래는 한 차례 뒤에 잠들게 해. 교체로 끊을 수 있어!' },
      { id: 'leader2', char: 'rian', x: 7, y: 1, dir: 'down', name: '관장 리안',
        talk: async () => {
          const N = '관장 리안';
          if (flag('badge2')) { await say('수조에서 기다릴게. 잔물타기 강습, 잊지 마!', N); return; }
          await say('수문을 고쳐 줘서 고마워. 나는 물울림 체육관 관장 리안.\n물길과 소리가 함께 울리는 법, 그리고 흐름이 바뀔 때 바꿔 타는 법을 가르치지.', N);
          await say('졸음과 상태이상에 어떻게 대응하는지 보여 줘!', N);
          const won = await G.battle.trainer({ flag: 'badge2', title: '관장', name: '리안', char: 'rian', smart: true, potion: true, iv: 12, prize: 2000,
            lead: { ullimpong: 'yawn' },
            team: [['muljjori', 18, ['splash', 'butt', 'bubble']], ['ullimpong', 20, ['yawn', 'aquaring', 'echo', 'bubble']]],
            lose: '...흐름을 읽었구나. 노래가 끝나기 전에 바꿔 탄 판단, 멋졌어.' });
          if (!won) { await say('지쳤으면 센터에서 쉬고 다시 와. 재도전은 언제든 무료야.\n졸음이 오면 잠들기 전에 교체하는 걸 떠올려 봐.', N); return; }
          await say('물울림 체육관의 인증, 물울림배지야.', N);
          G.audio && G.audio.jingle('badge');
          await say(`${P()}${G.josa(P(), '은', '는')} 관장 리안에게서 물울림배지를 받았다!`);
          await give('tm_pulse', 1);
          await say('물결탄 교본이야. 빗나가지 않는 물 공격이지. 몇 번이고 가르칠 수 있어.', N);
          await give('ticket', 1);
          await say('그리고 잔물타기 강습권! 체육관 옆 안전 수조로 와. 물판 타는 법을 알려 줄게.', N);
          await say('...아, 수문연구소에서 연락이 왔어. 다른 지역 공사 현장도 조사해 달래.\n소리가 연구소에서 자세히 알려 줄 거야.', N);
        } }],
    onEnter: async () => {
      if (!G.S.tiles || !G.S.tiles.gym2) { chan(8, flag('gA')); chan(4, !flag('gB')); }
    }
  };

  // ------------------------------------------------------------ R06 물안개 산책길 and 수문연구소
  M.mistwalk = {
    name: '물안개 산책길', kind: 'out', bgm: 'route', rows: ROWS.mistwalk,
    buildings: [{ k: 'lab', x: 8, y: 6, w: 8, h: 4, roof: 'teal', wall: '#eef4f4', label: '수문연구소' }],
    warps: [{ x: 11, y: 9, to: 'sluicelab', tx: 5, ty: 6, dir: 'up' }, { x: 12, y: 9, to: 'sluicelab', tx: 6, ty: 6, dir: 'up' }],
    links: { s: { to: 'mulullim', dx: 0 } },
    waterLine: '연꽃이 떠 있는 연못이다. 가운데 작은 섬에 무언가 놓여 있다.\n잔물타기를 익히면 건너가 볼 수 있을 것 같다.',
    items: [{ id: 'leafstone', x: 12, y: 2, flag: 'rv_lotus' }, { id: 'clue', x: 13, y: 2, flag: 'rv_clue' }, { id: 'awake', x: 3, y: 27, flag: 'mw_awake' }],
    npcs: [
      { id: 'mw1', char: 'kidA', x: 9, y: 22, dir: 'left', sight: 2,
        trainer: { flag: 'tr_mw1', title: '식물 관찰가', name: '새봄', char: 'kidA', team: [['ipppuri', 15], ['bangulssak', 15]], base: 20,
          before: '그늘 풀숲엔 잎뿌리, 물가엔 방울싹! 둘 다 보여 줄게!', lose: '잎뿌리가 고개를 숙였어...',
          after: '물쫄이 상대로는 잎뿌리랑 방울싹의 풀 기술이 잘 통해. 리안 관장님 상대로 준비해 봐!' } },
      { id: 'mw2', char: 'woman', x: 14, y: 11, dir: 'down', sight: 3,
        trainer: { flag: 'tr_mw2', title: '산책 아가씨', name: '이슬', char: 'woman', team: [['solgae', 16], ['dorekong', 16]], base: 22,
          before: '물안개 속 산책엔 승부가 제격이죠!', lose: '안개가 걷히는 것처럼 시원하게 졌네요.',
          after: '꿈도치는 여기서도 드물게 보여요. 낯선 기척이 오면 잠든 채 사라져 버리죠.' } }],
    onEnter: async () => { visit('mistwalk'); }
  };
  M.sluicelab = {
    name: '수문연구소', kind: 'in', bgm: 'water',
    rows: ['#W###W###W##', 'BBBB.PP.BBBB', '............', '............', '...tttt.....', '............', '.....xx.....'],
    warps: [{ x: 5, y: 6, to: 'mistwalk', tx: 11, ty: 10, dir: 'down' }, { x: 6, y: 6, to: 'mistwalk', tx: 12, ty: 10, dir: 'down' }],
    objects: {
      '3,4': async () => say('수문 기록판이다. "저수로 2번 밸브 — 외부 공명 장치 연결 후 오작동" 이라고 적혀 있다.'),
      '0,1': async () => F().surveyBoard('연구소 게시판')
    },
    npcs: [
      { id: 'sori_lab', char: 'sori', x: 8, y: 3, dir: 'down', name: '소리', cond: () => flag('q09_met'),
        talk: async () => {
          const N = '소리';
          if (!flag('q09_lab')) {
            await say('와 줬군요! 기록을 같이 보니 확실해요. 저수로 핵심 밸브에서 부품이 빠졌어요.\n새길상회 현장감독이 공명 장치를 달면서 빼 간 거예요.', N);
            await say('저수로는 도시 남동쪽 수문 관리소 계단으로 내려가요. 마른 발판과 계단으로만 이어져 있어서\n물길 기술은 필요 없어요. 덩굴 정리와 바위 밀기면 충분해요!', N);
            await say('밸브 부품을 찾아서 핵심 밸브에 다시 끼우면 수문이 돌아올 거예요. 관리소에 연락해 둘게요!', N);
            set('q09_lab');
            return;
          }
          if (!flag('q09')) { await say('저수로 핵심 밸브는 계단 위 밸브실에 있어요. 부품은 덩굴 너머 서쪽 발판 어딘가에...', N); return; }
          if (!flag('badge2')) { await say('수문이 돌아왔어요! 리안 관장도 체육관을 다시 열었대요. 도전해 봐요!', N); return; }
          if (!flag('ch2_req')) {
            set('ch2_req');
            await say(`물울림배지까지! ${P()}, 연구소에서 정식으로 부탁할게요.`, N);
            await say('새길상회 공사 현장이 다른 지역에도 있어요. 공명석 채굴이 대륙의 길을 하나씩 끊고 있는지도 몰라요.\n동쪽 수문 너머에서부터 조사를 이어 가 줄래요?', N);
            await say('연구소 뒤 연꽃섬에 다음 지역 지도 단서를 묻어 뒀다는 옛 기록도 있어요. 잔물타기를 익히면 한번 가 봐요!', N);
            return;
          }
          await say('동쪽 수문 너머가 다음 조사지예요. 준비되면 언제든!', N);
        } },
      { id: 'exch', char: 'clerk', x: 2, y: 5, dir: 'right', name: '연구소 교환소',
        talk: async () => {
          const N = '연구소 교환소';
          if (!flag('badge2')) { await say('공명 광물 교환소예요. 두 번째 배지를 받은 길지기에게만 열어요.\n달빛돌, 충전돌, 잎숨돌... 지역마다 성질이 다른 공명 광물이랍니다.', N); return; }
          await F().exchange(N);
        } },
      { id: 'tutor_lab', char: 'harang', x: 9, y: 5, dir: 'left', name: '기술 상담 연구원', noTurn: true,
        talk: async () => {
          await say('진화석, 그러니까 공명 광물은 몬스터 몸속 울림과 공명해서 새로운 모습을 열어 줘요.\n모든 몬스터가 광물로 진화하는 건 아니고, 자라면서 몸이 바뀌는 아이들도 많죠.', '기술 상담 연구원');
          await F().centerService('기술 상담 연구원');
        } }]
  };

  // ------------------------------------------------------------ 저수로: platforms, one vine, two stones, the main valve
  M.reservoir = {
    name: '물울림 저수로', kind: 'cave', theme: 'works', bgm: 'cave', rows: ROWS.reservoir,
    boulders: [{ id: 'R1', x: 12, y: 9 }, { id: 'R2', x: 9, y: 10 }],
    warps: [{ x: 2, y: 15, to: 'sluicehouse', tx: 1, ty: 1, tdir: 'right' }],
    items: [{ id: 'valvepart', x: 2, y: 7, flag: 'q09_part' }, { id: 'superpotion', x: 23, y: 10, flag: 'rs_spotion' }],
    objects: {
      '10,5': async () => {
        await say('점검 표지판: "가운데 수로 틈은 둥근 돌 두 개로 메울 수 있음. 돌이 엉키면 이 표지판에서 처음으로."');
        const ok = await G.ask('둥근 돌을 처음 자리로 되돌릴까?');
        if (ok) await F().resetPuzzle();
      },
      '22,2': async () => {
        if (flag('q09')) { await say('핵심 밸브가 고르게 돌아가고 있다.'); return; }
        if (!flag('tr_boss')) { await say('핵심 밸브에 새길상회의 공명 장치가 덕지덕지 붙어 있다.'); return; }
        if (!G.S.bag.valvepart) { await say('핵심 밸브에 부품 하나가 빠져 있다. 저수로 어딘가에 떨어져 있을 것이다.'); return; }
        const ok = await G.ask('공명 장치를 떼어 내고 밸브 부품을 끼울까?');
        if (!ok) return;
        D().useItem('valvepart');
        G.audio && G.audio.sfx('knock2');
        await F().play(60, (T, cx, cy, k) => { T.fillStyle = `rgba(120,190,250,${0.5 * (1 - k)})`; T.fillRect(0, 0, 256, 192); });
        set('q09');
        await say('밸브가 묵직하게 돌아가자, 저수로 전체에 고른 물소리가 울려 퍼졌다!');
        await say(`${P()}! 수문이 돌아왔어. 물소리가 고르게 들려... 정말 고마워.\n체육관도 다시 열게. 준비되면 도전하러 와!`, '관장 리안');
        await say('밸브실 공명 장치에서 떼어 낸 달빛돌이에요. 장치에 쓰이던 거라 연구소 기록만 하고 돌려줄게요.\n덤불토나 도레콩처럼 달빛에 반응하는 동료가 있다면 써 봐요!', '수문연구소 소리');
        await give('moonstone', 1);
        set('q09_moon');
        Wd().respawn();
      }
    },
    npcs: [
      { id: 'rest_r', char: 'worker', x: 6, y: 15, dir: 'left', name: '수문 관리원',
        talk: async () => {
          const N = '수문 관리원';
          await say('저수로는 길어요. 여기서 잠깐 쉬어 가요. 따뜻한 차도 있어요.', N);
          await G.menus.heal();
          await say(flag('q09') ? '수문이 고르게 돌아가요. 고마워요!' : '감독은 위층 밸브실에 있어요. 가운데 수로 틈은 둥근 돌 두 개로 메울 수 있대요.', N);
        } },
      { id: 'rw1', char: 'worker', x: 18, y: 8, dir: 'left', sight: 3,
        trainer: { flag: 'tr_rw1', title: '새길상회 일꾼', name: '철민', char: 'worker', team: [['moraekong', 16], ['gwibami', 16]], base: 24,
          before: '감독님이 아무도 들이지 말랬어!', lose: '...감독님은 위층 밸브실에 계셔.', after: '물길을 막으면 운송이 빨라진다고 했는데... 도시가 이렇게 될 줄은 몰랐어.' } },
      { id: 'boss', char: 'boss', x: 21, y: 3, dir: 'down', sight: 2,
        trainer: { flag: 'tr_boss', title: '새길상회 현장감독', name: '마상철', char: 'boss', team: [['ttoari', 16], ['jagalkong', 16], ['gwibami', 17]], base: 30, prize: 1800,
          before: '길지기 꼬마가 여기까지? 공명 장치가 있으면 물길도 마음대로 열고 닫을 수 있어.\n운송이 빨라지면 다들 좋아할 거다. 비켜!', lose: '...장치가 망가졌군. 일정이 또 밀리겠어.',
          after: '상회 본사는 대륙 곳곳에 길을 낸다. 이건 시작일 뿐이야.',
          afterWin: async () => {
            await say('...좋아, 오늘은 물러나지. 하지만 대륙에는 새 길이 필요하다는 생각은 변하지 않아.\n본사 계획서는 이미 다른 지역으로 넘어갔다.', '현장감독 마상철');
            await say('현장감독은 공명 장치 일부를 챙겨 저수로를 빠져나갔다.\n이제 핵심 밸브에 부품을 끼울 수 있다.');
            const b = Wd().npc('boss'); if (b) b.hidden = true;
          } } }],
    onEnter: async () => { visit('reservoir'); if (!flag('rs_seen')) { set('rs_seen'); await G.wait(10); await say('젖은 돌 냄새가 가득한 저수로다. 발판과 계단이 수로 사이로 이어져 있다.'); } }
  };
})();

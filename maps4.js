/* 모아루: 잠든 길의 노래 — chapter 2 world, part 1: 갈대여울 → 돛바람항(세 번째 관장전) · 항구 뒤 들길 · 조수만 데크 · 옛 운송 갱도 · 등대 동력실 · 바람등성이
   (layouts come from _mapgen4.py; the rows are pasted in by the build) */
'use strict';
(function () {
  const G = window.G, M = G.MAPS, H = G.mapHelpers;
  const { flag, set, say, give, P } = H;
  const Wd = () => G.world, D = () => G.data, F = () => G.field;
  const visit = id => { G.S.visited = G.S.visited || {}; G.S.visited[id] = 1; };
  const num = k => (G.S.flags[k] | 0);
  const sfx = n => G.audio && G.audio.sfx(n);
  const ROWS = {
    reedford: [
      'TTTTTTTTwwwwwwwTTTTTTTTwwwwwwwwwwwTTTTTTTTTT',
      'TTTTTTTTwwwwwwwTTTTTTTTwwwwwwwwwwwTTTTTTTTTT',
      'T.......wwwwwww........wwwwwwwwwww.........T',
      'Tjjjjj..wwwwwww.jjjjjj.wwwwssswwww.jjj..zzzT',
      'Tjjjjj..wwwwwww.jjjjjj.wwwwssswwww.jjj=.zzzT',
      'Tjjjjj..wwwwwww.jjjrjj.wwwwssswwww.jjj=.zzzT',
      'T.......wwwwwww........wwwwwdwwwww.jjj=..K.T',
      'T..S....wwwwwwwt.......wwwwwwwwwww....=....T',
      '=======dwwwwwwwt======.wwwwwwwwwww....=....T',
      'T.......wwwwwwwt.....=.wwwwwwwwwwwt...=...ST',
      'T.......wwwwwww......=dwwwwwwwwwwwt=========',
      'Tzzzz...wwwwwww........wwwwwwwwwwwt.........',
      'Tzzzz..hwwwwwww..zzzzz.wwwwwwwwwww.....zzzzT',
      'Tzzzz...wwwwwww..zzzzz.wwwwwwwwwwwh....zzzzT',
      'Tzzzz...wwwwwww..zzzzz.wwwwwwwwwww.....zzzzT',
      'T.......wwwwwww........wwwwwwwwwww.........T',
      'TTTTTTTTwwwwwwwTTTTTTTTwwwwwwwwwwwTTTTTTTTTT',
      'TTTTTTTTwwwwwwwTTTTTTTTwwwwwwwwwwwTTTTTTTTTT'],
    harbor: [
      'Tc==cccccccccccccccc===ccccccccccccccccccccc',
      'Tc==cccccccccccccccc===ccccccccccccccccccccc',
      'T.==.##########.....cJc...........c..#####cc',
      'T.==.##########......=............c..#####cc',
      'T.==.##########......=............c..##D##cc',
      'T.==.##########......=............ccccctcccc',
      'T.==.................=............ccccctcccc',
      'T==========================================c',
      'T.........=......#######.######.=..........c',
      'T.######..=#####.#######.######.=.l......l.c',
      'T.######..=#####.#######.######.=..........c',
      'T.######..=#####.#######.##D###.=....S.....c',
      'T.##DD##..=##D##.###D###.GJGGJG.=..........c',
      'T==========================================c',
      'T.........=.....................=..........c',
      'T.#####...=.########............=.######...c',
      'T.#####...=.########..#######...=.######...c',
      'T.##D##...=.########..#######...=.######...c',
      '===========.########..#######...=.##D###...c',
      '==........=.########..###D###...=..........c',
      'T.#####...=.###DD###............=.......====',
      'T.#####...=.....................=.......====',
      'T.##D##...=================================G',
      'TGGGGGlGGGGGGGGGGlGGGGGGbbGGGGGGGGGGlGGGGGGG',
      'TGGGGGGGGGGGGGGGGGGSGGGGGGGGGGGKGGGGGGGGGGGG',
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
      'OOOOOOOOddOOOOOOOOOOddOOOOOOOOdddddddddddOOO',
      'OOOOOOOOddOOOOOOOOOOddOOOOOOOOdOOOOOOOOOdOOO',
      'OOOOOOOOddOOOOOOOOOOdhOOOOOOOOdOOOOOOOOOdOOO',
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOdOOOOOOOOOdOOO',
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOdddddddddddOOO',
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO'],
    backfield: [
      'ccccTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'cccczzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzT',
      'cccczz.....zzzzzzzzzzz......zzzzzzzT',
      'cccczz..y..zzzzzzzzzzz..E...zzzzzzzT',
      'cccczz.....zzzzzzzzzzz......zzzzzzzT',
      'cccc.......zzzzzzzzzzz.b..b.zzzzzzzT',
      'ccmV...zzzzzzzzzzKzzzzzzzzzzzzzzzzzT',
      'cccc...zzzzzzzzzzzzzzzzzzzzzzzSzzzzT',
      'cccc==============================zT',
      'cccczzzzzzzzzzzzzzzzzzzzzzzzzzzz==zT',
      'cccczzzzzzzzCCCC..CCCCzzzzzz...z==zT',
      'cccczzzzzzzzC........Czzzzzz...z==zT',
      'cccczzzzzzzzC........Czzzzzz...z==zT',
      'cccczzzzzzzzCCCCCCCCCCzzzzzz...z==zT',
      'cccczzzzzzzzzzzzzzzzzzzzzzzzzzzz==zT',
      'ccccTTTTTTTTTTTTTTTTTTTTTTTTTTTT==TT'],
    tidedeck: [
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
      'OOOOOOOOOOOOOOOOdddddddddOOOOO',
      'OOOOOOOOOOOOOOOOOiOddOOiOOOOOO',
      'OOOOOOOOOOOOOOOOOOOddOOOOOOOOO',
      '.S..OOOOiOOOOOiOOOOddOOOOrrrrO',
      '====dddddddddddddddddddOOrssrO',
      '====dddddddddddddddddddOOrssrO',
      '....OOOOOiOOddOOiOOOOOOOOrssrO',
      'OOOOOOOOOOOOddOOOOOOOOOOOrssrO',
      'OOOOOOOOOOOOddOOOOOOOOOOOrrrrO',
      'OOOOOOOOOOOOddOOOOOOiOOOOOOOOO',
      'OOOOOOOOOOOOdddddddddddOOOOOOO',
      'OOOOOOOOOOOOdddddddddddOOOOOOO',
      'OOOOOOOOOOOOOOOOOiOOOiOOOOOOOO',
      'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO'],
    oldmine: [
      '################################',
      '#______##########_c____#########',
      '#______##########_c____#########',
      '#______Xccccccccccc____#########',
      '#______###########cY############',
      '#______###########c.........####',
      '##################c.......Y.####',
      '##################c..r......####',
      '##################cY........___#',
      '##################ccccccccccc__x',
      '####Y#############c.........___#',
      'x___..,,....______c.....r...####',
      '####..,,....______c.........####',
      '##################c.........####',
      '##################c#############',
      '#########_________c#############',
      '#########____r____##############',
      '#########_________##############',
      '################################',
      '################################'],
    lh1: [
      '####################',
      '####################',
      '##___Y____Y____Y__##',
      '##________________##',
      '##......__........##',
      '##......__......S.##',
      '##......__________H#',
      '##......__.......__#',
      '##..r...__........##',
      '##......__....r...##',
      '##......__........##',
      '##......____......##',
      '########____########',
      '#########xx#########'],
    lh2: [
      '######################',
      '######################',
      '##..........___.....##',
      '##.........u___...H.##',
      '##................_.##',
      '##................_.##',
      '##......_______..._.##',
      '##......_______..r_.##',
      '##......_______..._.##',
      '##......_______..._.##',
      '##......_______..._.##',
      '##________________..##',
      '##____..........S...##',
      '##_H__..............##',
      '######################',
      '######################'],
    lh3: [
      '########################',
      '########################',
      '##__________________####',
      '##__________________A_##',
      '##__..............__####',
      '##__......kkkk....__####',
      '##__......kkkk....__####',
      '##__......kkkk....__####',
      '##__..............__####',
      '##__..............__####',
      '##__________________####',
      '##_H________________####',
      '########################',
      '########################'],
    ridge: [
      'cccccccccccccccccccccccccc',
      'ccccccccccccccccccmccccccc',
      'ccccccccccccccc..S....cccc',
      'ccccccccccccccczz.....cccc',
      'ccccccccccccccczz.....cccc',
      'ccccccccccccccc.......cccc',
      'cccccccccccccccccI=Icccccc',
      'cccccccccccccccccI=Icccccc',
      'cccccccccccccccccI=Icccccc',
      'cccccccccccccccccIJIcccccc',
      'cccccccccccccccccI=Icccccc',
      'cccccccccccccccccI=Icccccc',
      'ccccccccccc========ccccccc',
      'ccccccccccc=czzzzzzccccccc',
      'ccccccccccc=czzzzzzccccccc',
      'ccccccccccc=czzzzzzccccccc',
      'ccccccccccc=cccczzzccccccc',
      'ccccccccccc=cccczzzccccccc',
      'ccccccccccc=cccczzzccccccc',
      'cccc#####..=..........cccc',
      'cccc#####..=.zzzzzzzz.cccc',
      'cccc##D##..=.zzzzzzzz.cccc',
      'cccc.......=.zzzzzzzz.cccc',
      'cccc.......=.zzzzzzzz.cccc',
      'cccc..K....=..........cccc',
      'cccc.......=..........cccc',
      'ccccccccccc=cccccccccccccc',
      'ccccccccccc=cccccccccccccc',
      'cccccczzzzz=zzzzzzzzcccccc',
      'cccccczzzzz=zzzzzzzzcccccc',
      'cccccczz...=zzzzzzzzcccccc',
      'cccccczz...=zzz....zcccccc',
      'cccccczz...=zzz....zcccccc',
      'cccccczz...=zzz....zcccccc',
      'cccccczzzzz=zzzzzzzzcccccc',
      'cccccczzzzz=zzzzzzzzcccccc',
      'ccccccccccc=Sccccccccccccc',
      'cccccccccc===ccccccccccccc',
      'cccccccccc===ccccccccccccc',
      'cccccccccc===ccccccccccccc']
  };
  const STOCK2 = () => ['potion', 'superpotion', 'hyperpotion', 'antidote', 'parlyz', 'awake', 'revive', 'cube', 'goldcube', 'rope'];
  H.STOCK2 = STOCK2;
  // teach a field skill to the first able party member (then the box), or lend a support companion
  H.teachOrLend = async (sk, loan, N) => {
    const all = G.S.party.concat(G.S.box);
    const lead = G.S.party.find(m => F().canLearn(m, sk)) || all.find(m => F().canLearn(m, sk));
    set('f_' + sk);
    if (lead) { F().teach(lead, sk); G.audio && G.audio.jingle('learn'); await say(`${G.eun(D().nameOf(lead))} 탐험 기술 [${F().SKILLS[sk].n}]${G.josa(F().SKILLS[sk].n, '을', '를')} 익혔다!`); return lead; }
    G.S.loans = G.S.loans || {}; G.S.loans[sk] = loan;
    await say(`지원 ${D().MONS[loan].n}${G.josa(D().MONS[loan].n, '이', '가')} ${P()}의 [${F().SKILLS[sk].n}]${G.josa(F().SKILLS[sk].n, '을', '를')} 맡아 주기로 했다!\n(지원 동료는 전투와 교환에는 나서지 않는다)`, N);
    return null;
  };

  // ------------------------------------------------------------ chapter 2 begins at 물울림 east gate (after the chapter 1 credits)
  H.kickoff2 = async () => {
    if (flag('q11_start')) return;
    const N = '수문연구소 소리';
    set('q11_start');
    await say('...헉, 헉. 다행이다, 아직 출발 전이었네요!', N);
    await say('연구소에서 정식 조사 의뢰서를 준비했어요. 동굴과 수문에 쓰인 새길상회 장비는\n전부 돛바람항 운송망을 거쳐 들어왔대요.', N);
    await give('request', 1, true); await give('equipcopy', 1, true);
    await say(`${P()}${G.josa(P(), '은', '는')} 새 조사 의뢰서와 장비 표식 사본을 받았다!`);
    await say('이 의뢰서를 돛바람항 항만소에 전해 줄래요? 수문 너머 갈대여울을 지나면 바로 항구예요.\n잔잔한 수로 두 곳은 물판으로 건너면 되고, 내리는 곳은 밝은 돌계단으로 표시돼 있어요.', N);
    await say('항구는 넓으니까 항만소에서 안내도를 받으면 다니기 편할 거예요. 조심히 다녀와요!', N);
  };

  // ------------------------------------------------------------ R07 갈대여울
  M.reedford = {
    name: '갈대여울', kind: 'out', bgm: 'route', rows: ROWS.reedford,
    links: { w: { to: 'mulullim', dy: 6, gated: 1 }, e: { to: 'harbor', dy: 8 } },
    waterLine: '잔잔한 수로다. 물판을 펼치면 건널 수 있을 것 같다.\n(배우는 곳: 물울림 체육관 · 리안의 강습)',
    signs: {
      '3,7': '갈대여울\n▶ 동쪽: 돛바람항  ◀ 서쪽: 물울림시\n"물판에서 내리는 곳은 밝은 돌계단입니다"',
      '42,9': '◀ 갈대여울 · 돛바람항 ▶\n"항구에 오시면 항만소에서 안내를 받으세요"'
    },
    items: [{ id: 'berry', n: 3, x: 27, y: 4, flag: 'rf_berry' }, { id: 'fieldlog', x: 29, y: 4, flag: 'rf_log' }, { id: 'potion', x: 2, y: 13, flag: 'rf_potion' }],
    npcs: [
      { id: 'rf_guide', char: 'sailor', x: 6, y: 9, dir: 'up', name: '물길 안내인',
        text: () => flag('fx_ripple') ? '첫 수로는 곧게 건너면 돼. 건너편 밝은 돌계단에 닿으면 저절로 내린다네.\n두 번째 수로는 갈래가 있어. 북쪽 작은 섬에 들렀다 가도 좋고!' : '물판을 펼치려면 선착장 끝에서 물을 바라보고 A 버튼이지.\n건너편 밝은 돌계단에 닿으면 저절로 내린다네.' },
      { id: 'rf1', char: 'fisher', x: 19, y: 10, dir: 'up', sight: 2,
        trainer: { flag: 'tr_rf1', title: '낚시꾼', name: '상구', char: 'fisher', team: [['mulkkori', 18], ['meongburi', 19]], base: 20,
          before: '갈대여울 수로는 물고기가 많아! 몬스터도 많고!', lose: '물살보다 네가 더 빠르구먼.',
          after: '멍부리는 물가 갈대를 쪼아 먹고, 물꼬리는 바위 그늘에서 쉬지. 사는 곳을 보면 성격이 보여.' } },
      { id: 'rf2', char: 'swimmer', x: 37, y: 12, dir: 'up', sight: 2,
        trainer: { flag: 'tr_rf2', title: '수영 소녀', name: '하늬', char: 'swimmer', team: [['dungjami', 19], ['kkubeokyang', 20]], base: 20,
          before: '여기까지 물판 타고 왔어? 나랑도 한판!', lose: '와, 물판 실력만큼 승부도 잘하네!',
          after: '항구에 가면 해양학교가 있어. 언젠가 바다에서도 물판을 탈 수 있대!' } }],
    onEnter: async () => { visit('reedford'); }
  };

  // ------------------------------------------------------------ M04 돛바람항
  // the public coastal ferry (after Q13): harbor pier <-> 물울림 south quay
  H.coastFerry = async (toHarbor) => {
    const N = '연안 나룻배 사공';
    if (!flag('q13')) { await say('등대가 꺼진 뒤로는 배가 접안을 못 해요. 등대가 다시 켜지면\n물울림시까지 무료로 모셔 드릴게요!', N); return; }
    const ok = await G.ask(toHarbor ? '연안 나룻배로 돛바람항까지 갈까요? 무료예요!' : '연안 나룻배로 물울림시 남쪽 선착장까지 갈까요? 무료예요!', ['갈게요', '괜찮아요'], { name: N });
    if (!ok) return;
    sfx('water');
    await G.fadeTo(1, 20);
    if (toHarbor) Wd().enter('harbor', 9, 25, 'up', { quiet: false }); else Wd().enter('mulullim', 6, 14, 'down');
    await G.fadeTo(0, 20);
    await say(toHarbor ? '바다 바람을 가르며 돛바람항 부두에 닿았다.' : '잔잔한 연안을 따라 물울림시 선착장에 닿았다.');
  };
  // the union coach (after Q19): between the towns of chapter 2
  H.coach = async (here) => {
    const N = '연합마차 마부';
    if (!flag('badge4')) { await say('연합마차는 잎향배지를 받은 길지기부터 탈 수 있어요.\n정원도시와 항구, 기억나루를 잇는 무료 마차랍니다.', N); return; }
    const STOPS = [{ k: 'harbor', n: '돛바람항', map: 'harbor', x: 12, y: 23, dir: 'down' }, { k: 'memory', n: '기억나루', map: 'memory', x: 19, y: 17, dir: 'down' }, { k: 'leafhyang', n: '잎향시', map: 'leafhyang', x: 18, y: 13, dir: 'down' }]
      .filter(s => s.k !== here && (G.S.visited || {})[s.k]);
    if (!STOPS.length) { await say('아직 다른 정류장을 다녀온 적이 없네요.', N); return; }
    const L = await G.say('어디로 모실까요? 연합마차는 무료예요!', { name: N, keep: true });
    const c = await G.choose(STOPS.map(s => s.n).concat(['괜찮아요']), { title: '연합마차', cancel: STOPS.length });
    G.closeText(L);
    if (c < 0 || c >= STOPS.length) return;
    const s = STOPS[c];
    sfx('door');
    await G.fadeTo(1, 20);
    Wd().enter(s.map, s.x, s.y, s.dir);
    await G.fadeTo(0, 20);
  };
  const LIT = () => flag('q13');
  M.harbor = {
    name: '돛바람항', kind: 'out', bgm: 'town', rows: ROWS.harbor,
    buildings: [
      { k: 'house', x: 5, y: 2, w: 5, h: 4, roof: 'orange', wall: '#efe0c4', label: '창고' },
      { k: 'house', x: 10, y: 2, w: 5, h: 4, roof: 'orange', wall: '#efe0c4' },
      { k: 'center', x: 2, y: 9, w: 6, h: 4, roof: 'red', wall: '#fbf6ee' },
      { k: 'shop', x: 11, y: 9, w: 5, h: 4, roof: 'blue', wall: '#f4f6fa' },
      { k: 'house', x: 17, y: 8, w: 7, h: 5, roof: 'navy', wall: '#eef2f6', label: '항만소' },
      { k: 'house', x: 25, y: 8, w: 6, h: 4, roof: 'orange', wall: '#f2e6d0', label: '공방' },
      { k: 'house', x: 2, y: 15, w: 5, h: 3, roof: 'teal' },
      { k: 'house', x: 2, y: 20, w: 5, h: 3, roof: 'blue' },
      { k: 'gym', x: 12, y: 15, w: 8, h: 6, roof: 'navy', wall: '#eef0f4', wallH: 40, emblem: 'bolt' },
      { k: 'house', x: 22, y: 16, w: 7, h: 4, roof: 'blue', wall: '#f4f8fc', label: '해양학교' },
      { k: 'house', x: 34, y: 15, w: 6, h: 4, roof: 'teal', wall: '#eef6f6', label: '조수연구소' },
      { k: 'tower', x: 37, y: 2, w: 5, h: 3 }],
    props: [{ k: 'crane', x: 27, y: 24 }, { k: 'crates', x: 23, y: 24 }, { k: 'crates', x: 15, y: 6 }, { k: 'boat', x: 6, y: 27 }],
    blocks: [{ x: 27, y: 24 }, { x: 28, y: 24 }, { x: 23, y: 24 }, { x: 15, y: 6 },
      { x: 15, y: 20, cond: () => !LIT() }, { x: 16, y: 20, cond: () => !LIT() }],
    warps: [
      { x: 4, y: 12, to: 'center_h', tx: 5, ty: 6, dir: 'up' }, { x: 5, y: 12, to: 'center_h', tx: 6, ty: 6, dir: 'up' },
      { x: 13, y: 12, to: 'shop_h', tx: 4, ty: 5, dir: 'up' },
      { x: 20, y: 12, to: 'hb_office', tx: 5, ty: 6, dir: 'up' },
      { x: 27, y: 11, to: 'workshop', tx: 5, ty: 6, dir: 'up' },
      { x: 4, y: 17, to: 'house_h1', tx: 3, ty: 5, dir: 'up' }, { x: 4, y: 22, to: 'house_h2', tx: 3, ty: 5, dir: 'up' },
      { x: 15, y: 20, to: 'gym3', tx: 7, ty: 15, dir: 'up' }, { x: 16, y: 20, to: 'gym3', tx: 7, ty: 15, dir: 'up' },
      { x: 25, y: 19, to: 'school', tx: 5, ty: 6, dir: 'up' },
      { x: 36, y: 18, to: 'tidelab', tx: 5, ty: 6, dir: 'up' },
      { x: 39, y: 4, to: 'lh1', tx: 9, ty: 12, dir: 'up', tdir: 'up' }],
    links: {
      w: { to: 'reedford', dy: -8 },
      n: [{ to: 'backfield', from: 0, until: 9, dx: 30 }, { to: 'ridge', from: 15, until: 25, dx: -10 }],
      e: { to: 'tidedeck', dy: -14 },
      s: { to: 'searoute', dx: -10, gated: 1, cond: () => flag('q20') }
    },
    seaLine: '파도가 출렁이는 항구 앞바다다. 경고 부표 너머는 배가 다니는 항로다.\n바다 항로는 해양학교의 파도타기 강습과 외해 항로도가 있어야 나갈 수 있다.',
    signs: {
      '19,24': '돛바람항 부두\n◀ 연안 나룻배 선착장   해양학교 안전 수조 ▶\n"낚시는 가운데 잔교 끝에서"',
      '37,11': '돛바람 등대\n"자기축 점검 중 — 관계자 외 출입 금지"'
    },
    objects: {
      '15,20': async () => { if (!LIT()) await say('체육관 문이 잠겨 있다.\n"등대 전력 복구 후 다시 문을 엽니다 — 관장 단우"'); },
      '16,20': async () => { if (!LIT()) await say('체육관 문이 잠겨 있다.\n"등대 전력 복구 후 다시 문을 엽니다 — 관장 단우"'); }
    },
    onSmash: async (x, y) => {
      if (y !== 12 || (x !== 26 && x !== 29) || !flag('q15_start') || flag('q15')) return;
      const left = [26, 29].filter(X => Wd().getMap('harbor').at(X, 12) === 'J').length;
      if (left) { await say('잘했어! 금을 따라 힘을 모으면 작은 바위는 깔끔하게 갈라져. 하나 더!', '공방장 무쇠'); return; }
      set('q15');
      await say('둘 다 깔끔하게 치웠군! 이제 바람등성이 낙석도 문제없어.', '공방장 무쇠');
      await say('그리고 이건 우리 공방 탐굴사가 그린 바람등성이 탐굴도야.\n산길 방향이랑 터널 입구, 대피소만 대충 그려 뒀어. 터널 속 샛길은 직접 걸으며 채워!', '공방장 무쇠');
      await give('map05', 1);
      await say('(메뉴의 [지도]에 바람등성이 일대가 더해졌다)');
      await say('항구 북쪽 길을 막은 낙석부터 치우고 올라가 봐. 그 위가 바위울림터널이야.', '공방장 무쇠');
    },
    npcs: [
      { id: 'hb_greet', char: 'sailor', x: 8, y: 19, dir: 'left', name: '항구 안내원',
        text: () => flag('q12') ? '등대 점검은 항만소 정비사 세나가 맡고 있어요. 등대는 동쪽 절벽 위예요!' : '돛바람항에 어서 와요! 항만소는 큰길 한가운데 남색 지붕 건물이에요.\n센터와 상점은 그 서쪽이고요.' },
      { id: 'hb_guard', char: 'sailor', x: 39, y: 6, dir: 'down', name: '등대 관리원', cond: () => !flag('q13_start'),
        text: () => flag('q12') ? '정비사 세나 님이 등대 앞에서 기다리고 계세요. 같이 올라가세요!' : '등대 구역은 자기축 점검 중이라 닫혀 있어요.\n항만소에서 먼저 안내를 받아 주세요.' },
      { id: 'sena_h', char: 'sena', x: 40, y: 7, dir: 'left', name: '정비사 세나', cond: () => flag('q12') && !flag('q13_start'),
        talk: async () => {
          const N = '정비사 세나';
          await say(`네가 ${P()}구나! 항만소장님한테 얘기 들었어. 나는 등대 정비사 세나야.`, N);
          await say('등대 자기축이 흔들려서 배들이 접안을 못 해. 전기 동료들도 자꾸 몰려들고.\n동력실을 같이 점검해 줄래? 이 절연 장갑이랑 덧신을 빌려줄게.', N);
          await give('kit', 1);
          await say('전기 몬스터가 없어도 괜찮아. 레버랑 받침돌, 축 방위만 맞추면 되거든.\n먼저 올라가 있을게. 계단 위 등대 문으로 들어와!', N);
          set('q13_start');
          Wd().respawn();
        } },
      { id: 'sena_p', char: 'sena', x: 38, y: 8, dir: 'down', name: '정비사 세나', cond: () => flag('q13'),
        talk: async () => {
          const N = '정비사 세나';
          const all = G.S.party.concat(G.S.box), apt = all.find(m => F().canLearn(m, 'magnet'));
          if (apt && !all.some(m => F().knows(m, 'magnet'))) {
            const ok = await G.ask(`${G.eun(D().nameOf(apt))} 나침돌 계열이구나! 자력 맞춤을 가르쳐 줄까?\n등대 난간의 작은 자성 자물쇠 같은 데 쓰는 기술이야.`, ['배울래', '나중에'], { name: N });
            if (ok) { set('f_magnet'); F().teach(apt, 'magnet'); G.audio && G.audio.jingle('learn'); await say(`${G.eun(D().nameOf(apt))} 탐험 기술 [자력 맞춤]을 익혔다!`); }
            return;
          }
          if (flag('f_magnet')) { await say('등대가 다시 돌아. 자력 맞춤으로 관측 난간 자물쇠도 열어 봐!', N); return; }
          await say('등대가 켜지니 항구가 살아나는 것 같아. 고마워!\n나침돌 계열 동료가 생기면 와. 자력 맞춤을 무료로 가르쳐 줄게.', N);
        } },
      { id: 'hb_gymg', char: 'man', x: 14, y: 21, dir: 'down', name: '체육관 관리인', cond: () => !LIT(),
        text: '체육관 전력은 등대 발전기에서 와요. 등대가 멈춰서 관장 단우 님도\n정비를 돕고 있어요. 등대가 돌아오면 바로 다시 열게요!' },
      { id: 'hb_ferry', char: 'ferry', x: 9, y: 26, dir: 'up', name: '연안 나룻배 사공', talk: () => H.coastFerry(false) },
      { id: 'hb_fisher', char: 'fisher', x: 22, y: 25, dir: 'left', name: '낚시꾼 해원',
        talk: async () => {
          const N = '낚시꾼 해원';
          if (!flag('q13')) { await say('등대가 꺼진 뒤로는 물고기도 잘 안 모여. 등대가 켜지면 낚시 수업을 열어 줄게!', N); return; }
          if (!G.S.bag.rod2) {
            await say('등대가 켜지니 물고기들이 돌아왔어! 약속대로 낚시 수업이야.', N);
            await say('물가낚싯대는 찌가 가벼워서 물가 여러 동료를 만날 수 있어.\n별방울, 물꼬리, 멍부리, 둥잠이... 운이 좋으면 물쫄이도!', N);
            await give('rod2', 1); set('q23');
            await say('잔교 끝 낚시 둔덕이나 갈대여울 둔덕에서 물을 보고 써 봐. 바다로 나갈 필요는 없어!', N);
            return;
          }
          await say('가운데 잔교 끝 둔덕이 명당이야. 찌가 흔들리면 그때 A!', N);
        } },
      { id: 'hb_star', char: 'woman', x: 33, y: 24, dir: 'down', name: '바닷별 훈련사',
        talk: async () => {
          const N = '바닷별 훈련사';
          await say('우리 조류별 예쁘지? 별방울에게 물결돌을 쓰면 이렇게 자라.\n물결돌은 세 번째 배지 뒤 조수연구소 의뢰에서 받을 수 있어.', N);
          await say('바다를 건너야만 얻는 게 아니야. 관측 데크 웅덩이에서도 별방울을 만날 수 있고.\n돌을 써서 진화해도 예전 기술은 센터에서 무료로 복습할 수 있단다.', N);
        } },
      { id: 'hb_joryu', mon: 'joryubyeol', act: 'splash', x: 34, y: 25, dir: 'left', text: '조류별이 반짝반짝 빛나는 몸을 빙글 돌렸다.' },
      { id: 'hb_jumeo', mon: 'jumeonyang', act: 'hop', x: 16, y: 7, dir: 'left', move: 'wander', range: 3, text: () => flag('q13') ? '주머니냥이 작은 소포를 등에 메고 창고 사이를 바쁘게 오간다.' : '주머니냥이 할 일이 없어 창고 앞에서 꾸벅꾸벅 졸고 있다.' },
      { id: 'hb_bulba', mon: 'bulbari', act: 'hop', x: 24, y: 12, dir: 'right', cond: () => flag('q13'), text: '불발이가 공방 화로 앞에서 불씨를 지키고 있다. 일을 돕는 게 즐거운 모양이다.' },
      { id: 'hb_nachim', mon: 'nachimdol', act: 'splash', x: 10, y: 25, dir: 'down', cond: () => flag('q13'), text: '나침돌이 선착장 앞에서 배의 나침반을 가만히 맞추고 있다.' },
      { id: 'hb_kid', char: 'kidA', x: 13, y: 24, dir: 'down', move: 'wander', name: '항구 꼬마',
        text: () => flag('badge3') ? '단우 관장님을 이겼다고? 등대배지, 반짝반짝하다!' : '등대가 반짝이면 배들이 줄지어 들어와. 요즘은 깜깜해서 심심해...' },
      { id: 'hb_worker', char: 'worker', x: 12, y: 6, dir: 'down', name: '항만 인부',
        text: () => flag('q13') ? '등대 덕분에 짐이 다시 들어온다! 새길상회 짐은 요즘 이상하게 많지만...' : '새길상회 짐이 창고에 산더미야. 다 어디로 가는 건지 원.' },
      { id: 'hb_pool', char: 'doha', x: 29, y: 25, dir: 'right', name: '해양교관 도하', cond: () => flag('q20_ready') && !flag('q20'),
        text: '수조 출발 선착장(왼쪽 위 모서리)에서 물을 바라보고 A!\n부표 세 개를 모두 지난 뒤, 오른쪽 선착장에 닿으면 끝이야.' },
      { id: 'hb_coach', char: 'man', x: 12, y: 22, dir: 'down', name: '연합마차 마부', cond: () => flag('badge4'), talk: () => H.coach('harbor') }],
    triggers: [
      // the safe pool course (Q20): three buoys, then the finish dock on the right
      { x: 33, y: 28, cond: () => flag('q20_ready') && !flag('q20'), run: async () => { if (!flag('q20b1')) { set('q20b1'); sfx('select'); await say('첫 번째 부표를 지났다!'); } } },
      { x: 36, y: 27, cond: () => flag('q20_ready') && !flag('q20'), run: async () => { if (!flag('q20b2')) { set('q20b2'); sfx('select'); await say('두 번째 부표를 지났다!'); } } },
      { x: 38, y: 29, cond: () => flag('q20_ready') && !flag('q20'), run: async () => { if (!flag('q20b3')) { set('q20b3'); sfx('select'); await say('세 번째 부표를 지났다!'); } } },
      { x: 40, y: 27, w: 1, h: 3, cond: () => flag('q20_ready') && !flag('q20'), run: async () => {
        const N = '해양교관 도하';
        if (!(flag('q20b1') && flag('q20b2') && flag('q20b3'))) { await say('부표 세 개를 모두 지나야 해! 빨간 부표를 하나씩 통과해 봐.', N); return; }
        set('q20');
        G.audio && G.audio.jingle('badge');
        await say('완벽해! 파도의 높이를 읽고, 정해진 곳에서 내렸어. 그게 파도타기의 전부야.', N);
        await say('하나 더. 수조 바깥 하얀 줄 부표 너머는 물살이 거센 경계야.\n파도타기로도 급류와 폭포는 아직 무리니까, 경계 부표가 보이면 돌아서야 해.', N);
        await give('map08', 1);
        await say('외해 안전 항로도야. 안전 항로와 부표, 공공 선착장만 그려 뒀어.\n부두에서 남쪽 바다로 나가면 다음 해안 항로야. 바다 위에서도 지도와 구조 요청은 쓸 수 있어!', N);
        await say('(메뉴의 [지도]에 외해 항로가 더해졌다)');
        Wd().respawn();
      } }],
    drawExtra: (T, cx, cy) => {
      // the lighthouse lamp (the tower itself is part of the ground drawing); lit after Q13 with a slow sweeping beam
      const X = 39 * 16 + 8 - cx, Y = 4 + 10 - cy;
      if (LIT() && X > -140 && X < 400 && Y > -140 && Y < 330) {
        T.fillStyle = '#ffe88a'; T.fillRect(X - 5, Y - 5, 4, 10); T.fillRect(X + 1, Y - 5, 4, 10);
        const a = (G.frame % 240) / 240 * Math.PI * 2, len = 150;
        T.fillStyle = 'rgba(255,240,170,0.2)';
        T.beginPath(); T.moveTo(X, Y); T.lineTo(X + Math.cos(a - 0.13) * len, Y + Math.sin(a - 0.13) * len * 0.45); T.lineTo(X + Math.cos(a + 0.13) * len, Y + Math.sin(a + 0.13) * len * 0.45); T.closePath(); T.fill();
      }
      // pool buoys (red) and the white rope of the warning line
      [[33, 28, 'q20b1'], [36, 27, 'q20b2'], [38, 29, 'q20b3']].forEach(([bx, by, k]) => {
        const x = bx * 16 + 8 - cx, y = by * 16 + 9 - cy + (Math.floor(G.frame / 20) % 2);
        G.disc(T, x, y, 4, '#ffffff'); G.disc(T, x, y, 3, flag(k) ? '#5ab85a' : '#e04838'); T.fillStyle = '#ffffff'; T.fillRect(x - 1, y - 7, 2, 4);
      });
      for (let X = 0; X < 44; X += 3) { const x = X * 16 + 8 - cx, y = 31 * 16 + 6 - cy; if (x > -8 && x < 264 && y < 200) { G.disc(T, x, y, 3, '#ffffff'); G.disc(T, x, y, 2, '#f2a020'); } }
    },
    onEnter: async () => {
      visit('harbor');
      if (!flag('hb_seen')) { set('hb_seen'); await G.wait(10); await say('짭짤한 바닷바람이 분다. 크레인과 창고, 절벽 위의 등대가 보인다.\n...그런데 등대의 불이 꺼져 있다.'); }
    }
  };
  H.center('center_h', '돛바람항', 'harbor', 4, 13);
  H.shop('shop_h', '돛바람항', 'harbor', 13, 13, STOCK2);
  H.house('house_h1', '돛바람항', 'harbor', 4, 18, [
    { id: 'h1', char: 'woman', x: 5, y: 2, dir: 'down', name: '아주머니',
      talk: async () => {
        if (!flag('gift_hyper')) { set('gift_hyper'); await say('물울림에서 왔다고? 먼 길 왔네. 이거 받아 가렴.', '아주머니'); await give('hyperpotion', 1); return; }
        await say('우리 집 주머니냥이 요즘 일이 없어서 심심해해. 등대가 켜지면 짐이 들어올 텐데.', '아주머니');
      } }]);
  H.house('house_h2', '돛바람항', 'harbor', 4, 23, [
    { id: 'h2', char: 'elder', x: 2, y: 2, dir: 'down', name: '할아버지',
      text: () => flag('q16') ? '바위울림터널을 뚫고 기억나루까지 갔다고? 옛 여행자들은 그 산을 넘어 다녔단다.' : '옛날엔 바람등성이를 넘어 기억나루까지 걸어 다녔지.\n요즘은 낙석 때문에 공방에서 바위깨기를 배운 사람만 다닌다더구나.' }]);

  // 항만소: Q12 (the request), transport records, the survey board, the lost transport slips
  M.hb_office = {
    name: '항만소', kind: 'in', floor: '_', bgm: 'town',
    rows: ['#W###WW###W#', 'BBB.N...BBBB', '____________', '_cccccc_____', '____________', '__tt____tt__', '____________', '_____xx_____'],
    warps: [{ x: 5, y: 7, to: 'harbor', tx: 20, ty: 13, dir: 'down' }, { x: 6, y: 7, to: 'harbor', tx: 20, ty: 13, dir: 'down' }],
    objects: {
      '4,1': async () => F().surveyBoard('항만소 게시판'),
      '9,1': async () => say(flag('q12') ? '새길상회 운송 기록이다. 공명 장비 상자가 매주 산 너머 "북쪽 공사 현장"으로 실려 갔다고 적혀 있다.' : '항만 운송 기록이 빼곡하게 꽂혀 있다.'),
      '10,1': async () => say('항로 기록부다. "등대 소등 이후 접안 불가 — 연안선 운항 중지"')
    },
    npcs: [
      { id: 'hb_chief', char: 'man', x: 3, y: 2, dir: 'down', name: '항만소장',
        talk: async () => {
          const N = '항만소장';
          if (!flag('q12')) {
            if (!G.S.bag.request) { await say('항만소입니다. 등대가 꺼져서 정신이 없네요. 무슨 일로 오셨나요?', N); return; }
            await say('물울림 수문연구소의 의뢰서라... 이 장비 표식, 우리 항구 운송망으로 들어온 게 맞습니다.', N);
            D().useItem('request');
            await say('그런데 지금 항구에 더 큰 문제가 있어요. 등대의 자기축이 흔들려서\n배가 접안을 못 하고, 그 주변에 전기 동료들이 잔뜩 몰려들었죠.', N);
            await say('항구 시설 여러 곳을 다니셔야 할 테니 이 안내도를 드릴게요.\n공방·항만소·등대·관측 데크, 그리고 직접 걸으신 골목이 기록됩니다.', N);
            await give('map04', 1);
            await say('(메뉴의 [지도]에 돛바람항 일대가 더해졌다)');
            await say('등대 점검은 정비사 세나가 맡고 있어요. 동쪽 절벽 등대 계단 앞에서 만나 보세요.\n운송 기록은 저 뒤 서가에서 언제든 확인하셔도 됩니다.', N);
            set('q12');
            return;
          }
          if ((G.S.bag.slip || 0) >= 3 && !flag('q_slips')) {
            await say('떨어진 운송표를 세 장 다 찾아오셨군요! 들길에 흩날려서 골치였어요.', N);
            for (let i = 0; i < 3; i++) D().useItem('slip');
            set('q_slips');
            await give('superpotion', 2, true); await give('tm_slam', 1, true);
            await say(`${P()}${G.josa(P(), '은', '는')} 좋은상처약 2개와 교본: 덮쳐누르기를 받았다!`);
            await say('항만 교본은 몇 번이고 다시 쓸 수 있어요. 노말 기술을 쓰는 동료에게 좋죠.', N);
            return;
          }
          if (!flag('q13')) { await say('세나가 등대 앞에서 기다리고 있을 거예요. 잘 부탁드립니다!', N); return; }
          await say(flag('slip_heard') || flag('q_slips') ? '등대 덕분에 배가 다시 들어옵니다. 고맙습니다!' : '등대 덕분에 배가 다시 들어옵니다. 고맙습니다!\n아, 혹시 항구 뒤 들길에서 운송표를 보면 주워 주세요. 바람에 세 장이 날아갔거든요.', N);
          set('slip_heard');
        } },
      { id: 'hb_clerk', char: 'clerk', x: 6, y: 2, dir: 'down', name: '항만소 직원',
        text: '연안 나룻배는 등대가 켜지면 다시 다녀요. 물울림시까지 무료예요!\n공용 배는 정해진 선착장만 오가니까, 개인 파도타기와는 달라요.' }]
  };

  // 공방: Q15 바위깨기 강습, Q21-F 화로 수리, the material pack from the old mine
  M.workshop = {
    name: '돛바람 공방', kind: 'in', bgm: 'town',
    rows: ['#W###WW###W#', 'BB..kk...BBB', '............', '..tt....tt..', '............', '............', '.p........p.', '.....xx.....'],
    warps: [{ x: 5, y: 7, to: 'harbor', tx: 27, ty: 12, dir: 'down' }, { x: 6, y: 7, to: 'harbor', tx: 27, ty: 12, dir: 'down' }],
    objects: {
      '4,1': async () => brazierLesson(), '5,1': async () => brazierLesson()
    },
    npcs: [
      { id: 'smith', char: 'smith', x: 6, y: 2, dir: 'down', name: '공방장 무쇠',
        talk: async () => {
          const N = '공방장 무쇠';
          if (G.S.bag.matpack) {
            D().useItem('matpack');
            await say('이건... 옛 갱도 창고의 재료 꾸러미잖아! 이걸 다 가져왔다고? 고마워!', N);
            await give('hyperpotion', 2);
            return;
          }
          if (!flag('badge3')) { await say('여기는 돛바람 공방이야. 등대가 꺼져서 우리 화로도 반쯤 쉬는 중이지.\n세 번째 배지를 받은 길지기에겐 바위깨기를 가르쳐 줄 수 있어.', N); return; }
          if (!flag('q15_start')) {
            await say('등대배지에 단우 관장의 강습권까지! 그럼 바위깨기 수업을 시작하지.', N);
            if (G.S.bag.ticket2) D().useItem('ticket2');
            await say('바위깨기는 큰 바위를 부수는 힘자랑이 아니야. 금이 간 곳을 찾아서\n동료가 그 금을 따라 힘을 모으는 거지. 작은 낙석만 깔끔하게 치울 수 있어.', N);
            await H.teachOrLend('smash', 'deuldori', N);
            set('q15_start');
            await say('밖 마당에 연습용 금 간 바위가 두 개 있어. 바위를 바라보고 A 버튼!\n둘 다 치우면 바람등성이 탐굴도를 줄게.', N);
            return;
          }
          if (!flag('q15')) { await say('마당의 금 간 바위 두 개를 치워 봐. 바위를 바라보고 A 버튼이야.', N); return; }
          if (!flag('q21f_a')) {
            if (!flag('q21f_start')) {
              set('q21f_start');
              await say('그리고 부탁이 하나 있어. 공방 화로가 식어 버렸거든. 부품 하나가 깨졌어.\n바람등성이 대피소 관리인이 여분 화로 부품을 갖고 있을 거야.', N);
              await say('부품을 가져오면 화로 온도 맞추는 수업을 보여 주지. 끝나면 불씨돌을 하나 줄게!', N);
              return;
            }
            if (!G.S.bag.brazierpart) { await say('바람등성이 대피소에서 화로 부품을 받아 와 줘. 화로는 저기 안쪽이야.', N); return; }
            await say('화로 부품이군! 저기 안쪽 화로에 끼우고 온도계를 맞춰 보자.', N);
            return;
          }
          await say('바람등성이 너머 바위울림터널까지는 낙석이 많아. 바위깨기로 조심조심!', N);
        } },
      { id: 'miner', char: 'hiker', x: 9, y: 4, dir: 'left', name: '공방 탐굴사',
        text: () => flag('q15') ? '탐굴도는 산길 방향이랑 입구, 대피소만 그렸어. 터널 속 샛길은 직접 걸어서 채워!' : '바람등성이는 낙석이 많은 산길이야. 바위깨기를 배우면 탐굴도를 줄게.' },
      { id: 'ws_bul', mon: 'bulbari', act: 'hop', x: 3, y: 2, dir: 'down', cond: () => flag('q21f_a'), text: '불발이가 다시 살아난 화로 앞에서 신이 나 꼬리를 흔든다.' }]
  };
  // Q21-F 화로의 온도: three thermometers on the workshop brazier (no fire companion needed: the workshop's 화로견 helps)
  async function brazierLesson(N0) {
    const N = N0 || '공방장 무쇠';
    if (flag('q21f_a')) { await say('화로가 고르게 타오르고 있다. 세 온도계 바늘이 모두 초록 칸에 있다.'); return; }
    if (!flag('q21f_start') || !G.S.bag.brazierpart) { await say('식어 버린 공방 화로다. 부품 하나가 깨져 있다.'); return; }
    D().useItem('brazierpart');
    await say('화로 부품을 끼웠다! 공방의 화로견이 숨을 불어넣자 불길이 다시 일었다.');
    await say('자, 온도계 세 개가 보이지? 위·가운데·아래 순서로, 바늘이 초록 칸에 올 때까지\n바람구멍을 조절하는 거야. 불 동료가 없어도 화로견이 도와주니까 괜찮아.', N);
    const labels = ['위 온도계', '가운데 온도계', '아래 온도계'];
    for (let i = 0; i < 3; i++) {
      for (;;) {
        const c = await G.choose(['바람구멍 조금 열기', '바람구멍 조금 닫기'], { title: labels[i] + (i === 1 ? ' · 바늘이 빨간 칸' : ' · 바늘이 파란 칸'), cancel: -1 });
        const right = i === 1 ? 1 : 0;
        if (c === right) { sfx('select'); await say(`${labels[i]} 바늘이 초록 칸에 들어왔다!`); break; }
        await say(i === 1 ? '불이 더 세졌다! 빨간 칸은 너무 뜨겁다는 뜻이야. 반대로!' : '불이 약해졌다. 파란 칸은 너무 차갑다는 뜻이야. 반대로!', N);
      }
    }
    set('q21f_a');
    G.audio && G.audio.jingle('badge');
    await say('완벽해! 불은 세게만 키운다고 좋은 게 아니야. 고르게 숨 쉬게 하는 거지.', N);
    await give('firestone', 1);
    await say('불씨돌이야. 불발이나 여우불이 이 온기에 반응해. 진화는 서두르지 않아도 돼.\n불씨돌은 이제 조수연구소 교환소에서도 살 수 있어.', N);
    Wd().respawn();
  }
  H.brazierLesson = brazierLesson;

  // 해양학교: Q20 파도타기 강습 (explained in advance; held after the fourth badge)
  M.school = {
    name: '돛바람 해양학교', kind: 'in', bgm: 'town',
    rows: ['#W###WW###W#', 'B...NNN....B', '............', '.tt..tt..tt.', '............', '.tt..tt..tt.', '............', '.....xx.....'],
    warps: [{ x: 5, y: 7, to: 'harbor', tx: 25, ty: 20, dir: 'down' }, { x: 6, y: 7, to: 'harbor', tx: 25, ty: 20, dir: 'down' }],
    objects: {
      '4,1': async () => say('칠판: "파도타기 3원칙 — ① 부표를 따라 ② 정해진 곳에서 내리기 ③ 하얀 줄 경계는 넘지 않기"'),
      '5,1': async () => say('칠판: "급류와 폭포는 파도타기로도 아직 무리! 상급 강습을 기다리세요."'),
      '6,1': async () => say('외해 항로 안내도. 항구 남쪽 바다 너머로 다음 해안 지역이 희미하게 그려져 있다.')
    },
    npcs: [
      { id: 'doha', char: 'doha', x: 8, y: 2, dir: 'down', name: '해양교관 도하',
        talk: async () => {
          const N = '해양교관 도하';
          if (!flag('badge4')) {
            await say('해양학교에 온 걸 환영해! 나는 교관 도하야. 외해 항로 강습은\n네 번째 배지를 받은 길지기부터 받을 수 있어. 미리 수업 내용을 알려 줄게.', N);
            await say('부두 동쪽 안전 수조에서, 빨간 부표 세 개를 지나 정해진 선착장에 내리는 코스야.\n물에 맞는 동료가 없어도 괜찮아. 학교의 지원 여울권이 함께 가 줄 거야.', N);
            return;
          }
          if (!flag('q20_ready')) {
            await say(G.S.bag.recommend2 ? '윤슬 관장의 추천서! 잎향배지까지... 좋아, 파도타기 강습을 시작하자.' : '잎향배지구나! 좋아, 파도타기 강습을 시작하자.', N);
            if (G.S.bag.recommend2) D().useItem('recommend2');
            await say('파도타기는 잔물타기의 다음 단계야. 동료가 파도를 읽고, 너는 해상 안정판 위에서\n균형을 잡지. 잔물타기와 같은 버튼으로, 바다에서는 저절로 파도타기가 돼.', N);
            await H.teachOrLend('surf', 'yeoulgwon', N);
            await give('seaboard', 1);
            set('q20_ready');
            await say('자, 부두 동쪽 수조로! 왼쪽 위 출발 선착장에서 물을 바라보고 A 버튼.\n빨간 부표 세 개를 지나서 오른쪽 선착장에 내리면 수료야.', N);
            return;
          }
          if (!flag('q20')) { await say('수조에서 기다릴게! 빨간 부표 세 개, 그리고 오른쪽 선착장.', N); return; }
          await say('부두에서 남쪽 바다로 나가면 다음 해안 항로야. 하얀 줄 부표 너머는 조심!', N);
        } },
      { id: 'sc_kid', char: 'kidB', x: 2, y: 4, dir: 'right', name: '학생', text: '파도타기 수업 들으러 왔어? 나도 언젠가 바다 건너 섬에 가 볼 거야!' },
      { id: 'sc_kid2', char: 'kidA', x: 9, y: 6, dir: 'up', name: '학생', text: '물판은 강, 해상 안정판은 바다! 둘 다 같은 버튼이래. 신기하지?' }]
  };

  // 조수연구소: Q21-W 조수의 세 높이, the stone exchange (fire and wave stones after the third badge)
  M.tidelab = {
    name: '조수연구소', kind: 'in', floor: '_', bgm: 'water',
    rows: ['#W###WW###W#', 'BBBB..PP.BBB', '____________', '__cccc______', '____________', '______tt____', '____________', '_____xx_____'],
    warps: [{ x: 5, y: 7, to: 'harbor', tx: 36, ty: 19, dir: 'down' }, { x: 6, y: 7, to: 'harbor', tx: 36, ty: 19, dir: 'down' }],
    objects: { '6,1': async () => say('조수 그래프가 떠 있는 화면이다. 물높이가 하루 두 번 오르내린다.'), '7,1': async () => say('관측 데크 카메라 화면이다. 웅덩이 속에서 별방울이 반짝인다.') },
    npcs: [
      { id: 'yura', char: 'yura', x: 3, y: 2, dir: 'down', name: '연구원 유라',
        talk: async () => {
          const N = '연구원 유라';
          if (!flag('badge3')) { await say('조수연구소예요. 저는 연구원 유라. 관측 데크 웅덩이엔 별방울과 등불해파가 살아요.\n세 번째 배지를 받으면 관측 의뢰를 하나 부탁할게요.', N); return; }
          if (!flag('q21w_start')) {
            set('q21w_start');
            await say('등대배지네요! 관측 의뢰를 하나 부탁해도 될까요?\n데크에 물높이 표식이 세 곳 있어요. 눈금을 확인해서 이 기록지에 적어 와 주세요.', N);
            await say('기다릴 필요는 없어요. 지금 보이는 눈금 그대로면 돼요. 바다로 나갈 필요도 없고요!', N);
            return;
          }
          if (!flag('q21w')) {
            if (!G.S.bag.tidelog) { await say('데크의 물높이 표식 세 곳이에요. 데크 난간 옆 줄무늬 기둥을 바라보고 A!', N); return; }
            D().useItem('tidelog');
            set('q21w');
            G.audio && G.audio.jingle('badge');
            await say('세 곳 모두 정확해요! 덕분에 조수 그래프가 완성됐어요.', N);
            await give('wavestone', 1);
            await say('물결돌이에요. 별방울이나 물돌개가 이 흐름에 반응해요.\n물결돌과 불씨돌은 이제 옆 교환 창구에서도 살 수 있어요.', N);
            return;
          }
          await say('온실 수로가 복구되면 거기 물높이도 재 보고 싶어요. 잎향시 쪽에 가면 부탁해요!', N);
        } },
      { id: 'tl_exch', char: 'clerk', x: 5, y: 2, dir: 'down', name: '교환 창구',
        talk: async () => {
          const N = '조수연구소 교환 창구';
          if (!flag('badge2')) { await say('공명 광물 교환 창구예요. 배지를 가진 길지기에게만 열어요.', N); return; }
          await F().exchange(N);
        } }]
  };

  // ------------------------------------------------------------ R08 항구 뒤 들길
  M.backfield = {
    name: '항구 뒤 들길', kind: 'out', bgm: 'route', rows: ROWS.backfield,
    links: { s: { to: 'harbor', dx: -30 } },
    warps: [{ x: 2, y: 6, to: 'oldmine', tx: 30, ty: 9, dir: 'left', tdir: 'left' }],
    signs: { '30,7': '항구 뒤 들길\n▼ 남쪽: 돛바람항   ◀ 서쪽 덤불 너머: 옛 운송 갱도 (폐쇄)' },
    items: [{ id: 'slip', x: 7, y: 12, flag: 'bf_slip1' }, { id: 'slip', x: 19, y: 4, flag: 'bf_slip2' }, { id: 'slip', x: 29, y: 12, flag: 'bf_slip3' }, { id: 'superpotion', x: 14, y: 12, flag: 'bf_spot' }],
    onBrazier: async () => {
      await say('작은 공용 화로가 따뜻하게 타오른다. 화롯가에서 잠시 쉬어 가자.');
      await G.menus.heal();
      await say('몸이 따뜻해지니 동료들도 기운을 차렸다!');
    },
    npcs: [
      { id: 'bf1', char: 'worker', x: 14, y: 7, dir: 'down', sight: 1,
        trainer: { flag: 'tr_bf1', title: '항만 인부', name: '동석', char: 'worker', team: [['jumeonyang', 20], ['bulbari', 21]], base: 22,
          before: '쉬는 시간엔 승부지!', lose: '쉬는 시간 끝났네...', after: '주머니냥은 작은 짐을 잘 날라. 불발이는 밤에 화로를 지켜 주고. 둘 다 항구의 일꾼이야.' } },
      { id: 'bf2', char: 'kidA', x: 27, y: 9, dir: 'up', sight: 1,
        trainer: { flag: 'tr_bf2', title: '들판 소년', name: '바로', char: 'kidA', team: [['jjoreu', 20], ['kkubeokyang', 21]], base: 18,
          before: '들길은 내 놀이터야!', lose: '꾸벅양이 졸았어...', after: '꾸벅양 털에 기대면 금방 잠들어. 진짜야!' } },
      { id: 'bf_old', char: 'elder', x: 6, y: 9, dir: 'left', name: '할머니',
        text: () => F().unlocked('vine') ? '저 덤불 너머가 옛 운송 갱도란다. 지금은 아무도 안 쓰지.\n안쪽 광차 선로가 산등 야영지 쪽까지 이어져 있다던데...' : '저 덤불 너머가 옛 운송 갱도란다.' }],
    onEnter: async () => { visit('backfield'); }
  };

  // ------------------------------------------------------------ R09 조수만 관측 데크
  const gauge = async (k, n) => {
    if (!flag('q21w_start') || flag('q21w')) { await say('물높이 표식이다. 줄무늬 기둥에 젖은 눈금이 새겨져 있다.'); return; }
    if (flag(k)) { await say('이미 기록한 표식이다.'); return; }
    set(k); sfx('select');
    const c = ['tg1', 'tg2', 'tg3'].filter(flag).length;
    await say(`${n} 표식의 눈금을 기록지에 옮겨 적었다. (${c}/3)`);
    if (c >= 3) { await give('tidelog', 1, true); await say('세 곳을 모두 적었다! 조수연구소의 유라에게 가져가자.'); }
  };
  M.tidedeck = {
    name: '조수만 관측 데크', kind: 'out', bgm: 'water', rows: ROWS.tidedeck,
    links: { w: { to: 'harbor', dy: 14 } },
    seaLine: '파도가 출렁이는 바다다. 데크 바깥 짙은 물에는 경고 부표가 떠 있다.\n바다 항로는 해양학교 파도타기 강습을 받은 뒤에 나갈 수 있다.',
    signs: { '1,5': '조수만 관측 데크\n"웅덩이를 들여다보면 바다 동료를 만날 수 있어요. 난간 밖으로 몸을 내밀지 마세요!"' },
    objects: { '10,5': () => gauge('tg1', '서쪽 데크'), '20,1': () => gauge('tg2', '북쪽 전망대'), '22,14': () => gauge('tg3', '남쪽 데크') },
    items: [{ id: 'goldcube', n: 2, x: 26, y: 7, flag: 'td_shelf' }, { id: 'potion', x: 22, y: 12, flag: 'td_potion' }],
    npcs: [
      { id: 'td_res', char: 'yura', x: 3, y: 8, dir: 'up', name: '조수연구소 조수',
        text: '웅덩이는 실제 바닷물 시간과 상관없이 늘 관측할 수 있어요. 웅덩이를 보고 A!\n줄무늬 기둥은 물높이 표식이에요.' },
      { id: 'td1', char: 'swimmer', x: 12, y: 10, dir: 'up', sight: 2,
        trainer: { flag: 'tr_td1', title: '수영 소녀', name: '파랑', char: 'swimmer', team: [['byeolbangul', 20], ['deungbulhaepa', 21]], base: 20,
          before: '웅덩이에서 만난 친구들이야!', lose: '별방울이 눈이 핑핑 돌아...', after: '등불해파는 밤에 은은하게 빛나. 촉수는 조심해!' } }],
    drawExtra: (T, cx, cy) => {
      [[10, 5, 'tg1'], [20, 1, 'tg2'], [22, 14, 'tg3']].forEach(([gx, gy, k]) => {
        const x = gx * 16 - cx, y = gy * 16 - cy;
        T.fillStyle = '#3a3a40'; T.fillRect(x + 6, y - 6, 4, 22);
        for (let i = 0; i < 5; i++) { T.fillStyle = i % 2 ? '#f4f0e8' : '#e04838'; T.fillRect(x + 6, y - 6 + i * 4, 4, 4); }
        if (flag(k)) { T.fillStyle = '#5ab85a'; T.fillRect(x + 4, y - 9, 8, 3); }
      });
    },
    onEnter: async () => { visit('tidedeck'); }
  };

  // ------------------------------------------------------------ D04 옛 운송 갱도: two junction levers, the cart, the camp shortcut
  let cartAnim = null;
  const omPath = () => {
    const path = []; for (let x = 28; x >= 18; x--) path.push([x, 9]);
    if (!num('om_j1')) { for (let y = 10; y <= 15; y++) path.push([18, y]); return { path, end: 'south' }; }
    for (let y = 8; y >= 3; y--) path.push([18, y]);
    if (!num('om_j2')) { path.push([18, 2], [18, 1]); return { path, end: 'north' }; }
    for (let x = 17; x >= 6; x--) path.push([x, 3]);   // through the barricade into the old store,
    path.push([6, 4], [6, 5]);                          // where it jumps the rail end and rolls into the corner (out of the doorway)
    return { path, end: 'store' };
  };
  const omSync = () => {
    const m = Wd().getMap('oldmine');
    const want = { '19,8': num('om_j1') ? 'Y' : 'Z', '19,4': num('om_j2') ? 'Z' : 'Y', '4,10': flag('mine_short') ? 'Z' : 'Y' };
    for (const k in want) { const [x, y] = k.split(',').map(Number); if (m.at(x, y) !== want[k]) F().setTile('oldmine', x, y, want[k]); }
  };
  async function runCart() {
    if (G.S.flags.om_cart === 'store') { await say('광차는 창고 안 구석에 처박혀 있다. 더 움직일 필요는 없어 보인다.'); return; }
    const ok = await G.ask('광차 출발 레버다. 선로 갈림길은 옆의 두 레버가 정한다.\n레버를 당겨 광차를 출발시킬까?');
    if (!ok) return;
    const { path, end } = omPath();
    sfx('rock');
    for (const [x, y] of path) { cartAnim = { x, y }; await G.wait(7); }
    if (end === 'store') {
      set('om_cart', 'store'); cartAnim = null;
      F().setTile('oldmine', 7, 3, '_');
      sfx('knock2'); Wd().shake = 10;
      await say('쾅! 광차가 창고 앞 나무 바리케이드를 들이받고 창고 구석까지 굴러 들어갔다.\n막혀 있던 옛 창고 입구가 열렸다!');
      return;
    }
    await say(end === 'south' ? '덜컹! 광차가 남쪽 막다른 선로 끝에 멈췄다.' : '덜컹! 광차가 북쪽 적재장 선로 끝에 멈췄다.');
    await say('...잠시 뒤, 광차가 경사를 따라 출발점으로 천천히 굴러 돌아왔다.');
    cartAnim = null;
  }
  M.oldmine = {
    name: '옛 운송 갱도', kind: 'cave', bgm: 'cave', rows: ROWS.oldmine,
    dark: { lamp: 72, none: 26 },
    rescue: () => flag('om_fromcamp') ? { map: 'camp', x: 20, y: 2, dir: 'down' } : { map: 'backfield', x: 4, y: 6, dir: 'right' },
    warps: [{ x: 31, y: 9, to: 'backfield', tx: 4, ty: 6, dir: 'right', tdir: 'right' }, { x: 0, y: 11, to: 'camp', tx: 20, ty: 2, dir: 'left', tdir: 'down' }],
    blocks: [{ x: 2, y: 11, cond: () => !flag('mine_short') }, { x: 28, y: 9, cond: () => G.S.flags.om_cart !== 'store' && !cartAnim }, { x: 6, y: 5, cond: () => G.S.flags.om_cart === 'store' }],
    items: [{ id: 'matpack', x: 3, y: 2, flag: 'om_pack' }, { id: 'tm_slide', x: 4, y: 4, flag: 'om_tm' }, { id: 'potion', x: 24, y: 12, flag: 'om_potion' }, { id: 'goldcube', x: 12, y: 16, flag: 'om_cube' }],
    objects: {
      '26,6': () => runCart(),
      '2,11': async () => { if (!flag('mine_short')) await say('녹슨 쇠창살이 통로를 막고 있다. 창살 너머로 바깥 바람이 들어온다.\n옆의 레버로 올리는 것 같다.'); }
    },
    onLever: async (x, y) => {
      if (x === 19 && y === 8) { set('om_j1', num('om_j1') ? 0 : 1); omSync(); sfx('door'); await say(`갈림길 레버를 ${num('om_j1') ? '올렸다. 선로가 북쪽으로 바뀌었다.' : '내렸다. 선로가 남쪽으로 바뀌었다.'}`); return; }
      if (x === 19 && y === 4) { set('om_j2', num('om_j2') ? 0 : 1); omSync(); sfx('door'); await say(`북쪽 갈림 레버를 ${num('om_j2') ? '내렸다. 선로가 서쪽 창고 쪽으로 바뀌었다.' : '올렸다. 선로가 북쪽 적재장으로 바뀌었다.'}`); return; }
      if (x === 4 && y === 10) {
        if (flag('mine_short')) { await say('레버가 내려가 있다. 쇠창살은 활짝 올라가 있다.'); return; }
        if (!flag('q13')) { await say('녹슨 레버다. 당겨 봤지만 전력이 끊겨 창살이 꿈쩍도 하지 않는다.\n(등대 발전기가 돌아오면 전력이 들어올 것 같다)'); return; }
        set('mine_short'); omSync(); sfx('knock2');
        await say('위잉... 덜컹! 등대에서 온 전력으로 쇠창살이 올라갔다.\n산등 야영지로 이어지는 옛 운송로가 열렸다! 이제 언제든 오갈 수 있다.');
        return;
      }
    },
    signs: {},
    npcs: [
      { id: 'om_sign1', char: 'worker', x: 20, y: 12, dir: 'up', name: '옛 갱도 관리인',
        text: '옛 운송 갱도야. 광차는 출발 레버로 움직이고, 갈림길 두 곳은 레버로 바꾸지.\n옛 창고는 바리케이드로 막혀 있는데... 광차로 들이받으면 열릴지도?' }],
    drawExtra: (T, cx, cy) => {
      // junction arrows
      const arr = (x, y, d) => { const X = x * 16 + 8 - cx, Y = y * 16 + 8 - cy; T.fillStyle = '#f2d23a'; const [dx, dy] = Wd().DIRS[d]; for (let i = 0; i < 5; i++) T.fillRect(X + dx * i - 1, Y + dy * i - 1, 3, 3); T.fillRect(X + dx * 5 - (dy ? 3 : 1), Y + dy * 5 - (dx ? 3 : 1), dy ? 7 : 3, dx ? 7 : 3); };
      arr(18, 9, num('om_j1') ? 'up' : 'down');
      arr(18, 3, num('om_j2') ? 'left' : 'up');
      // the barricade
      if (G.S.flags.om_cart !== 'store') { const X = 7 * 16 - cx, Y = 3 * 16 - cy; T.fillStyle = '#5a3a1a'; T.fillRect(X + 1, Y, 14, 16); T.fillStyle = '#a8703a'; for (let i = 0; i < 4; i++) T.fillRect(X + 1, Y + 1 + i * 4, 14, 3); T.fillStyle = '#3a2410'; T.fillRect(X + 3, Y, 2, 16); T.fillRect(X + 11, Y, 2, 16); }
      // the iron gate to the camp
      if (!flag('mine_short')) { const X = 2 * 16 - cx, Y = 11 * 16 - cy; T.fillStyle = '#5a6670'; for (let i = 1; i < 16; i += 4) T.fillRect(X + i, Y - 4, 2, 20); T.fillRect(X, Y - 4, 16, 2); T.fillRect(X, Y + 7, 16, 2); }
      // the cart
      const c = cartAnim || (G.S.flags.om_cart === 'store' ? { x: 6, y: 5 } : { x: 28, y: 9 }), X = c.x * 16 - cx, Y = c.y * 16 - cy;
      T.fillStyle = '#2a2a30'; T.fillRect(X + 3, Y + 12, 3, 3); T.fillRect(X + 10, Y + 12, 3, 3);
      T.fillStyle = '#3a3e48'; T.fillRect(X + 1, Y + 3, 14, 10); T.fillStyle = '#6a7080'; T.fillRect(X + 2, Y + 4, 12, 8); T.fillStyle = '#9aa0a8'; T.fillRect(X + 2, Y + 4, 12, 1);
      T.fillStyle = '#8a7a66'; T.fillRect(X + 3, Y + 1, 10, 3); T.fillStyle = '#b8a890'; T.fillRect(X + 5, Y, 4, 2);
    },
    onEnter: async () => {
      visit('oldmine');
      omSync();
      const p = Wd().player; set('om_fromcamp', p.x < 10 ? 1 : 0);
      if (!flag('om_seen')) { set('om_seen'); await G.wait(10); await say('녹슨 선로가 어둠 속으로 이어진다. 오래된 광차 냄새가 난다.'); }
    }
  };

  // ------------------------------------------------------------ D05 등대 동력실 (Q13)
  const LV = { 5: { sh: '●', col: '#f2d23a', no: 1, n: '노란 동그라미 1번' }, 10: { sh: '■', col: '#e04838', no: 3, n: '빨간 네모 3번' }, 15: { sh: '▲', col: '#4a90e2', no: 2, n: '파란 세모 2번' } };
  const LH_ORDER = [15, 5, 10];   // 현장 정비도: ▲2 → ●1 → ■3
  const lhCaveRescue = { map: 'harbor', x: 39, y: 7, dir: 'down' };
  // 세나 keeps you company: a quick rest on every floor (electric companions hit water friends hard)
  const senaRest = async (line) => {
    const N = '정비사 세나';
    await say('여기서 잠깐 숨 돌리고 가자. 전기 동료들이 많아서 지쳤지?', N);
    await G.menus.heal();
    await say(line, N);
  };
  M.lh1 = {
    name: '등대 동력실', floorName: '동력실', kind: 'cave', theme: 'works', bgm: 'cave', rows: ROWS.lh1,
    dark: { lamp: 90, none: 40, col: 'rgba(8,10,16,0.88)', spots: [{ x: 9, y: 11, r: 40, a: 0.7 }, { x: 5, y: 1, r: 22, a: 0.85 }, { x: 10, y: 1, r: 22, a: 0.85 }, { x: 15, y: 1, r: 22, a: 0.85 }, { x: 16, y: 5, r: 20, a: 0.7 }] }, rescue: lhCaveRescue,
    warps: [{ x: 9, y: 13, to: 'harbor', tx: 39, ty: 5, dir: 'down', tdir: 'down' }, { x: 10, y: 13, to: 'harbor', tx: 39, ty: 5, dir: 'down', tdir: 'down' },
      { x: 18, y: 6, to: 'lh2', tx: 4, ty: 12, tdir: 'right' }],
    blocks: [{ x: 18, y: 6, cond: () => !flag('lh_power') }],
    signs: { '16,5': '현장 정비도 (전원 복구 순서)\n① 파란 세모 ▲ 2번  →  ② 노란 동그라미 ● 1번  →  ③ 빨간 네모 ■ 3번\n"문양과 번호를 함께 확인할 것"' },
    onLever: async (x, y) => {
      if (flag('lh_power')) { await say('레버가 모두 내려가 있다. 동력실에 전원이 들어와 있다.'); return; }
      const seq = num('lh_seq'), lv = LV[x];
      if (!lv) return;
      if (Wd().map.at(x, y) === 'Z') { await say('이미 내린 레버다.'); return; }
      if (x === LH_ORDER[seq]) {
        F().setTile('lh1', x, 2, 'Z'); set('lh_seq', seq + 1); sfx('door');
        if (seq + 1 < 3) { await say(`${lv.n} 레버를 내렸다. (${seq + 1}/3)`); return; }
        set('lh_power'); sfx('zap'); Wd().shake = 6;
        await say('위이잉— 동력실에 불이 들어왔다!\n위층 계단의 차단막이 스르르 올라갔다.');
        await say('됐다! 이제 회전축 구역이야. 위층으로 올라가자!', '정비사 세나');
        Wd().respawn();
        return;
      }
      for (const X of [5, 10, 15]) F().setTile('lh1', X, 2, 'Y');
      set('lh_seq', 0); sfx('bump');
      await say('딸깍... 차단기가 툭 떨어지며 레버들이 처음 자리로 돌아왔다.\n현장 정비도의 순서를 다시 확인하자. (문양과 번호를 함께!)');
    },
    npcs: [
      { id: 'sena1', char: 'sena', x: 12, y: 5, dir: 'down', name: '정비사 세나', cond: () => flag('q13_start') && !flag('lh_power'),
        talk: () => senaRest('레버 세 개를 정비도 순서대로 내리면 전원이 들어와. 색깔만 보지 말고\n문양이랑 번호도 같이 확인해! 틀려도 차단기가 처음으로 돌려놔 주니까 괜찮아.') }],
    drawExtra: (T, cx, cy) => {
      for (const x of [5, 10, 15]) {
        const lv = LV[x], X = x * 16 - cx, Y = 1 * 16 - cy;
        T.fillStyle = '#2a2e38'; T.fillRect(X + 1, Y + 2, 14, 12); T.fillStyle = lv.col; T.fillRect(X + 2, Y + 3, 12, 10);
        G.textC(T, lv.sh + lv.no, X + 8, Y + 2, '#ffffff', 'rgba(0,0,0,0.6)');
      }
      if (!flag('lh_power')) { const X = 18 * 16 - cx, Y = 6 * 16 - cy; T.fillStyle = '#5a6670'; T.fillRect(X, Y, 16, 16); T.fillStyle = '#f2d23a'; for (let i = 0; i < 16; i += 6) T.fillRect(X + i, Y + 6, 3, 3); }
    },
    onEnter: async () => { visit('lighthouse'); if (!flag('lh1_seen')) { set('lh1_seen'); await G.wait(10); await say('윙윙거리는 기계 소리... 전원이 꺼진 동력실이다. 벽에 레버 세 개가 보인다.'); } }
  };
  M.lh2 = {
    name: '등대 회전축 구역', floorName: '회전축 구역', kind: 'cave', theme: 'works', bgm: 'cave', rows: ROWS.lh2,
    dark: { lamp: 90, none: 40, col: 'rgba(8,10,16,0.8)' }, rescue: lhCaveRescue,
    boulders: [{ id: 'L1', x: 6, y: 10 }],
    warps: [{ x: 3, y: 13, to: 'lh1', tx: 17, ty: 7, tdir: 'left' }, { x: 18, y: 3, to: 'lh3', tx: 4, ty: 11, tdir: 'right' }],
    blocks: [{ x: 18, y: 3, cond: () => !flag('lh_slot') }],
    objects: {
      '16,12': async () => {
        await say('점검 표지판: "떨어진 공명 받침돌은 왼쪽 위 받침 홈에. 돌이 엉키면 이 표지판에서 처음으로."');
        const ok = await G.ask('받침돌을 처음 자리로 되돌릴까?');
        if (ok) await F().resetPuzzle();
      }
    },
    onSlot: async () => {
      if (flag('lh_slot')) return;
      set('lh_slot');
      await say('받침돌이 홈에 딱 맞물리자 회전축의 흔들림이 잦아들었다!');
      await say('좋았어! 마지막은 꼭대기 관측 난간이야. 축의 방위를 맞추자!', '정비사 세나');
      Wd().respawn();
    },
    npcs: [
      { id: 'sena2', char: 'sena', x: 14, y: 2, dir: 'down', name: '정비사 세나', cond: () => flag('lh_power') && !flag('lh_slot'),
        talk: () => senaRest('회전축을 받치던 공명 받침돌이 떨어져 굴러갔어. 저 둥근 돌 보이지?\n왼쪽 위 홈에 밀어 넣어야 해. 바위 밀기, 할 수 있지?') }],
    drawExtra: (T, cx, cy) => { if (!flag('lh_slot')) { const X = 18 * 16 - cx, Y = 3 * 16 - cy; T.fillStyle = '#5a6670'; T.fillRect(X, Y, 16, 16); T.fillStyle = '#f2d23a'; for (let i = 0; i < 16; i += 6) T.fillRect(X + i, Y + 6, 3, 3); } },
    onEnter: async () => { visit('lighthouse'); }
  };
  M.lh3 = {
    name: '등대 관측 난간', floorName: '관측 난간', kind: 'cave', theme: 'works', bgm: 'cave', rows: ROWS.lh3,
    dark: { lamp: 96, none: 48, col: 'rgba(8,10,16,0.7)' }, rescue: lhCaveRescue,
    warps: [{ x: 3, y: 11, to: 'lh2', tx: 17, ty: 3, tdir: 'left' }],
    items: [{ id: 'revive', x: 21, y: 3, flag: 'lh_box' }],
    objects: (() => { const o = {}; for (let x = 10; x <= 13; x++) for (let y = 5; y <= 7; y++) o[x + ',' + y] = () => alignAxis(); return o; })(),
    npcs: [
      { id: 'sena3', char: 'sena', x: 12, y: 9, dir: 'up', name: '정비사 세나', cond: () => flag('lh_slot') && !flag('q13'),
        talk: () => senaRest(flag('lh_axis') ? '감독이 아직 버티고 있어. 조심해!' : '이게 자기축이야. 축을 바라보고 A! 운송표에 적힌 방위로 맞추자.') },
      { id: 'lhboss', char: 'boss', x: 16, y: 3, dir: 'down', sight: 3, cond: () => flag('lh_axis') && !flag('tr_lhboss'),
        trainer: { flag: 'tr_lhboss', title: '새길상회 감독', name: '하진', char: 'boss', base: 32, prize: 2400, smart: true,
          team: [['jjirikong', 24, ['bolt', 'quick', 'stun', 'tailwag']], ['nachimdol', 25, ['ironbash', 'zap', 'stun', 'swift']], ['tokguri', 26, ['spark', 'swift', 'screech', 'stun']]],
          telegraph: { tokguri: { moves: ['spark'], msg: '의 털이 찌릿찌릿 곤두선다! 다음 차례에 전기가 터질 것 같다!', chance: 0.5 } },
          before: '축을 건드리지 마! 그 장비 번호... 운송표에 적었나?\n그건 우리가 표식을 지운 교체 부품이야. 기록을 넘길 순 없지!', lose: '...장비를 바꿔 끼운 게 들통났군.',
          after: '본사는 공명 광물의 울림을 키워서 땅속 자원을 찾고 있어. 산 너머 공사도 같은 장비야.',
          afterWin: async () => { await lighthouseDone(); } } }],
    drawExtra: (T, cx, cy) => {
      // the compass dial over the axis
      const X = 12 * 16 - cx, Y = 6 * 16 + 8 - cy, a = flag('lh_axis') ? -Math.PI / 2 : -Math.PI / 2 + Math.sin(G.frame / 9) * 0.9;
      T.strokeStyle = flag('lh_axis') ? '#7cf08a' : '#f2d23a'; T.lineWidth = 2; T.beginPath(); T.arc(X, Y, 20, 0, 7); T.stroke();
      T.beginPath(); T.moveTo(X, Y); T.lineTo(X + Math.cos(a) * 16, Y + Math.sin(a) * 16); T.stroke();
      G.textC(T, '북', X, Y - 34, '#ffffff', 'rgba(0,0,0,0.6)');
    },
    onEnter: async () => { visit('lighthouse'); }
  };
  async function alignAxis() {
    const N = '정비사 세나';
    if (flag('lh_axis')) { await say('자기축이 북쪽을 단단히 가리키고 있다.'); return; }
    if (!flag('lh_slot')) { await say('흔들리는 자기축이다. 아래층 받침돌이 빠져 있어 손을 댈 수 없다.'); return; }
    await say('운송표 사본에는 "자기축 기준 방위: 정북" 이라고 적혀 있다.\n바늘이 이리저리 흔들린다...', N);
    for (;;) {
      const c = await G.choose(['북쪽에 맞춘다', '동쪽에 맞춘다', '남쪽에 맞춘다', '서쪽에 맞춘다'], { title: '자기축 방위', cancel: -1 });
      if (c === 0) break;
      sfx('bump'); await say('축이 다시 덜컹 흔들린다. 운송표의 방위를 다시 보자!', N);
    }
    sfx('zap');
    set('lh_axis');
    await say('딸깍! 바늘이 정북에 멈췄다. 축의 장비 번호도 기록했다.\n"SG-7731" ...장비 표식 사본의 번호와 똑같다!');
    await say('이 번호, 물울림 수문에 쓰인 장비랑 같은 거야? 표식은 지워져 있는데...', N);
    Wd().respawn();
    const b = Wd().npc('lhboss');
    if (b) { b.emote = 40; sfx('alert'); await G.wait(30); await Wd().trainerBattle(b); }
  }
  async function lighthouseDone() {
    const N = '정비사 세나';
    await say('감독은 장비 기록을 내려놓고 계단으로 도망쳤다.');
    const b = Wd().npc('lhboss'); if (b) b.hidden = true;
    await say('표식을 지운 교체 부품이라니... 이 기록, 항만소에 꼭 전해야겠어.\n자, 이제 등대를 다시 켜자!', N);
    await G.fadeTo(1, 20);
    Wd().enter('harbor', 39, 7, 'down', { quiet: true, noEvents: true });
    set('q13');
    await G.fadeTo(0, 20);
    G.audio && G.audio.jingle('badge');
    await G.wait(30);
    await say('등대 꼭대기에 불이 켜졌다! 빛줄기가 항구 앞바다를 천천히 쓸고 지나간다.');
    await say('됐다... 등대가 돌아왔어! 이제 배들도 접안할 수 있고, 체육관 전력도 들어갈 거야.', N);
    await say('연안 나룻배도 다시 다녀. 물울림시까지 무료야. 그리고 이건 수리 보상!', N);
    await give('chargestone', 1);
    await say('충전돌이야. 찌리콩이 이 울림에 반응해. 단우 관장님도 체육관을 다시 연대!', N);
    await say('나침돌 계열 동료가 생기면 나한테 와. 자력 맞춤을 가르쳐 줄게.', N);
    Wd().respawn();
  }
  H.lighthouseDone = lighthouseDone;

  // ------------------------------------------------------------ G03 돛바람 체육관: three geared turn switches
  const SW = { s1: { x: 3, y: 12, row: 12, target: 1 }, s2: { x: 11, y: 8, row: 8, target: 3 }, s3: { x: 3, y: 4, row: 4, target: 1 } };
  const SW0 = { s1: 0, s2: 1, s3: 2 };
  const swv = k => (G.S.flags['g3_' + k] === undefined ? SW0[k] : G.S.flags['g3_' + k]);
  const DIRN = ['위', '오른쪽', '아래', '왼쪽'];
  const gymGates = () => {
    G.S.tiles = G.S.tiles || {};
    const t = G.S.tiles.gym3 = G.S.tiles.gym3 || {};
    for (const k of ['s1', 's2', 's3']) { const open = swv(k) === SW[k].target; for (let x = 6; x <= 8; x++) t[x + ',' + SW[k].row] = open ? 'y' : 'Z'; }
    Wd().rebuild('gym3');
  };
  const turnSwitch = async k => {
    const p = Wd().player;
    if (p.y !== SW[k].y + 1) { await say('스위치는 아래쪽(남쪽)에서만 돌릴 수 있게 되어 있다.'); return; }
    const chain = k === 's1' ? ['s1', 's2'] : k === 's2' ? ['s2', 's3'] : ['s3'];
    chain.forEach(c => set('g3_' + c, (swv(c) + 1) % 4));
    sfx('zap');
    gymGates();
    await say(`회전 스위치를 돌렸다! 화살표가 ${DIRN[swv(k)]}을 가리킨다.` + (chain.length > 1 ? '\n톱니로 맞물린 옆 스위치도 함께 한 칸 돌아갔다!' : ''));
  };
  M.gym3 = {
    name: '돛바람 체육관', kind: 'in', floor: 'g', bgm: 'gym',
    rows: [
      '#W####WWW####W#',
      'ggggggyyygggggg', 'ggggggyyygggggg', 'ggggggyyygggggg',
      'qqqYqqZZZqqqqqq',
      'ggggggyyygggggg', 'ggggggyyygggggg', 'ggggggyyygggggg',
      'qqqqqqZZZqqYqqq',
      'ggggggyyygggggg', 'ggggggyyygggggg', 'ggggggyyygggggg',
      'qqqYqqZZZqqqqqq',
      'sgggggyyygggggs',
      'ggggggyyygggggg', 'ggggggyyygggggg',
      'ggggggxxxgggggg'],
    warps: [{ x: 6, y: 16, to: 'harbor', tx: 15, ty: 21, dir: 'down' }, { x: 7, y: 16, to: 'harbor', tx: 15, ty: 21, dir: 'down' }, { x: 8, y: 16, to: 'harbor', tx: 16, ty: 21, dir: 'down' }],
    onTurn: async (x, y) => { const k = Object.keys(SW).find(k => SW[k].x === x && SW[k].y === y); if (k) await turnSwitch(k); },
    gateLine: '전기 차단막이 지지직 울린다. 옆 회전 스위치의 화살표가 회로선을 향하면 꺼질 것 같다.',
    objects: {
      '0,13': async () => say(flag('badge3') ? `돛바람 체육관 관장 단우\n인정받은 길지기: ${P()}` : '돛바람 체육관 관장 단우\n"빛은 방향을 바꿔도 꺼지지 않는다"'),
      '14,13': async () => say('회로 안내판: "회전 스위치의 화살표가 노란 회로선을 향하면 차단막이 꺼집니다.\n스위치는 톱니로 위쪽 스위치와 맞물려 있습니다."')
    },
    npcs: [
      { id: 'g3a', char: 'worker', x: 10, y: 14, dir: 'left', sight: 3,
        trainer: { flag: 'tr_g3a', title: '전기 기사', name: '번개', char: 'worker', team: [['jjirikong', 24], ['tokguri', 25]], base: 24,
          before: '회로를 지나가려면 나부터!', lose: '합선이다...', after: '톡구리는 엄청 빨라. 먼저 맞기 싫으면 교체로 받아 내는 것도 방법이야.' } },
      { id: 'g3b', char: 'sailor', x: 12, y: 6, dir: 'left', sight: 5,
        trainer: { flag: 'tr_g3b', title: '등대지기', name: '윤호', char: 'sailor', team: [['nachimdol', 25], ['tokguri', 26]], base: 24,
          before: '등대를 지키는 사람은 전기를 무서워하지 않지!', lose: '불빛이 꺼졌다...', after: '관장님 자북환은 고리가 울리면 다음 차례에 번개를 떨어뜨려. 그때가 교체할 때야!' } },
      { id: 'g3guide', char: 'man', x: 12, y: 15, dir: 'left', name: '안내원',
        text: () => flag('badge3') ? '축하해! 단우 관장님 강습권으로 공방에서 바위깨기를 배울 수 있어.' : '도전자! 관장 단우는 전기 타입을 다뤄. 땅 타입에는 전기가 통하지 않지.\n자북환이 고리를 울리면 다음 차례에 큰 번개가 와. 교체로 받아 내!' },
      { id: 'leader3', char: 'danu', x: 7, y: 1, dir: 'down', name: '관장 단우',
        talk: async () => {
          const N = '관장 단우';
          if (flag('badge3')) { await say('공방에 가 봐. 무쇠 공방장이 바위깨기를 가르쳐 줄 거야.', N); return; }
          await say('등대를 되살려 줬다며? 고맙다. 나는 돛바람 체육관 관장 단우.\n빛은 방향을 바꿔도 꺼지지 않아. 상대의 속도를 보고, 흐름이 바뀔 때 바꿔 타는 법을 보여 주지.', N);
          const won = await G.battle.trainer({ flag: 'badge3', title: '관장', name: '단우', char: 'danu', smart: true, potion: true, iv: 14, prize: 3000,
            telegraph: { jabukhwan: { moves: ['bolt'], msg: '의 고리가 웅웅 울린다! 다음 차례에 번개가 떨어질 것 같다!', chance: 0.5 } },
            team: [['jjirikong', 25, ['zap', 'quick', 'stun', 'tailwag']], ['tokguri', 27, ['spark', 'swift', 'screech', 'stun']], ['jabukhwan', 30, ['bolt', 'ironbash', 'swift', 'stun']]],
            lose: '...속도를 읽고 바꿔 탔구나. 번개가 떨어질 자리를 비워 둔 판단, 훌륭했다.' });
          if (!won) { await say('지쳤으면 센터에서 쉬고 다시 와. 재도전은 언제든 무료야.\n고리가 울리면 다음 차례에 번개가 온다. 교체를 떠올려 봐.', N); return; }
          await say('돛바람 체육관의 인증, 등대배지다.', N);
          G.audio && G.audio.jingle('badge');
          await say(`${P()}${G.josa(P(), '은', '는')} 관장 단우에게서 등대배지를 받았다!`);
          await give('tm_screen', 1);
          await say('전류막 교본이다. 몸에 전류막을 둘러 특수방어를 크게 올리지. 몇 번이고 쓸 수 있어.', N);
          await give('ticket2', 1);
          await say('그리고 바위깨기 강습권! 공방의 무쇠 공방장에게 보여 줘.\n바람등성이의 낙석을 치우면 바위울림터널 너머로 갈 수 있다.', N);
          await say('...조수연구소의 유라와 공방도 너를 찾더군. 세 번째 배지가 있으면 맡길 일이 있다나.', N);
        } }],
    drawExtra: (T, cx, cy) => {
      // circuit lines from each switch to its gate, lit when the arrow points along them
      for (const k of ['s1', 's2', 's3']) {
        const s = SW[k], on = swv(k) === s.target;
        const X0 = s.x * 16 + 8 - cx, Y0 = s.y * 16 + 8 - cy, gx = (s.x < 6 ? 6 : 8) * 16 + (s.x < 6 ? 0 : 16) - cx;
        T.fillStyle = on ? '#f2d23a' : '#8a90a0';
        if (s.x < 6) T.fillRect(X0 + 6, Y0 - 1, gx - X0 - 6, 3); else T.fillRect(gx, Y0 - 1, X0 - 6 - gx, 3);
        // the arrow on the switch
        const [dx, dy] = [[0, -1], [1, 0], [0, 1], [-1, 0]][swv(k)];
        T.fillStyle = '#ffffff'; for (let i = -3; i <= 4; i++) T.fillRect(X0 + dx * i - 1, Y0 + dy * i - 1, 2, 2);
        T.fillStyle = on ? '#7cf08a' : '#f05a4a'; T.fillRect(X0 + dx * 5 - 2, Y0 + dy * 5 - 2, 4, 4);
      }
    },
    onEnter: async () => { if (!G.S.tiles || !G.S.tiles.gym3) gymGates(); }
  };

  // ------------------------------------------------------------ R10 바람등성이
  M.ridge = {
    name: '바람등성이', kind: 'out', bgm: 'route', rows: ROWS.ridge,
    links: { s: { to: 'harbor', dx: 10 } },
    buildings: [{ k: 'tent', x: 4, y: 19, w: 5, h: 3 }],
    props: [{ k: 'windmill', x: 12, y: 26 }, { k: 'windmill', x: 21, y: 18 }, { k: 'windmill', x: 16, y: 6 }],
    warps: [{ x: 18, y: 1, to: 'tn1', tx: 14, ty: 16, dir: 'up', tdir: 'up' }, { x: 6, y: 21, to: 'shelter', tx: 4, ty: 4, dir: 'up' }],
    signs: { '12,36': '바람등성이\n▲ 북쪽: 바위울림터널   ▼ 남쪽: 돛바람항', '17,2': '바위울림터널 입구\n"동굴등 필수 · 금 간 낙석과 둥근 돌 구간 있음"' },
    items: [{ id: 'superpotion', x: 9, y: 32, flag: 'rg_spot' }, { id: 'awake', x: 20, y: 23, flag: 'rg_awake' }],
    npcs: [
      { id: 'rg1', char: 'hiker', x: 9, y: 31, dir: 'right', sight: 2,
        trainer: { flag: 'tr_rg1', title: '등산가', name: '바람', char: 'hiker', team: [['yeoubul', 26], ['deuldori', 27]], base: 24,
          before: '등성이 바람 맞으며 한판!', lose: '바람이 너를 밀어 주는구먼.', after: '여우불은 꼬리 불꽃으로 길을 비추고, 불발이는 몸을 데워 주지. 둘 다 불 타입이지만 성격이 딴판이야.' } },
      { id: 'rg2', char: 'kidA', x: 13, y: 24, dir: 'left', sight: 2,
        trainer: { flag: 'tr_rg2', title: '캠핑 소년', name: '산들', char: 'kidA', team: [['jjoreu', 26], ['bulbari', 27]], base: 20,
          before: '대피소까지 경주하자! 아니, 승부하자!', lose: '불발이가 꼬리를 내렸어...', after: '대피소 아저씨가 무료로 쉬게 해 줘. 화로 부품도 갖고 계시대.' } },
      { id: 'rg3', char: 'woman', x: 15, y: 13, dir: 'down', sight: 3,
        trainer: { flag: 'tr_rg3', title: '바람 관찰가', name: '나래연', char: 'woman', team: [['yeoubul', 27], ['jjoreu', 27], ['bulbari', 28]], base: 24,
          before: '바람개비가 도는 방향을 보면 날씨를 알 수 있어. 승부의 흐름도!', lose: '바람이 바뀌었네.', after: '터널 안은 바람이 없어. 대신 바위가 울리지. 그 울림에 귀 기울여 봐.' } }],
    triggers: [
      { x: 18, y: 11, cond: () => !flag('rg_wind'), run: async () => { set('rg_wind'); await say('휘이잉— 바람이 세다! 줄난간을 붙잡고 한 걸음씩 걸었다.\n(줄난간을 따라가면 날아갈 걱정은 없다)'); } }],
    onEnter: async () => { visit('ridge'); }
  };
  M.shelter = {
    name: '바람등성이 대피소', kind: 'in', bgm: 'town', heal: [4, 3],
    rows: ['#W######W#', 'B..HH....P', '..........', '..tt......', '..........', '....x.....'],
    warps: [{ x: 4, y: 5, to: 'ridge', tx: 6, ty: 22, dir: 'down' }],
    npcs: [
      { id: 'sh_keeper', char: 'hiker', x: 3, y: 2, dir: 'down', name: '대피소 관리인',
        talk: async () => {
          const N = '대피소 관리인';
          await say('바람등성이 대피소야. 푹 쉬어 가게.', N);
          await G.menus.heal();
          if (!flag('sh_part')) {
            set('sh_part');
            await say('아 참, 공방 무쇠가 화로 부품을 찾는다더군. 여분이 하나 있으니 가져다주게.', N);
            await give('brazierpart', 1);
            return;
          }
          await say('터널 안은 금 간 낙석이 많아. 바위깨기와 동굴등, 잊지 말고!', N);
        } },
      { id: 'sh_tutor', char: 'seokho', x: 7, y: 3, dir: 'left', name: '견습 탐굴사', noTurn: true,
        talk: async () => { await say('기술 복습이나 탐험 기술 교육이 필요하면 말해요.', '견습 탐굴사'); await F().centerService('견습 탐굴사'); } }]
  };
})();

/* 모아루: 잠든 길의 노래 — chapter 3 world, part 2: 푸른숨시(다섯 번째 관장전) · 침전수로 → 굽이강 · 강굽이 쉼터 → 제방들길 → 돌바퀴시(여섯 번째 관장전) · 옛 배차소
   → 높은물길 입구, the revisits of chapters 1-2 (SQ3-05, SQ3-07), and the chapter 3 data for the notebook and the map */
'use strict';
(function () {
  const G = window.G, M = G.MAPS, H = G.mapHelpers;
  const { flag, set, say, give, P } = H;
  const Wd = () => G.world, D = () => G.data, F = () => G.field;
  const visit = id => { G.S.visited = G.S.visited || {}; G.S.visited[id] = 1; };
  const num = k => (G.S.flags[k] | 0);
  const sfx = n => G.audio && G.audio.sfx(n);
  const ROWS = {
    m08: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'Tpppppppppppppppppppwp#########ppppppppCCCpT',
      'Tp######p#####ppppppwp#########p######pCCCpT',
      'Tp######p#####ppppppwp#########p######pCCCpT',
      'Tp######p#####ppppppwp#########p######pCCCpT',
      'Tp##DD##p##D##ppppppwp####D####p##D###pCtCpT',
      'TpppppppppppSpppppppwppppp=ppppppppppppppppT',
      '====================n======================T',
      '====================n======================T',
      'Tppppp==ppppppFFFFFpwpp....ppppppppppSpppppT',
      'Tppppp==ppppppFFFFFpwppb..bppppppppppppppppT',
      'Tppppp==ppppppFFFFFpwpp....ppppppppppppppppT',
      'Tppppp==ppppppppppppwppppppppppppppppppppppT',
      'TwwwwwnnwwwwwwwwwwwwwnnwwwwwwwwwwwwwnnwwwwwT',
      'TwwwwwnnwwwwwwwwwwwwwnnwwwwwwwwwwwwwnnwwwwwT',
      'Tppppp==ppppppp=ppppppppppp=pppppp=ppppppppT',
      'Tp#########pppp=ppppppppppp=pppppp=ppppppppT',
      'Tp#########pp#####ppppppp#####pp#####pGBBGpT',
      'Tp#########pp#####ppppppp#####pp#####pGBBGpT',
      'Tp#########pp#####ppppppp##D##pp##D##pGBBGpT',
      'Tp#########pp##D##ppppppppppppppppppppGBBGpT',
      'Tp####DD###pppppppppppppppppppppppppppGBBGpT',
      'TppppppppppppppppppSpppppppppppppppppppppppT',
      'TGGGGlGGGGGGGGGGGGGGGGGGlGGGGKGGGGGlGGGGGGGT',
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGT',
      'TGGGGGGGGGGGGGGGGGiGGGGGGGGGGGGGGGGGGGGGGGGT',
      'TOOOOOOOddOOOOOOOOOOOOOOOOOOOOddOOOOOOOOOOOT',
      'TOOOOOOOddOOOOOOOOOOOOOOOOOOOOddOOOOOOOOOOOT',
      'TOOOOOOOddOOOOOOOOOOOOOOOOOOOOdhOOOOOOOOOOOT',
      'TOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOT',
      'TOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOT',
      'TOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOT'],
    d10a: [
      '################################',
      '################################',
      '################################',
      '#__________oooooooooooooo______#',
      '#_.....____oooooooooooooo____H_#',
      '#_.i...____oooooooooooooo______#',
      '#_.....____oooooooooooooo______#',
      '#__________oooooooooooooo______#',
      '#__________oooooooooooooo___u__#',
      '#####__####oooooooooooooo______#',
      '#####__####oooooooooooooo______#',
      '#####__####oooooooooooooo______#',
      '#_S________oooooooooooooo______#',
      '#__________oooooooooooooo_...._#',
      '#__________oooooooooooooo_..i._#',
      '#....______oooooooooooooo_...._#',
      '#.i..______ooooooooooooooS_____#',
      '#....______#####################',
      '#__________#####################',
      '#####xx#########################'],
    d10b: [
      '##############################',
      '####v#####oooovooooo#######v##',
      '#________#ooo____ooo#________#',
      '#________#ooo____ooo#________#',
      '#_.....__#ooo____ooo#_....___#',
      '#_.i...__#oooooooooo#_....___#',
      '#_.....__#oooooooooo#________#',
      '#________#oooooooooo#####_####',
      '#_S__________________________#',
      '#____________________________#',
      '#____________________________#',
      '#____________________________#',
      '#___________S________________#',
      '#_________##______##_________#',
      '#_________##______##_________#',
      '#_________##__H___##_________#',
      '##############################',
      '##############################'],
    r15: [
      'TTTTTTTWWWWWWTTTTTTTTTTTTT',
      'TTTTTccWWWWWWccTTTTTTTTTTT',
      'TTTTTccWWWWWWccTTTTTTTTTTT',
      'TTTTTccWWWWWWccTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwww....TTTTTTTTT',
      'TTTTTTTwwwwwwd.S.TTTTTTTTT',
      'TTTTTTTwwwwwwd...TTTTTTTTT',
      'TTTTTTTwwwwww....TTTTTTTTT',
      'TTTTTTTRRRRRRTTTTTTTTTTTTT',
      'TTTTTTTRRRRRRTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTRRRRRRTTTTTTTTTTTTT',
      'TTTTTTTRRRRRRTTTTTTTTTTTTT',
      'TTTTTTTwwwwww...S........T',
      'TTTTTTTwwwwwwd...........T',
      'TTTTTTTwwwwwwd============',
      'TTTTTTTwwwwwwd============',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTRRRRRRTTTTTTTTTTTTT',
      'TTTTTTTRRRRRRTTTTTTTTTTTTT',
      'TTT....wwwwwwTTTTTTTTTTTTT',
      'TTT.S.dwwwwwwTTTTTTTTTTTTT',
      'TTT...dwwwwwwTTTTTTTTTTTTT',
      'TTT....wwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTRRRRRRTTTTTTTTTTTTT',
      'TTTTTTTRRRRRRTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT',
      'TTTTTTTwwwwwwTTTTTTTTTTTTT'],
    h02: [
      'TTTTTTTTTTTTTTTTTTTTwww....T',
      'T........K..........www....T',
      'T..#####..GGGGGGGGG.www....T',
      'T..#####..GGGGGGGGGvwww....T',
      'T..#####..GGGGGGGGG.www....T',
      'T...aaa...qqqqJqqqq.www.S..T',
      'T.........GGGGGGGGG.www....T',
      '===================.www=====',
      '===================.www=====',
      'T........SGGGGGGGGG.www....T',
      'T.........qqquqqqqq.www....T',
      'T.FFFFFF..GGGGGGGGG.www....T',
      'T.F....F..GGGGGGGGG.www....T',
      'T.F....F..GGGGGGGGGvwww....T',
      'T.F....F..GGGGGGGGG.www....T',
      'T.FFFFFF..GGGGGGGGG.www....T',
      'T...................www....T',
      'TTTTTTTTTTTTTTTTTTTTwww....T'],
    r16: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T...zzzzzzzz....................zzzzzzzz...T',
      'T...zzzzzzzz....CCC.............zzzzzzzz...T',
      'T...zzzzzzzz....C.C.......T.....zzzzzzzz...T',
      'T...zzzzzzzz....C.C.............zzzzzzzz...T',
      'T...zzzzzzzz...^.Q.........................T',
      'T.S...........................K...........ST',
      '==============J=============================',
      '==============J=============================',
      'T...................zzzzzzzzzz.....bbQbbb..T',
      'T........T..y.......zzzzzzzzzz...^.b....bT.T',
      'T...................zzzzzzzzzz.....b....b..T',
      'LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL..LLLL',
      'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwdhwwww',
      'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww'],
    m09: [
      'ccccccccccccccccccccccccccccccc=cccccccccccc',
      'TccccccGGGGGGGGGGGGGGGGGcccccccBcccccccccccT',
      'TccccccGG########GG#######cccccQcc########GT',
      'tttttttGG########GG#######GG^G==SG########GT',
      'tttttttGG########GG#######GGGG==GG########GT',
      'TccccccGG########GG#######GGGG==GG########GT',
      'TGGGGGGGG####D###GG###D###GGGG==GG########GT',
      'TGGGGGGGGGGGG=GGGGGGGG=GGGGGGG==GG###DD###GT',
      'TGGGGGGSlGGGG=GGGGGGGG=GGGGGGG==GGGGG==GGGGT',
      '===========================================T',
      '===========================================T',
      'TGGGGGGGGGGGGGGGGGGGlGGSGGGGGGGGGGGGSGGGGGGT',
      'TG######G#####GGGGGGGGG=BBBBBBBBBBBBGGGGBBGT',
      'TG######G#####GG######G=BBBBBBBBBBBBGGGGBBGT',
      'TG######G#####GG######G=BBCCCCCCCCBBGGGGBBGT',
      'TG##DD##G##D##GG######G=BBCGGGGGGCBBGGGGBBGT',
      'TGGG==GGGGG=GGGG##D###G=BBCGGGGGGCBBGGGGBBGT',
      'TGGG==GGGGG=GGGGGG=GGGG=BBCCCCCCCCBBGGGGBBGT',
      'TGGG==GGGGG=GGGGGG=GGGG=BBBBBBBBBBBBGGGGBBGT',
      'TG#####GGGG=GGGGGG=GGGG=BBBBBBBBBBBBGGGGBBGT',
      'TG#####GGGG=GGGGGG=GGGG=GGGGGGGGGGGGGGGGBBGT',
      'TG##D##GGGG====================GGlGGGGGGGGGT',
      'TGGGGGGGaaaaaaaaaaaaaaGGCCCCDDCCCCGGGGGGGGGT',
      'TGGGGGGGaaaaaaaaaaaaaaGGCGGGGGGGGCGGGGGGGGGT',
      'TGlGGGGGaaaaaaaaaaaaaaGGCGGGGGGGGCGKGGGGGGGT',
      'TGGGGGGGaaaaQaaa^aaaaaGGCGGGGGGGGCGGGGGGGGGT',
      'TGGGGGGGaaaaaaaaaaaaaaGGCGGGGGGGGCGGGGGGGGGT',
      'TGGGGGGGaaaaaaaaaaaaaaGGCGGGGGGGGCGGGGGGGGGT',
      'TGGGGGGGaaaaaaaaaaaaaaGGCGGGGGGGGCGGGGGGGGGT',
      'TGGGGGGGaaaaaaaaaaaaaaGGCCCCCCCCCCGGGGGGGGGT',
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'],
    d11b: [
      'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
      'CzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzC',
      'CzzzGGGGGzzzzzzzzzzzzzzzzzzzzzzC',
      'CzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzC',
      'CGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGC',
      'CBBBBBBBuBBBBBBBBBBBBBBBBBBBBBBC',
      'CBBBBBBBuBBBBBBBBBBBBBBBBBBBBBBC',
      'CGGGGGGGGGGGGGGGGGGGGGGGGGGSGGGC',
      'CGGGGGGGGGG##########GGGGGGGGGGC',
      'CGzzzzzzzGG##########GGzzzzzzzGC',
      'CGzzzzzzzGG##########GGzzzzzzzGC',
      'CGzzzzzzzGG##########GGzzzzzzzGC',
      'CGzzzzzzzGG####D#####GGzzzzzzzGC',
      'CGzzzzzzzGGGGGGGGGGGGGGzzzzzzzGC',
      'CGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGC',
      'CCCCCCCCCCCCCCCJJCCCCCCCCCCCCCCC',
      'CGzzzzzzGGGGGGGGGGGGGGGGzzzzzzGC',
      'CGzzzzzzGGSGGGGGGGGGGGGGzzzzzzGC',
      'CGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGC',
      'CCCCCCCCCCCCCCCDDCCCCCCCCCCCCCCC'],
    r17: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T........................T...T',
      'T..y..............zzzzzzzT...T',
      'T.............K...zzzzzzzTTQTT',
      'T...=============.zzzzzzzz...T',
      'T...............=.zzzzzzzz..^T',
      'T.zzzzzzzzzz....=.zzzzzzzz...T',
      'T.zzzzzzzzzz.T..=.zzzzzzzz...T',
      'T.zzzzzzzzzz....=............T',
      'T.zzzzzzzzzz....=............T',
      'T.zzzzzzzzzz....=.......y....T',
      'T.zzzzzzzzzz....=....T.......T',
      'T...............=............T',
      'T......T........=..........S.T',
      'T...zzzzzzzz....=============t',
      'T...zzzzzzzz....=============t',
      'T...zzzzzzzz.y...............T',
      'T...zzzzzzzz.......zzzzzzz...T',
      'T...zzzzzzzz.......zzzzzzz...T',
      'T..................zzzzzzz...T',
      'T............................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'],
    r18: [
      'TTTTTTTTTTWWWWWWTTTTTTTTTT',
      'TTTTTTTTTTWWWWWWTTTTTTTTTT',
      'TTTTTTTTTTWWWWWWTTTTTTTTTT',
      'TTTTTTTTccWWWWWWccTTTTTTTT',
      'TTTTTTTTccWWWWWWccTTTTTTTT',
      'TTTTTTTTccWWWWWWccTTTTTTTT',
      'TTTTTTTTTTTT==TSTTTTTTTTTT',
      'TTTTTTTTTTTT==TTTTTTTTTTTT',
      'TTTT........==TTTTTTTTTTTT',
      'TTTT.NGSGGf.==TTTTTTTTTTTT',
      'TTTT.GGGGGff==TTTTTTTTTTTT',
      'TTTT.GGGGG..==TTTTTTTTTTTT',
      'TTTT........==.F..F.TTTTTT',
      'TTTTTTTTTTTT==...F..TTTTTT',
      'TTTTTTTTTTTT==..F...TTTTTT',
      'TTTTTTTTTTTS==......TTTTTT',
      'TTTTTTTTTTTT==TTTTTTTTTTTT',
      'TTTTTTTTTTTT==TTTTTTTTTTTT',
      'TTTTTTTTTTTT==TTTTTTTTTTTT',
      'TTTTTTTTTTTTT=TTTTTTTTTTTT'],
    oldtrail: [
      'TTTTTTTTTTTTTTTTTTTT',
      'T..S...............T',
      'T........T.........T',
      'T...=.........T....T',
      'T...=..............T',
      'T...================',
      'T.......FFFFFF.....T',
      'T......yFFFFFF..T..T',
      'T..................T',
      'TTTTTTTTTTTTTTTTTTTT']
  };
  const STOCK3 = () => H.STOCK2();

  // the freight shuttle (after Q31): 푸른숨시 ↔ 돌바퀴시, both ways, free
  H.shuttle3 = async (here) => {
    const N = '화차 역무원';
    if (!flag('q31')) { await say('도시간 화차는 옛 배차소 점검 문제로 멈춰 있어요.\n점검 기록이 바로잡히면 푸른숨시와 돌바퀴시를 무료로 이어요.', N); return; }
    const STOPS = [{ k: 'm08', n: '푸른숨시', map: 'm08', x: 38, y: 19, dir: 'right' }, { k: 'm09', n: '돌바퀴시', map: 'm09', x: 39, y: 17, dir: 'down' }].filter(s => s.k !== here && (G.S.visited || {})[s.k]);
    if (!STOPS.length) { await say('아직 다른 역을 다녀온 적이 없네요.', N); return; }
    const ok = await G.ask(`도시간 화차로 ${STOPS[0].n}까지 갈까요? 무료예요!`, ['탈게요', '괜찮아요'], { name: N });
    if (!ok) return;
    const s = STOPS[0];
    sfx('door');
    await G.fadeTo(1, 20); Wd().enter(s.map, s.x, s.y, s.dir); await G.fadeTo(0, 20);
    await say(`덜컹덜컹... 화차가 ${s.n} 역에 닿았다.`);
  };

  // ------------------------------------------------------------ M08 푸른숨시 (white canals, the purification works)
  const RESTING = () => !flag('q27');
  const eunseoTalk = async () => {
    const N = '정화사 은서';
    if (!flag('q26_start')) {
      set('q26_start');
      await say('아, 옛 부두를 이어 준 길지기구나! 가온 대장한테 들었어. 나는 정화사 은서야.', N);
      await say('봐, 진득이들이 정화소 밖 휴식대로 나와 쉬고 있지? 주민들은 동료가 이상해졌다고 걱정해.', N);
      await say('저 애들이 쉬러 나온 건 게을러져서가 아니야. 우리가 맡긴 양부터 살펴보자.', N);
      await say('정화소 작업자 미르 씨랑, 휴식대 옆 아라 씨 이야기를 먼저 들어 봐 줄래?\n나는 장비 기록을 대조하고 있을게.', N);
      return;
    }
    if (!flag('q26')) {
      if (!(flag('q26_i1') && flag('q26_i2'))) { await say('미르 씨는 정화소 입구 앞, 아라 씨는 휴식대 왼쪽에 있어. 두 사람 이야기를 들어 봐.', N); return; }
      await say('먹이량은 그대로인데 처리 장비는 두 배로 돌았구나... 정비 주기도 짧아졌고.\n진득이들이 감당할 수 있는 양보다 찌꺼기가 많아진 거야.', N);
      await say('정화소 아래 침전수로를 같이 살펴 줘. 입장 전에 필요한 걸 줄게.', N);
      await give('map11', 1, true); await give('protkit', 1, true); await give('permit10', 1, true);
      await say(`${P()}${G.josa(P(), '은', '는')} 푸른숨 정화 안내도, 정화소 보호 장비, 정화소 작업 허가증을 받았다!\n(메뉴의 [지도]에 침전수로가 더해졌다)`);
      await say('보호 장비는 가방에 있으면 저절로 써져. 독 동료도 해독제도 필요 없어.\n안내도엔 공공 구역과 취수구 이름, 대피소만 그려 놨어.', N);
      await say('취수층의 기록판에서 원래 취수량을 확인하고, 우회수로·거름틀·휴식대 물길 순서로 되살리면 돼.\n물판으로 건널 곳도 있고, 밀어서 옮길 거름틀도 있을 거야.', N);
      set('q26');
      return;
    }
    if (!flag('q27')) { await say('침전수로는 정화소 입구로 들어가. 취수 기록 → 우회수로 → 교체 거름틀 → 휴식대 물길 순서야.', N); return; }
    // SQ3-03 쉬는 시간도 일 (after Q26; usually picked up after the works are clear)
    const st = num('sq303');
    if (st === 0) {
      await say('수로가 맑아지니 진득이들이 다시 제 양만큼 일하고 있어. 고마워!', N);
      await say('그런데 휴식대가 너무 휑해. 쉬는 시간도 일이잖아.\n그늘막이랑 안내판 자리를 정해야 하는데...', N);
      const ok = await G.ask('휴식대 자리를 같이 정해 줄래? (선택 의뢰)', ['같이 할게요', '나중에요'], { name: N });
      if (!ok) return;
      set('sq303', 1);
      await say('먼저 휴식대의 진득이랑 작업자 미르 씨 이야기를 들어 봐.\n그다음 휴식대 앞 두 기둥 사이에 그늘막을 걸어 보자. 바람과 그늘 표식을 잘 봐!', N);
      return;
    }
    if (st === 1) { await say('진득이와 미르 씨 이야기, 그리고 그늘막 자리! 기둥 앞에서 A 버튼으로 옮길 수 있어. 언제든 다시 옮겨도 돼.', N); return; }
    await say(flag('q28') ? '하진 관장님이 휴식대 안내판을 체육관에도 붙이고 싶대. 쉬는 법도 시험의 일부라나?' : '휴식대가 생기니 다들 표정이 밝아. 하진 관장님 체육관도 다시 열었어.', N);
  };
  const sq303Place = async () => {
    if (num('sq303') !== 1) { await say(flag('sq303_done') || num('sq303') >= 2 ? '그늘막이 휴식대를 시원하게 덮고 있다.' : '휴식대 앞에 그늘막을 걸 수 있는 기둥 두 개가 서 있다.'); return; }
    if (!(flag('sq303_i1') && flag('sq303_i2'))) { await say('그늘막 기둥이다. 먼저 휴식대의 진득이와 작업자 미르 이야기를 듣자.'); return; }
    await say('기둥에 바람·그늘 표식이 붙어 있다.\n"바닷바람 → 동쪽에서 불어옴  · 오후 해 → 서쪽으로 짐"');
    const L = await G.say('그늘막을 어느 쪽으로 걸까? (수동 손잡이로 언제든 다시 옮길 수 있다)', { keep: true });
    const c = await G.choose(['서쪽으로 길게 (오후 그늘이 휴식대를 덮는다)', '동쪽으로 높게 (바람을 정면으로 받는다)', '그대로 두기'], { title: '그늘막 자리', cancel: 2 });
    G.closeText(L);
    if (c === 2 || c < 0) return;
    G.S.flags.sq303_pos = c === 0 ? 'w' : 'e'; sfx('select');
    await say(c === 0 ? '손잡이를 돌려 그늘막을 서쪽으로 길게 걸었다. 휴식대 위로 오후 그늘이 드리운다.' : '손잡이를 돌려 그늘막을 동쪽으로 높게 걸었다. 바닷바람에 그늘막이 펄럭인다.');
    await say('작업자 미르와 동료들에게 동선이 편한지 물어보자.');
  };
  const DIRS4 = ['↑', '→', '↓', '←'];
  M.m08 = {
    name: '푸른숨시', kind: 'out', bgm: 'town', rows: ROWS.m08,
    poolLine: ['맑은 관측 수조다. 바다 동료가 가끔 쉬러 들어온다.', '부두 관측 수조를 가만히 들여다보았다...'],
    buildings: [
      { k: 'center', x: 2, y: 2, w: 6, h: 4, roof: 'red', wall: '#fbf6ee' },
      { k: 'shop', x: 9, y: 2, w: 5, h: 4, roof: 'blue', wall: '#f4f6fa' },
      { k: 'house', x: 22, y: 1, w: 9, h: 5, roof: 'teal', wall: '#eef6f6', wallH: 36, label: '정화소' },
      { k: 'house', x: 32, y: 2, w: 6, h: 4, roof: 'navy', wall: '#f4f8fa', label: '안내실' },
      { k: 'gym', x: 2, y: 16, w: 9, h: 6, roof: 'teal', wall: '#eef6f4', wallH: 40, emblem: 'filter' },
      { k: 'house', x: 13, y: 17, w: 5, h: 4, roof: 'orange', wall: '#f6eee0', label: '운송' },
      { k: 'house', x: 25, y: 17, w: 5, h: 3, roof: 'green' },
      { k: 'house', x: 32, y: 17, w: 5, h: 3, roof: 'blue' }],
    props: [{ k: 'boat', x: 6, y: 27 }, { k: 'crates', x: 37, y: 22 }],
    blocks: [{ x: 31, y: 10 }, { x: 33, y: 10 }, { x: 35, y: 10 }, { x: 24, y: 11 }, { x: 25, y: 11 }, { x: 37, y: 22 },
      { x: 26, y: 5, cond: () => !flag('q26') }, { x: 6, y: 21, cond: () => !flag('q27') }, { x: 7, y: 21, cond: () => !flag('q27') }],
    warps: [
      { x: 4, y: 5, to: 'center_ps', tx: 5, ty: 6, dir: 'up' }, { x: 5, y: 5, to: 'center_ps', tx: 6, ty: 6, dir: 'up' },
      { x: 11, y: 5, to: 'shop_ps', tx: 4, ty: 5, dir: 'up' },
      { x: 26, y: 5, to: 'd10a', tx: 5, ty: 18, dir: 'up', tdir: 'up' },
      { x: 34, y: 5, to: 'guide_ps', tx: 4, ty: 4, dir: 'up' },
      { x: 40, y: 5, to: 'ventroof', tx: 6, ty: 5, dir: 'up', tdir: 'up' },
      { x: 6, y: 21, to: 'gym5', tx: 7, ty: 14, dir: 'up' }, { x: 7, y: 21, to: 'gym5', tx: 7, ty: 14, dir: 'up' },
      { x: 15, y: 20, to: 'freight_ps', tx: 4, ty: 4, dir: 'up' },
      { x: 27, y: 19, to: 'house_ps1', tx: 3, ty: 5, dir: 'up' }, { x: 34, y: 19, to: 'house_ps2', tx: 3, ty: 5, dir: 'up' }],
    links: { w: { to: 'r14', dy: 0, from: 7, until: 8 } },
    seaLine: '푸른숨 부두 앞바다다. 정기선 항로가 해무나루 쪽으로 이어진다.',
    waterLine: '흰 돌로 쌓은 도시 수로다. 물이 맑게 흐른다.',
    noBoard: (x, y) => y >= 13 && y <= 14 || x === 20 ? '도시 수로는 배가 다니지 않는 보행 구역이다. 다리로 건너자.' : null,
    signs: {
      '12,6': '푸른숨시\n"흰 수로와 정화소의 도시"  ▲ 정화소 · 안내실   ▼ 보건 체육관 · 운송 접수소',
      '19,22': '푸른숨 부두\n◀ 정기선 선착장   관찰 잔교 ▶\n"물가 관찰 수조는 원할 때만 들여다보세요"',
      '37,9': '정화소 통풍 골목\n"종이 바람표가 약하게 돌면 환기 담당에게 알려 주세요"'
    },
    objects: {
      '26,5': async () => { if (!flag('q26')) await say('정화소 문에 안내문이 붙어 있다.\n"작업 구역 — 작업 허가증과 보호 장비가 있어야 들어갈 수 있습니다 · 정화사 은서"'); },
      '6,21': async () => { if (!flag('q27')) await say('체육관 문에 안내문이 붙어 있다.\n"정화소 물길 복구를 돕느라 잠시 쉽니다 — 관장 하진"'); },
      '7,21': async () => { if (!flag('q27')) await say('체육관 문에 안내문이 붙어 있다.\n"정화소 물길 복구를 돕느라 잠시 쉽니다 — 관장 하진"'); },
      '24,11': () => sq303Place(), '25,11': () => sq303Place(),
      '31,10': async () => say('종이 바람표가 힘차게 돈다. 깃이 동쪽을 가리키고, 동그라미 문양이 또렷하다.'),
      '35,10': async () => say('종이 바람표가 빙글빙글 돈다. 깃이 동쪽을 가리키고, 세모 문양이 또렷하다.'),
      '33,10': async () => {
        if (flag('sq304_fixed')) { await say('종이 바람표가 다시 힘차게 돈다. 네모 문양 깃이 동쪽을 가리킨다.'); return; }
        await say('종이 바람표가 거의 돌지 않는다. 네모 문양 깃이 아래로 처져 있다.');
        if (num('sq304') === 1 && !flag('sq304_vane')) { set('sq304_vane'); sfx('select'); await say('이 바람표만 흐름이 약하다! 골목 위 통풍탑의 환기 덮개가 막힌 것 같다.\n(환기탑 계단으로 옥상 데크에 올라가 보자)'); }
      }
    },
    npcs: [
      { id: 'eunseo', char: 'eunseo', x: 27, y: 10, dir: 'left', name: '정화사 은서', talk: eunseoTalk },
      { id: 'ps_mir', char: 'worker', x: 28, y: 6, dir: 'down', name: '정화소 작업자 미르',
        talk: async () => {
          const N = '정화소 작업자 미르';
          if (flag('q26_start') && !flag('q26_i1')) {
            set('q26_i1'); sfx('select');
            await say('은서 님이 보냈구나. 솔직히 말하면... 장부에 적힌 처리량이 작년의 두 배예요.\n상회 감독이 증폭 장비를 붙이고, 정비 기간은 반으로 줄였어요.', N);
            await say('진득이들은 아픈 게 아니라, 감당할 수 있는 양을 넘으니까 쉬러 나온 거예요.', N);
            return;
          }
          if (num('sq303') === 1 && !flag('sq303_i2')) {
            set('sq303_i2'); sfx('select');
            await say('휴식대요? 오후엔 해가 서쪽으로 지니까 그늘이 그쪽으로 길게 필요해요.\n바닷바람은 동쪽에서 불어서, 그쪽으로 높이 걸면 그늘막이 펄럭여 진득이들이 놀라요.', N);
            return;
          }
          if (num('sq303') === 1 && flag('sq303_i1') && flag('sq303_i2') && G.S.flags.sq303_pos) {
            if (G.S.flags.sq303_pos !== 'w') { await say('으음, 그늘막이 바람에 펄럭여서 진득이들이 자꾸 고개를 들어요.\n기둥 손잡이로 다시 옮겨 볼래요?', N); return; }
            set('sq303', 2); set('sq303_done');
            sfx('select');
            await say('딱 좋아요! 오후 그늘이 휴식대를 덮어요. 동료들도 편하게 지나다니고요.\n휴식 시간 안내판도 같이 달았어요.', N);
            await say('은서 님 대신 드릴게요. 휴식대 만든 보답이에요!', N);
            await give('token', 2);
            await H.giveTM3('tm_refresh', 1, N);
            H.stamp3('sq303', '쉬는 시간도 일: 휴식대에 그늘막과 휴식 시간 안내판을 달았다.');
            Wd().respawn();
            return;
          }
          await say(flag('q27') ? '정비 주기가 원래대로 돌아왔어요. 진득이들도 제 양만큼만 먹어요.' : '정화소는 지금 감독 지시로 쉬지 않고 돌아가요. 그게 문제예요.', N);
        } },
      { id: 'ps_ara', char: 'woman', x: 22, y: 11, dir: 'right', name: '휴식대 시민 아라',
        talk: async () => {
          const N = '휴식대 시민 아라';
          if (flag('q26_start') && !flag('q26_i2')) {
            set('q26_i2'); sfx('select');
            await say('진득이들이 수로 밖으로 나와서 하루 종일 몸을 말려요. 처음엔 병인 줄 알았어요.\n그런데 쉬고 나면 다시 수로로 돌아가더라고요. 꼭 지쳐서 쉬는 것처럼요.', N);
            return;
          }
          await say(RESTING() ? '진득이를 쫓아내자는 사람도 있었는데... 은서 님이 말렸어요.' : '진득이들이 다시 수로에서 일해요. 휴식대에서 잠깐씩 쉬는 것도 보기 좋아요.', N);
        } },
      { id: 'ps_rio', char: 'rio', x: 34, y: 11, dir: 'left', name: '환기 담당 리오', cond: () => flag('q27'), talk: () => H.rioTalk() },
      { id: 'ps_gymg', char: 'man', x: 8, y: 22, dir: 'down', name: '체육관 관리인', cond: () => !flag('q27'),
        text: '하진 관장님은 정화소 물길 복구를 돕고 계세요. 상태이상 대응을 시험하는 체육관이에요!\n정화소 일이 끝나면 다시 문을 연대요.' },
      { id: 'ps_ferry', char: 'sailor', x: 8, y: 28, dir: 'up', name: '정기선 선장', talk: () => H.ferry3('m08') },
      { id: 'ps_shuttle', char: 'worker', x: 41, y: 19, dir: 'left', name: '화차 역무원', talk: () => H.shuttle3('m08') },
      { id: 'ps_kid', char: 'kidA', x: 16, y: 12, dir: 'down', move: 'wander', name: '푸른숨 꼬마', text: () => flag('q27') ? '환기둥이 통풍탑 위에서 몸을 쫙 폈어! 바람이 잘 통하면 저런대.' : '진득이는 독 타입인데 물지 않아. 그냥 쉬고 있는 거래.' },
      { id: 'ps_old', char: 'elder', x: 10, y: 9, dir: 'right', name: '수로 할아버지', text: '흰 돌 수로는 우리 할아버지의 할아버지가 쌓았지. 물은 흐를 만큼만 흘러야 맑은 법이야.' },
      { id: 'ps_jin1', mon: 'jindeugi', act: 'sniff', x: 24, y: 10, dir: 'right', cond: RESTING, text: '진득이가 휴식대에 납작 엎드려 몸을 말리고 있다. 지쳐 보이지만 아파 보이지는 않는다.' },
      { id: 'ps_jin2', mon: 'jindeugi', act: 'sniff', x: 25, y: 10, dir: 'left', cond: () => true,
        talk: async () => {
          if (num('sq303') === 1 && !flag('sq303_i1')) { set('sq303_i1'); sfx('select'); await say('진득이가 오후 햇살을 피해 서쪽 그늘로 몸을 옮긴다. 바닷바람이 불 때마다 움찔한다.\n(그늘은 서쪽, 바람은 동쪽... 수첩에 적었다)'); return; }
          await say(RESTING() ? '진득이가 휴식대에 늘어져 있다. 몸의 금빛 알갱이가 천천히 빛난다.' : '진득이가 휴식대에서 잠깐 쉬다가, 기운을 차리면 수로로 미끄러져 돌아간다.');
        } },
      { id: 'ps_jin3', mon: 'hoesureong', act: 'hop', x: 24, y: 9, dir: 'down', cond: RESTING, text: '회수렁이 휴식대 끝에 웅크려 있다. 쉬는 무리를 지키는 것 같다.' },
      { id: 'ps_vent', mon: 'hwangidung', act: 'hop', x: 38, y: 4, dir: 'left', text: () => flag('q27') ? '환기둥이 통풍탑 옆에서 막지느러미를 활짝 펴고 있다. 흐름이 잘 통하는 모양이다.' : '환기둥이 통풍탑 옆에서 몸을 잔뜩 웅크리고 있다.' },
      { id: 'ps_huugi', mon: 'huugi', act: 'hop', x: 33, y: 9, dir: 'down', cond: () => !flag('sq304_fixed'), text: '후욱이가 약한 바람표 위에서 같은 자리를 둥실둥실 맴돈다.' },
      { id: 'ps_huugi2', mon: 'huugi', act: 'hop', x: 37, y: 6, dir: 'right', cond: () => flag('sq304_fixed'), text: '후욱이가 이제 같은 자리를 돌지 않고 통풍탑 쪽 바람길을 따라 순찰한다.' }],
    drawExtra: (T, cx, cy) => {
      // paper wind vanes (SQ3-04): different marks and motion, not only colour
      [[31, '○', 1], [33, '□', flag('sq304_fixed') ? 1 : 0], [35, '△', 1]].forEach(([x, mk, ok]) => {
        const X = x * 16 + 8 - cx, Y = 10 * 16 + 12 - cy;
        T.fillStyle = '#6a5a4a'; T.fillRect(X - 1, Y - 12, 2, 13);
        const a = ok ? G.frame / 6 : Math.sin(G.frame / 40) * 0.25 + 1.4;
        for (let i = 0; i < 4; i++) { const ang = a + i * Math.PI / 2; T.fillStyle = i % 2 ? '#f4f0e6' : '#8ac0d8'; T.fillRect(Math.round(X + Math.cos(ang) * 4) - 2, Math.round(Y - 12 + Math.sin(ang) * 4) - 2, 4, 4); }
        G.textC(T, mk, X, Y - 4, '#2c2f45', null);
      });
      // the shade canopy posts, and the canopy and rest sign once SQ3-03 is done
      [24, 25].forEach(x => { T.fillStyle = '#8a6a4a'; T.fillRect(x * 16 + 7 - cx, 11 * 16 - 2 - cy, 2, 16); });
      if (num('sq303') >= 2 || G.S.flags.sq303_pos) {
        const west = G.S.flags.sq303_pos !== 'e';
        T.fillStyle = 'rgba(138,192,216,0.85)'; T.fillRect((west ? 22.5 : 24.5) * 16 - cx, 9 * 16 + 4 - cy, 40, 8);
        T.fillStyle = '#f4f8fa'; T.fillRect((west ? 22.5 : 24.5) * 16 - cx, 9 * 16 + 4 - cy, 40, 2);
      }
      if (num('sq303') >= 2) { const X = 26 * 16 + 4 - cx, Y = 11 * 16 + 2 - cy; T.fillStyle = '#5e3a1a'; T.fillRect(X, Y, 12, 9); T.fillStyle = '#fdf6e4'; T.fillRect(X + 1, Y + 1, 10, 6); T.fillStyle = '#2a8a96'; T.fillRect(X + 3, Y + 3, 6, 1); }
      // the vent tower (환기탑) with its slow fan; it spins freely once the vent cover is clear
      const X = 39 * 16 - cx, Y = 1 * 16 - cy;
      T.fillStyle = '#d6dcde'; T.fillRect(X + 2, Y + 8, 44, 64); T.fillStyle = '#9aa6ae'; T.fillRect(X + 2, Y + 8, 44, 3);
      T.fillStyle = '#5a6670'; T.fillRect(X + 16, Y + 60, 16, 12);
      const sp = flag('sq304_fixed') || flag('q27') ? G.frame / 5 : G.frame / 30;
      for (let i = 0; i < 3; i++) { const ang = sp + i * 2.094; T.strokeStyle = '#2a8a96'; T.lineWidth = 3; T.beginPath(); T.moveTo(X + 24, Y + 28); T.lineTo(X + 24 + Math.cos(ang) * 14, Y + 28 + Math.sin(ang) * 14); T.stroke(); }
      G.disc(T, X + 24, Y + 28, 3, '#f4f8fa');
    },
    onEnter: async () => {
      visit('m08');
      if (!flag('m08_seen')) { set('m08_seen'); await G.wait(10); await say('흰 돌 수로가 도시를 가로지른다. 청록 유리창의 정화소 앞 휴식대에\n진득이들이 납작 엎드려 쉬고 있다.'); }
    }
  };
  H.center('center_ps', '푸른숨시', 'm08', 4, 6);
  H.shop('shop_ps', '푸른숨시', 'm08', 11, 6, STOCK3);
  H.house('house_ps1', '푸른숨 집', 'm08', 27, 20, [
    { id: 'psh1', char: 'woman', x: 5, y: 2, dir: 'down', name: '푸른숨 주민', text: () => flag('q27') ? '수돗물 맛이 달라졌어요! 정화소가 제 속도를 찾았나 봐요.' : '요즘 수돗물에서 쇠 맛이 나요. 정화소가 너무 바쁘대요.' }]);
  H.house('house_ps2', '푸른숨 집', 'm08', 34, 20, [
    { id: 'psh2', char: 'man', x: 1, y: 3, dir: 'right', name: '정화소 퇴직자', text: '정비는 줄이면 안 돼. 장비가 멈추는 게 아니라, 동료들이 대신 버티게 되거든.' },
    { id: 'psh3', mon: 'huugi', act: 'hop', x: 5, y: 4, dir: 'left', text: '후욱이가 창가에서 바람이 드는 쪽으로 둥실 떠 있다.' }]);
  M.guide_ps = {
    name: '정화 안내실', kind: 'in', floor: '_', bgm: 'water',
    rows: ['#W######W#', 'BB..N...BB', '..cccc....', '__________', '__________', '____x_____'],
    warps: [{ x: 4, y: 5, to: 'm08', tx: 34, ty: 6, dir: 'down' }],
    objects: { '4,1': async () => say('정화 안내판: "취수층 → 우회수로 → 거름틀 → 휴식대 물길"\n"동료가 감당할 수 있는 만큼만 맡깁니다 · 푸른숨 정화소"') },
    npcs: [{ id: 'gd1', char: 'clerk', x: 3, y: 1, dir: 'down', name: '안내원',
      text: () => flag('q27') ? '정비표가 돌아왔어요. 이제 정비 주기를 원래대로 지킬 거예요. 고마워요!' : '정화소는 진득이와 회수렁, 환기둥이 함께 일하는 곳이에요.\n요즘은 처리량이 너무 많다고 다들 걱정이에요.' }]
  };
  // 운송 접수소: Q30_start (담소)
  M.freight_ps = {
    name: '푸른숨 운송 접수소', kind: 'in', bgm: 'town',
    rows: ['#W######W#', 'BB..N...BB', '..cccc....', '..........', '.t......t.', '....x.....'],
    warps: [{ x: 4, y: 5, to: 'm08', tx: 15, ty: 21, dir: 'down' }],
    objects: { '4,1': async () => say('운송 게시판: "굽이강 운송 — 강굽이 쉼터 경유 돌바퀴시행"\n"작은 운송 수문 고장으로 일부 운행 중단"') },
    npcs: [{ id: 'damso', char: 'damso', x: 3, y: 1, dir: 'down', name: '운송원 담소',
      talk: async () => {
        const N = '운송원 담소';
        if (!flag('q29')) { await say('운송원 담소예요. 강 위 운송표를 다뤄요. 굽이강은 급류가 많아서 급류타기를 익힌 길지기만 다녀요.\n해무나루 급류 강습장의 여민 교관에게 먼저 배우고 와요!', N); return; }
        if (!flag('q30_start')) {
          await say('급류타기를 배웠군요! 마침 부탁할 게 있어요.', N);
          await say('굽이강 위쪽 강굽이 쉼터에 이 운송표를 전해 줄래요? 작은 운송 수문이 멈춰서\n돌바퀴시로 가는 짐이 다 묶여 있대요.', N);
          await give('map12', 1, true); await give('slip3', 1, true);
          await say(`${P()}${G.josa(P(), '은', '는')} 굽이강 운송도와 강 운송표를 받았다!\n(메뉴의 [지도]에 굽이강 일대가 더해졌다)`);
          await say('운송도엔 허용 급류랑 공공 하선점, 도시 개략만 있어요. 배차소 안쪽 같은 데는 없어요.\n해무나루 북쪽 강어귀에서 물판을 타고 거슬러 올라가요. 첫 하선점이 쉼터예요.', N);
          set('q30_start');
          return;
        }
        if (!flag('q30')) { await say('강굽이 쉼터는 굽이강 첫 동쪽 하선점이에요. 해무나루 북쪽 강어귀에서 출발해요!', N); return; }
        await say(flag('q31') ? '화차가 다시 다녀요! 강 운송도 숨통이 트였어요.' : '수문이 다시 돈대요! 돌바퀴시 운송조합에도 소식이 갔을 거예요.', N);
      } }]
  };
  // the vent tower's rooftop deck (SQ3-04): clear the cover, then turn both handles to the painted wind arrow
  const ROOF_HANDLES = { '3,3': 'sq304_h1', '8,3': 'sq304_h2' };
  const handleAt = async key => {
    const k = ROOF_HANDLES[key];
    if (num('sq304') !== 1 || !flag('sq304_vane')) { await say('환기 덮개의 수동 손잡이다. 바닥에 바람 화살표가 칠해져 있다.'); return; }
    if (!flag('sq304_clear')) { await say('손잡이가 덮개의 이물질에 걸려 돌지 않는다. 덮개부터 치우자.'); return; }
    if (flag('sq304_fixed')) { await say('손잡이가 바람 화살표 방향(→)으로 맞춰져 있다.'); return; }
    const cur = num(k + 'd');
    const c = await G.choose(DIRS4.map(d => '손잡이를 ' + d + ' 쪽으로').concat(['그대로 두기']), { title: `지금 방향: ${DIRS4[cur]}`, cancel: 4 });
    if (c < 0 || c === 4) return;
    G.S.flags[k + 'd'] = c; sfx('select');
    await say(`손잡이를 ${DIRS4[c]} 쪽으로 돌렸다.`);
    if (num('sq304_h1d') === 1 && num('sq304_h2d') === 1) {
      set('sq304_fixed'); sfx('sparkle');
      await say('두 손잡이가 바닥의 바람 화살표와 나란해지자, 덮개 아래로 바람이 시원하게 빠져나간다!\n골목의 바람표가 다시 도는지, 후욱이가 어떻게 움직이는지 내려가서 보자.');
    }
  };
  M.ventroof = {
    name: '환기탑 옥상 데크', kind: 'out', bgm: 'town',
    rows: ['ffffffffffff', 'fppppppppppf', 'fppppppppppf', 'fppppppppppf', 'fppppppppppf', 'fppppppppppf', 'fffffftfffff'],
    warps: [{ x: 6, y: 6, to: 'm08', tx: 40, ty: 6, dir: 'down', tdir: 'down' }],
    blocks: [{ x: 5, y: 1 }, { x: 6, y: 1 }, { x: 3, y: 3 }, { x: 8, y: 3 }],
    objects: {
      '5,1': async () => {
        if (flag('sq304_clear')) { await say('환기 덮개가 깨끗하다. 바람이 잘 빠져나간다.'); return; }
        if (num('sq304') !== 1 || !flag('sq304_vane')) { await say('환기 덮개 위에 낙엽과 비닐 조각이 잔뜩 걸려 있다.'); return; }
        set('sq304_clear'); sfx('leaf');
        await say('덮개에 걸린 낙엽과 비닐 조각을 걷어 냈다! 이제 두 손잡이를 바람 화살표에 맞추자.');
      },
      '6,1': async () => M.ventroof.objects['5,1'](),
      '3,3': () => handleAt('3,3'), '8,3': () => handleAt('8,3')
    },
    drawExtra: (T, cx, cy) => {
      // the vent cover, the painted wind arrow (→) and the two handles
      const X = 5 * 16 - cx, Y = 1 * 16 - cy;
      T.fillStyle = '#5a6670'; T.fillRect(X, Y, 32, 16); T.fillStyle = '#9aa6ae'; for (let i = 2; i < 32; i += 4) T.fillRect(X + i, Y + 2, 2, 12);
      if (!flag('sq304_clear')) { T.fillStyle = '#b08a5a'; T.fillRect(X + 4, Y + 3, 8, 5); T.fillStyle = '#e8e4d8'; T.fillRect(X + 16, Y + 6, 10, 4); T.fillStyle = '#7a8a3a'; T.fillRect(X + 10, Y + 9, 6, 3); }
      T.fillStyle = '#e3b23c'; T.fillRect(3 * 16 - cx, 5 * 16 + 6 - cy, 96, 3); T.beginPath(); T.moveTo(9 * 16 - cx, 5 * 16 + 2 - cy); T.lineTo(9 * 16 + 8 - cx, 5 * 16 + 7 - cy); T.lineTo(9 * 16 - cx, 5 * 16 + 12 - cy); T.fill();
      [['3,3', 'sq304_h1d'], ['8,3', 'sq304_h2d']].forEach(([k, f]) => {
        const [x, y] = k.split(',').map(Number), hx = x * 16 + 8 - cx, hy = y * 16 + 8 - cy, d = num(f);
        G.disc(T, hx, hy, 6, '#3a3e48'); G.disc(T, hx, hy, 5, '#c8ccd6');
        const [dx, dy] = [[0, -1], [1, 0], [0, 1], [-1, 0]][d];
        T.fillStyle = '#e04838'; T.fillRect(hx - 1 + dx * 2, hy - 1 + dy * 2, 2 + Math.abs(dx) * 4, 2 + Math.abs(dy) * 4);
      });
    },
    onEnter: async () => { if (!flag('roof_seen')) { set('roof_seen'); await G.wait(8); await say('통풍탑 옆 옥상 보행 데크다. 푸른숨시의 흰 수로가 한눈에 내려다보인다.'); } }
  };
  H.rioTalk = async () => {
    const N = '환기 담당 리오';
    const st = num('sq304');
    if (st === 0) {
      await say('정화소 환기 담당 리오야! 수로가 맑아지니까 이번엔 골목 바람이 신경 쓰여.', N);
      await say('골목의 종이 바람표 셋 중에 흐름이 약한 하나가 있어.\n색만 보지 말고 깃 방향이랑 움직임, 문양을 봐!', N);
      const ok = await G.ask('약한 바람표를 찾아 줄래? (선택 의뢰)', ['찾아볼게', '나중에'], { name: N });
      if (!ok) return;
      set('sq304', 1);
      await say('약한 바람표를 찾으면, 그 위 통풍탑 계단으로 옥상 데크에 올라가 덮개를 봐 줘.\n불로 태우거나 바람을 들이마시는 건 금지! 손으로 치우고 손잡이만 맞추면 돼.', N);
      return;
    }
    if (st === 1) {
      if (!flag('sq304_fixed')) { await say(flag('sq304_vane') ? '네모 바람표 위 통풍탑이야! 옥상 데크에서 덮개를 치우고 손잡이를 바람 화살표에 맞춰 줘.' : '세 바람표의 깃 방향, 움직임, 문양을 비교해 봐.', N); return; }
      set('sq304', 2);
      await say('바람표가 다시 돈다! 봐, 후욱이가 이제 한자리를 맴돌지 않고 옆 통풍탑 쪽으로 가.\n막힌 흐름을 고치면 동료들이 먼저 알아챈다니까.', N);
      await give('token', 2); await give('berry', 3);
      H.stamp3('sq304', '바람이 멈춘 골목: 통풍탑 덮개를 치우고 손잡이를 바람 화살표에 맞췄다.');
      Wd().respawn();
      return;
    }
    await say('골목 바람이 시원해! 환기둥도 통풍탑 위에서 몸을 쫙 펴고 있어.', N);
  };

  // ------------------------------------------------------------ D10 침전수로 (Q27): intake log → bypass → replacement filter → the rest-platform channel
  const worksRescue = { map: 'm08', x: 26, y: 6, dir: 'down' };
  const kitLine = async () => { if (!flag('d10_kit')) { set('d10_kit'); await say('정화소 보호 장비를 착용했다. 장갑과 덧신, 마스크가 몸에 꼭 맞는다.\n(가방에 있으면 저절로 쓴다)'); } };
  M.d10a = {
    name: '침전수로 취수층', floorName: '취수층', kind: 'cave', theme: 'works', bgm: 'cave', rows: ROWS.d10a,
    poolLine: ['맑은 점검 수조다.', '점검 수조를 가만히 들여다보았다...'],
    rescue: worksRescue,
    warps: [{ x: 5, y: 19, to: 'm08', tx: 26, ty: 6, dir: 'down', tdir: 'down' }, { x: 6, y: 19, to: 'm08', tx: 26, ty: 6, dir: 'down', tdir: 'down' },
      { x: 29, y: 4, to: 'd10b', tx: 14, ty: 14, tdir: 'down' }],
    boulders: [{ id: 'filter', x: 28, y: 11, look: 'filter' }],
    quietSlots: true,
    waterLine: '맑은 청록빛 취수조다. 물판으로 건널 수 있을 것 같다.',
    signs: { '2,12': '침전수로 취수층\n"작업 허가증·보호 장비 착용 구역 · 대피소: 입구 계단"' },
    objects: {
      '5,2': async () => {
        await say('취수 기록판이다. "기준 취수량 100 · 정비 주기 7일"\n그 아래 덧붙은 종이: "증폭 운전 — 취수량 200 · 정비 주기 3일 (감독 지시)"');
        if (!flag('q27_log')) { set('q27_log'); sfx('select'); await say('원래 기록과 지금 운전이 두 배나 다르다! 수첩에 대조해 적었다.\n(아래층의 우회수로 밸브를 찾자)'); }
      },
      '25,16': async () => {
        await say('작업 안내판이다.\n"교체 거름틀은 받침 홈에 밀어 넣을 것"'); const ok = await G.ask('거름틀을 처음 자리로 되돌릴까?');
        if (ok) await F().resetPuzzle();
      }
    },
    onSlot: async (x, y, b) => {
      if (b && b.id === 'filter') { set('q27_filter'); await say('교체 거름틀이 받침 홈에 철컥 맞물렸다! 아래층 거름틀 밸브를 열면 새 거름틀로 물이 지난다.'); }
    },
    npcs: [
      { id: 'd10t1', char: 'worker', x: 7, y: 6, dir: 'down', sight: 3,
        trainer: { flag: 'tr_d10t1', title: '새길상회 작업자', name: '두리', char: 'worker', team: [['jindeugi', 36], ['huugi', 36]], base: 24,
          before: '여기 작업 구역이야! ...허가증이 있다고? 그래도 승부는 해야지!', lose: '허가증보다 실력이 진짜였네.', after: '감독님이 처리량을 두 배로 올리라고 했어. 거름틀 교체는 다음 달로 미루고.' } }],
    onEnter: async () => { visit('d10'); await kitLine(); if (!flag('d10a_seen')) { set('d10a_seen'); await G.wait(8); await say('흰 타일로 둘러싼 넓은 취수조다. 기계 소리가 쉼 없이 웅웅거린다.'); } }
  };
  const VALVES3 = {
    '4,1': { k: 'q27_v1', n: '우회수로 밸브', need: () => flag('q27_log'), needLine: '어느 밸브가 우회수로인지 모르겠다. 취수층의 기록판부터 대조해 보자.', ok: '우회수로가 열렸다! 넘치던 물이 옆 수로로 나뉘어 흐른다. (1/3)' },
    '14,1': { k: 'q27_v2', n: '거름틀 밸브', need: () => flag('q27_v1') && flag('q27_filter'), needLine: () => !flag('q27_v1') ? '우회수로를 먼저 열어야 거름틀로 물을 보낼 수 있다.' : '받침에 교체 거름틀이 없다. 취수층에서 거름틀을 받침 홈에 밀어 넣자.', ok: '새 거름틀로 물이 지나간다! 탁하던 물이 맑아지기 시작한다. (2/3)' },
    '27,1': { k: 'q27_v3', n: '휴식대 물길 밸브', need: () => flag('q27_v2'), needLine: '거름틀 물길이 먼저다. 순서: 우회수로 → 거름틀 → 휴식대.', ok: '휴식대 물길이 다시 돈다! 동료들이 쉬는 물웅덩이에 맑은 물이 찬다. (3/3)' } };
  M.d10b = {
    name: '침전수로 우회수로', floorName: '우회수로', kind: 'cave', theme: 'works', bgm: 'cave', rows: ROWS.d10b,
    poolLine: ['맑은 점검 수조다.', '점검 수조를 가만히 들여다보았다...'],
    rescue: worksRescue,
    warps: [{ x: 14, y: 15, to: 'd10a', tx: 29, ty: 5, tdir: 'down' }],
    boulders: [{ id: 'cork', x: 25, y: 7 }],
    waterLine: '맑은 청록빛 수조다. 물판으로 건널 수 있을 것 같다.',
    signs: { '2,8': '침전수로 우회수로\n"밸브 순서: ① 우회수로(서쪽) ② 거름틀(가운데 섬) ③ 휴식대(동쪽)"', '12,12': '동료 휴식대\n"쉬는 동료를 깨우지 마세요"' },
    onValve: async (x, y) => {
      const v = VALVES3[x + ',' + y]; if (!v) return;
      if (flag(v.k)) { await say(`${v.n}는 이미 열려 있다.`); return; }
      if (!v.need()) { await say(typeof v.needLine === 'function' ? v.needLine() : v.needLine); return; }
      const ok = await G.ask(`${v.n}다. 돌려서 열까?`); if (!ok) return;
      set(v.k); sfx('water');
      await say(v.ok);
      if (v.k === 'q27_v3') {
        await G.wait(20);
        await say('...저벅저벅. 누군가 휴식대 쪽으로 다가온다!');
        Wd().respawn();
        const b = Wd().npc('d10boss'); if (b) await Wd().trainerBattle(b);
      }
    },
    npcs: [
      { id: 'd10boss', char: 'boss', x: 23, y: 14, dir: 'left', sight: 4, cond: () => flag('q27_v3') && !flag('tr_d10boss'),
        trainer: { flag: 'tr_d10boss', title: '새길상회 정화 감독', name: '무겸', char: 'boss', base: 32, prize: 3400, smart: true,
          team: [['hoesureong', 37, ['venomjab', 'sludge', 'bodyslam', 'harden']], ['huugi', 36], ['dokbineul', 37]],
          before: '밸브를 멋대로 돌린 게 너냐! 처리량을 맞추려면 쉴 틈이 없어야 한다고.\n동료가 쉬러 나오면, 그건 장비 탓이 아니라 동료 탓이야!', lose: '...정비표를 빼 둔 건 나다. 하지만 지시는 위에서 왔어.',
          after: '정비 주기를 줄이라는 건 본부 지시였어. 장비 제조 번호는 돌바퀴시 운송 장부에 있을 거다.',
          afterWin: async () => {
            const N = '새길상회 정화 감독 무겸';
            await say('...알았다. 빼 둔 정비표다. 증폭 장비의 제조 번호도 거기 적혀 있어.', N);
            await give('maint', 1, true);
            await say(`${P()}${G.josa(P(), '은', '는')} 누락된 정비표를 받았다!`);
            const b = Wd().npc('d10boss'); if (b) b.hidden = true;
            set('q27');
            G.audio && G.audio.jingle('badge');
            await say('정비표... 찾았구나! 이걸로 정비 주기를 원래대로 돌릴 수 있어.', '정화사 은서');
            await say('증폭 장비 번호는 돌바퀴시 운송 장부랑 맞춰 봐야겠어. 그건 나중 일이고,\n오늘은 휴식대 물길이 돌아온 걸로 충분해. 고마워!', '정화사 은서');
            await say('정기선이 다시 운항해! 해무나루랑 돛바람항으로 갈 수 있어.\n하진 관장님도 체육관 문을 연대. 상태이상 대응 시험, 기대해!', '정화사 은서');
            Wd().respawn();
          } } },
      { id: 'd10t2', char: 'worker', x: 16, y: 10, dir: 'left', sight: 3,
        trainer: { flag: 'tr_d10t2', title: '새길상회 작업자', name: '여름', char: 'worker', team: [['nachimdol', 36], ['hoesureong', 37]], base: 24,
          before: '밸브 건드리지 마! 감독님한테 혼난단 말이야!', lose: '...사실 나도 밸브 순서가 이상하다고 생각했어.', after: '원래는 우회수로부터 여는 거야. 감독님이 그걸 막아 놨지.' } },
      { id: 'd10_rest1', mon: 'jindeugi', act: 'sniff', x: 4, y: 14, dir: 'right', text: () => flag('q27') ? '진득이가 맑아진 물웅덩이에 몸을 담그고 쉰다. 기분 좋은지 금빛 알갱이가 반짝인다.' : '진득이가 마른 휴식대에 납작 엎드려 있다. 물웅덩이가 말라 있다.' },
      { id: 'd10_rest2', mon: 'hoesureong', act: 'hop', x: 24, y: 14, dir: 'left', cond: () => flag('q27'), text: '회수렁이 휴식대에서 쉬다가 천천히 수로로 돌아간다.' }],
    onEnter: async () => { visit('d10'); await kitLine(); if (!flag('d10b_seen')) { set('d10b_seen'); await G.wait(8); await say('밸브 세 개가 달린 우회수로다. 동쪽과 서쪽 휴식대의 물웅덩이가 말라 있다.'); } }
  };

  // ------------------------------------------------------------ G05 푸른숨 보건 체육관 (Q28): three marked corridors, a preparation room, 관장 하진
  M.gym5 = {
    name: '푸른숨 보건 체육관', kind: 'in', floor: 'g', bgm: 'gym',
    rows: [
      '#W####WWW####W#',
      'ggggggggggggggg', 'ggggggggggggggg',
      'qqqqqqgggqqqqqq',
      'qgggqqgggqqgggq', 'qgggqqgggqqgggq', 'qgggqqgggqqgggq', 'qgggqqgggqqgggq', 'qgggqqgggqqgggq', 'qgggqqgggqqgggq',
      'ggggggggggggggg',
      'qqqqqqqgqqqqqqq',
      'ggggggggggggggg',
      'sgggggggggggggs',
      'ggggggggggggggg',
      'ggggggxxxgggggg'],
    warps: [{ x: 6, y: 15, to: 'm08', tx: 6, ty: 22, dir: 'down' }, { x: 7, y: 15, to: 'm08', tx: 7, ty: 22, dir: 'down' }, { x: 8, y: 15, to: 'm08', tx: 7, ty: 22, dir: 'down' }],
    objects: {
      '0,13': async () => say(flag('badge5') ? `푸른숨 보건 체육관 관장 하진\n인정받은 길지기: ${P()}` : '푸른숨 보건 체육관 관장 하진\n"막힌 흐름은 서두르지 말고, 다음 흐름을 읽어라"'),
      '14,13': async () => say('체육관 안내판: "맑은 물은 거름 문양을 지나 흐른다."\n"바람 화살표 길과 숫자 길은 막다른 쉼터입니다"')
    },
    npcs: [
      { id: 'g5nurse', char: 'nurse', x: 3, y: 12, dir: 'down', name: '보건 안내원',
        talk: async () => {
          const N = '보건 안내원';
          await say('시험 준비실이에요. 무료로 쉬어 가요!', N);
          await G.menus.heal();
          await say('독은 차례가 끝날 때마다 체력을 깎아요. 해독제나 맑은숨, 아니면 교체로 끊어 내요.\n잠은 잠깨는약이나 맑은숨, 마비는 마비약! 바닥에 독 함정 같은 건 없어요.', N);
        } },
      { id: 'g5tutor', char: 'clerk', x: 11, y: 12, dir: 'down', name: '기술 복습 창구', talk: async () => { await say('잊은 기술 복습과 탐험 기술 가르치기를 무료로 도와드려요.', '기술 복습 창구'); await F().centerService('기술 복습 창구'); } },
      { id: 'g5a', char: 'eunseo', x: 2, y: 5, dir: 'down', sight: 3,
        trainer: { flag: 'tr_g5a', title: '정화 연구원', name: '물비', char: 'eunseo', team: [['jindeugi', 38], ['ipppuri', 38]], base: 26,
          before: '여긴 바람 화살표 길! 막다른 쉼터지만 승부는 진짜야.', lose: '화살표만 따라오면 막다른 길이라니까!', after: '관장님 길은 거름 문양이 그려진 가운데 길이야.' } },
      { id: 'g5b', char: 'swimmer', x: 12, y: 5, dir: 'down', sight: 3,
        trainer: { flag: 'tr_g5b', title: '수질 측정원', name: '보미', char: 'swimmer', team: [['deungbulhaepa', 38], ['huugi', 38], ['haeryudeung', 39]], base: 26,
          before: '숫자 길에 온 걸 환영해. 숫자는 그냥 숫자야!', lose: '독에 강한 상대였구나.', after: '등불해파도 독 타입이야. 땅 기술이 잘 들어. 하지만 비행 타입엔 안 통해!' } },
      { id: 'g5c', char: 'woman', x: 7, y: 7, dir: 'down', sight: 3,
        trainer: { flag: 'tr_g5c', title: '보건 교사', name: '다솜', char: 'woman', team: [['mearung', 38], ['jindeugi', 39]], base: 26,
          before: '거름 문양 길을 골랐구나! 관장님께 가려면 나를 넘어야 해.', lose: '상태이상에도 흔들리지 않는구나.', after: '관장님 환기둥이 막지느러미를 펴면, 다음 차례에 바람베기가 와. 그때 바꿔 타!' } },
      { id: 'g5guide', char: 'man', x: 12, y: 14, dir: 'left', name: '안내원',
        text: () => flag('badge5') ? '축하해! 해무나루 급류 강습장의 여민 교관님께 가 봐. 정기선을 타면 금방이야.' : '도전자! 관장 하진은 독 타입 전문이야. 땅·에스퍼 기술이 잘 통하지만,\n마지막 환기둥은 비행 타입이라 땅 기술이 안 들어. 전기나 바위, 물 기술도 준비해!' },
      { id: 'leader5', char: 'hajin', x: 7, y: 1, dir: 'down', name: '관장 하진',
        talk: async () => {
          const N = '관장 하진';
          if (flag('badge5')) { await say('급류 강습장의 여민에게 가 봐. 다음 흐름은 강이야.', N); return; }
          await say('정화소 물길을 되살려 줘서 고마워. 나는 푸른숨 보건 체육관 관장 하진.\n독은 무섭기보다 성가신 거야. 걸린 동료를 바꾸고, 치료하고, 다음 행동을 읽어 봐.', N);
          const won = await G.battle.trainer({ flag: 'badge5', title: '관장', name: '하진', char: 'hajin', smart: true, potion: true, iv: 18, prize: 4000,
            lead: { dokbineul: 'glare' },
            telegraph: { hwangidung: { moves: ['aircut'], msg: '이(가) 막지느러미를 활짝 펼친다! 다음 차례에 바람베기가 올 것 같다!', chance: 0.5 },
              hoesureong: { moves: ['bodyslam'], msg: '이(가) 몸을 낮게 웅크린다! 다음 차례에 덮쳐누르기가 올 것 같다!', chance: 0.4 } },
            team: [['dokbineul', 39, ['venomjab', 'bite', 'glare', 'bind']], ['hoesureong', 40, ['venomjab', 'sludge', 'bodyslam', 'harden']],
              ['mearung', 40, ['wingcut', 'venomjab', 'bite', 'ultrasonic']], ['hwangidung', 41, ['sludge', 'aircut', 'poisongas', 'harden']]],
            lose: '...흐름이 막히기 전에 바꿨구나. 좋은 판단이야.' });
          if (!won) { await say('지쳤으면 준비실에서 쉬고 다시 와. 재도전은 언제든 무료야.\n독은 교체로 끊어 낼 수 있어. 막지느러미가 펴지면 바꿔 탈 때야.', N); return; }
          await say('푸른숨 보건 체육관의 인증, 푸른숨배지야.', N);
          G.audio && G.audio.jingle('badge');
          await say(`${P()}${G.josa(P(), '은', '는')} 관장 하진에게서 푸른숨배지를 받았다!`);
          await give('tm_sludge', 1);
          await say('독물튀기기 교본이야. 독 타입 동료라면 누구나 배울 수 있어.', N);
          await say('해무나루 급류 강습장의 여민이 기다리고 있을 거야. 다섯 번째 배지면 급류타기를 배울 수 있거든.\n정기선을 타면 금방이야.', N);
          set('q28');
        } }],
    drawExtra: (T, cx, cy) => {
      // corridor marks at the hub: wind arrow (A), filter mesh (B, the right way), number 3 (C)
      const mark = (x, draw) => { const X = x * 16 - cx, Y = 10 * 16 - cy; T.fillStyle = '#ffffff'; T.fillRect(X + 1, Y + 1, 46, 14); draw(X, Y); };
      mark(1, (X, Y) => { T.fillStyle = '#4a90e2'; T.fillRect(X + 10, Y + 7, 26, 2); T.beginPath(); T.moveTo(X + 36, Y + 3); T.lineTo(X + 42, Y + 8); T.lineTo(X + 36, Y + 13); T.fill(); });
      mark(6, (X, Y) => { T.fillStyle = '#2a8a96'; for (let i = 6; i < 44; i += 5) T.fillRect(X + i, Y + 3, 1, 10); T.fillRect(X + 6, Y + 3, 37, 1); T.fillRect(X + 6, Y + 12, 37, 1); });
      mark(11, (X, Y) => { G.textC(T, '3', X + 24, Y + 1, '#c84a3c', null); });
    }
  };

  // ------------------------------------------------------------ R15 굽이강 (river; marked current bands, a waterfall at the head)
  M.r15 = {
    name: '굽이강', kind: 'out', bgm: 'water', rows: ROWS.r15, currents: true,
    links: { s: { to: 'm07', dx: 8, from: 7, until: 12, gated: 1 }, e: { to: 'h02', dy: -15, from: 22, until: 23 } },
    rescue: () => (G.S.visited || {}).h02 ? { map: 'h02', x: 5, y: 7, dir: 'down', n: '강굽이 쉼터' } : { map: 'm07', x: 17, y: 8, dir: 'down', n: '해무나루 강어귀' }, rescueKind: 'water',
    waterLine: '잔잔한 강물이다. 가느다란 물결 화살표가 위쪽을 가리킨다.',
    signs: { '16,20': '강굽이 쉼터 ▶\n"운송 점검로 · 무료 휴식"', '4,32': '구조 요청 지점\n"지치면 메뉴의 [구조 요청] — 해무나루 구조대"', '15,7': '폭포 아래 하선점\n"높은 폭포는 오를 수 없습니다"' },
    items: [{ id: 'hyperpotion', x: 14, y: 8, flag: 'r15_top' }, { id: 'goldcube', n: 3, x: 3, y: 31, flag: 'r15_west' }],
    npcs: [
      { id: 'r15s1', char: 'swimmer', swim: true, x: 9, y: 25, dir: 'down', sight: 3,
        trainer: { flag: 'tr_r15s1', title: '급류 수영인', name: '여울', char: 'swimmer', team: [['silhaema', 38], ['meongburi', 38], ['pomal', 38]], base: 24,
          before: '급류 띠를 건너왔구나! 고정끈 매듭은 단단해?', lose: '물살보다 네가 더 셌어.', after: '굵은 물결 띠만 급류야. 가느다란 화살표 물은 잔잔해서 쉬어 가도 돼.' } },
      { id: 'r15f1', char: 'fisher', x: 4, y: 33, dir: 'right', sight: 2,
        trainer: { flag: 'tr_r15f1', title: '강 낚시꾼', name: '물안개', char: 'fisher', team: [['mulgyeolburi', 39], ['silhaema', 38]], base: 24,
          before: '하선점에서 쉬려던 참인데, 승부라면 환영이지!', lose: '오늘은 내가 낚였네.', after: '구조 요청 지점에선 언제든 구조대를 부를 수 있어. 무리하지 마.' } }],
    drawExtra: (T, cx, cy) => {
      // yellow marker posts on both banks of every current band (marked = allowed), thin upstream arrows on calm water
      [10, 18, 29, 36].forEach(y => [6, 13].forEach(x => { const X = x * 16 + 8 - cx, Y = y * 16 + 4 - cy; T.fillStyle = '#5e3a1a'; T.fillRect(X - 1, Y, 2, 22); T.fillStyle = '#f2d23a'; T.fillRect(X - 3, Y, 6, 4); T.fillRect(X - 3, Y + 8, 6, 2); }));
      for (let y = 4; y < 44; y += 5) for (let x = 8; x < 12; x += 3) {
        const m = Wd().map; if (m.at(x, y) !== 'w') continue;
        const X = x * 16 + 8 - cx, Y = y * 16 + 8 - cy - (Math.floor(G.frame / 12) % 4);
        T.fillStyle = 'rgba(232,246,255,0.8)'; T.fillRect(X, Y - 3, 1, 6); T.fillRect(X - 1, Y - 2, 3, 1);
      }
    },
    onEnter: async () => {
      visit('r15');
      if (!flag('r15_seen')) { set('r15_seen'); await G.wait(10); await say('강물이 굽이굽이 흐른다. 군데군데 굵은 물결 띠가 하얗게 부서진다.\n노란 표식이 서 있는 띠는 급류타기로 건널 수 있는 길이다.'); }
    }
  };

  // ------------------------------------------------------------ H02 강굽이 쉼터 (Q30): the small freight sluice
  const sluiceDone = () => flag('q30');
  const openBridge = () => { for (let x = 20; x <= 22; x++) for (let y = 7; y <= 8; y++) F().setTile('h02', x, y, 'n'); };
  M.h02 = {
    name: '강굽이 쉼터', kind: 'out', bgm: 'route', rows: ROWS.h02, heal: [5, 7], healLine: '쉼터지기 강물: 모닥불 옆에서 푹 쉬었어요. 다들 기운을 차렸네요!',
    buildings: [{ k: 'tent', x: 3, y: 2, w: 5, h: 3 }],
    props: [{ k: 'fire', x: 5, y: 5 }, { k: 'crates', x: 24, y: 2 }],
    blocks: [{ x: 5, y: 5 }, { x: 24, y: 2 }],
    links: { w: { to: 'r15', dy: 15, from: 7, until: 8 }, e: { to: 'r16', dy: 0, from: 7, until: 8 } },
    noBoard: '수문 수로는 물살이 빨라서 물판을 펼칠 수 없다.\n(작은 운송 수문이 다시 돌면 낮은 운송 다리가 놓인다)',
    boulders: [{ id: 'cw', x: 13, y: 9 }],
    quietSlots: true,
    signs: { '9,9': '강굽이 쉼터 점검로\n"평형추 받침 → 윈치 순서로 점검"', '24,5': '제방들길 ▶ 돌바퀴시\n"낮은 운송 다리 건너편"' },
    onSlot: async () => { set('q30_seat'); await say('평형추 돌이 받침 홈에 쿵 하고 맞물렸다! 수문 레일의 작은 받침이 복구되었다.\n이제 북쪽 윈치를 다시 이어 돌리면 된다.'); },
    onValve: async (x, y) => {
      if (y === 13) { await say(flag('q30_seat') ? '수문 수위계. 바늘이 초록 칸에 들어왔다. 평형추가 제자리에 있다.' : '수문 수위계. 바늘이 빨간 칸에 걸려 있다. 평형추 받침이 비어 있는 것 같다.'); return; }
      if (sluiceDone()) { await say('윈치가 단단히 감겨 있다. 낮은 운송 다리가 수로를 건너 놓여 있다.'); return; }
      if (!flag('q30_brief')) { await say('운송 수문의 수동 윈치다. 쉼터지기에게 먼저 사정을 듣자.'); return; }
      if (!flag('q30_seat')) { await say('윈치를 돌려 봤지만 헛돈다. 평형추 받침이 비어 있다.\n아래쪽 점검로의 받침 홈에 평형추 돌을 먼저 맞추자.'); return; }
      const ok = await G.ask('수동 윈치다. 줄을 다시 이어 돌릴까?'); if (!ok) return;
      sfx('knock2'); Wd().shake = 8;
      openBridge();
      set('q30');
      G.audio && G.audio.jingle('learn');
      await say('끼릭끼릭... 윈치가 감기며 작은 운송 수문이 올라갔다!\n수로 위로 낮은 운송 다리가 내려와 동쪽 제방길과 이어졌다.');
      await say('해냈네요! 이제 짐도 사람도 다리로 건널 수 있어요. 돌바퀴시는 제방들길 끝이에요.', '쉼터지기 강물');
      if (G.S.bag.slip3) D().useItem('slip3');
      await say('돌바퀴시 운송조합에 이 소식을 전해 줄래요? 조사원 시온 씨가 장부 문제로 골치 아파한대요.', '쉼터지기 강물');
    },
    npcs: [
      { id: 'h02_keeper', char: 'hiker', x: 8, y: 6, dir: 'down', name: '쉼터지기 강물',
        talk: async () => {
          const N = '쉼터지기 강물';
          await say('강굽이 쉼터예요. 잠깐 쉬어 가요!', N);
          await G.menus.heal();
          if (flag('q30_start') && !flag('q30_brief')) {
            set('q30_brief');
            await say('담소 씨 운송표군요! 고마워요. 그런데 짐을 보낼 수가 없어요.\n작은 운송 수문이 멈춰서, 동쪽 제방으로 가는 다리가 안 내려와요.', N);
            await say('점검로를 따라가면 돼요. 무거운 장비는 필요 없어요.\n평형추 받침을 먼저 복구하고, 북쪽 수동 윈치를 다시 이어 돌리면 돼요.', N);
            await say('점검로 북쪽은 작은 낙석이 막고 있어요. 바위깨기로 치울 수 있을 거예요.', N);
            return;
          }
          if (!flag('q30')) { await say(flag('q30_brief') ? '평형추 받침 → 북쪽 윈치 순서예요. 점검로 돌판... 아니, 돌이 엉키면 저한테 말해요!' : '여긴 굽이강 첫 하선점이에요. 지친 동료가 있으면 언제든 쉬어 가요.', N);
            if (flag('q30_brief') && !flag('q30_seat')) { const ok = await G.ask('평형추 돌을 처음 자리로 되돌릴까요?', ['네', '괜찮아요'], { name: N }); if (ok) await F().resetPuzzle(); }
            return; }
          await say('다리가 놓이니 쉼터도 북적이네요. 돌바퀴시는 동쪽 제방들길 끝이에요!', N);
        } },
      { id: 'h02_rescue', char: 'sailor', x: 2, y: 9, dir: 'right', name: '구조대원 물결',
        text: '강 위에서 지치면 메뉴의 [구조 요청]! 여기 쉼터나 해무나루 강어귀로 데려다 줄게요.' },
      { id: 'h02_t1', char: 'worker', x: 16, y: 3, dir: 'left', sight: 3,
        trainer: { flag: 'tr_h02t1', title: '운송 작업자', name: '바퀴', char: 'worker', team: [['teoneolgup', 39], ['jebangjipge', 39]], base: 24,
          before: '수문 고치러 왔다고? 그럼 실력부터 보자!', lose: '이 실력이면 윈치도 문제없겠네.', after: '평형추가 빠지면 윈치가 헛돌아. 받침부터 맞춰.' } },
      { id: 'h02_pomal', mon: 'pomal', act: 'splash', x: 24, y: 12, dir: 'left', cond: sluiceDone, text: '포말이가 강을 거슬러 쉼터까지 놀러 왔다.' },
      { id: 'h02_crab', mon: 'chalkakge', act: 'sniff', x: 18, y: 15, dir: 'left', text: '찰칵게가 수로 가장자리 흙을 집게로 꾹꾹 다지고 있다.' }],
    onEnter: async () => {
      visit('h02');
      if (sluiceDone() && Wd().getMap('h02').at(21, 7) !== 'n') openBridge();
      if (!flag('h02_seen')) { set('h02_seen'); await G.wait(10); await say('강가의 작은 쉼터다. 천막 옆 모닥불이 따뜻하다.\n동쪽 수로 건너편으로 가는 다리가 걷혀 있다.'); }
    }
  };

  // ------------------------------------------------------------ R16 제방들길 (levee paths; small cracked stones and big haul stones)
  M.r16 = {
    name: '제방들길', kind: 'out', bgm: 'route', rows: ROWS.r16,
    links: { w: { to: 'h02', dy: 0, from: 7, until: 8 }, e: { to: 'm09', dy: 2, from: 7, until: 8 } },
    hauls: [{ id: 'store', x: 17, y: 5, to: [15, 5], floor: '.' }, { id: 'bank', x: 37, y: 9, to: [33, 10], floor: '.' }],
    signs: { '2,6': '제방들길\n◀ 강굽이 쉼터   ▶ 돌바퀴시', '42,6': '돌바퀴시 ▶\n"석조 창고와 원형 선로의 운송도시"' },
    items: [{ id: 'hyperpotion', n: 2, x: 17, y: 3, flag: 'r16_store' }, { id: 'moonstone', x: 17, y: 4, flag: 'r16_store2' }, { id: 'goldcube', n: 3, x: 37, y: 11, flag: 'r16_bank' }],
    npcs: [
      { id: 'r16t1', char: 'hiker', x: 8, y: 9, dir: 'up', sight: 3,
        trainer: { flag: 'tr_r16t1', title: '제방 순찰원', name: '둑길', char: 'hiker', team: [['chalkakge', 39], ['heukkori', 39], ['deuldori', 40]], base: 24,
          before: '제방은 다 같이 지키는 길이야! 실력 좀 보자.', lose: '네 동료도 둑처럼 단단하구나.', after: '작은 금 간 돌은 바위깨기, 고리 문양 큰 돌은 괴력운반이 있어야 해. 문양을 잘 봐.' } },
      { id: 'r16t2', char: 'worker', x: 25, y: 6, dir: 'down', sight: 2,
        trainer: { flag: 'tr_r16t2', title: '운송 작업자', name: '덤프', char: 'worker', team: [['sagureu', 40], ['jagalkong', 39]], base: 24,
          before: '짐 나르다 쉬는 중인데, 한판?', lose: '쉬는 시간 끝!', after: '돌바퀴시 화차는 배차소 문제로 멈췄어. 장부가 엉망이래.' } },
      { id: 'r16t3', char: 'kidB', x: 34, y: 2, dir: 'down', sight: 3,
        trainer: { flag: 'tr_r16t3', title: '들판 소녀', name: '이슬', char: 'kidB', team: [['huugi', 39], ['moraekong', 39], ['chalkakge', 40]], base: 22,
          before: '찰칵게 둑 구경 왔어? 나랑 먼저 승부!', lose: '찰칵게가 둑을 다시 쌓기 시작했어.', after: '찰칵게는 파도가 둑을 넘으면 더 넓게 다시 쌓아. 멋지지?' } },
      { id: 'r16_crab', mon: 'jebangjipge', act: 'sniff', x: 22, y: 11, dir: 'right', text: '제방집게가 넓은 집게로 둑 가장자리를 꾹꾹 다진다. 사람의 둑도 같은 길로 여기는 것 같다.' }],
    onEnter: async () => { visit('r16'); if (!flag('r16_seen')) { set('r16_seen'); await G.wait(10); await say('강을 따라 낮은 제방길이 이어진다. 찰칵게들이 둑 가장자리를 다지고 있다.'); } }
  };

  // ------------------------------------------------------------ M09 돌바퀴시 (stone warehouses, the cart track, the loading yard)
  const north = () => F().hauled('m09', 'north');
  M.m09 = {
    name: '돌바퀴시', kind: 'out', bgm: 'town', rows: ROWS.m09, haulFloor: 'G',
    buildings: [
      { k: 'house', x: 9, y: 2, w: 8, h: 5, roof: 'orange', wall: '#f2e6d0', wallH: 36, label: '운송조합' },
      { k: 'house', x: 19, y: 2, w: 7, h: 5, roof: 'navy', wall: '#eef0f4', label: '기록원' },
      { k: 'gym', x: 34, y: 2, w: 8, h: 6, roof: 'grey', wall: '#eeece6', wallH: 40, emblem: 'wheel' },
      { k: 'center', x: 2, y: 12, w: 6, h: 4, roof: 'red', wall: '#fbf6ee' },
      { k: 'shop', x: 9, y: 12, w: 5, h: 4, roof: 'blue', wall: '#f4f6fa' },
      { k: 'house', x: 16, y: 13, w: 6, h: 4, roof: 'orange' },
      { k: 'house', x: 2, y: 19, w: 5, h: 3, roof: 'grey' }],
    props: [{ k: 'crates', x: 9, y: 23 }, { k: 'crates', x: 19, y: 28 }, { k: 'cart', x: 36, y: 13 }],
    blocks: [{ x: 9, y: 23 }, { x: 19, y: 28 }, { x: 20, y: 23 }, { x: 36, y: 13 }, { x: 37, y: 13 },
      { x: 28, y: 22, cond: () => !flag('q31_start') }, { x: 29, y: 22, cond: () => !flag('q31_start') }],
    warps: [
      { x: 13, y: 6, to: 'union_db', tx: 5, ty: 5, dir: 'up' }, { x: 22, y: 6, to: 'archive_db', tx: 4, ty: 4, dir: 'up' },
      { x: 37, y: 7, to: 'gym6', tx: 7, ty: 14, dir: 'up' }, { x: 38, y: 7, to: 'gym6', tx: 7, ty: 14, dir: 'up' },
      { x: 4, y: 15, to: 'center_db', tx: 5, ty: 6, dir: 'up' }, { x: 5, y: 15, to: 'center_db', tx: 6, ty: 6, dir: 'up' },
      { x: 11, y: 15, to: 'shop_db', tx: 4, ty: 5, dir: 'up' },
      { x: 18, y: 16, to: 'house_db1', tx: 3, ty: 5, dir: 'up' }, { x: 4, y: 21, to: 'house_db2', tx: 3, ty: 5, dir: 'up' },
      { x: 28, y: 22, to: 'd11b', tx: 15, ty: 18, dir: 'down', tdir: 'up' }, { x: 29, y: 22, to: 'd11b', tx: 16, ty: 18, dir: 'down', tdir: 'up' }],
    links: {
      w: [{ to: 'r16', from: 9, until: 10, dy: -2 }, { to: 'r17', from: 3, until: 4, dy: 11 }],
      n: { to: 'r18', dx: -18, from: 31, until: 31, gated: 1, cond: north }
    },
    hauls: [
      { id: 'yard', x: 12, y: 25, to: [16, 25], floor: 'a', cond: () => flag('q33_start'), condLine: '적재장 연습 운반석이다. 도담의 수업 때 옮기자.',
        onDone: async () => { if (!flag('q33_lesson1')) { set('q33_lesson1'); await say('좋아! 이번엔 받침 앞에서 A 버튼으로 되돌려 봐. 잘못 옮겨도 언제든 돌릴 수 있어야 하거든.', '적재원 도담'); } },
        onUndo: async () => { if (flag('q33_lesson1') && !flag('q33_lesson')) { set('q33_lesson'); await say('완벽해! 게시판의 [전체 초기화]로 모든 연습 돌을 처음 자리로 돌릴 수도 있어.\n이제 북쪽 길 끝의 표식 운반석을 레일 받침으로 옮겨 줘. 높은물길 입구가 열릴 거야.', '적재원 도담'); } } },
      { id: 'north', x: 31, y: 2, to: [28, 3], floor: 'B', cond: () => flag('q33_lesson'), condLine: '레일 표식이 칠해진 커다란 운반석이다. 적재원 도담의 수업을 마치면 옮길 수 있다.', lock: () => flag('q33'),
        lockLine: '운반석이 레일 받침에 단단히 고정되어 있다. 높은물길로 가는 길이다.',
        onDone: async () => {
          if (flag('q33')) return;
          set('q33');
          G.audio && G.audio.jingle('badge');
          await say('운반석이 레일 받침에 꼭 맞게 내려앉았다!\n북쪽 좁은 선로 너머로 높은물길 입구가 열렸다.');
          await say('함께 들었지? 힘은 나누면 가벼워져. 높은물길 첫 전망대에서 시온 씨가 기다린대!', '적재원 도담');
          Wd().respawn();
        } }],
    signs: {
      '7,8': '돌바퀴시\n"석조 창고와 원형 선로의 운송도시"  ◀ 제방들길 · 언덕 계단',
      '23,11': '원형 선로\n"화차가 지날 때는 건너지 마세요 (지금은 운행 중지)"',
      '36,11': '돌바퀴 화차역\n"푸른숨시행 도시간 화차"',
      '32,3': '높은물길 선로\n"표식 운반석을 받침에 옮겨야 통행 가능 · 적재장 관리"'
    },
    objects: {
      '28,22': async () => { if (!flag('q31_start')) await say('옛 배차소 문이 굳게 잠겨 있다.\n"점검 기록 열람은 운송조합 허가 필요 — 운송조합 조사원 시온"'); },
      '29,22': async () => { if (!flag('q31_start')) await say('옛 배차소 문이 굳게 잠겨 있다.\n"점검 기록 열람은 운송조합 허가 필요 — 운송조합 조사원 시온"'); },
      '20,23': async () => {
        await say('적재장 게시판: "괴력운반 연습장 · 받침 앞 A = 되돌리기"');
        if (!flag('q33_start')) return;
        const ok = await G.ask('[전체 초기화] 연습 운반석을 모두 처음 자리로 돌릴까?'); if (ok) await F().resetHauls();
      }
    },
    npcs: [
      { id: 'dodam', char: 'dodam', x: 14, y: 23, dir: 'down', name: '적재원 도담', talk: () => H.dodamTalk() },
      { id: 'noeul', char: 'worker', x: 18, y: 27, dir: 'left', name: '적재장 작업자 노을', talk: () => H.noeulTalk() },
      { id: 'db_shuttle', char: 'worker', x: 42, y: 16, dir: 'left', name: '화차 역무원', talk: () => H.shuttle3('m09') },
      { id: 'db_greet', char: 'man', x: 2, y: 8, dir: 'right', name: '돌바퀴 안내원',
        text: () => flag('q31') ? '화차가 다시 다녀요! 운송조합이 장부를 공개했대요.' : '돌바퀴시에 어서 와요! 운송조합은 북쪽 주황 지붕, 센터는 서쪽이에요.\n배차소 장부 문제로 화차가 멈춰서 다들 걱정이에요.' },
      { id: 'db_worker', char: 'worker', x: 30, y: 21, dir: 'up', name: '배차소 경비', cond: () => !flag('q31_start'),
        text: '옛 배차소는 출입 금지예요. 운송조합 시온 씨 허가가 있어야 해요.' },
      { id: 'db_kid', char: 'kidA', x: 24, y: 10, dir: 'down', move: 'wander', name: '돌바퀴 꼬마', text: '산받곰이 짐을 들어 주면 아저씨들이 "고마워" 하고 쉬어. 혼자 다 들면 안 된대!' },
      { id: 'db_elder', char: 'elder', x: 16, y: 9, dir: 'down', name: '석공 할아버지', text: () => flag('q32') ? '규호 관장이 배지를 줬다고? 그 녀석, 힘보다 나누는 걸 먼저 배운 놈이지.' : '이 도시 창고는 전부 돌을 깎아 쌓았지. 바퀴도 돌이었다니까.' },
      { id: 'db_bear', mon: 'sanbatgom', act: 'hop', x: 10, y: 27, dir: 'right', text: '산받곰이 적재장에서 무거운 상자를 사람들과 나눠 들고 있다.' },
      { id: 'db_crab', mon: 'jebangjipge', act: 'sniff', x: 22, y: 29, dir: 'left', text: '제방집게가 적재장 둑 가장자리를 집게로 다지고 있다.' },
      { id: 'db_jabuk', mon: 'jabukhwan', act: 'splash', x: 39, y: 11, dir: 'down', text: '자북환이 화차역 계량 장치 옆에서 고리를 천천히 돌린다. 무게를 재는 걸 돕는 것 같다.' }],
    drawExtra: (T, cx, cy) => {
      // the yard's reset board
      const X = 20 * 16 - cx, Y = 23 * 16 - cy;
      T.fillStyle = '#5e3a1a'; T.fillRect(X + 2, Y + 9, 2, 7); T.fillRect(X + 12, Y + 9, 2, 7); T.fillRect(X + 1, Y + 1, 14, 10); T.fillStyle = '#e8d8b0'; T.fillRect(X + 2, Y + 2, 12, 8);
      T.fillStyle = '#e3b23c'; T.fillRect(X + 4, Y + 4, 8, 2); T.fillStyle = '#6a6458'; T.fillRect(X + 4, Y + 7, 5, 1);
    },
    onEnter: async () => {
      visit('m09');
      if (!flag('m09_seen')) { set('m09_seen'); await G.wait(10); await say('석조 창고 사이로 원형 선로가 이어진다. 화차는 멈춰 있고,\n적재장에서는 산받곰과 사람들이 짐을 나눠 들고 있다.'); }
    }
  };
  H.center('center_db', '돌바퀴시', 'm09', 4, 16);
  H.shop('shop_db', '돌바퀴시', 'm09', 11, 16, STOCK3);
  H.house('house_db1', '돌바퀴 집', 'm09', 18, 17, [
    { id: 'dbh1', char: 'woman', x: 5, y: 2, dir: 'down', name: '돌바퀴 주민', text: () => flag('q31') ? '배차소 장부가 공개됐대요. 정비 날짜를 앞당겨 찍은 도장이 나왔다나 봐요.' : '배차소 일로 화차가 멈춰서 장 보러 가기도 힘들어요.' }]);
  H.house('house_db2', '돌바퀴 집', 'm09', 4, 22, [
    { id: 'dbh2', char: 'man', x: 1, y: 3, dir: 'right', name: '퇴근한 작업자', text: '감독이 바뀐다고 일이 바뀌진 않아. 장부가 바뀌어야지.' },
    { id: 'dbh3', mon: 'chalkakge', act: 'hop', x: 5, y: 4, dir: 'left', text: '찰칵게가 현관 앞 흙을 다져 작은 둑을 만들었다.' }]);
  // 운송조합: Q31_start (시온)
  M.union_db = {
    name: '돌바퀴 운송조합', kind: 'in', bgm: 'town',
    rows: ['#W###WW###W#', 'BBB..N...BBB', '............', '.tt..tt..tt.', '............', '............', '.....xx.....'],
    warps: [{ x: 5, y: 6, to: 'm09', tx: 13, ty: 7, dir: 'down' }, { x: 6, y: 6, to: 'm09', tx: 13, ty: 7, dir: 'down' }],
    objects: { '5,1': async () => say('조합 게시판: "옛 배차소 장부 조사 중 — 협조해 주신 작업자 여러분께 감사드립니다"') },
    npcs: [
      { id: 'sion', char: 'sion', x: 7, y: 2, dir: 'down', name: '조합 조사원 시온',
        talk: async () => {
          const N = '조합 조사원 시온';
          if (!flag('q30')) { await say('운송조합 조사원 시온이야. 지금은 강 쪽 수문이 막혀서 조사가 멈춰 있어.', N); return; }
          if (!flag('q31_start')) {
            await say('강굽이 수문을 고친 길지기구나! 덕분에 강 운송이 다시 돌아. 나는 조사원 시온.', N);
            await say('정화소의 증폭 장비 번호 말인데... 그 부품은 여기 돌바퀴시에서 보낸 게 맞아.\n그런데 교체 주기를 줄이라는 승인은 다른 곳에서 왔어.', N);
            if (G.S.bag.equipcopy) await say('그건... 1장·2장 현장 장비 표식 사본이네! 같은 제조 계열 번호야. 대조하기 딱 좋겠어.', N);
            else await say('예전 현장 장비 표식이 있으면 좋을 텐데... 아, 조합에 보존된 조사 기록에서 복사하면 되겠다.', N);
            await give('permit11', 1, true);
            await say(`${P()}${G.josa(P(), '은', '는')} 배차소 열람 허가증을 받았다!`);
            await say('옛 배차소 안전 통로와 기록 열람 허가야. 마당의 낙석은 바위깨기로, 선로 받침은 바위 밀기로 맞추면 돼.\n출하 장부, 검사 도장, 교체 이력. 세 가지를 대조해 줘. 원본은 두고 사본만 가져오고.', N);
            set('q31_start');
            Wd().respawn();
            return;
          }
          if (!flag('q31')) { await say('출하 장부와 검사 도장은 배차소 사무실, 교체 이력은 마당 선로 위 기록 화차에 있어.\n현장 작업자 증언도 꼭 들어 줘. 그 사람들 잘못이 아니야.', N); return; }
          if (!flag('q32')) { await say('본부 승인 번호... 한 감독에게 다 떠넘기려 했지만 번호가 남아 있었어.\n화차도 다시 다녀. 규호 관장 시험도 열렸고!', N); return; }
          await say('높은물길 쪽 길이 열리면 본부 조사 이야기를 하자. 적재장의 도담이 괴력운반을 가르쳐 줄 거야.', N);
        } },
      { id: 'un1', char: 'worker', x: 2, y: 4, dir: 'right', name: '조합원', text: '장부는 사람이 쓰는 거야. 사람이 고칠 수도 있지... 그래서 도장이 중요한 거고.' }]
  };
  M.archive_db = {
    name: '돌바퀴 기록원', kind: 'in', bgm: 'shrine',
    rows: ['#W######W#', 'BBBB..BBBB', '..........', '...tttt...', '..........', '....x.....'],
    warps: [{ x: 4, y: 5, to: 'm09', tx: 22, ty: 7, dir: 'down' }],
    objects: { '3,3': async () => say('운송 기록 원본이 탁자에 펼쳐져 있다. "원본은 기록원 보관 — 열람은 사본으로"'), '5,3': async () => say(flag('q31') ? '공개된 배차소 장부 사본이 놓여 있다. 지워졌던 점검 날짜에 빨간 표시가 있다.' : '도장 대장이다. 같은 날짜에 같은 도장이 여러 번 찍혀 있다...') },
    npcs: [{ id: 'arch_db', char: 'clerk', x: 6, y: 2, dir: 'down', name: '기록원',
      text: () => flag('q31') ? '조사원 시온 씨가 사본으로 장부를 대조했어요. 원본은 여기 그대로 있어요.' : '기록원은 원본을 지켜요. 누가 와도, 사본만 내드려요.' }]
  };
  // the loading yard: Q33 괴력운반 (도담), SQ3-06's reply (노을)
  H.dodamTalk = async () => {
    const N = '적재원 도담';
    if (!flag('badge6')) {
      await say('적재원 도담이야. 이 적재장에선 산받곰이랑 사람들이 무게를 나눠 들어.\n고리 문양 큰 운반석 옮기는 법, 괴력운반은 여섯 번째 배지를 받으면 가르쳐 줄게.', N);
      if (flag('q31')) await say('규호 관장 시험은 바위 밀기랑 저울만 쓰면 돼. 괴력운반은 시험에 필요 없어!', N);
      return;
    }
    if (!flag('q33_start')) {
      await say('돌바퀴배지! 좋아, 괴력운반 수업을 시작하자.', N);
      await say('괴력운반은 혼자 드는 게 아니야. 동료랑 같이, 정해진 레일 받침에만 내려놓는 거지.\n노란 레일 표시가 있는 받침이 목적지야.', N);
      await H.teachOrLend('haul', 'sanbatgom', N);
      await give('harness', 1);
      set('q33_start');
      await say('저기 연습 운반석을 오른쪽 받침으로 옮겨 봐. 돌 앞에서 A 버튼!', N);
      return;
    }
    if (!flag('q33_lesson')) { await say(flag('q33_lesson1') ? '받침 앞에서 A 버튼을 누르면 되돌릴 수 있어. 한번 해 봐!' : '연습 운반석을 오른쪽 레일 받침으로 옮겨 봐!', N); return; }
    if (!flag('q33')) { await say('북쪽 길 끝, 레일 표식이 칠해진 운반석이야. 받침으로 옮기면 높은물길 입구가 열려.', N); return; }
    await say('힘이 세다고 혼자 들 필요는 없어. 오늘 우리가 한 것처럼!', N);
  };
  H.noeulTalk = async () => {
    const N = '적재장 작업자 노을';
    if (num('sq306') === 1 && G.S.bag.letter3) {
      D().useItem('letter3'); set('sq306', 2); sfx('item');
      await say('누리 언니 편지?! ...해무나루에서 여기까지 들고 와 줬어요? 고마워요.', N);
      await say('잠깐만요, 쉬는 시간에 바로 답장 쓸게요...', N);
      await G.wait(30);
      await give('reply3', 1);
      await say('짧지만... 이거면 언니는 다 알 거예요. 돌아가는 길은 서두르지 않아도 돼요!', N);
      return;
    }
    if (num('sq306') === 2) { await say('답장은 천천히 전해 줘요. 화차랑 정기선이 다니면 해무나루도 금방이에요.', N); return; }
    await say(num('sq306') >= 3 ? '언니가 또 편지를 보냈어요. 이번엔 놀러 온대요!' : '적재장은 혼자 드는 사람 없어요. 산받곰도 사람도 다 같이 들어요.', N);
  };

  // ------------------------------------------------------------ D11 옛 배차소 (Q31): fallen blocks, two rail supports, three records and a testimony
  const recordsDone = () => flag('q31_ledger') && flag('q31_stamp') && flag('q31_hist') && flag('q31_w');
  const recordCheck = async () => {
    if (!recordsDone() || flag('q31_confront')) return;
    set('q31_confront');
    await say('출하 장부, 검사 도장, 교체 이력, 그리고 현장 증언까지 모두 맞춰 봤다.\n수첩에 사본을 정리했다... 그때 마당 문 쪽에서 발소리가 들린다!');
    Wd().respawn();
  };
  M.d11b = {
    name: '옛 배차소 마당', kind: 'out', bgm: 'route', rows: ROWS.d11b,
    buildings: [{ k: 'house', x: 11, y: 8, w: 10, h: 5, roof: 'grey', wall: '#ece8e0', label: '배차소' }],
    rescue: { map: 'm09', x: 28, y: 21, dir: 'down' },
    warps: [{ x: 15, y: 19, to: 'm09', tx: 28, ty: 21, dir: 'down', tdir: 'down' }, { x: 16, y: 19, to: 'm09', tx: 29, ty: 21, dir: 'down', tdir: 'down' },
      { x: 15, y: 12, to: 'office_d11', tx: 5, ty: 4, dir: 'up' }],
    boulders: [{ id: 'ra', x: 4, y: 8 }, { id: 'rb', x: 12, y: 7 }],
    quietSlots: true,
    blocks: [{ x: 26, y: 5 }, { x: 27, y: 5 }],
    signs: { '10,17': '옛 배차소\n"안전 통로 외 출입 금지 · 운송조합"' },
    objects: {
      '27,7': async () => {
        await say('배차 안내판: "선로 받침 두 곳이 빠짐 — 받침돌을 홈에 밀어 넣을 것"');
        const ok = await G.ask('받침돌을 처음 자리로 되돌릴까?'); if (ok) await F().resetPuzzle();
      },
      '26,5': () => cartAt(), '27,5': () => cartAt()
    },
    onSlot: async () => {
      const n = ['ra', 'rb'].filter(id => F().sunkAt('d11b', id)).length;
      if (n === 1) await say('받침돌 하나가 선로 홈에 맞물렸다. 하나 더!');
      if (n === 2) { set('q31_track'); await say('선로 받침 두 곳이 모두 맞춰졌다! 기울어 있던 기록 화차가 똑바로 섰다.'); }
    },
    npcs: [
      { id: 'd11t1', char: 'worker', x: 22, y: 14, dir: 'left', sight: 3,
        trainer: { flag: 'tr_d11t1', title: '새길상회 경비', name: '철문', char: 'worker', team: [['nachimdol', 40], ['tokguri', 40], ['jagalkong', 41]], base: 26,
          before: '허가증? ...감독님 허락은 없잖아!', lose: '...허가증이 진짜였구나.', after: '사무실엔 장부랑 도장, 화차엔 교체 이력. 난 아무 말도 안 했다.' } },
      { id: 'd11t2', char: 'worker', x: 6, y: 13, dir: 'up', sight: 3,
        trainer: { flag: 'tr_d11t2', title: '새길상회 작업자', name: '바닥', char: 'worker', team: [['jindeugi', 40], ['heukkori', 40]], base: 26,
          before: '선로 받침 건드리지 마! 그거 빼 둔 거야!', lose: '받침 빼 두라는 것도 지시였어...', after: '받침을 빼면 화차가 기울어서 아무도 기록을 못 봐. 그게 목적이었지.' } },
      { id: 'd11boss', char: 'boss', x: 17, y: 14, dir: 'left', sight: 3, cond: () => flag('q31_confront') && !flag('tr_d11boss'),
        trainer: { flag: 'tr_d11boss', title: '새길상회 운송 감독', name: '석관', char: 'boss', base: 34, prize: 3800, smart: true,
          team: [['jabukhwan', 41, ['flashcannon', 'bolt', 'chargeguard', 'ironbash']], ['sandeung', 41], ['hoesureong', 42]],
          before: '기록을 다 맞춰 봤다고? 그래, 날짜는 내가 고쳤다. 정비 주기도 줄였고.\n하지만 그건 내 판단이야. 다른 데 탓하지 마!', lose: '...승인 번호까지 봤겠지. 그럼 숨길 것도 없군.',
          after: '본부 승인 번호는 장부 맨 끝에 있다. 나 혼자 떠안으라더군. 높은물길 너머 본부 말이야.',
          afterWin: async () => {
            const N = '새길상회 운송 감독 석관';
            await say('...보고서엔 내 이름만 쓰라고 했지. 그 승인 번호가 누구 건지는 너도 알 거다.', N);
            const b = Wd().npc('d11boss'); if (b) b.hidden = true;
            await give('evid3', 1, true);
            await say(`${P()}${G.josa(P(), '은', '는')} 장부 대조 사본을 받았다! (원본은 운송조합이 보관한다)`);
            set('q31');
            G.audio && G.audio.jingle('badge');
            await say('사본 고마워. 현장 작업자 잘못이 아니라는 것도 같이 적었어.\n이 부품은 여기서 보냈지만, 교체 주기를 줄이라는 승인은 다른 곳에서 왔어.', '조합 조사원 시온');
            await say('화차를 다시 돌릴게. 푸른숨시까지 무료야. 규호 관장도 시험장을 다시 열었대!', '조합 조사원 시온');
            Wd().respawn();
          } } },
      { id: 'd11_sion', char: 'sion', x: 18, y: 16, dir: 'left', name: '조합 조사원 시온', cond: () => flag('q31_start') && !flag('q31'),
        text: () => recordsDone() ? '세 기록을 다 맞췄구나! ...누가 온다. 조심해.' : '출하 장부와 검사 도장은 사무실에, 교체 이력은 선로 위 기록 화차에 있어.\n선로 받침이 빠져서 화차가 기울어 있어. 받침돌 두 개를 홈에 맞춰 줘.' }],
    drawExtra: (T, cx, cy) => {
      // the record cart on the dispatch track: tilted until both supports are back
      const X = 26 * 16 - cx, Y = 5 * 16 - cy, tilt = flag('q31_track') ? 0 : 4;
      T.fillStyle = '#5a4636'; T.fillRect(X + 2, Y + 4 + tilt, 28, 9); T.fillStyle = '#a8784a'; T.fillRect(X + 3, Y + 5 + tilt, 26, 7);
      T.fillStyle = '#e8d8b0'; T.fillRect(X + 6, Y + tilt, 20, 6); T.fillStyle = '#2c5ea8'; T.fillRect(X + 8, Y + 2 + tilt, 16, 1);
      G.disc(T, X + 8, Y + 14, 3, '#3a2a1a'); G.disc(T, X + 24, Y + 14 + tilt / 2, 3, '#3a2a1a');
    },
    onEnter: async () => { visit('d11'); if (!flag('d11_seen')) { set('d11_seen'); await G.wait(10); await say('풀이 웃자란 옛 배차소 마당이다. 안쪽 담장은 무너진 돌로 막혀 있고,\n선로 위 기록 화차가 비스듬히 기울어 있다.'); } }
  };
  async function cartAt() {
    if (!flag('q31_start')) { await say('기울어진 기록 화차다.'); return; }
    if (!flag('q31_track')) { await say('기록 화차가 비스듬히 기울어 서랍이 열리지 않는다.\n선로 받침 두 곳이 빠져 있다. 받침돌을 홈에 밀어 넣자.'); return; }
    if (flag('q31_hist')) { await say('교체 이력은 이미 사본으로 옮겨 적었다.'); return; }
    set('q31_hist'); sfx('select');
    await say('똑바로 선 화차의 서랍을 열었다. 교체 이력: "거름틀·증폭 장비 교체 — 7일 → 3일"\n그 옆에 "승인: 본부 운영실" 이라는 번호 도장이 찍혀 있다!');
    await say('교체 이력을 사본으로 옮겨 적었다. 원본은 화차에 그대로 두었다.');
    await recordCheck();
  }
  M.office_d11 = {
    name: '배차소 사무실', kind: 'in', bgm: 'shrine',
    rows: ['#W###WW###W#', 'BBB..N...BBB', '............', '.tt......tt.', '............', '.....xx.....'],
    warps: [{ x: 5, y: 5, to: 'd11b', tx: 15, ty: 13, dir: 'down' }, { x: 6, y: 5, to: 'd11b', tx: 15, ty: 13, dir: 'down' }],
    objects: {
      '1,1': async () => {
        if (flag('q31_ledger')) { await say('출하 장부는 이미 사본으로 옮겨 적었다.'); return; }
        set('q31_ledger'); sfx('select');
        await say('출하 장부다. "증폭 장비 12대 — 푸른숨 정화소·잎향 온실·해안 공사"\n출하 날짜가 정비 기록보다 이틀 앞서 있다. 사본으로 옮겨 적었다.');
        await recordCheck();
      },
      '10,1': async () => {
        if (flag('q31_stamp')) { await say('검사 도장 대장은 이미 사본으로 옮겨 적었다.'); return; }
        set('q31_stamp'); sfx('select');
        await say('검사 도장 대장이다. "정비 완료" 도장이 정비 날짜보다 먼저 찍혀 있다!\n도장 대장을 사본으로 옮겨 적었다.');
        await recordCheck();
      },
      '5,1': async () => say('배차 게시판: "정비 주기 단축 운행 — 본부 승인" 이라는 쪽지가 반쯤 찢겨 있다.')
    },
    npcs: [{ id: 'd11_hanbyeol', char: 'worker', x: 8, y: 2, dir: 'down', name: '현장 작업자 한별',
      talk: async () => {
        const N = '현장 작업자 한별';
        if (!flag('q31_start')) { await say('...여긴 출입 금지예요.', N); return; }
        if (!flag('q31_w')) {
          set('q31_w'); sfx('select');
          await say('제출한 날짜하고 장부 날짜가 달라요. 고쳤다는 도장은 왜 먼저 찍혔죠?\n우린 시키는 대로 정비 날짜를 비워 뒀을 뿐이에요.', N);
          await say('...이 말, 수첩에 적어 가요. 우리 이름은 빼고요.', N);
          await say('현장 작업자의 증언을 수첩에 기록했다.');
          await recordCheck();
          return;
        }
        await say(flag('q31') ? '장부가 공개되니까 마음이 놓여요. 다음 정비는 제 날짜에 할 거예요.' : '증언은 했어요. 이제 장부만 맞으면 돼요.', N);
      } }]
  };

  // ------------------------------------------------------------ G06 돌바퀴 하중 체육관 (Q32): balance the scale with model stones, 관장 규호
  const PAN_GOAL = 5;
  const panSum = () => ['w1', 'w2', 'w3', 'w4'].filter(id => F().sunkAt('gym6', id)).reduce((s, id) => s + ({ w1: 1, w2: 2, w3: 3, w4: 4 })[id], 0);
  const panCount = () => ['w1', 'w2', 'w3', 'w4'].filter(id => F().sunkAt('gym6', id)).length;
  M.gym6 = {
    name: '돌바퀴 하중 체육관', kind: 'in', floor: 'g', bgm: 'gym',
    rows: [
      '#W####WWW####W#',
      'ggggggggggggggg', 'ggggggggggggggg', 'ggggggggggggggg',
      'qqqqqqgggqqqqqq',
      'ggggggggggggggg', 'ggggggggggggggg',
      'ggggggggguguggg',
      'ggggggggggggggg', 'ggggggggggggggg', 'ggggggggggggggg', 'ggggggggggggggg',
      'qqqqqqgggqqqqqq',
      'sgggggggggggggs',
      'ggggggggggggggg',
      'ggggggxxxgggggg'],
    warps: [{ x: 6, y: 15, to: 'm09', tx: 37, ty: 8, dir: 'down' }, { x: 7, y: 15, to: 'm09', tx: 37, ty: 8, dir: 'down' }, { x: 8, y: 15, to: 'm09', tx: 38, ty: 8, dir: 'down' }],
    boulders: [{ id: 'w4', x: 3, y: 9, model: true, w: 4 }, { id: 'w1', x: 6, y: 10, model: true, w: 1 }, { id: 'w3', x: 9, y: 10, model: true, w: 3 }, { id: 'w2', x: 12, y: 10, model: true, w: 2 }],
    gymStones: true, resetAll: true, quietSlots: true,
    blocks: [{ x: 6, y: 4, cond: () => !flag('g6_open') }, { x: 7, y: 4, cond: () => !flag('g6_open') }, { x: 8, y: 4, cond: () => !flag('g6_open') }, { x: 2, y: 6 }, { x: 3, y: 6 }],
    onSlot: async () => {
      const s = panSum(), n = panCount();
      sfx('knock2');
      if (flag('g6_open')) { await say(`저울 눈금: 왼쪽 ${PAN_GOAL} · 오른쪽 ${s}`); return; }
      if (s > PAN_GOAL) { await say(`저울이 오른쪽으로 쿵 기울었다! (왼쪽 ${PAN_GOAL} · 오른쪽 ${s})\n아래 화면의 [되돌리기]나 입구 돌판의 [처음부터]로 다시 해 보자.`); return; }
      if (s === PAN_GOAL && n === 2) {
        set('g6_open'); G.audio && G.audio.jingle('learn');
        await say(`저울이 수평을 이뤘다! (왼쪽 ${PAN_GOAL} · 오른쪽 ${s})\n관장석 앞 문이 열렸다.`);
        return;
      }
      await say(`저울 눈금: 왼쪽 ${PAN_GOAL} · 오른쪽 ${s}. 아직 가볍다.` + (n >= 2 ? '\n접시가 다 찼다. 되돌리기로 다른 돌을 골라 보자.' : ''));
    },
    onUnslot: async () => { await say(`돌을 접시에서 내렸다. (왼쪽 ${PAN_GOAL} · 오른쪽 ${panSum()})`); },
    objects: {
      '0,13': async () => say(flag('badge6') ? `돌바퀴 하중 체육관 관장 규호\n인정받은 길지기: ${P()}` : '돌바퀴 하중 체육관 관장 규호\n"무게는 나누면 가벼워진다"'),
      '14,13': async () => { await say('저울 돌판이다.\n"모형 돌을 모두 처음 자리로"'); const ok = await G.ask('처음부터 다시 할까?'); if (ok) await F().resetPuzzle(); },
      '2,6': async () => say(`왼쪽 접시에 무게 ${PAN_GOAL}짜리 추가 놓여 있다.\n오른쪽 두 접시에 모형 돌 두 개를 올려 수평을 맞추자. 돌에 적힌 숫자가 무게다.`),
      '3,6': async () => M.gym6.objects['2,6']()
    },
    npcs: [
      { id: 'g6a', char: 'worker', x: 2, y: 14, dir: 'right', sight: 3,
        trainer: { flag: 'tr_g6a', title: '적재 수련생', name: '받침', char: 'worker', team: [['sagureu', 42], ['jagalkong', 42]], base: 26,
          before: '저울 앞에 서려면 나부터!', lose: '무게 중심이 흔들렸어...', after: '모형 돌은 체육관 훈련 동료가 같이 밀어 줘. 숫자를 더해서 5를 만들어!' } },
      { id: 'g6b', char: 'hiker', x: 13, y: 5, dir: 'left', sight: 2,
        trainer: { flag: 'tr_g6b', title: '석공', name: '정', char: 'hiker', team: [['doldureum', 42], ['teoneolgup', 42], ['jebangjipge', 43]], base: 26,
          before: '저울은 맞췄어? 아니면 나랑 먼저!', lose: '힘으로만 밀면 안 되는구나.', after: '관장님 자북환은 고리가 울리면 다음 차례에 번개침이 와. 땅 타입은 전기를 안 받아!' } },
      { id: 'g6guide', char: 'man', x: 12, y: 14, dir: 'left', name: '안내원',
        text: () => flag('badge6') ? '축하해! 적재장의 도담에게 가 봐. 괴력운반을 가르쳐 줄 거야.' : '도전자! 저울을 수평으로 맞추면 관장석 문이 열려. 괴력운반은 필요 없어!\n관장 규호는 땅·바위·물·전기를 섞어 써. 교체가 열쇠야.' },
      { id: 'leader6', char: 'gyuho', x: 7, y: 1, dir: 'down', name: '관장 규호',
        talk: async () => {
          const N = '관장 규호';
          if (flag('badge6')) { await say('적재장의 도담에게 가 봐. 괴력운반은 함께 드는 기술이야.', N); return; }
          await say('저울을 맞췄구나. 나는 돌바퀴 하중 체육관 관장 규호.\n힘이 세다고 전부 혼자 들 필요는 없지. 어디에 놓고, 누구와 나눌지부터 보자.', N);
          const won = await G.battle.trainer({ flag: 'badge6', title: '관장', name: '규호', char: 'gyuho', smart: true, potion: true, iv: 20, prize: 4500,
            lead: { teoneolgup: 'sandattack' },
            telegraph: { jabukhwan: { moves: ['bolt'], msg: '의 고리가 윙윙 울린다! 다음 차례에 번개침이 올 것 같다!', chance: 0.5 },
              sandeung: { moves: ['quake'], msg: '이(가) 앞발로 땅을 크게 구른다! 다음 차례에 대지흔들기가 올 것 같다!', chance: 0.4 } },
            team: [['teoneolgup', 44, ['dig', 'mudshot', 'slash', 'sandattack']], ['jebangjipge', 44, ['wave', 'mudshot', 'rockguard', 'pinch']],
              ['sandeung', 45, ['rockslide', 'quake', 'rockguard', 'butt']], ['jabukhwan', 47, ['flashcannon', 'bolt', 'chargeguard', 'ironbash']]],
            lose: '...무게를 나눠 받았구나. 버티는 법을 알아.' });
          if (!won) { await say('지쳤으면 센터에서 쉬고 다시 와. 재도전은 언제든 무료야.\n고리가 울리면 땅 타입으로, 땅을 구르면 비행이나 버티는 동료로 받아 내.', N); return; }
          await say('돌바퀴 하중 체육관의 인증, 돌바퀴배지야.', N);
          G.audio && G.audio.jingle('badge');
          await say(`${P()}${G.josa(P(), '은', '는')} 관장 규호에게서 돌바퀴배지를 받았다!`);
          await give('tm_quake', 1);
          await say('대지흔들기 교본이야. 땅과 바위 타입이면 누구나 배울 수 있어.', N);
          await say('적재장의 도담에게 가 봐. 여섯 번째 배지면 괴력운반을 배울 수 있어.\n높은물길 입구의 운반석도 옮길 수 있을 거야.', N);
          set('q32');
        } }],
    drawExtra: (T, cx, cy) => {
      // the scale: the reference weight on the left, the beam, and a readout
      const s = panSum(), X = 2 * 16 - cx, Y = 6 * 16 - cy;
      G.disc(T, X + 16, Y + 10, 9, '#3a3e48'); G.disc(T, X + 16, Y + 10, 8, '#c8ccd6'); T.fillStyle = '#6a6458'; T.fillRect(X + 9, Y + 2, 14, 10); G.textC(T, String(PAN_GOAL), X + 16, Y + 1, '#ffffff', null);
      const tilt = flag('g6_open') ? 0 : s > PAN_GOAL ? 3 : s < PAN_GOAL ? -3 : 0;
      T.strokeStyle = '#5a6070'; T.lineWidth = 2; T.beginPath(); T.moveTo(X + 16, Y + 2 + tilt); T.lineTo(11 * 16 + 8 - cx, 7 * 16 + 2 - cy - tilt); T.stroke();
      G.box(T, 172 - 0, 4, 80, 20, G.STYLE.white, 3);
      G.text(T, `왼 ${PAN_GOAL} · 오 ${s}`, 180, 8, s === PAN_GOAL ? '#2c7a3a' : s > PAN_GOAL ? '#c83a2a' : '#2c2f45', null);
      if (!flag('g6_open')) for (let x = 6; x <= 8; x++) { T.fillStyle = '#8a6a4a'; T.fillRect(x * 16 - cx, 4 * 16 + 6 - cy, 16, 4); }
    }
  };

  // ------------------------------------------------------------ R17 돌바퀴 언덕 (optional upland)
  M.r17 = {
    name: '돌바퀴 언덕', kind: 'out', bgm: 'route', rows: ROWS.r17,
    links: { e: { to: 'm09', dy: -11, from: 14, until: 15 } },
    hauls: [{ id: 'ridge', x: 27, y: 3, to: [28, 5], floor: '.' }],
    signs: { '27,13': '돌바퀴 언덕\n"보행 계단 ▶ 돌바퀴시"' },
    items: [{ id: 'moonstone', x: 27, y: 1, flag: 'r17_pocket' }, { id: 'revive', x: 3, y: 20, flag: 'r17_a' }],
    npcs: [
      { id: 'r17t1', char: 'hiker', x: 10, y: 4, dir: 'down', sight: 3,
        trainer: { flag: 'tr_r17t1', title: '언덕 수련가', name: '바위솔', char: 'hiker', team: [['moraekong', 42], ['deuldori', 42], ['bulbari', 43]], base: 26,
          before: '언덕 위는 연습 승부장이야! 한판!', lose: '연습이 실전 같았어!', after: '산받곰은 혼자 다 들지 않아. 같이 드는 사람이 있을 때 제일 세지.' } },
      { id: 'r17t2', char: 'woman', x: 22, y: 9, dir: 'left', sight: 3,
        trainer: { flag: 'tr_r17t2', title: '동료 관찰가', name: '나래', char: 'woman', team: [['jindeugi', 42], ['huugi', 42], ['jebangjipge', 43]], base: 26,
          before: '관찰도 좋지만 승부도 좋지!', lose: '관찰 기록에 너도 적어 둘게.', after: '진득이는 언덕에서도 쉬는 자리를 찾아. 쉬는 게 일의 일부야.' } },
      { id: 'r17t3', char: 'kidA', x: 6, y: 17, dir: 'right', sight: 3,
        trainer: { flag: 'tr_r17t3', title: '언덕 소년', name: '돌돌', char: 'kidA', team: [['jagalkong', 41], ['bulbari', 42], ['deuldori', 42]], base: 22,
          before: '여기까지 올라오다니! 나랑 한판!', lose: '언덕보다 네가 더 높네!', after: '꼭대기 바위 틈에 반짝이는 게 있대. 고리 문양 운반석이 막고 있어서 못 가.' } },
      { id: 'r17_bear', mon: 'sanbatgom', act: 'sniff', x: 18, y: 12, dir: 'down', text: '산받곰이 언덕길의 돌을 들어 길가에 가지런히 놓는다.' }],
    onEnter: async () => { visit('r17'); }
  };

  // ------------------------------------------------------------ R18 높은물길 입구 (the first viewpoint; the falls and beyond are the next chapter)
  M.r18 = {
    name: '높은물길 입구', kind: 'out', bgm: 'route', rows: ROWS.r18,
    links: { s: { to: 'm09', dx: 18, from: 13, until: 13 } },
    signs: { '15,6': '높은물길 폭포\n"폭포 오르기 강습 전에는 오를 수 없습니다"', '11,15': '높은물길 입구\n"첫 안전 전망대 ◀ — 그 너머는 출입 통제"', '7,9': '높은물길 첫 전망대\n"바다·강·산이 한눈에"' },
    triggers: [{ x: 5, y: 10, w: 5, h: 2, cond: () => flag('q33') && !flag('ch3_end'), run: async () => {
      const N = '조합 조사원 시온';
      await say('높은물길의 첫 전망대다. 쏟아지는 폭포 너머로 산과 강이 겹겹이 이어진다.\n멀리 바다 쪽에 해무나루의 흰 부표가 점처럼 보인다.');
      await G.wait(20);
      await say('여기까지 와 줬구나. 숨 좀 돌려.', N);
      await say('해무나루의 옛 부두 장비, 푸른숨 정화소의 증폭 장비, 돌바퀴 배차소의 교체 주기...\n전부 같은 본부 승인 번호로 이어져 있었어.', N);
      await say('바다와 강과 산의 문제가 하나로 연결돼 있었던 거야. 그 번호의 주인은 높은물길 너머,\n새길상회 본부에 있어.', N);
      await say('연구소들과 조합이 정식으로 본부 조사를 부탁하기로 했어. 길지기인 너에게.\n지금은 폭포를 오를 수 없지만, 길은 언젠가 이어질 거야.', N);
      set('ch3_end');
      await G.chapterEnd(3);
      await say('(3장 · 물결이 모이는 곳 — 완료. 다녀온 길과 선택 의뢰는 계속 즐길 수 있다)');
    } }],
    npcs: [{ id: 'r18_sion', char: 'sion', x: 9, y: 11, dir: 'left', name: '조합 조사원 시온', cond: () => flag('q33'),
      text: () => flag('ch3_end') ? '본부 조사 의뢰는 정식으로 접수됐어. 폭포를 오를 준비가 되면 다시 이야기하자.' : '전망대로 와 봐. 보여 줄 게 있어.' }],
    onEnter: async () => { visit('r18'); if (!flag('r18_seen')) { set('r18_seen'); await G.wait(10); await say('높은물길 입구. 거대한 폭포가 하얗게 쏟아진다.\n폭포 아래쪽에 첫 안전 전망대가 보인다.'); } }
  };

  // ------------------------------------------------------------ revisits of chapters 1-2
  // SQ3-05 강 건너 같은 표지 (기억나루 · 해솔): the sandbar marker in the rapids
  M.memory.currents = true;
  const memMark = M.memory.onMark;
  M.memory.onMark = async (x, y) => {
    if (x !== 28 || y !== 2) { await memMark(x, y); return; }
    await say('모래톱 한가운데 옛 표지석이다. 이끼 아래로 "기억나루 → 높은물길" 이라는 글자와 물결 문양이 보인다.');
    if (num('sq305') === 1 && !flag('sq305_mark')) { set('sq305_mark'); sfx('select'); await say('표지 문양을 수첩에 옮겨 그렸다. 복원한 옛길 지도의 마을 이름과 같은 글자다!\n해솔에게 보여 주자.'); }
  };
  M.memory.objects = Object.assign(M.memory.objects || {}, {
    '30,4': async () => {   // the first safe landing's rescue point
      await say('모래톱의 구조 요청 지점이다. 붉은 깃발이 꽂혀 있다.');
      const ok = await G.ask('구조대를 불러 나루 선착장으로 돌아갈까? (무료)'); if (!ok) return;
      Wd().surfing = null; sfx('water');
      await G.fadeTo(1, 16); Wd().enter('memory', 2, 7, 'up'); await G.fadeTo(0, 16);
      await say('구조대 보트가 나루 선착장까지 데려다 주었다.');
    }
  });
  const haesolA = M.archive.npcs.find(n => n.id === 'haesol_a');
  if (haesolA) {
    const plain = haesolA.text;
    delete haesolA.text;
    haesolA.talk = async () => {
      const N = '관리인 해솔';
      if (!flag('q29') || !flag('q17')) { await say(plain, N); return; }
      const st = num('sq305');
      if (st === 0) {
        await say('급류타기를 배웠군요! 그럼 부탁해도 될까요? 나루 강 한가운데 모래톱에 옛 표지가 하나 있어요.\n강물이 불어난 뒤로 아무도 건너지 못했죠.', N);
        const ok = await G.ask('표지의 문양을 보고 와 줄래요?\n길비나침반도 안내해 줄게요. (선택 의뢰)', ['다녀올게요', '나중에요'], { name: N });
        if (!ok) return;
        set('sq305', 1);
        await say('다리 동쪽 강가에서 급류를 바라보고 물판을 타요. 표식이 있는 급류라 건널 수 있어요.\n모래톱에 구조 요청 지점도 있으니 무리하지 말고요.', N);
        return;
      }
      if (st === 1) {
        if (!flag('sq305_mark')) { await say('모래톱 표지는 나루 강 동쪽, 강 한가운데예요. 다리 동쪽 강가에서 물판을 타면 돼요.\n길비나침반도 그쪽을 가리켜요.', N); return; }
        set('sq305', 2);
        await say('이 문양... 복원한 옛길 지도의 "높은물길"과 같은 이름이에요! 옛 나루길이 거기까지 이어졌군요.', N);
        await give('token', 3);
        H.stamp3('sq305', '강 건너 같은 표지: 기억나루 모래톱 표지에서 "높은물길" 옛 이름을 확인했다.');
        await say('옛길 수첩에 삽화로 남겨 둘게요. 확인한 표지만 지도에 적어요. 직접 본 길만이 기록이니까요.', N);
        return;
      }
      await say('모래톱 표지를 보수해 뒀어요. 안개 정령들도 그 근처를 좋아해요.', N);
    };
  }
  // SQ3-07 오래된 돌의 자리 (바람나루 옛 창고 · 서쪽 돌담길): the big ring-marked stone from chapter 1
  M.westpath.hauls = [{ id: 'oldpath', x: 1, y: 8, to: [2, 10], floor: '=',
    onDone: async () => { await say('운반석이 레일 받침에 내려앉자, 그 뒤로 옛 산길 샛길이 드러났다!'); } }];
  M.westpath.links.w = { to: 'oldtrail', dy: -3, from: 8, until: 8, cond: () => F().hauled('westpath', 'oldpath') };
  M.warehouse.npcs = (M.warehouse.npcs || []).concat([{ id: 'wh_keeper', char: 'elder', x: 5, y: 4, dir: 'left', name: '창고지기 무진',
    talk: async () => {
      const N = '창고지기 무진';
      const st = num('sq307');
      if (!(flag('q33') && F().unlocked('haul'))) { await say('바람나루 옛 창고지기 무진이야. 서쪽 돌담길 큰 바위 너머에 옛 산길이 있었지.\n고리 문양이 새겨진 그 바위는 우리 힘으론 꿈쩍도 안 해.', N); return; }
      if (st === 0) {
        await say('오, 괴력운반을 배웠다고? 그럼 서쪽 돌담길의 고리 문양 바위를 옮길 수 있겠구나!', N);
        await say('바위를 옆 레일 받침으로 옮기고,\n너머 샛길의 옛 창고 기록함을 확인하는 거야.', N);
        const ok = await G.ask('부탁해도 될까? (선택 의뢰)', ['해 볼게요', '나중에요'], { name: N });
        if (!ok) return;
        set('sq307', 1);
        await say('바위 옆에 노란 칠을 한 받침이 있을 거다. 동료가 끼면 언제든 되돌리면 되고.\n옛 지도 조각이 없어도 괜찮아. 길은 샛길 하나뿐이니까.', N);
        return;
      }
      if (st === 1) {
        if (!flag('sq307_box')) { await say('샛길 끝의 기록함이다. 서쪽 돌담길 바위를 옮기면 길이 나와.', N); return; }
        set('sq307', 2);
        await say('기록함을 찾았구나! "길지기 초원도 — 옛 산길 샛길" ...할아버지 글씨야.\n이건 그 기록함 옆에 두려던 거다. 가져가.', N);
        await H.giveTM3('tm_slide', 2, N);
        await give('token', 1);
        H.stamp3('sq307', '오래된 돌의 자리: 서쪽 돌담길 운반석을 옮겨 옛 산길 샛길을 다시 열었다.');
        return;
      }
      await say('샛길이 열리니 아이들이 꽃 보러 간다더라. 바위도 이제야 제자리를 찾았구먼.', N);
    } }]);
  M.oldtrail = {
    name: '옛 산길 샛길', kind: 'out', bgm: 'route', rows: ROWS.oldtrail,
    links: { e: { to: 'westpath', dy: 3, from: 5, until: 5 } },
    signs: { '3,1': '옛 산길 샛길\n"산등 고개 옛길 — 지금은 끊김"' },
    objects: { '2,1': async () => {
      if (flag('sq307_box')) { await say('옛 창고 기록함이다. 걸어온 샛길이 지도에 더해졌다.'); return; }
      set('sq307_box'); sfx('item');
      await say('옛 창고 기록함을 열었다. "길지기 초원도 — 큰 바위 너머 샛길" 이라는 손글씨 지도가 들어 있다.\n직접 걸은 샛길을 지도에 옮겨 적었다.');
      if (num('sq307') === 1) await say('(바람나루 옛 창고의 창고지기에게 알리자)');
    } },
    items: [{ id: 'berry', n: 3, x: 15, y: 2, flag: 'ot_berry' }],
    npcs: [{ id: 'ot_mon', mon: 'sanbatgom', act: 'sniff', x: 10, y: 3, dir: 'left', text: '산받곰 한 마리가 옛길의 돌을 가지런히 고르고 있다.' }],
    drawExtra: (T, cx, cy) => { const X = 2 * 16 - cx, Y = 1 * 16 - cy; T.fillStyle = '#5e3a1a'; T.fillRect(X + 2, Y + 5, 12, 10); T.fillStyle = '#a8784a'; T.fillRect(X + 3, Y + 6, 10, 8); T.fillStyle = '#e3b23c'; T.fillRect(X + 7, Y + 8, 2, 3); },
    onEnter: async () => { visit('oldtrail'); }
  };
  M.oldtrail.blocks = [{ x: 2, y: 1 }];
  { const sw = G.CH1.nodes.find(n => n.id === 'stonewall'); if (sw && !sw.maps.includes('oldtrail')) sw.maps.push('oldtrail'); }

  // ------------------------------------------------------------ chapter 3 data for the notebook and the map
  const seen = (map, kind) => F().seenAt(map, kind);
  const K = k => F().seenKey(k);
  G.CH3 = {
    title: '3장 지도',
    nodes: [
      { id: 'r13', code: 'R13', n: '흰부표 해로', x: 40, y: 122, lx: 8, ly: 132, maps: ['r13'] },
      { id: 'm07', code: 'M07', n: '해무나루', town: 1, x: 86, y: 122, lx: 70, ly: 104, maps: ['m07', 'center_hm', 'shop_hm', 'rescue_hm', 'shell_hm', 'post_hm', 'house_hm'], show: ['m07'] },
      { id: 'd09', code: 'D09', n: '너울잠굴', x: 70, y: 156, lx: 22, ly: 162, maps: ['nw1', 'nw2', 'nw3'], show: ['nw1', 'nw2', 'nw3'] },
      { id: 'r14', code: 'R14', n: '바닷솔길', x: 116, y: 166, lx: 96, ly: 172, maps: ['r14'] },
      { id: 'm08', code: 'M08', n: '푸른숨시', town: 1, x: 166, y: 156, lx: 176, ly: 150, maps: ['m08', 'center_ps', 'shop_ps', 'guide_ps', 'freight_ps', 'house_ps1', 'house_ps2', 'ventroof', 'gym5'], show: ['m08'] },
      { id: 'd10', code: 'D10', n: '침전수로', x: 196, y: 178, lx: 204, ly: 172, maps: ['d10a', 'd10b'], show: ['d10a', 'd10b'] },
      { id: 'r15', code: 'R15', n: '굽이강', x: 86, y: 80, lx: 50, ly: 84, maps: ['r15'] },
      { id: 'h02', code: 'H02', n: '강굽이 쉼터', x: 100, y: 52, lx: 62, ly: 36, maps: ['h02'] },
      { id: 'r16', code: 'R16', n: '제방들길', x: 146, y: 56, lx: 126, ly: 64, maps: ['r16'] },
      { id: 'm09', code: 'M09', n: '돌바퀴시', town: 1, x: 196, y: 56, lx: 180, ly: 66, maps: ['m09', 'center_db', 'shop_db', 'union_db', 'archive_db', 'house_db1', 'house_db2', 'gym6'], show: ['m09'] },
      { id: 'd11', code: 'D11', n: '옛 배차소', x: 226, y: 86, lx: 196, ly: 96, maps: ['d11b', 'office_d11'], show: ['d11b'] },
      { id: 'r17', code: 'R17', n: '돌바퀴 언덕', x: 168, y: 30, lx: 120, ly: 22, maps: ['r17'] },
      { id: 'r18', code: 'R18', n: '높은물길 입구', x: 214, y: 28, lx: 186, ly: 36, maps: ['r18'] }],
    edges: [['r13', 'm07'], ['m07', 'd09'], ['d09', 'r14'], ['r13', 'r14'], ['r14', 'm08'], ['m08', 'd10'], ['m07', 'm08'], ['m07', 'r15'], ['r15', 'h02'], ['h02', 'r16'],
      ['r16', 'm09'], ['m09', 'd11'], ['m09', 'r17'], ['m09', 'r18'], ['m08', 'm09']],
    waters: [{ r: [0, 136, 150, 56], nodes: ['r13', 'm07', 'd09', 'r14'] }, { r: [82, 60, 8, 64], nodes: ['r15', 'm07'] }, { r: [150, 176, 106, 16], nodes: ['m08', 'd10'] }],
    // which regions each map item covers (MAP09-MAP12): public docks, towns and the big outline only
    scopes: {
      MAP09: ['r13', 'm07', 'r14'],
      MAP10: ['d09'],
      MAP11: ['m08', 'd10'],
      MAP12: ['r15', 'h02', 'r16', 'm09']
    },
    posts: [
      { id: 'p_hm', map: 'm07', x: 9, y: 21, n: '해무나루 해변 표식' },
      { id: 'p_r14', map: 'r14', x: 16, y: 9, n: '바닷솔 표식' },
      { id: 'p_ps', map: 'm08', x: 29, y: 23, n: '푸른숨 부두 표식' },
      { id: 'p_h02', map: 'h02', x: 9, y: 1, n: '강굽이 표식' },
      { id: 'p_r16', map: 'r16', x: 30, y: 6, n: '제방 표식' },
      { id: 'p_db', map: 'm09', x: 35, y: 24, n: '배차소 앞 표식' },
      { id: 'p_r17', map: 'r17', x: 14, y: 3, n: '언덕 표식' }],
    objectives() {
      const out = [];
      const q = (done, t, d, opt, at) => out.push(Object.assign({ done, t, d, opt }, at || {}));
      const vis = id => !!(G.S.visited || {})[id];
      q(flag('q24'), '흰 부표를 따라', '다음 해안 항로 남쪽, 흰 부표 사이 안전 항로를 따라 내려가자. 해무 섬 서쪽 해변 선착장에서 내려 해무나루 구조대장 가온에게 도착을 알리자.', 0,
        vis('m07') ? { node: 'm07', map: 'm07', x: 24, y: 14 } : vis('r13') ? { node: 'r13', map: 'r13', x: 17, y: 18 } : { node: 'r13' });
      if (flag('q24')) q(flag('q25'), '물결 아래 남은 길', flag('q25_start') ? '너울잠굴: 낙석은 바위깨기, 받침돌 두 개는 바위 밀기로 수로 홈에. 관측 수문 레버로 옛 부두 발판을 내리자.' : '구조대장 가온에게 옛 부두 조사를 맡겠다고 말하자. 동굴 안전도를 먼저 받는다.', 0,
        flag('q25_start') ? { node: 'd09', map: 'nw2', x: 22, y: 2 } : { node: 'm07', map: 'm07', x: 24, y: 14 });
      if (flag('q25')) q(flag('q26'), '쉬러 나온 동료들', '옛 부두를 건너 바닷솔길로 푸른숨시에. 정화사 은서와 이야기하고, 작업자 미르와 시민 아라의 이야기를 듣자.', 0, { node: 'm08', map: 'm08', x: 27, y: 10 });
      if (flag('q26')) q(flag('q27'), '맑은 흐름의 순서', '정화소 아래 침전수로: 취수 기록 대조 → 우회수로 밸브 → 교체 거름틀을 받침 홈에 → 휴식대 물길 밸브. 독 동료나 해독제는 필요 없다.', 0,
        !flag('q27_log') ? { node: 'd10', map: 'd10a', x: 5, y: 3 } : !flag('q27_filter') ? { node: 'd10', map: 'd10a', x: 28, y: 8 } : { node: 'd10', map: 'd10b', x: 14, y: 2 });
      if (flag('q27')) q(flag('badge5'), '푸른숨의 시험', '다시 문을 연 푸른숨 보건 체육관에서 관장 하진에게 도전하자. 독은 교체로 끊고, 막지느러미가 펴지면 다음 차례에 바람베기가 온다.', 0, { node: 'm08', map: 'm08', x: 6, y: 21 });
      if (flag('badge5')) q(flag('q29'), '거센 물에도 돌아오는 길', '정기선으로 해무나루에. 급류 강습장의 교관 여민에게 급류타기를 배우고, 물살 두 개를 건너 하선했다가 돌아오자.', 0, { node: 'm07', map: 'm07', x: 28, y: 8 });
      if (flag('q29')) q(flag('q30_start'), '강 위의 운송표', '푸른숨시 운송 접수소의 운송원 담소에게 굽이강 운송도를 받자.', 0, { node: 'm08', map: 'm08', x: 15, y: 20 });
      if (flag('q30_start')) q(flag('q30'), '움직이지 않는 작은 수문', flag('q30_brief') ? '강굽이 쉼터 점검로: 평형추 돌을 받침 홈에, 낙석을 깨고 북쪽 윈치를 돌려 낮은 운송 다리를 내리자.' : '해무나루 북쪽 강어귀에서 물판을 타고 굽이강을 거슬러, 첫 동쪽 하선점의 강굽이 쉼터에 운송표를 전하자.', 0,
        vis('h02') ? { node: 'h02', map: 'h02', x: 19, y: 3 } : { node: 'r15', map: 'm07', x: 17, y: 7 });
      if (flag('q30')) q(flag('q31_start'), '같은 부품, 다른 기록', '제방들길을 지나 돌바퀴시 운송조합의 조사원 시온을 만나자. 배차소 열람 허가를 먼저 받는다.', 0, { node: 'm09', map: 'm09', x: 13, y: 6 });
      if (flag('q31_start')) q(flag('q31'), '지워진 점검 날짜', '옛 배차소: 출하 장부·검사 도장(사무실), 교체 이력(선로 위 기록 화차), 현장 작업자 증언을 모두 대조하자.', 0, { node: 'd11', map: 'm09', x: 28, y: 22 });
      if (flag('q31')) q(flag('badge6'), '무게를 나누는 법', '돌바퀴 하중 체육관에서 저울을 수평으로 맞추고 관장 규호에게 도전하자. 괴력운반은 필요 없다.', 0, { node: 'm09', map: 'm09', x: 37, y: 7 });
      if (flag('badge6')) q(flag('q33'), '함께 옮기는 돌', '적재장의 도담에게 괴력운반을 배우고, 북쪽 선로 끝의 표식 운반석을 레일 받침에 옮기자.', 0, flag('q33_lesson') ? { node: 'm09', map: 'm09', x: 31, y: 3 } : { node: 'm09', map: 'm09', x: 14, y: 23 });
      if (flag('q33')) q(flag('ch3_end'), '높은물길 첫 전망대', '돌바퀴시 북쪽 높은물길 입구의 첫 안전 전망대로 가자. 조사원 시온이 기다린다.', 0, { node: 'r18', map: 'r18', x: 7, y: 10 });
      // optional threads (each keeps its own flags)
      if (flag('q24')) q(num('sq301') >= 4, '돌아오지 않은 부표 (선택)', '구조대장 가온의 부탁. 흰부표 해변 남쪽 바위 뒤 걸린 부표를 물 쪽에서 건져, 해변 쇠고리 두 곳에 다시 걸자.', 1, { node: 'r13' });
      if (flag('q24')) q(num('sq302') >= 2, '조개가 고른 모래 (선택)', '관찰원 보라의 부탁. 흰부표 해변 조개 군락 세 곳의 모래와 줄무늬를 기록하고 관찰소 수조와 비교하자. 물결돌 1개.', 1, { node: 'm07' });
      if (flag('q26')) q(num('sq303') >= 2, '쉬는 시간도 일 (선택)', '정화사 은서의 부탁. 휴식대의 진득이와 작업자 이야기를 듣고, 그늘막 자리를 정하자.', 1, { node: 'm08' });
      if (flag('q27')) q(num('sq304') >= 2, '바람이 멈춘 골목 (선택)', '환기 담당 리오의 부탁. 약한 바람표를 찾고, 통풍탑 옥상 데크의 덮개와 손잡이를 고치자.', 1, { node: 'm08' });
      if (flag('q29') && flag('q17')) q(num('sq305') >= 2, '강 건너 같은 표지 (선택)', '기억나루 관리인 해솔의 부탁. 나루 강의 급류를 건너 모래톱 표지의 문양을 보고 오자.', 1, { node: 'memory' });
      if (flag('q24')) q(num('sq306') >= 3, '도착했다는 짧은 편지 (선택)', num('sq306') === 2 ? '노을의 답장을 해무나루 우편 담당 누리에게. 도시간 화차가 열린 뒤 정기선으로 돌아가자.' : '해무나루 우편 담당 누리의 편지를 돌바퀴시 적재장의 노을에게 전하자.', 1, { node: num('sq306') === 2 ? 'm07' : 'm09' });
      if (flag('q33')) q(num('sq307') >= 2, '오래된 돌의 자리 (선택)', '바람나루 옛 창고지기 무진의 부탁. 서쪽 돌담길의 고리 문양 운반석을 옮기고 샛길의 기록함을 확인하자.', 1, { node: 'baram' });
      if (flag('q24')) q(num('sq308') >= 2, '잡지 않아도 남는 기록 (선택)', '낚시 안내원 마루의 부탁. 바다 관측 바위·해변 안내판·관찰소 수조의 설명을 읽자. 포획은 필요 없다.', 1, { node: 'r13' });
      return out;
    },
    target() {
      const g = this.objectives().find(o => !o.done && !o.opt);
      return g && g.node ? g : null;
    },
    revisits() {
      const fh = F().unlocked('haul') && !!G.S.bag.harness, fc = F().unlocked('current');
      const out = [];
      const r = (seen0, t, need, open, done, d, later) => { if (seen0 || done) out.push({ t, need, open, done, d, later }); };
      r(K('r16:17,5'), '제방 옛 창고', '괴력운반', fh, flag('r16_store'), '제방들길 옛 창고 입구를 고리 문양 운반석이 막고 있다. 안에 무언가 놓여 있다.', !F().unlocked('haul'));
      r(K('r16:37,9'), '제방 아래 강가 둔덕', '괴력운반', fh, flag('r16_bank'), '제방 아래 강가로 내려가는 샛길을 운반석이 막고 있다.', !F().unlocked('haul'));
      r(K('r17:27,3'), '돌바퀴 언덕 바위 틈', '괴력운반', fh, flag('r17_pocket'), '언덕 꼭대기 바위 틈을 운반석이 막고 있다. 안쪽에 반짝이는 것이 보인다.', !F().unlocked('haul'));
      r(seen('r15', 'falls'), '굽이강 폭포', '폭포 오르기 (다음 장)', false, false, '굽이강 머리의 폭포. 지금 배운 기술로는 거슬러 오를 수 없다.', 1);
      r(seen('r18', 'falls'), '높은물길 폭포', '폭포 오르기 (다음 장)', false, false, '높은물길 입구의 거대한 폭포. 그 너머가 새길상회 본부 쪽이다.', 1);
      r(flag('r15_seen'), '굽이강 폭포 아래 하선점', '급류타기', fc, flag('r15_top'), '급류 띠 두 개를 더 지나면 폭포 아래 마지막 하선점이 있다.');
      return out;
    }
  };
  // the chapter being played: its goals fill the notebook and its map page opens first
  Object.defineProperty(G, 'CH', { configurable: true,
    get: () => { const f = (G.S && G.S.flags) || {}; return f.ch2_end ? G.CH3 : f.ch1_end ? G.CH2 : G.CH1; },
    set: v => { G.CH1 = v; } });
})();
